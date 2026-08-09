// TODO: Implémenter
import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
    // Vérifie si le client est déjà connecté ou en train de se connecter
    if (!client.isOpen) {
        try {
            await client.connect();
            console.log('✅ Connected to Redis');
        } catch (err) {
            console.error('❌ Redis Connection Failed', err);
        }
    }
};

connectRedis();

export default client;