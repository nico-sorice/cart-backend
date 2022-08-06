const path = require('path');
const router = require('express').Router();
const ValidationError = require(path.join(__dirname, '..', '..', 'modules', 'ValidationError'));
const indexController = require(path.join(__dirname, '..', '..', 'controllers', 'app', 'index'));

router.get('/job_posting', indexController.indexJobPostings);
router.get('/job_posting/:id', indexController.getJobPosting);
router.post('/application_request', indexController.storeApplicationRequest);
router.post('/application', indexController.storeApplication);
router.post('/test', indexController.test);

/* Route error handlers */
router.all('*', (req, res, next) => {
    res.status(404).json({
        message: 'Ruta no encontrada',
    });
});

router.use((err, req, res, next) => {
    if(err instanceof ValidationError) {
        return res.status(422).json({
            message: 'Algunos campos son invalidos',
            errors: err.errors,
        });
    }

    res.status(500).json({
        message: 'Ocurrio un error!',
        error: process.env.NODE_ENV === 'production' ? '-' : err.stack,
    });
});
/* Route error handlers */

module.exports = router;