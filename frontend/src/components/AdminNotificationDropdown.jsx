import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiBell,
  FiBookmark,
  FiCreditCard,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiExternalLink
} from 'react-icons/fi';
import './AdminNotificationDropdown.css';

const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const AdminNotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastReadTime, setLastReadTime] = useState(() => {
    return localStorage.getItem('admin_last_read_notif_time') || null;
  });

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling

    // Listen for read-state updates from full Admin Notifications page
    const handleReadStateUpdate = () => {
      const updatedTime = localStorage.getItem('admin_last_read_notif_time');
      setLastReadTime(updatedTime);
    };

    window.addEventListener('admin_notif_read_updated', handleReadStateUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('admin_notif_read_updated', handleReadStateUpdate);
    };
  }, []);

  // Handle click outside, Escape key, and mutual exclusion with Profile dropdown
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
      if (event.detail?.sender !== 'notification') {
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

  // Calculate unread count (notifications newer than lastReadTime)
  const unreadCount = notifications.filter(n => {
    if (!lastReadTime) return true;
    return new Date(n.timestamp) > new Date(lastReadTime);
  }).length;

  const handleToggle = () => {
    const nextState = !isOpen;
    if (nextState) {
      window.dispatchEvent(new CustomEvent('topbar_close_dropdowns', { detail: { sender: 'notification' } }));
      fetchNotifications();
      // Mark all currently displayed as read
      const nowIso = new Date().toISOString();
      localStorage.setItem('admin_last_read_notif_time', nowIso);
      setLastReadTime(nowIso);
      window.dispatchEvent(new Event('admin_notif_read_updated'));
    }
    setIsOpen(nextState);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/admin/notifications');
  };

  const handleNotificationClick = (item) => {
    setIsOpen(false);
    if (item.type === 'new_booking' || item.type === 'pay_at_counter') {
      navigate('/admin/bookings');
    } else if (item.type === 'payment') {
      navigate('/admin/payments');
    } else if (item.type === 'new_customer') {
      navigate('/admin/users');
    } else {
      navigate('/admin/notifications');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'new_booking':
        return <FiBookmark className="menu-icon" />;
      case 'payment':
        return <FiCreditCard className="menu-icon" />;
      case 'pay_at_counter':
        return <FiClock className="menu-icon" />;
      case 'new_customer':
        return <FiUser className="menu-icon" />;
      default:
        return <FiBell className="menu-icon" />;
    }
  };

  return (
    <div className="admin-notif-container" ref={dropdownRef}>
      {/* Bell Trigger Button - Matching Pill Control Aesthetic */}
      <button
        className={`admin-notif-bell-btn ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        title="Notifications & System Activity"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="admin-notif-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="admin-notif-dropdown" role="menu">

          {/* 1. Header Section - Matches ProfileDropdown Header */}
          <div className="dropdown-header">
            <div className="header-avatar-ring">
              <div className="notif-avatar-circle">
                <FiBell size={20} className="avatar-bell-icon" />
                <span className="avatar-status-dot" />
              </div>
            </div>
            <div className="header-user-details">
              <h3 className="user-name">Notifications</h3>
              <p className="user-email">Recent cinema activity</p>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* 2. Section Label */}
          <div className="dropdown-section-header-row">
            <span className="dropdown-section-label">System Activity</span>
            {unreadCount > 0 ? (
              <span className="unread-tag">{unreadCount} unread</span>
            ) : (
              <span className="read-tag">All caught up</span>
            )}
          </div>

          {/* 3. Notifications List Area */}
          <div className="dropdown-notif-scroll-area">
            {loading && notifications.length === 0 ? (
              <div className="dropdown-loading-state">
                <div className="dropdown-spinner"></div>
                <p>Loading activity...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="dropdown-empty-state">
                <FiCheckCircle className="empty-icon" />
                <h4 className="empty-title">No new notifications</h4>
                <p className="empty-sub">You're all caught up.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !lastReadTime || new Date(item.timestamp) > new Date(lastReadTime);
                return (
                  <button
                    key={item._id}
                    className={`dropdown-menu-item notif-item ${isUnread ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(item)}
                    role="menuitem"
                  >
                    <div className="item-icon-wrapper">
                      {getNotifIcon(item.type)}
                      {isUnread && <span className="item-unread-dot" />}
                    </div>
                    <div className="item-details-col">
                      <div className="item-title-row">
                        <span className="item-title">{item.title}</span>
                        <span className="item-time">{formatRelativeTime(item.timestamp)}</span>
                      </div>
                      <p className="item-description">{item.description}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="dropdown-divider"></div>

          {/* 4. Footer Section - Action Button */}
          <div className="dropdown-section footer-section">
            <button
              className="dropdown-menu-item view-all-item"
              onClick={handleViewAll}
              role="menuitem"
            >
              <FiExternalLink className="menu-icon" />
              <span>View All Notifications</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;
