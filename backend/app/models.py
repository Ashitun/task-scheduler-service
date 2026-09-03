from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Table,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


# Association table for task dependencies
task_dependencies = Table(
    "task_dependencies",
    Base.metadata,

    Column(
        "task_id",
        Integer,
        ForeignKey("tasks.id"),
        primary_key=True
    ),

    Column(
        "dependency_id",
        Integer,
        ForeignKey("tasks.id"),
        primary_key=True
    )
)


class Task(Base):

    __tablename__ = "tasks"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # MySQL requires a length for VARCHAR
    name = Column(
        String(255),
        nullable=False
    )


    status = Column(
        String(50),
        default="WAITING",
        nullable=False
    )


    attempts = Column(
        Integer,
        default=0,
        nullable=False
    )


    max_retries = Column(
        Integer,
        default=3,
        nullable=False
    )


    duration = Column(
        Float,
        default=1.0,
        nullable=False
    )


    failure_rate = Column(
        Float,
        default=0.0,
        nullable=False
    )


    last_error = Column(
        String(500),
        nullable=True
    )


    created_at = Column(
        DateTime,
        server_default=func.now()
    )


    dependencies = relationship(
        "Task",

        secondary=task_dependencies,

        primaryjoin=id == task_dependencies.c.task_id,

        secondaryjoin=id == task_dependencies.c.dependency_id,

        backref="dependents"
    )