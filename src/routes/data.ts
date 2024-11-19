import { createRoute } from "@hono/zod-openapi";
import { loadAllData } from "../loadData.js";
import { Cliente, Factura, Producto } from "../mongo.js";
import { flushAllCachedData } from "../redis.js";

export const loadData = {
	route: createRoute({
		method: "post",
		path: "/load-data",
		responses: {
			200: {
				description: "Data loaded successfully",
			},
		},
	}),
	handler: async () => {
		await cleanAll();
		await loadAllData();
	},
};

async function cleanAll() {
	await Cliente.deleteMany({});
	await Factura.deleteMany({});
	await Producto.deleteMany({});
	await flushAllCachedData();
}
