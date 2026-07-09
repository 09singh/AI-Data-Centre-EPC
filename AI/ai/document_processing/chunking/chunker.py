import hashlib
from typing import List, Dict, Any, Optional
from loguru import logger
from ai.document_processing.models import DocumentChunk


class Chunker:
    """Configurable text chunker for document extraction.

    Splits raw blocks of text into standard sizes with overlaps, preserving
    associated page references, nearest headings, and generating unique IDs.
    """

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """Initializes the Chunker instance with window options.

        Args:
            chunk_size: Target maximum size of each chunk in characters.
            chunk_overlap: Overlap width between consecutive chunks in characters.
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        # Ensure bounds safety
        if self.chunk_overlap >= self.chunk_size:
            logger.warning(
                "Chunk overlap ({}) is larger than chunk size ({}). Setting overlap to 20% of size.",
                self.chunk_overlap,
                self.chunk_size
            )
            self.chunk_overlap = int(self.chunk_size * 0.2)

    def chunk_document(self, file_hash: str, blocks: List[Dict[str, Any]]) -> List[DocumentChunk]:
        """Splits document blocks into structured chunks.

        Args:
            file_hash: Unique identifier of the file (used for unique chunk IDs).
            blocks: List of dicts representing structured document blocks:
                Each block should contain keys:
                - 'text': str (cleaned text of paragraph/page/table)
                - 'page_number': int (1-indexed page or sheet reference)
                - 'section_heading': Optional[str] (associated section heading)

        Returns:
            List[DocumentChunk]: Strongly typed chunks list.
        """
        if not blocks:
            logger.warning("Empty blocks passed to chunker.")
            return []

        logger.info(
            "Chunking document with size={}, overlap={}, total blocks={}",
            self.chunk_size,
            self.chunk_overlap,
            len(blocks)
        )

        # 1. Build concatenated text and map character ranges to blocks
        full_text = ""
        block_mappings = []  # list of tuples: (start_idx, end_idx, metadata_dict)
        current_heading = None

        for block in blocks:
            text = block.get("text") or ""
            if not text:
                continue

            # Detect or maintain current section heading context
            heading = block.get("section_heading")
            if heading:
                current_heading = heading
            else:
                # Basic engineering section heading detector heuristic
                text_strip = text.strip()
                if 3 < len(text_strip) < 80 and (
                    text_strip.isupper() or
                    any(text_strip.startswith(str(i) + ".") for i in range(1, 20))
                ):
                    current_heading = text_strip

            start_idx = len(full_text)
            full_text += text + "\n"
            end_idx = len(full_text)

            block_mappings.append((
                start_idx,
                end_idx,
                {
                    "page_number": block.get("page_number", 1),
                    "section_heading": current_heading
                }
            ))

        if not full_text.strip():
            return []

        chunks = []
        text_len = len(full_text)
        start = 0
        chunk_idx = 0

        while start < text_len:
            # Approximate end index
            end = min(start + self.chunk_size, text_len)

            # Avoid splitting words: lookup word boundaries
            if end < text_len:
                chunk_text = full_text[start:end]
                last_space = chunk_text.rfind(" ")
                last_newline = chunk_text.rfind("\n")
                boundary = max(last_space, last_newline)
                # If there's a space/newline within the second half of the chunk, split there
                if boundary > self.chunk_size // 2:
                    end = start + boundary + 1

            chunk_text = full_text[start:end].strip()

            # Skip empty chunks
            if not chunk_text:
                start += (self.chunk_size - self.chunk_overlap)
                continue

            # Map chunk back to page numbers and section headings using character overlap
            pages = set()
            headings = []

            for b_start, b_end, b_meta in block_mappings:
                # Overlap check
                if max(start, b_start) < min(end, b_end):
                    pages.add(b_meta["page_number"])
                    if b_meta["section_heading"] and b_meta["section_heading"] not in headings:
                        headings.append(b_meta["section_heading"])

            # Generate unique chunk ID using file_hash and block details
            hasher = hashlib.md5()
            hasher.update(f"{file_hash}_{start}_{end}_{chunk_text}".encode("utf-8"))
            unique_chunk_id = hasher.hexdigest()

            chunk_obj = DocumentChunk(
                chunk_id=unique_chunk_id,
                text=chunk_text,
                page_numbers=sorted(list(pages)) if pages else [1],
                section_heading=headings[-1] if headings else None,
                chunk_metadata={
                    "start_char": start,
                    "end_char": end,
                    "length": len(chunk_text),
                    "index": chunk_idx
                }
            )
            chunks.append(chunk_obj)

            # Check termination
            if end >= text_len:
                break

            # Advance window
            chunk_idx += 1
            start = end - self.chunk_overlap
            if start >= text_len:
                break

        return chunks
