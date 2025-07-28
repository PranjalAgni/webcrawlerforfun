#!/usr/bin/env bash
set -e

# --- 1. Reset SQLite -------------------------------------------------
DB_FILE="metadata.db"

if [ -f "$DB_FILE" ]; then
  echo "🗑️  Removing old $DB_FILE"
  rm "$DB_FILE"
fi

echo "🆕  Re‑creating schema"
bun run - <<'TS'
import { Database } from "bun:sqlite";

const db = new Database("metadata.db", { create: true });
db.run(`PRAGMA journal_mode = WAL;`);
db.exec(`
  CREATE TABLE pages (
    url TEXT PRIMARY KEY,
    text TEXT,
    http_status_code INT,
    crawled_at INTEGER DEFAULT (strftime('%s','now'))
  );
  CREATE VIRTUAL TABLE pages_fts
    USING fts5(text, content='pages', content_rowid='rowid');
  CREATE TRIGGER pages_ai AFTER INSERT ON pages
    BEGIN INSERT INTO pages_fts(rowid, text) VALUES (new.rowid, new.text); END;
  CREATE TRIGGER pages_au AFTER UPDATE ON pages
    BEGIN INSERT INTO pages_fts(rowid, text) VALUES (new.rowid, new.text); END;
`);
console.log("✅  SQLite schema ready");
TS

# --- 2. Reset Redis --------------------------------------------------
echo "♻️  Flushing Redis queues & counters"
redis-cli <<'RC'
DEL frontier crawler:processed
XGROUP DESTROY frontier crawlers
RC

echo "🎉  Dev environment is clean. Ready for a fresh crawl!"
