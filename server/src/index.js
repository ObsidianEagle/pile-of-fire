import WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', msg => {
        console.log(`received: ${msg}`);
        ws.send(`received: ${msg}`);
    });
});
