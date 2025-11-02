# Image Processing API: Node.js/TypeScript Assessment

A REST API for processing images and managing task-based workflows. The application generates image variants at specific resolutions from original sources (URLs or local files) and provides endpoints to track processing status and retrieve results.

---

## Features

- **Image Processing**: Generate multiple resolution variants (1024px, 800px) from a single image source
- **Task Management**: Track processing status with unique task IDs
- **Flexible Input**: Support for both HTTP(S) URLs and local file paths (Unix/Windows)
- **Format Preservation**: Maintains original image format (JPEG, PNG, WebP, GIF, TIFF)
- **Background Processing**: Non-blocking async image processing
- **Error Handling**: Comprehensive error tracking with detailed failure messages
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Database Indexing**: Optimized MongoDB queries with strategic indexes

---

## Tech Stack

- **Node.js** ≥ 18.0.0 + **TypeScript** 5.9.3
- **Express** 5.1.0 for REST API
- **MongoDB** with **Mongoose** 8.x for data persistence
- **Sharp** 0.33.x for high-performance image processing
- **Zod** for request validation
- **Jest** 30.x + **Supertest** for testing
- **Swagger/OpenAPI** 3.0 for API documentation

---

## Requirements

To build and run this project, ensure the following tools and versions are installed:

- **Node.js** ≥ 18.0.0 (for native fetch support and ES2020 features)
- **npm** ≥ 8.0.0
- **MongoDB** ≥ 5.0 (local or remote instance)
- **TypeScript** ≥ 5.9.0
- **Sharp** ≥ 0.33.0 (image processing library)

Optional (for development):
- **MongoDB Compass** - GUI for database inspection
- **Postman** - API testing (alternatively use Swagger UI)

---

## Getting Started

### Install dependencies:
```bash
npm install
```

### Configure environment:
You can configure via **.env** or JSON fallback files:

**Option A — .env file**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/image_task_api
```

**Option B — JSON fallback files**
Create `src/config.development.json`, `src/config.test.json`, or `src/config.production.json`:
```json
{
  "env": "development",
  "express": {
    "jsonLimit": "1kb",
    "requestTimeout": 30000
  },
  "cors": {
    "origin": "http://localhost:3000"
  },
  "mongodb": {
    "uri": "mongodb://localhost:27017/image_task_api"
  },
  "processing": {
    "sizes": [1024, 800],
    "output": "output"
  }
}

```
Your loader can resolve `src/config.${NODE_ENV}.json` if present, then fall back to env/defaults.

### Run in development:
```bash
npm run dev
```
The server will start on `http://localhost:3000` with auto-reload on file changes.

