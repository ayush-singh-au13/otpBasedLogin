const {transports, format, createLogger,config} = require('winston');
// const { combine,timestamp} = format;

 /**
 * Creating a new Winston logger.
*/
// creating user logger
const usersLogger = createLogger({
    transports: new transports.File({
        levels: config.syslog.levels,
        filename: 'logs/users.log',
        format: format.combine(
            format.colorize(),
            format.align(),
            format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            format.printf(info => `${[info.timestamp]} : ${info.level}: ${info.message}`)
        )
    }),
 transports:[
    new transports.File({filename: 'logs/users.log'})
 ],
 format:  format.printf(info => `${[info.timestamp]} : ${info.level}: ${info.message}`)
 });

 const exceptionsLogger = createLogger({
    exceptionHandlers: [new transports.File({filename:'logs/exceptions.log'})]
 });

 const errorLogger = createLogger({
    transports: new transports.File({
        filename: 'logs/server.log',
        format: format.combine(
            format.colorize(),
            format.align(),
            format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            format.printf(info => `${[info.timestamp]} : ${info.level}: ${info.message}`)
        )
    })
});


module.exports = {
    usersLogger: usersLogger,
    exceptionsLogger: exceptionsLogger,
    errorLogger: errorLogger
}

