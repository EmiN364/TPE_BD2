import { FacturasOrdenadas, ProductosNoFacturados } from "./mongo.js";

export async function createViews() {
    await Promise.all([
        createProductosNoFacturadosView(),
        createFacturasOrdenadasView(),
    ]).catch(err => {
        console.error("Error creating views", err);
    });
}

async function createProductosNoFacturadosView() {   
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
    await FacturasOrdenadas.createCollection({
        viewOn: 'facturas',
        pipeline: [
            {
                $sort: { fecha: 1 } // Ordenar por fecha ascendente
            }
        ]
    });
}