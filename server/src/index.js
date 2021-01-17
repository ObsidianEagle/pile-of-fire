import {} from 'dotenv/config.js';
import fs from 'fs';
import https from 'https';
import readline from 'readline';
import WebSocket from 'ws';
import { EXIT, HELP, REMOVE_PLAYER, RESTART, SET_DECKS, SKIP, UPDATE } from './constants/commands.js';
import {
  CHANGE_STATUS,
  DRAW_CARD,
  PLAYER_CHOICE_RESPONSE,
  PLAYER_INIT,
  RESTART_GAME,
  ROOM_INIT
} from './constants/messages.js';
import { IN_PROGRESS } from './constants/statuses.js';
import { broadcastGameState, initialisePlayer, sendServerError } from './gameMessages.js';
import { createRoom } from './gameSetup.js';
import { addMates, changeRules, drawCard, removePlayer, restartGame, skipTurn } from './gameUpdates.js';

// SERVER
let PORT = 8080;
if (process.argv.length > 2) PORT = process.argv[2];
if (process.env.PORT) PORT = process.env.PORT;

const wssConfig = {};
let httpsServer;
if (process.env.USE_HTTPS_SERVER === 'true') {
  httpsServer = https.createServer({
    cert: fs.readFileSync('src/config/server.crt'),
    key: fs.readFileSync('src/config/server.key')
  });
  wssConfig.server = httpsServer;
} else {
  wssConfig.port = PORT;
}
const wss = new WebSocket.Server(wssConfig);

// GLOBALS
const clients = [];
let idCounter = 1;
const rooms = [];

// WEBSOCKET LISTENERS
wss.on('connection', (ws) => {
  ws.id = idCounter++;
  clients.push(ws);

  ws.on('open', () => {
    console.debug(`client ${ws.id}: connection opened`);
  });

  ws.on('message', (reqString) => {
    const req = JSON.parse(reqString);

    const room = rooms.find((room) => room.code === req.roomCode);
    if (req.type !== PLAYER_INIT && !room) {
      console.debug(`client ${ws.id}: message did not contain valid room code`);
      sendServerError('Message did not contain valid room code', [ws]);
      return;
    }
    const gameState = room ? room.gameState : undefined;

    switch (req.type) {
      case ROOM_INIT:
        createRoom(rooms, ws.id, req.payload.numberOfDecks);
        const room = rooms.find((room) => room.host === ws.id);
        console.debug(`client ${ws.id}: room created with code ${room.code}`);
        initialisePlayer(req.payload.name, room.code, rooms, ws);
        console.debug(`client ${ws.id}: player initialised in room ${room.code} with name ${ws.name}`);
        break;

      case PLAYER_INIT:
        const duplicateName = gameState.players.find((player) => player.name === req.payload.name);
        if (duplicateName) {
          console.debug(`client ${ws.id}: attempted to join with duplicate name ${req.payload.name}`);
          sendServerError(
            `Player with name "${req.payload.name}" has already joined - please choose a different name`,
            [ws]
          );
          break;
        }
        initialisePlayer(req.payload.name, req.payload.room, rooms, ws);
        console.debug(`client ${ws.id}: player initialised in room ${room.code} with name ${ws.name}`);
        broadcastGameState(gameState, clients);
        break;

      case CHANGE_STATUS:
        gameState.status = req.payload.status;
        console.debug(`client ${ws.id}: game status changed to ${req.payload.status}`);
        broadcastGameState(gameState, clients);
        break;

      case DRAW_CARD:
        drawCard(gameState, ws, clients);
        console.debug(`client ${ws.id}: drew card`);
        broadcastGameState(gameState, clients);
        break;

      case RESTART_GAME:
        restartGame(gameState, numberOfDecks);
        console.debug(`client ${ws.id}: restarted game`);
        broadcastGameState(gameState, clients);
        break;

      case PLAYER_CHOICE_RESPONSE:
        if (gameState.lastPlayer !== ws.id) break;
        if (req.payload.mateId && gameState.lastCardDrawn.value === '8') {
          addMates(ws.id, req.payload.mateId, gameState);
        } else if (req.payload.rule && gameState.lastCardDrawn.value === 'J') {
          changeRules(req.payload.rule, gameState);
        }
        gameState.status = IN_PROGRESS;
        console.debug(`client ${ws.id}: player choice received`);
        broadcastGameState(gameState, clients);
        break;

      default:
        break;
    }
  });

  ws.on('close', () => {
    const room = rooms.find((room) => room.gameState.players.includes(ws.id));
    const { gameState } = room;

    removePlayer(gameState, ws, clients);
    console.debug(`client ${ws.id}: connection closed, removed from game`);
    broadcastGameState(gameState, clients);

    if (!gameState.players.length) {
      rooms.splice(
        rooms.findIndex((i) => i === room),
        1
      );
      console.debug(`no players remaining, room removed`);
    }
  });

  ws.on('error', (err) => {
    console.debug(`client ${ws.id}: error: ${err.message}`);
  });
});

wss.on('error', (err) => {
  console.debug(`server encountered an error: ${err.name} - ${err.message}`);
});

// SERVER CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.info(`Server running on port ${PORT}`);
console.info('Type `start` to begin the game');
console.info('Type `help` to see a list of commands.');

rl.on('line', (input) => {
  const inputSplit = input.split(' ');
  const command = inputSplit[0].toLowerCase();
  const parameter = input.split.length > 1 ? inputSplit[1] : null;
  switch (command) {
    case HELP:
      console.info('Available commands:');
      console.info("  `skip` - skip the current player's turn.");
      console.info('  `update` - broadcast the current game state to all players.');
      console.info('  `restart` - restart the game.');
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

    case RESTART:
      restartGame(gameState, numberOfDecks);
      broadcastGameState(gameState, clients);
      console.info('Game restarted.');
      break;

    case SET_DECKS:
      if (!parameter || isNaN(parseInt(parameter))) {
        console.info('No valid selection given.');
      } else {
        numberOfDecks = parseInt(parameter);
      }
      break;

    case REMOVE_PLAYER:
      // TODO
      break;

    case '':
      break;

    default:
      console.info('Command not recognised.');
      break;
  }
});

// Heartbeat to prevent connections from going idle
setInterval(() => {
  if (clients.length) broadcastGameState(gameState, clients);
}, 20000);

if (httpsServer) {
  httpsServer.listen(PORT);
}