### Build for production:
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist/` folder.

### Run in production:
```bash
npm start
```

### API Documentation:
Access interactive Swagger UI at:
- **Development**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

---

## API Endpoints

### POST `/tasks`
Create a new image processing task.

**Request:**
```json
{
  "source": "https://example.com/image.jpg"
}
```

**Response (201):**
```json
{
  "taskId": "65d4a54b89c5e342b2c2c5f6",
  "status": "pending",
  "price": 25.5
}
```

### GET `/tasks/:taskId`
Retrieve task status and results.

**Response - Pending (200):**
```json
{
  "taskId": "65d4a54b89c5e342b2c2c5f6",
  "status": "pending",
  "price": 25.5
}
```

**Response - Completed (200):**
```json
{
  "taskId": "65d4a54b89c5e342b2c2c5f6",
  "status": "completed",
  "price": 25.5,
  "images": [
    {
      "resolution": "1024",
      "path": "/output/sunset/1024/f322b730b287da77.jpg"
    },
    {
      "resolution": "800",
      "path": "/output/sunset/800/202fd8b3174a77.jpg"
    }
  ]
}
```

**Response - Failed (200):**
```json
{
  "taskId": "65d4a54b89c5e342b2c2c5f6",
  "status": "failed",
  "price": 25.5,
  "error": "Image processing failed: Failed to fetch image: 404 Not Found"
}
```

---

## Testing

### End-to-End (E2E) tests

There are two E2E modes: **Jest** and **Postman/Newman**.

**Jest E2E** (spawns the API on port 3001 and runs tests after the server is ready):
```bash
npm run test:e2e
# Internals:
# - test:e2e:server           => NODE_ENV=test PORT=3001 ts-node src/index.ts
# - test:e2e:wait-and-run     => wait-on tcp:3001 && jest --testPathPatterns=e2e --runInBand --detectOpenHandles --forceExit
```

**Postman/Newman E2E** (runs a Postman collection against the spawned server):
```bash
npm run test:e2e:postman
# Internals:
# - test:e2e:server              => NODE_ENV=test PORT=3001 ts-node src/index.ts
# - test:e2e:wait-and-run-newman => wait-on tcp:3001 && newman run src/test/e2e/postman_collection.json
```


The project includes comprehensive test coverage using **Jest** and **MongoDB Memory Server** for isolated testing.

### Run all tests:
```bash
npm test
```

### Run specific test suites:
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

### Test Structure:
- **Unit tests**: Services, utilities, validators (`src/test/unit/`)
- **Integration tests**: API endpoints, database operations (`src/test/integration/`)
- **Performance tests**: Index efficiency, query optimization

---

## Design Decisions & Architecture

### Layered Architecture
The project follows **separation of concerns** with distinct layers:

- **Models**: Data structure definitions and validation (MongoDB schemas)
- **Services**: Business logic and data transformation
- **Controllers**: HTTP request/response handling
- **Routes**: Endpoint definitions with middleware
- **Middleware**: Cross-cutting concerns (validation, errors, logging)

This approach improves **testability**, **maintainability**, and follows **SOLID principles**.

### Configuration Strategy
- **Environment variables** (`env.ts`): Runtime configuration (PORT, MONGODB_URI, NODE_ENV)
- **JSON files** (`config.{env}.json`): Application constants (sizes, limits, CORS)
- **Fallback chain**: ENV VAR → Config Default → Hardcoded Default

### Error Handling
- **Centralized middleware**: Consistent error responses across all endpoints
- **Validation errors**: Zod provides detailed field-level error messages
- **Processing errors**: Captured and stored in task records with descriptive messages
- **Development vs Production**: Stack traces only exposed in development

### Database Optimization
Strategic indexes for common query patterns:
- **Tasks**: `{ status: 1, createdAt: -1 }` for recent task queries
- **Images**: `{ taskId: 1, resolution: 1 }` for task-specific image lookup
- **Deduplication**: `{ md5: 1 }` for detecting duplicate images
- **Uniqueness**: `{ path: 1 }` unique index prevents duplicate file paths

### Background Processing
Image processing runs asynchronously to avoid blocking API responses:
1. Task created immediately with `pending` status
2. Processing happens in background job
3. Task updated to `completed` or `failed` based on outcome
4. Client polls task status endpoint for updates

---

## Database Operations

### Index Management
```bash
npm run indexes:create   # Create all indexes
npm run indexes:list     # List current indexes
npm run indexes:drop     # Drop all indexes
npm run indexes:stats    # Index stats
```

### Database Lifecycle
```bash
npm run db:drop          # Drop database: mongodb://localhost:27017/image_task_api
npm run db:reset         # Drop + recreate indexes
npm run db:seed          # Creates 50 sample tasks
```

---

## Production Deployment

### Prerequisites:
1. Compile TypeScript to JavaScript
2. Install only production dependencies
3. Set production environment variables

### Build and deploy:
```bash
# 1. Run tests
npm test

# 2. Build TypeScript
npm run build

# 3. Install production dependencies only
npm ci --omit=dev

# 4. Set environment variables
export NODE_ENV=production
export PORT=3000
export MONGODB_URI="mongodb://your-prod-server:27017/image_task_api_prod"

# 5. Start application
npm start
```

---

## Optimizations & Trade-offs

### Current Implementation:
- **In-memory background jobs**: Simple but doesn't survive restarts
- **Synchronous image processing**: Sequential processing of multiple resolutions
- **File system storage**: Direct writes to local disk

### Future Improvements:
1. **Job Queue (RabbitMQ/Bull/BullMQ)**: Offload image processing to a dedicated microservice on more powerful hardware. This prevents CPU-intensive tasks from blocking the web server and enables horizontal scaling of worker nodes.
2. **Authentication & Authorization**: Implement JWT or OAuth2 authentication to secure endpoints. Add role-based access control (RBAC) for different user permissions.
3. **Rate Limiting**: Add request throttling (e.g., 100 requests per hour per IP/user) to prevent API abuse and ensure fair resource allocation.
4. **Dynamic Pricing**: Calculate price after processing completes, based on actual CPU time consumed, disk space used, image dimensions, and processing complexity. Current pricing is random and assigned upfront.
5. **Smart Deduplication**: Before processing, check if the same source URL already exists in the database. If the remote file hasn't changed (via ETag or Last-Modified headers), return the existing task result as an alias, saving processing time and storage.
6. **Database Connection Resilience**: Implement automatic reconnection logic with exponential backoff when MongoDB connection drops. Add circuit breaker pattern to prevent cascading failures.
7. **Worker Processes**: Separate worker processes for CPU-intensive image processing
8. **Cloud Storage**: Amazon S3, Google Cloud Storage, or Cloudinary for distributed file storage
9. **CDN Integration**: Serve processed images through CDN for better performance and reduced bandwidth costs
10. **Image Optimization**: Support additional modern formats (AVIF, WebP) with quality/size trade-offs
11. **Caching Layer**: Redis for task status caching to reduce database load and improve response times
12. **Webhooks**: Notify clients when processing completes instead of requiring polling
13. **Batch Processing**: Process multiple images in a single request for bulk operations

---

## Author

**Christian Vandaele** - <christian@dotfx.net>
