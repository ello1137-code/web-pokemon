import { useEffect, useState } from "react";
import PokemonCard from "./PokemonCard.jsx";
import TypeFilter from "./TypeFilter.jsx";
import PokeBallLoader from "./PokeBallLoader.jsx";
import ErrorState from "./ErrorState.jsx";
import { getPokemon } from "../api.js";
import { capitalize } from "../utils.js";
import { useTeam } from "../teamStore.js";

function PokemonList({
  entries,
  total,
  isLoading,
  error,
  onRetry,
  isLoadingType,
  types,
  activeType,
  onTypeChange,
  sort,
  onSortChange,
  sortOptions,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  page,
  pageCount,
  onPageChange,
  onRandom,
}) {
  const { isInTeam, toggle, isFull } = useTeam();
  // `map` doubles as a session cache (page back and the types are already there),
  // `key` records which page the fetch belongs to so the "refreshing" state is
  // derived instead of being set from inside the effect.
  const [loaded, setLoaded] = useState({ key: null, map: {} });
  const details = loaded.map;

  const entriesKey = entries.map((entry) => entry.name).join("|");
  const isLoadingCards = Boolean(entriesKey) && loaded.key !== entriesKey;

  // The list endpoint only gives { name, url } — no types. One extra request per
  // visible Pokémon fills in the type badges, and those responses are cached for
  // the rest of the session, so paging back and forth costs nothing.
  useEffect(() => {
    if (!entriesKey) return;

    let isCurrent = true;
    const names = entriesKey.split("|");

    Promise.allSettled(names.map((name) => getPokemon(name)))
      .then((results) => {
        if (!isCurrent) return;
        const next = {};
        results.forEach((result, index) => {
          if (result.status === "fulfilled") next[names[index]] = result.value;
        });
        setLoaded((previous) => ({ key: entriesKey, map: { ...previous.map, ...next } }));
      });

    return () => {
      isCurrent = false;
    };
  }, [entriesKey]);

  if (isLoading) return <PokeBallLoader label="Waking up the Pokédex…" />;

  if (error) {
    return (
      <ErrorState
        title="Couldn't load the Pokédex"
        message={error?.message ?? String(error)}
        onRetry={onRetry}
      />
    );
  }

  const firstOnPage = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastOnPage = Math.min(page * pageSize, total);

  return (
    <section className="list-section">
      <div className="toolbar">
        <TypeFilter types={types} activeType={activeType} onChange={onTypeChange} />

        <div className="toolbar__controls">
          <label className="select-field">
            <span>Sort</span>
            <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="select-field">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="icon-button icon-button--accent"
            onClick={onRandom}
            title="Catch a random Pokémon"
            aria-label="Catch a random Pokémon"
          >
            🎲
          </button>
        </div>
      </div>

      <p className="result-count" aria-live="polite">
        {isLoadingType
          ? "Loading that type…"
          : `${total.toLocaleString()} Pokémon${
              activeType ? ` of type ${capitalize(activeType)}` : ""
            }`}
      </p>

      {total === 0 ? (
        <p className="status">No Pokémon match that filter.</p>
      ) : (
        <ul className={`pokemon-list ${isLoadingCards ? "is-refreshing" : ""}`}>
          {entries.map((entry) => (
            <PokemonCard
              key={entry.name}
              entry={entry}
              detail={details[entry.name] ?? null}
              isFavorite={isInTeam(entry.name)}
              isTeamFull={isFull}
              onToggleFavorite={toggle}
            />
          ))}
        </ul>
      )}

      <nav className="pagination" aria-label="Pokédex pages">
        <button
          type="button"
          className="ghost-button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          ← Previous
        </button>

        <span className="pagination__info">
          Showing {firstOnPage}–{lastOnPage} · page {page} of {pageCount}
        </span>

        <button
          type="button"
          className="ghost-button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          Next →
        </button>
      </nav>
    </section>
  );
}

export default PokemonList;
