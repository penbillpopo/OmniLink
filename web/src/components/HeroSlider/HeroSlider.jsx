import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import './HeroSlider.css';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

function HeroSlider({ slides }) {
  return (
    <section className="hero-slider" aria-label="Featured collections">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        loop
        autoplay={{ delay: 5200, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        slidesPerView={1}
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <article className="hero-slide" style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="hero-overlay">
                <p className="hero-eyebrow">{slide.eyebrow}</p>
                <h1>{slide.title}</h1>
                <p className="hero-description">{slide.description}</p>
                <button type="button" className="solid-button">
                  {slide.cta}
                </button>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default HeroSlider;
