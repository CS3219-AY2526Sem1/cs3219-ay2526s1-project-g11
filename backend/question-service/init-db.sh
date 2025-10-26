#!/bin/bash
set -e

# This script runs automatically on first container startup (when database is empty)
# It restores the seed data from the dump file
# Location: backend/question-service/init-db.sh

echo "🔍 Checking if database needs initialization..."

# Check if tables exist
TABLE_COUNT=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ "$TABLE_COUNT" -eq 0 ]; then
    echo "📦 Database is empty, restoring from seed data..."

    if [ -f /seed-initial.dump ]; then
        echo "📥 Restoring from seed-initial.dump..."
        pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl /seed-initial.dump

        echo "✅ Seed data restored successfully!"
        echo ""
        echo "📊 Database statistics:"
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT
  (SELECT COUNT(*) FROM questions) as questions_count,
  (SELECT COUNT(*) FROM topic_tags) as tags_count,
  (SELECT COUNT(*) FROM question_topic_tags) as relations_count;
"
    else
        echo "⚠️  Warning: /seed-initial.dump not found"
        echo "   Database will be empty. Create seed file with:"
        echo "   ./scripts/create-seed-from-pgdata.sh"
    fi
else
    echo "✅ Database already initialized (found $TABLE_COUNT tables)"
    echo "   Skipping seed restore"
fi