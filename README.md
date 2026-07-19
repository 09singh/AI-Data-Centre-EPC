# EPC AI Manager

AI-Powered Project Intelligence Platform for Data Centre EPC Projects

---

## Overview

EPC AI Manager is an enterprise-grade AI Project Intelligence Platform designed specifically for Data Centre Engineering, Procurement, and Construction (EPC) projects.

It unifies project documents, specifications, schedules, procurement data, and quality records into a living intelligence layer, enabling:

- Proactive schedule management
- Automated compliance checking
- Real-time commissioning support
- AI-powered project intelligence
- Enterprise document search with RAG

---

# Key Features

| Feature | Description |
|---------|-------------|
| Dashboard | Mission Control center showing project health, progress, risks, alerts, and AI recommendations |
| Project Hub | Central workspace for documents, schedules, vendors, and equipment management |
| AI Project Brain | RAG-powered conversational AI with document citations |
| AI Intelligence | Risk prediction, compliance checking, and what-if simulations |
| Commissioning | Final testing, quality assurance, and readiness tracking |
| Reports | AI-generated executive summaries with export options |
| Global Search | Universal search across all project data |
| Notifications | Real-time alerts for risks, delays, and compliance issues |
| Settings | Profile, project, team, and theme management |

---

# Technology Stack

## Frontend

- React 18.2.0
- Vite 5.1.0
- Tailwind CSS 3.4.19
- React Router DOM 6.22.0
- Axios 1.18.1
- Heroicons 2.2.0

## Backend

- Node.js 22.19.0
- Express.js 5.2.1
- MongoDB 8.3
- Mongoose
- JWT Authentication
- Multer

## AI Service

- Python 3.11+
- FastAPI 0.111.0
- Qdrant 1.9.1 (Vector Database)
- Groq (openai/gpt-oss-20b)
- SentenceTransformers 3.0.1 (BAAI/bge-small-en-v1.5)
- PyMuPDF
- python-docx

---

# Project Structure

```text
EPC AI Manager/
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── styles/
│   └── public/
│
├── Backend/
│   ├── src/
│   │   ├── Features/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── routes/
│   └── uploads/
│
├── AI/
│   ├── ai/
│   │   ├── api/
│   │   ├── config/
│   │   ├── document_processing/
│   │   ├── knowledge_engine/
│   │   └── ai_agents/
│   └── data/
│
└── README.md
```

---

# Quick Setup Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22.x |
| Python | 3.11+ |
| MongoDB | 8.x |
| npm / yarn | Latest |

---

## 1. Clone Repository

```bash
git clone https://github.com/09singh/AI-Data-Centre-EPC.git
cd AI-Data-Centre-EPC
```

---

## 2. Backend Setup

```bash
cd Backend

npm install

cp .env.example .env

npm run dev
```

---

## 3. AI Service Setup

```bash
cd AI

python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r ai/requirements.txt

cp .env.example .env

python -m ai.app
```

---

## 4. Frontend Setup

```bash
cd Frontend

npm install

cp .env.example .env

npm run dev
```

---

## 5. Seed Database

```bash
cd Backend

node seed.js
node seed-projects.js
```

---

# Environment Variables

## Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/AIDataCentre
JWT_SECRET=your_secret_key
AI_SERVICE_URL=http://localhost:8000/api/v1
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## AI Service (.env)

```env
GROQ_API_KEY=your_groq_api_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
COLLECTION_NAME=epc_documents
GROQ_MODEL_NAME=openai/gpt-oss-20b
```

---

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://localhost:8000
```

---

# Security Overview

| Layer | Mechanism |
|--------|-----------|
| Authentication | JWT Bearer Token |
| Authorization | Role-Based Access Control |
| Password Storage | bcrypt Hashing |
| API Security | Protected Routes with JWT Middleware |
| Token Expiry | 7 Days |
| File Upload | Multer Validation |

---

# Role-Based Access Matrix

| Feature | Admin | PM | Engineer | QA |
|---------|-------|----|-----------|----|
| Dashboard | Full | Full | View | View |
| Project Hub | Full | Full | Edit | View |
| AI Project Brain | View | View | View | View |
| AI Intelligence | Full | Approve | View | Approve |
| Commissioning | Full | View | Edit | Approve |
| Reports | Full | Approve | View | Approve |

---

# Testing

## AI Service

```bash
cd AI
pytest
```

## Backend

```bash
cd Backend
npm test
```

## Frontend

```bash
cd Frontend
npm test
```

---

# Demo Projects

The database includes three pre-seeded demo projects.

### Riverbend Data Centre

- Hyperscale facility
- 50 MW Capacity
- Status: In Progress

### Sunrise Data Centre

- Edge Data Centre
- Hybrid Backup Systems
- Status: Planning

### Delta EPC Project

- Industrial Automation
- Utility Plant Expansion
- Status: Completed

Each project contains:

- Documents
- Vendors
- Equipment
- Schedule
- Commissioning Data
- AI Intelligence Results

---

# Architecture Overview

```text
Frontend (React + Vite)
        │
        │ REST API / JWT
        ▼
Backend (Node.js + Express)
        │
        ├── MongoDB
        │
        └── AI Service (FastAPI)
                │
                ├── Qdrant
                │
                └── Groq LLM
```

---

# AI Workflow

```text
Document Upload
        │
        ▼
Backend Stores File
        │
        ▼
Text Extraction
        │
        ▼
Chunking
        │
        ▼
Embedding Generation
        │
        ▼
Vector Storage (Qdrant)
        │
        ▼
Similarity Search
        │
        ▼
Context Construction
        │
        ▼
LLM Response
        │
        ▼
Answer with Citations
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/login | User Login |
| POST | /api/auth/register | User Registration |
| GET | /api/projects | Get All Projects |
| GET | /api/documents | Get All Documents |
| POST | /api/documents | Upload Document |
| POST | /api/ai/chat | AI Chat (RAG) |
| POST | /api/ai/compliance | Compliance Check |
| POST | /api/ai/recommendation | Risk Prediction |
| POST | /api/ai/reports | What-if Simulation |
| GET | /api/ai/health | AI Service Health |

---

# License

MIT License

---

# Contributors

- Frontend Engineer — React UI Development
- Backend Engineer — API & Database
- AI Engineer — AI Service & RAG Pipeline
- Integration Engineer — Testing & Deployment

---

# Repository

**GitHub**

https://github.com/09singh/AI-Data-Centre-EPC

---

# EPC AI Manager

**AI Project Intelligence Platform for Data Centre EPC Projects**
