# AI Module Backend Integration Guide

This guide describes integration flows, endpoint signatures, and JSON response contracts for consuming the AI module.

---

## 1. End-to-End Workflow & AI Integration Flow

### Complete Upload Flow
```
Client file payload (PDF/DOCX/XLSX)
   │
   ▼
[API Route: /upload]
   │
   ▼
[DocumentProcessingPipeline]
   ├── Extracts text using PyMuPDF / pdfplumber / python-docx / openpyxl
   ├── Standardizes character layout & trims whitespace (TextCleaner)
   └── Captures system metadata (MetadataExtractor)
   │
   ▼
[Document Chunker]
   ├── splits text into character blocks
   └── maintains sliding overlaps and source page associations
   │
   ▼
[EmbeddingService]
   └── maps text chunks to 384-dimensional vector coordinate arrays
   │
   ▼
[QdrantVectorService]
   └── Upserts coordinate points into target collection in Qdrant DB
   │
   ▼
[KnowledgeService]
   └── Registers file status, chunk counts, and file metadata
   │
   ▼
Client receives UploadResponse payload
```

### Complete AI Reasoning & Chat Flow
```
User prompt string & Session ID
   │
   ▼
[API Route: /chat]
   │
   ▼
[QueryClassifier]
   └── Classifies semantic domain (Compliance, Risk, etc.)
   │
   ▼
[ConversationMemory]
   └── Retrieves recent messages to preserve conversational context
   │
   ▼
[EmbeddingService & Qdrant Search]
   └── Queries Qdrant for matching project knowledge context chunks
   │
   ▼
[Reranker & CitationEngine]
   ├── Scores and ranks matching retrieved chunks
   └── Constructs source file and page numbers references mappings
   │
   ▼
[AIOrchestrator]
   ├── Compiles prompts using formatted context, queries, and history
   └── Calls Groq Llama3 LLM API
   │
   ▼
Client receives ChatResponse with narrative text response and source citations
```

---

## 2. API Endpoints Reference & Response Contracts

All responses return standard `application/json` content.

### 1. Document Upload
* **Endpoint**: `POST /api/v1/upload`
* **Content-Type**: `multipart/form-data`
* **Response Contract (`UploadResponse`)**:
```json
{
  "document_id": "doc_fb329c8e",
  "file_name": "hvac_specs.pdf",
  "status": "indexed",
  "message": "Document uploaded, parsed into 12 chunks, and indexed in Qdrant successfully.",
  "metadata": {
    "author": "EPC Architect",
    "total_pages": 4,
    "file_size_bytes": 104857
  }
}
```

### 2. Semantic Search
* **Endpoint**: `POST /api/v1/search`
* **Request Contract (`SearchRequest`)**:
```json
{
  "query": "redundant chilled water pumps",
  "top_k": 3,
  "score_threshold": 0.5
}
```
* **Response Contract (`SearchResponse`)**:
```json
{
  "query": "redundant chilled water pumps",
  "results": [
    {
      "chunk_id": "chk_102",
      "text": "The chilled water pump loop requires N+1 redundancy.",
      "score": 0.89,
      "page_numbers": [2],
      "file_name": "hvac_specs.pdf"
    }
  ],
  "citations": [
    {
      "document_name": "hvac_specs.pdf",
      "document_id": "doc_fb329c8e",
      "chunk_id": "chk_102",
      "page_numbers": [2],
      "similarity_score": 0.89
    }
  ],
  "metadata": {
    "query_latency_seconds": 0.045,
    "top_k": 3,
    "score_threshold": 0.5,
    "filters_applied": {},
    "reranker_applied": "identity"
  }
}
```

### 3. Conversational AI Chat
* **Endpoint**: `POST /api/v1/chat`
* **Request Contract (`ChatRequest`)**:
```json
{
  "query": "Does the mechanical room require redundancy?",
  "session_id": "session_8872",
  "enable_citations": true
}
```
* **Response Contract (`ChatResponse`)**:
```json
{
  "query": "Does the mechanical room require redundancy?",
  "response": "Yes, based on the HVAC Specifications (hvac_specs.pdf), the chilled water pump loop requires N+1 redundancy.",
  "query_type": "Compliance Query",
  "citations": [
    {
      "document_name": "hvac_specs.pdf",
      "document_id": "doc_fb329c8e",
      "chunk_id": "chk_102",
      "page_numbers": [2],
      "similarity_score": 0.89
    }
  ],
  "metadata": {
    "latency_seconds": 1.2,
    "token_usage": {
      "prompt_tokens": 420,
      "completion_tokens": 110,
      "total_tokens": 530
    }
  }
}
```

### 4. Specification Compliance
* **Endpoint**: `POST /api/v1/compliance`
* **Request Contract (`ComplianceRequest`)**:
```json
{
  "document_id": "doc_fb329c8e"
}
```
* **Response Contract (`ComplianceResponse`)**:
```json
{
  "specification_name": "hvac_specs.pdf",
  "compliance_score": 0.8,
  "is_compliant": true,
  "issues_detected": [
    {
      "requirement_id": "REQ_002",
      "description": "Missing explicit secondary containment tray details.",
      "severity": "Medium",
      "suggested_fix": "Add structural drawings specifying secondary containment capacity."
    }
  ],
  "evaluated_count": 5
}
```

### 5. Document Risk Pipeline
* **Endpoint**: `GET /api/v1/project/{document_id}/risk`
* **Response Contract (`RiskResponse`)**:
```json
{
  "document_id": "doc_fb329c8e",
  "risk_level": "Medium",
  "risk_summary": "Detected minor specifications gaps (1 issues found).",
  "suggested_actions": [
    "Add structural drawings specifying secondary containment capacity."
  ]
}
```

---

## 3. Error Handling Mappings

All endpoints catch internal failures and wrap them in a standard structure. Client response status codes map to:
- `400 Bad Request` (Invalid payload types or validation issues)
- `404 Not Found` (Missing document ID profile)
- `500 Internal Server Error` (Database connection losses or model execution errors)

**Response Structure**:
```json
{
  "detail": "Failed to execute risk analysis: Document profile 'missing_id' not found in registry."
}
```
No traceback details or Python internal stack traces are returned to client endpoints.
