CREATE TABLE IF NOT EXISTS articles (
  slug text PRIMARY KEY,
  title text NOT NULL,
  topic text NOT NULL,
  summary text NOT NULL,
  body text NOT NULL,
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS articles_publication_order
  ON articles (published_at DESC, slug)
  WHERE published_at IS NOT NULL;
