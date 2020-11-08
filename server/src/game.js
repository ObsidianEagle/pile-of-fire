import { GAME_STATE, PLAYER_CHOICE_REQUEST, PLAYER_INIT_ACK, TIMEOUT_WARNING } from './constants/messages.js';
import { GAME_ENDED, IN_PROGRESS, WAITING_FOR_PLAYER } from './constants/statuses.js';

const TIMEOUT_WARNING_TIME = 120000;
const TIMEOUT_TIME = 60000;

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

export const drawCard = (gameState, ws, clients) => {
  if (ws.id !== gameState.nextPlayer || !gameState.deck.length) return;

  clearPlayerTimeouts(ws);

  const card = gameState.deck.splice(Math.floor(Math.random() * gameState.deck.length), 1)[0];

  gameState.lastCardDrawn = card;
  gameState.lastPlayer = ws.id;
  gameState.nextPlayer =
    gameState.players[(gameState.players.findIndex((player) => player.id === ws.id) + 1) % gameState.players.length].id;
  beginTimeoutWarningTimer(
    clients.find((client) => client.id === gameState.nextPlayer),
    gameState,
    clients
  );

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
  // Remove from client list
  clients.splice(
    clients.findIndex((client) => client.id === ws.id),
    1
  );

  // Return if client was not in player list
  const isPlayer = gameState.players.find((player) => player.id === ws.id);
  if (!isPlayer) return;

  // If waiting for leaving player to take an action, move on
  if (gameState.status === WAITING_FOR_PLAYER && gameState.lastPlayer === ws.id) gameState.status = IN_PROGRESS;

  // If leaving player is next up, move on to player after
  if (ws.id === gameState.nextPlayer) {
    gameState.nextPlayer =
      gameState.players[
        (gameState.players.findIndex((player) => player.id === ws.id) + 1) % gameState.players.length
      ].id;
  }

  // Remove leaving player from mate pairings
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

  // Unassign any special held cards by leaving player
  Object.keys(gameState.specialHolders).forEach((key) => {
    if (gameState.specialHolders[key]?.player === ws.id) gameState.specialHolders[key] = null;
  });

  // Remove leaving player from player list
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
    gameState.mates.splice(
      gameState.mates.findIndex((pairing) => pairing === existingChooserPairing),
      1
    );
    gameState.mates.splice(
      gameState.mates.findIndex((pairing) => pairing === existingChosenPairing),
      1
    );
    gameState.mates.push(newPairing);
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

export const sendTimeoutWarning = (ws, gameState, clients) => {
  const msgObject = {
    type: TIMEOUT_WARNING,
    payload: {}
  };
  const msgString = JSON.stringify(msgObject);
  ws.send(msgString);
  beginTimeoutTimer(ws, gameState, clients);
  console.debug(`client ${ws.id}: timeout warning issued`);
};

export const beginTimeoutWarningTimer = (ws, gameState, clients) =>
  (ws.timeoutWarning = setTimeout(() => sendTimeoutWarning(ws, gameState, clients), TIMEOUT_WARNING_TIME));

export const beginTimeoutTimer = (ws, gameState, clients) =>
  (ws.timeout = setTimeout(() => {
    removePlayer(gameState, ws, clients);
    ws.close();
  }, TIMEOUT_TIME));

export const clearPlayerTimeouts = (ws) => {
  if (ws.timeout) clearTimeout(ws.timeout);
  if (ws.timeoutWarning) clearTimeout(ws.timeoutWarning);
};
