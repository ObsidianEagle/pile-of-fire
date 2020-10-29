import WebSocket from 'ws';
import { CHANGE_STATUS, DRAW_CARD, GAME_STATE, PLAYER_INIT, PLAYER_INIT_ACK } from './constants/messages.js';
import { GAME_ENDED_FROM_ERROR, WAITING_FOR_PLAYERS, IN_PROGRESS } from './constants/statuses.js';

const wss = new WebSocket.Server({ port: 8080 });
const clients = [];
let counter = 1;

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

export const updateGameStatus = () => {
  if (!gameState.deck.length) {
    gameState.status = GAME_ENDED;
  } else if (gameState.players.length < 2) {
    gameState.status = WAITING_FOR_PLAYERS;
  } else {
    gameState.status = IN_PROGRESS;
  }
};

const gameState = {
  deck: populateDeck(1),
  status: WAITING_FOR_PLAYERS,
  lastCardDrawn: null,
  lastPlayer: null,
  nextPlayer: null,
  players: [],
  mates: [],
  specialHolders: {
    A: null,
    Q: null,
    5: null,
  },
};

const broadcastGameState = () => {
  const msgObject = {
    type: GAME_STATE,
    payload: { gameState },
  };
  const msgString = JSON.stringify(msgObject);
  clients.forEach((client) => client.send(msgString));
  console.log('updated game state broadcast to all clients');
};

wss.on('connection', (ws) => {
  ws.id = counter++;
  clients.push(ws);

  ws.on('open', () => {
    console.log(`client ${ws.id}: connection opened`);
  });

  ws.on('message', (reqString) => {
    const req = JSON.parse(reqString);
    console.log(req);
    switch (req.type) {
      case PLAYER_INIT:
        ws.name = req.payload.name;
        gameState.players.push({
          name: ws.name,
          id: ws.id,
        });
        if (!gameState.nextPlayer) gameState.nextPlayer = ws.id;
        const res = {
          type: PLAYER_INIT_ACK,
          payload: { id: ws.id, gameState },
        };
        updateGameStatus();
        ws.send(JSON.stringify(res));
        console.log(`client ${ws.id}: player initiated with name ${ws.name}`);
        break;
      case CHANGE_STATUS:
        gameState.status = req.payload.status;
        console.log(`client ${ws.id}: game status changed to ${req.payload.status}`);
        broadcastGameState();
      case DRAW_CARD:
        if (ws.id !== gameState.nextPlayer) return;
        const card = gameState.deck.splice(Math.floor(Math.random() * gameState.deck.length), 1)[0];
        gameState.lastCardDrawn = card;
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
          default:
            break;
        }
        gameState.lastPlayer = ws.id;
        gameState.nextPlayer =
          gameState.players[
            (gameState.players.findIndex((player) => player.id === ws.id) + 1) % gameState.players.length
          ].id;
        updateGameStatus();
        broadcastGameState();
      default:
        break;
    }
  });

  ws.on('close', () => {
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
    broadcastGameState();
  });

  ws.on('error', (err) => {
    console.log(`client ${ws.id}: error: ${err.message}`);
  });
});

wss.on('error', () => {
  gameState.status = GAME_ENDED_FROM_ERROR;
  broadcastGameEnded('Server encountered an error');
});
