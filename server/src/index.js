import WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });
const clients = [];
let counter = 0;

wss.on('connection', ws => {
    ws.id = counter++;
    clients.push(ws);

    ws.on('open', () => {
        console.log(`client ${ws.id}: connection opened`);
    });

    ws.on('message', reqString => {
        const req = JSON.parse(reqString);
        console.log(req);
        switch (req.type) {
            case 'PLAYER_INIT':
                ws.name = req.payload.name;
                const res = {
                    type: 'PLAYER_INIT_ACK',
                    payload: { id: ws.id }
                };
                ws.send(JSON.stringify(res));
                console.log(`client ${ws.id}: player initiated with name ${ws.name}`);
                break;
            case 'MAKE_MOVE':
                const { suit, value } = req.payload;
                console.log(`client ${ws.id}: received move ${suit}${value}`);
            default:
                break;
        }
    });

    ws.on('close', () => {
        clients.splice(clients.findIndex(client => client.id === ws.id), 1);
        console.log(`client ${ws.id}: connection closed`);
    });

    ws.on('error', err => {
        console.log(`client ${ws.id}: error: ${err.message}`);
    });
});

wss.on('error', () => {
    const msgObject = { error: "Server encountered an error" };
    const msgString = JSON.stringify(msgObject);
    clients.forEach(client => client.send(msgString));
});
