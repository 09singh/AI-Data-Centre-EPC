import Project from "../project/project.model.js";
import Document from "../document/document.model.js";
import Recommendation from "../recommendation/recommendation.model.js";
import Compliance from "../compliance/compliance.model.js";
import Report from "../report/report.model.js";

const defaultTimeline = [];
const defaultAlerts = [];
const defaultRecommendations = [];
const defaultMilestones = [];

function mapRiskLevelToVariant(riskLevel) {
  switch ((riskLevel || "").toLowerCase()) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "accent";
    case "low":
    default:
      return "success";
  }
}

function mapComplianceToAlerts(compliances) {
  // compliances: [{ riskLevel, violations, ... }]
  const alerts = [];

  for (const c of compliances) {
    const riskLevel = c.riskLevel || "Low";
    const variant = mapRiskLevelToVariant(riskLevel);

    if (Array.isArray(c.violations) && c.violations.length > 0) {
      const first = c.violations[0];
      alerts.push({
        variant: variant === "accent" ? "success" : variant === "success" ? "success" : variant,
        icon:
          variant === "danger"
            ? "ti-alert-triangle"
            : variant === "warning"
              ? "ti-alert-circle"
              : "ti-info-circle",
        title: first.title || "Compliance violation detected",
        subtitle: first.description || `Risk level: ${riskLevel}`,
      });
    } else {
      alerts.push({
        variant: variant === "accent" ? "success" : variant,
        icon: "ti-info-circle",
        title: "Compliance summary",
        subtitle: `Risk level: ${riskLevel}`,
      });
    }
  }

  return alerts.slice(0, 3);
}

function mapRecommendations(recommendations) {
  return (recommendations || []).slice(0, 3).map((r) => ({
    title: r.title || "Recommendation",
    description: r.description || r.aiResponse?.description || "",
    action: r.priority === "Critical" ? "Follow Up" : "Explore Options",
  }));
}

function computeProgressFromProjects(projects) {
  // project.status: Planning | In Progress | Completed | On Hold
  // simple mapping for now
  const map = {
    Planning: 20,
    "In Progress": 65,
    Completed: 100,
    "On Hold": 35,
  };

  if (!projects || projects.length === 0) return { progress: 0, milestones: defaultMilestones };

  const progress = Math.round(
    projects.reduce((sum, p) => sum + (map[p.status] ?? 0), 0) / projects.length
  );

  // milestone cards for existing UI: 4 fixed phases
  // best effort: derive from document/compliance presence
  const milestones = [
    { label: "Design Complete", progress: Math.min(100, Math.max(0, progress)), color: "var(--success)" },
    { label: "Procurement", progress: Math.min(100, Math.max(0, Math.round(progress * 0.65))), color: "var(--warning)" },
    { label: "Construction", progress: Math.min(100, Math.max(0, Math.round(progress * 0.55))), color: "var(--accent)" },
    { label: "Commissioning", progress: Math.min(100, Math.max(0, Math.round(progress * 0.2))), color: "var(--muted)" },
  ];

  return { progress, milestones };
}

function computeHealthScore({ compliances, documents }) {
  const indexed = (documents || []).filter((d) => d.aiStatus === "indexed").length;
  const totalDocs = documents?.length || 0;
  const docScore = totalDocs === 0 ? 50 : Math.round((indexed / totalDocs) * 100);

  const criticalCount = (compliances || []).filter((c) => c.riskLevel === "Critical").length;
  const highCount = (compliances || []).filter((c) => c.riskLevel === "High").length;
  const riskPenalty = criticalCount * 12 + highCount * 6;

  return Math.max(0, Math.min(100, Math.round(docScore - riskPenalty)));
}

function computeActiveRisks(compliances) {
  const critical = (compliances || []).filter((c) => c.riskLevel === "Critical").length;
  const high = (compliances || []).filter((c) => c.riskLevel === "High").length;
  const medium = (compliances || []).filter((c) => c.riskLevel === "Medium").length;
  return critical + high + medium;
}

function computeUpcomingMilestones(projects) {
  // UI expects count only
  if (!projects || projects.length === 0) return 0;
  return projects.filter((p) => p.status === "In Progress").length + 1;
}

function computeTimeline({ documents, recommendations, compliances }) {
  // Best effort timeline using stored timestamps.
  const events = [];

  for (const d of documents || []) {
    events.push({
      title: "Document processed",
      description: d.originalName || d.fileName || "Document updated",
      time: "just now",
      color: "var(--accent)",
    });
  }

  for (const r of recommendations || []) {
    events.push({
      title: "Recommendation generated",
      description: r.title,
      time: "recently",
      color: "var(--warning)",
    });
  }

  for (const c of compliances || []) {
    events.push({
      title: "Compliance updated",
      description: `Risk level: ${c.riskLevel}`,
      time: "recently",
      color: "var(--success)",
    });
  }

  return events.slice(0, 4);
}

async function buildDashboardData(userId) {
  // fetch per-user data via createdBy / uploadedBy
  const projects = await Project.find({ createdBy: userId }).lean();
  const documents = await Document.find({ uploadedBy: userId }).sort({ uploadedAt: -1 }).limit(10).lean();

  // recommendations/compliance/report are linked by projectId/documentId, but we don't have user scoping on those models.
  // We'll join by projectId for projects the user created.
  const projectIds = projects.map((p) => p._id);

  const compliances = await Compliance.find({ projectId: { $in: projectIds } })
    .sort({ generatedAt: -1 })
    .limit(10)
    .lean();

  const recommendations = await Recommendation.find({ projectId: { $in: projectIds } })
    .sort({ priority: 1 })
    .limit(10)
    .lean();

  const progressData = computeProgressFromProjects(projects);
  const healthScore = computeHealthScore({ compliances, documents });
  const activeRisks = computeActiveRisks(compliances);
  const upcomingMilestones = computeUpcomingMilestones(projects);

  const alerts = mapComplianceToAlerts(compliances);
  const recommendationCards = mapRecommendations(recommendations);

  const timeline = computeTimeline({ documents, recommendations, compliances });

  return {
    healthScore,
    progress: progressData.progress,
    activeRisks,
    upcomingMilestones,
    aiInsights: alerts.length ? alerts[0].subtitle : "AI analysis is stable — no critical items right now.",
    alerts,
    recommendations: recommendationCards,
    timeline,
    milestones: progressData.milestones,
  };
}

export async function buildDashboard(userId) {
  return buildDashboardData(userId);
}


