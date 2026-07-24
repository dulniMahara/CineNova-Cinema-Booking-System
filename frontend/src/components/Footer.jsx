import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { MdMovie } from "react-icons/md";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="brand-logo">
            <span className="logo-text">
              <span className="logo-cine">Cine</span>
              <span className="logo-nova">Nova</span>
            </span>
          </div>
          <span className="logo-tagline">Where Stories Come Alive</span>
          <p className="brand-description">
            Experience the pinnacle of cinematic luxury. From IMAX depth to Dolby acoustic precision and personalized VIP service.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Youtube"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/movies">Now Showing</Link></li>
            <li><Link to="/movies">Coming Soon</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        <div className="footer-experience">
          <h4>Experiences</h4>
          <ul>
            <li>IMAX Experience</li>
            <li>Dolby Atmos Sound</li>
            <li>VIP Dine-In Lounge</li>
            <li>Private Screenings</li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p><FaMapMarkerAlt className="contact-icon" /> 100 Premium Blvd, Cinema City</p>
          <p><FaPhoneAlt className="contact-icon" /> +1 (555) 123-4567</p>
          <p><FaEnvelope className="contact-icon" /> support@cinenova.com</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 CineNova Premium Theatres | All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;