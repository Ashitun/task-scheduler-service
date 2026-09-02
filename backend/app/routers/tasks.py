from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Task
from ..schemas import TaskCreate, TaskOut, StatsOut, Settings
from ..scheduler import scheduler


router = APIRouter(
    tags=["Tasks"]
)


# Convert Task database object to response
def serialize(task):

    return {
        "id": task.id,
        "name": task.name,
        "status": task.status,
        "attempts": task.attempts,
        "max_retries": task.max_retries,
        "duration": task.duration,
        "failure_rate": task.failure_rate,
        "last_error": task.last_error,
        "created_at": task.created_at,
        "dependency_ids": [
            dependency.id
            for dependency in task.dependencies
        ],
    }


# Circular dependency validation
def creates_cycle(db):

    graph = {}

    for task in db.query(Task).all():

        graph[task.id] = [
            dependency.id
            for dependency in task.dependencies
        ]


    visiting = set()
    visited = set()


    def dfs(node):

        if node in visiting:
            return True

        if node in visited:
            return False

        visiting.add(node)

        for next_node in graph.get(node, []):

            if dfs(next_node):
                return True

        visiting.remove(node)
        visited.add(node)

        return False


    return any(
        dfs(node)
        for node in graph
    )


# Create Task
@router.post(
    "/tasks",
    response_model=TaskOut
)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db)
):

    dependencies = []

    # Validate dependency IDs
    for dependency_id in data.dependency_ids:

        dependency = db.get(
            Task,
            dependency_id
        )

        if not dependency:

            raise HTTPException(
                status_code=404,
                detail=f"Dependency task {dependency_id} not found"
            )

        dependencies.append(dependency)


    # Create task
    task = Task(
        name=data.name,
        max_retries=data.max_retries,
        duration=data.duration,
        failure_rate=data.failure_rate,
    )

    task.dependencies = dependencies

    db.add(task)
    db.commit()
    db.refresh(task)

    return serialize(task)


# Get all tasks
@router.get(
    "/tasks",
    response_model=List[TaskOut]
)
def list_tasks(
    db: Session = Depends(get_db)
):

    tasks = (
        db.query(Task)
        .order_by(Task.id.desc())
        .all()
    )

    return [
        serialize(task)
        for task in tasks
    ]


# Get single task
@router.get(
    "/tasks/{task_id}",
    response_model=TaskOut
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = db.get(
        Task,
        task_id
    )

    if not task:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return serialize(task)


# Cancel task
@router.post(
    "/tasks/{task_id}/cancel",
    response_model=TaskOut
)
def cancel_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = db.get(
        Task,
        task_id
    )

    if not task:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if task.status in [
        "SUCCEEDED",
        "FAILED"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Finished tasks cannot be cancelled"
        )


    task.status = "CANCELLED"

    db.commit()
    db.refresh(task)

    return serialize(task)


# Statistics
@router.get(
    "/stats",
    response_model=StatsOut
)
def get_stats(
    db: Session = Depends(get_db)
):

    def count(status):

        return (
            db.query(Task)
            .filter(Task.status == status)
            .count()
        )


    return {
        "running": count("RUNNING"),
        "waiting": count("WAITING"),
        "succeeded": count("SUCCEEDED"),
        "failed": count("FAILED"),
        "blocked": count("BLOCKED"),
        "cancelled": count("CANCELLED"),
    }


# Get scheduler settings
@router.get("/settings")
def get_settings():

    return {
        "concurrency_limit": scheduler.limit
    }


# Update concurrency limit
@router.put("/settings")
def update_settings(
    settings: Settings
):

    scheduler.set_limit(
        settings.concurrency_limit
    )

    return {
        "concurrency_limit": scheduler.limit
    }