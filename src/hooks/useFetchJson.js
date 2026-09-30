import { useEffect, useRef, useState } from "react";

/**
 * One tiny data-fetching primitive for the whole app.
 *
 * `key` is what the request depends on (a URL, an id, "a|b" for a list of ids).
 * `loader` is read through a ref, so passing an inline arrow function every
 * render does NOT re-trigger the request — only a changed `key` does.
 *
 * The result is stored together with the key it belongs to, which means the
 * loading state is *derived* rather than set from inside an effect: as soon as
 * the key changes the hook already reports "loading", and stale data from the
 * previous key is never handed to the component.
 */
export function useFetchJson(key, loader, { enabled = true } = {}) {
  const [result, setResult] = useState({ key: null, data: null, error: null, isLoading: false });
  const loaderRef = useRef(loader);

  // Keep the ref pointing at the newest loader without touching it while rendering.
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    if (!enabled) return undefined;

    let isCurrent = true;
    const controller = new AbortController();

    loaderRef
      .current({ signal: controller.signal })
      .then((data) => {
        if (isCurrent) setResult({ key, data, error: null, isLoading: false });
      })
      .catch((error) => {
        // A cancelled request is not a failure — just walk away.
        if (!isCurrent || error.name === "AbortError") return;
        // The Error object is kept (not just its message) so callers can read
        // `error.status` — that is how a 404 turns into "no Pokémon named X".
        setResult({ key, data: null, error, isLoading: false });
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [key, enabled]);

  if (!enabled) return { data: null, error: null, isLoading: false };
  if (result.key !== key) return { data: null, error: null, isLoading: true };
  return { data: result.data, error: result.error, isLoading: result.isLoading };
}
