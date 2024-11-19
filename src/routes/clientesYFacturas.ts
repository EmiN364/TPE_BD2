import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente, Factura } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iClienteSchema } from "../zodModels.js";

export const clientesYFacturas = {
  route: createRoute({
    method: 'get',
    path: '/clientes-y-facturas',
    params: z.object({}),
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(iClienteSchema),
          },
        },
        description: 'Retrieve clients together with their respective invoices',
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
            from: 'facturas', 
            localField: 'nro_cliente',
            foreignField: 'nro_cliente',
            as: 'facturas'
          }
        },
        {
          $project: {
            _id: 0,
            nro_cliente: 1,
            nombre: 1,
            apellido: 1,
            facturas: {
              $map: {
                input: "$facturas",
                as: "factura",
                in: {
                  _id: "$$factura._id",
                  nro_factura: "$$factura.nro_factura",
                  fecha: "$$factura.fecha",
                  monto: "$$factura.monto"
                }
              }
            }
          }
        }
      ]).exec();

    setCachedData('clientes_y_facturas', clientesYFacturas);

    return clientesYFacturas;
  }
};
