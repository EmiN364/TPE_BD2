import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";
import { Cliente, Factura, FacturasOrdenadas, Producto } from "../mongo.js";
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
		const clienteKey = `cliente:${nombre}:${apellido}`;
		
		let nro_cliente = await getCachedData(clienteKey);
		
		if (!nro_cliente) {
			const cliente = await Cliente.findOne({ nombre, apellido });
			if (!cliente) {
				console.error(`Cliente ${nombre} ${apellido} not found`);
				return null;
			}
			nro_cliente = cliente.nro_cliente;
			await setCachedData(clienteKey, nro_cliente);
		}
	
		const facturasKey = `facturas:${nro_cliente}`;
		const cachedFacturas = await getCachedData(facturasKey);
		if (cachedFacturas) {
			return cachedFacturas;
		}
	
		const facturas = await Factura.find({ nro_cliente });
		await setCachedData(facturasKey, facturas);
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

export const facturasOrdenadas = {
	route: createRoute({
	  method: 'get',
	  path: '/facturas-ordenadas',
	  tags: ["11. Se necesita una vista que devuelva los datos de las facturas ordenadas por fecha."],
	  summary: "Se necesita una vista que devuelva los datos de las facturas ordenadas por fecha.",
	  params: z.object({}),
	  responses: {
		200: {
		  content: {
			'application/json': {
			  schema: z.array(iFacturaSchema),
			},
		  },
		  description: 'Retrieve invoices ordered by date',
		},
	  },
	}),
	handler: async () => {
	  const cachedFacturas = await getCachedData('facturas_ordenadas');
	  if (cachedFacturas) {
		return cachedFacturas;
	  }
  
	  const facturas = await FacturasOrdenadas.find({}).lean();
	  setCachedData('facturas_ordenadas', facturas);
	  return facturas;
	}
  }; 