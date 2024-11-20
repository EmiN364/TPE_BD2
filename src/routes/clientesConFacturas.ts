import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente, Factura } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iClienteSchema } from "../zodModels.js";

export const clientesConFacturas = {
  route: createRoute({
    method: 'get',
    path: '/clientes-con-facturas',
    params: z.object({}),
    tags: ["4. Obtener todos los clientes que tengan registrada al menos una factura."],
    summary: ". Obtener todos los clientes que tengan registrada al menos una factura.",
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(iClienteSchema),
          },
        },
        description: 'Retrieve clients with at least one registered invoice',
      },
    },
  }),
  handler: async () => {
    const cachedClientes = await getCachedData('clientes_con_facturas');
    if (cachedClientes) {
      return cachedClientes;
    }
    const clientesConFacturas = await Cliente.aggregate([
      {
        $lookup: {
          from: 'facturas', 
          localField: 'nro_cliente',
          foreignField: 'nro_cliente',
          as: "facturas",
          pipeline: [{ $limit: 1 }],
        },
      },
      {
        $match: {
          facturas: { $ne: [] } 
        }
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          facturas: 0 
        }
      }
    ]);

    setCachedData('clientes_con_facturas', clientesConFacturas);

    return clientesConFacturas;
  }
};
