import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import * as url from 'url';
import { startDebate, registerClient } from './debateManager';

const app = express();
app.use(bodyParser.json());
const PORT = 3000;

// CORS setup (required for frontend communication)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// --- REST API ROUTE (Initiation) ---
app.post('/api/debate', (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).send({ error: 'Query is required.' });
    }

    const debateId = uuidv4();
    
    // Store the initial query for when the client connects
    // (A simple in-memory store for demo)
    // NOTE: Type assertion `as any` used for demo purposes to dynamically add a property to the app instance.
    (app as any).pendingDebates[debateId] = { query, status: 'initiated' }; 
    
    // Respond immediately with the ID
    res.status(202).send({ debateId }); 
});

// --- WebSocket Setup ---
const server = http.createServer(app);
// Using the corrected import for WebSocketServer
const wss = new WebSocketServer({ server, path: '/ws/debate' });

// Simple in-memory storage for pending debates (for demo)
(app as any).pendingDebates = {};

wss.on('connection', (ws, req) => {
    // Extract debateId from query parameters: /ws/debate?id=...
    const urlParts = url.parse(req.url || '', true);
    const debateId = urlParts.query.id as string;
    
    const pending = (app as any).pendingDebates[debateId];

    if (!debateId || !pending) {
        ws.close(1008, 'Invalid or expired debate ID.');
        return;
    }
    
    const { query } = pending;
    
    // 1. Register the client for real-time communication
    registerClient(debateId, ws);
    
    // 2. Start the asynchronous debate process
    startDebate(debateId, query);
    
    // 3. Remove from pending list
    delete (app as any).pendingDebates[debateId];
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`WebSocket server listening on ws://localhost:${PORT}/ws/debate`);
});