export const configure = (options = {}) => {
    const {
        allowedOrigins = [],
        allowedMethods = [],
        allowedHeaders = [],
    } = options;

    const headerValues = {
        allowedOrigins: allowedOrigins ? allowedOrigins.join(', ').toLowerCase() : null,
        allowedMethods: allowedMethods ? allowedMethods.join(', ').toUpperCase() : null,
        allowedHeaders: allowedHeaders ? allowedHeaders.join(', ').toLowerCase() : null,
    };

    return (req, res, next) => {
        if(headerValues.allowedOrigins) res.setHeader('Access-Control-Allow-Origin', headerValues.allowedOrigins);
        if(headerValues.allowedMethods) res.setHeader('Access-Control-Allow-Methods', headerValues.allowedMethods);
        if(headerValues.allowedHeaders) res.setHeader('Access-Control-Allow-Headers', headerValues.allowedHeaders);

        if(req.method === 'OPTIONS'){
            res.status(200).send('OK');
        }else{
            next();
        }
    };
}

export const unrestricted = configure({
    allowedOrigins: ['*'],
    allowedMethods: ['*'],
    allowedHeaders: ['*'],
});