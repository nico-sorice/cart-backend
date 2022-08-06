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

export default {
    index,
    get
}