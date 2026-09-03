function TaskTable({ tasks, cancelTask }) {

  return (
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

            {tasks.map((task) => (

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

                <td>{task.attempts}</td>

                <td>
                  {task.dependency_ids?.join(", ") || "-"}
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
                        cancelTask(task.id)
                      }
                    >
                      Cancel
                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}

export default TaskTable;