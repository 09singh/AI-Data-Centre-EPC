import sys
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from loguru import logger

from ai.config.settings import settings
from ai.utils.logging import setup_logging
from ai.api import router as system_router

# Initialize centralized logging config
setup_logging()

import time
from fastapi import Request

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for the FastAPI application.

    Executes startup logic before receiving requests and shutdown cleanup on exit.
    """
    logger.info(
        "Initializing application startup. "
        "App: '{}' | Version: {} | Environment: {}",
        settings.APP_NAME,
        settings.VERSION,
        settings.APP_ENV
    )
    
    # Mandatory Configuration Validation at Startup
    # Skip checks if running standard tests under pytest with empty credentials, unless placeholder validation is targeted
    should_validate = "pytest" not in sys.modules or settings.GROQ_API_KEY == "your_groq_api_key_here"

    if should_validate:
        logger.info("Validating mandatory environment configurations...")
        if not settings.GROQ_API_KEY or settings.GROQ_API_KEY.strip() in ["", "your_groq_api_key_here"]:
            logger.error("Configuration Error: Mandatory GROQ_API_KEY is missing or invalid.")
            raise ValueError("Missing or placeholder GROQ_API_KEY configuration variable. Startup aborted.")

        if not settings.QDRANT_URL or settings.QDRANT_URL.strip() == "":
            logger.error("Configuration Error: Mandatory QDRANT_URL is missing.")
            raise ValueError("Missing QDRANT_URL configuration variable. Startup aborted.")

        # If connection endpoint specifies cloud secure protocol, ensure security API key is provided
        if settings.QDRANT_URL.startswith("https://") and (not settings.QDRANT_API_KEY or settings.QDRANT_API_KEY.strip() == ""):
            logger.error("Configuration Error: QDRANT_API_KEY is missing for cloud host deployment.")
            raise ValueError("Missing QDRANT_API_KEY configuration variable for cloud host connection. Startup aborted.")

        # Validate presence of required local runtime directories
        required_folders = ["data/uploads", "data/processed", "data/cache", "logs"]
        for folder in required_folders:
            folder_path = Path(folder)
            if not folder_path.exists():
                logger.error("Configuration Error: Mandatory runtime directory '{}' is missing.", folder)
                raise FileNotFoundError(f"Missing required runtime directory: '{folder}'")

        # Automatically verify Qdrant collection schema configurations
        try:
            from ai.api.dependencies import get_connection_manager
            from qdrant_client.http import models as qmodels
            
            # Avoid executing network calls for memory mock databases during validations
            if settings.QDRANT_URL != ":memory:":
                conn = get_connection_manager()
                client = conn.connect()
                col_name = settings.COLLECTION_NAME
                
                exists = False
                try:
                    col_info = client.get_collection(collection_name=col_name)
                    exists = True
                    vectors_config = col_info.config.params.vectors
                    
                    is_named = isinstance(vectors_config, dict)
                    size_mismatch = False
                    
                    if is_named:
                        found_info = "named vector: " + ", ".join(vectors_config.keys())
                    else:
                        size = getattr(vectors_config, "size", None)
                        distance = getattr(vectors_config, "distance", None)
                        found_info = f"unnamed vector, size: {size}, distance: {distance}"
                        if size != 384:
                            size_mismatch = True
                            
                    if is_named or size_mismatch:
                        err_msg = (
                            f"\nQdrant collection schema mismatch.\n\n"
                            f"Expected:\n"
                            f"- unnamed vector\n"
                            f"- size: 384\n"
                            f"- distance: Cosine\n\n"
                            f"Found:\n"
                            f"- {found_info}\n\n"
                            f"Please recreate the collection with the correct schema."
                        )
                        logger.error("Startup aborted due to: {}", err_msg)
                        raise ValueError(err_msg)
                except ValueError as val_err:
                    raise val_err
                except Exception:
                    # Collection does not exist
                    exists = False
                    
                if not exists:
                    logger.info("Creating Qdrant collection '{}' with unnamed vector configurations...", col_name)
                    client.create_collection(
                        collection_name=col_name,
                        vectors_config=qmodels.VectorParams(
                            size=384,
                            distance=qmodels.Distance.COSINE
                        )
                    )
                    logger.info("Qdrant collection '{}' created successfully.", col_name)

                # Safely ensure payload keyword indexes exist on startup
                from ai.api.dependencies import get_collection_manager
                col_manager = get_collection_manager()
                col_manager.create_payload_indexes(col_name)
        except ValueError as val_err:
            raise val_err
        except Exception as col_err:
            logger.warning("Could not auto-verify Qdrant collection at startup: {}. Proceeding anyway.", str(col_err))

        logger.info("Configuration validation completed successfully.")
    yield
    logger.info("Application shutdown initiated. Cleaning up resources...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI Project Intelligence Platform for Data Centre EPC Project Delivery.",
    lifespan=lifespan
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware logging HTTP request timing metrics and route errors."""
    start_time = time.time()
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        logger.info(
            "Request: {} {} | Status: {} | Duration: {:.4f}s",
            request.method,
            request.url.path,
            response.status_code,
            duration
        )
        return response
    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            "Request Failed: {} {} | Error: {} | Duration: {:.4f}s",
            request.method,
            request.url.path,
            str(e),
            duration
        )
        raise e

# Include core system router under prefix v1
app.include_router(system_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn

    # Add directory to sys.path to ensure module imports resolve correctly when run directly
    current_path = Path(__file__).resolve().parent
    sys.path.insert(0, str(current_path))

    logger.info("Starting development server...")
    uvicorn.run(
        "app:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=(settings.APP_ENV == "development")
    )
