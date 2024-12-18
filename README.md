# TPO BD2 - Grupo 2

## Integrantes

- **Candisano, Gonzalo** - 62.616
- **Garcia Lauberer, Federico Inti** - 61.374
- **Neme, Emilio Pablo** - 62.601
- **Perez de Gracia, Mateo** - 63.401


## Descripción

Este proyecto es una API construida con TypeScript y Hono, diseñada para gestionar clientes, facturas y productos. Permite realizar operaciones CRUD sobre estos recursos y proporciona vistas para obtener información específica, como productos no facturados y facturas ordenadas, cumpliendo con los requerimientos del trabajo práctico.

Como parte del diseño, elegimos que nuestra persistencia políglota esté conformada por MongoDB y Redis.

### MongoDB

Cumple el rol principal de almacenar nuestros objetos en forma de BSON, fácilmente mapeables en el contexto de nuestra API en Node. Además, utilizamos las vistas de MongoDB para implementar consultas específicas como obtener productos no facturados y facturas ordenadas por fecha, aprovechando el pipeline de agregación que nos ofrece.

### Redis

Cumple un rol complementario como caché de consultas frecuentes, almacenando temporalmente los resultados de operaciones costosas para mejorar el rendimiento. Implementamos un sistema de caché con tiempo de expiración de 24 horas para datos como:

- Lista de clientes
- Búsquedas de clientes por nombre/apellido
- Listados de facturas ordenadas
- Productos no facturados
- Productos facturados
- Clientes y Facturas
- Clientes sin Facturas
- Clientes con Facturas
- Facturas por cliente

Cuando se realizan modificaciones en los datos (crear/actualizar/eliminar), invalidamos las claves de caché relacionadas para mantener la consistencia.

### Aclaraciones

- Al no tener métodos para facturar, no se implementó el borrado del cache de métodos relacionados exclusivamente con las facturas.

- Para evidenciar las optimizaciones de rendimiento, en los response headers se puede ver el tiempo de respuesta de cada endpoint (server-timing).

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
   o
   ```bash
   npm install
   npm run build
   npm run start
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

### Productos

- **GET /productos-facturados**: Obtiene productos que no han sido facturados. 
- **PUT /productos/{codigo_producto}**: Crea o actualiza un producto.

### Vistas

- **GET /productos-no-facturados**: Obtiene productos que no han sido facturados.
- **GET /facturas-ordenadas**: Obtiene facturas ordenadas por fecha.

### Clientes y Facturas

- **GET /clientes-sin-facturas**: Obtiene clientes que no tienen facturas.
- **GET /clientes-con-facturas**: Obtiene clientes que tienen al menos una factura.
- **GET /clientes-y-facturas**: Obtiene todos los clientes con sus cantidades respectivas de facturas.

### Otras

- **GET /telefonos**: Obtiene cada teléfono junto con los datos del cliente.
- **GET /factura-por-marca**: Obtiene facturas filtradas por marca.
- **GET /factura-por-marca2**: Obtiene facturas filtradas por marca (implementación alternativa).
- **GET /gastos-clientes**: Obtiene información sobre los gastos de los clientes.
- **POST /load-data**: Carga datos iniciales desde archivos CSV.

## Carga de Datos

Para cargar datos desde archivos CSV, utiliza el endpoint `/load-data` con un método POST. Asegúrate de que los archivos CSV estén en la carpeta `src/datasets`.

---