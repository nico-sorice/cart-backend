const path = require('path');
const JobPosting = require(path.join(__dirname, '..', '..', 'models', 'jobPosting'));
const requestValidator = require(path.join(__dirname, '..', '..', 'middleware', 'requestValidator'));

module.exports.index = (req, res, next) => {
    return JobPosting.find({user: req.auth.data.userId})
        .exec()
        .then(jobPostings => {
            res.status(200).json({
                jobPostings: jobPostings,
            });
        })
        .catch(next);
};

module.exports.get = (req, res, next) => {
    JobPosting.findOne({_id: req.params.id})
        .exec()
        .then(jobPosting => {
            res.status(200).json(jobPosting);
        })
        .catch(next);
};

module.exports.store = [
    requestValidator.validate(({check}) => [
        check('title').not().isEmpty().isLength({max: 50, min: 10}),
        check('description').not().isEmpty().isLength({max: 5000, min: 30}),
        check('requirements').not().isEmpty().isArray(),
        check('requirements.*.title').not().isEmpty().isLength({min: 2, max: 30,}),
        check('requirements.*.description').not().isEmpty().isLength({min: 30, max: 2000,}),
    ]),
    (req, res, next) => {
        const jobPosting = new JobPosting({
            title: req.body.title,
            description: req.body.description,
            requirements: req.body.requirements.map(requirement => ({
                title: requirement.title,
                description: requirement.description,
            })),
            user: req.auth.data.userId,
        });

        return jobPosting.save()
            .then(() => {
                res.status(200).json(jobPosting);
            })
            .catch(next);
    }
];

module.exports.update = (req, res, next) => {
    return JobPosting.findOneAndUpdate({user: req.auth.data.userId, _id: req.params.id}, {
        title: req.body.title,
        description: req.body.description,
        requirements: req.body.requirements.map(requirement => ({
            title: requirement.title,
            description: requirement.description,
        })),
    })
        .exec()
        .then(jobPosting => {
            res.status(200).json(jobPosting);
        })
        .catch(next);
};

module.exports.delete = (req, res, next) => {
    return JobPosting.deleteOne({user: req.auth.data.userId,_id: req.params.id})
        .exec()
        .then(() => {
            res.status(200).json({});
        })
        .catch(next);
};