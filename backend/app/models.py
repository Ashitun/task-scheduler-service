from sqlalchemy import Column, Integer, String, Float, DateTime, Table, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

task_dependencies = Table(
    "task_dependencies",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id"), primary_key=True),
    Column("dependency_id", Integer, ForeignKey("tasks.id"), primary_key=True),
)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    status = Column(String, default="WAITING", index=True)
    attempts = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    duration = Column(Float, default=2.0)
    failure_rate = Column(Float, default=0.2)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dependencies = relationship(
        "Task",
        secondary=task_dependencies,
        primaryjoin=id == task_dependencies.c.task_id,
        secondaryjoin=id == task_dependencies.c.dependency_id,
    )
