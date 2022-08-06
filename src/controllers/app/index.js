import validateRequest from "../../middleware/requestValidator.js";
import multer from 'multer';

const jobPostingTransformer = (jobPosting) => {
    return {
        id: jobPosting._id.toString(),
        title: jobPosting.title,
        description: jobPosting.description,
        requirements: jobPosting.requirements.map(requirement => ({
            title: requirement.title,
            description: requirement.description,
        })),
    };
}

const indexJobPostings = (req, res, next) => {
    return JobPosting.find({}).exec()
        .then(jobPostings => {
            res.status(200).json({
                jobPostings: jobPostings.map(jobPostingTransformer),
            });
        })
        .catch(next);
};

const getJobPosting = (req, res, next) => {
    return JobPosting.findById(req.params.id)
        .exec()
        .then(jobPosting => {
            if(!jobPosting){
                return res.status(404).json({
                    message: 'Job posting not found',
                });
            }

            res.status(200).json(jobPostingTransformer(jobPosting));
        })
        .catch(next);
};

const storeApplicationRequest = [
    validateRequest(({check}) => [
        check('job_posting_id', 'Este campo es obligatorio y debe ser un ID valido').not().isEmpty().isLength({max: 24, min: 24}),
    ]),
    (req, res, next) => {
        return JobPosting.findById(req.body.job_posting_id).exec()
            .then(jobPosting => {
                if(!jobPosting){
                    return res.status(422).json({
                        message: 'Job posting not found or no longer available',
                    });
                }

                const application = new Application({
                    code: Math.random() * Math.pow(10, 10),
                    jobPosting: jobPosting._id,
                    createdAt: new Date(),
                    appliedAt: null,
                });

                application.save()
                    .then(() => {
                        res.status(201).json({
                            message: 'Solicitud recibida correctamente',
                            code: application.code,
                            expires_at: application.expiresAt.toISOString(),
                        });
                    });
            })
            .catch(next);
    }
];

const storeApplication = [
    /* Upload */
    multer({
        storage: multer.memoryStorage(),
        limits: {fileSize: 10 * Math.pow(1024, 2 /* MBs*/)},
        fileFilter(req, file, cb){
            cb(null, file.mimeType === 'application/pdf');
        },
    }).fields([
        {name: 'resume_file', maxCount: 1}
    ]),
    /* Upload */
    /* Validation */
    validateRequest(({check, checkSchema}) => [
        check('request_code', 'Este campo es obligatorio').not().isEmpty(),
        check('first_name', 'Este campo es obligatorio y debe tener entre 2 y 40 caracteres').not().isEmpty().isLength({min: 2, max: 40}),
        check('last_name', 'Este campo es obligatorio y debe tener entre 2 y 40 caracteres').not().isEmpty().isLength({min: 2, max: 40}),
        check('phone', 'Este campo es obligatorio, debe ser numerico y tener entre 6 y 12 caracteres').not().isEmpty().isNumeric().isLength({min: 6, max: 12}),
        check('email', 'Este campo es obligatorio y debe ser un email valido').not().isEmpty().isEmail().isLength({max: 255}),
        checkSchema({
            'resume_file': {
                custom: {
                    options: (value, { req, path }) => !!req.files[path],
                    errorMessage: 'Este archivo es obligatorio y debe ser un archivo PDF de hasta 10Mb',
                },
            },
        }),
    ]),
    /* Validation */
    (req, res, next) => {
        return Application.findOne({code: req.body.request_code, appliedAt: null})
            .exec()
            .then(application => {
                const reqResumeFile = req.files['resume_file'][0];

                if(!application || +application.expiresAt < +new Date() || application.appliedAt){
                    return res.status(422).json({
                        message: 'Lo sentimos, el codigo de solicitud no existe, ya fue usado o expiró.',
                    });
                }

                application.appliedAt = new Date();

                const file = new File({
                    type: reqResumeFile.mimetype,
                    data: reqResumeFile.buffer,
                    extension: path.extname(reqResumeFile.originalname),
                });

                return file.save()
                    .then(() => {
                        application.applicant = {
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            phone: req.body.phone,
                            email: req.body.email,
                            resumeFile: file._id,
                        };

                        application.save()

                        res.status(200).json({
                            message: 'Felicitaciones, tu solicitud fue recibida correctamente.',
                        });
                    });
            })
            .catch(next);
    },
];

const test = [
    (req, res, next) => {
        res.status(200).json({
            message: 'Támo adentro.',
        });

        /*
        const user = new User({
            email: 'pepepompinazo@gmail.com',
            password: 'abc789',
        });

        return user.save()
            .then(() => {
                const jobPosting = new JobPosting({
                    title: 'Super trabajo N:' + (Math.random() * 1000),
                    description: 'Este es posta el mejor trabajo',
                    user: user._id,
                });

                return jobPosting.save();
            })
            .catch(next);

         */
    }
];

export default {
    jobPostingTransformer,
    indexJobPostings,
    getJobPosting,
    storeApplicationRequest,
    storeApplication,
    test
};