// PokéAPI — the official REST API behind every Pokémon game.
export const API_BASE_URL = "https://pokeapi.co/api/v2";

// Sprite artwork is hosted as plain image files on GitHub, so an image URL can
// be built from a Pokédex number alone (no extra request, no loading state).
export const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const HOME_ARTWORK_BASE_URL = `${SPRITE_BASE_URL}/other/home`;
export const OFFICIAL_ARTWORK_BASE_URL = `${SPRITE_BASE_URL}/other/official-artwork`;

// Two bonus, non-PokéAPI sources. Both are optional: every screen that uses them
// has a local fallback, so the app never breaks if either service is down.
export const QUOTE_API_URL = "https://zenquotes.io/api/random";
export const WIKIPEDIA_API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";

// Total number of Pokémon in the National Dex (Gen 1 → Gen 9).
export const POKEMON_INDEX_SIZE = 1302;

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [20, 40, 60];
export const MAX_TEAM_SIZE = 6;
export const MAX_SUGGESTIONS = 8;

// Every request gets a deadline, so a hanging network can't leave the UI stuck
// in a loading state forever.
export const REQUEST_TIMEOUT_MS = 9000;

export const TEAM_STORAGE_KEY = "pokedex-mini:team";
export const THEME_STORAGE_KEY = "pokedex-mini:theme";

export const TYPE_COLORS = {
  normal: "#9fa19f",
  fire: "#e62829",
  water: "#2980ef",
  electric: "#fac000",
  grass: "#3fa129",
  ice: "#3dcef3",
  fighting: "#ff8000",
  poison: "#9141cb",
  ground: "#915121",
  flying: "#81b9ef",
  psychic: "#ef4179",
  bug: "#91a119",
  rock: "#afa981",
  ghost: "#704170",
  dragon: "#5060e1",
  dark: "#50413f",
  steel: "#60a1b8",
  fairy: "#ef70ef",
};

export const STAT_LABELS = {  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export const GROWTH_RATE_LABELS = {
  slow: "Slow",
  medium: "Medium",
  fast: "Fast",
  "medium-slow": "Medium Slow",
};

// National Dex ranges, used to label a Pokémon's generation from its number.
export const GENERATION_RANGES = [
  { number: 1, label: "Generation I", from: 1, to: 151 },
  { number: 2, label: "Generation II", from: 152, to: 251 },
  { number: 3, label: "Generation III", from: 252, to: 386 },
  { number: 4, label: "Generation IV", from: 387, to: 493 },
  { number: 5, label: "Generation V", from: 494, to: 649 },
  { number: 6, label: "Generation VI", from: 650, to: 721 },
  { number: 7, label: "Generation VII", from: 722, to: 809 },
  { number: 8, label: "Generation VIII", from: 810, to: 905 },
  { number: 9, label: "Generation IX", from: 906, to: 1025 },
];

// Used when ZenQuotes is unreachable, so the hero never shows an empty box.
export const FALLBACK_QUOTES = [
  { text: "A Pokémon's type is revealed by the way it moves in battle.", author: "Professor Oak" },
  { text: "The most important thing in the world is to keep the world whole.", author: "N's philosophy, Kanto" },
  { text: "There is no wrong way to raise a Pokémon — only your way.", author: "Trainer Tips" },
  { text: "Data is beautiful, and every Pokédex entry is a story waiting to be read.", author: "PokéDex Mini" },
  { text: "Curiosity is the strongest stat of all.", author: "PokéDex Mini" },
];
