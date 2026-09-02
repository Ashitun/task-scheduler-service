import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [name, setName] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [duration, setDuration] = useState(2);
  const [failureRate, setFailureRate] = useState(0.2);
  const [maxRetries, setMaxRetries] = useState(3);
  const [limit, setLimit] = useState(3);
  const [message, setMessage] = useState("");

  // Load everything when the application starts
  const loadInitialData = async () => {
    try {
      const [
        tasksResponse,
        statsResponse,
        settingsResponse
      ] = await Promise.all([
        fetch(`${API}/tasks`),
        fetch(`${API}/stats`),
        fetch(`${API}/settings`)
      ]);

      if (
        !tasksResponse.ok ||
        !statsResponse.ok ||
        !settingsResponse.ok
      ) {
        throw new Error("Backend request failed");
      }

      const tasksData = await tasksResponse.json();
      const statsData = await statsResponse.json();
      const settingsData = await settingsResponse.json();

      setTasks(tasksData);
      setStats(statsData);
      setLimit(settingsData.concurrency_limit);

      // Backend is working, so remove old error message
      setMessage("");

    } catch (error) {
      console.error("Backend error:", error);
      setMessage("Backend is not running.");
    }
  };

  // Refresh only tasks and stats
  const loadTasksAndStats = async () => {
    try {
      const [tasksResponse, statsResponse] = await Promise.all([
        fetch(`${API}/tasks`),
        fetch(`${API}/stats`)
      ]);

      if (!tasksResponse.ok || !statsResponse.ok) {
        throw new Error("Backend request failed");
      }

      const tasksData = await tasksResponse.json();
      const statsData = await statsResponse.json();

      setTasks(tasksData);
      setStats(statsData);

      // Clear backend error if connection works again
      setMessage((currentMessage) =>
        currentMessage === "Backend is not running."
          ? ""
          : currentMessage
      );

    } catch (error) {
      console.error("Backend error:", error);
      setMessage("Backend is not running.");
    }
  };

  // Run when application starts
  useEffect(() => {
    loadInitialData();

    // Refresh task status every 2 seconds
    const timer = setInterval(() => {
      loadTasksAndStats();
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Create a new task
  const submit = async (e) => {
    e.preventDefault();

    try {
      const dependency_ids = dependencies.trim()
        ? dependencies
            .split(",")
            .map((x) => Number(x.trim()))
            .filter(Boolean)
        : [];

      const response = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          dependency_ids: dependency_ids,
          duration: Number(duration),
          failure_rate: Number(failureRate),
          max_retries: Number(maxRetries)
        })
      });

      if (response.ok) {
        setMessage("Task created successfully.");

        setName("");
        setDependencies("");

        await loadTasksAndStats();
      } else {
        const errorData = await response.json();

        setMessage(
          errorData.detail || "Error creating task."
        );
      }

    } catch (error) {
      console.error("Create task error:", error);
      setMessage("Could not connect to the backend.");
    }
  };

  // Cancel a task
  const cancel = async (id) => {
    try {
      const response = await fetch(
        `${API}/tasks/${id}/cancel`,
        {
          method: "POST"
        }
      );

      if (response.ok) {
        setMessage(`Task ${id} cancelled successfully.`);
        await loadTasksAndStats();
      } else {
        const errorData = await response.json();

        setMessage(
          errorData.detail || "Could not cancel task."
        );
      }

    } catch (error) {
      console.error("Cancel error:", error);
      setMessage("Could not connect to the backend.");
    }
  };

  // Update concurrency limit
  const updateLimit = async () => {
    try {
      const response = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          concurrency_limit: Number(limit)
        })
      });

      if (response.ok) {
        const data = await response.json();

        setLimit(data.concurrency_limit);
        setMessage("Concurrency limit updated successfully.");

      } else {
        const errorData = await response.json();

        setMessage(
          errorData.detail || "Could not update concurrency."
        );
      }

    } catch (error) {
      console.error("Settings error:", error);
      setMessage("Could not connect to the backend.");
    }
  };

  return (
    <div className="container">

      <header>
        <h1>⚙ Task Runner Dashboard</h1>
        <p>Dependency-aware task scheduling service</p>
      </header>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {/* Statistics */}

      <section className="stats">
        {[
          "running",
          "waiting",
          "succeeded",
          "failed",
          "blocked",
          "cancelled"
        ].map((key) => (
          <div className="card" key={key}>
            <span>{key.toUpperCase()}</span>

            <strong>
              {stats[key] || 0}
            </strong>
          </div>
        ))}
      </section>


      {/* Scheduler Settings */}

      <section className="panel">

        <h2>Scheduler Settings</h2>

        <div className="row">

          <input
            type="number"
            min="1"
            max="20"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />

          <button onClick={updateLimit}>
            Update Concurrency
          </button>

        </div>

      </section>


      {/* Create Task */}

      <section className="panel">

        <h2>Create Task</h2>

        <form onSubmit={submit}>

          <input
            required
            placeholder="Task name (e.g. Extract Document Text)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Dependency IDs (e.g. 1,2)"
            value={dependencies}
            onChange={(e) => setDependencies(e.target.value)}
          />

          <div className="grid">

            <label>
              Duration (seconds)

              <input
                type="number"
                step="0.1"
                min="0.1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />

            </label>


            <label>
              Failure Rate (0-1)

              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={failureRate}
                onChange={(e) =>
                  setFailureRate(e.target.value)
                }
              />

            </label>


            <label>
              Max Retries

              <input
                type="number"
                min="0"
                value={maxRetries}
                onChange={(e) =>
                  setMaxRetries(e.target.value)
                }
              />

            </label>

          </div>


          <button type="submit">
            Create Task
          </button>

        </form>

      </section>


      {/* Tasks Table */}

      <section className="panel">

        <h2>Tasks</h2>

        <div className="tablewrap">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Dependencies</th>
                <th>Error</th>
                <th>Action</th>
              </tr>
            </thead>


            <tbody>

              {tasks.length === 0 ? (

                <tr>
                  <td colSpan="7">
                    No tasks created yet.
                  </td>
                </tr>

              ) : (

                tasks.map((task) => (

                  <tr key={task.id}>

                    <td>{task.id}</td>

                    <td>{task.name}</td>

                    <td>
                      <span
                        className={`status ${task.status}`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td>
                      {task.attempts}
                    </td>

                    <td>
                      {task.dependency_ids.join(", ") || "-"}
                    </td>

                    <td>
                      {task.last_error || "-"}
                    </td>

                    <td>

                      {["WAITING", "RUNNING"].includes(
                        task.status
                      ) && (

                        <button
                          className="cancel"
                          onClick={() =>
                            cancel(task.id)
                          }
                        >
                          Cancel
                        </button>

                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}


createRoot(
  document.getElementById("root")
).render(<App />);