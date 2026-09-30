import { getStatLabel, getStatTotal, statBarPercent } from "../utils.js";

function StatBars({ stats = [] }) {
  const total = getStatTotal(stats);

  return (
    <section className="panel stat-panel">
      <header className="panel__head">
        <h3 className="panel__title">Base stats</h3>
        <span className="stat-total">
          Total <strong>{total}</strong>
        </span>
      </header>

      <ul className="stat-list">
        {stats.map((entry) => (
          <li key={entry.stat.name} className="stat-row">
            <span className="stat-name">{getStatLabel(entry.stat.name)}</span>
            <span className="stat-track" aria-hidden="true">
              <span
                className="stat-fill"
                style={{ width: `${statBarPercent(entry.base_stat)}%` }}
              />
            </span>
            <span className="stat-value">{entry.base_stat}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default StatBars;
