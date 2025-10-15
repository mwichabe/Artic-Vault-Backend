export interface AIAnalyst {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray' | string; // Narrowing color for better type safety
  expertise: string;
  isTyping?: boolean;
  confidence?: number;
}

export interface AIConfigAnalyst {
    specialty: string;
    id: string;
    name: string;
    systemInstruction: string;
}

/**
 * Structure for a single message in the AI Forum debate.
 * (Used in state management and WebSocket communication)
 */
export interface Message {
  id: string;
  analystId: string;
  content: string;
  timestamp: Date;
  type: 'opinion' | 'debate' | 'conclusion';
}

// --- WebSocket Communication Types (Backend Specific) ---

/**
 * Base interface for all messages sent over the WebSocket.
 */
interface WebSocketBaseMessage {
  type: string; // e.g., 'typing_start', 'opinion', 'conclusion'
  debateId: string;
}

/**
 * Message sent when an analyst begins typing.
 */
export interface TypingStartMessage extends WebSocketBaseMessage {
  type: 'typing_start';
  analystId: string;
}

/**
 * Message sent when an analyst stops typing (optional, can be implied by 'opinion').
 */
export interface TypingEndMessage extends WebSocketBaseMessage {
  type: 'typing_end';
  analystId: string;
}

/**
 * Message sent when an analyst delivers a debate point.
 */
export interface OpinionMessage extends WebSocketBaseMessage, Message {
  type: 'opinion';
  // Inherits id, analystId, content, timestamp from Message
}

/**
 * Final message delivered to the client.
 */
export interface ConclusionMessage extends WebSocketBaseMessage {
  type: 'conclusion';
  content: string;
}

export type ServerWebSocketMessage = 
  TypingStartMessage | 
  TypingEndMessage | 
  OpinionMessage | 
  ConclusionMessage;

// --- Additional Data Structures (For completeness, though primarily used on frontend) ---

export interface Investment {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  marketCap: number;
  peRatio?: number;
  dividendYield?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: Date;
  impact: 'high' | 'medium' | 'low';
  aiSummary: string;
}

export interface ChatUser {
  id: string;
  name: string;
  title: string;
  location: string;
  status: 'connected' | 'pending' | 'request-sent';
  avatar?: string;
}