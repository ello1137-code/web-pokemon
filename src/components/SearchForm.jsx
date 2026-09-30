import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MAX_SUGGESTIONS } from "../config.js";
import { capitalize, isNumeric } from "../utils.js";

function SearchForm({ index = [], inputRef }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  // Instant, offline matching against the National Dex index we already have.
  const suggestions = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return [];

    if (isNumeric(raw)) {
      const match = index.find((entry) => entry.id === Number(raw));
      return match ? [match] : [];
    }

    const startsWith = [];
    const contains = [];

    for (const entry of index) {
      if (entry.name.startsWith(raw)) {
        startsWith.push(entry);
        if (startsWith.length === MAX_SUGGESTIONS) break;
      } else if (entry.name.includes(raw)) {
        contains.push(entry);
      }
    }

    return [...startsWith, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [index, query]);

  const hasQuery = query.trim().length > 0;
  const showSuggestions = isOpen && hasQuery;

  // Clicking anywhere else on the page dismisses the dropdown.
  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleQueryChange(value) {
    setQuery(value);
    // Typing means the old highlight no longer points at anything.
    setActiveIndex(-1);
  }

  function goTo(name) {
    setQuery(name);
    setError(null);
    setIsOpen(false);
    setActiveIndex(-1);
    navigate(`/pokemon/${name}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const name = query.trim().toLowerCase();

    if (name === "") {
      setError("Type a Pokémon name first.");
      return;
    }

    setError(null);
    navigate(`/pokemon/${name}`);
  }

  function handleKeyDown(event) {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === "Escape") setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      // Let the highlighted suggestion win over the raw text.
      event.preventDefault();
      goTo(suggestions[activeIndex].name);
    }
  }

  return (
    <div className="search" ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <span className="search-form__icon" aria-hidden="true">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search a Pokémon by name or number…"
          className="search-input"
          aria-label="Search a Pokémon by name or number"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck="false"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {showSuggestions && (
        <ul className="search-suggestions" role="listbox">
          {suggestions.length === 0 ? (
            <li className="search-suggestions__empty">
              No match in the National Dex — hit enter to search anyway.
            </li>
          ) : (
            suggestions.map((entry, position) => (
              <li key={entry.name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={position === activeIndex}
                  className={`suggestion ${
                    position === activeIndex ? "is-active" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(position)}
                  onClick={() => goTo(entry.name)}
                >
                  <span className="suggestion__id">
                    #{String(entry.id).padStart(4, "0")}
                  </span>
                  <span className="suggestion__name">{capitalize(entry.name)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {error && <p className="status status-error">{error}</p>}
    </div>
  );
}

export default SearchForm;
