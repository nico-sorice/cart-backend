import jwt from 'jsonwebtoken';
import AuthorizationError from "../modules/AuthorizationError.js";
import config from '../../config.js';

export const required = (req, res, next) => {
    if(!req.auth.data){
        throw new AuthorizationError('User not logged in');
    }else{
        next();
    }
};

export const handle = (req, res, next) => {
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

export default {
    required,
    handle
};