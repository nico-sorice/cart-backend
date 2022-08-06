import expressValidator from 'express-validator';
import ValidationError from "../modules/ValidationError.js";

const checkErrorMiddleware = (req, res, next) => {
    const errors = expressValidator.validationResult(req);

    if(!errors.isEmpty()){
        next(new ValidationError('The given data is invalid', errors.array()));
    }

    next();
};

const validate = (callback) => {
    const userValidationMiddlewares = callback(expressValidator);

    return [
        ...userValidationMiddlewares,
        checkErrorMiddleware,
    ];
};

export default validate;