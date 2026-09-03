import { useEffect, useState } from "react";

import Stats from "./components/Stats";
import Settings from "./components/Settings";
import CreateTask from "./components/CreateTask";
import TaskTable from "./components/TaskTable";

import {
  getTasks,
  getStats,
  getSettings,
  createTask,
  cancelTask,
  updateSettings,
} from "./api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [limit, setLimit] = useState(3);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [tasksData, statsData, settingsData] =
        await Promise.all([
          getTasks(),
          getStats(),
          getSettings(),
        ]);

      setTasks(tasksData);
      setStats(statsData);
      setLimit(settingsData.concurrency_limit);

    } catch (error) {
      console.error(error);
      setMessage("Backend is not running.");
    }
  };

  useEffect(() => {
    load();

    const timer = setInterval(load, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);

      setMessage("Task created successfully.");
      load();

    } catch (error) {
      setMessage("Error creating task.");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelTask(id);
      setMessage("Task cancelled successfully.");
      load();

    } catch (error) {
      setMessage("Error cancelling task.");
    }
  };

  const handleUpdateLimit = async () => {
    try {
      await updateSettings(Number(limit));

      setMessage("Concurrency limit updated.");
      load();

    } catch (error) {
      setMessage("Error updating concurrency limit.");
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

      <Stats stats={stats} />

      <Settings
        limit={limit}
        setLimit={setLimit}
        updateLimit={handleUpdateLimit}
      />

      <CreateTask
        createTask={handleCreateTask}
      />

      <TaskTable
        tasks={tasks}
        cancelTask={handleCancel}
      />

    </div>
  );
}

export default App;