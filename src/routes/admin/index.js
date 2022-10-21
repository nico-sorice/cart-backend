import { Router } from 'express';
import productoController from '../../controllers/admin/productoController.js';
import authController from '../../controllers/admin/auth.js';
import {
    required as authRequiredMiddleware,
    handle as authHandleMiddleware,
} from '../../middleware/auth.js';

const router = Router();

router.use(authHandleMiddleware);

router.post('/auth/login', authController.login);
//router.post('/auth/register', authController.register);
router.get('/auth/user', authRequiredMiddleware, authController.getUser);

router.get('/productos', authRequiredMiddleware, productoController.index);
router.get('/productos/:id', authRequiredMiddleware, productoController.get);
router.post('/productos', authRequiredMiddleware, productoController.store);
router.put('/productos/:id', authRequiredMiddleware, productoController.update);
router.delete('/productos/:id', authRequiredMiddleware, productoController.destroy);

export default router;

