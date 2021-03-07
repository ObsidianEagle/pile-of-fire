import { IN_PROGRESS } from './constants/statuses.js';

export const populateDeck = (numberOfDecks = 1) => {
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

export const generateRoomCode = (rooms) => {
  while (true) {
    const newCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    if (!rooms.find((room) => room.code === newCode)) return newCode;
  }
};

export const createNewGameState = (numberOfDecks, endless) => ({
  deck: populateDeck(endless ? 1 : numberOfDecks),
  status: IN_PROGRESS,
  lastCardDrawnAt: Date.now(),
  endless: endless || false,
  lastCardDrawn: null,
  lastPlayer: null,
  nextPlayer: null,
  players: [],
  mates: [],
  rules: [],
  specialHolders: {
    A: null,
    Q: null,
    5: null
  }
});

export const createRoom = (rooms, hostId, numberOfDecks, endless) => {
  const newRoom = {
    code: generateRoomCode(rooms),
    host: hostId,
    gameState: createNewGameState(numberOfDecks, endless)
  };
  rooms.push(newRoom);
};
