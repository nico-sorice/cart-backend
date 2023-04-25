import {Router} from "express";
import ValidationError from "../../modules/ValidationError.js";
import notaController from "../../controllers/notes/notaController.js";

const router = Router();

router.get('/notas', notaController.index);
router.get('/notas/:id', notaController.get);
router.post('/notas', notaController.store);
router.put('/notas/:id', notaController.update);
router.delete('/notas/:id', notaController.destroy);

/* Route error handlers */
router.all('*', (req, res, next) => {
    res.status(404).json({
        message: 'Ruta no encontrada 33',
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