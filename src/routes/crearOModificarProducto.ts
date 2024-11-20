import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { z } from "zod";
import { Producto } from "../mongo.js";
import { iProductoSchema } from "../zodModels.js";

export const crearOModificarProducto = {
  route: createRoute({
    method: "put",
    path: "/productos/{codigo_producto}",
    tags: ["14. Implementar la funcionalidad que permita crear nuevos productos y modificar los ya existentes. Tener en cuenta que el precio de un producto es sin IVA."],
    summary: "Crear un nuevo producto o modificar uno existente",
    description: "Crear un nuevo producto o modificar uno existente. Tener en cuenta que el precio de un producto es sin IVA.",
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
      const productData = await c.req.json(); 
      const { codigo_producto } = c.req.param(); 

      const updatedProduct = await Producto.findOneAndUpdate(
        { codigo_producto },
        { $set: productData }, 
        { new: true, upsert: true, lean: true } 
      );

      if (!updatedProduct) {
        return null;
      }

      return updatedProduct;
  },
};

