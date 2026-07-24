import React from 'react';
import { FaFilm, FaUsers, FaTicketAlt, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      
      <div className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About Cinema Booking</h1>
          <p className="about-hero-subtitle">
            Your Premium Destination for Unforgettable Movie Experiences
          </p>
        </div>
      </div>

     
      <section className="about-section">
        <div className="about-content">
          <h2 className="about-section-title">Our Story</h2>
          <p className="about-text">
            Welcome to Cinema Booking, where cinematic dreams come to life. Since our establishment,
            we've been dedicated to providing movie enthusiasts with an exceptional viewing experience.
            Our state-of-the-art facilities, combined with cutting-edge technology, ensure that every
            visit is memorable.
          </p>
          <p className="about-text">
            We believe that watching a movie is more than just entertainment—it's an experience that
            brings people together. From the latest blockbusters to indie gems, we curate a diverse
            selection of films to cater to all tastes and preferences.
          </p>
        </div>
      </section>

      
      <section className="features-section">
        <h2 className="about-section-title">What Makes Us Special</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaFilm />
            </div>
            <h3 className="feature-title">Premium Screens</h3>
            <p className="feature-text">
              Experience movies on our ultra-HD screens with crystal-clear picture quality
              and immersive surround sound systems.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaTicketAlt />
            </div>
            <h3 className="feature-title">Easy Booking</h3>
            <p className="feature-text">
              Book your tickets online with our user-friendly platform. Choose your seats,
              select showtimes, and skip the queues.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaUsers />
            </div>
            <h3 className="feature-title">Comfortable Seating</h3>
            <p className="feature-text">
              Relax in our luxurious recliner seats with ample legroom, ensuring maximum
              comfort throughout your movie.
            </p>
          </div>

        </div>
      </section>

     
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <h3 className="stat-number">10+</h3>
            <p className="stat-label">Premium Halls</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">500K+</h3>
            <p className="stat-label">Happy Customers</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">1000+</h3>
            <p className="stat-label">Movies Screened</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">4.8/5</h3>
            <p className="stat-label">Customer Rating</p>
          </div>
        </div>
      </section>

      
      <section className="contact-section">
        <h2 className="about-section-title">Get In Touch</h2>
        <div className="contact-grid">
          <div className="contact-item">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>
            <h3 className="contact-title">Visit Us</h3>
            <p className="contact-text">
              123 Cinema Street<br />
              Entertainment District<br />
              Colombo, Sri Lanka
            </p>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <FaPhone />
            </div>
            <h3 className="contact-title">Call Us</h3>
            <p className="contact-text">
              +94 11 234 5678<br />
              +94 77 123 4567<br />
              Mon - Sun: 9AM - 11PM
            </p>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <FaEnvelope />
            </div>
            <h3 className="contact-title">Email Us</h3>
            <p className="contact-text">
              info@cinemabooking.com<br />
              support@cinemabooking.com<br />
              We reply within 24 hours
            </p>
          </div>
        </div>
      </section>

     
      <section className="mission-section">
        <div className="mission-content">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="mission-text">
            "To create magical moments and unforgettable memories by delivering
            world-class cinema experiences that inspire, entertain, and bring
            communities together through the power of storytelling."
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
