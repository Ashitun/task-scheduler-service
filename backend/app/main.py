from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .models import Task
from .scheduler import scheduler
from .routers.tasks import router as task_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Task Runner Service"
)


# CORS
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


@app.on_event("startup")
async def startup():

    db = SessionLocal()

    try:
        # Recover tasks interrupted during restart
        db.query(Task).filter(
            Task.status == "RUNNING"
        ).update({
            "status": "WAITING"
        })

        db.commit()

    finally:
        db.close()

    await scheduler.start()


@app.on_event("shutdown")
async def shutdown():

    await scheduler.stop()


# Include API router
app.include_router(task_router)