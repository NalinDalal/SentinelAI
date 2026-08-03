# SentinelAI Architecture

## Overview

SentinelAI is an AI-powered phishing website detection platform that analyzes any website using multiple independent analysis engines, combines their outputs, and produces a final phishing verdict together with an explainable report.

## Architecture Pattern

The project follows **Clean Architecture** with four distinct layers:

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (Controllers, Guards, Pipes, Filters)      │
├─────────────────────────────────────────────┤
│           Application Layer                 │
│  (Use Cases, DTOs, Mappers)                 │
├─────────────────────────────────────────────┤
│           Domain Layer                      │
│  (Entities, Interfaces, Value Objects)      │
├─────────────────────────────────────────────┤
│           Infrastructure Layer              │
│  (Repositories, External Services, DB)      │
└─────────────────────────────────────────────┘
```

### Dependency Rule

Dependencies always point inward:
- Presentation depends on Application
- Application depends on Domain
- Infrastructure implements Domain interfaces

## Backend Architecture (NestJS)

### Module Structure

```
backend/src/
├── auth/                    # Authentication module
│   ├── controllers/         # AuthController
│   ├── services/            # AuthService
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── strategies/          # LocalStrategy, JwtStrategy
│   ├── dto/                 # LoginDto, RegisterDto
│   └── interfaces/          # AuthUser, JwtPayload
│
├── scan/                    # Scan module
│   ├── controllers/         # ScanController
│   ├── services/            # ScanService, ScanWorker
│   ├── dto/                 # CreateScanDto, ScanResponseDto
│   ├── interfaces/          # ScanResultInterface, ScanRepositoryInterface
│   └── scan-queue.module.ts # BullMQ queue configuration
│
├── analyzer/                # Analysis engines
│   ├── url-analyzer/        # URLAnalyzerService
│   ├── html-analyzer/       # HtmlAnalyzerService
│   ├── brand-detector/      # BrandDetectorService
│   ├── ocr-engine/          # OcrEngineService
│   ├── llm-analyzer/        # LlmAnalyzerService
│   └── risk-engine/         # RiskEngineService
│
├── scanner/                 # Web scraping infrastructure
│   ├── services/            # ScannerService (Playwright)
│   └── interfaces/          # ScannerInterface
│
├── history/                 # History module
│   ├── controllers/         # HistoryController
│   ├── services/            # HistoryService
│   └── dto/                 # History filters
│
├── dashboard/               # Dashboard module
│   ├── controllers/         # DashboardController
│   └── services/            # DashboardService
│
├── common/                  # Shared utilities
│   ├── decorators/          # Roles decorator, CurrentUser decorator
│   ├── filters/             # HttpExceptionFilter
│   ├── interceptors/        # LoggingInterceptor, ResponseInterceptor
│   ├── pipes/               # ValidationPipe
│   ├── guards/              # Global guards
│   └── utils/               # Logger utility
│
├── database/                # Database layer
│   ├── prisma.module.ts     # PrismaModule
│   └── prisma.service.ts    # PrismaService
│
├── modules/                 # NestJS module definitions
│   ├── app.module.ts        # Root module
│   └── bullmq.module.ts     # BullMQ configuration
│
└── main.ts                  # Application entry point
```

### Domain Interfaces

Each analysis engine has a corresponding interface in the domain layer:

| Interface | Implementation | Purpose |
|-----------|---------------|---------|
| `IUrlAnalyzer` | `UrlAnalyzerService` | URL structure and risk analysis |
| `IHtmlAnalyzer` | `HtmlAnalyzerService` | DOM structure and script analysis |
| `IBrandDetector` | `BrandDetectorService` | Brand impersonation detection |
| `IOcrEngine` | `OcrEngineService` | OCR text extraction |
| `ILlmAnalyzer` | `LlmAnalyzerService` | LLM-based reasoning |
| `IRiskEngine` | `RiskEngineService` | Risk score calculation |
| `IScanner` | `ScannerService` | Web crawling and data collection |
| `IScanRepository` | `ScanService` | Scan data persistence |

## Frontend Architecture (Next.js)

### Page Structure

```
frontend/src/app/
├── layout.tsx              # Root layout
├── page.tsx                # Landing page
├── globals.css             # Global styles
├── auth/
│   ├── login/page.tsx      # Login page
│   └── register/page.tsx   # Registration page
├── dashboard/
│   ├── layout.tsx          # Dashboard layout
│   └── page.tsx            # Dashboard home
├── scan/
│   ├── page.tsx            # New scan page
│   └── [id]/page.tsx       # Scan result page
├── history/
│   └── page.tsx            # Scan history page
└── api/
    └── [...path]/route.ts  # API proxy routes
