import { cliente, clientes, createCliente, deleteCliente, updateCliente } from "./clientes.js";
import { clientesConFacturas } from "./clientesConFacturas.js";
import { clientesYFacturas } from "./clientesYFacturas.js";
import { loadData } from "./data.js";
import { gastosClientes } from "./gastosClientes.js";
import { crearOModificarProducto } from "./crearOModificarProducto.js";
import { productosFacturados } from "./productosFacturados.js";
import { productosNoFacturados } from "./productosNoFacturados.js";
import { clientesSinFacturas } from "./clientesSinFacturas.js";
import { facturaPorMarca, facturas } from "./facturas.js";
import { telefonos } from "./telefonos.js";
import { ProductosNoFacturados } from "../views.js";

export const routes = {
  cliente,
  clientes,
  clientesConFacturas,
  clientesSinFacturas,
  facturas,
  productosNoFacturados,
  clientesYFacturas,
  gastosClientes,
  productosFacturados,
  telefonos,
  crearOModificarProducto,
  facturaPorMarca,
  loadData,
  createCliente,
  updateCliente,
  deleteCliente,
}
 