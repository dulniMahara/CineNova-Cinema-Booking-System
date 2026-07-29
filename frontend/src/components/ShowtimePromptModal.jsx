import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCalendar, FiX } from 'react-icons/fi';
import './ShowtimePromptModal.css';

const ShowtimePromptModal = ({ isOpen, onClose, movie }) => {
  const navigate = useNavigate();

  if (!isOpen || !movie) return null;

  const handleChooseShowtime = () => {
    onClose();
    navigate(`/movies/${movie._id}#showtimes`, {
      state: { scrollToShowtimes: true }
    });
  };

  return (
    <div className="showtime-prompt-backdrop" onClick={onClose}>
      <div className="showtime-prompt-card" onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button className="modal-close-icon" onClick={onClose} title="Close">
          <FiX />
        </button>

        {/* Icon Header */}
        <div className="modal-icon-container">
          <FiClock className="modal-clock-icon" />
        </div>

        {/* Modal Title & Content */}
        <h2 className="modal-prompt-title">Select a Showtime</h2>
        <p className="modal-prompt-message">
          Please choose your preferred date and showtime before booking your seats.
        </p>

        {movie.title && (
          <div className="modal-movie-tag">
            <FiCalendar /> {movie.title}
          </div>
        )}

        {/* Buttons Row */}
        <div className="modal-prompt-actions">
          <button className="btn-prompt-secondary" onClick={onClose}>
            Cancel
          </button>

          <button className="btn-prompt-primary" onClick={handleChooseShowtime}>
            Choose Showtime
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShowtimePromptModal;
