import { useState } from 'react'
import { OpeningHours } from './OpeningHours.jsx'
import { Instagram, Facebook, Tiktok } from 'react-bootstrap-icons'

export function Footer({ brand = 'Bar Pirata', year = new Date().getFullYear() }) {
  const [mapOpen, setMapOpen] = useState(false)

  const address = 'Carlos Antúnez 2857-2877, Providencia, Región Metropolitana'
  const addressUrl = 'https://maps.app.goo.gl/TQEDAnuoEp4NgUGJ6'
  const phone = '+569 8325 0599'
  const phone2 = '+569 8783 7306'
  const email = 'om.hernandez@duocuc.cl'
  const email2 = 'pa.albanese@duocuc.cl'
  const mapEmbedUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=-70.598167,-33.427023,-70.590167,-33.421023&layer=mapnik&marker=-33.424023,-70.594167'

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Información de contacto */}
        <section className="footer__contact" aria-label="Información de contacto">
          <h3 style={{ color: 'var(--color-accent)', margin: 0, marginBottom: '0.5rem', fontSize: '1.05rem' }}>Contacto</h3>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <div><strong>Dirección:</strong> {address} {' '}<a href={addressUrl} target="_blank" rel="noreferrer">Ver en Google Maps</a></div>
            <div><strong>Tel:</strong> <a href={`tel:${String(phone).replace(/\s+/g, '')}`}>{phone}</a> {' '}|{' '} <a href={`tel:${String(phone2).replace(/\s+/g, '')}`}>{phone2}</a></div>
            <div><strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a> {' '}|{' '} <a href={`mailto:${email2}`}>{email2}</a></div>
            <div className="footer__social" aria-label="Redes sociales">
              <a href="#" title="Instagram" aria-label="Instagram"><Instagram /></a>
              <a href="#" title="Facebook" aria-label="Facebook"><Facebook /></a>
              <a href="#" title="TikTok" aria-label="TikTok"><Tiktok /></a>
            </div>
          </div>
        </section>

        {/* Horarios compactos */}
        <div className="footer__hours">
          <OpeningHours compact />
        </div>

        {/* Mini mapa */}
        <section className="footer__map" aria-label="Mapa">
          <h3 style={{ color: 'var(--color-accent)', margin: 0, marginBottom: '0.5rem', fontSize: '1.05rem' }}>Ubicación</h3>
          <div className="footer__map-thumb" role="button" tabIndex={0} aria-label="Abrir mapa" onClick={() => setMapOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter') setMapOpen(true) }}>
            <iframe title="Mapa mini" src={mapEmbedUrl} style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </section>
      </div>

      {/* Franja inferior */}
      <div className="footer__bottom">{brand} © 2025</div>

      {/* Modal de mapa */}
      {mapOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Mapa grande">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setMapOpen(false)} aria-label="Cerrar">×</button>
            <div className="modal-body">
              <iframe title="Mapa grande" src={mapEmbedUrl} style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <div className="modal-actions">
              <a className="navbar__login" href={addressUrl} target="_blank" rel="noreferrer">Ver en Google Maps</a>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
