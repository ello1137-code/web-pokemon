import { useSyncExternalStore } from "react";
import { MAX_TEAM_SIZE, TEAM_STORAGE_KEY } from "./config.js";

/**
 * A tiny external store for the player's saved team, backed by localStorage.
 * It lives outside React so the header, the cards and the detail page all read
 * and write the exact same list, and stay in sync instantly.
 */
function readTeam() {
  try {
    const raw = window.localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((name) => typeof name === "string").slice(0, MAX_TEAM_SIZE);
  } catch {
    return [];
  }
}

let team = readTeam();
const listeners = new Set();

function commit(nextTeam) {
  team = nextTeam;
  try {
    window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
  } catch {
    // Private mode / storage disabled: the team still works for this session.
  }
  listeners.forEach((listener) => listener());
}

export function getTeamSnapshot() {
  return team;
}

export function subscribeToTeam(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTeam() {
  const names = useSyncExternalStore(
    subscribeToTeam,
    getTeamSnapshot,
    getTeamSnapshot
  );

  function isInTeam(name) {
    return names.includes(name);
  }

  // Returns false when the team is already full, so the UI can explain why.
  function add(name) {
    if (isInTeam(name) || names.length >= MAX_TEAM_SIZE) return false;
    commit([...names, name]);
    return true;
  }

  function remove(name) {
    commit(names.filter((entry) => entry !== name));
  }

  function toggle(name) {
    if (isInTeam(name)) {
      remove(name);
      return { ok: true, added: false };
    }
    const added = add(name);
    return { ok: added, added };
  }

  return {
    names,
    isInTeam,
    add,
    remove,
    toggle,
    isFull: names.length >= MAX_TEAM_SIZE,
    isEmpty: names.length === 0,
    clear: () => commit([]),
  };
}
