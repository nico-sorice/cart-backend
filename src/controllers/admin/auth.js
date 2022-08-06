const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require(path.join(__dirname, '..', '..', '..', 'config'));
const User = require(path.join(__dirname, '..', '..', 'models', 'user'));
const requestValidator = require(path.join(__dirname, '..', '..', 'middleware', 'requestValidator'));

module.exports.getUser = [
    (req, res, next) => {
        return res.status(200).json({
            authData: req.auth.data,
        });
    }
];

module.exports.login = [
    /* Validation */
    requestValidator.validate(({body}) => [
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

module.exports.register = [
    /* Validation */
    requestValidator.validate(({body}) => [
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