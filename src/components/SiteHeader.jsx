import { Navbar } from './Navbar.jsx';

export function SiteHeader({
  brand = 'Bar Pirata',
  messages,
  intervalMs,
  phone,
  email,
}) {
  return (
    <header className="site-header" role="banner">
      <Navbar brand={brand} />
    </header>
  );
}

export default SiteHeader;