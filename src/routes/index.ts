import { ProductosNoFacturados } from "../views.js";
import { cliente, clientes, createCliente, deleteCliente, updateCliente } from "./clientes.js";
import { clientesConFacturas } from "./clientesConFacturas.js";
import { clientesSinFacturas } from "./clientesSinFacturas.js";
import { clientesYFacturas } from "./clientesYFacturas.js";
import { crearOModificarProducto } from "./crearOModificarProducto.js";
import { loadData } from "./data.js";
import { facturaPorMarca, facturaPorMarca2, facturas } from "./facturas.js";
import { facturasOrdenadas } from "./facturasOrdenadas.js";
import { gastosClientes } from "./gastosClientes.js";
import { productosFacturados } from "./productosFacturados.js";
import { productosNoFacturados } from "./productosNoFacturados.js";
import { telefonos } from "./telefonos.js";

export const routes = {
  cliente,
  clientes,
  clientesConFacturas,
  clientesSinFacturas,
  facturas,
  facturasOrdenadas,
  productosNoFacturados,
  clientesYFacturas,
  gastosClientes,
  productosFacturados,
  telefonos,
  crearOModificarProducto,
  facturaPorMarca,
  facturaPorMarca2,
  loadData,
  createCliente,
  updateCliente,
  deleteCliente
}
 