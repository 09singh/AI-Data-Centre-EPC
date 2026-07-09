# AI Data Centre EPC - Backend Integration

This repository contains the **Node.js + Express.js Backend** for the AI Data Centre EPC platform. It acts as the central API gateway between the **React Frontend**, **MongoDB**, and the **FastAPI AI Layer**.

---

## Architecture

```
                    React Frontend
                           │
                           │ REST APIs
                           ▼
                Node.js + Express Backend
        ┌──────────────┼───────────────┐
        │              │               │
        ▼              ▼               ▼
   MongoDB        FastAPI AI Layer    Authentication
        │              │
        │              ▼
        │     AI Processing
        │     Document Analysis
        │     Compliance Check
        │     Recommendation Engine
        │     Report Generation
        ▼
 Persistent Storage
```

---
```
backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js                  // Database connection setup
│   │   ├── env.js                 // Environment config (e.g., dotenv)
│   │   └── axios.js               // Axios instance to call FastAPI
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js     // Auth checks
│   │   ├── error.middleware.js    // Global error handling
│   │   └── upload.middleware.js   // File upload validation
│   │
│   ├── services/                  // Shared logic that spans features
│   │   └── ai.service.js           // Calls FastAPI AI endpoints
│   │
│   ├── features/
│   │   │
│   │   ├── auth/                   // Authentication feature
│   │   │   ├── auth.routes.js      // Routes for auth
│   │   │   ├── auth.controller.js  // Controller logic
│   │   │   ├── auth.model.js       // User schema model
│   │   │   └── auth.service.js     // Auth service (e.g., JWT, bcrypt)
│   │   │
│   │   ├── project/                // Project feature
│   │   │   ├── project.routes.js
│   │   │   ├── project.controller.js
│   │   │   ├── project.model.js    // Project schema
│   │   │   └── project.service.js  // Business logic for projects
│   │   │
│   │   ├── document/               // Document feature
│   │   │   ├── document.routes.js
│   │   │   ├── document.controller.js
│   │   │   ├── document.model.js   // Document schema
│   │   │   └── document.service.js // Business logic for documents
│   │   │
│   │   ├── ai/                     // AI feature (integrates FastAPI)
│   │   │   ├── ai.routes.js
│   │   │   ├── ai.controller.js
│   │   │   └── ai.service.js       // Interacts with FastAPI AI layer
│   │   │
│   │   ├── compliance/             // Compliance feature
│   │   │   ├── compliance.routes.js
│   │   │   ├── compliance.controller.js
│   │   │   ├── compliance.model.js // Compliance schema
│   │   │   └── compliance.service.js // Compliance logic
│   │   │
│   │   ├── report/                 // Report feature
│   │   │   ├── report.routes.js
│   │   │   ├── report.controller.js
│   │   │   ├── report.model.js     // Report schema
│   │   │   └── report.service.js   // Report generation logic
│   │   │
│   │   └── recommendation/         // Recommendation feature
│   │       ├── recommendation.routes.js
│   │       ├── recommendation.controller.js
│   │       ├── recommendation.model.js // Recommendation schema
│   │       └── recommendation.service.js // Recommendation logic
│   │
│   ├── app.js                      // Initialize express app, import routes
│   └── server.js                   // Entry point, runs the server
│
└── package.json
```
# Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Axios

### AI Layer

- FastAPI
- Python
- LangChain
- RAG Pipeline
- Vector Database

### Frontend

- React.js
- Vite
- Axios

---

# Backend Responsibilities

The Express backend is responsible for:

- User Authentication
- Project Management
- Document Management
- File Upload
- Database Operations
- Calling AI APIs
- Returning Responses to Frontend

The backend **does not perform AI processing**.

All AI-related processing is delegated to the FastAPI service.

---

# Feature-Based Architecture

```
src/
│
├── config/
│   ├── axios.js
│   └── db.js
│
├── middleware/
│
├── features/
│   ├── auth/
│   ├── project/
│   ├── document/
│   ├── ai/
│   ├── compliance/
│   ├── recommendation/
│   └── report/
│
├── app.js
└── server.js
```

---

# Integration Flow

## Document Upload

```
Frontend
      │
      ▼
POST /api/documents/upload
      │
      ▼
Express Backend
      │
      ├── Save metadata to MongoDB
      │
      └── Send document to FastAPI
                  │
                  ▼
          Text Extraction
          Embedding
          Vector Storage
                  │
                  ▼
          Success Response
```

---

## AI Chat

```
Frontend

      │

POST /api/ai/chat

      │

Express Backend

      │

Axios

      │

FastAPI

      │

LLM

      │

Response

      │

Frontend
```

---

## Compliance Analysis

```
Frontend

      │

POST /api/compliance

      │

Express Backend

      │

FastAPI

      │

Compliance Engine

      │

Risk Score

Violations

Recommendations

      │

MongoDB

      │

Frontend
```

---

## Report Generation

```
Frontend

      │

POST /api/reports

      │

Express Backend

      │

FastAPI

      │

AI Report Generator

      │

Generated Report

      │

MongoDB

      │

Frontend
```

---

# Environment Variables

Create a `.env` file.

```env
PORT=5000

NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/ai-data-centre

JWT_SECRET=your_secret_key

AI_SERVICE_URL=http://localhost:8000/api/v1
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Run the server

```bash
npm run dev
```

or

```bash
node server.js
```

---

# API Modules

| Module | Description |
|---------|-------------|
| Authentication | Login & Registration |
| Projects | Manage EPC Projects |
| Documents | Upload & Manage Documents |
| AI | AI Chat & Search |
| Compliance | Compliance Analysis |
| Recommendation | AI Recommendations |
| Reports | AI Generated Reports |

---

# Communication with AI Layer

The backend communicates with the FastAPI microservice using Axios.

Example:

```javascript
const { data } = await aiClient.post("/chat", payload);
```

The backend never performs:

- OCR
- Embedding
- LLM Processing
- Vector Search
- Compliance Analysis

These operations are entirely handled by the FastAPI AI service.

---

# Frontend Communication

The frontend communicates **only** with the Express backend.

```
Frontend
      │
      ▼
Express Backend
      │
      ▼
FastAPI
```

The frontend never directly accesses the AI service.

---

# Future Enhancements

- AWS S3 Document Storage
- Redis Caching
- WebSocket Notifications
- Background Job Queue
- Docker Deployment
- Kubernetes Support
- API Gateway
- Rate Limiting
- Monitoring & Logging

---

# Contributors

- Backend Team
- AI Team
- Frontend Team

---

# License

This project is developed for the **AI Data Centre EPC Platform**.