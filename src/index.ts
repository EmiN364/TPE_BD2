import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { prettyJSON } from 'hono/pretty-json'
import { loadAllData } from './loadData.js'
import { Cliente, connectMongo } from './mongo.js'
import { clientesRoute } from './routes/clientes.js'

const app = new OpenAPIHono()
app.use(prettyJSON())

connectMongo();

const port = 3000
console.log(`Server is running on http://localhost:${port}`)


// loadAllData().catch(err => console.log(err));

app.openapi(clientesRoute, async (c) => {
  const clientes = await Cliente.find();
  return c.json(clientes);
})

// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
})

app.get('/ui', swaggerUI({ url: '/doc' }))

serve({
  fetch: app.fetch,
  port
})
