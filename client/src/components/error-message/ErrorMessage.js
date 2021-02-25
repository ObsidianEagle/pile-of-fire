import { useState } from 'react';
import { Message } from 'semantic-ui-react';
import './ErrorMessage.scss';

const ErrorMessage = ({ header, content }) => {
  const [visible, setVisible] = useState(false);

  const handleDismiss = () => setVisible(false);

  if (!visible) return null;
  return (
    <Message header={header} content={content} onDismiss={handleDismiss} floating className="error-message" negative />
  );
};

export default ErrorMessage;
