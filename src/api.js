import {
  API_BASE_URL,
  QUOTE_API_URL,
  REQUEST_TIMEOUT_MS,
  WIKIPEDIA_API_URL,
} from "./config.js";

// Every GET in this app goes through `request`, which gives us three things the
// browser's fetch doesn't give us for free: real error messages, a timeout so
// the UI can never hang forever, and cancellation on unmount.
async function request(url, { signal, timeout = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  const forwardAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", forwardAbort);
  }

  let response;

  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } catch {
    if (timedOut) {
      throw createError("The request took too long — please try again.");
    }
    if (signal?.aborted) {
      const aborted = new Error("Request cancelled");
      aborted.name = "AbortError";
      throw aborted;
    }
    throw createError("Couldn't reach the server — check your internet connection.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }

  if (response.status === 404) throw createError("Not found", 404);
  if (!response.ok) {
    throw createError(`Server responded with status ${response.status}.`, response.status);
  }

  return response.json();
}

function createError(message, status = null) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Pokédex data is static for a given URL, so identical GETs are de-duplicated:
// the first caller starts the request, everyone else awaits the same promise.
// A failed request is evicted so a retry actually hits the network again.
const jsonCache = new Map();

function cachedRequest(url) {
  if (!jsonCache.has(url)) {
    const promise = request(url).catch((error) => {
      jsonCache.delete(url);
      throw error;
    });
    jsonCache.set(url, promise);
  }
  return jsonCache.get(url);
}

export function getPokemonIndex() {
  return cachedRequest(`${API_BASE_URL}/pokemon?limit=1302&offset=0`);
}

// Accepts a name ("pikachu") or a Pokédex number ("25") — PokéAPI handles both.
export function getPokemon(nameOrId) {
  const key = String(nameOrId ?? "").trim().toLowerCase();
  return cachedRequest(`${API_BASE_URL}/pokemon/${encodeURIComponent(key)}`);
}

export function getSpecies(name) {
  const key = String(name ?? "").trim().toLowerCase();
  return cachedRequest(`${API_BASE_URL}/pokemon-species/${encodeURIComponent(key)}`);
}

export function getTypes() {
  return cachedRequest(`${API_BASE_URL}/type`);
}

export function getPokemonOfType(type) {
  return cachedRequest(`${API_BASE_URL}/type/${type}`);
}

// One list request + 18 detail requests, all cached, so the type-effectiveness
// panel is only ever paid for once per session. A single flaky type must not
// sink the whole panel, so failures are tolerated rather than thrown.
export function getAllTypeData() {
  return getTypes().then((list) =>
    Promise.allSettled(
      (list?.results ?? [])
        .filter((type) => type.name !== "shadow")
        .map((type) => getPokemonOfType(type.name))
    )
  ).then((results) =>
    results
      .filter((result) => result.status === "fulfilled" && result.value?.damage_relations)
      .map((result) => result.value)
  );
}

export function getEvolutionChain(url) {
  return cachedRequest(url);
}

// Bonus source #1: a random trainer quote. Never rejects — a null result simply
// tells the UI to fall back to a local quote. Successful results are remembered
// so React's StrictMode double-mount doesn't fire two identical requests.
let quotePromise = null;

export function getRandomQuote() {
  if (quotePromise) return quotePromise;

  quotePromise = request(QUOTE_API_URL, { timeout: 6000 })
    .then((data) => {
      const first = Array.isArray(data) ? data[0] : null;
      if (!first?.q) return null;
      return { text: first.q, author: first.a || "Unknown" };
    })
    .catch(() => {
      // Allow a later attempt (e.g. after a Retry) to try again.
      quotePromise = null;
      return null;
    });

  return quotePromise;
}

// Bonus source #2: a short encyclopedia blurb. Also never rejects.
const wikiPromises = new Map();

export function getWikipediaSummary(title) {
  const slug = String(title ?? "").trim().replace(/\s+/g, "_");
  if (!slug) return Promise.resolve(null);
  if (wikiPromises.has(slug)) return wikiPromises.get(slug);

  const promise = request(`${WIKIPEDIA_API_URL}/${encodeURIComponent(slug)}`, {
    timeout: 6000,
  })
    .then((data) => {
      const extract = typeof data?.extract === "string" ? data.extract : "";
      if (!extract || /may refer to/i.test(data?.title ?? "")) return null;
      return {
        title: data.title,
        description: data.description ?? "",
        extract,
        thumbnail: data.thumbnail?.source ?? null,
        url: data.content_urls?.desktop?.page ?? null,
      };
    })
    .catch(() => {
      wikiPromises.delete(slug);
      return null;
    });

  wikiPromises.set(slug, promise);
  return promise;
}
