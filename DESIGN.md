# Design

## Scenario

This service simulates a task processing system. Tasks can represent operations like extracting text, validating documents, generating embeddings, or storing results.

## Architecture

- FastAPI for the backend
- React for the frontend
- MySQL for persistent storage
- SQLAlchemy for database operations
- Async scheduler for task execution

## Concurrency

The scheduler uses an `asyncio.Semaphore` to control how many tasks can run at the same time.

The concurrency limit can be changed through the API and frontend.

## Dependencies

A task runs only when all its dependencies have successfully completed.

If a dependency fails, the dependent task becomes `BLOCKED`.

## Retry

If a task fails and retries are available, it is executed again using retry logic.

If all retries fail, the task becomes `FAILED`.

## Cancellation

A user can cancel a waiting or running task.

The task status becomes `CANCELLED`.

## Restart Recovery

If the application stops while a task is `RUNNING`, the task is changed back to `WAITING` when the application starts again.

## Correctness Rule

A task can run only when:

- All dependencies are `SUCCEEDED`
- The concurrency limit allows execution
- The task is not cancelled