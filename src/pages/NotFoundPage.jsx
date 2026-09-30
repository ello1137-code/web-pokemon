import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getPokemonIndex } from "../api.js";
import { POKEMON_INDEX_SIZE } from "../config.js";
import { capitalize } from "../utils.js";

function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [random, setRandom] = useState(null);

  // A dead end is a good moment to offer a way out: one tap to a real Pokémon.
  useEffect(() => {
    let isCurrent = true;

    getPokemonIndex()
      .then((data) => {
        if (!isCurrent) return;
        const results = data?.results ?? [];
        if (results.length === 0) return;
        const pick = results[Math.floor(Math.random() * results.length)];
        setRandom(pick);
      })
      .catch(() => {
        // Suggestions are a nicety; the 404 itself still renders fine.
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const attempted = useMemo(() => {
    const path = location.pathname.replace(/^\/+/, "");
    return path ? decodeURIComponent(path) : null;
  }, [location.pathname]);

  return (
    <div className="notfound">
      <p className="notfound__code">404</p>
      <h2 className="notfound__title">This route doesn't exist.</h2>
      <p className="notfound__text">
        {attempted ? (
          <>
            Nothing in the Pokédex is filed under{" "}
            <code>#{attempted}</code>.
          </>
        ) : (
          "The Pokéball rolled right past this one."
        )}
      </p>

      <div className="notfound__actions">
        <Link to="/" className="primary-button">
          ← Back to the Pokédex
        </Link>
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            if (random) navigate(`/pokemon/${random.name}`);
          }}
          disabled={!random}
        >
          {random ? `Take me to ${capitalize(random.name)}` : `Try one of ${POKEMON_INDEX_SIZE.toLocaleString()}…`}
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
