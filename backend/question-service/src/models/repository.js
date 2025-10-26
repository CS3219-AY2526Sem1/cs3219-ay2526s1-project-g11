// Postgres repository helpers for Questions
const { getPool } = require('../db');

/**
 * Fetch question rows (with aggregated tags) filtered by difficulty and tag slug.
 * Uses OFFSET sampling as an alternative to ORDER BY random() for large tables.
 */
async function fetchRandomByDifficultyAndTag({ difficulty, tag, size }) {
  const pool = getPool();

  // 1) Count matching distinct questions
  const countSql = `
    SELECT COUNT(DISTINCT q.id) AS cnt
    FROM questions q
    JOIN question_topic_tags qt ON qt.question_id = q.id
    JOIN topic_tags tt ON tt.id = qt.tag_id
    WHERE q.difficulty = $1::difficulty_enum
        AND tt.slug = $2
  `;
  const { rows: countRows } = await pool.query(countSql, [difficulty, tag]);
  const total = Number(countRows[0]?.cnt || 0);
  if (total === 0) return [];

  // 2) Pick up to "size" random offsets (bounded) without ORDER BY random() over the full set
  const n = Math.min(size, total);
  const offsets = [];
  for (let i = 0; i < n; i++) {
    offsets.push(Math.floor(Math.random() * total));
  }

  // 3) For each offset, fetch one question id (limit 1) deterministically (by primary key)
  // Note: This is approximate sampling and may repeat; we’ll de-duplicate IDs.
  const idSql = `
    SELECT q.id
    FROM questions q
    JOIN question_topic_tags qt ON qt.question_id = q.id
    JOIN topic_tags tt ON tt.id = qt.tag_id
    WHERE q.difficulty = $1::difficulty_enum
      AND tt.slug = $2
    GROUP BY q.id
    ORDER BY q.id
    OFFSET $3 LIMIT 1
  `;
  const ids = new Set();
  for (const off of offsets) {
    const { rows } = await pool.query(idSql, [difficulty, tag, off]);
    if (rows[0]?.id) ids.add(rows[0].id);
    if (ids.size === n) break;
  }
  if (ids.size === 0) return [];

  // 4) Fetch full records for the sampled IDs and aggregate tags
  const finalSql = `
    SELECT q.id,
           q.title,
           q.title_slug AS "titleSlug",
           q.difficulty,
           q.question,
           q.example_testcases AS "exampleTestcases",
           COALESCE(
             json_agg(
               DISTINCT jsonb_build_object('name', tt.name, 'slug', tt.slug)
             ) FILTER (WHERE tt.id IS NOT NULL), '[]'
           ) AS "topicTags"
    FROM questions q
    LEFT JOIN question_topic_tags qt ON qt.question_id = q.id
    LEFT JOIN topic_tags tt ON tt.id = qt.tag_id
    WHERE q.id = ANY($1::uuid[])
    GROUP BY q.id
  `;
  const { rows } = await pool.query(finalSql, [Array.from(ids)]);
  return rows;
}

module.exports = {
  fetchRandomByDifficultyAndTag,
};
