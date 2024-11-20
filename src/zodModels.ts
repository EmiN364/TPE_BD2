import { z } from "zod"

export const iTelefonoSchema = z.object({
  codigo_area: z.string(),
  nro_telefono: z.string(),
  tipo: z.string()
})

export const iDetalleSchema = z.object({
  nro_factura: z.number(),
  nro_item: z.number(),
  cantidad: z.number(),
  codigo_producto: z.number(),
})

export const iProductoSchema = z.object({
  codigo_producto: z.number(),
  marca: z.string(),
  nombre: z.string().optional(),
  descripcion: z.string(),
  precio: z.number(),
  stock: z.number()
})

export const iClienteSchema = z.object({
  nro_cliente: z.number(),
  nombre: z.string(),
  apellido: z.string(),
  direccion: z.string(),
  activo: z.number(),
  telefonos: z.array(iTelefonoSchema)
})

export const iFacturaSchema = z.object({
  nro_factura: z.number(),
  fecha: z.date(),
  total_sin_iva: z.number(),
  iva: z.number(),
  total_con_iva: z.number(),
  nro_cliente: z.number(),
  detalle: z.array(iDetalleSchema)
})
