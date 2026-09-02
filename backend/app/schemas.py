from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TaskCreate(BaseModel):
    name: str
    dependency_ids: List[int] = []
    max_retries: int = Field(default=3, ge=0, le=10)
    duration: float = Field(default=2.0, ge=0.1, le=30)
    failure_rate: float = Field(default=0.2, ge=0, le=1)

class TaskOut(BaseModel):
    id: int
    name: str
    status: str
    attempts: int
    max_retries: int
    duration: float
    failure_rate: float
    last_error: Optional[str] = None
    created_at: Optional[datetime] = None
    dependency_ids: List[int] = []

class StatsOut(BaseModel):
    running: int
    waiting: int
    succeeded: int
    failed: int
    blocked: int
    cancelled: int

class Settings(BaseModel):
    concurrency_limit: int = Field(default=3, ge=1, le=20)
