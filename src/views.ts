import { connect, model, Schema } from "mongoose";

export async function createViews() {
    await createProductosNoFacturadosView();
}




export async function createProductosNoFacturadosView() {
    const db = await connect(process.env.MONGODB_URI as string);

    // try to drop it first
    try {
        await db.connection.db?.dropCollection('productos_no_facturados');
    } catch (error) {
        // Collection may not exist yet, ignore error
    }
    
    await db.connection.db?.createCollection('productos_no_facturados', {
        viewOn: 'productos',
        pipeline: [
            {
                $lookup: {
                    from: 'facturas',
                    let: { producto_code: '$codigo_producto' },
                    pipeline: [
                        {
                            $unwind: '$detalle'
                        },
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$detalle.codigo_producto', '$$producto_code']
                                }
                            }
                        }
                    ],
                    as: 'facturas'
                }
            },
            {
                $match: {
                    facturas: { $size: 0 }
                }
            },
            {
                $project: {
                    facturas: 0
                }
            }
        ]
    });


}
const productosNoFacturadosSchema = new Schema({
    codigo_producto: { type: Number, required: true, unique:true },
    marca: { type: String, required: true },
    nombre: { type: String },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true }
});
export const ProductosNoFacturados = model('productos_no_facturados', productosNoFacturadosSchema);

 // query the view and console the items:
    // query the view and console the items: 