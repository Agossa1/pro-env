import type { WebSocket } from 'ws';

export interface AuthenticatedClient extends WebSocket {
    userId?: string;
    roles?: string[];
}
