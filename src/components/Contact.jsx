export function Contact({ address = defaultAddress, phone = '+00 000 0000', email = 'hola@barpirata.com', mapEmbedUrl }) {
  return (
    <section id="contacto" className="contact">
      <h2>Contacto</h2>
      <div className="contact__grid">
        <div className="contact__info">
          <p>{address}</p>
          <p>Tel: <a href={`tel:${phone}`}>{phone}</a></p>
          <p>Email: <a href={`mailto:${email}`}>{email}</a></p>
        </div>
        <div className="contact__map">
          {mapEmbedUrl ? (
            <iframe
              title="Ubicación"
              src={mapEmbedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="map__placeholder">Mapa embebido disponible al configurar `mapEmbedUrl`.</div>
          )}
        </div>
      </div>
    </section>
  );
}

const defaultAddress = 'Calle Falsa 123, Centro, Ciudad';