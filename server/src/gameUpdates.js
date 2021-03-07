import { GAME_ENDED, IN_PROGRESS, WAITING_FOR_PLAYER } from './constants/statuses.js';
import { requestPlayerChoice } from './gameMessages.js';
import { populateDeck } from './gameSetup.js';

export const handleEmptyDeck = (gameState) => {
  if (!gameState.deck.length) {
    if (gameState.endless) {
      gameState.deck = populateDeck(1);
    } else {
      gameState.status = GAME_ENDED;
    }
  }
};

export const drawCard = (gameState, ws) => {
  if (ws.id !== gameState.nextPlayer || !gameState.deck.length) return;

  const card = gameState.deck.splice(Math.floor(Math.random() * gameState.deck.length), 1)[0];

  gameState.lastCardDrawnAt = Date.now();
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
  // Remove from client list
  clients.splice(
    clients.findIndex((client) => client.id === ws.id),
    1
  );

  // Return if client was not in player list
  const isPlayer = gameState ? gameState.players.find((player) => player.id === ws.id) : false;
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
    if (gameState.specialHolders[key] && gameState.specialHolders[key].player === ws.id)
      gameState.specialHolders[key] = null;
  });

  // Remove leaving player from player list
  gameState.players.splice(
    gameState.players.findIndex((player) => player.id === ws.id),
    1
  );
};

export const skipTurn = (gameState) => {
  gameState.nextPlayer =
    gameState.players[
      (gameState.players.findIndex((player) => player.id === gameState.nextPlayer) + 1) % gameState.players.length
    ].id;
};

export const addMates = (chooserId, chosenId, gameState) => {
  if (
    gameState.mates.reduce((acc, cur) => acc + cur.length, 0) >= gameState.players.length - 1 &&
    gameState.mates.length <= 2
  )
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

export const changeRules = (rule, gameState) => {
  const ruleInListIndex = typeof rule === 'number' ? gameState.rules.findIndex((item) => item.id === rule) : -1;
  if (ruleInListIndex >= 0) {
    gameState.rules.splice(ruleInListIndex, 1);
  } else {
    gameState.rules.push({
      id: Date.now(),
      rule
    });
  }
};

export const restartGame = (gameState, numberOfDecks) => {
  gameState.deck = populateDeck(numberOfDecks);
  gameState.status = IN_PROGRESS;
  gameState.lastCardDrawnAt = Date.now();
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
