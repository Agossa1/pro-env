import { appConfig } from '../app/appConfig';
import winston from 'winston'



const {combine, timestamp, json, colorize, printf} = winston.format;


const consoleFormat = printf(({level, message, timestamp, ...metadata})=>{
    let msg =`${timestamp} [${level}] : ${message}`;
    
    // Supprimer les informations sensibles en production
    if (appConfig.app.isProduction && metadata) {
        if (metadata.stack) delete metadata.stack;
        if (metadata.trace) delete metadata.trace;
    }
    
    if (Object.keys(metadata).length > 0) {
        // Ne pas afficher un objet vide si on a juste supprimé la stack
        const metadataStr = JSON.stringify(metadata);
        if (metadataStr !== '{}') {
            msg += ` ${metadataStr}`;
        }
    }
    return msg
})



export const logger = winston.createLogger({
    level:appConfig.app.isProduction ? 'info' : 'debug',
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        json()
    ),

    transports: [

        new winston.transports.File({
            filename:'logs/error.log',
            level:'error',
            silent: !appConfig.app.isProduction
        }),

        new winston.transports.File({
            filename:'logs/combined.log',
            silent: !appConfig.app.isProduction
        }),

        new winston.transports.Console({
            format:combine(
                colorize(),
                consoleFormat
            )
        })
    ]
})