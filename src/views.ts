import { FacturasOrdenadas, ProductosNoFacturados } from "./mongo.js";

export async function createViews() {
    await createProductosNoFacturadosView();
    await createFacturasOrdenadasView();
}

async function createProductosNoFacturadosView() {
    // try to drop it first
    try {
        await ProductosNoFacturados.collection.drop();
    } catch (error) {
        // Collection may not exist yet, ignore error
    }
    
    await ProductosNoFacturados.createCollection({
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

async function createFacturasOrdenadasView() {
    // Intenta eliminar la colección si existe
    try {
        await FacturasOrdenadas.collection.drop();
    } catch (error) {
        // La colección puede no existir aún, ignora el error
    }

    await FacturasOrdenadas.createCollection({
        viewOn: 'facturas',
        pipeline: [
            {
                $sort: { fecha: 1 } // Ordenar por fecha ascendente
            }
        ]
    });
}