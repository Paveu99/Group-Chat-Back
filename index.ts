import express, { json } from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(json());

const server = app.listen(3001, '0.0.0.0', () => {
    console.log('Listening on http://localhost:3001');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send a message to the client
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

    // Listen for messages from the client
    ws.on('message', (message) => {
        console.log('Got:', message.toString());
        // Echo the received message back to the client
        ws.send(message.toString());
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
