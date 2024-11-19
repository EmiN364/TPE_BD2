import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { z } from "zod";
import { Producto } from "../mongo.js";
import { iProductoSchema } from "../zodModels.js";

export const crearOModificarProducto = {
  route: createRoute({
    method: 'put',
    path: '/productos/:codigo_producto',

    request: {
        query: z.object({
            codigo_producto: z.string(),
            marca: z.string().optional(),
            nombre: z.string().optional(),
            descripcion: z.string().optional(),
            precio: z.string().optional(),
            stock: z.string().optional()
        })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
              product: iProductoSchema,
            }),
          },
        },
        description: 'Product successfully created or updated',
      },
      400: {
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: 'Error in upserting product',
      },
    },
  }),
  handler: async (c : Context) => {
    try {
      const { codigo_producto, marca, nombre, descripcion, precio, stock } = c.req.query();

      const updatedProduct = await Producto.findOneAndUpdate(
        { codigo_producto: parseInt(codigo_producto) },
        { 
          $set: { 
            marca, 
            nombre, 
            descripcion, 
            precio: parseFloat(precio || '0'), 
            stock: parseInt(stock || '0') 
          } 
        },
        { new: true, upsert: true, lean: true }
      );

      return updatedProduct;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return c.json({ message: 'Failed to upsert product', error: errorMessage }, { status: 400 });
    }
  },
};