```

### Component Structure

```
frontend/src/components/
├── ui/                     # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── progress.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── table.tsx
│   ├── alert.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── tabs.tsx
│   └── use-toast.ts
├── layout/
│   ├── sidebar.tsx
│   └── header.tsx
├── providers/
│   └── theme-provider.tsx
└── lib/
    ├── api-client.ts       # Axios HTTP client
    ├── api.ts              # API client instance
    ├── types.ts            # TypeScript interfaces
    └── utils.ts            # Utility functions
```

## Data Flow

### Scan Flow

```
User enters URL
    ↓
Frontend sends POST /api/scan
    ↓
Backend validates URL (Zod)
    ↓
Scan record created in DB (status: PENDING)
    ↓
BullMQ queue receives scan job
    ↓
ScanWorker processes the job:
    1. Crawl (Playwright) → HTML, DOM, Metadata, Screenshot
    2. URL Analysis → Risk score
    3. HTML Analysis → Risk score
    4. Brand Detection → Risk score
    5. OCR Engine → Risk score
    6. LLM Analyzer → Classification + confidence
    7. Risk Engine → Final combined score
    ↓
Scan record updated (status: COMPLETED)
    ↓
Frontend polls for results
    ↓
Dashboard displays verdict
```

### Risk Score Calculation

```
Final Score = weighted_average(
  llm_score * 0.35,
  url_score * 0.20,
  html_score * 0.20,
  ocr_score * 0.15,
  brand_score * 0.10
)

Verdict thresholds:
  0-24:   safe
  25-49:  suspicious
  50-69:  phishing
  70-100: high-risk
```

## Database Schema

### Core Entities

- **User**: Authentication, roles, audit trail
- **Scan**: Central entity linking all analysis results
- **Report**: Generated reports for scans
- **Domain**: Domain registration information
- **LLMResponse**: LLM request/response logging
- **Image**: Downloaded images from scans
- **OCRResult**: OCR extraction results
- **RiskScore**: Individual risk scores by source
- **AuditLog**: Security audit trail

## Security

- JWT authentication with Bearer tokens
- Role-based access control (USER, ADMIN)
- Password hashing with bcrypt (12 rounds)
- Input validation with Zod/class-validator
- Rate limiting via express-rate-limit
- Helmet for HTTP security headers
- CORS configuration
- SQL injection prevention via Prisma ORM
- XSS prevention via React escaping

## Deployment

### Docker Compose Services

| Service | Port | Purpose |
|---------|------|---------|
| backend | 3000 | NestJS API server |
| frontend | 3001 | Next.js application |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Cache and queue broker |
| minio | 9000 | S3-compatible object storage |
| nginx | 80/443 | Reverse proxy |

### Environment Variables

All sensitive configuration is managed via environment variables (see `.env.example`).

## Testing Strategy

- **Unit tests**: Jest for individual service testing
- **Integration tests**: Supertest for API endpoint testing
- **E2E tests**: Playwright for frontend testing
- **Coverage**: Istanbul for code coverage reporting

## CI/CD

GitHub Actions workflow for:
1. Backend tests and linting
2. Frontend type checking and linting
3. Docker image builds
4. (Optional) Deployment to staging/production