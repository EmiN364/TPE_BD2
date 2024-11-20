import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Factura } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iProductoSchema } from "../zodModels.js";

export const productosFacturados = {
  route: createRoute({
    method: 'get',
    path: '/productos-facturados',
    summary: ". Seleccionar los productos que han sido facturados al menos 1 vez.",
    tags: ["8. Seleccionar los productos que han sido facturados al menos 1 vez."],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(iProductoSchema)
          },
        },
        description: 'Retrieve billed products',
      },
    },
  }),
  handler: async () => {
    const cachedProductos = await getCachedData('productos_facturados');
    if (cachedProductos) {
      return cachedProductos;
    }
    const productos = await Factura.aggregate([
      { $unwind: '$detalle' },
      { $group: { _id: '$detalle.codigo_producto' } },
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: 'codigo_producto',
          as: 'producto'
        }
      },
      { $unwind: '$producto' },
      { $replaceRoot: { newRoot: '$producto' } },
      { $sort: { codigo_producto: 1 } },
      {
        $project: {
          _id: 0,
          __v: 0
        }
      }
    ])
    setCachedData('productos_facturados', productos);
    return productos;
  }
};

