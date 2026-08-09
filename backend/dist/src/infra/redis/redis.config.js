"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Implémenter
const redis_1 = require("redis");
const client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});
client.on('error', (err) => console.error('Redis Client Error', err));
const connectRedis = async () => {
    // Vérifie si le client est déjà connecté ou en train de se connecter
    if (!client.isOpen) {
        try {
            await client.connect();
            console.log('✅ Connected to Redis');
        }
        catch (err) {
            console.error('❌ Redis Connection Failed', err);
        }
    }
};
connectRedis();
exports.default = client;
//# sourceMappingURL=redis.config.js.map