import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from './../../../config.js';
import validateRequest from '../../middleware/requestValidator.js';

const getUser = [
    (req, res, next) => {
        return res.status(200).json({
            authData: req.auth.data,
        });
    }
];

const login = [
    /* Validation */
    validateRequest(({body}) => [
        body('email').not().isEmpty().isEmail().isLength({max: 255}),
        body('password').not().isEmpty().isLength({min: 8, max: 255}),
    ]),
    /* Validation */
    (req, res, next) => {
        return User.findOne({email: req.body.email})
            .exec()
            .then(user => {
                if(!user){
                    return res.status(401).json({});
                }

                return bcrypt.compare(req.body.password, user.password)
                    .then(result => {
                        if(!result){
                            return res.status(401).json({});
                        }

                        const userData = {userId: user._id.toString(), email: user.email, name: user.name};
                        const token = jwt.sign(userData, config.jwt_secret, {expiresIn: '1h'});

                        return res.status(200).json({
                            token,
                            user: userData,
                        });
                    });
            })
            .catch(next);
    }
];

const register = [
    /* Validation */
    validateRequest(({body}) => [
        body('email').not().isEmpty()
            .isEmail()
            .isLength({max: 255})
            .custom((value, {req}) => {
                return User.findOne({email: value})
                    .exec()
                    .then((user) => {
                        if(user){return Promise.reject('El email ya esta en uso');}
                    })
            }),
        body('password').not().isEmpty().isLength({min: 8, max: 255}),
    ]),
    /* Validation */
    (req, res, next) => {
        return bcrypt.hash(req.body.password, 12)
            .then((hashedPassword) => {
                console.log({passwordAtCreation: req.body.password});

                const user = new User({
                    email: req.body.email,
                    password: hashedPassword,
                });

                return user.save();
            })
            .then(user => {
                res.status(201).json({});
            })
            .catch(next);
    }
];

export default {
    getUser,
    login,
    register
};