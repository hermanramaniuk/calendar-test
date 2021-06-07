import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
import './src/config/db';
import { config, createRoutes } from './src/config';

const app: express.Application = express();

createRoutes(app);

app.use(express.static('client/build'));

if (config.isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(config.port, () => console.log(`Server = ${config.port}`));
