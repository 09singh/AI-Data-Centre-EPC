# Frontend ↔ Backend Integration (Remove Mock Data) — TODO

## Phase 0 — Audit (confirmed)
- [x] Backend JWT login works and dashboard/report/ai/project routes exist.
- [ ] Frontend mock data must be removed everywhere (setTimeout + hardcoded arrays).

## Phase 1 — Services: remove mocks (start here)
- [ ] `Frontend/src/services/ProjectAPI.js`: replace mocked `getProjectSummary()` with real `GET /api/projects` and/or `GET /api/projects/:id`.
- [ ] `Frontend/src/services/ReportAPI.js`: replace mocked `getReports()` with real `GET /api/reports`.
- [ ] Ensure all service requests attach `Authorization: Bearer <token>`.

## Phase 2 — Pages: remove mock datasets and setTimeout
- [ ] `Frontend/src/pages/Dashboard.jsx`: remove local `riskTrend` and `milestoneData`; render from `GET /api/dashboard`.
- [ ] `Frontend/src/pages/Reports.jsx`: remove `reports = [...]`; call `getReports()`; remove fake AI generation delay.
- [ ] `Frontend/src/pages/Commissioning.jsx`: replace all `readinessData/systems/ncrData/timeline/aiRecommendations` with backend data.
- [ ] `Frontend/src/pages/AIIntelligence.jsx`: replace all local `risks/complianceDocs/scenarios` and simulation `setTimeout` with AI backend responses.
- [ ] `Frontend/src/pages/ProjectHub.jsx`: remove mocked `tasks/vendorsData/equipmentData` and render from backend.
- [ ] `Frontend/src/pages/AIProjectBrain.jsx`: remove initial hardcoded messages (start empty or backend-derived).

## Phase 3 — ProjectHub uploads: enforce `selectedProject._id`
- [ ] Add “selected project” fetch/load (from `GET /api/projects`).
- [ ] Update `uploadDocument(file, { projectId: selectedProject._id })`.

## Phase 4 — Verification
- [ ] No remaining `setTimeout(() => resolve(` mock services.
- [ ] No remaining hardcoded arrays for core datasets (dashboard, reports, commissioning, AI intelligence, project hub schedule).
- [ ] All frontend services call backend and handle loading/error.

## Deliverables checklist (per task requirements)
- [ ] List every modified file.
- [ ] List every new backend endpoint added.
- [ ] List every removed mock file / removed mock code.
- [ ] List response shape changes.
- [ ] List remaining blockers.

