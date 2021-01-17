import { GAME_STATE, PLAYER_CHOICE_REQUEST, PLAYER_INIT_ACK } from './constants/messages.js';
import { WAITING_FOR_PLAYER } from './constants/statuses.js';

export const broadcastGameState = (gameState, clients) => {
  checkGameEnded(gameState);
  const msgObject = {
    type: GAME_STATE,
    payload: { gameState }
  };
  const msgString = JSON.stringify(msgObject);
  clients.forEach((client) => client.send(msgString));
  console.debug('updated game state broadcast to all clients');
};

export const initialisePlayer = (playerInitRequest, gameState, ws) => {
  ws.name = playerInitRequest.name;
  gameState.players.push({
    name: ws.name,
    id: ws.id
  });
  if (!gameState.nextPlayer) gameState.nextPlayer = ws.id;
  const playerInitAck = {
    type: PLAYER_INIT_ACK,
    payload: { id: ws.id, gameState }
  };
  ws.send(JSON.stringify(playerInitAck));
};

export const requestPlayerChoice = (gameState, ws) => {
  gameState.status = WAITING_FOR_PLAYER;
  const msgObject = {
    type: PLAYER_CHOICE_REQUEST,
    payload: {
      card: gameState.lastCardDrawn
    }
  };
  const msgString = JSON.stringify(msgObject);
  ws.send(msgString);
  console.debug(`client ${ws.id}: player choice request sent`);
};

export const sendServerError = (errorMessage, clients) => {
  const msgObject = {
    type: SERVER_ERROR,
    payload: {
      errorMessage
    }
  };
  const msgString = JSON.stringify(msgObject);
  clients.forEach((client) => client.send(msgString));
  console.debug(
    `server error with message ${errorMessage} sent to client(s) ${clients.map((client) => client.id).join()}`
  );
};
