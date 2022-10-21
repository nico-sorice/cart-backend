import validateRequest from '../../middleware/requestValidator.js';
import {ObjectId} from "mongodb";

const productoTransformer = (producto) => {
    return {
        id: producto._id.toString(),
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagenUrl: producto.imagenUrl,
        stock: producto.stock,
        precio: producto.precio,
    };
}

const index = (req, res, next) => {
    return req.app.locals.db.collection('productos')
        .find({})
        .toArray()
        .then((productos) => {
            res.status(200).json({
                productos: productos.map(productoTransformer),
            });
        })
        .catch(next);
};

const get = (req, res, next) => {
    if(!ObjectId.isValid(req.params.id)){
        res.status(400).json({
            error: 'Id de producto invalido',
        });
    }

    return req.app.locals.db.collection('productos')
        .findOne({_id: new ObjectId(req.params.id)})
        .then((producto) => {
            if(producto){
                res.status(200).json({
                    producto: productoTransformer(producto)
                });
            }else{
                res.status(404).json({
                    error: 'Producto no encontrado'
                });
            }
        })
        .catch(next);
};

const store = [
    validateRequest(({check}) => [
        check('nombre')
            .not().isEmpty().withMessage('El nombre es obligatorio')
            .isLength({max: 50, min: 10}).withMessage('El nombre debe tener entre 10 y 50 caracteres'),
        check('descripcion')
            .not().isEmpty().withMessage('La descripcion es obligatoria')
            .isLength({max: 100, min: 15}).withMessage('La descripcion es debe tener entre 15 y 100 caracteres'),
        check('imagenUrl')
            .not().isEmpty().withMessage('La imagen es obligatoria')
            .isURL().withMessage('La imagen debe ser una URL'),
        check('stockInicial')
            .not().isEmpty().withMessage('El stock inicial es obligatorio')
            .isInt({min: 1, max: 1000}).withMessage('El stock inicial debe ser entre 0 y 1000'),
        check('precio')
            .not().isEmpty().withMessage('El precio es obligatorio')
            .isNumeric({min: 0, max: 100000}).withMessage('El precio debe ser entre 0 y 100000'),
    ]),
    (req, res, next) => {
        const nuevoProducto = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            imagenUrl: req.body.imagenUrl,
            stock: req.body.stockInicial,
            precio: req.body.precio
        };

        return req.app.locals.db.collection('productos')
            .insertOne(nuevoProducto)
            .then(({insertedId}) => {
                return req.app.locals.db.collection('productos')
                    .findOne({_id: new ObjectId(insertedId)})
                    .then(producto => {
                        res.status(200).json({
                            producto: productoTransformer(producto)
                        });
                    });
            })
            .catch(next);
    }
];

const update = (req, res, next) => {
    const productoActualizado = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        imagenUrl: req.body.imagenUrl,
        precio: req.body.precio
    };

    return req.app.locals.db.collection('productos')
        .findOneAndUpdate(
            {_id: new ObjectId(req.params.id)},
            {$set: productoActualizado},
            {returnDocument: 'after'}
        )
        .then(({value, lastErrorObject}) => {
            if(lastErrorObject.updatedExisting){
                res.status(200).json({
                    producto: productoTransformer(value)
                });
            }else{
                res.status(404).json({
                    error: 'Producto no encontrado',
                });
            }
        })
        .catch(next);
};

const destroy = (req, res, next) => {
    return req.app.locals.db.collection('productos')
        .deleteOne({_id: new ObjectId(req.params.id)})
        .then(({deletedCount}) => {
            if(deletedCount > 0){
                res.status(200).json({
                    error: 'Producto eliminado correctamente',
                });
            }else{
                res.status(404).json({
                    error: 'Producto no encontrado',
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
};