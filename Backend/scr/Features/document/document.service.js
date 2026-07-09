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
  });

  try {
    await aiService.uploadDocument(
      req.file.path,
      document.documentId,
      document.projectId
    );

    document.aiStatus = "indexed";
    await document.save();
  } catch (err) {
    document.aiStatus = "failed";
    await document.save();

    throw err;
  }

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