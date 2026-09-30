import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TypeBadge from "./TypeBadge.jsx";
import { getPokemon } from "../api.js";
import { MAX_TEAM_SIZE } from "../config.js";
import { useTeam } from "../teamStore.js";
import { capitalize, dexNumber, getHomeSpriteUrl } from "../utils.js";

function TeamTray({ index = [] }) {
  const { names, remove, clear, isEmpty } = useTeam();
  const [details, setDetails] = useState({});

  const teamKey = names.join("|");
  const idsByName = useMemo(
    () => new Map(index.map((entry) => [entry.name, entry.id])),
    [index]
  );

  useEffect(() => {
    if (!teamKey) return;

    let isCurrent = true;

    Promise.allSettled(teamKey.split("|").map((name) => getPokemon(name)))
      .then((results) => {
        if (!isCurrent) return;
        const next = {};
        results.forEach((result) => {
          if (result.status === "fulfilled") next[result.value.name] = result.value;
        });
        setDetails((previous) => ({ ...previous, ...next }));
      });

    return () => {
      isCurrent = false;
    };
  }, [teamKey]);

  return (
    <section className="team-tray" id="team">
      <header className="team-tray__head">
        <h3 className="panel__title">
          My team
          <span className="team-count">
            {names.length}/{MAX_TEAM_SIZE}
          </span>
        </h3>
        {!isEmpty && (
          <button
            type="button"
            className="ghost-button ghost-button--small"
            onClick={clear}
          >
            Clear
          </button>
        )}
      </header>

      {isEmpty ? (
        <p className="team-empty">
          Nothing here yet — tap the <span aria-hidden="true">★</span> on any Pokémon
          to add it to your dream team. Your picks are stored in this browser, so they
          are still here after a refresh.
        </p>
      ) : (
        <ul className="team-grid">
          {names.map((name) => {
            const detail = details[name];
            const id = detail?.id ?? idsByName.get(name);

            return (
              <li key={name} className="team-card">
                <Link to={`/pokemon/${name}`} className="team-card__link">
                  {id ? (
                    <img
                      className="team-card__sprite"
                      src={getHomeSpriteUrl(id)}
                      alt={capitalize(name)}
                      width={72}
                      height={72}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="team-card__sprite team-card__sprite--empty" />
                  )}
                  <span className="team-card__name">{capitalize(name)}</span>
                  {detail?.id && (
                    <span className="team-card__id">{dexNumber(detail.id)}</span>
                  )}
                </Link>

                <span className="team-card__types">
                  {(detail?.types ?? []).length > 0 ? (
                    detail.types.map((entry) => (
                      <TypeBadge key={entry.type.name} type={entry.type.name} size="sm" />
                    ))
                  ) : (
                    <span className="card-types__loading" aria-hidden="true">
                      ···
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  className="team-card__remove"
                  onClick={() => remove(name)}
                  aria-label={`Remove ${capitalize(name)} from my team`}
                  title="Remove from team"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default TeamTray;
