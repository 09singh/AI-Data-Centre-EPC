import fitz  # PyMuPDF
import pdfplumber
from pathlib import Path
from typing import List, Dict, Any
from loguru import logger
from ai.document_processing.exceptions import CorruptedDocumentError, EmptyDocumentError


class PDFReader:
    """PDF reader utility with fallback support.

    Attempts extraction using PyMuPDF (fitz). If PyMuPDF fails to parse or open,
    falls back to pdfplumber.
    """

    def extract_text_by_page(self, file_path: Path) -> List[Dict[str, Any]]:
        """Extracts text from a PDF file page by page.

        Args:
            file_path: Absolute Path to the PDF file.

        Returns:
            List[Dict[str, Any]]: A list of dictionaries representing each page.
                Each dict has keys 'page_number' (1-indexed) and 'text' (str).

        Raises:
            CorruptedDocumentError: If the document is corrupted or unreadable.
            EmptyDocumentError: If no text can be extracted from any page.
        """
        logger.info("Attempting PDF text extraction with PyMuPDF for: {}", file_path.name)
        pages_content = []

        try:
            doc = fitz.open(str(file_path))
        except Exception as e:
            logger.warning(
                "PyMuPDF failed to open PDF {}: {}. Attempting pdfplumber fallback.",
                file_path.name,
                str(e)
            )
            return self._extract_with_pdfplumber(file_path)

        try:
            total_pages = len(doc)
            if total_pages == 0:
                raise EmptyDocumentError("The PDF document contains 0 pages.")

            for idx, page in enumerate(doc):
                page_num = idx + 1
                text = page.get_text()
                if not text or not text.strip():
                    logger.debug("Page {} of {} in {} is empty.", page_num, total_pages, file_path.name)
                    pages_content.append({"page_number": page_num, "text": ""})
                else:
                    pages_content.append({"page_number": page_num, "text": text})
            doc.close()
        except EmptyDocumentError:
            raise
        except Exception as e:
            logger.warning(
                "PyMuPDF extraction failed during parsing: {}. Attempting pdfplumber fallback.",
                str(e)
            )
            if 'doc' in locals():
                try:
                    doc.close()
                except Exception:
                    pass
            return self._extract_with_pdfplumber(file_path)

        # Verify if any text was extracted
        has_text = any(p["text"].strip() for p in pages_content)
        if not has_text:
            logger.warning("No text extracted using PyMuPDF. Retrying with pdfplumber.")
            try:
                plumber_content = self._extract_with_pdfplumber(file_path)
                if any(p["text"].strip() for p in plumber_content):
                    return plumber_content
            except Exception:
                pass
            raise EmptyDocumentError(f"No text extracted from PDF: {file_path.name}")

        return pages_content

    def _extract_with_pdfplumber(self, file_path: Path) -> List[Dict[str, Any]]:
        """Fallback method to extract text using pdfplumber.

        Args:
            file_path: Absolute Path to the PDF file.

        Returns:
            List[Dict[str, Any]]: Page-wise content list.
        """
        logger.info("Extracting PDF text with pdfplumber for: {}", file_path.name)
        pages_content = []
        try:
            with pdfplumber.open(file_path) as pdf:
                total_pages = len(pdf.pages)
                if total_pages == 0:
                    raise EmptyDocumentError("The PDF document contains 0 pages.")

                for idx, page in enumerate(pdf.pages):
                    page_num = idx + 1
                    text = page.extract_text()
                    if not text or not text.strip():
                        pages_content.append({"page_number": page_num, "text": ""})
                    else:
                        pages_content.append({"page_number": page_num, "text": text})
        except EmptyDocumentError:
            raise
        except Exception as e:
            logger.error("pdfplumber extraction failed for {}: {}", file_path.name, str(e))
            raise CorruptedDocumentError(f"Failed to parse PDF document: {file_path.name}. Error: {str(e)}")

        has_text = any(p["text"].strip() for p in pages_content)
        if not has_text:
            raise EmptyDocumentError(f"No text extracted from PDF: {file_path.name}")

        return pages_content
