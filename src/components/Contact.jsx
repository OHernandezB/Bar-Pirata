export function Contact({ 
  address = defaultAddressText,
  addressUrl = defaultAddressUrl,
  phone = '+569 8325 0599',
  email = 'om.hernandez@duocuc.cl',
  mapEmbedUrl = defaultMapEmbedUrl,
  mapImageUrl = defaultMapImageUrl,
}) {
  return (
    <section id="contacto" className="contact">
      <h2>Contacto</h2>
      <div className="contact__grid">
        <div className="contact__info">
          <p>
            <strong>Ubicación:</strong> {address}
            {' '}<a href={addressUrl} target="_blank" rel="noreferrer">Ver en Google Maps</a>
          </p>
          <p>Tel: <a href={`tel:${String(phone).replace(/\s+/g, '')}`}>{phone}</a></p>
          <p>Email: <a href={`mailto:${email}`}>{email}</a></p>
        </div>
        <div className="contact__map">
          {mapImageUrl && (
            <img src={mapImageUrl} alt="Mapa de ubicación" onError={(e) => (e.currentTarget.style.display = 'none')} />
          )}
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
            !mapImageUrl && <div className="map__placeholder">Mapa embebido disponible al configurar `mapEmbedUrl`.</div>
          )}
        </div>
      </div>
    </section>
  );
}

const defaultAddressText = 'Carlos Antúnez 2857-2877, Providencia, Región Metropolitana';
const defaultAddressUrl = 'https://maps.app.goo.gl/TQEDAnuoEp4NgUGJ6';
const defaultMapImageUrl = 'https://osm-static-maps.herokuapp.com/?height=300&width=600&center=-33.424023,-70.594167&zoom=17&attribution=%C2%A9%20OpenStreetMap-Contributors';
const defaultMapEmbedUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=-70.598167,-33.427023,-70.590167,-33.421023&layer=mapnik&marker=-33.424023,-70.594167';