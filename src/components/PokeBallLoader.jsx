function PokeBallLoader({ label = "Loading Pokédex…" }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="pokeball-loader" aria-hidden="true">
        <span className="pokeball-loader__core" />
      </span>
      <p className="loader-text">{label}</p>
    </div>
  );
}

export default PokeBallLoader;
