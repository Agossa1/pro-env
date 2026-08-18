"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = void 0;
const ws_1 = __importStar(require("ws"));
const logger_1 = require("../../config/loggers/logger");
const tokenManager_1 = require("../../config/tokens/tokenManager");
class WsService {
    constructor() {
        this.wss = null;
        this.clients = new Map();
        this.tokenManager = new tokenManager_1.TokenManager();
    }
    /**
     * Attach the WebSocket server to the existing HTTP server.
     * Call this once after app.listen().
     */
    init(server) {
        this.wss = new ws_1.WebSocketServer({ server });
        this.wss.on("connection", (ws, req) => {
            // 1. Tenter d'authentifier immédiatement via le cookie HttpOnly (Client Web)
            let isAuthenticated = false;
            const cookies = req.headers.cookie;
            if (cookies) {
                const match = cookies.match(/accessToken=([^;]+)/);
                if (match && match[1]) {
                    try {
                        const decoded = this.tokenManager.verifyAccessToken(match[1]);
                        ws.userId = decoded.id;
                        ws.roles = (decoded.roles || []).map(r => String(r));
                        if (!this.clients.has(decoded.id)) {
                            this.clients.set(decoded.id, new Set());
                        }
                        this.clients.get(decoded.id).add(ws);
                        isAuthenticated = true;
                        logger_1.logger.info(`[WS] User ${decoded.id} authenticated via HttpOnly cookie (roles: ${ws.roles.join(',')})`);
                        ws.send(JSON.stringify({ type: "AUTH_OK", userId: decoded.id }));
                    }
                    catch (e) {
                        logger_1.logger.warn("[WS] Invalid cookie token");
                    }
                }
            }
            // Timeout d'authentification : 10 secondes si pas authentifié par cookie
            let authTimeout = null;
            if (!isAuthenticated) {
                authTimeout = setTimeout(() => {
                    if (!ws.userId) {
                        logger_1.logger.warn("[WS] Connexion rejetée : pas d'authentification dans les 10s");
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
                            const decoded = this.tokenManager.verifyAccessToken(data.token);
                            ws.userId = decoded.id;
                            ws.roles = (decoded.roles || []).map(r => String(r));
                            if (!this.clients.has(decoded.id)) {
                                this.clients.set(decoded.id, new Set());
                            }
                            this.clients.get(decoded.id).add(ws);
                            if (authTimeout)
                                clearTimeout(authTimeout);
                            logger_1.logger.info(`[WS] User ${decoded.id} authenticated via token payload (roles: ${ws.roles.join(',')})`);
                            ws.send(JSON.stringify({ type: "AUTH_OK", userId: decoded.id }));
                        }
                        catch {
                            ws.send(JSON.stringify({ type: "AUTH_ERROR", message: "Token invalide ou expiré" }));
                        }
                    }
                }
                catch {
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
                    logger_1.logger.info(`[WS] User ${ws.userId} disconnected`);
                }
            });
            ws.on("error", (err) => {
                logger_1.logger.error("[WS] Socket error:", err);
            });
        });
        logger_1.logger.info("[WS] WebSocket server initialised on HTTP server");
    }
    /**
     * Send an event payload to a single user by their user ID.
     */
    notifyUser(userId, event, payload) {
        this.notifyUsers([userId], event, payload);
    }
    /**
     * Send an event payload to one or more users by their user IDs.
     */
    notifyUsers(userIds, event, payload) {
        const message = JSON.stringify({ type: event, data: payload });
        for (const userId of userIds) {
            const userSockets = this.clients.get(userId);
            if (!userSockets)
                continue;
            for (const client of userSockets) {
                if (client.readyState === ws_1.default.OPEN) {
                    client.send(message);
                }
            }
        }
    }
    /**
     * Broadcast an event to every connected client.
     */
    broadcast(event, payload) {
        if (!this.wss)
            return;
        const message = JSON.stringify({ type: event, data: payload });
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(message);
            }
        });
    }
    /**
     * Close all WebSocket connections and shut down the WebSocket server.
     * Called during graceful shutdown.
     */
    close() {
        if (!this.wss) {
            logger_1.logger.info("[WS] WebSocket server already closed or never initialised");
            return;
        }
        // Fermer toutes les connexions clientes
        for (const client of this.wss.clients) {
            try {
                client.close(1001, "Server shutting down");
            }
            catch (e) {
                logger_1.logger.error("[WS] Erreur fermeture client:", e);
            }
        }
        // Fermer le serveur WebSocket
        try {
            this.wss.close();
            logger_1.logger.info("[WS] WebSocket server closed");
        }
        catch (e) {
            logger_1.logger.error("[WS] Erreur fermeture serveur WebSocket:", e);
        }
        this.wss = null;
        this.clients.clear();
    }
}
exports.wsService = new WsService();
//# sourceMappingURL=webSocket.js.map