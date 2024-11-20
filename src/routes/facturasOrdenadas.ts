import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { FacturasOrdenadas } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iFacturaSchema } from "../zodModels.js";

export const facturasOrdenadas = {
  route: createRoute({
    method: 'get',
    path: '/facturas-ordenadas',
    tags: ["11. Se necesita una vista que devuelva los datos de las facturas ordenadas por fecha."],
    summary: "11. Se necesita una vista que devuelva los datos de las facturas ordenadas por fecha.",
    params: z.object({}),
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(iFacturaSchema),
          },
        },
        description: 'Retrieve invoices ordered by date',
      },
    },
  }),
  handler: async () => {
    const cachedFacturas = await getCachedData('facturas_ordenadas');
    if (cachedFacturas) {
      return cachedFacturas;
    }

    const facturas = await FacturasOrdenadas.find({}).lean();
    setCachedData('facturas_ordenadas', facturas);
    return facturas;
  }
}; 