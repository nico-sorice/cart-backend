import {MongoClient} from 'mongodb';
import express from 'express';
import bodyParser from 'body-parser';
import ValidationError from './src/modules/ValidationError.js';
import AuthorizationError from './src/modules/AuthorizationError.js';
import AuthenticationError from "./src/modules/AuthenticationError.js";
import adminRoutes from './src/routes/admin/index.js';
import appRoutes from './src/routes/app/index.js';
import * as cors from './src/middleware/cors.js';
import config from "./config.js";

const app = express();

app.use(cors.unrestricted);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/admin', adminRoutes);
app.use('/app', appRoutes);

/* Default error handlers */
app.all('*', (req, res, next) => {
    res.status(404).json({message: 'Not found',});
});

app.use((err, req, res, next) => {
    if(err instanceof ValidationError) {
        return res.status(422).json({
            message: err.message,
            errors: err.errors,
        });
    }else if(err instanceof AuthenticationError){
        return res.status(401).json({
            message: "Error de autenticacion",
        });
    }else if(err instanceof AuthorizationError){
        return res.status(403).json({
            message: "Error de autorizacion",
        });
    }

    return res.status(500).json({
        message: '¡Ocurrio un error!',
        error: process.env.NODE_ENV === 'production' ? '-' : err.stack,
    });
});
/* Default error handlers */

const mongoClient = new MongoClient(config.db.mongo.connection);

console.log('--> Connecting to mongodb server');
mongoClient.connect()
    .then(() => {
        console.log('-->Connected to mongodb server');
        console.log('');
        console.log('--> Starting server');

        app.listen(config.server.listen_port, config.server.listen_host, () => {
            console.log(`*************************************************************`);
            console.log(`*   Server started successfully, listening on: ${config.server.listen_host}:${config.server.listen_port}`);
            console.log(`*************************************************************`);
        });
    }).catch(err => {
        console.log('--> Error while starting server', err);
        mongoClient.close();
        process.exit(1);
    });