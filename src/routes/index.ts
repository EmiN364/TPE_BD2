import { cliente, clientes, createCliente, deleteCliente, updateCliente } from "./clientes.js";
import { clientesConFacturas } from "./clientesConFacturas.js";
import { clientesSinFacturas } from "./clientesSinFacturas.js";
import { clientesYFacturas } from "./clientesYFacturas.js";
import { crearOModificarProducto } from "./crearOModificarProducto.js";
import { loadData } from "./data.js";
import { facturaPorMarca, facturaPorMarca2, facturas, facturasOrdenadas } from "./facturas.js";
import { gastosClientes } from "./gastosClientes.js";
import { productosFacturados } from "./productosFacturados.js";
import { productosNoFacturados } from "./productosNoFacturados.js";
import { telefonos } from "./telefonos.js";

export const routes = {
  loadData,
  clientes,
  cliente,
  telefonos,
  clientesConFacturas,
  clientesSinFacturas,
  clientesYFacturas,
  facturas,
  productosFacturados,
  facturaPorMarca,
  facturaPorMarca2,
  gastosClientes,
  facturasOrdenadas,
  productosNoFacturados,
  createCliente,
  updateCliente,
  deleteCliente,
  crearOModificarProducto,
}
 