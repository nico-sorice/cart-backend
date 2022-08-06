import {ObjectId} from "mongodb";
import validateRequest from "../../middleware/requestValidator.js";
import ValidationError from "../../modules/ValidationError.js";

const pedidoTransformer = (pedido) => {
    return {
        id: pedido._id.toString(),
        fecha: (new Date(pedido.fecha)).toLocaleDateString(),
        hora: (new Date(pedido.fecha)).toLocaleTimeString(),
        total: pedido.total,
        cantidadDeItems: pedido.items.count,
        items: pedido.items.map(item => ({
            cantidad: item.cantidad,
            subtotal: item.subtotal,
            productoId: item.productoId,
            producto: {
                nombre: item.producto.nombre,
                descripcion: item.producto.descripcion,
                precio: item.producto.precio,
                imagenUrl: item.producto.imagenUrl,
            }
        })),
    };
}

const store = [
    validateRequest(({body}) => {
        return [
            body('items')
                .not().isEmpty().withMessage('Items es obligatorio')
                .isArray({min: 1}).withMessage('Items debe tener al menos un elemento'),
            body('items.*.producto_id')
                .not().isEmpty().withMessage('El ID de producto es obligatorio')
                .custom(value => !ObjectId.isValid(value) || Promise.reject()).withMessage('El ID de producto es invalido')
            ,
            //TODO: Check that the IDs exist
            body('items.*.cantidad')
                .not().isEmpty().withMessage('La cantidad es obligatoria')
                .isInt({min: 1}).withMessage('La cantidad comprada debe ser un entero y minimo 1'),
            //TODO: Check that the amount is smaller than the available
        ]
    }),
    (req, res, next) => {
        const productoIds = req.body.items.map(item => new ObjectId(item.producto_id));

        return req.app.locals.db.collection('productos')
            .find({_id: {$in: productoIds}})
            .toArray()
            .then((productos) => {
                const items = req.body.items.map((reqItemData) => {
                    const producto = productos.find(producto => producto._id.toString() === reqItemData.producto_id.toString());

                    if(!producto){
                        throw new ValidationError("", [{
                            "value": reqItemData.producto_id.toString(),
                            "msg": "El id de producto no existe",
                            "param": "items.producto_id",
                            "location": "body"
                        }]);
                    }else if(producto.stock < reqItemData.cantidad){
                        throw new ValidationError("", [{
                            "value": reqItemData.cantidad,
                            "msg": "No hay suficiente stock",
                            "param": "items.cantidad",
                            "location": "body"
                        }]);
                    }

                    return {
                        ...reqItemData,
                        subtotal: producto.precio * reqItemData.cantidad,
                        producto,
                    }
                });

                const dataPedido = {
                    fecha: (new Date).toISOString(),
                    total: Number(
                        items.reduce((subtotal, item) => subtotal + item.subtotal, 0).toFixed(2)
                    ),
                    items: items.map(item => ({
                        cantidad: item.cantidad,
                        subtotal: item.subtotal,
                        productoId: item.producto._id.toString(),
                        producto: {
                            nombre: item.producto.nombre,
                            descripcion: item.producto.descripcion,
                            imagenUrl: item.producto.imagenUrl,
                            precio: item.producto.precio,
                        }
                    })),
                }

                return req.app.locals.db.collection('pedidos')
                    .insertOne(dataPedido)
                    .then(result => result.insertedId)
                    .then(insertedId => req.app.locals.db.collection('pedidos').findOne({_id: new ObjectId(insertedId)}))
                    .then(pedido => Promise.all(
                        pedido.items.map(
                            item => req.app.locals.db.collection('productos')
                                .updateOne(
                                    {_id: new ObjectId(item.productoId)},
                                    { $inc: {stock: - item.cantidad}}
                                )
                        )).then(() => pedido)
                    ).then(pedido => {
                        return res.status(200).json({
                            pedido: pedidoTransformer(pedido)
                        });
                    })
            }).catch(next)
    }
];

const index = (req, res, next) => {
    return req.app.locals.db.collection('pedidos')
        .find({})
        .toArray()
        .then((pedidos) => {
            res.status(200).json({
                pedidos: pedidos.map(pedidoTransformer),
            });
        })
        .catch(next);
};

const get = (req, res, next) => {
    if(!ObjectId.isValid(req.params.id)){
        res.status(400).json({
            error: 'Id de pedido invalido',
        });
    }

    return req.app.locals.db.collection('pedidos')
        .findOne({_id: new ObjectId(req.params.id)})
        .then((pedido) => {
            if(pedido){
                res.status(200).json({
                    pedido: pedidoTransformer(pedido)
                });
            }else{
                res.status(404).json({
                    error: 'Pedido no encontrado'
                });
            }
        })
        .catch(next);
};

export default {
    store,
    index,
    get
}