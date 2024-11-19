import { cliente, clientes } from "./clientes.js";
import { clientesConFacturas } from "./clientesConFacturas.js";
import { clientesYFacturas } from "./clientesYFacturas.js";
import { loadData } from "./data.js";
import { facturaPorMarca, facturas } from "./facturas.js";
import { gastosClientes } from "./gastosClientes.js";
import { productosFacturados } from "./productosFacturados.js";
import { telefonos } from "./telefonos.js";

export const routes = {
  cliente,
  clientes,
  clientesConFacturas,
  facturas,
  clientesYFacturas,
  gastosClientes,
  productosFacturados,
  telefonos,
  facturaPorMarca,
  loadData,
}
