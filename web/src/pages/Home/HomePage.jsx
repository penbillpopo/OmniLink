import TopNav from '../../components/TopNav/TopNav';
import HeroSlider from '../../components/HeroSlider/HeroSlider';
import FeatureGrid from '../../components/FeatureGrid/FeatureGrid';
import SplitFeature from '../../components/SplitFeature/SplitFeature';
import StoryGrid from '../../components/StoryGrid/StoryGrid';
import NewsletterCTA from '../../components/NewsletterCTA/NewsletterCTA';
import SiteFooter from '../../components/SiteFooter/SiteFooter';
import {
  curatedStories,
  featureHighlights,
  featureIntro,
  navLinks,
  newsletterContent,
  sliderItems,
  splitFeature,
  storyIntro,
} from './homeData';
import './HomePage.css';

function HomePage() {
  return (
    <div className="page-shell">
      <TopNav navLinks={navLinks} />
      <main className="home-main">
        <HeroSlider slides={sliderItems} />
        <FeatureGrid intro={featureIntro} features={featureHighlights} />
        <SplitFeature content={splitFeature} />
        <StoryGrid intro={storyIntro} stories={curatedStories} />
        <NewsletterCTA content={newsletterContent} />
      </main>
      <SiteFooter />
    </div>
  );
}

export default HomePage;
