import './NewsletterCTA.css';

function NewsletterCTA({ content }) {
  return (
    <section className="newsletter" id="journal">
      <div className="newsletter-inner">
        <div className="newsletter-copy">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <form className="newsletter-form">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input id="email" name="email" type="email" placeholder="you@example.com" />
          <button type="submit" className="solid-button">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterCTA;
