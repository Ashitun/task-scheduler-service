# Task Runner Service

A full-stack **dependency-aware task scheduling service** built for an Engineering Take-Home Assignment.

The application allows users to create and manage tasks with dependencies, concurrency limits, retry logic, cancellation, and persistent database storage.

## Features

- Task creation and management
- Task dependencies
- Circular dependency detection
- Configurable concurrency limit
- Retries with exponential backoff
- Blocked tasks when dependencies fail
- Task cancellation
- Persistent MySQL storage
- Restart recovery for interrupted running tasks
- REST API built with FastAPI
- React frontend dashboard
- Real-time UI updates through polling
- Task statistics dashboard

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- MySQL
- PyMySQL
- Uvicorn

### Frontend
- React
- Vite
- JavaScript
- CSS

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE task_runner_db;
```

Create a `.env` file inside the `backend` folder:

```text
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/task_runner_db
```

Replace `YOUR_PASSWORD` with your MySQL password.

## Run Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: `http://127.0.0.1:8000`

API Documentation: `http://127.0.0.1:8000/docs`

Health Check: `http://127.0.0.1:8000/health`

## Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Application status |
| GET | `/health` | Health check |
| POST | `/tasks` | Create a task |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/{task_id}` | Get a specific task |
| POST | `/tasks/{task_id}/cancel` | Cancel a task |
| GET | `/stats` | Get task statistics |
| GET | `/settings` | Get scheduler settings |
| PUT | `/settings` | Update concurrency limit |

# Testing

## Test Case 1: Backend Health Check

Open:

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

## Test Case 2: Create a Successful Task

| Field | Value |
|---|---|
| Task Name | Test Task |
| Dependency IDs | Empty |
| Duration | 5 |
| Failure Rate | 0 |
| Max Retries | 3 |

Expected flow:

```text
WAITING
   ↓
RUNNING
   ↓
SUCCEEDED
```

## Test Case 3: Task Dependency

Create Task A, then create Task B using Task A's ID as a dependency.

Expected behavior:

```text
Task A → SUCCEEDED → Task B → SUCCEEDED
```

Task B should not start until Task A completes successfully.

## Test Case 4: Multiple Dependencies

Create Task A and Task B, then create Task C with both as dependencies.

Expected behavior:

```text
Task A ──┐
         ├── Task C
Task B ──┘
```

Task C should start only after both dependencies succeed.

## Test Case 5: Concurrency Limit

Set the concurrency limit to:

```text
1
```

Create three long-running tasks.

Expected result:

```text
RUNNING = 1
WAITING = 2
```

Only one task should execute at a time.

## Test Case 6: Multiple Concurrent Tasks

Set the concurrency limit to:

```text
3
```

Create three tasks.

Expected result:

```text
RUNNING = 3
```

## Test Case 7: Retry Logic

Create:

| Field | Value |
|---|---|
| Task Name | Retry Test |
| Duration | 2 |
| Failure Rate | 1 |
| Max Retries | 2 |

Expected behavior:

```text
Attempt 1 → Failed → Retry
Attempt 2 → Failed → Retry
Attempt 3 → FAILED
```

## Test Case 8: Failed Dependency

Create a task with:

```text
Failure Rate: 1
Max Retries: 0
```

Then create another task depending on it.

Expected behavior:

```text
Task A → FAILED
Task B → BLOCKED
```

## Test Case 9: Cancel Waiting Task

Set concurrency to `1`, create multiple tasks, and cancel a task while it is waiting.

Expected result:

```text
WAITING → CANCELLED
```

## Test Case 10: Cancel Running Task

Create a long-running task:

```text
Duration: 20
```

Cancel it while it is running.

Expected result:

```text
RUNNING → CANCELLED
```

## Test Case 11: Invalid Dependency

Use a dependency ID that does not exist:

```text
Dependency ID: 99999
```

Expected result:

```text
404 Not Found
Dependency task 99999 not found
```

## Test Case 12: Database Persistence

1. Create tasks.
2. Stop the backend.
3. Restart the backend.
4. Refresh the frontend.

Expected result: all tasks should still exist in MySQL.

## Test Case 13: Restart Recovery

Stop the backend while a task is `RUNNING`, then restart it.

Expected behavior:

```text
RUNNING → WAITING → Scheduler executes the task again
```

# Task Status Flow

```text
WAITING
   ↓
RUNNING
   ├── Success → SUCCEEDED
   └── Failure
         ├── Retries Available → WAITING
         └── No Retries → FAILED

Dependencies Failed → BLOCKED
User Cancellation → CANCELLED
```



