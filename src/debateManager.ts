import { getAnalystOpinion } from './aiService';
import { WebSocket } from 'ws'; // Node.js WebSocket type
import { Message } from './types'; // Import Message type

// Central store for active debates and their connected clients
const activeConnections = new Map<string, WebSocket>();

/**
 * Registers a WebSocket connection for a specific debate.
 * @param debateId The ID of the debate the client is joining.
 * @param ws The WebSocket instance for the client.
 */
export function registerClient(debateId: string, ws: WebSocket) {
    activeConnections.set(debateId, ws);
    console.log(`Client registered for debate: ${debateId}`);

    // Remove the connection when the client disconnects
    ws.on('close', () => {
        activeConnections.delete(debateId);
        console.log(`Client disconnected from debate: ${debateId}`);
    });
}

/**
 * Runs the AI debate simulation asynchronously, sending real-time updates via WebSocket.
 * @param debateId The unique ID of the current debate session.
 * @param query The user's initial investment query.
 */
export async function startDebate(debateId: string, query: string) {
    const analystIds = ['macro', 'value', 'quant', 'global', 'tech', 'risk'];
    const opinions: Message[] = [];

    for (const analystId of analystIds) {
        const ws = activeConnections.get(debateId);

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.log(`Debate ${debateId} aborted: client disconnected.`);
            return;
        }

        // Notify client typing started
        ws.send(JSON.stringify({ type: 'typing_start', analystId, debateId }));

        try {
            const opinion = await getAnalystOpinion(analystId, query);
            opinions.push(opinion);

            // Send analyst opinion
            ws.send(JSON.stringify({ debateId, ...opinion }));

            // Notify typing ended
            ws.send(JSON.stringify({ type: 'typing_end', analystId, debateId }));

            // Short delay before next analyst
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Error fetching opinion for ${analystId}:`, error);
        }
    }

    // ✅ Send a simple "debate finished" message instead of dummy summary
    activeConnections.get(debateId)?.send(JSON.stringify({
        type: 'conclusion',
        content: `✅ Debate completed for "${query}". All analyst opinions have been shared.`,
        debateId
    }));

    // Cleanup
    activeConnections.get(debateId)?.close();
    activeConnections.delete(debateId);
}
