import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { z } from "zod";
import { Producto } from "../mongo.js";
import { iProductoSchema } from "../zodModels.js";

export const crearOModificarProducto = {
  route: createRoute({
    method: "put",
    path: "/productos/{codigo_producto}",
    request: {
      body: {
        content: {
          "application/json": {
            schema: iProductoSchema.partial(), 
          },
        },
      },
      params: z.object({
        codigo_producto: z.coerce.number(), 
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              product: iProductoSchema,
            }),
          },
        },
        description: "Product successfully created or updated",
      },
      400: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Error in upserting product",
      },
    },
  }),
  handler: async (c: Context) => {
    try {
      const productData = await c.req.json(); 
      const { codigo_producto } = c.req.param(); 

      const updatedProduct = await Producto.findOneAndUpdate(
        { codigo_producto },
        { $set: productData }, 
        { new: true, upsert: true, lean: true } 
      );

      if (!updatedProduct) {
        return c.json({ message: "Product could not be created or updated" }, { status: 400 });
      }

      return updatedProduct;
    } catch (error) {
      console.error("Error upserting product:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return c.json({ message: "Failed to upsert product", error: errorMessage }, { status: 400 });
    }
  },
};

