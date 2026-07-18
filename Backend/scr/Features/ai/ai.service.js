import fs from "fs";
import FormData from "form-data";
import aiClient from "../../config/axios.js";

export const health = async () => {
  const { data } = await aiClient.get("/health");
  return data;
};

export const uploadDocument = async (filePath) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const { data } = await aiClient.post("/upload", form, {
    headers: {
      ...form.getHeaders(),
    },
  });

  return data;
};

export const chat = async (payload) => {
  // AI service expects: { query, filters, session_id }
  const requestBody = {
    query: payload.question || payload.query || payload.text || '',
    filters: payload.filters || {},
    session_id: payload.session_id || `session_${Date.now()}`
  };
  
  console.log('[AI Chat Request]', requestBody);
  
  const { data } = await aiClient.post("/chat", requestBody);
  return data;
};

export const search = async (payload) => {
  const { data } = await aiClient.post("/search", payload);
  return data;
};

export const compliance = async (payload) => {
  const { data } = await aiClient.post("/compliance", payload);
  return data;
};

export const recommendation = async (payload) => {
  const { data } = await aiClient.post("/recommendation", payload);
  return data;
};

export const report = async (payload) => {
  const { data } = await aiClient.post("/reports", payload);
  return data;
};

const aiService = {
  health,
  uploadDocument,
  chat,
  search,
  compliance,
  recommendation,
  report,
};

export default aiService;