import { GAME_STATE } from './constants/messages.js';
import { checkGameEnded } from './game.js';

export const broadcastGameState = (gameState, clients) => {
  checkGameEnded(gameState);
  const msgObject = {
    type: GAME_STATE,
    payload: { gameState },
  };
  const msgString = JSON.stringify(msgObject);
  clients.forEach((client) => client.send(msgString));
  console.debug('updated game state broadcast to all clients');
};
