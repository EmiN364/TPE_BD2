/**
 * 12. Se necesita una vista que devuelva todos los productos que aún no han sido facturados
 */

import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import type { Context } from "hono";
import { ProductosNoFacturados } from "../mongo.js";
import { iProductoSchema } from "../zodModels.js";
import { getCachedData } from "../redis.js";
import { setCachedData } from "../redis.js";

// Create a model for the view

export const productosNoFacturados = {
	route: createRoute({
		method: "get",
		path: "/productos-no-facturados",
		summary:
			"Se necesita una vista que devuelva todos los productos que aún no han sido facturados.",
		tags: [
			"12. Se necesita una vista que devuelva todos los productos que aún no han sido facturados.",
		],
		description:
			"Se necesita una vista que devuelva todos los productos que aún no han sido facturados.",
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(iProductoSchema),
					},
				},
				description: "Products that have not been invoiced",
			},
			500: {
				description: "Internal server error",
			},
		},
	}),
	handler: async (c: Context) => {
		// Use the view directly
		// cache
		const cachedProductos = await getCachedData("productos_no_facturados");
		if (cachedProductos) {
			return cachedProductos;
		}

		const productosNoFacturados = await ProductosNoFacturados.find({});
		setCachedData("productos_no_facturados", productosNoFacturados);
		return productosNoFacturados;
	},
};
