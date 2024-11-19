import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iClienteSchema } from "../zodModels.js";

export const clientes = {
  route: createRoute({
    method: 'get',
    path: '/clientes',
    params: z.object({}),
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(iClienteSchema),
          },
        },
        description: 'Retrieve the clients',
      },
    },
  }),
  handler: async () => {
    const cachedClientes = await getCachedData('clientes');
    if (cachedClientes) {
      return cachedClientes;
    }
    const clientes = await Cliente.find({}, { _id: 0, __v: 0 }).lean();
    setCachedData('clientes', clientes);
    for (const cliente of clientes) {
      setCachedData(`cliente:${cliente.nombre}:${cliente.apellido}`, cliente.nro_cliente);
      setCachedData(`cliente:${cliente.nro_cliente}`, cliente);
    }
    return clientes;
  }
}
