import { PLAYER_CHOICE_REQUEST, PLAYER_INIT_ACK } from './constants/messages.js';
import { GAME_ENDED, WAITING_FOR_PLAYER, IN_PROGRESS } from './constants/statuses.js';

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

export const checkGameEnded = (gameState) => {
  if (!gameState.deck.length) gameState.status = GAME_ENDED;
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

export const drawCard = (gameState, ws) => {
  if (ws.id !== gameState.nextPlayer || !gameState.deck.length) return;

  const card = gameState.deck.splice(Math.floor(Math.random() * gameState.deck.length), 1)[0];

  gameState.lastCardDrawn = card;
  gameState.lastPlayer = ws.id;
  gameState.nextPlayer =
    gameState.players[(gameState.players.findIndex((player) => player.id === ws.id) + 1) % gameState.players.length].id;

  switch (card.value) {
    case 'A':
      gameState.specialHolders['A'] = {
        player: ws.id,
        card
      };
      break;
    case 'Q':
      gameState.specialHolders['Q'] = {
        player: ws.id,
        card
      };
      break;
    case '5':
      gameState.specialHolders['5'] = {
        player: ws.id,
        card
      };
      break;
    case '8':
      requestPlayerChoice(gameState, ws);
      break;
    case 'J':
      requestPlayerChoice(gameState, ws);
      break;
    default:
      break;
  }
};

export const removePlayer = (gameState, ws, clients) => {
  clients.splice(
    clients.findIndex((client) => client.id === ws.id),
    1
  );

  const isPlayer = gameState.players.find((player) => player.id === ws.id);
  if (!isPlayer) return;

  if (ws.id === gameState.nextPlayer) {
    gameState.nextPlayer =
      gameState.players[(gameState.players.findIndex((player) => player.id === ws.id) + 1) % gameState.players.length];
  }

  const matePairingIndex = gameState.mates.findIndex((pairing) => pairing.includes(ws.id));
  if (matePairingIndex >= 0) {
    if (gameState.mates[matePairingIndex].length === 2) {
      gameState.mates.splice(matePairingIndex, 1);
    } else {
      gameState.mates[matePairingIndex].splice(
        gameState.mates[matePairingIndex].findIndex((id) => id === ws.id),
        1
      );
    }
  }

  Object.keys(gameState.specialHolders).forEach((key) => {
    if (gameState.specialHolders[key] === ws.id) gameState.specialHolders[key] = null;
  });
  gameState.players.splice(
    gameState.players.findIndex((player) => player.id === ws.id),
    1
  );
};

export const skipTurn = (gameState) => {
  gameState.nextPlayer =
    gameState.players[(gameState.players.findIndex((player) => player.id === ws.id) + 1) % gameState.players.length].id;
};

export const addMates = (chooserId, chosenId, gameState) => {
  if (gameState.mates.reduce((acc, val) => acc.concat(val), []).length === gameState.players.length)
    gameState.mates = [];

  const existingChooserPairing = gameState.mates.find((pairing) => pairing.includes(chooserId));
  const existingChosenPairing = gameState.mates.find((pairing) => pairing.includes(chosenId));
  if (existingChooserPairing && existingChosenPairing) {
    const newPairing = [...existingChooserPairing, ...existingChosenPairing];
    const newMates = gameState.mates.filter(
      (pairing) => pairing !== existingChooserPairing || pairing !== existingChosenPairing
    );
    newMates.push(newPairing);
    gameState.mates = newMates;
    return;
  } else if (existingChooserPairing) {
    existingChooserPairing.push(chosenId);
    return;
  } else if (existingChosenPairing) {
    existingChosenPairing.push(chooserId);
    return;
  } else {
    gameState.mates.push([chooserId, chosenId]);
  }
};

export const changeRules = (chosenRule, gameState) => {
  const ruleInListIndex = gameState.rules.findIndex((rule) => rule === chosenRule);
  if (ruleInListIndex >= 0) {
    gameState.rules.splice(ruleInListIndex, 1);
  } else {
    gameState.rules.push(chosenRule);
  }
};

export const restartGame = (gameState, numberOfDecks) => {
  gameState.deck = populateDeck(numberOfDecks);
  gameState.status = IN_PROGRESS;
  gameState.lastCardDrawn = null;
  gameState.lastPlayer = null;
  gameState.nextPlayer = gameState.players.length > 0 ? gameState.players[0].id : null;
  gameState.mates.splice(0, gameState.mates.length);
  gameState.rules.splice(0, gameState.rules.length);
  gameState.specialHolders = {
    A: null,
    Q: null,
    5: null
  };
};
