import { connect, model, Schema } from "mongoose";

export async function createViews() {
    await createProductosNoFacturadosView();
    await createFacturasOrdenadasView();
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

export async function createFacturasOrdenadasView() {
    const db = await connect(process.env.MONGODB_URI as string);

    // Intenta eliminar la colección si existe
    try {
        await db.connection.db?.dropCollection('facturas_ordenadas');
    } catch (error) {
        // La colección puede no existir aún, ignora el error
    }

    await db.connection.db?.createCollection('facturas_ordenadas', {
        viewOn: 'facturas',
        pipeline: [
            {
                $sort: { fecha: 1 } // Ordenar por fecha ascendente
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

const facturaSchema = new Schema({
    nro_factura: { type: Number, required: true },
    fecha: { type: Date, required: true },
    total_sin_iva: { type: Number, required: true },
    iva: { type: Number, required: true },
    total_con_iva: { type: Number, required: true },
    nro_cliente: { type: Number, required: true },
    idCliente: { type: Schema.Types.ObjectId, ref: "Cliente", required: false },
    detalle: { type: Array, required: true },
});

export const FacturasOrdenadas = model('facturas_ordenadas', facturaSchema);

 // query the view and console the items:
    // query the view and console the items: 