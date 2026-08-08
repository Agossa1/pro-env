import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

/**
 * Service gérant la sécurité des mots de passe.
 * Utilise bcryptjs pour le hachage asynchrone.
 */
export class PasswordService {
    private readonly SALT_ROUNDS = 12;
    private readonly MAX_PASSWORD_LENGTH = 128;

    /**
     * @param hasher - L'instance de bcrypt (permet de mock pour les tests unitaires)
     */
    constructor(
        private readonly hasher: typeof bcrypt = bcrypt,
        private readonly pepper: string = process.env.PASSWORD_PEPPER || ""
    ) {
        if (!this.pepper) {
            console.warn("⚠️  WARNING: PASSWORD_PEPPER is not set in environment variables. This reduces password security. Please set a strong pepper value.");
        }
    }

    /**
     * Génère un mot de passe aléatoire sécurisé.
     * Longueur 16, caractères mixtes, rejette les séquences de 2+ identiques consécutifs.
     */
    generateRandomPassword(): string {
        const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclut I, O pour lisibilité
        const lower = 'abcdefghjkmnpqrstuvwxyz';
        const digits = '23456789';
        const symbols = '!@#$%&*_-+';

        const getRandomChar = (source: string) => source[Math.floor(Math.random() * source.length)];

        let password = '';
        while (password.length < 16) {
            // Alterne les catégories pour garantir une bonne répartition
            const pickFrom = password.length % 4 === 0 ? upper
                : password.length % 4 === 1 ? lower
                : password.length % 4 === 2 ? digits
                : symbols;
            const ch = getRandomChar(pickFrom);
            // Évite les séquences de 2+ identiques consécutifs
            if (password.length > 0 && ch === password[password.length - 1]) {
                continue;
            }
            password += ch;
        }
        return password;
    }

    /**
     * Transforme un mot de passe en clair en hash sécurisé.
     */
    async hashPassword(password: string): Promise<string> {
        if (password.length > this.MAX_PASSWORD_LENGTH) {
            throw new Error(`Password exceeds maximum length of ${this.MAX_PASSWORD_LENGTH} characters.`);
        }

        const passwordWithPepper = password + this.pepper;
        return this.hasher.hash(passwordWithPepper, this.SALT_ROUNDS);
    }

    /**
     * Compare un mot de passe en clair avec un hash stocké.
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
        if (password.length > this.MAX_PASSWORD_LENGTH) {
            return false;
        }
        const passwordWithPepper = password + this.pepper;
        return this.hasher.compare(passwordWithPepper, hash);
    }
}

/**
 * Instance Singleton prête à l'emploi
 */
export const passwordServiceInstance = new PasswordService();