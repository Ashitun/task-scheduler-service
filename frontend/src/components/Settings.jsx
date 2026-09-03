function Settings({
  limit,
  setLimit,
  updateLimit,
}) {

  return (
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
  );
}

export default Settings;