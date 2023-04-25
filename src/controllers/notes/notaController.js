import {ObjectId} from "mongodb";
import validateRequest from "../../middleware/requestValidator.js";

const notaTransformer = (nota) => {
    return {
        id: nota._id.toString(),
        titulo: nota.titulo,
        cuerpo: nota.cuerpo,
        color: nota.color,
        fija: nota.fija,
        //orden: nota.orden,
    };
}

const index = (req, res, next) => {
    return req.app.locals.db.collection('keep_notas')
        .find({})
        .toArray()
        .then((notas) => {
            res.status(200).json({
                notas: notas.map(notaTransformer),
            });
        })
        .catch(next);
};

const get = (req, res, next) => {
    if(!ObjectId.isValid(req.params.id)){
        res.status(400).json({
            error: 'Id de nota invalido',
        });
    }

    return req.app.locals.db.collection('keep_notas')
        .findOne({_id: new ObjectId(req.params.id)})
        .then((nota) => {
            if(nota){
                res.status(200).json({
                    nota: notaTransformer(nota)
                });
            }else{
                res.status(404).json({
                    error: 'Nota no encontrada'
                });
            }
        })
        .catch(next);
};


const store = [
    validateRequest(({check}) => [
        check('titulo')
            .not().isEmpty().withMessage('El titulo es obligatorio')
            .isLength({max: 100, min: 1}).withMessage('El nombre debe tener entre 1 y 100 caracteres'),
        check('cuerpo')
            .not().isEmpty().withMessage('El cuerpo es obligatorio')
            .isLength({max: 3000, min: 10}).withMessage('El cuerpo es debe tener entre 10 y 3000 caracteres'),
        check('color')
            .not().isEmpty().withMessage('El color es obligatorio')
            .custom((value) => /^#[0-9A-F]{6}$/i.test(value)).withMessage('El color debe ser un color hexadecimal valido #AAAAAA'),
        check('fija')
            .isBoolean().withMessage('Fija debe ser true/false'),
    ]),
    (req, res, next) => {
        const nuevaNota = {
            titulo: req.body.titulo,
            cuerpo: req.body.cuerpo,
            color: req.body.color,
            fija: !!req.body.fija,
            fechaCreacion: (new Date).toISOString(),
            fechaActualizacion: (new Date).toISOString(),
        };

        return req.app.locals.db.collection('keep_notas')
            .insertOne(nuevaNota)
            .then(({insertedId}) => {
                return req.app.locals.db.collection('keep_notas')
                    .findOne({_id: new ObjectId(insertedId)})
                    .then(nota => {
                        res.status(200).json({
                            nota: notaTransformer(nota)
                        });
                    });
            })
            .catch(next);
    }
];

const update = [
    validateRequest(({check}) => [
        check('titulo')
            .not().isEmpty().withMessage('El titulo es obligatorio')
            .isLength({max: 100, min: 1}).withMessage('El nombre debe tener entre 1 y 100 caracteres'),
        check('cuerpo')
            .not().isEmpty().withMessage('El cuerpo es obligatorio')
            .isLength({max: 3000, min: 10}).withMessage('El cuerpo es debe tener entre 10 y 3000 caracteres'),
        check('color')
            .not().isEmpty().withMessage('El color es obligatorio')
            .custom((value) => /^#[0-9A-F]{6}$/i.test(value)).withMessage('El color debe ser un color hexadecimal valido #AAAAAA'),
        check('fija')
            .isBoolean().withMessage('Fija debe ser true/false'),
    ]),
    (req, res, next) => {
        const notaActualizada = {
            titulo: req.body.titulo,
            cuerpo: req.body.cuerpo,
            color: req.body.color,
            fija: !!req.body.fija,
            fechaActualizacion: (new Date).toISOString(),
        };

        return req.app.locals.db.collection('keep_notas')
            .findOneAndUpdate(
                {_id: new ObjectId(req.params.id)},
                {$set: notaActualizada},
                {returnDocument: 'after'}
            )
            .then(({value, lastErrorObject}) => {
                if(lastErrorObject.updatedExisting){
                    res.status(200).json({
                        nota: notaTransformer(value)
                    });
                }else{
                    res.status(404).json({
                        error: 'Nota no encontrada',
                    });
                }
            })
            .catch(next);
    }
];

const destroy = (req, res, next) => {
    return req.app.locals.db.collection('keep_notas')
        .deleteOne({_id: new ObjectId(req.params.id)})
        .then(({deletedCount}) => {
            if(deletedCount > 0){
                res.status(200).json({
                    error: 'Nota eliminada correctamente',
                });
            }else{
                res.status(404).json({
                    error: 'Nota no encontrada',
                });
            }
        })
        .catch(next);
};

export default {
    index,
    get,
    store,
    update,
    destroy,
}