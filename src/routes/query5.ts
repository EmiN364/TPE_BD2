import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente, Factura } from "../mongo.js";
import { iClienteSchema } from "../zodModels.js";
import type { Context } from "hono";

/**
 * 5. Identificar todos los clientes que no tengan registrada ninguna factura.
 */
export const query5 = {
    route: createRoute({
        method: 'get',
        path: '/query5',
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
            const clientesConFacturas = await Factura.distinct('nro_cliente');
            
            const clientesSinFacturas = await Cliente.find({
                nro_cliente: { $nin: clientesConFacturas }
            });

            return clientesSinFacturas;
        } 
        catch (error) {
            console.error('Error finding clients without invoices:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }
};

