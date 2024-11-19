import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { prettyJSON } from 'hono/pretty-json'
import type { TimingVariables } from 'hono/timing'
import { endTime, setMetric, startTime, timing } from 'hono/timing'
import { loadAllData } from './loadData.js'
import { connectMongo } from './mongo.js'
import { connectRedis } from './redis.js'
import { routes } from './routes/index.js'

// Specify the variable types to infer the `c.get('metric')`:
type Variables = TimingVariables

const app = new OpenAPIHono<{ Variables: Variables }>()
app.use(timing());
app.use(prettyJSON())

connectMongo();
connectRedis();

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

// loadAllData().catch(err => console.log(err));

for (const route of Object.values(routes)) {
  app.openapi(route.route, async (c) => {
    startTime(c, 'db');
    const response = await route.handler();
    endTime(c, 'db');
    return c.json(response);
  })
}

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
