"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const readline_1 = __importDefault(require("readline"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// --force : efface la DB automatiquement, puis demande pour les migrations
const forceMode = process.argv.includes('--force') || process.argv.includes('--yes');
const dbName = process.env.DB_NAME || 'sigie_dev';
const dbUser = process.env.DB_USER || 'postgres';
const migrationsDir = path_1.default.join(__dirname, '../infra/migrations');
// ─── Utilitaires ────────────────────────────────────────────────────────────
function ask(question) {
    const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}
async function dropSchema(client) {
    console.log(`🗑️  Dropping all tables and resetting schema...`);
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query(`GRANT ALL ON SCHEMA public TO "${dbUser}";`);
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    console.log(`\n✅ [TEST TEARDOWN] Database "${dbName}" has been completely wiped (Schema dropped).\n`);
}
async function runMigrations(client) {
    console.log('\n📦 Réinstallation des migrations...\n');
    const files = fs_1.default.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
    let success = 0;
    for (const file of files) {
        process.stdout.write(`  → ${file}... `);
        const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), 'utf8');
        try {
            await client.query(sql);
            process.stdout.write('✅\n');
            success++;
        }
        catch (err) {
            process.stdout.write('❌\n');
            console.error(`  Erreur dans ${file}: ${err.message}\n`);
            throw err;
        }
    }
    console.log(`\n✅ ${success}/${files.length} migrations exécutées avec succès.`);
}
// ─── Point d'entrée ──────────────────────────────────────────────────────────
async function main() {
    const pool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: dbUser,
        password: process.env.DB_PASSWORD || 'postgres',
        database: dbName,
    });
    const client = await pool.connect();
    try {
        // ── Étape 1 : Connexion ─────────────────────────────────────────────────
        console.log(`\n [TEST TEARDOWN] Connecting to database: "${dbName}"...\n`);
        if (!forceMode) {
            // Mode interactif : demande avant d'effacer
            const confirmDrop = await ask(`⚠️  Voulez-vous EFFACER toute la base "${dbName}" ? (o/N) : `);
            if (confirmDrop !== 'o' && confirmDrop !== 'oui') {
                console.log('\n⏭️  Annulé.\n');
                return;
            }
        }
        // ── Étape 2 : Effacement automatique (toujours) ─────────────────────────
        await dropSchema(client);
        // ── Étape 3 : Demander pour les migrations (toujours) ───────────────────
        const confirmMigrate = await ask(`❓ Voulez-vous réinstaller/migrer la base de données après ce nettoyage complet ? (o/N) : `);
        if (confirmMigrate === 'o' || confirmMigrate === 'oui') {
            await runMigrations(client);
            console.log('\n🎉 Base de données prête.\n');
        }
        else {
            console.log('\n⏭️  Migrations ignorées. La base est vide.\n');
        }
    }
    catch (error) {
        console.error('\n❌ Erreur fatale :', error.message);
        process.exit(1);
    }
    finally {
        client.release();
        await pool.end();
    }
}
main();
//# sourceMappingURL=reset-db.js.map