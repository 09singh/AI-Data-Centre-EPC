# Stage 1: Build stage for installing dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies required for compiling Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install packages in user space
COPY ai/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final lightweight runtime stage
FROM python:3.11-slim AS runner

WORKDIR /app

# Copy installed Python packages from the builder stage
COPY --from=builder /root/.local /root/.local
COPY ai/ /app/ai/

# Export paths and configure python path resolving
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

# Expose default FastAPI API Port
EXPOSE 8000

# Configure production-ready default runtime parameters
ENV APP_ENV=production
ENV APP_HOST=0.0.0.0
ENV APP_PORT=8000

# Execute FastAPI server using Uvicorn pointing to the bootstrap entrypoint
CMD ["uvicorn", "ai.app:app", "--host", "0.0.0.0", "--port", "8000"]
