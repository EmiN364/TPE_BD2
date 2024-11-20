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
    summary: "Devolver todos los clientes, con la cantidad de facturas que tienen registradas (si no tienen considerar cantidad en 0)",
    tags: ["6. Devolver todos los clientes, con la cantidad de facturas que tienen registradas (si no tienen considerar cantidad en 0)"],
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
    if (cachedClientes) {
      return cachedClientes;
    }

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
        $addFields: {
          cantidad_facturas: { $size: "$facturas" }
        }
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          facturas: 0
        },
      },
    ]);

    setCachedData('clientes_y_facturas', clientesYFacturas);

    return clientesYFacturas;
  }
};
