#!/bin/bash

# Database backup script
# Usage: ./scripts/backup-db.sh [backup-name]

set -e

BACKUP_NAME=${1:-"backup-$(date +%Y%m%d-%H%M%S)"}
CONTAINER_NAME="question-postgres"
DB_USER="postgres"
DB_NAME="questiondb"
BACKUP_DIR="./db-backups"

mkdir -p "$BACKUP_DIR"

echo "🔄 Creating backup: $BACKUP_NAME"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Container $CONTAINER_NAME is not running"
    echo "   Start it with: docker compose up -d"
    exit 1
fi

# Create SQL dump
echo "📦 Dumping to SQL format..."
docker exec -t $CONTAINER_NAME pg_dump \
    -U $DB_USER \
    -d $DB_NAME \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    > "$BACKUP_DIR/$BACKUP_NAME.sql"

# Create compressed dump
echo "📦 Creating compressed dump..."
docker exec -t $CONTAINER_NAME pg_dump \
    -U $DB_USER \
    -d $DB_NAME \
    -Fc \
    --no-owner \
    --no-acl \
    > "$BACKUP_DIR/$BACKUP_NAME.dump"

echo ""
echo "✅ Backup completed:"
echo "   SQL:  $BACKUP_DIR/$BACKUP_NAME.sql"
echo "   Dump: $BACKUP_DIR/$BACKUP_NAME.dump"
echo ""
echo "📊 Database statistics:"
docker exec -t $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "
SELECT
  (SELECT COUNT(*) FROM questions) as questions_count,
  (SELECT COUNT(*) FROM topic_tags) as tags_count,
  (SELECT COUNT(*) FROM question_topic_tags) as relations_count;
"