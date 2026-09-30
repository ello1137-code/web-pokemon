import { useFetchJson } from "../hooks/useFetchJson.js";
import { getRandomQuote } from "../api.js";
import { FALLBACK_QUOTES } from "../config.js";

function TrainerQuote() {
  // Live quote from ZenQuotes; if that service is slow or down, a local quote
  // is used instead so this panel always has something to show.
  const { data } = useFetchJson("trainer-quote", getRandomQuote);
  const quote = data ?? FALLBACK_QUOTES[0];

  return (
    <figure className="quote-card">
      <span className="quote-card__mark" aria-hidden="true">
        “
      </span>
      <blockquote className="quote-card__text">{quote.text}</blockquote>
      <figcaption className="quote-card__author">— {quote.author}</figcaption>
    </figure>
  );
}

export default TrainerQuote;
