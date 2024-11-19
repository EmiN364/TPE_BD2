/**
 * 12. Se necesita una vista que devuelva todos los productos que aún no han sido facturados
 */

import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { model } from "mongoose";

import { iProductoSchema } from "../zodModels.js";
import type { Context } from "hono";
import { ProductosNoFacturados } from "../views.js";

// Create a model for the view

export const query12 = {
    route: createRoute({
        method: 'get',
        path: '/query12',
        description:"Se necesita una vista que devuelva todos los productos que aún no han sido facturados.",
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(iProductoSchema),
                    },
                },
                description: 'Products that have not been invoiced',
            },
            500: {
                description: 'Internal server error',
            },
        },
    }),
    handler: async (c: Context) => {
        try {
            // Use the view directly
            const productos = await ProductosNoFacturados.find({});

            return productos;
        } catch (error) {
            console.error('Error finding products without invoices:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }
};

