import asyncio, random
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Task

class Scheduler:
    def __init__(self, limit=3):
        self.limit = limit
        self.running = set()
        self.loop_task = None
        self.stop_event = asyncio.Event()

    async def start(self):
        self.stop_event.clear()
        self.loop_task = asyncio.create_task(self.run())

    async def stop(self):
        self.stop_event.set()
        if self.loop_task:
            self.loop_task.cancel()

    def set_limit(self, limit):
        self.limit = limit

    def dependency_status(self, task):
        return [d.status for d in task.dependencies]

    def has_failed_dependency(self, task):
        return any(s in ("FAILED", "BLOCKED", "CANCELLED") for s in self.dependency_status(task))

    def ready(self, task):
        return task.status == "WAITING" and all(s == "SUCCEEDED" for s in self.dependency_status(task))

    async def execute(self, task_id):
        db = SessionLocal()
        try:
            task = db.get(Task, task_id)
            if not task or task.status != "WAITING":
                return
            task.status = "RUNNING"
            task.attempts += 1
            db.commit()

            await asyncio.sleep(task.duration)

            task = db.get(Task, task_id)
            if task.status == "CANCELLED":
                return

            if random.random() < task.failure_rate:
                if task.attempts <= task.max_retries:
                    task.status = "WAITING"
                    task.last_error = f"Attempt {task.attempts} failed; retry scheduled"
                    db.commit()
                    await asyncio.sleep(min(2 ** task.attempts, 10))
                else:
                    task.status = "FAILED"
                    task.last_error = "Maximum retries exceeded"
                    db.commit()
            else:
                task.status = "SUCCEEDED"
                task.last_error = None
                db.commit()
        finally:
            self.running.discard(task_id)
            db.close()

    async def run(self):
        while not self.stop_event.is_set():
            db = SessionLocal()
            try:
                tasks = db.query(Task).filter(Task.status == "WAITING").order_by(Task.id).all()

                for task in tasks:
                    if self.has_failed_dependency(task):
                        task.status = "BLOCKED"
                db.commit()

                available = max(0, self.limit - len(self.running))
                if available:
                    ready_tasks = [t for t in tasks if self.ready(t)]
                    for task in ready_tasks[:available]:
                        if task.id not in self.running:
                            self.running.add(task.id)
                            asyncio.create_task(self.execute(task.id))
            finally:
                db.close()

            await asyncio.sleep(0.5)

scheduler = Scheduler()
