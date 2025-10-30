[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)
# CS3219 Project (PeerPrep 🎯) - AY2526S1
## Group: G11

_A Technical Interview Preparation and Peer-Matching Platform_

## 📌 Overview

PeerPrep is a **real-time collaborative platform** designed to help students practice technical interview questions with peers.  
It matches users based on **difficulty & topic**, provides a **shared coding workspace**, and integrates **AI-powered assistance** to enhance the learning experience.

This project was developed as part of **CS3219 Software Engineering Principles and Patterns (AY2526S1)**.

---

## ✨ Features

### Must-Have (Core Services)

- **User Service (M1)** → User registration, login, profile management.
- **Matching Service (M2)** → Matches peers by difficulty & topic.
- **Question Service (M3)** → Provides coding interview questions by difficulty & topic.
- **Collaboration Service (M4)** → Real-time collaborative editor with chat.
- **Basic UI (M5)** → Clean, student-friendly React-based frontend.
- **Deployment (M6)** → Containerized microservices for local and cloud deployment.

### Nice-to-Have (AI Integration)

- **AI-Assisted Explanations** → Request explanations for peer-written code.
- **AI Hints** → Contextual hints during problem solving without revealing full solutions.
- **AI Sidebar** → History of all AI interactions during a session.

---

## 🏗️ Architecture

- **Frontend** → React + TailwindCSS + shadcn/ui + Monaco Editor
- **Backend Services** → Go
- **Database** → PostgreSQL (users, questions), Redis (matching/session state)
- **Collaboration** → WebSockets + Yjs (real-time editing)
- **AI Integration** → OpenAI API (GPT) for explanations and hints
- **Deployment** → Docker + Docker Compose (local) / Render or AWS (cloud)

```mermaid
flowchart LR
    subgraph FE [Frontend - React]
        UI[UI + Monaco Editor]
    end

    subgraph BE [Backend - Go Microservices]
        US[User Service]
        MS[Matching Service]
        QS[Question Service]
        CS[Collaboration Service]
        AI[AI Integration Service]
    end

    DB[(MongoDB)]
    Cache[(Redis)]

    UI --> US
    UI --> MS
    UI --> QS
    UI --> CS
    CS --> AI
    US --> DB
    QS --> DB
    MS --> Cache
```

## 🚀 Getting Started

1. Clone the Repository
   git clone https://github.com/c-wenlong/cs3219-peerprep.git
   cd peerprep

1. Setup Environment Variables

Create a .env file in the project root:

```
DATABASE_URL=postgresql://user:password@localhost:5432/peerprep
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
OPENAI_API_KEY=your-openai-api-key
```

3. Start Services with Docker
   docker-compose up --build

4. Run Locally (Dev Mode)

### Frontend:

```zsh
cd frontend
npm install
npm run dev
```

### Backend:

```zsh
cd backend
npm install
npm run start:dev
```

## 📅 Project Timeline

Week 5 → Requirements specification (backlog, wireframes).

Week 7–8 → User, Matching, Question services implemented.

Week 9–10 → Collaboration service + AI features.

Week 11–12 → Integration, testing, deployment.

Week 13 → Final demo & submission.

## 🧪 Testing

Unit Tests → Go Tests (backend), React Testing Library (frontend).

Integration Tests → Dockerized test environment.

End-to-End Tests → Playwright (user flows).

Run tests:

```zsh
npm run test
```

## 📜 AI Usage Disclosure

This project used AI tools (ChatGPT, GitHub Copilot) only for allowed phases:

✅ Implementation code generation (boilerplate, unit tests).

✅ Debugging assistance and refactoring.

✅ Documentation formatting.

❌ Not used for requirements prioritization, architecture design, or trade-off decisions.

See `/ai/usage-log.md`
for detailed prompts and outputs.

## 👥 Team Roles

Frontend Lead → UI, React integration, editor.

Backend Lead → User + Matching services.

Backend Support → Question service + AI integration.

Collaboration Lead → Real-time editor, WebSocket infra.

DevOps/AI Specialist → Docker, CI/CD, AI service integration.

## 📚 References

LeetCode Question Bank
(sample problems)

NUS CS3219 Course Page

## 📄 License

This project is for academic use only under NUS CS3219 guidelines.

