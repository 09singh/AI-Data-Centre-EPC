import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      default: "",
    },

    reportType: {
      type: String,
      enum: [
        "Compliance",
        "Risk Assessment",
        "Engineering Summary",
        "Custom",
      ],
      default: "Compliance",
    },

    reportData: {
      type: Object,
      default: {},
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Report", reportSchema);