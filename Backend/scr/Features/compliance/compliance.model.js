import mongoose from "mongoose";

const complianceSchema = new mongoose.Schema(
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

    complianceScore: {
      type: Number,
      default: 0,
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    violations: [
      {
        title: String,
        description: String,
        severity: String,
      },
    ],

    recommendations: [
      {
        type: String,
      },
    ],

    aiResponse: {
      type: Object,
      default: {},
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

export default mongoose.model("Compliance", complianceSchema);