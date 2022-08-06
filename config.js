import dotenv from 'dotenv';

dotenv.config({silent: true});

export default {
    jwt_secret: process.env.JWT_SECRET,
    server: {
        listen_port: process.env.PORT || process.env.SERVER_LISTEN_PORT || '3000',
        listen_host: process.env.SERVER_LISTEN_HOST || '127.0.0.1',
    },
    db: {
        mongo: {
            connection: process.env.DB_MONGO_CONNECTION || `mongodb+srv://${process.env.DB_MONGO_USER}:${process.env.DB_MONGO_PASSWORD}@${process.env.DB_MONGO_HOST}/${process.env.DB_MONGO_DATABASE}`
        }
    },
    //sentry_dsn: process.env.SENTRY_DSN,
}