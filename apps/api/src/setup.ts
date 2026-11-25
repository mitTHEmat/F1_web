import { readFile } from 'node:fs/promises'
import { db } from './db.ts'

try {
  const schema = await readFile(new URL('../sql/001_articles.sql', import.meta.url), 'utf8')
  await db.query(schema)
  const seed = await readFile(new URL('../sql/seed.sql', import.meta.url), 'utf8')
  await db.query(seed)
  console.log('Article database is ready.')
} finally {
  await db.end()
}
