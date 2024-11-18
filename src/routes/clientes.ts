import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { iClienteSchema } from "../zodModels.js";

export const clientesRoute = createRoute({
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
        description: 'Retrieve the user',
      },
    },
  })