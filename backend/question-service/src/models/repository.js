// Postgres repository helpers for Questions
const { getPool } = require('../db');

async function getTagIdsBySlugs(slugs) {
    if (!slugs || slugs.length === 0) return [];
    const pool = getPool();

    const sql = `
    SELECT id, slug
    FROM topic_tags
    WHERE slug = ANY($1::text[])
  `;
    const { rows } = await pool.query(sql, [slugs]);
    return rows;
}

async function linkQuestionTags(questionId, tagIds) {
    if (!tagIds || tagIds.length === 0) return;
    const pool = getPool();

    const values = tagIds.map(tagId => `('${questionId}', '${tagId}')`).join(', ');
    const sql = `INSERT INTO question_topic_tags (question_id, tag_id) VALUES ${values}`;
    await pool.query(sql);
}

/**
 * Fetch question rows (with aggregated tags) filtered by difficulty and tag slug.
 * Uses OFFSET sampling as an alternative to ORDER BY random() for large tables.
 */
async function fetchRandomByDifficultyAndTags({ difficulty, tags, size }) {
    const pool = getPool();

    const tagList = Array.isArray(tags) ? tags : [tags];
    if (tagList.length === 0) return [];

    // 1) Select questions and count how many tags each matches
    const baseSql = `
    SELECT
      q.id,
      q.title,
      q.title_slug AS "titleSlug",
      q.difficulty,
      q.question,
      q.example_testcases AS "exampleTestcases",
      COUNT(DISTINCT tt.slug) AS "matchCount",
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('name', tt.name, 'slug', tt.slug)
        ) FILTER (WHERE tt.id IS NOT NULL), '[]'
      ) AS "topicTags"
    FROM questions q
    LEFT JOIN question_topic_tags qt ON qt.question_id = q.id
    LEFT JOIN topic_tags tt ON tt.id = qt.tag_id
    WHERE q.difficulty = $1::difficulty_enum
      AND (tt.slug IS NULL OR tt.slug = ANY($2::text[]))
    GROUP BY q.id
    HAVING COUNT(DISTINCT tt.slug) > 0
    ORDER BY "matchCount" DESC, RANDOM()
    LIMIT $3
  `;

    const { rows } = await pool.query(baseSql, [difficulty, tagList, size]);
    return rows;
}

/**
 * Fetch all topic tags
 */
async function fetchTopicTags() {
    const pool = getPool();
    const sql = `
        SELECT tt.id, tt.name, tt.slug
        FROM topic_tags tt
        ORDER BY tt.name
    `;
    const { rows } = await pool.query(sql);
    return rows;
}

async function fetchQuestionById(id) {
    const pool = getPool();

    const sql = `
        SELECT
            q.id, q.title, q.title_slug, q.difficulty, q.question, q.example_testcases,
            json_agg(
                    json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
            ) AS topic_tags
        FROM questions q
                 LEFT JOIN question_topic_tags qt ON q.id = qt.question_id
                 LEFT JOIN topic_tags t ON qt.tag_id = t.id
        WHERE q.id = $1
        GROUP BY q.id;
    `;

    const { rows } = await pool.query(sql, [id]);
    if (rows.length === 0) throw new Error('Question not found');

    // If question has no tags, topic_tags may be [null]; filter that out
    const question = rows[0];
    question.topic_tags = question.topic_tags?.filter(t => t && t.id) || [];

    return question;
}

/** Create a new question (only with valid tags) */
async function createQuestion({ title, titleSlug, difficulty, question, exampleTestcases, topicTags }) {
    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const slugs = topicTags?.map(t => t.slug) || [];
        const tagRows = await getTagIdsBySlugs(slugs);

        // ensure all tags exist
        if (tagRows.length !== slugs.length) {
            const foundSlugs = tagRows.map(t => t.slug);
            const missing = slugs.filter(s => !foundSlugs.includes(s));
            throw new Error(`Invalid topic tags: ${missing.join(', ')}`);
        }

        const qSql = `
      INSERT INTO questions (title, title_slug, difficulty, question, example_testcases)
      VALUES ($1, $2, $3::difficulty_enum, $4, $5)
      RETURNING id;
    `;
        const { rows } = await client.query(qSql, [title, titleSlug, difficulty, question, exampleTestcases]);
        const questionId = rows[0].id;

        await linkQuestionTags(questionId, tagRows.map(t => t.id));

        await client.query('COMMIT');
        return { id: questionId, title, difficulty, topicTags };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/** Update question + topic tags */
async function updateQuestion(id, { title, titleSlug, difficulty, question, exampleTestcases, topicTags }) {
    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const slugs = topicTags?.map(t => t.slug) || [];
        const tagRows = await getTagIdsBySlugs(slugs);

        if (tagRows.length !== slugs.length) {
            const foundSlugs = tagRows.map(t => t.slug);
            const missing = slugs.filter(s => !foundSlugs.includes(s));
            throw new Error(`Invalid topic tags: ${missing.join(', ')}`);
        }

        const updateSql = `
      UPDATE questions
      SET title = $1, title_slug = $2, difficulty = $3::difficulty_enum,
          question = $4, example_testcases = $5
      WHERE id = $6
      RETURNING *;
    `;
        const { rows } = await client.query(updateSql, [title, titleSlug, difficulty, question, exampleTestcases, id]);
        if (rows.length === 0) throw new Error('Question not found');

        // Clear old mappings, reinsert new ones
        await client.query(`DELETE FROM question_topic_tags WHERE question_id = $1`, [id]);
        await linkQuestionTags(id, tagRows.map(t => t.id));

        await client.query('COMMIT');
        return { ...rows[0], topicTags };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/** Delete question and its tag mappings */
async function deleteQuestion(id) {
    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // First, delete mappings
        await client.query(`DELETE FROM question_topic_tags WHERE question_id = $1`, [id]);

        // Then delete the question
        const { rowCount } = await client.query(`DELETE FROM questions WHERE id = $1`, [id]);
        if (rowCount === 0) throw new Error('Question not found');

        await client.query('COMMIT');
        return { success: true };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    fetchRandomByDifficultyAndTags,
    fetchTopicTags,
    fetchQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
};
