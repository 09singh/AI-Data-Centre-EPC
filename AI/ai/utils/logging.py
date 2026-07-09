import sys
from pathlib import Path
from loguru import logger
from ai.config.settings import settings

def setup_logging() -> None:
    """Configures centralized logging using Loguru.

    Sets up:
    - Structured, colorized console logging.
    - File logging with automatic rotation and retention for persistence.
    """
    # Remove default Loguru handler
    logger.remove()

    # Log format for console (with color support)
    console_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    # Console Handler
    logger.add(
        sys.stderr,
        format=console_format,
        level=settings.LOG_LEVEL.upper(),
        colorize=True,
        backtrace=settings.APP_ENV != "production",
        diagnose=settings.APP_ENV != "production"
    )

    # File Logging Configuration (Supports persistence and log shipping)
    try:
        # Create a logs directory inside the ai module root
        log_dir = Path(__file__).resolve().parent.parent / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / "app.log"

        file_format = (
            "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | "
            "{name}:{function}:{line} - {message}"
        )

        logger.add(
            log_file,
            format=file_format,
            level="DEBUG" if settings.APP_ENV == "development" else "INFO",
            rotation="1 day",
            retention="30 days",
            compression="zip",
            backtrace=True,
            diagnose=settings.APP_ENV != "production"
        )
        logger.debug(f"File logging configured at: {log_file}")
    except Exception as e:
        logger.warning(f"Failed to initialize file logger: {e}. Defaulting to console logging only.")

    logger.info("Centralized logging initialized successfully.")
