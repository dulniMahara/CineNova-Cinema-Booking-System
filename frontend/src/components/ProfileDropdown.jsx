import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaSignOutAlt } from 'react-icons/fa';
import { MdConfirmationNumber, MdPayments } from 'react-icons/md';
import Avatar from './Avatar';
import './ProfileDropdown.css';

const ProfileDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('role');

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

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <div className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Avatar name={user.name} size="medium" />
      </div>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <Avatar name={user.name} size="large" />
            <h3>{user.name}</h3>
            <p className="profile-email">{user.email}</p>
            <span className="profile-role-badge">{role}</span>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-menu">
            <button 
              className="profile-menu-item"
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
            >
              <span className="menu-icon"><FaUserEdit /></span>
              Manage Profile
            </button>
            <button 
              className="profile-menu-item"
              onClick={() => {
                setIsOpen(false);
                navigate('/my-bookings');
              }}
            >
              <span className="menu-icon"><MdConfirmationNumber /></span>
              My Bookings
            </button>
            <button 
              className="profile-menu-item"
              onClick={() => {
                setIsOpen(false);
                navigate('/my-payments');
              }}
            >
              <span className="menu-icon"><MdPayments /></span>
              My Payments
            </button>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-menu">
            
            <button 
              className="profile-menu-item logout"
              onClick={handleLogout}
            >
              <span className="menu-icon"><FaSignOutAlt /></span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;