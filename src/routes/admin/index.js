const path = require('path');
const router = require('express').Router();

const auth = require(path.join(__dirname, '..', '..', 'middleware', 'auth'));

const applicationController = require(path.join(__dirname, '..', '..', 'controllers', 'admin', 'application'));
const jobPostingController = require(path.join(__dirname, '..', '..', 'controllers', 'admin', 'jobPosting'));
const authController = require(path.join(__dirname, '..', '..', 'controllers', 'admin', 'auth'));

router.use(auth.handle);

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/user', auth.required, authController.getUser);

router.get('/application', auth.required, applicationController.index);
router.get('/application/:id', auth.required, applicationController.get);
router.get('/application/:id/resume', auth.required, applicationController.downloadResume);

router.get('/job_posting', auth.required, jobPostingController.index);
router.get('/job_posting/:id', auth.required, jobPostingController.get);
router.post('/job_posting', auth.required, jobPostingController.store);
router.put('/job_posting/:id', auth.required, jobPostingController.update);
router.delete('/job_posting/:id', auth.required, jobPostingController.delete);

module.exports = router;
