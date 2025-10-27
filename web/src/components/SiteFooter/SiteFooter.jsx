import './SiteFooter.css';

function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Trevia Market. Crafted with care.</p>
      <div className="footer-links">
        <a href="/">Privacy</a>
        <a href="/">Terms</a>
        <a href="/">Help</a>
      </div>
    </footer>
  );
}

export default SiteFooter;
