import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../themeStore.js";
import { useTeam } from "../teamStore.js";

function Layout() {
  const location = useLocation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { names, isEmpty } = useTeam();

  // Hash routing never scrolls on its own, so every route change starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  function scrollToTeam() {
    document.getElementById("team")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true">
        <span className="orb orb--one" />
        <span className="orb orb--two" />
        <span className="orb orb--three" />
        <span className="backdrop__grid" />
      </div>

      <header className="app-header">
        <Link to="/" className="app-title-link">
          <span className="pokeball-logo" aria-hidden="true">
            <span className="pokeball-logo__core" />
          </span>
          <span className="title-text">
            Poké<span>Dex</span>
            <em>Mini</em>
          </span>
        </Link>

        <nav className="header-actions" aria-label="Main">
          <Link
            to="/"
            className={`chip-link ${location.pathname === "/" ? "is-active" : ""}`}
          >
            Pokédex
          </Link>

          {!isEmpty && (
            <button type="button" className="chip-link" onClick={scrollToTeam}>
              Team <span className="chip-link__count">{names.length}</span>
            </button>
          )}

          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>
          Built with React, Vite and the{" "}
          <a href="https://pokeapi.co" target="_blank" rel="noreferrer">
            PokéAPI
          </a>
          . Quotes from{" "}
          <a href="https://zenquotes.io" target="_blank" rel="noreferrer">
            ZenQuotes
          </a>
          , lore from{" "}
          <a href="https://en.wikipedia.org" target="_blank" rel="noreferrer">
            Wikipedia
          </a>
          . Pokémon and artwork © Nintendo / Game Freak.
        </p>
      </footer>
    </div>
  );
}

export default Layout;
