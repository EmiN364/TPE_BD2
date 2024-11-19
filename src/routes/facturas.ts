import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";
import { Cliente, Factura } from "../mongo.js";
import { EXPIRATION_TIME, getCachedData, setCachedData } from "../redis.js";
import { iClienteSchema, iFacturaSchema } from "../zodModels.js";

export const facturas = {
    /**
     * 7. Listar los datos de todas las facturas que hayan sido compradas por el cliente de nombre
     * "Kai" y apellido "Bullock".
     */
    route: createRoute({
        method: 'get',
        path: '/facturas',
        request: {
            query: z.object({
                nombre: z.string(),
                apellido: z.string()
            })
        },
        description: "Listar los datos de todas las facturas que hayan sido compradas por el cliente de nombre 'Kai' y apellido 'Bullock'",
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(iFacturaSchema),
                    },
                },
                description: 'Retrieve the invoices',
            },
            404: {
                description: 'Cliente not found',
            },
            500: {
                description: 'Internal server error',
            },
        },
    }),
    handler: async (c:Context) => {
        const { nombre, apellido } = c.req.query();
		// check if cached
		let facturas = await getCachedData(`facturas:${nombre}:${apellido}`);

		if (!facturas) {
			console.log(`Facturas for ${nombre} ${apellido} not found in cache`);
			const cliente = await Cliente.findOne({ nombre, apellido });
			if (!cliente) {
				console.error(`Cliente ${nombre} ${apellido} not found`);
				return null;
			}
			console.log(`Cliente ${nombre} ${apellido} found: ${cliente.nro_cliente}`);
			facturas = await Factura.find({ nro_cliente: cliente.nro_cliente });
			setCachedData(
				`facturas:${nombre}:${apellido}`,
				facturas,
				EXPIRATION_TIME
			);
		} else {
			console.log(`Facturas for ${nombre} ${apellido} found in cache!`);
		}
		return facturas;
	},
};

export const facturaPorMarca = {
	route: createRoute({
		method: "get",
		path: "/factura",
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
				$match: { "productos_en_factura.marca": { $regex: marca, $options: "i" } },
			},
		]);
		return facturas;
	},
};
