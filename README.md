# README del Proyecto

## Descripción

Este proyecto es una API RESTful construida con TypeScript y MongoDB, diseñada para gestionar clientes, facturas y productos. Permite realizar operaciones CRUD sobre estos recursos y proporciona vistas para obtener información específica, como productos no facturados y facturas ordenadas.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **TypeScript**: Superset de JavaScript que añade tipado estático.
- **MongoDB**: Base de datos NoSQL para almacenar datos.
- **Redis**: Almacenamiento en caché para mejorar el rendimiento de las consultas.
- **Hono**: Framework para construir APIs de manera sencilla y rápida.
- **Zod**: Biblioteca para la validación de esquemas de datos.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/EmiN364/TPE_BD2.git
   cd TPE_BD2
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno en un archivo `.env`:
   ```plaintext
   MONGODB_URI=<TU_URI_DE_MONGODB>
   REDIS_URL=<TU_URL_DE_REDIS>
   ```

4. Inicia la aplicación:
   ```bash
   npm install
   npm run dev
   ```

5. Abre tu navegador y visita `http://localhost:3000` para acceder a la API.

## Endpoints

### Clientes

- **GET /clientes**: Obtiene la lista de todos los clientes.
- **GET /cliente**: Obtiene un cliente específico por nombre y apellido.
- **POST /cliente**: Crea un nuevo cliente.
- **PUT /cliente/{nro_cliente}**: Actualiza un cliente existente.
- **DELETE /cliente/{nro_cliente}**: Elimina un cliente.

### Facturas

- **GET /facturas**: Obtiene todas las facturas de un cliente específico.
- **POST /factura**: Crea una nueva factura.

### Productos

- **GET /productos**: Obtiene la lista de todos los productos.
- **GET /productos-no-facturados**: Obtiene productos que no han sido facturados.
- **PUT /productos/{codigo_producto}**: Crea o actualiza un producto.

### Vistas

- **GET /facturas-ordenadas**: Obtiene facturas ordenadas por fecha.
- **GET /gastos-clientes**: Obtiene el total gastado por cada cliente.

## Carga de Datos

Para cargar datos desde archivos CSV, utiliza el endpoint `/load-data` con un método POST. Asegúrate de que los archivos CSV estén en la carpeta `src/datasets`.

---

```
npm install
npm run dev
```


