import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente, Factura } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";

export const gastosClientes = {
  route: createRoute({
    method: 'get',
    path: '/gastos-clientes',
    params: z.object({}),
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(z.object({
              nombre: z.string(),
              apellido: z.string(),
              totalGastado: z.number(),
            })),
          },
        },
        description: 'Retrieve total spending of each client including VAT',
      },
    },
  }),
  handler: async () => {
    const cachedGastos = await getCachedData('gastos_clientes');
    if (cachedGastos) {
      return cachedGastos;
    }

    const gastosClientes = await Cliente.aggregate([
      {
        $lookup: {
          from: 'facturas',
          localField: 'nro_cliente',
          foreignField: 'nro_cliente',
          as: 'facturas'
        }
      },
      {
        $unwind: {
          path: '$facturas',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            nro_cliente: '$nro_cliente',
            nombre: '$nombre',
            apellido: '$apellido'
          },
          totalGastado: { $sum: '$facturas.total_con_iva' }
        }
      },
      {
        $project: {
          _id: 0,
          nombre: '$_id.nombre',
          apellido: '$_id.apellido',
          totalGastado: 1
        }
      }
    ]);

    setCachedData('gastos_clientes', gastosClientes);
    return gastosClientes;
  }
};
