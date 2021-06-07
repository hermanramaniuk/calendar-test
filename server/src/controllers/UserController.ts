import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import { createJWT, sendEmail } from '../config';
import User from '../models/User';
import Task from '../models/Task';

class UserController {
  static async signup(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { fullName, email, password } = req.body;
      const user: any = await User.findOne({ email });

      if (user) {
        if (user.googleId === 'signed in without Google' || user.facebookUserID === 'signed in without Facebook') {
          return res.status(400).json({ msg: 'This Email already exists' });
        }

        if (user.googleId !== 'signed in without Google' && user.googleId !== '') {
          return res.status(400).json({ msg: 'This Email already signed in with Google' });
        }

        if (user.facebookUserID !== 'signed in without Facebook' && user.facebookUserID !== '') {
          return res.status(400).json({ msg: 'This Email already signed in with Facebook' });
        }
      }

      const hashedPassword: string = await bcrypt.hash(password, 10);
      const emailToken: string = crypto.randomBytes(64).toString('hex');
      const newUser = new User({
        fullName,
        email,
        emailToken,
        googleId: 'signed in without Google',
        facebookUserID: 'signed in without Facebook',
        password: hashedPassword,
        isVerified: true,
        picture: '',
      });

      await newUser.save();

      res.status(201).json({ msg: 'Successful registration' });
    } catch {
      res.status(500).json({ msg: 'Error on creating user' });
    }
  }

  static async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user: any = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Incorrect Password or Email' });
      }

      if (user.facebookUserID !== 'signed in without Facebook' && user.facebookUserID !== '') {
        return res.status(400).json({ msg: 'This Email already signed in with Facebook' });
      }

      if (user.googleId !== 'signed in without Google' && user.googleId !== '') {
        return res.status(400).json({ msg: 'This Email already signed in with Google' });
      }

      const isMatch: boolean = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Incorrect Password or Email' });
      }

      if (!user.isVerified) {
        return res.status(400).json({ msg: 'Account need verification. Check spam if not received' });
      }

      res.json(createJWT(user._id));
    } catch {
      res.status(500).json({ msg: 'Error on login' });
    }
  }

  static async me(req, res) {
    try {
      const user = await User.findById(req.userId);
      res.json(user);
    } catch {
      res.status(401).json({ msg: 'Error in geting user' });
    }
  }

  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user: any = await User.findOne({ _id: req.userId });
      const isMatch: boolean = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Wrong old Password' });
      }

      await User.findByIdAndUpdate(
        { _id: req.userId },
        { $set: { password: await bcrypt.hash(newPassword, 10) } },
        { new: true },
      );

      res.json({ msg: 'Password is successfully changed' });
    } catch {
      res.status(500).json({ msg: 'Failed on Password changing' });
    }
  }
}

export default UserController;
