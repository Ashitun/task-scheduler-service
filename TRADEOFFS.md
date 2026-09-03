# Tradeoffs

## 1. MySQL

MySQL is used for persistent task storage.

**Tradeoff:** PostgreSQL could provide more advanced features for larger production systems.

## 2. Polling Scheduler

The scheduler regularly checks the database for tasks that are ready to run.

**Tradeoff:** This is simple but may create extra database queries. A message queue could be more scalable.

## 3. FIFO Scheduling

Tasks are processed in creation order.

**Tradeoff:** Important tasks cannot move ahead of older tasks.

## 4. Restart Recovery

Tasks that were `RUNNING` during a shutdown are changed back to `WAITING`.

**Tradeoff:** A task may run again if it was partially completed before the shutdown.

## 5. Frontend Polling

The React frontend regularly requests task updates from the backend.

**Tradeoff:** WebSockets could provide more efficient real-time updates.