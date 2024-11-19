import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { FacturasOrdenadas } from "../views.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iFacturaSchema } from "../zodModels.js";

export const facturasOrdenadas = {
  route: createRoute({
    method: 'get',
    path: '/facturas-ordenadas',
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