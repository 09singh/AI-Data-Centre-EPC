import Report from "./report.model.js";
import aiClient from "../../config/axios.js";

export const generateReport = async (payload, userId) => {

  const { data } = await aiClient.post("/reports", {
    document_id: payload.documentId,
  });

  const report = await Report.create({
    projectId: payload.projectId,
    documentId: payload.documentId,
    title: data.title,
    summary: data.summary,
    reportType: data.report_type,
    reportData: data,
    generatedBy: userId,
  });

  return report;
};

export const getReports = async () => {
  return await Report.find()
    .populate("projectId")
    .populate("documentId")
    .populate("generatedBy");
};

export const getReport = async (id) => {
  return await Report.findById(id)
    .populate("projectId")
    .populate("documentId")
    .populate("generatedBy");
};

export const deleteReport = async (id) => {
  return await Report.findByIdAndDelete(id);
};