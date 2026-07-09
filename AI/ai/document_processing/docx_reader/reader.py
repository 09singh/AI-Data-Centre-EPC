from pathlib import Path
from typing import List, Dict, Any
import docx
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table as DocxTable
from docx.text.paragraph import Paragraph as DocxParagraph
from loguru import logger
from ai.document_processing.exceptions import CorruptedDocumentError, EmptyDocumentError


class DOCXReader:
    """DOCX document reader.

    Extracts paragraphs and tables while preserving the structural reading order.
    """

    def extract_content(self, file_path: Path) -> List[Dict[str, Any]]:
        """Extracts text and tables in the exact reading order.

        Args:
            file_path: Absolute Path to the DOCX file.

        Returns:
            List[Dict[str, Any]]: List of dictionary elements representing parts of the document.
                Each dict has keys 'type' ('paragraph' or 'table') and 'text' (str).

        Raises:
            CorruptedDocumentError: If python-docx fails to open or parse the document.
            EmptyDocumentError: If the document contains no extractable content.
        """
        logger.info("Extracting content from DOCX file: {}", file_path.name)
        elements = []

        try:
            doc = docx.Document(str(file_path))
        except Exception as e:
            logger.error("python-docx failed to open DOCX {}: {}", file_path.name, str(e))
            raise CorruptedDocumentError(f"Failed to open or parse DOCX document: {file_path.name}. Error: {str(e)}")

        try:
            body = doc.element.body
            for child in body.iterchildren():
                if isinstance(child, CT_P):
                    paragraph = DocxParagraph(child, doc)
                    text = paragraph.text
                    if text and text.strip():
                        elements.append({"type": "paragraph", "text": text})
                elif isinstance(child, CT_Tbl):
                    table = DocxTable(child, doc)
                    table_md = self._table_to_markdown(table)
                    if table_md.strip():
                        elements.append({"type": "table", "text": table_md})
        except Exception as e:
            logger.error("Error occurred while parsing DOCX file structure {}: {}", file_path.name, str(e))
            raise CorruptedDocumentError(f"Failed to process DOCX file structure: {file_path.name}. Error: {str(e)}")

        if not elements:
            raise EmptyDocumentError(f"No content extracted from DOCX document: {file_path.name}")

        return elements

    def _table_to_markdown(self, table: DocxTable) -> str:
        """Converts a DOCX Table into Markdown table format to preserve layout.

        Args:
            table: The DocxTable element.

        Returns:
            str: Markdown table representation.
        """
        markdown_rows = []
        try:
            for r_idx, row in enumerate(table.rows):
                # Replace line breaks in cells with spaces to maintain single line row cells in Markdown
                row_cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
                markdown_rows.append("| " + " | ".join(row_cells) + " |")

                # Add standard Markdown table separator under header row
                if r_idx == 0 and len(table.rows) > 1:
                    separators = ["---"] * len(row_cells)
                    markdown_rows.append("| " + " | ".join(separators) + " |")
        except Exception as e:
            logger.warning("Error formatting DOCX table to markdown: {}", str(e))
            # Fallback to simple CSV-like format for cells
            simple_rows = []
            for row in table.rows:
                simple_rows.append(", ".join(c.text.strip() for c in row.cells))
            return "\n".join(simple_rows)

        return "\n".join(markdown_rows)
