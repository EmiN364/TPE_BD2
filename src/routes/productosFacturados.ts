import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente, Factura, Producto } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iProductoSchema } from "../zodModels.js";

export const productosFacturados = {
  route: createRoute({
    method: 'get',
    path: '/productos-facturados',
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
    const cachedBilledProducts = await getCachedData('billedProducts');
    if (cachedBilledProducts) {
      return cachedBilledProducts;
    }
    // retrieve products that have been billed
    const facturas = await Factura.find({}, { _id: 0, __v: 0 }).lean();
    const productosFacturados = new Set();

    facturas.forEach(factura => {
      factura.detalle.forEach(detalle => {
        productosFacturados.add(detalle.codigo_producto);
      });
    });

    const productos = await Producto.find({ codigo_producto: { $in: Array.from(productosFacturados) } }, { _id: 0, __v: 0 }).lean();
    setCachedData('billedProducts', productos);
    return productos;
  }
};

