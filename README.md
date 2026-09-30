# PokéDex Mini

A React + Vite Pokédex that talks to the live [PokéAPI](https://pokeapi.co). Every
Pokémon, its types, base stats, abilities, flavour text, evolution chain and
type matchups — plus a few extras: search suggestions, type filtering, sorting,
a dream team saved in `localStorage`, and a dark/light theme.

## Quick start

```bash
npm install
npm run dev
```

## Scripts

| Script          | What it does                                                |
| --------------- | ----------------------------------------------------------- |
| `npm run dev`   | Start the Vite dev server on http://localhost:5173            |
| `npm run build` | Production build into `dist/`                                |
| `npm run lint`  | ESLint (flat config, `eslint.config.js`)                     |
| `npm run preview` | Serve the production build locally                         |
| `npm run deploy`| Build, then publish `dist/` to the `gh-pages` branch         |

## Deploy to GitHub Pages

The app uses `HashRouter`, so it works from any path without server rewrites.

1. `vite.config.js` already sets `base: "/pokedex-mini/"`. **Change that string
   if you push the repo under a different repository name** — it must match the
   project path, otherwise assets 404 on Pages.
2. Make sure `package.json` is published to `main`.
3. Deploy:

   ```bash
   npm run deploy
   ```

4. In GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, branch `gh-pages`, folder `/ (root)`.

The live site will be at
`https://<your-username>.github.io/pokedex-mini/#/pokemon/pikachu`.

## Project structure

```
src/
  api.js            # fetch wrapper: timeout, abort, error messages, response cache
  config.js         # API URLs, colours, labels, storage keys, page sizes
  utils.js          # formatters (dex number, height, gender ratio, types, evolution)
  teamStore.js      # 6-slot team, persisted to localStorage
  themeStore.js     # dark/light theme, persisted to localStorage
  hooks/
    useFetchJson.js # one small fetch primitive used everywhere
    usePokemonIndex.js
    useTypeMatchups.js
  components/       # cards, search, filters, team tray, evolution chain, matchups…
  pages/
    ListPage.jsx    # hero, quote, search, filters, grid, pagination, team
    DetailPage.jsx  # artwork, stats, facts, abilities, evolution, matchups, lore
    NotFoundPage.jsx
  index.css         # design system: dark/light themes, layout, animations
```

## Notes

- No API key needed. PokeAPI is public and rate-limited by generosity, so every
  response is cached for the session and the type panel is fetched once.
- Wikipedia summaries and trainer quotes are optional extras — if the request
  fails the UI silently falls back to hidden text instead of an error.
- The team and the theme live in `localStorage`
  (`pokedex-mini:team`, `pokedex-mini:theme`).

## Credits

Data from [PokéAPI](https://pokeapi.co) · sprites from the
[PokeAPI/sprites](https://github.com/PokeAPI/sprites) repository · summaries from
[Wikipedia](https://en.wikipedia.org) · quotes from
[ZenQuotes](https://zenquotes.io).
