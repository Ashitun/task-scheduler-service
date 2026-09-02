# Tradeoffs

1. SQLite instead of PostgreSQL: SQLite makes the assignment easy to run from a clean clone, but PostgreSQL is better for multi-instance production deployments.
2. Polling scheduler instead of a message queue: simpler and easier to explain, but less scalable.
3. FIFO scheduling instead of priority scheduling: predictable and simple, but important tasks cannot jump the queue.
4. Restarting interrupted RUNNING tasks as WAITING: avoids losing tasks, but a task may be executed twice if it had partially completed before shutdown.
