import { capitalize, getTypeColor } from "../utils.js";

function TypeBadge({ type, size = "md", title, className = "" }) {
  return (
    <span
      className={`type-badge type-badge--${size} ${className}`.trim()}
      style={{ "--type-color": getTypeColor(type) }}
      title={title ?? capitalize(type)}
    >
      {capitalize(type)}
    </span>
  );
}

export default TypeBadge;
