import os
from pathlib import Path
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve the project root dynamically
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Dynamically locate the .env file
env_path = PROJECT_ROOT / ".env"
if not env_path.exists():
    env_path = Path(".env")  # Fallback to current working directory

class Settings(BaseSettings):
    """Centralized configuration settings for the AI module.

    Loads and validates configuration from environment variables or a .env file.
    Follows Clean Architecture and is reusable across all future modules.
    """
    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Application Configuration
    APP_NAME: str = Field(
        default="AI Project Intelligence Platform",
        description="Name of the application"
    )
    APP_ENV: str = Field(
        default="development",
        description="Application environment (development, staging, production)"
    )
    APP_HOST: str = Field(
        default="0.0.0.0",
        description="Host to run the application on"
    )
    APP_PORT: int = Field(
        default=8000,
        description="Port to run the application on"
    )
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Global logging level"
    )
    VERSION: str = Field(
        default="0.1.0",
        description="API version"
    )

    # Groq API Configuration
    GROQ_API_KEY: str = Field(
        ...,
        description="API Key for Groq Cloud services"
    )

    # Qdrant Vector Database Configuration
    QDRANT_URL: str = Field(
        default="http://localhost:6333",
        description="URL for the Qdrant instance"
    )
    QDRANT_API_KEY: Optional[str] = Field(
        default=None,
        description="Optional API Key for Qdrant Cloud"
    )

    # Embedding Configuration
    EMBEDDING_MODEL: str = Field(
        default="BAAI/bge-small-en-v1.5",
        description="Name of the embedding model to use"
    )
    EMBEDDING_BATCH_SIZE: int = Field(
        default=32,
        description="Batch size for embedding generation"
    )
    EMBEDDING_DEVICE: Optional[str] = Field(
        default=None,
        description="Optional execution device override (e.g., 'cpu', 'cuda')"
    )
    COLLECTION_NAME: str = Field(
        default="epc_knowledge_base",
        description="Default collection name in Qdrant"
    )
    VECTOR_SIZE: int = Field(
        default=384,
        description="Dimension size of vector database vectors"
    )
    DISTANCE_METRIC: str = Field(
        default="Cosine",
        description="Vector similarity metric (Cosine, Dot, Euclid)"
    )
    DEFAULT_TOP_K: int = Field(
        default=5,
        description="Default number of nearest neighbor vectors to return"
    )
    DEFAULT_SCORE_THRESHOLD: float = Field(
        default=0.5,
        description="Default similarity score filter threshold"
    )
    RERANKER_TYPE: str = Field(
        default="identity",
        description="Active reranker engine selection ('identity', 'bge', 'cohere')"
    )
    SEARCH_TIMEOUT_SECONDS: float = Field(
        default=5.0,
        description="Maximum search duration query timeout in seconds"
    )
    GROQ_MODEL_NAME: str = Field(
        default="meta-llama/llama-4-scout-17b-16e-instruct",
        description="Name of the default Groq LLM model to execute"
    )
    TEMPERATURE: float = Field(
        default=0.2,
        description="Sampling temperature for LLM generation"
    )
    MAX_TOKENS: int = Field(
        default=1024,
        description="Maximum token count constraint for completion responses"
    )
    TOP_P: float = Field(
        default=0.9,
        description="Nucleus sampling threshold for LLM generation"
    )
    MEMORY_WINDOW: int = Field(
        default=10,
        description="Number of recent messages to preserve in sliding conversation memory window"
    )
    COMPLIANCE_THRESHOLD: float = Field(
        default=0.8,
        description="Minimum score threshold required for a specification to be compliant"
    )
    QUALITY_THRESHOLD: float = Field(
        default=0.75,
        description="Minimum document completeness percentage score required"
    )
    RECOMMENDATION_LIMIT: int = Field(
        default=5,
        description="Maximum count of recommendations returned in intelligence logs"
    )


# Instantiate settings as a singleton for import across modules
settings = Settings()
