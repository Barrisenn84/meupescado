from dotenv import load_dotenv
load_dotenv(override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .routers import (
    ponds, batches, biometry, feeding,
    water_quality, mortality, harvest, dashboard,
    ai, inventory, whatsapp, fiscal, equipment,
    commercial, reports, forecast, farm
)

# Create tables
Base.metadata.create_all(bind=engine)

# Seed realistic carciniculture data
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title="Meu Pescado - Shrimp & Carciniculture AI Intelligence",
    description="Sistema especialista em Carcinicultura (Litopenaeus vannamei), manejo de Pós-Larvas, controle por Bandejas de Alimentação, Balanço Iônico (Mg:Ca / Alcalinidade) e Inteligência Artificial Copilot.",
    version="2.0.0",
)

# CORS middleware for local Vite frontend & mobile devices on local network
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router)
app.include_router(ponds.router)
app.include_router(batches.router)
app.include_router(biometry.router)
app.include_router(feeding.router)
app.include_router(water_quality.router)
app.include_router(mortality.router)
app.include_router(harvest.router)
app.include_router(ai.router)
app.include_router(inventory.router)
app.include_router(whatsapp.router)
app.include_router(fiscal.router)
app.include_router(equipment.router)
app.include_router(commercial.router)
app.include_router(reports.router)
app.include_router(forecast.router)
app.include_router(farm.router)


import os
from fastapi import HTTPException
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

# API Health & Status
@app.get("/api/health")
def api_health():
    return {
        "app": "Meu Pescado - Carcinicultura & Pós-Larvas IA",
        "species": "Litopenaeus vannamei",
        "status": "online",
        "version": "2.0.0",
        "ai_engine": "ShrimpAI Copilot Active",
        "docs_url": "/docs"
    }

# Frontend SPA & Static Assets Serving
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.isdir(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_index():
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return api_health()

    @app.get("/{full_path:path}")
    async def serve_static_or_spa(full_path: str):
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Not Found")
else:
    @app.get("/")
    def read_root():
        return api_health()
