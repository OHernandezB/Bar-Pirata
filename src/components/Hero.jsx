export function Hero({ title = 'Bar Pirata', subtitle = 'Cócteles artesanales, buena música y amigos', ctaText = 'Reservar mesa', onCtaClick }) {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button className="hero__cta" onClick={onCtaClick}>{ctaText}</button>
      </div>
    </section>
  );
}