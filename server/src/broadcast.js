import { GAME_STATE } from './constants/messages.js';

export const broadcastGameState = (gameState, clients) => {
  const msgObject = {
    type: GAME_STATE,
    payload: { gameState },
  };
  const msgString = JSON.stringify(msgObject);
  clients.forEach((client) => client.send(msgString));
  console.log('updated game state broadcast to all clients');
};
