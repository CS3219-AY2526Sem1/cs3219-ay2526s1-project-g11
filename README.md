# PeerPrep: Real-Time Collaborative Technical Interview Platform

**CS3219 Software Engineering Principles and Patterns (AY2526S1) - Group G11**

PeerPrep is a comprehensive technical interview preparation platform that connects students for real-time collaborative problem solving. The system matches users based on difficulty level and topic, and provides a shared coding workspace with live synchronisation to enhance the learning experience.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Services Overview](#services-overview)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Overview

PeerPrep addresses the challenge of technical interview preparation by creating a peer-matching platform where students can practice together in real-time. The platform automatically matches users based on their selected difficulty level and topic, and establishes a shared coding environment.

The system is built as a microservices architecture with independent services handling user management, peer matching, question retrieval, and real-time collaboration. This design enables scalability, independent deployment, and clear separation of concerns.

## Features

### Core Features (Must-Have)

**User Management (M1):** The User Service provides comprehensive user authentication and profile management. Users can register with email and password, log in to receive JWT tokens, manage their profiles, and track their practice statistics. The service includes role-based access control with admin privileges for user management.

**Intelligent Peer Matching (M2):** The Matching Service implements a sophisticated queue-based algorithm that pairs users based on selected difficulty level and topic. The system maintains separate queues for each difficulty-topic combination, implements timeout-based expansion to improve match quality, and notifies matched users to initiate collaboration sessions.

**Question Repository (M3):** The Question Service provides a comprehensive database of technical interview questions organised by difficulty level (Easy, Medium, Hard) and topic (Array, String, Graph, etc.). Users can browse questions, filter by preferences, and access detailed problem descriptions with example test cases.

**Real-Time Collaboration (M4):** The Collaboration Service enables real-time code editing with automatic synchronisation across clients using WebSocket connections. The service implements Operational Transform (OT) for conflict-free concurrent editing, maintains session state, and provides integrated chat functionality for peer communication.

**User Interface (M5):** The frontend provides an intuitive React-based interface with Monaco Editor for code editing, real-time chat, problem display, and user dashboard. The interface supports responsive design and includes features for matching, session management, and progress tracking.

**Containerised Deployment (M6):** All services are containerised using Docker and can be deployed locally using Docker Compose or to cloud platforms using Kubernetes manifests and CI/CD pipelines.

### Nice-to-Have Features

**User Profile:** Users can track their personal information and progress using the profiles page, improving usability.

**Change Password:** Users can change their passwords to ensure consistent security.

**Improved Communication:** A live chat is included in each session for users to communicate with each other, allowing for the code editor and communication to be in two separate channels and improving UX during collaboration.

**Automated Testing and CI/CD:** GitHub Actions workflows and GCP triggers automatically test, build, and deploy services on code changes. The system includes unit tests, integration tests, and deployment automation for both development and production environments.

## Architecture

### System Architecture Overview

The PeerPrep platform follows a microservices architecture with clear separation of concerns. Each service handles a specific domain and communicates with others through well-defined APIs and WebSocket connections.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│            Deployed on Vercel with Auto CI/CD               │
└──────────────┬──────────────────────────────────────────────┘
               │
        ┌──────┴─────────┬──────────────┬──────────────┐
        │                │              │              │
        ▼                ▼              ▼              ▼
    ┌────────┐    ┌──────────┐    ┌──────────┐   ┌────────┐
    │  User  │    │ Matching │    │Question  │   │Collab  │
    │Service │    │ Service  │    │ Service  │   │Service │
    │(Node)  │    │  (Go)    │    │ (Node)   │   │(Elixir)│
    └────────┘    └──────────┘    └──────────┘   └────────┘
        │              │              │              │
        │              │              │              │
    ┌───┴──────────────┴──────────────┴──────────────┴───┐
    │                                                    │
    │         ┌──────────────────────────┐               │
    │         │   Google Cloud Platform  │               │
    │         │                          │               │
    │         └──────────────────────────┘               │
    │                                                    │
    └────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌──────────┐        ┌─────────┐
    │MongoDB  │         │PostgreSQL│        │  Redis  │
    │(Users)  │         │Questions │        │(Sessions)
    └─────────┘         └──────────┘        └─────────┘
```

### Data Flow

**User Registration and Authentication:** Users register through the frontend, which sends credentials to the User Service. The service validates input, hashes passwords using bcrypt, stores user data in MongoDB, and returns a JWT token for subsequent requests.

**Matching Process:** When a user selects a difficulty and topic, the frontend sends a request to the Matching Service. The service adds the user to the appropriate queue, monitors for matches, and notifies both users when a match occurs. The frontend then establishes a WebSocket connection to the Collaboration Service.

**Collaboration Session:** Once matched, users connect to the Collaboration Service via WebSocket. The service manages the session state, synchronises code edits using OT, broadcasts chat messages, and maintains user presence information. The Question Service provides the problem statement and test cases.

## Technology Stack

| Layer | Component | Technology | Version | Purpose |
|-------|-----------|-----------|---------|---------|
| **Frontend** | Framework | React | 19.1.1 | UI framework |
| | Language | TypeScript | 5.9.2 | Type-safe development |
| | Styling | Tailwind CSS | 4.1.13 | Utility-first CSS |
| | Components | Radix UI | 1.4.3 | Accessible UI components |
| | Editor | Monaco Editor | 0.53.0 | Code editor |
| | Routing | React Router | 7.9.1 | Client-side routing |
| | HTTP | Axios | 1.12.2 | HTTP client |
| | WebSocket | Phoenix | 1.8.1 | WebSocket client |
| | Build | Vite | Latest | Build tool |
| | Deployment | Vercel | - | Hosting platform |
| **User Service** | Runtime | Node.js | 18+ | JavaScript runtime |
| | Framework | Express | 4.19.2 | Web framework |
| | Database | MongoDB | 5.0+ | Document database |
| | ODM | Mongoose | 8.5.4 | MongoDB ORM |
| | Auth | JWT | - | Token authentication |
| | Hashing | bcrypt | 5.1.1 | Password hashing |
| **Question Service** | Runtime | Node.js | 16+ | JavaScript runtime |
| | Framework | Express | 5.1.0 | Web framework |
| | Database | PostgreSQL | 12+ | Relational database |
| | Driver | pg | 8.16.3 | PostgreSQL client |
| **Matching Service** | Language | Go | 1.24.5 | Systems language |
| | Framework | Gin | 1.10.1 | Web framework |
| | Cache | Redis | 7.0+ | In-memory cache |
| | Client | go-redis | 8.11.5 | Redis client |
| | CORS | gin-cors | 1.7.6 | CORS middleware |
| **Collaboration Service** | Language | Elixir | 1.15+ | Functional language |
| | Framework | Phoenix | 1.8.1 | Web framework |
| | Real-time | Phoenix LiveView | 1.1.0 | Real-time features |
| **Infrastructure** | Containerisation | Docker | Latest | Container platform |
| | Orchestration | Kubernetes | Latest | Container orchestration |
| | CI/CD | GitHub Actions | - | Automation |
| | Cloud | GCP | - | Cloud platform |

## Getting Started

### Prerequisites

Before setting up the project, ensure you have the following installed:

- **Docker** and **Docker Compose** for containerised development
- **Node.js** 18+ for frontend and Node-based services
- **Go** 1.24.5+ for the Matching Service
- **Elixir** 1.15+ and **Erlang** for the Collaboration Service
- **PostgreSQL** 12+ for question database
- **MongoDB** 5.0+ for user data
- **Redis** 7.0+ for session caching
- **Git** for version control

### Quick Start with Docker Compose

The fastest way to run the entire system locally is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/CS3219-AY2526Sem1/cs3219-ay2526s1-project-g11.git
cd cs3219-ay2526s1-project-g11

# Create environment file
cp .env.example .env

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# User Service: http://localhost:3002
# Question Service: http://localhost:3001
# Matching Service: http://localhost:8080
# Collaboration Service: http://localhost:4000
```

### Environment Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Frontend
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:4000

# User Service
USER_SERVICE_PORT=3002
MONGODB_URI=mongodb://mongo:27017/peerprep_users
JWT_SECRET=your-secret-key-here

# Question Service
QUESTION_SERVICE_PORT=3001
DATABASE_URL=postgresql://postgres:password@postgres:5432/peerprep_questions

# Matching Service
MATCHING_SERVICE_PORT=8080
REDIS_URL=redis://redis:6379

# Collaboration Service
COLLAB_SERVICE_PORT=4000

# General
NODE_ENV=development
```

### Development Setup

For local development without Docker:

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**User Service:**
```bash
cd backend/user-service
npm install
npm run dev
```

**Question Service:**
```bash
cd backend/question-service
npm install
npm run dev
```

**Matching Service:**
```bash
cd backend/matching-service
go mod download
go run ./cmd/web/server.go
```

**Collaboration Service:**
```bash
cd backend/collab-service
mix setup
mix phx.server
```

## Project Structure

```
peerprep/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD pipelines
│       ├── collab-service.yml
│       ├── matching-service.yml
│       ├── question-service.yml
│       ├── react-web.yml
│       └── user-service.yml
│
├── backend/
│   ├── README.md               # Backend services overview
│   │
│   ├── collab-service/         # Elixir Phoenix service
│   │   ├── lib/                # Application code
│   │   ├── test/               # Test files
│   │   ├── config/             # Configuration
│   │   ├── mix.exs             # Dependencies
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   ├── matching-service/       # Go Gin service
│   │   ├── cmd/                # Command entry points
│   │   ├── internal/           # Internal packages
│   │   ├── web/                # HTTP handlers
│   │   ├── go.mod              # Dependencies
│   │   ├── Dockerfile
│   │   └── constants.go
│   │
│   ├── question-service/       # Node.js Express service
│   │   ├── src/                # Source code
│   │   ├── package.json        # Dependencies
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   └── user-service/           # Node.js Express service
│       ├── controller/         # Route controllers
│       ├── middleware/         # Express middleware
│       ├── model/              # Mongoose models
│       ├── routes/             # Route definitions
│       ├── package.json        # Dependencies
│       ├── Dockerfile
│       └── README.md
│
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── api/                # API client
│   │   ├── context/            # Context providers
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # TypeScript types
│   │   └── utils.ts            # Utility functions
│   ├── public/                 # Static assets
│   ├── package.json            # Dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── vercel.json             # Vercel deployment config
│   └── README.md
│
├── kubernetes/                 # Kubernetes manifests
│   ├── collab-service/
│   ├── matching-service/
│   ├── question-service/
│   └── user-service/
│
├── docker-compose.yml          # Local development compose
├── README.md                   # This file
└── LICENSE
```

## Services Overview

### User Service (Node.js/Express)

The User Service manages user authentication, profile management, and account settings. It provides endpoints for user registration, login, profile updates, and privilege management with JWT-based authentication.

**Key Responsibilities:**
- User registration and login with JWT tokens
- Password hashing and verification using bcrypt
- User profile management and updates
- User data persistence in MongoDB

**API Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/verify-token` - Token verification
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `PATCH /users/:id` - Update user privilege
- `DELETE /users/:id` - Delete user account

**Documentation:** See [backend/user-service/README.md](backend/user-service/README.md)

### Question Service (Node.js/Express)

The Question Service provides a comprehensive database of technical interview questions organised by difficulty and topic. It handles question retrieval, filtering, and management with PostgreSQL backend.

**Key Responsibilities:**
- Store and retrieve coding interview questions
- Organise questions by difficulty level and topic
- Provide question metadata and test cases
- Support question creation and updates
- Filter questions by various criteria

**API Endpoints:**
- `GET /questions` - List questions with filtering
- `GET /questions/:id` - Get question by ID
- `GET /topics` - List all topics
- `POST /questions` - Create new question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

**Documentation:** See [backend/question-service/README.md](backend/question-service/README.md)

### Matching Service (Go/Gin)

The Matching Service implements the peer-matching algorithm that pairs users based on difficulty and topic. It uses Redis for queue management and implements timeout-based expansion for improved match quality.

**Key Responsibilities:**
- Maintain user queues by difficulty-topic combination
- Implement FIFO matching algorithm
- Handle timeout-based queue expansion
- Manage match notifications
- Track matching metrics

**API Endpoints:**
- `POST /match/join` - Join matching queue
- `POST /match/leave` - Leave matching queue
- `GET /match/status/:userId` - Get matching status
- `GET /metrics` - Get matching metrics

**Documentation:** See [backend/matching-service/README.md](backend/matching-service/README.md)

### Collaboration Service (Elixir/Phoenix)

The Collaboration Service enables real-time code editing and chat using WebSocket connections. It implements Operational Transform for conflict-free concurrent editing and Phoenix LiveView for real-time features.

**Key Responsibilities:**
- Manage WebSocket connections for active sessions
- Synchronise code editor state across clients
- Implement Operational Transform for concurrent edits
- Broadcast chat messages
- Track user presence in sessions

**WebSocket Events Examples:**
- `session:join` - Join collaboration session
- `session:leave` - Leave collaboration session
- `code:update` - Code editor change broadcast
- `chat:message` - Chat message broadcast
- `presence:update` - User presence update

**Documentation:** See [backend/collab-service/README.md](backend/collab-service/README.md)

### Frontend (React/TypeScript)

The frontend provides an intuitive user interface for the entire platform. It includes components for user authentication, matching, real-time collaboration, and progress tracking.

**Key Features:**
- User authentication and session management
- Matching interface with topic and difficulty selection
- Real-time code editor with Monaco Editor
- Chat interface for peer communication
- Problem display with example test cases
- Dashboard with statistics and history
- Responsive design for mobile and desktop

**Documentation:** See [frontend/README.md](frontend/README.md)

## Development Workflow

### Git Workflow

The project follows a standard Git workflow with feature branches and pull requests:

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Code Quality Standards

All code must meet the following standards before merging:

**Linting:** Code must pass ESLint for JavaScript/TypeScript, Ruff for Python, and Go fmt for Go code.

**Testing:** All new features must include unit tests with minimum 80% code coverage.

**Type Safety:** TypeScript strict mode is enforced for frontend and Node services. Go types must be properly defined.

**Documentation:** All public APIs must be documented with clear descriptions and examples.

### Running Tests

**Frontend:**
```bash
cd frontend
npm test
npm run test:coverage
```

**User Service:**
```bash
cd backend/user-service
npm test
```

**Question Service:**
```bash
cd backend/question-service
npm test
```

**Matching Service:**
```bash
cd backend/matching-service
go test ./...
```

**Collaboration Service:**
```bash
cd backend/collab-service
mix test
```

## Deployment

### Local Deployment with Docker Compose

The `docker-compose.yml` file orchestrates all services for local development:

```bash
docker-compose up --build
```

This starts all services with proper networking and exposes the following ports:
- Frontend: 3000
- User Service: 3002
- Question Service: 3001
- Matching Service: 8080
- Collaboration Service: 4000
- MongoDB: 27017
- PostgreSQL: 5432
- Redis: 6379

### Cloud Deployment

**Frontend Deployment (Vercel):**
The frontend is automatically deployed to Vercel on every push to the main branch. Configuration is in `frontend/vercel.json`.

**Backend Services (GCP):**
Backend services are deployed to Google Cloud Platform using Cloud Run. Kubernetes manifests in the `kubernetes/` directory define deployment configurations.

**CI/CD Pipeline:**
GitHub Actions workflows in `.github/workflows/` automatically test, build, and deploy services on code changes.

## API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorisation header:

```bash
Authorisation: Bearer <JWT_TOKEN>
```

### Error Handling

All APIs return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per 15 minutes per IP
- General endpoints: 100 requests per hour per IP

### Response Format

All successful responses follow this format:

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

## Contributing

We welcome contributions to PeerPrep! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Write tests** for new functionality
3. **Follow code style** guidelines for your language
4. **Write clear commit messages** using conventional commits
5. **Submit a pull request** with a detailed description

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(user-service): add password reset functionality

Implement password reset via email with secure token validation.
Tokens expire after 24 hours.

Closes #123
```

## Support and Documentation

- **Architecture Documentation:** See individual service READMEs in `backend/*/README.md`
- **API Documentation:** Each service includes detailed API documentation in its README
- **Deployment Guides:** See `kubernetes/` directory for deployment configurations
- **Contributing Guide:** See CONTRIBUTING.md

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Team

**CS3219 Project Group G11**

This project was developed as part of the CS3219 Software Engineering Principles and Patterns course at the National University of Singapore (NUS).

---

**Last Updated:** November 2024
**Version:** 1.0.0
