import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PokemonList from "../components/PokemonList.jsx";
import SearchForm from "../components/SearchForm.jsx";
import TeamTray from "../components/TeamTray.jsx";
import TrainerQuote from "../components/TrainerQuote.jsx";
import { getPokemonOfType, getTypes } from "../api.js";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, POKEMON_INDEX_SIZE } from "../config.js";
import { useFetchJson } from "../hooks/useFetchJson.js";
import { usePokemonIndex } from "../hooks/usePokemonIndex.js";

const SORT_OPTIONS = [
  { value: "dex", label: "National Dex order" },
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "id-desc", label: "Newest first" },
];

function ListPage() {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [retryToken, setRetryToken] = useState(0);
  const [activeType, setActiveType] = useState("");
  const [sort, setSort] = useState("dex");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const { index, count, isLoading, error } = usePokemonIndex(retryToken);

  const { data: typeList } = useFetchJson("type-list", getTypes);
  const types = useMemo(
    () =>
      (typeList?.results ?? [])
        .map((type) => type.name)
        .filter((name) => name !== "shadow" && name !== "stellar"),
    [typeList]
  );

  const { data: typeMembers, isLoading: isLoadingType } = useFetchJson(
    activeType ? `type-members:${activeType}` : "type-members:none",
    () => getPokemonOfType(activeType),
    { enabled: activeType !== "" }
  );

  const typeNames = useMemo(
    () => new Set((typeMembers?.pokemon ?? []).map((entry) => entry.pokemon.name)),
    [typeMembers]
  );

  // Filter + sort happen in memory against the index we already downloaded, so
  // changing a chip or a sort never costs another request.
  const filtered = useMemo(() => {
    const base = activeType ? index.filter((entry) => typeNames.has(entry.name)) : index;
    const sorted = [...base];

    if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "name-desc") sorted.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "id-desc") sorted.sort((a, b) => b.id - a.id);
    else sorted.sort((a, b) => a.id - b.id);

    return sorted;
  }, [index, activeType, typeNames, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Any change to the result set means the old page number is meaningless, so
  // these handlers reset to page 1 instead of an effect doing it for them.
  function handleTypeChange(nextType) {
    setActiveType(nextType);
    setPage(1);
  }

  function handleSortChange(nextSort) {
    setSort(nextSort);
    setPage(1);
  }

  function handlePageSizeChange(nextSize) {
    setPageSize(nextSize);
    setPage(1);
  }

  function handleRandom() {
    if (index.length === 0) return;
    const pick = index[Math.floor(Math.random() * index.length)];
    navigate(`/pokemon/${pick.name}`);
  }

  // Keyboard shortcut: "/" jumps straight to the search box.
  useEffect(() => {
    function handleShortcut(event) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      event.preventDefault();
      searchRef.current?.focus();
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <div className="list-page">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Live data from the official PokéAPI</p>
          <h2 className="hero__title">
            Every Pokémon, one Pokéball away.
          </h2>
          <p className="hero__sub">
            Search all {count ? count.toLocaleString() : POKEMON_INDEX_SIZE.toLocaleString()} Pokémon,
            filter by type, read flavour text, compare base stats and build a dream
            team that sticks around between visits.
          </p>
          <div className="hero__actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleRandom}
              disabled={index.length === 0}
            >
              🎲 Surprise me
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => document.getElementById("team")?.scrollIntoView({ behavior: "smooth" })}
            >
              View my team
            </button>
          </div>
          <p className="hero__hint">
            Tip: press <kbd>/</kbd> to jump to search, and tap a card&apos;s ★ to save it.
          </p>
        </div>

        <div className="hero__art" aria-hidden="true">
          <span className="hero-pokeball">
            <span className="hero-pokeball__core" />
          </span>
        </div>
      </section>

      <TrainerQuote />

      <SearchForm index={index} inputRef={searchRef} />

      <PokemonList
        entries={visible}
        total={filtered.length}
        isLoading={isLoading}
        error={error}
        onRetry={() => setRetryToken((token) => token + 1)}
        isLoadingType={isLoadingType}
        types={types}
        activeType={activeType}
        onTypeChange={handleTypeChange}
        sort={sort}
        onSortChange={handleSortChange}
        sortOptions={SORT_OPTIONS}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
        onRandom={handleRandom}
      />

      <TeamTray index={index} />
    </div>
  );
}

export default ListPage;
