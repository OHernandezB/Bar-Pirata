import { OpeningHours } from './OpeningHours.jsx';

export function Footer({ brand = 'Bar Pirata', year = new Date().getFullYear(), social = defaultSocial }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">{brand} © {year}</div>
        <div className="footer__hours">
          <OpeningHours compact />
        </div>
        <div className="footer__social">
          {social.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer">{label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

const defaultSocial = [
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'TikTok', href: '#' },
];