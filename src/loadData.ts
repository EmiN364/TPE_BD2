// Read from csv
// Insert into mongo

import csv from "csv-parser";
import * as fs from "fs";
import { Cliente, Factura, Producto, type ICliente, type IDetalle, type IFactura, type IProducto, type ITelefono } from "./mongo.js";

export async function loadData(path: string, func: (data: any[]) => void) {
	return new Promise((resolve, reject) => {
		const data_array: any[] = [];
		fs.createReadStream(path)
			.pipe(csv({ separator: ";" }))
			.on("data", (data) => {
				console.log(data);
				data_array.push(data);
			})
			.on("close", () => {
				console.log("Done. Data loaded: ", data_array.length);
				func(data_array);
				resolve(true);
			})
			.on("error", (err) => {
				reject(err);
			});
	});
}

export async function loadClientes() {
	await loadData("src/datasets/e01_cliente.csv", async (clientes: ICliente[]) => await Cliente.insertMany(clientes));
}

export async function loadTelefonos() {
	await loadData("src/datasets/e01_telefono.csv", async (telefonos: (ITelefono & { nro_cliente: number })[]) => {
		await Promise.all(
			telefonos.map(async (telefono) => {
				await Cliente.updateOne({ nro_cliente: telefono.nro_cliente }, { $push: { telefonos: telefono } });
			})
		);
	});
}

export async function loadProductos() {
	await loadData("src/datasets/e01_producto.csv", async (productos: IProducto[]) => await Producto.insertMany(productos));
}

export async function loadFacturas() {
	await loadData("src/datasets/e01_factura.csv", async (facturas: IFactura[]) => {
		const clientes = await Cliente.find();
		await Promise.all(
			facturas.map(async (factura) => {
				const cliente = clientes.find((c) => c.nro_cliente === factura.nro_cliente);
			if (cliente) {
				factura.idCliente = cliente._id;
			}
				await Factura.create(factura);
			})
		);
	});
}

export async function loadDetalles() {
	await loadData("src/datasets/e01_detalle_factura.csv", async (detalles: IDetalle[]) => {
		const productos = await Producto.find();
		await Promise.all(
			detalles.map(async (detalle) => {
				const producto = productos.find((p) => p.codigo_producto === detalle.codigo_producto);
				if (producto) {
					detalle.idProducto = producto._id;
				}
				await Factura.updateOne({ nro_factura: detalle.nro_factura }, { $push: { detalle: detalle } });
			})
		);
	});
}

export async function loadAllData() {
	await loadClientes();
	await loadTelefonos();
	await loadProductos();
	await loadFacturas();
	await loadDetalles();
}
