const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const multer = require('multer');
const config = require(path.join(__dirname, 'config'));
const ValidationError = require(path.join(__dirname, 'src', 'modules', 'ValidationError'));
const AuthorizationError = require(path.join(__dirname, 'src', 'modules', 'AuthorizationError'));
const cors = require(path.join(__dirname, 'src', 'middleware', 'cors'));
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors.unrestricted);

app.use('/admin', require(path.join(__dirname, 'src', 'routes', 'admin')));
app.use('/app', require(path.join(__dirname, 'src', 'routes', 'app')));

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
    }else if(err instanceof AuthorizationError){
        return res.status(401).json({
            message: "Authorization error",
        });
    }

    return res.status(500).json({
        message: 'An error ocurred!',
        error: process.env.NODE_ENV === 'production' ? '-' : err.stack,
    });
});
/* Default error handlers */

mongoose.connect(config.db.mongo.connection, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(
        () => {
            console.log('--> Starting server');

            app.listen(config.server.listen_port, config.server.listen_host, () => {
                console.log(`*************************************************************`);
                console.log(`*   Server started successfully, listening on: ${config.server.listen_host}:${config.server.listen_port}`);
                console.log(`*************************************************************`);
            });
        },
        mongoErr => {
            console.log(`--> Error connecting to mongo at "${config.db.mongo.connection}"`, mongoErr);
        }
    )
    .catch(err => {
        console.log('--> Error while starting server', err);
        process.exit(1);
    });