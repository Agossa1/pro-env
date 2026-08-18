// TODO: Implémenter
import { Server as HttpServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { logger } from "../../config/loggers/logger";
import { TokenManager } from "../../config/tokens/tokenManager";
import type { TokenPayload } from "../../modules/auth/types/auth.types";
import type {AuthenticatedClient} from "../../infra/sockets/ws.types";


class WsService {
    private wss: WebSocketServer | null = null;
    private clients: Map<string, Set<AuthenticatedClient>> = new Map();
    private tokenManager = new TokenManager();

    /**
     * Attach the WebSocket server to the existing HTTP server.
     * Call this once after app.listen().
     */
    init(server: HttpServer): void {
        this.wss = new WebSocketServer({ server });

        this.wss.on("connection", (ws: AuthenticatedClient, req) => {
            // 1. Tenter d'authentifier immédiatement via le cookie HttpOnly (Client Web)
            let isAuthenticated = false;
            const cookies = req.headers.cookie;
            if (cookies) {
                const match = cookies.match(/accessToken=([^;]+)/);
                if (match && match[1]) {
                    try {
                        const decoded = this.tokenManager.verifyAccessToken(match[1]) as TokenPayload;
                        ws.userId = decoded.id;
                        ws.roles = (decoded.roles || []).map(r => String(r));
                        if (!this.clients.has(decoded.id)) {
                            this.clients.set(decoded.id, new Set());
                        }
                        this.clients.get(decoded.id)!.add(ws);
                        isAuthenticated = true;
                        logger.info(`[WS] User ${decoded.id} authenticated via HttpOnly cookie (roles: ${ws.roles.join(',')})`);
                        ws.send(JSON.stringify({ type: "AUTH_OK", userId: decoded.id }));
                    } catch (e) {
                        logger.warn("[WS] Invalid cookie token");
                    }
                }
            }

            // Timeout d'authentification : 10 secondes si pas authentifié par cookie
            let authTimeout: NodeJS.Timeout | null = null;
            if (!isAuthenticated) {
                authTimeout = setTimeout(() => {
                    if (!ws.userId) {
                        logger.warn("[WS] Connexion rejetée : pas d'authentification dans les 10s");
                        ws.close(4001, "Authentification requise");
                    }
                }, 10000);
            }

            ws.on("message", (raw) => {
                try {
                    const data = JSON.parse(raw.toString());

                    // 🔐 Authentification JWT explicite (pour les clients mobiles sans cookies)
                    // Le client web envoie { type: 'AUTH', userId } ce qui sera ignoré ici si sans token, mais il est déjà authentifié par cookie.
                    if (data.type === "AUTH" && data.token) {
                        try {
                            const decoded = this.tokenManager.verifyAccessToken(data.token) as TokenPayload;
                            ws.userId = decoded.id;
                            ws.roles = (decoded.roles || []).map(r => String(r));

                            if (!this.clients.has(decoded.id)) {
                                this.clients.set(decoded.id, new Set());
                            }
                            this.clients.get(decoded.id)!.add(ws);

                            if (authTimeout) clearTimeout(authTimeout);
                            logger.info(`[WS] User ${decoded.id} authenticated via token payload (roles: ${ws.roles.join(',')})`);
                            ws.send(JSON.stringify({ type: "AUTH_OK", userId: decoded.id }));
                        } catch {
                            ws.send(JSON.stringify({ type: "AUTH_ERROR", message: "Token invalide ou expiré" }));
                        }
                    }
                } catch {
                    // Ignore non-JSON frames
                }
            });

            ws.on("close", () => {
                if (ws.userId) {
                    const userSockets = this.clients.get(ws.userId);
                    if (userSockets) {
                        userSockets.delete(ws);
                        if (userSockets.size === 0) {
                            this.clients.delete(ws.userId);
                        }
                    }
                    logger.info(`[WS] User ${ws.userId} disconnected`);
                }
            });

            ws.on("error", (err) => {
                logger.error("[WS] Socket error:", err);
            });
        });

        logger.info("[WS] WebSocket server initialised on HTTP server");
    }

    /**
     * Send an event payload to a single user by their user ID.
     */
    notifyUser(userId: string, event: string, payload: unknown): void {
        this.notifyUsers([userId], event, payload);
    }

    /**
     * Send an event payload to one or more users by their user IDs.
     */
    notifyUsers(userIds: string[], event: string, payload: unknown): void {
        const message = JSON.stringify({ type: event, data: payload });

        for (const userId of userIds) {
            const userSockets = this.clients.get(userId);
            if (!userSockets) continue;

            for (const client of userSockets) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            }
        }
    }

    /**
     * Broadcast an event to every connected client.
     */
    broadcast(event: string, payload: unknown): void {
        if (!this.wss) return;
        const message = JSON.stringify({ type: event, data: payload });

        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    /**
     * Close all WebSocket connections and shut down the WebSocket server.
     * Called during graceful shutdown.
     */
    close(): void {
        if (!this.wss) {
            logger.info("[WS] WebSocket server already closed or never initialised");
            return;
        }

        // Fermer toutes les connexions clientes
        for (const client of this.wss.clients) {
            try {
                client.close(1001, "Server shutting down");
            } catch (e) {
                logger.error("[WS] Erreur fermeture client:", e);
            }
        }

        // Fermer le serveur WebSocket
        try {
            this.wss.close();
            logger.info("[WS] WebSocket server closed");
        } catch (e) {
            logger.error("[WS] Erreur fermeture serveur WebSocket:", e);
        }

        this.wss = null;
        this.clients.clear();
    }
}

export const wsService = new WsService();