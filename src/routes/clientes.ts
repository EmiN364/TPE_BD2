import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { endTime, startTime } from "hono/timing";
import { z } from "zod";
import { Cliente } from "../mongo.js";
import { deleteCachedData, deleteClientQueriesCachedData, getCachedData, setCachedData } from "../redis.js";
import { iClienteSchema } from "../zodModels.js";

const emptySchema = z.object({});

export const clientes = {
	route: createRoute({
		method: "get",
		path: "/clientes",
		tags: ["1. Obtener los datos de los clientes junto con sus teléfonos."],
		summary: "Obtener los datos de los clientes junto con sus teléfonos.",
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
		return await Cliente.find({}, { _id: 0, __v: 0 }).lean();
	},
};

const inputSchema = z.object({
	nombre: z.string().default("Jacob"),
	apellido: z.string().default("Cooper"),
});

export const cliente = {
	route: createRoute({
		method: "get",
		path: "/cliente",
		tags: [
			"2. Obtener el/los teléfono/s y el número de cliente del cliente con nombre “Jacob” y apellido “Cooper”.",
		],
		summary:
			"Obtener el/los teléfono/s y el número de cliente del cliente con nombre “Jacob” y apellido “Cooper”.",
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
		if (nro_cliente) {
			return await getCachedData(`cliente:${nro_cliente}`);
		}

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
	},
};

export const createCliente = {
	route: createRoute({
		method: "post",
		path: "/cliente",
		tags: ["13. Implementar la funcionalidad que permita crear nuevos clientes, eliminar y modificar los ya existentes."],
		summary: "Crear un nuevo cliente",
		request: {
			body: {
				content: {
					"application/json": {
						schema: iClienteSchema,
					},
				},
			},
		},
		responses: {
			200: {
				description: "Create a new client",
			},
		},
	}),
	handler: async (c: Context) => {
		const cliente = await c.req.json();
		const newCliente = await Cliente.create(cliente);
		setCachedData(`cliente:${newCliente.nro_cliente}`, newCliente);
		setCachedData(
			`cliente:${newCliente.nombre}:${newCliente.apellido}`,
			newCliente.nro_cliente
		);

		deleteClientQueriesCachedData();

		return newCliente;
	},
};

export const updateCliente = {
	route: createRoute({
		method: "put",
		path: "/cliente/{nro_cliente}",
		tags: ["13. Implementar la funcionalidad que permita crear nuevos clientes, eliminar y modificar los ya existentes."],
		summary: "Modificar un cliente existente",
		request: {
			body: {
				content: {
					"application/json": {
						schema: iClienteSchema.omit({ nro_cliente: true }).partial(),
					},
				},
			},
			params: z.object({
				nro_cliente: z.coerce.number(),
			}),
		},
		responses: {
			200: {
				description: "Update a client",
			},
		},
	}),
	handler: async (c: Context) => {
		const cliente = await c.req.json();
		const { nro_cliente } = c.req.param();
		
		const oldClient = await Cliente.findOne({nro_cliente}).lean()
		if (!oldClient) {
			return null
		}
		const updatedCliente = await Cliente.findByIdAndUpdate(oldClient._id, cliente, { new: true, lean: true })

		if ((cliente.nombre && oldClient.nombre !== cliente.nombre) || (cliente.apellido && oldClient.apellido !== cliente.apellido)) {
			await Promise.all([
				deleteCachedData(`cliente:${oldClient.nombre}:${oldClient.apellido}`),
				setCachedData(`cliente:${cliente.nombre ?? oldClient.nombre}:${cliente.apellido ?? oldClient.apellido}`, cliente.nro_cliente)
			])
		}
		setCachedData(`cliente:${nro_cliente}`, updatedCliente);
		setCachedData(`cliente:${updatedCliente?.nombre}:${updatedCliente?.apellido}`, updatedCliente?.nro_cliente);
		deleteClientQueriesCachedData()
		
		return updatedCliente;
	},
};

export const deleteCliente = {
	route: createRoute({
		method: "delete",
		path: "/cliente/{nro_cliente}",
		tags: ["13. Implementar la funcionalidad que permita crear nuevos clientes, eliminar y modificar los ya existentes."],
		summary: "Eliminar un cliente existente",
		request: {
			params: z.object({
				nro_cliente: z.coerce.number(),
			}),
		},
		responses: {
			200: {
				description: "Delete a client",
			},
		},
	}),
	handler: async (c: Context) => {
		const { nro_cliente } = c.req.param();
		const deletedCliente = await Cliente.findOneAndDelete({ nro_cliente });
		await deleteCachedData(`cliente:${nro_cliente}`);
		await deleteCachedData(`cliente:${deletedCliente?.nombre}:${deletedCliente?.apellido}`);
		deleteClientQueriesCachedData();
		return deletedCliente;
	},
};


