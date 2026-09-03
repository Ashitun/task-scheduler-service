function Stats({ stats }) {

  const statuses = [
    "running",
    "waiting",
    "succeeded",
    "failed",
    "blocked",
    "cancelled",
  ];

  return (
    <section className="stats">

      {statuses.map((status) => (
        <div className="card" key={status}>

          <span>
            {status.toUpperCase()}
          </span>

          <strong>
            {stats[status] || 0}
          </strong>

        </div>
      ))}

    </section>
  );
}

export default Stats;