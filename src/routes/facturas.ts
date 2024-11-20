import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";
import { Cliente, Factura, Producto } from "../mongo.js";
import { EXPIRATION_TIME, getCachedData, setCachedData } from "../redis.js";
import { iClienteSchema, iFacturaSchema } from "../zodModels.js";

export const facturas = {
	/**
	 * 7. Listar los datos de todas las facturas que hayan sido compradas por el cliente de nombre
	 * "Kai" y apellido "Bullock".
	 */
	route: createRoute({
		method: "get",
		path: "/facturas",
		request: {
			query: z.object({
				nombre: z.string().default("Kai"),
				apellido: z.string().default("Bullock"),
			}),
		},
		description:
			"Listar los datos de todas las facturas que hayan sido compradas por el cliente de nombre 'Kai' y apellido 'Bullock'",
		tags: [
			"7. Listar los datos de todas las facturas que hayan sido compradas por el cliente de nombre 'Kai' y apellido 'Bullock'",
		],
		summary:
			"Listar los datos de todas las facturas que hayan sido compradas por el cliente de nombre 'Kai' y apellido 'Bullock'",
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(iFacturaSchema),
					},
				},
				description: "Retrieve the invoices",
			},
			404: {
				description: "Cliente not found",
			},
			500: {
				description: "Internal server error",
			},
		},
	}),
	handler: async (c: Context) => {
		const { nombre, apellido } = c.req.query();
		// check if cached
		let facturas = await getCachedData(`facturas:${nombre}:${apellido}`);
		if (facturas) {
			return facturas;
		}

		let nro_cliente = await getCachedData(`cliente:${nombre}:${apellido}`);
		if (!nro_cliente) {
			nro_cliente = (await Cliente.findOne({ nombre, apellido }))?.nro_cliente;
		}

		if (!nro_cliente) {
			console.error(`Cliente ${nombre} ${apellido} not found`);
			return null;
		}

		facturas = await Factura.find({ nro_cliente });
		setCachedData(`facturas:${nombre}:${apellido}`, facturas);
		return facturas;
	},
};

export const facturaPorMarca = {
	route: createRoute({
		method: "get",
		path: "/factura",
		tags: ["9. Listar los datos de todas las facturas que contengan productos de las marcas “Ipsum”."],
		summary: "Utilizando un aggregate",
		description: "Listar los datos de todas las facturas que contengan productos de las marcas “Ipsum”.",
		request: {
			query: z.object({
				marca: z.string().default("Ipsum"),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(iFacturaSchema),
					},
				},
				description: "Retrieve the invoices by brand",
			},
		},
	}),
	handler: async (c: Context) => {
		const { marca } = c.req.query();
		const facturas = await Factura.aggregate([
			{
				$lookup: {
					from: "productos",
					localField: "detalle.codigo_producto",
					foreignField: "codigo_producto",
					as: "productos_en_factura",
				},
			},
			{
				$match: {
					"productos_en_factura.marca": { $regex: marca, $options: "i" },
				},
			},
		]);
		return facturas;
	},
};

export const facturaPorMarca2 = {
	route: createRoute({
		method: "get",
		path: "/factura2",
		tags: ["9. Listar los datos de todas las facturas que contengan productos de las marcas “Ipsum”."],
		summary: "Utilizando dos queries",
		description: "Listar los datos de todas las facturas que contengan productos de las marcas “Ipsum”.",
		request: {
			query: z.object({
				marca: z.string().default("Ipsum"),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(iFacturaSchema),
					},
				},
				description: "Retrieve the invoices by brand",
			},
		},
	}),
	handler: async (c: Context) => {
		const { marca } = c.req.query();
		const marcas = await Producto.find(
			{ marca: { $regex: marca, $options: "i" } },
			{ codigo_producto: 1 }
		).distinct("codigo_producto");
		console.log(marcas);
		const facturas = await Factura.find({
			"detalle.codigo_producto": { $in: marcas },
		});
		return facturas;
	},
};
