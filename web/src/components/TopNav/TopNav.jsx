import './TopNav.css';

function TopNav({ navLinks }) {
  return (
    <header className="top-nav">
      <span className="brand">Trevia Market</span>
      <nav className="nav-links" aria-label="Primary navigation">
        {navLinks.map((link) => (
          <a key={link.id} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <button type="button" className="ghost-button">
          Sign In
        </button>
        <button type="button" className="solid-button">
          View Cart
        </button>
      </div>
    </header>
  );
}

export default TopNav;
