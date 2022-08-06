const path = require('path');
const jwt = require('jsonwebtoken');
const config = require(path.join(__dirname, '..', '..', 'config'));
const AuthorizationError = require(path.join(__dirname, '..', 'modules', 'AuthorizationError'));

module.exports.required = (req, res, next) => {
    if(!req.auth.data){
        throw new AuthorizationError('User not logged in');
    }else{
        next();
    }
};

module.exports.handle = (req, res, next) => {
    const token = req.get('Authorization') ? req.get('Authorization').split(' ')[1] : null;
    let decodedToken;

    try{
        decodedToken = jwt.verify(token, config.jwt_secret);
    }catch(err){}

    if(decodedToken){
        req.auth = {
            data: decodedToken,
        };
    }else{
        req.auth = {
            data: null,
        };
    }

    next();
};