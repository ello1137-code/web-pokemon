import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EvolutionChain from "../components/EvolutionChain.jsx";
import PokeBallLoader from "../components/PokeBallLoader.jsx";
import StatBars from "../components/StatBars.jsx";
import TypeBadge from "../components/TypeBadge.jsx";
import TypeMatchups from "../components/TypeMatchups.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { getPokemon, getSpecies, getWikipediaSummary } from "../api.js";
import { GROWTH_RATE_LABELS } from "../config.js";
import { useFetchJson } from "../hooks/useFetchJson.js";
import { useTypeMatchups } from "../hooks/useTypeMatchups.js";
import { useTeam } from "../teamStore.js";
import {
  capitalize,
  cleanFlavorText,
  dexNumber,
  formatGenderRatio,
  formatHeight,
  formatWeight,
  getGeneration,
  getTypeColor,
} from "../utils.js";

function DetailPage() {
  const { name } = useParams();
  const [retryToken, setRetryToken] = useState(0);
  const [note, setNote] = useState(null);
  const { isInTeam, toggle, isFull } = useTeam();

  const key = decodeURIComponent(name ?? "").trim().toLowerCase();

  const { data: pokemon, error, isLoading } = useFetchJson(
    `pokemon:${key}:${retryToken}`,
    () => getPokemon(key)
  );

  const speciesName = pokemon?.name ?? null;
  const { data: species } = useFetchJson(
    speciesName ? `species:${speciesName}` : "species:none",
    () => getSpecies(speciesName),
    { enabled: Boolean(speciesName) }
  );

  const { data: wiki } = useFetchJson(
    speciesName ? `wiki:${speciesName}` : "wiki:none",
    () => getWikipediaSummary(capitalize(speciesName)),
    { enabled: Boolean(speciesName) }
  );

  const types = (pokemon?.types ?? []).map((entry) => entry.type.name);
  const { matchups, isLoading: isLoadingMatchups } = useTypeMatchups(types);

  // The shiny toggle is stored together with the name it belongs to, so visiting
  // a different Pokémon resets it without a setState-inside-an-effect dance.
  const [shinyState, setShinyState] = useState({ name: null, on: false });
  const shiny = shinyState.name === key && shinyState.on;

  function toggleShiny() {
    setShinyState((previous) => ({
      name: key,
      on: previous.name === key ? !previous.on : true,
    }));
  }

  // Inline feedback when the team is full, cleared again after a few seconds.
  useEffect(() => {
    if (!note) return undefined;
    const timer = setTimeout(() => setNote(null), 3000);
    return () => clearTimeout(timer);
  }, [note]);

  // This is a side effect outside React (it reaches into the browser tab), so
  // it gets its own useEffect instead of living inside the fetch logic.
  useEffect(() => {
    if (pokemon) {
      document.title = `${capitalize(pokemon.name)} · PokéDex Mini`;
    }

    return () => {
      document.title = "PokéDex Mini · React + PokéAPI";
    };
  }, [pokemon]);

  if (isLoading) {
    return (
      <>
        <Link to="/" className="back-link">
          ← Back to list
        </Link>
        <PokeBallLoader label={`Looking up ${key}…`} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Link to="/" className="back-link">
          ← Back to list
        </Link>
        <ErrorState
          title={
            error.status === 404
              ? `No Pokémon named “${capitalize(key)}”`
              : "Couldn't load this Pokémon"
          }
          message={
            error.status === 404
              ? "Check the spelling, or go back and pick one from the list."
              : error.message
          }
          onRetry={() => setRetryToken((token) => token + 1)}
        />
      </>
    );
  }

  const artwork = shiny
    ? (pokemon.sprites.other?.["official-artwork"]?.front_shiny ??
      pokemon.sprites.front_shiny ??
      pokemon.sprites.front_default)
    : (pokemon.sprites.other?.["official-artwork"]?.front_default ??
      pokemon.sprites.front_default);

  const typeNames = pokemon.types.map((entry) => entry.type.name);
  const primaryColor = getTypeColor(typeNames[0]);
  const abilities = [
    ...(pokemon.abilities ?? []).map((entry) => ({
      name: entry.ability.name,
      hidden: entry.is_hidden,
    })),
  ];

  const flavorEntry =
    species?.flavor_text_entries?.find((entry) => entry.language.name === "en") ??
    species?.flavor_text_entries?.[0];

  const generation = getGeneration(pokemon.id);
  const inTeam = isInTeam(pokemon.name);
  const previousId = pokemon.id - 1;
  const nextId = pokemon.id + 1;

  function handleTeamToggle() {
    const result = toggle(pokemon.name);
    setNote(
      result.ok
        ? result.added
          ? `${capitalize(pokemon.name)} joined your team.`
          : `${capitalize(pokemon.name)} left your team.`
        : "Your team is full — remove a Pokémon first."
    );
  }

  return (
    <div className="detail-page" style={{ "--primary-type": primaryColor }}>
      <nav className="detail-nav">
        <Link to="/" className="back-link">
          ← Back to list
        </Link>
        <span className="detail-nav__spacer" />
        {previousId >= 1 && (
          <Link className="nav-arrow" to={`/pokemon/${previousId}`}>
            ← #{previousId}
          </Link>
        )}
        <Link className="nav-arrow" to={`/pokemon/${nextId}`}>
          #{nextId} →
        </Link>
      </nav>

      <section className="detail-hero">
        <div className="detail-hero__art">
          <div className="artwork-frame">
            <img
              className={`detail-artwork ${shiny ? "is-shiny" : ""}`}
              data-fallback="sprite"
              src={artwork}
              alt={`${capitalize(pokemon.name)}${shiny ? " (shiny)" : ""}`}
              width={260}
              height={260}
              decoding="async"
              onError={(event) => handleArtworkError(event, pokemon)}
            />
          </div>

          <div className="detail-hero__toggles">
            <button
              type="button"
              className={`chip-button ${shiny ? "is-active" : ""}`}
              onClick={toggleShiny}
              aria-pressed={shiny}
            >
              ✨ Shiny
            </button>
            <button
              type="button"
              className={`chip-button ${inTeam ? "is-active" : ""}`}
              onClick={handleTeamToggle}
              aria-pressed={inTeam}
              title={!inTeam && isFull ? "Your team is full" : undefined}
            >
              {inTeam ? "★ In my team" : "☆ Add to team"}
            </button>
          </div>

          {note && <p className="form-note">{note}</p>}
        </div>

        <div className="detail-hero__info">
          <p className="detail-number">{dexNumber(pokemon.id)}</p>
          <h2 className="detail-name">
            {capitalize(pokemon.name)}
            {species?.is_legendary && <span className="badge">Legendary</span>}
            {species?.is_mythical && <span className="badge">Mythical</span>}
          </h2>

          {species?.genera?.find((genus) => genus.language.name === "en") && (
            <p className="detail-genus">
              {species.genera.find((genus) => genus.language.name === "en").genus}
            </p>
          )}

          <div className="type-row">
            {typeNames.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>

          {flavorEntry && (
            <p className="flavor-text">{cleanFlavorText(flavorEntry.flavor_text)}</p>
          )}

          <dl className="fact-grid">
            <Fact label="Height" value={formatHeight(pokemon.height)} />
            <Fact label="Weight" value={formatWeight(pokemon.weight)} />
            <Fact
              label="Base exp."
              value={pokemon.base_experience ?? "—"}
            />
            <Fact label="Generation" value={generation.label} />
            <Fact
              label="Habitat"
              value={species?.habitat ? capitalize(species.habitat.name) : "—"}
            />
            <Fact label="Catch rate" value={species?.capture_rate ?? "—"} />
            <Fact label="Gender" value={formatGenderRatio(species?.gender_rate)} />
            <Fact
              label="Growth"
              value={
                species?.growth_rate
                  ? GROWTH_RATE_LABELS[species.growth_rate.name] ?? capitalize(species.growth_rate.name)
                  : "—"
              }
            />
          </dl>
        </div>
      </section>

      <div className="detail-grid">
        <StatBars stats={pokemon.stats} />

        <section className="panel">
          <header className="panel__head">
            <h3 className="panel__title">Abilities</h3>
          </header>
          <ul className="ability-list">
            {abilities.map((ability) => (
              <li key={ability.name} className="ability-item">
                <span className="ability-badge">
                  {ability.name
                    .split("-")
                    .map((part) => capitalize(part))
                    .join(" ")}
                </span>
                {ability.hidden && <span className="badge badge--muted">Hidden</span>}
              </li>
            ))}
            {abilities.length === 0 && <li className="status">No abilities listed.</li>}
          </ul>
        </section>

        <TypeMatchups
          matchups={matchups}
          isLoading={isLoadingMatchups}
          hasTypes={typeNames.length > 0}
        />

        <EvolutionChain chainUrl={species?.evolution_chain?.url} />

        {wiki && (
          <section className="panel wiki-panel">
            <header className="panel__head">
              <h3 className="panel__title">From the encyclopedia</h3>
              <span className="panel__hint">Wikipedia</span>
            </header>
            <div className="wiki-card">
              {wiki.thumbnail && (
                <img
                  className="wiki-card__thumb"
                  src={wiki.thumbnail}
                  alt={wiki.title}
                  width={72}
                  height={72}
                  loading="lazy"
                />
              )}
              <div>
                {wiki.description && (
                  <p className="wiki-card__description">{wiki.description}</p>
                )}
                <p className="wiki-card__extract">{wiki.extract}</p>
                {wiki.url && (
                  <a
                    className="ghost-button ghost-button--small"
                    href={wiki.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the full article ↗
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// Official artwork exists for every Pokémon, but the classic sprite is a safe
// second stop in case a future entry ships without an illustration.
function handleArtworkError(event, pokemon) {
  const image = event.currentTarget;

  if (image.dataset.fallback === "sprite" && pokemon.sprites.front_default) {
    image.dataset.fallback = "done";
    image.src = pokemon.sprites.front_default;
    return;
  }

  image.style.visibility = "hidden";
}

export default DetailPage;
