# AI Module Deployment & Production Readiness Guide

This document describes setup, configuration, containerization, and troubleshooting instructions for deploying the AI Module of the Data Centre EPC Project Intelligence Platform.

---

## 1. Environment Configuration

The application is configured using environment variables loaded from a `.env` file in the project root or the `ai/` folder.

| Environment Variable | Default Value | Description |
|----------------------|---------------|-------------|
| `GROQ_API_KEY` | *(Mandatory)* | API Key for Groq Cloud completions services. |
| `QDRANT_URL` | `http://localhost:6333` | Host endpoint connection URL for Qdrant. |
| `QDRANT_API_KEY` | `None` | Optional Qdrant Cloud API security key. |
| `EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5` | Lazy-loaded SentenceTransformer model tag. |
| `COLLECTION_NAME` | `epc_knowledge_base` | Default Qdrant vector store collection. |
| `APP_ENV` | `development` | Deployment tier environment ('development', 'production'). |
| `LOG_LEVEL` | `INFO` | Console log filter level ('DEBUG', 'INFO', 'WARNING', 'ERROR'). |
| `APP_HOST` | `0.0.0.0` | Server interface host bind address. |
| `APP_PORT` | `8000` | FastAPI server port. |

---

## 2. Local Machine Setup

### Prerequisites
- Python 3.11.x installed.
- Docker installed (required for running Qdrant locally).

### Quickstart Steps

1. **Install python packages**:
   ```bash
   pip install -r ai/requirements.txt
   ```

2. **Configure environment credentials**:
   Copy `.env.example` to `.env` in the project root and populate your keys:
   ```bash
   cp .env.example .env
   ```

3. **Start local Qdrant server**:
   ```bash
   docker run -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage qdrant/qdrant
   ```

4. **Launch development server**:
   - **Linux/macOS**:
     ```bash
     chmod +x run_local.sh
     ./run_local.sh
     ```
   - **Windows PowerShell**:
     ```powershell
     .\run_local.ps1
     ```

The API documentation will be available at `http://localhost:8000/docs` (Swagger UI).

---

## 3. Containerized Setup (Docker & Docker Compose)

The module includes a multi-stage production Dockerfile and a multi-container Docker Compose file mapping dependencies (FastAPI, Qdrant, Redis).

### Deploying Compose Cluster

1. **Run compose stack**:
   - **Linux/macOS**:
     ```bash
     chmod +x run_docker.sh
     ./run_docker.sh
     ```
   - **Windows PowerShell**:
     ```powershell
     .\run_docker.ps1
     ```

This command builds the local AI Python image, pulls Qdrant and Redis, mounts data volumes, builds networks, and sets up startup order health checks.

### Verifying deployment
Query the extended monitoring endpoint:
```bash
curl -f http://localhost:8000/api/v1/health
```

Expected Response payload:
```json
{
  "status": "ok",
  "environment": "production",
  "api_status": "operational",
  "embedding_model_status": "loaded",
  "qdrant_status": "connected",
  "memory_usage_mb": 115.42,
  "loaded_services": [
    "EmbeddingService",
    "SearchService",
    "AIOrchestrator",
    "ComplianceEngine",
    "RecommendationEngine",
    "InsightEngine",
    "RuleEvaluator"
  ]
}
```

---

## 4. Production Deployment Steps

For high-availability production environments:

1. **WSGI/ASGI Process Managers**:
   Deploy using Uvicorn with multiple workers controlled by process managers (like gyp/systemd or running inside Kubernetes pods):
   - **Linux/macOS**:
     ```bash
     ./run_prod.sh
     ```
   - **Windows**:
     ```powershell
     .\run_prod.ps1
     ```

2. **Reverse Proxy Configurations**:
   Set up Nginx or Traefik in front of the application to manage SSL termination, rate limits, and request filtering.

3. **Persistent storage volumes**:
   Always back up the Qdrant storage volume (`/qdrant/storage`) to prevent document vector index loss on system updates.

---

## 5. Troubleshooting Guide

### 1. Application crashes on startup with `ValueError`
* **Symptom**: FastAPI fails to start, logging a `ValueError` during initialization.
* **Cause**: Mandatory variables `GROQ_API_KEY` or `QDRANT_URL` are missing from the environment.
* **Fix**: Ensure `.env` exists in the project root or folder path and contains valid keys. Check that you ran `source .env` or copy `.env` to the directory of execution.

### 2. Qdrant connection check reports `disconnected`
* **Symptom**: Service `/health` endpoint returns `"qdrant_status": "disconnected"`.
* **Cause**: Qdrant database server is not running or the address inside `QDRANT_URL` is wrong.
* **Fix**: Run `docker ps` to verify that the `epc_qdrant_db` container is healthy. Verify the connection host URL string in `.env`.

### 3. Memory usage grows excessively on large uploads
* **Symptom**: Service resident memory size (RSS) grows quickly during multi-page document uploads.
* **Cause**: Heavy parsing text chunks and loading large SentenceTransformer model weights.
* **Fix**: Set `EMBEDDING_DEVICE=cpu` or allocate a GPU if CUDA is available. For huge documents, parse in batches or scale horizontally.

### 4. Logging files are not created
* **Symptom**: `logs/app.log` is missing.
* **Cause**: Python does not have write permissions for the directory.
* **Fix**: Ensure that the user running the Uvicorn worker has write permissions for the project directory. If running in a container, logs are routed to stdout and captured by Docker.
