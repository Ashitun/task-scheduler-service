# Task Runner Service

A full-stack task scheduler built for the Engineering Take-Home Assignment.

## Features
- Task dependencies
- Circular dependency detection
- Configurable concurrency limit
- Retries with exponential backoff
- Blocked tasks when dependencies fail
- Cancellation
- Persistent SQLite storage
- Restart recovery for interrupted running tasks
- REST API and React frontend

## Run Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000

## Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
