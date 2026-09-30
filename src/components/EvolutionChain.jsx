import PokeBallLoader from "./PokeBallLoader.jsx";
import { getEvolutionChain } from "../api.js";
import {
  capitalize,
  dexNumber,
  flattenEvolutionChain,
  formatTrigger,
  getHomeSpriteUrl,
  getIdFromUrl,
} from "../utils.js";
import { useMemo } from "react";
import { useFetchJson } from "../hooks/useFetchJson.js";

function EvolutionChain({ chainUrl }) {
  const { data, isLoading, error } = useFetchJson(
    chainUrl ?? "evolution:none",
    () => getEvolutionChain(chainUrl),
    { enabled: Boolean(chainUrl) }
  );

  const stages = useMemo(
    () => flattenEvolutionChain(data?.chain ?? null).filter((stage) => stage?.species),
    [data]
  );

  if (!chainUrl) return null;

  return (
    <section className="panel evo-panel">
      <header className="panel__head">
        <h3 className="panel__title">Evolution</h3>
      </header>

      {isLoading && <PokeBallLoader label="Tracing the family tree…" />}

      {!isLoading && error && (
        <p className="status">Evolution data is unavailable right now.</p>
      )}

      {!isLoading && !error && stages.length <= 1 && (
        <p className="status">This Pokémon does not evolve.</p>
      )}

      {!isLoading && !error && stages.length > 1 && (
        <ol className="evo-chain">
          {stages.map((stage, index) => {
            const name = stage.species.name;
            const id = getIdFromUrl(stage.species.url);
            const trigger = formatTrigger(stage.evolution_details ?? []);

            return (
              <li key={`${name}-${index}`} className="evo-stage">
                {index > 0 && (
                  <span className="evo-arrow" aria-hidden="true">
                    →
                  </span>
                )}
                <img
                  className="evo-stage__sprite"
                  src={getHomeSpriteUrl(id)}
                  alt={capitalize(name)}
                  width={88}
                  height={88}
                  loading="lazy"
                  decoding="async"
                />
                <span className="evo-stage__name">{capitalize(name)}</span>
                <span className="evo-stage__id">{dexNumber(id)}</span>
                {trigger && <span className="evo-stage__trigger">{trigger}</span>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default EvolutionChain;
