from abc import ABC, abstractmethod
from enum import Enum
from loguru import logger


class OCREngineType(str, Enum):
    """Supported OCR engine types for the platform."""
    EASY_OCR = "easyocr"
    PADDLE_OCR = "paddleocr"
    TESSERACT = "tesseract"


class BaseOCREngine(ABC):
    """Abstract base class for OCR engine implementations.

    Downstream concrete engines must implement text extraction from raw bytes.
    """

    @abstractmethod
    def extract_text(self, image_data: bytes) -> str:
        """Extracts text from raw image bytes.

        Args:
            image_data: Raw bytes of the image file.

        Returns:
            str: The extracted text string.
        """
        pass


class EasyOCREngine(BaseOCREngine):
    """Concrete placeholder implementation for EasyOCR."""

    def extract_text(self, image_data: bytes) -> str:
        logger.info("Executing EasyOCR engine placeholder extraction...")
        return "[EasyOCR Engine Text Placeholder]"


class PaddleOCREngine(BaseOCREngine):
    """Concrete placeholder implementation for PaddleOCR."""

    def extract_text(self, image_data: bytes) -> str:
        logger.info("Executing PaddleOCR engine placeholder extraction...")
        return "[PaddleOCR Engine Text Placeholder]"


class TesseractOCREngine(BaseOCREngine):
    """Concrete placeholder implementation for Tesseract OCR."""

    def extract_text(self, image_data: bytes) -> str:
        logger.info("Executing Tesseract OCR engine placeholder extraction...")
        return "[Tesseract OCR Engine Text Placeholder]"


class OCREngineFactory:
    """Factory to construct and return specialized OCR Engine implementations."""

    @staticmethod
    def get_engine(engine_type: OCREngineType) -> BaseOCREngine:
        """Returns the appropriate OCR engine based on configured engine type.

        Args:
            engine_type: Selected OCREngineType.

        Returns:
            BaseOCREngine: Decoupled OCR interface instance.
        """
        logger.debug("Resolving OCR engine factory for type: {}", engine_type)
        if engine_type == OCREngineType.EASY_OCR:
            return EasyOCREngine()
        elif engine_type == OCREngineType.PADDLE_OCR:
            return PaddleOCREngine()
        elif engine_type == OCREngineType.TESSERACT:
            return TesseractOCREngine()
        else:
            raise ValueError(f"Unsupported OCR Engine type: {engine_type}")
