import Recommendation from "./recommendation.model.js";
import aiClient from "../../config/axios.js";

export const generateRecommendations = async (payload) => {

  const { data } = await aiClient.post("/recommendation", {
    document_id: payload.documentId,
  });

  const recommendations = [];

  for (const item of data.recommendations) {

    const recommendation = await Recommendation.create({
      projectId: payload.projectId,
      documentId: payload.documentId,
      priority: item.priority,
      category: item.category,
      title: item.title,
      description: item.description,
      aiResponse: item,
    });

    recommendations.push(recommendation);
  }

  return recommendations;
};

export const getRecommendations = async () => {
  return Recommendation.find()
    .populate("projectId")
    .populate("documentId");
};

export const getRecommendation = async (id) => {
  return Recommendation.findById(id)
    .populate("projectId")
    .populate("documentId");
};

export const updateStatus = async (id, status) => {
  return Recommendation.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};