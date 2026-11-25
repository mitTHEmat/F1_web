import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Set DATABASE_URL in apps/api/.env or the environment.')
}

export const db = new Pool({ connectionString, connectionTimeoutMillis: 5000 })

db.on('error', (error) => {
  console.error('Idle database connection failed:', error)
})
