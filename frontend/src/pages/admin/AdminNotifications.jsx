import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiBell, 
  FiBookmark, 
  FiCreditCard, 
  FiClock, 
  FiUser, 
  FiSearch, 
  FiRefreshCw, 
  FiCheckSquare,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiInfo
} from 'react-icons/fi';
import './AdminNotifications.css';

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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatFullDateTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const ITEMS_PER_PAGE = 20;

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'bookings', 'payments', 'customers'
  const [readFilter, setReadFilter] = useState('all'); // 'all', 'unread', 'read'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [currentPage, setCurrentPage] = useState(1);

  const [lastReadTime, setLastReadTime] = useState(() => {
    return localStorage.getItem('admin_last_read_notif_time') || null;
  });

  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/notifications?limit=100`, {
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

    const handleReadStateUpdate = () => {
      setLastReadTime(localStorage.getItem('admin_last_read_notif_time'));
    };

    window.addEventListener('admin_notif_read_updated', handleReadStateUpdate);
    return () => window.removeEventListener('admin_notif_read_updated', handleReadStateUpdate);
  }, []);

  // Compute Metrics Summary
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !lastReadTime || new Date(n.timestamp) > new Date(lastReadTime)).length;
    const bookingsCount = notifications.filter(n => n.type === 'new_booking' || n.type === 'pay_at_counter').length;
    const paymentsCount = notifications.filter(n => n.type === 'payment').length;
    return { total, unread, bookingsCount, paymentsCount };
  }, [notifications, lastReadTime]);

  // Filter and Sort Notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Category Filter
    if (categoryFilter === 'bookings') {
      result = result.filter(n => n.type === 'new_booking' || n.type === 'pay_at_counter');
    } else if (categoryFilter === 'payments') {
      result = result.filter(n => n.type === 'payment');
    } else if (categoryFilter === 'customers') {
      result = result.filter(n => n.type === 'new_customer');
    }

    // Read / Unread Filter
    if (readFilter === 'unread') {
      result = result.filter(n => !lastReadTime || new Date(n.timestamp) > new Date(lastReadTime));
    } else if (readFilter === 'read') {
      result = result.filter(n => lastReadTime && new Date(n.timestamp) <= new Date(lastReadTime));
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q)) ||
        (n.meta?.customerName && n.meta.customerName.toLowerCase().includes(q)) ||
        (n.meta?.movieTitle && n.meta.movieTitle.toLowerCase().includes(q)) ||
        (n.meta?.refCode && n.meta.refCode.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [notifications, categoryFilter, readFilter, searchQuery, sortOrder, lastReadTime]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, readFilter, searchQuery, sortOrder]);

  // Pagination Math
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleMarkAllRead = () => {
    const nowIso = new Date().toISOString();
    localStorage.setItem('admin_last_read_notif_time', nowIso);
    setLastReadTime(nowIso);
    window.dispatchEvent(new Event('admin_notif_read_updated'));
  };

  const handleItemClick = (item) => {
    if (item.type === 'new_booking' || item.type === 'pay_at_counter') {
      navigate('/admin/bookings');
    } else if (item.type === 'payment') {
      navigate('/admin/payments');
    } else if (item.type === 'new_customer') {
      navigate('/admin/users');
    } else {
      navigate('/admin/bookings');
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'new_booking':
        return <FiBookmark className="page-notif-icon booking" />;
      case 'payment':
        return <FiCreditCard className="page-notif-icon payment" />;
      case 'pay_at_counter':
        return <FiClock className="page-notif-icon counter" />;
      case 'new_customer':
        return <FiUser className="page-notif-icon customer" />;
      default:
        return <FiBell className="page-notif-icon default" />;
    }
  };

  return (
    <div className="admin-notif-dashboard">
      <div className="admin-notif-container">
        
        {/* 1. Header Section - Perfectly Balanced */}
        <div className="admin-header-section">
          <div className="header-title-block">
            <div className="admin-header-badge">
              <FiBell />
            </div>
            <div>
              <h1 className="admin-main-title">Notifications</h1>
              <p className="admin-subtitle">
                Stay updated with recent cinema activity.
              </p>
            </div>
          </div>

          <div className="header-actions-group">
            <button 
              className="btn-header-action secondary" 
              onClick={fetchNotifications} 
              disabled={loading}
              title="Refresh System Activity"
            >
              <FiRefreshCw className={`btn-icon ${loading ? 'spin-icon' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              className="btn-header-action primary-emerald" 
              onClick={handleMarkAllRead} 
              title="Mark All as Read"
            >
              <FiCheckSquare className="btn-icon" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* 2. Overview Metrics Grid */}
        {!loading && (
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon emerald"><FiBell /></div>
              <div className="metric-data">
                <span className="metric-title">TOTAL ACTIVITY</span>
                <span className="metric-num">{stats.total}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon gold"><FiClock /></div>
              <div className="metric-data">
                <span className="metric-title">UNREAD</span>
                <span className="metric-num">{stats.unread}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon emerald"><FiBookmark /></div>
              <div className="metric-data">
                <span className="metric-title">BOOKINGS</span>
                <span className="metric-num">{stats.bookingsCount}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon green"><FiCreditCard /></div>
              <div className="metric-data">
                <span className="metric-title">PAYMENTS</span>
                <span className="metric-num">{stats.paymentsCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Filter & Control Bar */}
        <div className="admin-filter-toolbar">
          {/* Category Tabs */}
          <div className="category-tabs-group">
            <button 
              className={`cat-tab ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All Activity
            </button>
            <button 
              className={`cat-tab ${categoryFilter === 'bookings' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('bookings')}
            >
              Bookings
            </button>
            <button 
              className={`cat-tab ${categoryFilter === 'payments' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('payments')}
            >
              Payments
            </button>
            <button 
              className={`cat-tab ${categoryFilter === 'customers' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('customers')}
            >
              Customers
            </button>
          </div>

          {/* Search & Select Controls */}
          <div className="filter-controls-group">
            <div className="notif-search-input-box">
              <FiSearch className="search-input-icon" />
              <input 
                type="text" 
                className="notif-search-input"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="select-box-wrapper">
              <span className="select-label">Status:</span>
              <select 
                className="filter-select"
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            <div className="select-box-wrapper">
              <span className="select-label">Sort:</span>
              <select 
                className="filter-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Notifications List Container */}
        <div className="notif-list-card">
          {loading && notifications.length === 0 ? (
            <div className="page-loading-state">
              <div className="page-spinner"></div>
              <p>Fetching real-time system activity...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="page-empty-state">
              <FiInfo className="empty-info-icon" />
              <h3>{searchQuery || categoryFilter !== 'all' || readFilter !== 'all' ? 'No notifications match this filter.' : 'No notifications found.'}</h3>
              <p>System events such as new bookings, payments, and customer signups will appear here.</p>
            </div>
          ) : (
            <div className="notif-items-wrapper">
              {paginatedNotifications.map((item) => {
                const isUnread = !lastReadTime || new Date(item.timestamp) > new Date(lastReadTime);
                return (
                  <div 
                    key={item._id}
                    className={`page-notif-row ${isUnread ? 'unread' : ''}`}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Left Icon Column */}
                    <div className="row-icon-col">
                      {getIconForType(item.type)}
                      {isUnread && <span className="unread-dot" title="Unread notification" />}
                    </div>

                    {/* Center Title & Description Column */}
                    <div className="row-content-col">
                      <h3 className="row-title">{item.title}</h3>
                      <p className="row-description">{item.description}</p>
                    </div>

                    {/* Right Info Column: Timestamp + View Details Link Perfectly Centered Vertically */}
                    <div className="row-right-col">
                      <span className="row-time" title={formatFullDateTime(item.timestamp)}>
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      <span className="view-detail-link">
                        View Details <FiArrowRight className="link-arrow" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Footer & Pagination */}
          {filteredNotifications.length > 0 && (
            <div className="notif-list-footer">
              <div className="pagination-info">
                Showing <span className="highlight-num">{startIndex + 1}</span>–
                <span className="highlight-num">{Math.min(startIndex + ITEMS_PER_PAGE, filteredNotifications.length)}</span> of{' '}
                <span className="highlight-num">{filteredNotifications.length}</span> notifications
              </div>

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="paging-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <FiChevronLeft /> Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="paging-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminNotifications;
