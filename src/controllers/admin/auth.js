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
        body('password').not().isEmpty().isLength({min: 4, max: 30}),
    ]),
    /* Validation */
    (req, res, next) => {
        if(req.body.email === 'admin@example.com' && req.body.password === 'admin'){
            const userData = {userId: 1, email: 'admin@example.com', name: 'Admin'};
            const token = jwt.sign({user: userData}, config.jwt_secret, {expiresIn: '1h'});

            return res.status(200).json({
                token,
                user: userData,
            });
        }

        return res.status(401).json({
            error: 'Credenciales invalidas'
        });
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