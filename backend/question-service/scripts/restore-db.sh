#!/bin/bash

# Database restore script
# Usage: ./scripts/restore-db.sh <backup-file>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore-db.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -1t ./db-backups/*.{sql,dump} 2>/dev/null | head -10 || echo "  (no backups found)"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="question-postgres"
DB_USER="postgres"
DB_NAME="questiondb"

if [[ ! -f "$BACKUP_FILE" ]]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Container $CONTAINER_NAME is not running"
    echo "   Start it with: docker compose up -d"
    exit 1
fi

echo "⚠️  WARNING: This will replace all data in the database!"
echo "   Container: $CONTAINER_NAME"
echo "   Database:  $DB_NAME"
echo "   Backup:    $BACKUP_FILE"
echo ""
read -p "Continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🔄 Restoring from: $BACKUP_FILE"

# Restore based on file type
if [[ "$BACKUP_FILE" == *.sql ]]; then
    echo "📥 Restoring SQL backup..."
    cat "$BACKUP_FILE" | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME
elif [[ "$BACKUP_FILE" == *.dump ]]; then
    echo "📥 Restoring compressed dump..."
    cat "$BACKUP_FILE" | docker exec -i $CONTAINER_NAME pg_restore \
        -U $DB_USER \
        -d $DB_NAME \
        --clean \
        --if-exists \
        --no-owner \
        --no-acl
else
    echo "❌ Unknown file format. Use .sql or .dump files"
    exit 1
fi

echo ""
echo "✅ Restore completed!"
echo ""
echo "📊 Database statistics:"
docker exec -t $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "
SELECT
  (SELECT COUNT(*) FROM questions) as questions_count,
  (SELECT COUNT(*) FROM topic_tags) as tags_count,
  (SELECT COUNT(*) FROM question_topic_tags) as relations_count;
"