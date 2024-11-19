import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { z } from "zod";
import { Cliente } from "../mongo.js";
import { getCachedData, setCachedData } from "../redis.js";
import { iClienteSchema } from "../zodModels.js";

const emptySchema = z.object({});

export const clientes = {
	route: createRoute({
		method: "get",
		path: "/clientes",
		params: emptySchema,
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(iClienteSchema),
					},
				},
				description: "Retrieve the clients",
			},
		},
	}),
	handler: async (c: Context) => {
		const cachedClientes = await getCachedData("clientes");
		if (cachedClientes) {
			return cachedClientes;
		}
		const clientes = await Cliente.find({}, { _id: 0, __v: 0 }).lean();
		setCachedData("clientes", clientes);
		for (const cliente of clientes) {
			setCachedData(
				`cliente:${cliente.nombre}:${cliente.apellido}`,
				cliente.nro_cliente
			);
			setCachedData(`cliente:${cliente.nro_cliente}`, cliente);
		}
		return clientes;
	},
};

const inputSchema = z.object({
	nombre: z
		.string()
		.default("Jacob")
		.openapi({
			param: {
				name: "nombre",
				in: "query",
			},
			example: "Jacob",
		}),
	apellido: z
		.string()
		.default("Cooper")
		.openapi({
			param: {
				name: "apellido",
				in: "query",
			},
			example: "Cooper",
		}),
});

export const cliente = {
	route: createRoute({
		method: "get",
		path: "/cliente",
		request: { query: inputSchema },
		responses: {
			200: {
				content: {
					"application/json": {
						schema: iClienteSchema,
					},
				},
				description: "Retrieve the client",
			},
		},
	}),
	handler: async (c: Context) => {
		const { nombre, apellido } = c.req.query();
		const nro_cliente = await getCachedData(`cliente:${nombre}:${apellido}`);
		if (!nro_cliente) {
			const cliente = await Cliente.findOne(
				{ nombre, apellido },
				{ _id: 0, __v: 0 }
			).lean();

			if (!cliente) {
				console.error(`Cliente ${nombre} ${apellido} not found`);
				return null;
			}

			setCachedData(`cliente:${nombre}:${apellido}`, cliente.nro_cliente);
			setCachedData(`cliente:${cliente.nro_cliente}`, cliente);
			return cliente;
		}
		const cliente = await getCachedData(`cliente:${nro_cliente}`);
		return cliente;
	},
};
