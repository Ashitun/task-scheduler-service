const API = "http://127.0.0.1:8000";

export const getTasks = async () => {
  const response = await fetch(`${API}/tasks`);

  if (!response.ok) {
    throw new Error("Failed to get tasks");
  }

  return response.json();
};


export const getStats = async () => {
  const response = await fetch(`${API}/stats`);

  if (!response.ok) {
    throw new Error("Failed to get stats");
  }

  return response.json();
};


export const getSettings = async () => {
  const response = await fetch(`${API}/settings`);

  if (!response.ok) {
    throw new Error("Failed to get settings");
  }

  return response.json();
};


export const createTask = async (taskData) => {
  const response = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create task");
  }

  return response.json();
};


export const cancelTask = async (id) => {
  const response = await fetch(
    `${API}/tasks/${id}/cancel`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to cancel task");
  }

  return response.json();
};


export const updateSettings = async (limit) => {
  const response = await fetch(`${API}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      concurrency_limit: limit,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }

  return response.json();
};