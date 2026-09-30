import { Link } from "react-router-dom";
import TypeBadge from "./TypeBadge.jsx";
import { capitalize, getHomeSpriteUrl, getSpriteUrl, getTypeColor } from "../utils.js";

function PokemonCard({ entry, detail, isFavorite, isTeamFull, onToggleFavorite }) {
  const types = (detail?.types ?? []).map((entryType) => entryType.type.name);

  return (
    <li className="pokemon-card">
      <Link
        to={`/pokemon/${entry.name}`}
        className="pokemon-link"
        style={
          types[0] ? { "--type-color": getTypeColor(types[0]) } : undefined
        }
      >
        <span className="card-id">#{String(entry.id).padStart(3, "0")}</span>
        <img
          className="pokemon-sprite"
          src={getHomeSpriteUrl(entry.id)}
          alt={capitalize(entry.name)}
          width={96}
          height={96}
          loading="lazy"
          decoding="async"
          onError={(event) => handleSpriteError(event, entry.id)}
        />
        <span className="card-name">{capitalize(entry.name)}</span>
        <span className="card-types">
          {types.length > 0 ? (
            types.map((type) => <TypeBadge key={type} type={type} size="sm" />)
          ) : (
            <span className="card-types__loading" aria-hidden="true">
              ···
            </span>
          )}
        </span>
      </Link>

      <button
        type="button"
        className={`fav-button ${isFavorite ? "is-active" : ""}`}
        onClick={() => onToggleFavorite(entry.name)}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `Remove ${capitalize(entry.name)} from my team`
            : `Add ${capitalize(entry.name)} to my team`
        }
        title={
          isFavorite ? "Remove from team" : isTeamFull ? "Your team is full" : "Add to team"
        }
        disabled={!isFavorite && isTeamFull}
      >
        ★
      </button>
    </li>
  );
}

// A few Pokémon have no "home" render — fall back to the classic sprite before
// giving up, so a card is never left showing a broken image.
function handleSpriteError(event, id) {
  const image = event.currentTarget;

  if (image.dataset.fallback === "done") {
    image.style.visibility = "hidden";
    return;
  }

  image.dataset.fallback = "done";
  image.src = getSpriteUrl(id);
}

export default PokemonCard;
