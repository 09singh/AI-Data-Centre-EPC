import { randomUUID } from "crypto";
import Document from "./document.model.js";
import aiService from "../ai/ai.service.js";

export const uploadDocument = async (req) => {
  const documentId = randomUUID();

  const document = await Document.create({
    projectId: req.body.projectId,
    uploadedBy: req.user.id,
    documentId,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    storageUrl: req.file.path,
    aiStatus: "processing",
    aiDocumentId: null, // Add this field
  });

  // ============= INDEX DOCUMENT IN AI SERVICE =============
  try {
    const aiResponse = await aiService.uploadDocument(req.file.path);
    
    // Store the AI document ID from the response
    if (aiResponse && aiResponse.document_id) {
      document.aiDocumentId = aiResponse.document_id;
      console.log(`✅ AI Document ID: ${aiResponse.document_id}`);
    }
    
    document.aiStatus = "indexed";
    await document.save();
    console.log(`✅ Document ${documentId} (${document.originalName}) indexed in AI service successfully`);
  } catch (err) {
    console.error(`❌ Failed to index document ${documentId}:`, err.message);
    document.aiStatus = "failed";
    await document.save();
  }
  // ========================================================

  return document;
};

export const getDocuments = async (userId) => {
  return await Document.find({
    uploadedBy: userId,
  });
};

export const getDocument = async (id) => {
  return await Document.findById(id);
};

export const deleteDocument = async (id) => {
  return await Document.findByIdAndDelete(id);
};  