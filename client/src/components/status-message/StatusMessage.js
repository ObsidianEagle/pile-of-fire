import { Message } from 'semantic-ui-react';
import { WAITING_FOR_PLAYER, GAME_ENDED, GAME_ENDED_FROM_ERROR, WAITING_TO_START } from '../../constants/statuses';

const StatusMessage = ({ status, playerName, message }) => {
  let messageText = '';
  const messageType = {
    info: false,
    warning: false,
    positive: false,
    negative: false
  };
  switch (status) {
    case WAITING_FOR_PLAYER:
      messageText = `Waiting for ${playerName}...`;
      messageType.info = true;
      break;
    case GAME_ENDED:
      messageText = 'Game complete!';
      messageType.positive = true;
      break;
    case GAME_ENDED_FROM_ERROR:
      messageText = 'Game ended due to error';
      messageType.negative = true;
      break;
    case WAITING_TO_START:
      messageText = 'Waiting for host to start the game...';
      messageType.info = true;
      break;
    default:
      break;
  }

  if (!messageText.length && !message?.length) return null;
  if (message?.length) return <Message negative>{message}</Message>
  return <Message {...messageType}>{messageText}</Message>;
};

export default StatusMessage;
