const path = require('path');
const Application = require(path.join(__dirname, '..', '..', 'models', 'application'));
const JobPosting = require(path.join(__dirname, '..', '..', 'models', 'jobPosting'));

module.exports.index = (req, res, next) => {
    return Application.find({'jobposting.user': req.auth.data.userId})
        .exec()
        .then(applications => {
            res.status(200).json({
                applications
            });
        })
        .catch(next);
};

module.exports.get = (req, res, next) => {
    return Application.findOne({'jobposting.user': req.auth.data.userId, _id: req.params.id})
        .exec()
        .then(application => {
            if(!application){
                return res.status(404).json({
                    message: 'Application not found'
                });
            }

            res.status(200).json(application);
        })
        .catch(next);
};

module.exports.downloadResume = (req, res, next) => {
    return Application.findOne({'jobposting.user': req.auth.data.userId, _id: req.params.id})
        .populate('applicant.resumeFile')
        .exec()
        .then(application => {
            if(!application){
                return res.status(404).json({
                    message: 'Application not found'
                });
            }

            const resumeFile = application.applicant.resumeFile;

            res.setHeader('Content-Type', resumeFile.type);
            res.setHeader('Content-Disposition', `inline; filename="CV - ${application.applicant.first_name} ${application.applicant.last_name}${resumeFile.extension}"`);
            res.end(resumeFile.data);
        })
        .catch(next);
};