from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .models import Task
from .scheduler import scheduler
from .routers.tasks import router as task_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Task Scheduler Service",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Application startup
@app.on_event("startup")
async def startup():

    db = SessionLocal()

    try:
        # If the application stopped while a task was RUNNING,
        # move it back to WAITING so it can run again.
        db.query(Task).filter(
            Task.status == "RUNNING"
        ).update({
            "status": "WAITING"
        })

        db.commit()

    finally:
        db.close()

    # Start the scheduler
    await scheduler.start()


# Application shutdown
@app.on_event("shutdown")
async def shutdown():

    # Stop the scheduler safely
    await scheduler.stop()


# Register API routes
app.include_router(task_router)


# Optional health check API
@app.get("/")
def root():

    return {
        "message": "Task Scheduler Service is running"
    }


@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }