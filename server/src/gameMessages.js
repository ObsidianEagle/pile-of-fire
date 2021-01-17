import { ROOM_STATE, PLAYER_CHOICE_REQUEST, PLAYER_INIT_ACK, SERVER_ERROR } from './constants/messages.js';
import { WAITING_FOR_PLAYER } from './constants/statuses.js';
import { checkGameEnded } from './gameUpdates.js';

export const broadcastRoomState = (room, clients) => {
  checkGameEnded(room.gameState);
  const msgObject = {
    type: ROOM_STATE,
    payload: { room }
  };
  const msgString = JSON.stringify(msgObject);
  clients
    .filter((client) => room.gameState.players.map((player) => player.id).includes(client.id))
    .forEach((client) => client.send(msgString));
  console.debug('updated game state broadcast to all clients');
};

export const initialisePlayer = (name, roomCode, rooms, ws) => {
  ws.name = name;

  const room = rooms.find((room) => room.code === roomCode.toUpperCase());
  const { gameState } = room;

  gameState.players.push({
    name: ws.name,
    id: ws.id
  });
  if (!gameState.nextPlayer) gameState.nextPlayer = ws.id;
  const playerInitAck = {
    type: PLAYER_INIT_ACK,
    payload: { id: ws.id, room }
  };
  ws.send(JSON.stringify(playerInitAck));

  return true;
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
    `server error with message "${errorMessage}" sent to client(s) ${clients.map((client) => client.id).join()}`
  );
};
