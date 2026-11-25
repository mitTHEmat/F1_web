import express, { type ErrorRequestHandler } from 'express'
import { db } from './db.ts'

const app = express()
app.disable('x-powered-by')

app.get('/api/health', async (_request, response) => {
  try {
    await db.query('SELECT 1')
    response.json({ status: 'ok' })
  } catch (error) {
    console.error('Database health check failed:', error)
    response.status(503).json({ error: 'Database unavailable.' })
  }
})

app.get('/api/articles', async (request, response) => {
  const { q = '' } = request.query
  if (typeof q !== 'string' || q.length > 200 || q.includes('\0')) {
    response.status(400).json({ error: 'q must be plain text of at most 200 characters.' })
    return
  }

  const { rows } = await db.query(
    `SELECT slug, title, topic, summary, body
     FROM articles
     WHERE published_at <= now()
       AND strpos(lower(concat_ws(' ', title, topic, summary)), lower($1)) > 0
     ORDER BY published_at DESC, slug`,
    [q.trim()],
  )
  response.json({ articles: rows })
})

app.get('/api/articles/:slug', async (request, response) => {
  const { slug } = request.params
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    response.status(404).json({ error: 'Article not found.' })
    return
  }

  const { rows } = await db.query(
    `SELECT slug, title, topic, summary, body
     FROM articles
     WHERE slug = $1 AND published_at <= now()`,
    [slug],
  )
  if (rows.length === 0) {
    response.status(404).json({ error: 'Article not found.' })
    return
  }
  response.json({ article: rows[0] })
})

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found.' })
})

const handleError: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error)
    return
  }
  if (error instanceof URIError) {
    response.status(400).json({ error: 'Invalid request URL.' })
    return
  }
  console.error('API request failed:', error)
  response.status(500).json({ error: 'Request failed.' })
}
app.use(handleError)

const port = Number(process.env.PORT ?? '3001')
const host = process.env.HOST ?? '127.0.0.1'
const server = app.listen(port, host, () => {
  console.log(`Publishing API listening on http://${host}:${port}`)
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => void db.end())
  })
}
