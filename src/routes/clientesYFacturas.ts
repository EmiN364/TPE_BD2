import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente, Factura } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iClienteSchema } from "../zodModels.js";

// Modified schema to include cantidad_facturas
const clienteConCantidadSchema = iClienteSchema.extend({
  cantidad_facturas: z.number()
});

export const clientesYFacturas = {
  route: createRoute({
    method: 'get',
    path: '/clientes-y-facturas',
    params: z.object({}),
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(clienteConCantidadSchema),
          },
        },
        description: 'Retrieve clients with their invoice count',
      },
    },
  }),
  handler: async () => {
    const cachedClientes = await getCachedData('clientes_y_facturas');
    // if (cachedClientes) {
    //   return cachedClientes;
    // }

    const clientesYFacturas = await Cliente.aggregate([
      {
        $lookup: {
          from: "facturas",
          localField: "nro_cliente",
          foreignField: "nro_cliente",
          as: "facturas",
        },
      },
      {
        $project: {
          _id: 0,
          nombre: 1,
          apellido: 1,
          nro_cliente: 1,
          cantidad_facturas: { $ifNull: [{ $size: "$facturas" }, 0] },
        },
      },
    ]).exec();

    setCachedData('clientes_y_facturas', clientesYFacturas);

    return clientesYFacturas;
  }
};
