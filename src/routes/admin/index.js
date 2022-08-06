import { Router } from 'express';
import applicationController from '../../controllers/admin/application.js';
import jobPostingController from '../../controllers/admin/jobPosting.js';
import authController from '../../controllers/admin/auth.js';
import {
    required as authRequiredMiddleware,
    handle as authHandleMiddleware,
} from '../../middleware/auth.js';

const router = Router();

router.use(authHandleMiddleware);

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/user', authRequiredMiddleware, authController.getUser);

router.get('/application', authRequiredMiddleware, applicationController.index);
router.get('/application/:id', authRequiredMiddleware, applicationController.get);
router.get('/application/:id/resume', authRequiredMiddleware, applicationController.downloadResume);

router.get('/job_posting', authRequiredMiddleware, jobPostingController.index);
router.get('/job_posting/:id', authRequiredMiddleware, jobPostingController.get);
router.post('/job_posting', authRequiredMiddleware, jobPostingController.store);
router.put('/job_posting/:id', authRequiredMiddleware, jobPostingController.update);
router.delete('/job_posting/:id', authRequiredMiddleware, jobPostingController.destroy);

export default router;

