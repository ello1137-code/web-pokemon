import { capitalize, getTypeColor } from "../utils.js";

function TypeFilter({ types = [], activeType, onChange }) {
  return (
    <div className="type-filter" role="group" aria-label="Filter by type">
      <button
        type="button"
        className={`type-chip chip-all ${activeType === "" ? "is-active" : ""}`}
        onClick={() => onChange("")}
        aria-pressed={activeType === ""}
      >
        All
      </button>

      {types.map((type) => (
        <button
          key={type}
          type="button"
          className={`type-chip ${activeType === type ? "is-active" : ""}`}
          style={{ "--type-color": getTypeColor(type) }}
          onClick={() => onChange(activeType === type ? "" : type)}
          aria-pressed={activeType === type}
        >
          {capitalize(type)}
        </button>
      ))}
    </div>
  );
}

export default TypeFilter;
