import log4js from 'log4js';

log4js.configure({
    appenders: {
        app: { type: 'file', filename: 'application.log' }
    },
    categories: {
        default: { appenders: ['app'], level: 'info' }
    }
})

export const logger = log4js.getLogger();