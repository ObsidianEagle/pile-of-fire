import { useEffect, useState } from 'react';
import { Message } from 'semantic-ui-react';
import eventBus from '../../utils/eventBus';
import './ErrorMessage.scss';

const ErrorMessage = () => {
  const [visible, setVisible] = useState(false);
  const [header, setHeader] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    eventBus.addListener('flash', ({ header, content }) => {
      setVisible(true);
      setHeader(header);
      setContent(content);
      setTimeout(() => setVisible(false), 5000);
    });

    return () => eventBus.removeAllListeners('flash');
  }, []);

  const handleDismiss = () => setVisible(false);

  if (!visible) return null;
  return (
    <Message header={header} content={content} onDismiss={handleDismiss} floating className="error-message" negative />
  );
};

export default ErrorMessage;
