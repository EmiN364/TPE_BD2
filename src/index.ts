import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { run } from './mongo.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

// run().catch(err => console.log(err));

serve({
  fetch: app.fetch,
  port
})
