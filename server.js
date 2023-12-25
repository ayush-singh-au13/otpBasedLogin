const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const httpStatus = require('http-status');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const {errorLogger} = require('./src/utils/logger');
const fs = require('fs');
const path = require('path');
dotenv.config({path:'./.env'});
const PORT = process.env.PORT;



connectDB();
// handling cors 
app.use(cors({
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

// creating write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// Setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

if(process.env.NODE_ENV === 'development') {;

    app.use(morgan('dev'));
}

//health check
app.get('/',(req,res) => {
    errorLogger.info(`Health check for url -> ${req.originalUrl} - 200 || ${res.statusMessage} - ${req.method} - ${req.ip}`);
    res.send({status: httpStatus.OK, message:"Learning something new, good to go now !!"});
});

// route middleware
app.use('/app/v1/user', require('./src/routes/user.routes'));
app.use('/app/v1/account',require('./src/routes/account.routes'));

//handling api not found routes
// api not found !handle 404
app.use("*",function(req, res, next) {
    res.status(404);
    errorLogger.error(`404 || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    return res.status(404).json({
        status: 404,
        message: 'API NOT FOUND! Please check the endpoint and the HTTP request type! or contact at @Ayush ',
        data: {
          url: req.url
        } 
    })
})

// handling internal server error
app.use((req,res,next) => {
    errorLogger.error(`500 || ${res.statusMessage} - ${req.originalUrl}: ${req.method} - ${req.ip}`);
})

// CREATTING SERVER_REQUEST
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    // logger.info(`Sever has started and running on ${PORT} -port`);
});