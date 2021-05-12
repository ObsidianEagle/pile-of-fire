import {} from 'dotenv/config.js';
import fs from 'fs';
import https from 'https';
import WebSocket from 'ws';
import {
  CHANGE_STATUS,
  DRAW_CARD,
  PLAYER_CHOICE_RESPONSE,
  PLAYER_INIT,
  RESTART_GAME,
  ROOM_INIT,
  SKIP_TURN
} from './constants/messages.js';
import { IN_PROGRESS } from './constants/statuses.js';
import { broadcastRoomState, initialisePlayer, sendServerError } from './gameMessages.js';
import { createRoom } from './gameSetup.js';
import { addMates, changeRules, drawCard, removePlayer, restartGame, skipTurn } from './gameUpdates.js';
import cron from 'node-cron';

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

    const room = rooms.find((room) => (req.room ? room.code === req.room.toUpperCase() : null));
    if (![PLAYER_INIT, ROOM_INIT].includes(req.type) && !room) {
      console.debug(`client ${ws.id}: message did not contain valid room code`);
      sendServerError('Message did not contain valid room code', [ws]);
      return;
    }
    const gameState = room ? room.gameState : undefined;

    switch (req.type) {
      case ROOM_INIT: {
        createRoom(rooms, ws.id, req.payload.numberOfDecks, req.payload.endless);
        const room = rooms.find((room) => room.host === ws.id);
        console.debug(`client ${ws.id}: room created with code ${room.code}`);
        initialisePlayer(req.payload.name, room.code, rooms, ws);
        console.debug(`client ${ws.id}: player initialised in room ${room.code} with name ${ws.name}`);
        break;
      }

      case PLAYER_INIT: {
        const room = rooms.find((room) => room.code === req.payload.room.toUpperCase());
        if (!room) {
          console.debug(`client ${ws.id}: attempted to join invalid room ${req.payload.room}`);
          sendServerError(`A room with that code does not exist`, [ws]);
          break;
        }

        const duplicateName = room.gameState.players.find((player) => player.name === req.payload.name);
        if (duplicateName) {
          console.debug(`client ${ws.id}: attempted to join with duplicate name ${req.payload.name}`);
          sendServerError(
            `Player with name "${req.payload.name}" has already joined - please choose a different name`,
            [ws]
          );
          break;
        }

        initialisePlayer(req.payload.name, req.payload.room.toUpperCase(), rooms, ws);
        console.debug(`client ${ws.id}: player initialised in room ${room.code} with name ${ws.name}`);
        broadcastRoomState(room, clients);
        break;
      }

      case CHANGE_STATUS:
        gameState.status = req.payload.status;
        console.debug(`client ${ws.id}: game status changed to ${req.payload.status}`);
        broadcastRoomState(room, clients);
        break;

      case DRAW_CARD:
        drawCard(gameState, ws, clients);
        console.debug(`client ${ws.id}: drew card`);
        broadcastRoomState(room, clients);
        break;

      case SKIP_TURN:
        if (ws.id === room.host) {
          skipTurn(gameState);
          console.debug(`client ${ws.id}: host skipped current turn`);
          broadcastRoomState(room, clients);
        } else {
          console.debug(`client ${ws.id}: attempted to skip turn while not host`);
        }
        break;

      case RESTART_GAME:
        restartGame(gameState, 1);
        console.debug(`client ${ws.id}: restarted game`);
        broadcastRoomState(room, clients);
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
        broadcastRoomState(room, clients);
        break;

      default:
        break;
    }
  });

  ws.on('close', () => {
    const room = rooms.find((room) => room.gameState.players.map((player) => player.id).includes(ws.id));
    const gameState = room ? room.gameState : undefined;

    removePlayer(gameState, ws, clients);
    console.debug(`client ${ws.id}: connection closed, removed from game`);
    if (!gameState) return;
    broadcastRoomState(room, clients);

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

console.info(`Server running on port ${PORT}`);

// Heartbeat just in case for stale clients
setInterval(() => {
  if (clients.length) {
    rooms.forEach((room) => broadcastRoomState(room, clients));
  }
}, 20000);

// Clear room if no card drawn for 20 minutes
cron.schedule('*/10 * * * *', () => {
  console.debug('checking for dead rooms...');
  rooms.forEach((room) => {
    if (Math.abs(room.gameState.lastCardDrawnAt - Date.now()) > 1200000) {
      console.debug(`room ${room.code} has exceeded timeout - kicking players`);
      room.gameState.players.forEach((player) => {
        const client = clients.find((client) => client.id === player.id);
        if (client) client.close();
      });
    }
  });
  console.debug('dead room check complete');
});

if (httpsServer) {
  httpsServer.listen(PORT);
}
