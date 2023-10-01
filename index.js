const express = require('express');
const cors = require('cors');
const sequelize = require('./database/connection');
const EV = require('./src/environment');
require('dotenv').config();
const router_v1 = require('./src/v1/routers');
// const router_v2 = require('./src/v2/routers');
// const router_v3 = require('./src/v3/routers');
// const router = require('./src/universal/routers');
const logger = require('./src/logger/logger');
const { ENDPOINT_NOT_FOUND_ERR } = require('./src/middlewares/errors/errors');
const { errorHandler } = require('./src/middlewares/errors/errorMiddleware');
var cron = require('node-cron');
// const Sequelize=require('./database/connection');
const PORT = 6400;
const moment = require('moment');
// const { Server } = require("socket.io");
// const http = require("http");
// const {socketFunction}=require('./src/socket/server')
const app = express();

// const server = http.createServer(app);

// exports.io=new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

logger.stream = {
    write: (message, encoding) => {
        logger.http(message);
    }
}

app.use(require("morgan")("combined", { "stream": logger.stream }));

require("./database/connection");
const db = require('./src/v1/models');

app.use('/api/v1', router_v1);
// app.use('/api/v2', router_v2);
// app.use('/api/v3', router_v3);
// app.use('/api/', router);

app.get('/app_info', async (req, res) => {
    let db_status = await sequelize.query("select 1+1");
    let asia = moment().tz('Asia/Kolkata').format("YYYY-MM-DD HH:mm:ss");
    let utc = moment().utc().format("YYYY-MM-DD HH:mm:ss");
    console.log("===========>>");
    res.send({
        "project": EV.PROJECT_NAME,
        "Project enviroment": EV.PROJECT_ENVIROMENT,
        "db name": EV.DBNAME,
        "connection_status": db_status ? "Connected" : "Not connected",
        "asia": asia,
        "utc": utc
    })
});



//If api end point not found
app.use('*', (req, res, next) => {
    const error = {
        status: 404,
        message: ENDPOINT_NOT_FOUND_ERR
    };
    next(error);
});

// global error handling middleware
app.use(errorHandler);

// Event handler for a new socket connection
// this.io.on('connection',(socket)=>{
//     socketFunction(socket);
// } );

// var task = cron.schedule('* * * * *', async () => {
//     try {
//         console.log('running sheduleMessageSync');
        
//     } catch (error) {
//         console.log("error in sheduleMessageSync", error)
//     }

// });

main = async () => {
    try {
        await sequelize
            .authenticate()
            .then(() => {
                console.log('connection has been established successfully');
                // if(EV.NODE_ENV === 'development') {
                app.listen(PORT, () => {
                    console.log(`Server is running on port ${PORT}`);
                });
                // }
            })
            .catch(err => {
                console.log("Unable to connect to the database")
            })
    } catch (err) {
        process.exit(1);
    }
};
main();