import {Router} from "express";
import ValidationError from "../../modules/ValidationError.js";
import indexController from '../../controllers/app/indexController.js';
import productoController from '../../controllers/app/productoController.js';
import pedidoController from '../../controllers/app/pedidoController.js';

const router = Router();

router.get('/productos', productoController.index);
router.get('/productos/:id', productoController.get);
router.post('/pedidos', pedidoController.store);
router.get('/pedidos', pedidoController.index);
router.get('/pedidos/:id', pedidoController.get);
router.get('/test', indexController.test);

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
        message: '¡Ocurrio un error!',
        error: process.env.NODE_ENV === 'production' ? '-' : err.stack,
    });
});
/* Route error handlers */

export default router;