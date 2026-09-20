"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    // Les commandes ne doivent JAMAIS bloquer une requête HTTP : si Redis est
    // indisponible, elles échouent immédiatement et le cache est contourné
    // (sinon chaque requête metier attend la fin des tentatives de reconnexion).
    disableOfflineQueue: true,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 3) {
                // Stop retrying after 3 attempts — run without cache
                return false;
            }
            return Math.min(retries * 500, 3000);
        },
        connectTimeout: 3000,
    },
});
client.on('error', (err) => {
    // Suppress common expected errors when Redis is not available
    const msg = err?.message ?? '';
    if (msg.includes('ECONNREFUSED') ||
        msg.includes('Socket closed') ||
        msg.includes('Connection refused') ||
        msg.includes('AbortError') ||
        msg.includes('client is closed') ||
        msg.includes('ClientOfflineError') ||
        msg.includes('The client is closed')) {
        return;
    }
    console.warn('⚠️ Redis warning:', msg);
});
client.on('connect', () => console.log('✅ Connected to Redis'));
client.on('end', () => console.log('⚠️ Redis disconnected, running without cache'));
const connectRedis = async () => {
    if (!client.isOpen) {
        try {
            await client.connect();
        }
        catch (err) {
            console.warn('⚠️ Redis unavailable, running without cache:', err?.message);
        }
    }
};
connectRedis();
exports.default = client;
//# sourceMappingURL=redis.config.js.map