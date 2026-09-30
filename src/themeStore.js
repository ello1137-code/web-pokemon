import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./config.js";

const THEMES = ["dark", "light"];

function readTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (THEMES.includes(stored)) return stored;
  } catch {
    // ignore storage failures and fall through to the OS preference
  }
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return "dark";
}

let theme = readTheme();
const listeners = new Set();

function applyTheme(nextTheme) {
  theme = nextTheme;
  document.documentElement.setAttribute("data-theme", nextTheme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // non-fatal
  }
  listeners.forEach((listener) => listener());
}

export function getThemeSnapshot() {
  return theme;
}

export function subscribeToTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const current = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeSnapshot
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", current);
  }, [current]);

  return {
    theme: current,
    isDark: current === "dark",
    toggleTheme: () => applyTheme(current === "dark" ? "light" : "dark"),
  };
}
