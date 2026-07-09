import * as service from "./document.service.js";

export const uploadDocument = async (req, res, next) => {
  try {
    const data = await service.uploadDocument(req);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await service.getDocuments(req.user.id);

    res.json({
      success: true,
      data: documents,
    });
  } catch (err) {
    next(err);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await service.getDocument(req.params.id);

    res.json({
      success: true,
      data: document,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    await service.deleteDocument(req.params.id);

    res.json({
      success: true,
      message: "Document deleted",
    });
  } catch (err) {
    next(err);
  }
};