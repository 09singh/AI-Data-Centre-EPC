from fastapi.testclient import TestClient
from ai.app import app
from ai.config.settings import settings

client = TestClient(app)

def test_health_endpoint():
    """Verifies that the /health endpoint returns 200 OK and expected status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    
    data = response.json()
    assert "status" in data
    assert "environment" in data
    assert data["status"] == "ok"
    assert data["environment"] == settings.APP_ENV

def test_version_endpoint():
    """Verifies that the /version endpoint returns 200 OK and accurate application metadata."""
    response = client.get("/api/v1/version")
    assert response.status_code == 200
    
    data = response.json()
    assert "version" in data
    assert "name" in data
    assert data["version"] == settings.VERSION
    assert data["name"] == settings.APP_NAME
