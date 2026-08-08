import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import PageLayout from '../../components/PageLayout';
import {
  FiDollarSign,
  FiCreditCard,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiFilter,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiBookmark
} from 'react-icons/fi';
import './AdminPayments.css';

const getTxnRef = (payment) => {
  if (!payment) return "N/A";
  if (payment.transactionRef) return payment.transactionRef;
  if (payment._id) return `#TXN-${payment._id.slice(-8).toUpperCase()}`;
  return "N/A";
};

const getBookingRef = (payment) => {
  if (!payment) return "N/A";
  if (payment.bookingId && typeof payment.bookingId === 'object') {
    if (payment.bookingId.bookingReference) return payment.bookingId.bookingReference;
    if (payment.bookingId._id) return `#${payment.bookingId._id.slice(-6).toUpperCase()}`;
  }
  if (payment.bookingReference) return payment.bookingReference;
  return "N/A";
};

const formatDate = (dateString) => {
  if (!dateString) return "Date Not Saved";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Toolbar & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination & Modals
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchAllPayments = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/payments/all?t=${new Date().getTime()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = Array.isArray(res.data) ? res.data : res.data.payments || [];
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.message || 'Unable to load payment records. Please try again.');
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllPayments();
  }, [fetchAllPayments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMethod, filterStatus, filterDate, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterMethod('all');
    setFilterStatus('all');
    setFilterDate('');
    setSortBy('newest');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic Metrics Calculation
  const stats = useMemo(() => {
    const totalTransactions = payments.length;
    const completedPayments = payments.filter((p) => p.status === 'Completed').length;
    const pendingOrFailed = payments.filter((p) => p.status !== 'Completed').length;

    const totalRevenue = payments
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const todayStr = new Date().toDateString();
    const todayRevenue = payments
      .filter((p) => p.status === 'Completed' && p.createdAt && new Date(p.createdAt).toDateString() === todayStr)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return { totalRevenue, totalTransactions, todayRevenue, completedPayments, pendingOrFailed };
  }, [payments]);

  // Filtered & Sorted Payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const txn = getTxnRef(p).toLowerCase();
        const bRef = getBookingRef(p).toLowerCase();
        const custName = (p.userId?.name || '').toLowerCase();
        const custEmail = (p.userId?.email || '').toLowerCase();
        const method = (p.paymentMethod || '').toLowerCase();

        return (
          txn.includes(q) ||
          bRef.includes(q) ||
          custName.includes(q) ||
          custEmail.includes(q) ||
          method.includes(q)
        );
      });
    }

    if (filterMethod !== 'all') {
      result = result.filter((p) => (p.paymentMethod || '').toLowerCase() === filterMethod.toLowerCase());
    }

    if (filterStatus !== 'all') {
      result = result.filter((p) => (p.status || '').toLowerCase() === filterStatus.toLowerCase());
    }

    if (filterDate) {
      result = result.filter((p) => {
        if (!p.createdAt) return false;
        const pDate = new Date(p.createdAt).toISOString().split('T')[0];
        return pDate === filterDate;
      });
    }

    // Sort Logic
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      const amountA = a.amount || 0;
      const amountB = b.amount || 0;

      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'highest') return amountB - amountA;
      if (sortBy === 'lowest') return amountA - amountB;
      return dateB - dateA; // default 'newest'
    });

    return result;
  }, [payments, searchTerm, filterMethod, filterStatus, filterDate, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const exportToCSV = () => {
    const headers = [
      'Transaction Ref',
      'Booking Ref',
      'Customer Name',
      'Customer Email',
      'Amount (Rs)',
      'Method',
      'Card Last 4',
      'Status',
      'Payment Date'
    ];

    const rows = filteredPayments.map((p) => [
      `"${getTxnRef(p)}"`,
      `"${getBookingRef(p)}"`,
      `"${p.userId?.name || 'Customer'}"`,
      `"${p.userId?.email || 'N/A'}"`,
      `"${p.amount || 0}"`,
      `"${p.paymentMethod || 'N/A'}"`,
      `"${p.cardLast4 ? '**** ' + p.cardLast4 : 'N/A'}"`,
      `"${p.status || 'N/A'}"`,
      `"${p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}"`
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const todayStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `cinenova-payments-${todayStr}.csv`;
    a.click();
  };

  return (
    <PageLayout isAdmin={true}>
      <div className="admin-payments-dashboard">
        <div className="admin-payments-container">

          {/* 1. Header Section */}
          <div className="admin-header-section">
            <div className="header-title-block">
              <div className="admin-header-badge">
                <FiCreditCard />
              </div>
              <div>
                <h1 className="admin-main-title">Payment Management</h1>
                <p className="admin-subtitle">
                  Monitor CineNova transactions, payment status, and revenue.
                </p>
              </div>
            </div>

            <div className="header-actions-group">
              <button
                className="btn-header-action secondary"
                onClick={() => fetchAllPayments(true)}
                disabled={refreshing || loading}
                title="Refresh Payments"
              >
                <FiRefreshCw className={refreshing ? 'spin-icon' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              <button
                className="btn-header-action primary-emerald"
                onClick={exportToCSV}
                disabled={loading || filteredPayments.length === 0}
                title="Export Payments to CSV"
              >
                <FiDownload /> Export CSV
              </button>
            </div>
          </div>

          {/* 2. Overview Metrics Cards (Single Row Layout) */}
          {!loading && !error && (
            <div className="admin-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon emerald"><FiDollarSign /></div>
                <div className="metric-data">
                  <span className="metric-title">Total Revenue</span>
                  <span className="metric-num">Rs. {stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon blue"><FiCreditCard /></div>
                <div className="metric-data">
                  <span className="metric-title">Total Transactions</span>
                  <span className="metric-num">{stats.totalTransactions}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon gold"><FiCalendar /></div>
                <div className="metric-data">
                  <span className="metric-title">Today's Revenue</span>
                  <span className="metric-num">Rs. {stats.todayRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon emerald"><FiCheckCircle /></div>
                <div className="metric-data">
                  <span className="metric-title">Completed</span>
                  <span className="metric-num">{stats.completedPayments}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon red"><FiXCircle /></div>
                <div className="metric-data">
                  <span className="metric-title">Pending / Failed</span>
                  <span className="metric-num">{stats.pendingOrFailed}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Search and Filter Toolbar */}
          {!loading && !error && (
            <div className="admin-toolbar-card">
              <div className="search-input-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by transaction ID, booking ref, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="toolbar-search-input"
                />
                {searchTerm && (
                  <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                    <FiX />
                  </button>
                )}
              </div>

              <div className="toolbar-selects-group">
                <div className="select-wrapper">
                  <FiCreditCard className="select-icon" />
                  <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
                    <option value="all">All Methods</option>
                    <option value="credit card">Credit Card</option>
                    <option value="mobile banking">Mobile Banking</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div className="select-wrapper">
                  <FiFilter className="select-icon" />
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="date-input-wrapper">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="toolbar-date-input"
                    title="Filter by Payment Date"
                  />
                </div>

                <div className="select-wrapper">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                  </select>
                </div>

                {(searchTerm || filterMethod !== 'all' || filterStatus !== 'all' || filterDate || sortBy !== 'newest') && (
                  <button className="btn-clear-filters" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 4. Table / Content View */}
          {loading ? (
            <div className="admin-table-glass-wrapper">
              <div className="skeleton-loading-table">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="skeleton-table-row">
                    <div className="skeleton-avatar" />
                    <div className="skeleton-text-block">
                      <div className="skeleton-line title" />
                      <div className="skeleton-line text" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <FiAlertCircle className="error-icon" />
              <h3>Unable to load payments</h3>
              <p>{error}</p>
              <button className="btn-retry" onClick={() => fetchAllPayments()}>
                <FiRefreshCw /> Try Again
              </button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="admin-empty-card">
              <div className="empty-icon-box"><FiDollarSign /></div>
              <h3>
                {searchTerm || filterMethod !== 'all' || filterStatus !== 'all' || filterDate
                  ? 'No payments match the selected filters.'
                  : 'No payment records found.'}
              </h3>
              <p>
                {searchTerm || filterMethod !== 'all' || filterStatus !== 'all' || filterDate
                  ? 'Try adjusting your search query or clear filters.'
                  : 'Customer transactions will appear here.'}
              </p>
              {(searchTerm || filterMethod !== 'all' || filterStatus !== 'all' || filterDate) && (
                <button className="btn-clear-filters-large" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="admin-table-glass-wrapper desktop-only">
                <table className="admin-payments-table">
                  <thead>
                    <tr>
                      <th>Transaction Ref</th>
                      <th>Booking Ref</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.map((p) => (
                      <tr key={p._id}>
                        {/* Transaction Ref */}
                        <td>
                          <span className="txn-ref-badge">
                            {getTxnRef(p)}
                          </span>
                        </td>

                        {/* Booking Ref */}
                        <td>
                          <span className="booking-ref-badge">
                            {getBookingRef(p)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div className="customer-cell">
                            <span className="cust-name">{p.userId?.name || 'CineNova Customer'}</span>
                            <span className="cust-email">{p.userId?.email || 'N/A'}</span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td>
                          <span className="amount-text">Rs. {(p.amount || 0).toLocaleString()}</span>
                        </td>

                        {/* Method */}
                        <td>
                          <div className="method-cell">
                            <span className="method-name">{p.paymentMethod || 'Credit Card'}</span>
                            {p.cardLast4 && (
                              <span className="card-last4">**** {p.cardLast4}</span>
                            )}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td>
                          <span className="booked-date-text">{formatDate(p.createdAt)}</span>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`status-badge-pill ${(p.status || 'completed').toLowerCase()}`}>
                            {p.status === 'Completed' && <FiCheckCircle />}
                            {p.status === 'Pending' && <FiClock />}
                            {(p.status === 'Failed' || p.status === 'Cancelled') && <FiXCircle />}
                            {p.status || 'Completed'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="table-actions-row">
                            <button
                              type="button"
                              className="payment-view-link"
                              onClick={() => setSelectedPayment(p)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-only admin-payments-cards-list">
                {paginatedPayments.map((p) => (
                  <div key={p._id} className="mobile-admin-payment-card">
                    <div className="mobile-card-header">
                      <span className="txn-ref-badge">{getTxnRef(p)}</span>
                      <span className={`status-badge-pill ${(p.status || 'completed').toLowerCase()}`}>
                        {p.status || 'Completed'}
                      </span>
                    </div>

                    <div className="mobile-user-row">
                      <h4 className="cust-name">{p.userId?.name || 'Customer'}</h4>
                      <span className="cust-email">{p.userId?.email || 'N/A'}</span>
                    </div>

                    <div className="mobile-payment-details">
                      <div className="detail-row">
                        <span className="label">Booking Ref:</span>
                        <span className="val">{getBookingRef(p)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Method:</span>
                        <span className="val">{p.paymentMethod} {p.cardLast4 ? `(**** ${p.cardLast4})` : ''}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Amount:</span>
                        <span className="amount-text">Rs. {(p.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Date:</span>
                        <span className="booked-date-text">{formatDate(p.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mobile-card-actions">
                      <button type="button" className="payment-view-link" onClick={() => setSelectedPayment(p)}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="admin-pagination-bar">
                  <span className="pagination-count-info">
                    Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} transactions
                  </span>

                  <div className="pagination-buttons">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <FiChevronLeft /> Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`pagination-num ${page === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Payment Details Modal */}
        {selectedPayment && (
          <div className="custom-modal-backdrop" onClick={() => setSelectedPayment(null)}>
            <div className="custom-modal-card payment-detail-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setSelectedPayment(null)}>
                <FiX />
              </button>

              <div className="modal-header-block">
                <span className="txn-ref-large">{getTxnRef(selectedPayment)}</span>
                <span className={`status-badge-pill ${(selectedPayment.status || 'completed').toLowerCase()}`}>
                  {selectedPayment.status || 'Completed'}
                </span>
              </div>

              <div className="modal-body-sections">

                {/* Section 1: Customer */}
                <div className="modal-section-box">
                  <h4 className="section-title"><FiUser /> Customer Information</h4>
                  <div className="info-pair-row">
                    <span className="pair-label">Customer Name</span>
                    <span className="pair-val">{selectedPayment.userId?.name || 'CineNova Customer'}</span>
                  </div>
                  <div className="info-pair-row">
                    <span className="pair-label">Email Address</span>
                    <span className="pair-val">{selectedPayment.userId?.email || 'N/A'}</span>
                  </div>
                </div>

                {/* Section 2: Payment Details */}
                <div className="modal-section-box">
                  <h4 className="section-title"><FiDollarSign /> Transaction Summary</h4>
                  <div className="info-pair-row">
                    <span className="pair-label">Amount Paid</span>
                    <span className="amount-val-large">Rs. {(selectedPayment.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="info-pair-row">
                    <span className="pair-label">Payment Method</span>
                    <span className="pair-val highlight">{selectedPayment.paymentMethod || 'Credit Card'}</span>
                  </div>
                  {selectedPayment.cardLast4 && (
                    <div className="info-pair-row">
                      <span className="pair-label">Card Number</span>
                      <span className="pair-val">**** **** **** {selectedPayment.cardLast4}</span>
                    </div>
                  )}
                  <div className="info-pair-row">
                    <span className="pair-label">Payment Date & Time</span>
                    <span className="pair-val">{formatDate(selectedPayment.createdAt)}</span>
                  </div>
                </div>

                {/* Section 3: Booking Reference */}
                <div className="modal-section-box">
                  <h4 className="section-title"><FiBookmark /> Booking Information</h4>
                  <div className="info-pair-row">
                    <span className="pair-label">Booking Reference</span>
                    <span className="pair-val highlight">{getBookingRef(selectedPayment)}</span>
                  </div>
                  <div className="info-pair-row">
                    <span className="pair-label">System Transaction ID</span>
                    <span className="pair-val monospace">{selectedPayment._id}</span>
                  </div>
                </div>

              </div>

              <div className="modal-footer-row">
                <button className="btn-modal-close" onClick={() => setSelectedPayment(null)}>
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
};

export default AdminPayments;