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

const index =  [
    validateRequest(({query}) => [
        query('pagina')
            .isInt({min: 1}).withMessage('La pagina debe ser un numero entero igual o mayor a 1')
            .optional(),
        query('cantidadPorPagina')
            .isInt({min: 1, max: 50}).withMessage('La cantidad por pagina debe ser un entero entre 1 y 50')
            .optional(),
    ]),
    (req, res, next) => {
        const parametrosPaginado = {
            pagina: Number(req.query.pagina || 1),
            cantidadPorPagina: Number(req.query.cantidadPorPagina || 3),
        };

        return req.app.locals.db.collection('productos')
            .find({})
            .toArray()
            .then((productos) => {
                const productosPaginados = productos.slice(
                    parametrosPaginado.cantidadPorPagina * (parametrosPaginado.pagina - 1),
                    parametrosPaginado.cantidadPorPagina * parametrosPaginado.pagina
                );

                res.status(200).json({
                    productos: productosPaginados.map(productoTransformer),
                    paginado: {
                        ...parametrosPaginado,
                        cantidad: productosPaginados.length,
                        total: productos.length,
                        cantidadDePaginas: Math.ceil(productos.length / parametrosPaginado.cantidadPorPagina)
                    }
                });
            })
            .catch(next);
    }
];

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