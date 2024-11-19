import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Cliente, Factura } from "../mongo.js";
import { getCachedData, setCachedData, EXPIRATION_TIME } from "../redis.js";
import { iClienteSchema, iFacturaSchema } from "../zodModels.js";
import type { Context } from "hono";

export const query7 = {
    /**
     * 7. Listar los datos de todas las facturas que hayan sido compradas por el cliente de nombre
     * "Kai" y apellido "Bullock".
     */
    route: createRoute({
        method: 'get',
        path: '/query7',
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
        // c is undifined
        console.log(c);
        const { nombre, apellido } = c.req.query();

        // check if cached
        let cliente = await getCachedData(`cliente:${nombre}:${apellido}`);
        
        if(!cliente){
            console.log(`Cliente ${nombre} ${apellido} not found in cache`);
            cliente = await Cliente.findOne({ nombre, apellido });
            setCachedData(`cliente:${nombre}:${apellido}`, cliente?.nro_cliente, EXPIRATION_TIME);
        }
        else {
            console.log(`Cliente ${nombre} ${apellido} found in cache! ${cliente}`);
        }


        if(!cliente){
            console.error(`Cliente ${nombre} ${apellido} not found`);
            return c.json([], 404);
        }

        console.log(`Cliente ${nombre} ${apellido} found: ${cliente.nro_cliente}`);

        const facturas = await Factura.find({ nro_cliente: cliente.nro_cliente });
        
        return facturas;
    }

};
