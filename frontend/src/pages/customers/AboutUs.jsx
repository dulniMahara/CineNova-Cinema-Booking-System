import React from 'react';
import {
  FiFilm,
  FiTv,
  FiSmartphone,
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiAward,
  FiUsers,
  FiClock,
  FiZap,
  FiShield
} from 'react-icons/fi';
import aboutHeroImg from '../../assets/about_hero.png';
import aboutStoryImg from '../../assets/about_story.png';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">

      {/* 1. HERO SECTION */}
      <section className="about-hero">
        <div className="hero-bg-wrapper">
          <img src={aboutHeroImg} alt="CineNova Luxury Cinema" className="hero-bg-img" />
          <div className="hero-overlay-dark"></div>
          <div className="hero-radial-glow"></div>
        </div>

        <div className="hero-content">
          <span className="hero-badge">
            <FiAward className="badge-icon" /> Next-Gen Cinematic Experience
          </span>
          <h1 className="hero-title">
            <span className="logo-cine">CINE</span>
            <span className="logo-nova">NOVA</span>
          </h1>
          <p className="hero-slogan">
            Elevating Cinematic Storytelling To Extraordinary Heights
          </p>
          <p className="hero-intro">
            Step into a world where cutting-edge technology meets unparalleled luxury.
            CineNova redefines entertainment with immersive 4K laser projection, Dolby Atmos acoustics,
            and VIP hospitality crafted for true film lovers.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="about-section story-section">
        <div className="about-container">
          <div className="story-split-grid">

            {/* Visual Image Card */}
            <div className="story-image-column">
              <div className="story-img-card">
                <img src={aboutStoryImg} alt="CineNova Story" className="story-img" />
                <div className="story-img-overlay"></div>
                <div className="story-floating-badge">
                  <span className="badge-number">10+</span>
                  <span className="badge-text">Years of Excellence</span>
                </div>
              </div>
            </div>

            {/* Story Text Content */}
            <div className="story-text-column">
              <div className="about-header-left">
                <span className="about-subtitle">OUR JOURNEY</span>
                <h2 className="about-title">Crafted for Passionate Movie Lovers</h2>
              </div>
              <p className="story-paragraph">
                Founded with a vision to revolutionize motion picture exhibition, CineNova has grown into Sri Lanka's premiere destination for blockbuster cinema.
              </p>
              <p className="story-paragraph">
                We blend architectural elegance with state-of-the-art screen technology. Every hall is engineered for optimal sightlines, crystal acoustics, and ultimate VIP seating comfort.
              </p>

              <div className="story-highlights-grid">
                <div className="story-chip">
                  <FiZap className="chip-icon" /> Ultra 4K Laser Projection
                </div>
                <div className="story-chip">
                  <FiStar className="chip-icon" /> Plush VIP Recliner Lounges
                </div>
                <div className="story-chip">
                  <FiShield className="chip-icon" /> Premium Gourmet Dining
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WHAT MAKES US SPECIAL */}
      <section className="about-section special-section">
        <div className="about-container">
          <div className="about-header-center">
            <span className="about-subtitle">THE CINENOVA ADVANTAGE</span>
            <h2 className="about-title">What Makes Us Special</h2>
            <p className="about-desc">Designed from the ground up to deliver perfection in every single frame.</p>
          </div>

          <div className="special-cards-grid">

            {/* Card 1: Premium Halls */}
            <div className="special-card">
              <div className="card-icon-box">
                <FiTv />
              </div>
              <h3 className="card-title">Premium Halls</h3>
              <p className="card-text">
                Custom-designed auditoriums featuring ergonomic VIP leather recliners, personal side tables, and expansive legroom.
              </p>
            </div>

            {/* Card 2: IMAX & Dolby Experience */}
            <div className="special-card">
              <div className="card-icon-box">
                <FiFilm />
              </div>
              <h3 className="card-title">IMAX & Dolby Experience</h3>
              <p className="card-text">
                Feel every emotion with IMAX 4K Laser projection and multi-dimensional Dolby Atmos 360° surround acoustics.
              </p>
            </div>

            {/* Card 3: Easy Online Booking */}
            <div className="special-card">
              <div className="card-icon-box">
                <FiSmartphone />
              </div>
              <h3 className="card-title">Easy Online Booking</h3>
              <p className="card-text">
                Select your preferred seats in real-time with instant digital tickets, seamless checkout, and zero queue hassle.
              </p>
            </div>

            {/* Card 4: Latest Movie Experiences */}
            <div className="special-card">
              <div className="card-icon-box">
                <FiStar />
              </div>
              <h3 className="card-title">Latest Movie Experiences</h3>
              <p className="card-text">
                From world premieres to indie masterworks, experience top global cinema releases the day they hit the big screen.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE STATISTICS */}
      <section className="about-section stats-section">
        <div className="about-container">
          <div className="stats-glass-container">
            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FiTv />
                </div>
                <h3 className="stat-number">10+</h3>
                <p className="stat-label">Premium Halls</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FiUsers />
                </div>
                <h3 className="stat-number">500K+</h3>
                <p className="stat-label">Happy Customers</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FiFilm />
                </div>
                <h3 className="stat-number">1000+</h3>
                <p className="stat-label">Movies Screened</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FiClock />
                </div>
                <h3 className="stat-number">24/7</h3>
                <p className="stat-label">Online Booking</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. OUR MISSION */}
      <section className="about-section mission-section">
        <div className="about-container">
          <div className="mission-card">
            <div className="mission-quote-mark">“</div>
            <span className="about-subtitle">OUR GUIDING PURPOSE</span>
            <h2 className="mission-title">Our Mission</h2>
            <blockquote className="mission-quote">
              "To create magical moments and unforgettable memories by delivering world-class cinema experiences that inspire, entertain, and unite audiences through the pure power of storytelling."
            </blockquote>
            <div className="mission-brand-tag">CINE<span className="gold-text">NOVA</span> EXECUTIVE VISION</div>
          </div>
        </div>
      </section>

      {/* 6. GET IN TOUCH */}
      <section className="about-section contact-section">
        <div className="about-container">
          <div className="about-header-center">
            <span className="about-subtitle">WE'RE HERE FOR YOU</span>
            <h2 className="about-title">Get In Touch</h2>
            <p className="about-desc">Have questions or feedback? Connect with our dedicated guest service team.</p>
          </div>

          <div className="contact-cards-grid">

            <div className="contact-card">
              <div className="contact-icon-box">
                <FiMapPin />
              </div>
              <h3 className="contact-card-title">Visit Us</h3>
              <p className="contact-card-text">
                100 Premium Blvd, Cinema City<br />
                Colombo, Sri Lanka
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-icon-box">
                <FiPhone />
              </div>
              <h3 className="contact-card-title">Call Us</h3>
              <p className="contact-card-text">
                +1 (555) 123-4567<br />
                +1 (555) 123-4060<br />
                <span className="highlight-sub">Mon - Sun: 9:00 AM - 11:00 PM</span>
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-icon-box">
                <FiMail />
              </div>
              <h3 className="contact-card-title">Email Us</h3>
              <p className="contact-card-text">
                info@cinenova.com<br />
                support@cinenova.com<br />
                <span className="highlight-sub">Guaranteed response within 24 hours</span>
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
