INSERT INTO articles (slug, title, topic, summary, body, published_at)
VALUES
  (
    'read-the-street',
    'Read the street before reading the map',
    'Places',
    'A short guide to noticing the details that make a neighborhood distinct.',
    'Pick a familiar route and walk it at a different hour. Watch where people pause, which doors stay open, and how the light changes the corners you usually pass without looking.',
    '2025-01-02T12:00:00Z'
  ),
  (
    'start-a-notebook',
    'Start a notebook you can actually keep',
    'Practice',
    'An easy way to turn quick observations into a regular writing habit.',
    'Write down one thing you noticed each day and where you were when you noticed it. Give the notes a date so you can return to them later and see what keeps drawing your attention.',
    '2025-01-01T12:00:00Z'
  )
ON CONFLICT (slug) DO NOTHING;
