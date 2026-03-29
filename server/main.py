import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes.auth_routes import router as auth_router
from routes.session_routes import router as session_router
from llm import check_llm_status

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Initialize FastAPI app
app = FastAPI(
    title="Aether API",
    description="AI-powered therapy companion backend",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(session_router)


@app.on_event("startup")
def startup():
    """Initialize database on startup."""
    init_db()
    logging.info("✦ Aether API started")


@app.get("/health")
async def health():
    llm_ok = await check_llm_status()
    return {
        "status": "ok" if llm_ok else "degraded",
        "service": "aether",
        "llm_connected": llm_ok
    }
