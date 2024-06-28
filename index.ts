import express, { json } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(json());

const server = app.listen(3001, '0.0.0.0', () => {
    console.log('Listening on http://localhost:3001');
});

const wss = new WebSocketServer({ server });
const rooms = new Map<string, Set<WebSocket>>(); // Key: room name, Value: Set of clients

wss.on('connection', (ws: WebSocket) => {
    let currentRoom: string | null = null; // Explicitly define the type

    ws.on('message', (message: string) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'join') {
            const room = parsedMessage.room;
            if (!rooms.has(room)) {
                rooms.set(room, new Set());
            }
            rooms.get(room)!.add(ws);
            currentRoom = room;
            console.log(`Client joined room: ${room}`);
        } else if (parsedMessage.type === 'message' && currentRoom) {
            const roomClients = rooms.get(currentRoom);
            roomClients!.forEach((client: WebSocket) => {
                if (client !== ws && client.readyState === ws.OPEN) {
                    client.send(JSON.stringify({
                        type: 'message',
                        content: parsedMessage.content,
                        room: currentRoom
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        if (currentRoom) {
            rooms.get(currentRoom)!.delete(ws);
            if (rooms.get(currentRoom)!.size === 0) {
                rooms.delete(currentRoom);
            }
            console.log(`Client left room: ${currentRoom}`);
        }
    });
});
