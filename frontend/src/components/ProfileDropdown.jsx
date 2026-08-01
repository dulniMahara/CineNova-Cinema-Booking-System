import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiBookmark, 
  FiCreditCard, 
  FiKey, 
  FiLogOut 
} from 'react-icons/fi';
import Avatar from './Avatar';
import './ProfileDropdown.css';

const ProfileDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

  const handleItemClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <div className="profile-trigger" onClick={() => setIsOpen(!isOpen)} title="Account Menu">
        <Avatar name={user.name} size="medium" />
      </div>

      {isOpen && (
        <div className="profile-dropdown">
          
          {/* Profile Header */}
          <div className="dropdown-header">
            <div className="header-avatar-ring">
              <Avatar name={user.name} size="large" />
            </div>
            <div className="header-user-details">
              <h3 className="user-name">{user.name || 'CineNova Member'}</h3>
              <p className="user-email">{user.email || 'member@cinenova.com'}</p>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Section 1: My Account */}
          <div className="dropdown-section">
            <span className="dropdown-section-label">My Account</span>
            
            <button 
              className="dropdown-menu-item"
              onClick={() => handleItemClick('/profile')}
            >
              <FiUser className="menu-icon" />
              <span>My Profile</span>
            </button>

            <button 
              className="dropdown-menu-item"
              onClick={() => handleItemClick('/my-bookings')}
            >
              <FiBookmark className="menu-icon" />
              <span>My Bookings</span>
            </button>

            <button 
              className="dropdown-menu-item"
              onClick={() => handleItemClick('/my-payments')}
            >
              <FiCreditCard className="menu-icon" />
              <span>My Payments</span>
            </button>
          </div>

          <div className="dropdown-divider"></div>

          {/* Section 2: Settings */}
          <div className="dropdown-section">
            <span className="dropdown-section-label">Settings</span>
            
            <button 
              className="dropdown-menu-item"
              onClick={() => handleItemClick('/profile#change-password')}
            >
              <FiKey className="menu-icon" />
              <span>Change Password</span>
            </button>
          </div>

          <div className="dropdown-divider"></div>

          {/* Section 3: Account / Logout */}
          <div className="dropdown-section">
            <button 
              className="dropdown-menu-item logout-item"
              onClick={handleLogout}
            >
              <FiLogOut className="menu-icon" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;