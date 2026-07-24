import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MovieCard from "../../components/MovieCard";
import { getMovies } from "../../services/movieService";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade, Pagination } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Icons
import {
  MdAspectRatio,
  MdSurroundSound,
  MdWorkspacePremium,
  MdConfirmationNumber,
  MdPlayArrow,
  MdClose
} from "react-icons/md";
import "./Home.css";

import heroSpiderman from "../../assets/hero/spiderman-banner.jpg";
import heroF1 from "../../assets/hero/f1-banner.png";
import heroBlackWidow from "../../assets/hero/blackwidow-banner.jpg";

const heroSlidesData = [
  {
    title: "Spider-Man: Brand New Day",
    image: heroSpiderman,
    searchKey: "spider",
    trailerUrl: "https://www.youtube.com/watch?v=SpideyBrandNewTrailer"
  },
  {
    title: "F1 (2025)",
    image: heroF1,
    searchKey: "f1",
    trailerUrl: "https://www.youtube.com/watch?v=F12025Trailer"
  },
  {
    title: "Black Widow",
    image: heroBlackWidow,
    searchKey: "black",
    trailerUrl: "https://www.youtube.com/watch?v=BlackWidowTrailer"
  }
];

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Derived state from movies
  const nowShowing = movies.filter((m) => m.status === "now");
  const comingSoon = movies.filter((m) => m.status === "soon");

  // Scroll to hash anchor when navigated from another page with #section
  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.hash, loading]);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p className="loading-tagline">Cinematic Experiences, Reimagined</p>
        <p className="loading-subtext">Preparing Your CineNova Premium Experience...</p>
      </div>
    );
  }

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes("youtube.com/watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url; 
  };

  const handleBookNow = (movieId) => {
    navigate(`/buy-tickets/${movieId}`);
  };

  return (
    <div className="movie-home" id="home">
      {/* FEATURED HERO SPOTLIGHT CAROUSEL */}
      <section className="hero-spotlight">
        <Swiper
          modules={[Navigation, Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="hero-carousel"
        >
          {heroSlidesData.map((slide, idx) => {
            const matchedMovie = movies.find((m) =>
              m.title.toLowerCase().includes(slide.searchKey)
            );
            const movieId = matchedMovie ? matchedMovie._id : (movies[0]?._id || "");
            const trailer = matchedMovie?.trailerUrl || slide.trailerUrl;

            return (
              <SwiperSlide key={idx}>
                <div className="hero-slide-container">
                  <div className="hero-bg-wrapper">
                    <img src={slide.image} alt={slide.title} className="hero-bg-img" />
                    <div className="hero-dark-overlay"></div>
                  </div>
                  
                  <div className="hero-bottom-actions">
                    <button 
                      className="hero-btn gold"
                      onClick={() => movieId && handleBookNow(movieId)}
                    >
                      <MdConfirmationNumber size={18} /> Book Now
                    </button>
                    <button 
                      className="hero-btn glass"
                      onClick={() => {
                        setActiveTrailerUrl(trailer);
                        setShowTrailer(true);
                      }}
                    >
                      <MdPlayArrow size={20} /> Watch Trailer
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>

      {/* NOW SHOWING SECTION */}
      <section className="home-slider-section" id="now-showing">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="title-accent"></span>
            <h2 className="home-section-title">Now Showing</h2>
          </div>
        </div>
        
        <div className="swiper-container-wrapper">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={30}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 15 },
              600: { slidesPerView: 2.2, spaceBetween: 20 },
              900: { slidesPerView: 3.2, spaceBetween: 25 },
              1200: { slidesPerView: 4, spaceBetween: 30 },
            }}
            className="premium-swiper"
          >
            {nowShowing.map((movie) => (
              <SwiperSlide key={movie._id}>
                <MovieCard movie={movie} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* PREMIUM FEATURES HIGHLIGHT */}
      <section className="premium-experiences-section" id="features">
        <div className="section-header centered">
          <span className="subtitle">Only at CineNova</span>
          <h2 className="home-section-title">Elevate Your Senses</h2>
          <p className="section-intro">Immerse yourself in world-class amenities designed to make every screening unforgettable.</p>
        </div>

        <div className="experiences-grid">
          <div className="experience-card">
            <div className="exp-icon-wrapper">
              <MdAspectRatio size={36} />
            </div>
            <h3>IMAX Experience</h3>
            <p>Dual laser projection and monumental screens that make you feel part of the movie.</p>
            <div className="card-border-gradient"></div>
          </div>

          <div className="experience-card">
            <div className="exp-icon-wrapper">
              <MdSurroundSound size={36} />
            </div>
            <h3>Dolby Atmos Sound</h3>
            <p>Multidimensional soundscapes that move all around you with breathtaking realism.</p>
            <div className="card-border-gradient"></div>
          </div>

          <div className="experience-card">
            <div className="exp-icon-wrapper">
              <MdWorkspacePremium size={36} />
            </div>
            <h3>VIP Seating</h3>
            <p>Ultra-plush leather recliners with in-theater gourmet dining at the push of a button.</p>
            <div className="card-border-gradient"></div>
          </div>

          <div className="experience-card">
            <div className="exp-icon-wrapper">
              <MdConfirmationNumber size={36} />
            </div>
            <h3>Online Booking</h3>
            <p>Pick your perfect seats, pre-order snacks, and enter with a simple digital ticket barcode.</p>
            <div className="card-border-gradient"></div>
          </div>
        </div>
      </section>

      {/* COMING SOON CAROUSEL */}
      <section className="home-slider-section coming-soon-bg" id="coming-soon">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="title-accent"></span>
            <h2 className="home-section-title">Coming Soon</h2>
          </div>
        </div>
        
        <div className="swiper-container-wrapper">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={30}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 15 },
              600: { slidesPerView: 2.2, spaceBetween: 20 },
              900: { slidesPerView: 3.2, spaceBetween: 25 },
              1200: { slidesPerView: 4, spaceBetween: 30 },
            }}
            className="premium-swiper"
          >
            {comingSoon.map((movie) => (
              <SwiperSlide key={movie._id}>
                <MovieCard movie={movie} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* TRAILER MODAL */}
      {showTrailer && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-modal-close" onClick={() => setShowTrailer(false)}>
              <MdClose size={28} />
            </button>
            <div className="trailer-iframe-wrapper">
              <iframe
                width="100%"
                height="100%"
                src={getEmbedUrl(activeTrailerUrl || movies[0]?.trailerUrl)}
                title="Official Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;