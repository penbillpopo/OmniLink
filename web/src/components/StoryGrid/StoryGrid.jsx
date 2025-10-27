import './StoryGrid.css';

function StoryGrid({ intro, stories }) {
  return (
    <section className="story-grid" id="stories" aria-labelledby="stories-heading">
      <div className="section-heading">
        <p className="eyebrow">{intro.eyebrow}</p>
        <h2 id="stories-heading">{intro.title}</h2>
      </div>
      <div className="grid">
        {stories.map((story) => (
          <article key={story.id} className="story-card">
            <img src={story.image} alt={story.title} />
            <div className="story-content">
              <h3>{story.title}</h3>
              <p>{story.description}</p>
              <button type="button" className="ghost-button">
                Read Story
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StoryGrid;
