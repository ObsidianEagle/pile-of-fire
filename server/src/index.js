import readline from 'readline';
import WebSocket from 'ws';
import { broadcastGameState } from './broadcast.js';
import { EXIT, HELP, REMOVE_PLAYER, SET_DECKS, SKIP, UPDATE } from './constants/commands.js';
import { CHANGE_STATUS, DRAW_CARD, PLAYER_CHOICE_RESPONSE, PLAYER_INIT } from './constants/messages.js';
import { GAME_ENDED_FROM_ERROR, IN_PROGRESS } from './constants/statuses.js';
import { addMates, changeRules, drawCard, initialisePlayer, populateDeck, removePlayer, skipTurn } from './game.js';

// GLOBALS
const PORT = process.argv.length > 2 ? process.argv[2] : 8080;
const wss = new WebSocket.Server({ port: PORT });
const clients = [];
let numberOfDecks = 1;
let counter = 1;

const gameState = {
  deck: populateDeck(numberOfDecks),
  status: IN_PROGRESS,
  lastCardDrawn: null,
  lastPlayer: null,
  nextPlayer: null,
  players: [],
  mates: [],
  rules: [],
  specialHolders: {
    A: null,
    Q: null,
    5: null,
  },
};

// WEBSOCKET LISTENERS
wss.on('connection', (ws) => {
  ws.id = counter++;
  clients.push(ws);

  ws.on('open', () => {
    console.debug(`client ${ws.id}: connection opened`);
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
        console.debug(`client ${ws.id}: game status changed to ${req.payload.status}`);
        broadcastGameState(gameState, clients);
      case DRAW_CARD:
        drawCard(gameState, ws);
        broadcastGameState(gameState, clients);
        break;
      case PLAYER_CHOICE_RESPONSE:
        if (gameState.lastPlayer !== ws.id) break;
        if (req.payload.mateId && gameState.lastCardDrawn.value === '8') {
          addMates(ws.id, req.payload.mateId, gameState);
          gameState.status = IN_PROGRESS;
        } else if (req.payload.rule && gameState.lastCardDrawn.value === 'J') {
          changeRules(req.payload.rule, gameState);
          gameState.status = IN_PROGRESS;
        }
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
    console.debug(`client ${ws.id}: error: ${err.message}`);
  });
});

wss.on('error', () => {
  gameState.status = GAME_ENDED_FROM_ERROR;
  console.debug('Server encountered an error');
});

// SERVER CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.info(`Server running on port ${wss.address().port}`);
console.info('Type `start` to begin the game');
console.info('Type `help` to see a list of commands.');

rl.on("line", input => {
  const inputSplit = input.split(' ');
  const command = inputSplit[0].toLowerCase();
  const parameter = input.split.length > 1 ? inputSplit[1] : null;
  switch (command) {
    case HELP:
      console.info('Available commands:');
      console.info('  `skip` - skip the current player\'s turn.');
      console.info('  `update` - broadcast the current game state to all players.');
      console.info('  `set-decks <number_of_decks>` - update the number of decks in play.');
      console.info('  `remove-player <player_id>` - remove a player from the game. [TODO - Not Yet Implemented]');
      console.info('  `exit` - close the server.');
      break;
    case SKIP:
      console.info(`Skipping the turn of player id ${gameState.nextPlayer}`);
      skipTurn(gameState);
      broadcastGameState(gameState, clients);
      console.info(`It is now the turn of player id ${gameState.nextPlayer}`);
      break;
    case EXIT:
      console.info('Closing server.');
      wss.close();
      process.exit(0);
    case UPDATE:
      broadcastGameState(gameState, clients);
      console.info('Broadcasted game state to all players');
      break;
    case SET_DECKS:
      if (!parameter || isNaN(parseInt(parameter))) {
        console.info('No valid selection given.');
      } else {
        numberOfDecks = parseInt(parameter);
      }
      break;
    case REMOVE_PLAYER:
      break;
    case '':
      break;
    default:
      console.info('Command not recognised.');
      break;
  }
});
