from fastapi import APIRouter
from ai.api.routes import health, upload, search, chat, compliance, recommendation, reports, project

router = APIRouter()

# Register routes
router.include_router(health.router)
router.include_router(upload.router)
router.include_router(search.router)
router.include_router(chat.router)
router.include_router(compliance.router)
router.include_router(recommendation.router)
router.include_router(reports.router)
router.include_router(project.router)
