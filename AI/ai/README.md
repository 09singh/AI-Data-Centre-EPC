# AI Project Intelligence Platform (AI Layer)

Enterprise-grade AI Project Intelligence Platform for Data Centre EPC (Engineering, Procurement, and Construction) Project Delivery. This module provides the backend AI foundation, including configuration validation, structured logging, health checks, and the modular codebase structure for downstream workflows.

---

## Technology Stack

- **Core**: Python 3.10+
- **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) (highly performant, modern, typed API framework)
- **Web Server**: [Uvicorn](https://www.uvicorn.org/) (ASGI server)
- **Configuration**: [Pydantic v2](https://docs.pydantic.dev/) and `pydantic-settings` (strong runtime verification)
- **Structured Logging**: [Loguru](https://github.com/Delgan/loguru) (colorized, rotated, structured logs)
- **Testing**: [pytest](https://docs.pytest.org/) and `httpx` (asynchronous HTTP integration testing client)

---

## Folder Structure

```text
ai/
│
├── app.py                  # API Application Entrypoint & Lifespan Handles
├── requirements.txt        # Project Package Requirements
├── .env                    # Runtime Configuration Values (gitignored)
├── .env.example            # Configuration Template
├── README.md               # Setup & Run Guide
├── implementation_plan.md  # Step roadmap and system design decisions
├── .gitignore              # Source control build exclusions
│
├── config/                 # Pydantic Settings & Configuration definitions
├── document_processing/    # Future: Document Parsing, Chunking & Preprocessing
├── knowledge_engine/       # Future: Qdrant vector database storage, Embeddings & RAG
├── ai_agents/              # Future: Multi-agent orchestrators (Compliance, Safety, etc.)
├── prediction/             # Future: EPC Schedule/Cost risk predictive models
├── simulation/             # Future: EPC project simulation workflows
├── models/                 # Future: Base data entities, validation schemas
├── prompts/                # Future: LLM system prompts and structured instructions
├── services/               # Future: Clients for External APIs (Groq, Qdrant, etc.)
├── api/                    # REST API routes and parameter validation
├── utils/                  # Centralized helpers (Logging, etc.)
└── tests/                  # Package Unit and Integration test suite
```

---

## Setup & Environment Configuration

### 1. Initialize Virtual Environment
Navigate to the `ai/` directory and spin up a virtual environment:
```powershell
# Windows
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Project Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Secrets & Configurations
Copy the template configuration:
```bash
cp .env.example .env
```
Ensure the variables in `.env` match your configuration needs:
- `GROQ_API_KEY`: API authentication key for Groq LLMs.
- `QDRANT_URL`: Vector database URI location.
- `QDRANT_API_KEY`: Authentication key for Qdrant.
- `EMBEDDING_MODEL`: The sentence embedding model to load.
- `COLLECTION_NAME`: Database collection target.

---

## Running the Application

Run the server with auto-reload:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
Alternatively, run directly via Python:
```bash
python app.py
```

### Accessing APIs & Interactive Documentation
Once started, you can navigate to the API endpoints and auto-generated docs:
- **Interactive OpenAPI Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative API Reference (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **Version Endpoint**: [http://localhost:8000/api/v1/version](http://localhost:8000/api/v1/version)

---

## Testing

Execute the test suites inside the environment using:
```bash
pytest
```
