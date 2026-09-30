import {
  GENERATION_RANGES,
  HOME_ARTWORK_BASE_URL,
  OFFICIAL_ARTWORK_BASE_URL,
  SPRITE_BASE_URL,
  STAT_LABELS,
  TYPE_COLORS,
} from "./config.js";

export function getIdFromUrl(url) {
  // url looks like "https://pokeapi.co/api/v2/pokemon/25/"
  const parts = String(url).split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function capitalize(name = "") {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getSpriteUrl(id) {
  return `${SPRITE_BASE_URL}/${id}.png`;
}

// The modern, chunky "home" artwork used on cards; falls back to the classic
// sprite if a Pokémon has no home render.
export function getHomeSpriteUrl(id) {
  return `${HOME_ARTWORK_BASE_URL}/${id}.png`;
}

// The big illustrated artwork used on the detail page.
export function getArtworkUrl(id) {
  return `${OFFICIAL_ARTWORK_BASE_URL}/${id}.png`;
}

export function dexNumber(id) {
  return `#${String(id).padStart(4, "0")}`;
}

export function getTypeColor(type = "") {
  return TYPE_COLORS[type] ?? "#8a90b2";
}

export function getStatLabel(name = "") {
  return STAT_LABELS[name] ?? capitalize(name.replace(/-/g, " "));
}

export function isNumeric(value) {
  return /^\d+$/.test(String(value).trim());
}

export function cleanFlavorText(text = "") {
  return String(text)
    .replace(/[\n\f\r­]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getGeneration(id) {
  const numericId = Number(id);
  const found = GENERATION_RANGES.find(
    (range) => numericId >= range.from && numericId <= range.to
  );
  return found ?? GENERATION_RANGES[GENERATION_RANGES.length - 1];
}

export function getStatTotal(stats = []) {
  return stats.reduce((sum, entry) => sum + (entry?.base_stat ?? 0), 0);
}

// Base stats run 5 → 255. The bar is scaled against 255 but floored at 12% so a
// 5-point stat still renders something visible.
export function statBarPercent(value) {
  const numeric = Number(value) || 0;
  return Math.max(6, Math.min(100, Math.round((numeric / 255) * 100)));
}

export function formatHeight(decimeters) {
  if (decimeters == null) return "—";
  return `${(decimeters / 10).toFixed(1)} m`;
}

export function formatWeight(hectograms) {
  if (hectograms == null) return "—";
  return `${(hectograms / 10).toFixed(1)} kg`;
}

// gender_rate is -1 when a species is genderless, otherwise the female share.
export function formatGenderRatio(rate) {
  if (rate == null) return "—";
  if (rate < 0) return "Genderless";
  const female = Math.round(rate * 100);
  return `${100 - female}% male · ${female}% female`;
}

export function formatTrigger(details = []) {
  const first = details?.[0];
  if (!first?.trigger?.name) return null;

  const pretty = (value) =>
    String(value)
      .split("-")
      .map((part) => capitalize(part))
      .join(" ");

  const parts = [capitalize(first.trigger.name.replace(/-/g, " "))];
  if (first.min_level) parts.push(`from level ${first.min_level}`);
  if (first.min_happiness) parts.push(`with high friendship`);
  if (first.min_affection) parts.push(`high affection`);
  if (first.min_beauty) parts.push(`high beauty`);
  const item = first.item?.name ?? first.held_item?.name;
  if (item) parts.push(`using ${pretty(item)}`);
  if (first.known_move?.name) parts.push(`knowing ${pretty(first.known_move.name)}`);
  if (first.known_move_type?.name) parts.push(`knowing a ${first.known_move_type.name} move`);
  if (first.location?.name) parts.push(`at ${pretty(first.location.name)}`);
  if (first.time_of_day) parts.push(`during the ${first.time_of_day.replace(/-/g, " ")}`);
  if (first.turn_upside_down) parts.push(`while upside down`);

  return parts.join(" · ");
}

// Walks PokéAPI's nested evolution tree into a flat, ordered list of stages.
export function flattenEvolutionChain(node, stages = []) {
  if (!node) return stages;
  stages.push(node);
  (node.evolves_to ?? []).forEach((child) => flattenEvolutionChain(child, stages));
  return stages;
}

// For a defending type set, which attacking types hit hard / barely at all?
export function getTypeMatchups(typeData = [], defenderTypes = []) {
  if (!typeData.length || !defenderTypes.length) {
    return { strong: [], weak: [], neutral: [] };
  }

  const groups = { strong: [], weak: [], neutral: [] };

  typeData.forEach((attacker) => {
    let multiplier = 1;

    defenderTypes.forEach((defenderName) => {
      const defender = typeData.find((type) => type.name === defenderName);
      const relations = defender?.damage_relations;
      if (!relations) return;
      const has = (list) => (list ?? []).some((entry) => entry.name === attacker.name);

      if (has(relations.no_damage_to)) multiplier = 0;
      else if (has(relations.double_damage_to)) multiplier *= 2;
      else if (has(relations.half_damage_to)) multiplier *= 0.5;
    });

    if (multiplier >= 2) groups.strong.push(attacker.name);
    else if (multiplier <= 0.5) groups.weak.push(attacker.name);
    else groups.neutral.push(attacker.name);
  });

  return groups;
}
