import PokeBallLoader from "./PokeBallLoader.jsx";
import TypeBadge from "./TypeBadge.jsx";

const GROUPS = [
  { key: "strong", title: "Weak to", hint: "these types hit super effective", tone: "strong" },
  { key: "weak", title: "Resists", hint: "these types barely scratch it", tone: "weak" },
  { key: "neutral", title: "Neutral to", hint: "regular damage", tone: "neutral" },
];

function TypeMatchups({ matchups, isLoading, hasTypes }) {
  if (!hasTypes) return null;

  return (
    <section className="panel matchup-panel">
      <header className="panel__head">
        <h3 className="panel__title">Type matchups</h3>
        <span className="panel__hint">computed from all 18 damage relations</span>
      </header>

      {isLoading && <PokeBallLoader label="Charting damage relations…" />}

      {!isLoading &&
        GROUPS.map((group) => {
          const types = matchups[group.key] ?? [];
          if (types.length === 0) return null;

          return (
            <div key={group.key} className="matchup-group">
              <h4 className="matchup-group__title">
                {group.title}
                <span className="matchup-group__hint">{group.hint}</span>
              </h4>
              <div className="matchup-list">
                {types.map((type) => (
                  <TypeBadge key={type} type={type} size="sm" />
                ))}
              </div>
            </div>
          );
        })}
    </section>
  );
}

export default TypeMatchups;
