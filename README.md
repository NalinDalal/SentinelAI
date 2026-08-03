# SentinelAI

AI-powered phishing website detection platform that analyzes any website using multiple independent analysis engines, combines their outputs, and produces a final phishing verdict together with an explainable report.

## Architecture

SentinelAI follows Clean Architecture principles with four layers:

- **Domain**: Entities, interfaces, value objects
- **Application**: Use cases, DTOs, mappers
- **Infrastructure**: Implementations, external services, persistence
- **Presentation**: Controllers, guards, pipes, filters

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - ORM for PostgreSQL
- **BullMQ** - Job queue for scan processing
- **Playwright** - Browser automation for crawling
- **Tesseract.js** - OCR engine
- **Google Gemini** - LLM for analysis
- **Redis** - Caching and queue broker
- **Winston** - Structured logging

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Charting library

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **NGINX** - Reverse proxy
- **PostgreSQL** - Primary database
- **Redis** - Cache and queue
- **MinIO** - S3-compatible object storage

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Running with Docker

```bash
# Clone the repository
git clone <repository-url>
cd SentinelAI

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
# MinIO Console: http://localhost:9001
```

### Running Locally

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Scans
- `POST /api/scan` - Start a new scan
- `GET /api/scan/:id` - Get scan result
- `GET /api/scan/history` - Get scan history
- `GET /api/scan/dashboard` - Get dashboard data
- `GET /api/scan/export` - Export scan history as JSON

### Dashboard
- `GET /api/dashboard/overview` - Get overview statistics
- `GET /api/dashboard/trend` - Get risk trend data
- `GET /api/dashboard/top-domains` - Get top risky domains

### History
- `GET /api/history` - Get scan history with filters
- `GET /api/history/:id` - Get scan by ID
- `GET /api/history/export` - Export history (JSON/CSV)

## Project Structure

```
SentinelAI/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── scan/           # Scan module
│   │   ├── analyzer/       # Analysis engines
│   │   │   ├── url-analyzer/
│   │   │   ├── html-analyzer/
│   │   │   ├── brand-detector/
│   │   │   ├── ocr-engine/
│   │   │   ├── llm-analyzer/
│   │   │   └── risk-engine/
│   │   ├── scanner/        # Web scraping infrastructure
│   │   ├── history/        # History module
│   │   ├── dashboard/      # Dashboard module
│   │   ├── common/         # Shared utilities
│   │   ├── database/       # Prisma database service
│   │   └── modules/        # NestJS module definitions
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── test/
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
├── docker/                # Docker configurations
├── nginx/                 # NGINX configuration
├── docker-compose.yml     # Multi-container orchestration
└── .env.example           # Environment variables template
```

## License

MIT