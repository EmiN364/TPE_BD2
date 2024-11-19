import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente, Factura } from "../mongo.js";
import { iClienteSchema } from "../zodModels.js";
import type { Context } from "hono";
import { getCachedData, setCachedData } from "../redis.js";

/**
 * 5. Identificar todos los clientes que no tengan registrada ninguna factura.
 */
export const clientesSinFacturas = {
    route: createRoute({
        method: 'get',
        path: '/clientes-sin-facturas',
        description:"Identificar todos los clientes que no tengan registrada ninguna factura.",
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(iClienteSchema),
                    },
                },
                description: 'Clients without invoices',
            },
            500: {
                description: 'Internal server error',
            },
        },
    }),
    handler: async (c: Context) => {
        try {
            // if cached return
            const cachedClientes = await getCachedData('clientes_sin_facturas');
            if (cachedClientes) {
              return cachedClientes;
            }
            
            const clientesConFacturas = await Factura.distinct('nro_cliente');
            
            const clientesSinFacturas = await Cliente.find({
                nro_cliente: { $nin: clientesConFacturas }
            });


            setCachedData('clientes_sin_facturas', clientesSinFacturas)

            return clientesSinFacturas;
        } 
        catch (error) {
            console.error('Error finding clients without invoices:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }

        /*
        try {
            const cachedClientes = await getCachedData('clientes_sin_facturas');
            if (cachedClientes) {
                return c.json(cachedClientes);
            }

            const clientesSinFacturas = await Cliente.aggregate([
                {
                    $lookup: {
                        from: 'facturas',
                        localField: 'nro_cliente',
                        foreignField: 'nro_cliente',
                        as: 'facturas'
                    }
                },
                {
                    $match: {
                        facturas: { $eq: [] }
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

            setCachedData('clientes_sin_facturas', clientesSinFacturas);
            return c.json(clientesSinFacturas);
        } catch (error) {
            return c.json({ error: 'Internal server error' }, 500);
        }
*/

                        
    }
};

