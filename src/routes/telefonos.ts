import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";

export const telefonos = {
  route: createRoute({
    method: 'get',
    path: '/telefonos',
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
    const cachedTelefonos = await getCachedData('telefonos');
    if (cachedTelefonos) {
      return cachedTelefonos;
    }

    const clientes = await Cliente.find({}, { _id: 0, __v: 0 }).lean();
    const result: { telefono: { codigo_area: string, nro_telefono: string, tipo: string }, cliente: { nro_cliente: number, nombre: string, apellido: string, direccion: string, activo: number } }[] = [];

    clientes.forEach(cliente => {
      cliente.telefonos.forEach(telefono => {
        result.push({
          telefono: {
            codigo_area: telefono.codigo_area,
            nro_telefono: telefono.nro_telefono,
            tipo: telefono.tipo
          },
          cliente: {
            nro_cliente: cliente.nro_cliente,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            direccion: cliente.direccion,
            activo: cliente.activo
          }
        });
      });
    });

    setCachedData('telefonos', result);
    return result;
  }
} 