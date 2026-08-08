import { appConfig } from '../app/appConfig';
import winston from 'winston'



const {combine, timestamp, json, colorize, printf} = winston.format;


const consoleFormat = printf(({level, message, timestamp, ...metadata})=>{
    let msg =`${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length>0) {
        msg += `${JSON.stringify(metadata)}`;
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