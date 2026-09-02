# Design

## Scenario
This service simulates a document-processing pipeline. Tasks can represent extracting text, validating a document, generating embeddings, or storing results.

## Concurrency
A scheduler uses an asyncio semaphore. Every task must acquire the semaphore before execution, so the configured limit cannot be exceeded.

## Restart behaviour
Tasks stored as RUNNING during an unexpected shutdown are changed back to WAITING on startup. This can cause a task to run again, but prevents work from being forgotten.

## Scheduling rule
Ready tasks are selected by creation order (FIFO). A downside is that a short important task may wait behind older tasks.

## Cancellation
Cancelling a task marks it CANCELLED. Tasks depending on it become BLOCKED because their required dependency will never succeed.

## Improvement
The service records a task event/history log so an operator can understand retries, failures, blocking, and cancellation.

## Correctness invariant
A task may run only when all its dependencies have SUCCEEDED. This is enforced in the scheduler's dependency check.
