import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "EPC Solutions",
    },

    location: {
      type: String,
      default: "Mumbai, India",
    },

    status: {
      type: String,
      enum: [
        "Planning",
        "In Progress",
        "Completed",
        "On Hold",
      ],
      default: "In Progress",
    },

    startDate: {
      type: String,
      default: "2026-01-15",
    },

    endDate: {
      type: String,
      default: "2026-12-15",
    },

    schedule: {
      type: Array,
      default: [],
    },

    vendors: {
      type: Array,
      default: [],
    },

    equipment: {
      type: Array,
      default: [],
    },

    commissioning: {
      type: Object,
      default: {
        readinessScore: 0,
        systems: [],
        ncrData: [],
        timeline: [],
        aiRecommendations: [],
      },
    },

    reports: {
      type: Array,
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);