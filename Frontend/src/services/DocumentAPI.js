import api from "./api";

export const getDocuments = async () => {
  try {
    const response = await api.get("/documents");
    const documents = response.data.data || [];
    
    return documents.map(doc => ({
      id: doc._id,
      name: doc.originalName || doc.fileName || 'Unnamed Document',
      status: doc.aiStatus || 'synced',
      detail: doc.aiStatus === 'processing' ? 'Processing...' : 
              doc.aiStatus === 'failed' ? 'Failed to process' : 
              `Uploaded ${new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}`,
      variant: doc.aiStatus === 'indexed' ? 'success' : 
               doc.aiStatus === 'processing' ? 'warning' : 
               doc.aiStatus === 'failed' ? 'danger' : 'default',
      fileName: doc.fileName,
      originalName: doc.originalName,
      documentId: doc.documentId,
      aiDocumentId: doc.aiDocumentId,  // ← ADD THIS
      uploadedAt: doc.uploadedAt,
      storageUrl: doc.storageUrl
    }));
  } catch (error) {
    console.error("Get documents error:", error);
    return [];
  }
};

export const getDocumentById = async (id) => {
  try {
    const response = await api.get(`/documents/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Get document error:", error);
    throw error;
  }
};

export const uploadDocument = async (file, projectId) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required to upload a document');
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);

    console.log('Uploading document:', {
      fileName: file.name,
      projectId: projectId
    });

    const response = await api.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Return mapped document
    const doc = response.data.data;
    return {
      id: doc._id,
      name: doc.originalName || doc.fileName || 'Unnamed Document',
      status: doc.aiStatus || 'synced',
      detail: 'Uploaded successfully',
      variant: 'success',
      fileName: doc.fileName,
      originalName: doc.originalName,
      documentId: doc.documentId
    };
  } catch (error) {
    console.error("Upload document error:", error);
    throw error;
  }
};

export const deleteDocument = async (id) => {
  try {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete document error:", error);
    throw error;
  }
};