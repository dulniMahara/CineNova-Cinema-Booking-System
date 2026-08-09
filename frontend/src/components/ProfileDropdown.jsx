import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiBookmark, 
  FiCreditCard, 
  FiKey, 
  FiLogOut,
  FiChevronDown
} from 'react-icons/fi';
import Avatar from './Avatar';
import './ProfileDropdown.css';

const ProfileDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  const getFirstName = (name = "") => {
    if (!name) return "Member";
    return name.trim().split(/\s+/)[0];
  };

  // Close dropdown when clicking outside, pressing Escape, or when another dropdown opens
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleCloseOtherDropdowns = (event) => {
      if (event.detail?.sender !== 'profile') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('topbar_close_dropdowns', handleCloseOtherDropdowns);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('topbar_close_dropdowns', handleCloseOtherDropdowns);
    };
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    if (nextState) {
      window.dispatchEvent(new CustomEvent('topbar_close_dropdowns', { detail: { sender: 'profile' } }));
    }
    setIsOpen(nextState);
  };

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
      {/* Dark Glass Pill Control */}
      <button 
        className={`profile-pill-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="User Account Menu"
        aria-expanded={isOpen}
      >
        <Avatar name={user.name} size="medium" />
        <span className="profile-first-name">{getFirstName(user.name)}</span>
        <FiChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="profile-dropdown" role="menu">
          
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
              role="menuitem"
            >
              <FiUser className="menu-icon" />
              <span>My Profile</span>
            </button>

            <button 
              className="dropdown-menu-item"
              onClick={() => handleItemClick('/my-bookings')}
              role="menuitem"
            >
              <FiBookmark className="menu-icon" />
              <span>My Bookings</span>
            </button>

            <button 
              className="dropdown-menu-item"
              onClick={() => handleItemClick('/my-payments')}
              role="menuitem"
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
              role="menuitem"
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
              role="menuitem"
            >
              <FiLogOut className="menu-icon" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;