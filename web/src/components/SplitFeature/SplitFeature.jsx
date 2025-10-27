import './SplitFeature.css';

function SplitFeature({ content }) {
  return (
    <section className="split-feature" id="collections">
      <div className="split-image">
        <img src={content.image} alt={content.imageAlt} />
      </div>
      <div className="split-copy">
        <p className="eyebrow">{content.eyebrow}</p>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
        <div className="split-actions">
          <a className="solid-button" href={content.primaryAction.href}>
            {content.primaryAction.label}
          </a>
          <a className="ghost-button" href={content.secondaryAction.href}>
            {content.secondaryAction.label}
          </a>
        </div>
      </div>
    </section>
  );
}

export default SplitFeature;
