import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente } from "../mongo.js";

export const telefonos = {
  route: createRoute({
    method: 'get',
    path: '/telefonos',
    summary: "Mostrar cada teléfono junto con los datos del cliente.",
    tags: ["3. Mostrar cada teléfono junto con los datos del cliente."],
    params: z.object({}),
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(z.object({
              telefono: z.object({
                codigo_area: z.string(),
                nro_telefono: z.string(),
                tipo: z.string()
              }),
              cliente: z.object({
                nro_cliente: z.number(),
                nombre: z.string(),
                apellido: z.string(),
                direccion: z.string(),
                activo: z.number()
              })
            })),
          },
        },
        description: 'Retrieve phone numbers with associated client data',
      },
    },
  }),
  handler: async () => {
    return await Cliente.aggregate([
      { $unwind: "$telefonos" },
      { $addFields: { "telefono": "$telefonos" } },
      { $project: { _id: 0, __v: 0, telefonos: 0, "telefono._id": 0 } }
    ]);
  }
} 