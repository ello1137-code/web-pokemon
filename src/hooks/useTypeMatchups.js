import { useMemo } from "react";
import { getAllTypeData } from "../api.js";
import { getTypeMatchups } from "../utils.js";
import { useFetchJson } from "./useFetchJson.js";

/**
 * Which types hit this Pokémon hard, and which barely scratch it.
 * All 18 damage relations are fetched in parallel once and then cached.
 */
export function useTypeMatchups(defenderTypes = []) {
  const key = useMemo(
    () => [...defenderTypes].filter(Boolean).sort().join(","),
    [defenderTypes]
  );

  const { data, error, isLoading } = useFetchJson(
    key ? "type-relations" : "type-relations:none",
    getAllTypeData,
    { enabled: Boolean(key) }
  );

  const matchups = useMemo(
    () => getTypeMatchups(data ?? [], key ? key.split(",") : []),
    [data, key]
  );

  return { matchups, error, isLoading };
}
