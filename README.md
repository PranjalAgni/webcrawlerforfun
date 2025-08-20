# Web Crawler

<img width="1026" height="645" alt="Image" src="https://github.com/user-attachments/assets/168feae7-99d1-4546-a979-ed053645ad52" />

A high-performance, distributed web crawler built with Bun and TypeScript, designed for crawling fitness and CrossFit related websites. Features Redis-based job queuing, SQLite storage with full-text search, and support for parallel processing.

Writing this on 20th august

## 🚀 Features

- **Distributed Crawling**: Uses Redis Streams for job queuing and worker coordination
- **Full-Text Search**: SQLite with FTS5 for fast text searching across crawled content
- **Parallel Processing**: Support for multiple worker processes via clustering
- **Progress Monitoring**: Real-time crawl progress tracking with visual indicators
- **Depth-Limited**: Configurable crawl depth (default: max 3 levels)
- **Rate Limiting**: Built-in request timeout and error handling
- **Data Persistence**: SQLite database with WAL mode for concurrent access

## 📋 Prerequisites

- [Bun](https://bun.sh/) runtime
- [Redis](https://redis.io/) server
- TypeScript 5.0+

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd webcrawler
```

2. Install dependencies:
```bash
bun install
```

3. Start Redis server:
```bash
redis-server
```

## 🎯 Usage

### Quick Start

1. **Add seed URLs and start crawling**:
```bash
bun run start
```

2. **Run with multiple workers** (recommended):
```bash
bun run cluster
```

3. **Monitor progress**:
```bash
bun run monitor
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run start` | Start crawler with seed URLs |
| `bun run cluster` | Run crawler with 4 parallel workers |
| `bun run monitor` | Display real-time crawling progress |
| `bun run reset` | Reset Redis queues and counters |

### Searching Crawled Data

Search through crawled content using full-text search:

```bash
bun run src/search.ts "crossfit games"
bun run src/search.ts "workout routines"
```

### Development Reset

Clean all data and start fresh:

```bash
./scripts/reset-dev.sh
```

## 🏗️ Architecture

### Core Components

- **`crawler.ts`**: Core crawling engine with HTTP client and HTML parsing
- **`worker.ts`**: Worker process that consumes URLs from Redis queue
- **`queue.ts`**: Redis Streams-based job queue management
- **`sqlite.ts`**: Database operations and full-text search
- **`monitor.ts`**: Progress tracking and metrics display
- **`cluster.ts`**: Multi-process worker management

### Data Flow

1. **Seeding**: Initial URLs are added to Redis queue from `seed.ts`
2. **Processing**: Workers fetch URLs from queue, crawl pages, and extract content
3. **Storage**: Page content and metadata stored in SQLite with FTS indexing
4. **Discovery**: New URLs discovered during crawling are added back to queue
5. **Search**: Full-text search available across all crawled content

### Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Queue**: Redis Streams
- **Database**: SQLite with FTS5
- **HTML Parsing**: Cheerio
- **Progress UI**: CLI Progress bars and Ora spinner

## 📊 Configuration

### Seed URLs

The crawler starts with fitness-focused seed URLs defined in `src/seed.ts`:

- CrossFit official sites
- HYROX competition sites
- Fitness blogs and media
- Reddit communities
- YouTube channels

### Crawler Settings

- **Timeout**: 6 seconds per request
- **Max Depth**: 3 levels deep
- **Workers**: 4 parallel processes (configurable in `cluster.ts`)
- **User Agent**: `PranjalsCustomCrawler/0.1`

## 🔍 Database Schema

### Pages Table
```sql
CREATE TABLE pages (
  url TEXT PRIMARY KEY,
  text TEXT,
  http_status_code INT,
  crawled_at INTEGER DEFAULT (strftime('%s','now'))
);
```

### Full-Text Search
- Virtual FTS5 table for fast text searching
- Automatic indexing on insert/update via triggers

## 📈 Monitoring

The monitor displays real-time metrics:

- **Processed**: Number of pages successfully crawled
- **Pending**: URLs waiting in Redis queue
- **Progress Bar**: Visual progress indication
- **Queue Length**: Current frontier size

## 🐛 Error Handling

- **Timeout Protection**: 6-second request timeout
- **Content Validation**: Only processes HTML responses
- **Graceful Failures**: Failed URLs logged but don't stop the crawler
- **Queue Acknowledgment**: Processed messages removed from Redis

## 🔧 Development

### Project Structure

```
src/
├── index.ts      # Entry point and seed URL loading
├── crawler.ts    # Core crawling logic
├── worker.ts     # Worker process implementation
├── cluster.ts    # Multi-worker management
├── queue.ts      # Redis queue operations
├── sqlite.ts     # Database operations
├── search.ts     # Full-text search CLI
├── monitor.ts    # Progress monitoring
├── redis.ts      # Redis connection
└── seed.ts       # Initial URLs configuration
```

### Adding New Seed URLs

Edit `src/seed.ts` and add URLs to the `SEED_URLS` array:

```typescript
export const SEED_URLS = [
  "https://example.com",
  // ... add your URLs here
];
```

### Customizing Crawl Depth

Modify the depth check in `src/worker.ts`:

```typescript
if (depth > 3) continue; // Change 3 to your desired max depth
```

## 📝 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]

---

Built with ❤️ using Bun, TypeScript, Redis, and SQLite
