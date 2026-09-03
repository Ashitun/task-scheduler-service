import { useState } from "react";

function CreateTask({ createTask }) {

  const [name, setName] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [duration, setDuration] = useState(2);
  const [failureRate, setFailureRate] = useState(0.2);
  const [maxRetries, setMaxRetries] = useState(3);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const dependency_ids = dependencies.trim()
      ? dependencies
          .split(",")
          .map((x) => Number(x.trim()))
          .filter(Boolean)
      : [];


    await createTask({
      name,
      dependency_ids,
      duration: Number(duration),
      failure_rate: Number(failureRate),
      max_retries: Number(maxRetries),
    });


    setName("");
    setDependencies("");
  };


  return (
    <section className="panel">

      <h2>Create Task</h2>

      <form onSubmit={handleSubmit}>

        <input
          required
          placeholder="Task name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />


        <input
          placeholder="Dependency IDs (example: 1,2)"
          value={dependencies}
          onChange={(e) => setDependencies(e.target.value)}
        />


        <div className="grid">

          <label>
            Duration (seconds)

            <input
              type="number"
              step="0.1"
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value)
              }
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
  );
}

export default CreateTask;