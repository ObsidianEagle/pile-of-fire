import { PLAYER_INIT_ACK } from './constants/messages.js';
import { GAME_ENDED, IN_PROGRESS, WAITING_FOR_PLAYERS } from './constants/statuses.js';

export const populateDeck = (numberOfDecks) => {
  const suits = ['HEARTS', 'SPADES', 'DIAMONDS', 'CLUBS'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const deck = [];
  for (let i = 0; i < numberOfDecks; i++) {
    suits.forEach((suit) => {
      values.forEach((value) => {
        deck.push({ suit, value });
      });
    });
  }

  return deck;
};

export const updateGameStatus = (gameState) => {
  if (!gameState.deck.length) {
    gameState.status = GAME_ENDED;
  } else if (gameState.players.length < 2) {
    gameState.status = WAITING_FOR_PLAYERS;
  } else {
    gameState.status = IN_PROGRESS;
  }
};

export const initialisePlayer = (playerInitRequest, gameState, ws) => {
  ws.name = playerInitRequest.name;
  gameState.players.push({
    name: ws.name,
    id: ws.id,
  });
  if (!gameState.nextPlayer) gameState.nextPlayer = ws.id;
  const playerInitAck = {
    type: PLAYER_INIT_ACK,
    payload: { id: ws.id, gameState },
  };
  updateGameStatus(gameState);
  ws.send(JSON.stringify(playerInitAck));
  console.log(`client ${ws.id}: player initiated with name ${ws.name}`);
};

export const drawCard = (gameState, ws, clients) => {
  if (ws.id !== gameState.nextPlayer) return;
  const card = gameState.deck.splice(Math.floor(Math.random() * gameState.deck.length), 1)[0];
  gameState.lastCardDrawn = card;
  switch (card.value) {
    case 'A':
      gameState.specialHolders['A'] = {
        player: ws.id,
        card,
      };
      break;
    case 'Q':
      gameState.specialHolders['Q'] = {
        player: ws.id,
        card,
      };
      break;
    case '5':
      gameState.specialHolders['5'] = {
        player: ws.id,
        card,
      };
      break;
    default:
      break;
  }
  gameState.lastPlayer = ws.id;
  gameState.nextPlayer =
    gameState.players[(gameState.players.findIndex((player) => player.id === ws.id) + 1) % gameState.players.length].id;
  updateGameStatus(gameState);
};

export const removePlayer = (gameState, ws, clients) => {
  if (ws.id === gameState.nextPlayer) {
    gameState.nextPlayer =
      gameState.players[
        (gameState.players.findIndex((player) => player.id === ws.id) + 1) % gameState.players.length
      ];
  }

  Object.keys(gameState.specialHolders).forEach((key) => {
    if (gameState.specialHolders[key] === ws.id) gameState.specialHolders[key] = null;
  });
  clients.splice(
    clients.findIndex((client) => client.id === ws.id),
    1
  );
  gameState.players.splice(
    gameState.players.findIndex((player) => player.id === ws.id),
    1
  );
  console.log(`client ${ws.id}: connection closed`);
}
