import { useEffect, useState } from 'react'

type Article = {
  slug: string
  title: string
  topic: string
  summary: string
  body: string
}

type ArticleResult =
  | { query: string; articles: Article[] }
  | { query: string; error: true }

export default function App() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<ArticleResult>()
  const searchTerm = query.trim()

  useEffect(() => {
    const controller = new AbortController()

    async function loadArticles() {
      try {
        const params = new URLSearchParams({ q: searchTerm })
        const response = await fetch(`/api/articles?${params}`, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Article request failed: ${response.status}`)
        }
        const { articles }: { articles: Article[] } = await response.json()
        if (!controller.signal.aborted) {
          setResult({ query: searchTerm, articles })
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({ query: searchTerm, error: true })
        }
      }
    }

    const timer = window.setTimeout(() => void loadArticles(), searchTerm ? 250 : 0)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [searchTerm])

  const currentResult = result?.query === searchTerm ? result : undefined
  const visibleArticles = currentResult && 'articles' in currentResult
    ? currentResult.articles
    : []

  let status = 'Loading articles…'
  if (currentResult) {
    status = 'error' in currentResult
      ? 'Articles are currently unavailable.'
      : visibleArticles.length === 0 ? 'No matching articles.' : ''
  }

  return (
    <main>
      <header>
        <h1>Field Notes</h1>
        <p>Short essays on places and the practice of paying attention.</p>
      </header>

      <section aria-labelledby="articles-heading">
        <h2 id="articles-heading">Articles</h2>
        <label htmlFor="article-search">Search articles</label>
        <input
          id="article-search"
          type="search"
          maxLength={200}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <p role="status">{status}</p>
        {visibleArticles.map((article) => (
          <article key={article.slug}>
            <p className="topic">{article.topic}</p>
            <h3>{article.title}</h3>
            <p>{article.summary}</p>
            <details>
              <summary>Read article</summary>
              <p>{article.body}</p>
            </details>
          </article>
        ))}
      </section>
    </main>
  )
}
