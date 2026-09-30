import { useMemo } from "react";
import { getPokemonIndex } from "../api.js";
import { getIdFromUrl } from "../utils.js";
import { useFetchJson } from "./useFetchJson.js";

/**
 * The full National Dex index ({ id, name } for all 1,302 Pokémon) from a single
 * list request. Search suggestions, filtering, sorting and pagination all run
 * against this in memory — no further requests needed.
 */
export function usePokemonIndex(retryToken = 0) {
  const { data, error, isLoading } = useFetchJson(
    `pokemon-index:${retryToken}`,
    getPokemonIndex
  );

  const index = useMemo(
    () =>
      (data?.results ?? [])
        .map((entry) => ({ id: Number(getIdFromUrl(entry.url)), name: entry.name }))
        .filter((entry) => Number.isFinite(entry.id)),
    [data]
  );

  return { index, count: index.length, isLoading, error };
}
