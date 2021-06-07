import { connect } from 'react-redux';
import { Modal } from 'antd';
import { VerifiedOutlined } from '@ant-design/icons';

interface IVerificationModalProps {
  verificationModal: boolean;
}

const VerificationModal: React.FC<IVerificationModalProps> = ({ verificationModal }) => {
  const styles = {
    margin: '0',
  };

  return (
    <Modal
      visible={verificationModal}
      centered={true}
      closable={false}
      maskClosable={false}
      title={<p style={styles}><VerifiedOutlined /> Registration success</p>}
      footer={[ <button key="cancel" className="pink-btn" onClick={() => window.location.reload()}>OK</button> ]}
    >
      <p style={styles}>Registration success!</p>
      <p style={styles}>Please login with your email and password.</p>
    </Modal>
  );
};

export default connect(
  (state: any) => ({ verificationModal: state.user.verificationModal }),
)(VerificationModal);
