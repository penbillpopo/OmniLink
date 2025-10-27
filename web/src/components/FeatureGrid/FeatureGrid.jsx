import './FeatureGrid.css';

function FeatureGrid({ intro, features }) {
  return (
    <section className="feature-grid" id="new-arrivals">
      <div className="section-heading">
        <p className="eyebrow">{intro.eyebrow}</p>
        <h2>{intro.title}</h2>
        <p>{intro.description}</p>
      </div>
      <div className="grid">
        {features.map((feature) => (
          <article key={feature.id} className="feature-card">
            <img src={feature.image} alt={feature.title} />
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeatureGrid;
