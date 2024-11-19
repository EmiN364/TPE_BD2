import * as dotenv from "dotenv";
import { connect, model, Schema, Types } from "mongoose";
dotenv.config();

export interface ICliente {
	nro_cliente: number;
	nombre: string;
	apellido: string;
	direccion: string;
	activo: number;
	telefonos: ITelefono[];
}

export interface ITelefono {
	codigo_area: string;
	nro_telefono: string;
	tipo: string;
}

export interface IFactura {
	nro_factura: number;
	fecha: Date;
	total_sin_iva: number;
	iva: number;
	total_con_iva: number;
	nro_cliente: number;
	idCliente?: Types.ObjectId;
	detalle: IDetalle[];
}

export interface IDetalle {
	nro_factura: number;
	nro_item: number;
	cantidad: number;
	codigo_producto: number;
	idProducto?: Types.ObjectId;
}

export interface IProducto {
	codigo_producto: number;
	marca: string;
	nombre?: string;
	descripcion: string;
	precio: number;
	stock: number;
}

const telefonoSchema = new Schema<ITelefono>({
	codigo_area: { type: String, required: true },
	nro_telefono: { type: String, required: true },
	tipo: { type: String, required: true, enum: ["C", "F"] },
});

const clienteSchema = new Schema<ICliente>({
	nro_cliente: { type: Number, required: true, unique: true },
	nombre: { type: String, required: true },
	apellido: { type: String, required: true },
	direccion: { type: String, required: true },
	activo: { type: Number, required: true },
	telefonos: { type: [telefonoSchema], required: true },
}).index({ nro_cliente: 1 }, { unique: true });

const detalleSchema = new Schema<IDetalle>({
	nro_item: { type: Number, required: true },
	cantidad: { type: Number, required: true },
	codigo_producto: { type: Number, required: true },
	idProducto: { type: Schema.Types.ObjectId, ref: "Producto", required: false },
});

const facturaSchema = new Schema<IFactura>({
	nro_factura: { type: Number, required: true, unique: true },
	fecha: { type: Date, required: true },
	total_sin_iva: { type: Number, required: true },
	iva: { type: Number, required: true },
	total_con_iva: { type: Number, required: true },
	nro_cliente: { type: Number, required: true },
	idCliente: { type: Schema.Types.ObjectId, ref: "Cliente", required: false },
	detalle: { type: [detalleSchema], required: true },
}).index({ nro_factura: 1 }, { unique: true });

const productoSchema = new Schema<IProducto>({
	codigo_producto: { type: Number, required: true, unique: true },
	marca: { type: String, required: true },
	nombre: { type: String, required: false },
	descripcion: { type: String, required: true },
	precio: { type: Number, required: true },
	stock: { type: Number, required: true },
}).index({ codigo_producto: 1 }, { unique: true });

const Cliente = model<ICliente>("Cliente", clienteSchema);
const Factura = model<IFactura>("Factura", facturaSchema);
const Producto = model<IProducto>("Producto", productoSchema);

async function connectMongo() {
	await connect(process.env.MONGODB_URI as string);
}

export { Cliente, connectMongo, Factura, Producto };
