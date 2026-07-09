import aiClient from "../../config/axios.js";

export const health = async () => {
  const { data } = await aiClient.get("/health");
  return data;
};

export const chat = async (payload) => {
  const { data } = await aiClient.post("/chat", payload);
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
  chat,
  search,
  compliance,
  recommendation,
  report,
};

export default aiService;