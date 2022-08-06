const path = require('path');
const expressValidator = require('express-validator');
const ValidationError = require(path.join(__dirname, '..', 'modules', 'ValidationError'));

const checkErrorMiddleware = (req, res, next) => {
    const errors = expressValidator.validationResult(req);

    if(!errors.isEmpty()){
        next(new ValidationError('The given data is invalid', errors.array()));
    }

    next();
};

module.exports.validate = (callback) => {
    const userValidationMiddlewares = callback(expressValidator);

    return [
        ...userValidationMiddlewares,
        checkErrorMiddleware,
    ];
};