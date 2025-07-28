import { Database } from "bun:sqlite";

const db = new Database("metadata.db", { create: true });

export function setupSqlite() {
  // enable concurrency
  db.run("PRAGMA journal_mode = WAL;"); // concurrent readers
  db.run("PRAGMA busy_timeout = 5000;"); // wait 5 s for locks
}

db.exec(`
  CREATE TABLE IF NOT EXISTS pages (
    url TEXT PRIMARY KEY,
    text TEXT,
    http_status_code INT,
    crawled_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts
    USING fts5(text, content='pages', content_rowid='rowid');

  CREATE TRIGGER IF NOT EXISTS pages_ai
    AFTER INSERT ON pages BEGIN
      INSERT INTO pages_fts(rowid, text) VALUES (new.rowid, new.text);
    END;
`);

export function insertPage(url: string, text: string, status: number) {
  const upsert = db.prepare(`
  INSERT INTO pages (url, text, http_status_code)
  VALUES ($url, $text, $code)
  ON CONFLICT(url) DO UPDATE SET
    text             = $text,
    http_status_code = $code,
    crawled_at       = strftime('%s','now')
`);

  upsert.run({ $url: url, $text: text, $code: status });
}

// Full‑text search on the pages_fts virtual table
export function searchText(query: string, limit = 10) {
  if (!query.trim()) return [];

  // Build SQL with literal LIMIT because SQLite doesn’t accept ? for LIMIT.
  const sql = `
    SELECT p.url, p.text, p.crawled_at
    FROM pages_fts f
    JOIN pages p ON p.rowid = f.rowid
    WHERE f.pages_fts MATCH $q
    ORDER BY p.crawled_at DESC
    LIMIT ${limit}`;

  const stmt = db.prepare(sql);
  const rows = stmt.all({ $q: query });

  return rows.map((r: any) => ({
    url: r.url as string,
    text: r.text as string,
    crawled_at: Number(r.crawled_at),
  }));
}
