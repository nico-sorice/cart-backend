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
        const productos = [
            {
                nombre: 'Zapatillas Nike',
                descripcion: 'Las mejores zapas de todas, con rayo laser',
                imagenUrl: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/a42a5d53-2f99-4e78-a081-9d07a2d0774a/air-force-1-07-zapatillas-xCxt0q.png',
                stock: 16,
                precio: 15000,
            },
            {
                nombre: 'Zapatillas Puma',
                descripcion: 'Zapas copadas, y con un tigrecito',
                imagenUrl: 'https://http2.mlstatic.com/D_NQ_NP_966332-MLA50783612955_072022-W.jpg',
                stock: 4,
                precio: 22000,
            },
            {
                nombre: 'Zapatillas Adidas',
                descripcion: 'Zapas con 3 rayas',
                imagenUrl: 'https://ferreira.vteximg.com.br/arquivos/ids/300940-588-588/ad_f36392.jpg?v=636880788332770000',
                stock: 7,
                precio: 16000,
            },
            {
                nombre: 'Zapatillas Fila',
                descripcion: 'Ya vendran tiempos mejores hermano',
                imagenUrl: 'https://sevensport.vteximg.com.br/arquivos/ids/228327-500-500/ZAPATILLAFILADISRUPTORIIPREMIUM5FM0002125MUJER.jpg?v=636973287015300000',
                stock: 150,
                precio: 7000,
            },
            {
                nombre: 'Zapatillas Flecha',
                descripcion: 'Es lo que hay',
                imagenUrl: 'https://d2r9epyceweg5n.cloudfront.net/stores/001/039/577/products/dsc_9708-copy1-c81977da39bcc0714815698841240073-480-0.jpg',
                stock: 72,
                precio: 4500,
            },
        ];

        const pedidos = [
            {
                fecha: (new Date).toISOString(),
                total: 250,
                items: [
                    {
                        cantidad: 2,
                        subtotal: 200,
                        productoId: '62eeb84c3410ca53648ef8c6',
                        producto: {
                            nombre: 'Producto 1',
                            descripcion: 'Que buen producto',
                            imagenUrl: 'https://i.ytimg.com/vi/_LbbKKuimaM/maxresdefault.jpg',
                            precio: 100,
                        },
                    },
                    {
                        cantidad: 1,
                        subtotal: 50,
                        productoId: '62eeb879b48adf8012099608',
                        producto: {
                            nombre: 'Producto 2',
                            descripcion: 'Que buen producto este tambien',
                            imagenUrl: 'https://rockcontent.com/es/wp-content/uploads/sites/3/2019/02/o-que-e-produto-no-mix-de-marketing-1024x538.png',
                            precio: 50,
                        },
                    },
                ]
            },
            {
                fecha: (new Date).toISOString(),
                total: 100,
                items: [
                    {
                        cantidad: 2,
                        subtotal: 100,
                        productoId: '62eeb879b48adf8012099608',
                        producto: {
                            nombre: '62eeb879b48adf8012099608',
                            descripcion: 'Que buen producto este tambien',
                            imagenUrl: 'https://rockcontent.com/es/wp-content/uploads/sites/3/2019/02/o-que-e-produto-no-mix-de-marketing-1024x538.png',
                            precio: 50,
                        },
                    },
                ]
            }
        ];

        return Promise.all([
            req.app.locals.db.collection('productos').deleteMany({}),
            req.app.locals.db.collection('pedidos').deleteMany({}),
        ]).then(() => Promise.all([
            req.app.locals.db.collection('productos').insert(productos),
            req.app.locals.db.collection('pedidos').insert(pedidos),
        ]).then(([resultProd, resultPedidos]) => {
            res.status(200).json({
                message: 'Se agregaron los datos',
            });
        })).catch(next);
    }
];

export default {
    test
};