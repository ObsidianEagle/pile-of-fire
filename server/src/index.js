import WebSocket from 'ws';
import { broadcastGameState } from './broadcast.js';
import { CHANGE_STATUS, DRAW_CARD, PLAYER_INIT } from './constants/messages.js';
import { GAME_ENDED_FROM_ERROR, WAITING_FOR_PLAYERS } from './constants/statuses.js';
import { drawCard, initialisePlayer, populateDeck, removePlayer } from './game.js';

const wss = new WebSocket.Server({ port: 8080 });
const clients = [];
let counter = 1;

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
        initialisePlayer(req.payload, gameState, ws);
        broadcastGameState(gameState, clients);
        break;
      case CHANGE_STATUS:
        gameState.status = req.payload.status;
        console.log(`client ${ws.id}: game status changed to ${req.payload.status}`);
        broadcastGameState(gameState, clients);
      case DRAW_CARD:
        drawCard(gameState, ws, clients);
        broadcastGameState(gameState, clients);
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    removePlayer(gameState, ws, clients);
    broadcastGameState(gameState, clients);
  });

  ws.on('error', (err) => {
    console.log(`client ${ws.id}: error: ${err.message}`);
  });
});

wss.on('error', () => {
  gameState.status = GAME_ENDED_FROM_ERROR;
  console.log('Server encountered an error');
});
