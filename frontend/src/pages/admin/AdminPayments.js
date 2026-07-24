import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import axios from 'axios';
import PageLayout from '../../components/PageLayout'; 
import './AdminPayments.css'; 

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for the Popup Modal
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        todayRevenue: 0
    });

    // --- FIX 1: WRAP FUNCTION IN useCallback TO FIX CONSOLE WARNING ---
    const fetchAllPayments = useCallback(async () => {
        try {
            // --- FIX 2: ALWAYS SHOW LOADING ---
            // This ensures you SEE the screen refresh when you click the button.
            setLoading(true);

            const token = localStorage.getItem('token');
            
            // Add timestamp to force fresh data
            // Added '/all' to match the backend route
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/payments/all?t=${new Date().getTime()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // SORTING: Newest First
            const sortedData = res.data.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            setPayments(sortedData);

            // Calculate Stats
            const totalRev = sortedData.reduce((acc, curr) => acc + curr.amount, 0);
            const today = new Date().toDateString();
            
            const todayRev = sortedData
                .filter(p => {
                    const date = p.createdAt ? new Date(p.createdAt) : new Date();
                    return date.toDateString() === today;
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            setStats({
                totalRevenue: totalRev,
                totalTransactions: sortedData.length,
                todayRevenue: todayRev
            });

            setLoading(false);
        } catch (error) {
            console.error("Error fetching payments:", error);
            setLoading(false);
        }
    }, []); // Dependency array is empty, which is correct for this logic

    // Delete All Function
    const clearDatabase = async () => {
        if(!window.confirm("ARE YOU SURE? This will delete ALL payment history forever!")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Database Cleared!");
            fetchAllPayments(); 
        } catch (error) {
            alert("Failed to delete.");
        }
    };

    // UseEffect correctly calls the function now
    useEffect(() => {
        fetchAllPayments();
    }, [fetchAllPayments]);

    const formatDate = (dateString) => {
        if (!dateString) return "Date Not Saved";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    if (loading) return (
        <PageLayout isAdmin={true}>
            <div className="dashboard-container">
                {/* Visual Feedback for Loading */}
                <h2 style={{color:'white', textAlign: 'center', marginTop: '100px', opacity: 0.8}}>
                    ↻ Refreshing Data...
                </h2>
            </div>
        </PageLayout>
    );

    return (
        <PageLayout isAdmin={true}>
            <div className="dashboard-container">
                <div className="dashboard-content">
                    
                    {/* Header Section */}
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h1 className="page-title">Payments Management</h1>
                        
                        <div style={{display:'flex', gap:'10px'}}>
                            
                            {/* Clear All Button */}
                            <button onClick={clearDatabase} className="action-btn" style={{background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444'}}>
                                🗑 Clear All
                            </button>

                            {/* REFRESH BUTTON - MATCHING YOUR IMAGE */}
                            <button 
                                onClick={fetchAllPayments} 
                                className="action-btn" 
                                style={{
                                    background: '#1f2937',   // Dark Background
                                    color: '#e5e7eb',        // White/Gray Text
                                    border: '1px solid #4b5563', 
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px'
                                }}
                            >
                                {/* Simple Refresh Icon */}
                                <span style={{fontSize:'1.2rem', lineHeight:0}}>⟳</span> 
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{color: '#4ade80'}}>💰</div>
                            <div className="stat-info">
                                <h3>Rs. {stats.totalRevenue.toLocaleString()}</h3>
                                <p>Total Revenue</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{color: '#60a5fa'}}>💳</div>
                            <div className="stat-info">
                                <h3>{stats.totalTransactions}</h3>
                                <p>Transactions</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{color: '#facc15'}}>📅</div>
                            <div className="stat-info">
                                <h3>Rs. {stats.todayRevenue.toLocaleString()}</h3>
                                <p>Today's Revenue</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
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
                                {payments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td style={{fontFamily: 'monospace', color: '#9ca3af', fontWeight:'bold'}}>
                                            {payment.bookingId 
                                                ? `#${payment.bookingId._id.slice(-6).toUpperCase()}` 
                                                : <span style={{color:'#ef4444'}}>#ERR-NO-REF</span>
                                            }
                                        </td>
                                        <td>
                                            {payment.userId ? (
                                                <>
                                                    <div style={{fontWeight: 'bold'}}>{payment.userId.name}</div>
                                                    <div style={{fontSize: '0.8rem', color: '#6b7280'}}>{payment.userId.email}</div>
                                                </>
                                            ) : (
                                                <div style={{color: '#ef4444', fontStyle: 'italic'}}>Unknown User</div>
                                            )}
                                        </td>
                                        <td style={{fontWeight: 'bold', color: '#4ade80'}}>
                                            Rs. {payment.amount.toLocaleString()}
                                        </td>
                                        <td>
                                            {payment.paymentMethod}
                                            <span style={{fontSize: '0.8rem', color: '#6b7280', display: 'block'}}>
                                                **** {payment.cardLast4}
                                            </span>
                                        </td>
                                        <td>{formatDate(payment.createdAt)}</td>
                                        <td>
                                            <span className={`status-badge ${payment.status === 'Completed' ? 'status-success' : 'status-pending'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="action-btn" 
                                                onClick={() => setSelectedPayment(payment)}
                                                title="View Details"
                                            >
                                                👁
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {payments.length === 0 && (
                            <div style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>No payment records found.</div>
                        )}
                    </div>
                </div>

                {/* --- POPUP MODAL --- */}
                {selectedPayment && (
                    <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            
                            <div className="modal-header">
                                <h2>Payment Details</h2>
                                <button className="close-btn" onClick={() => setSelectedPayment(null)}>×</button>
                            </div>

                            <div className="modal-body">
                                <div className="detail-row">
                                    <span className="label">Booking Ref:</span>
                                    <span className="value highlight-ref">
                                        {selectedPayment.bookingId 
                                            ? `#${selectedPayment.bookingId._id.slice(-6).toUpperCase()}` 
                                            : 'N/A'
                                        }
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">Transaction ID:</span>
                                    <span className="value" style={{fontFamily:'monospace', fontSize:'0.8rem'}}>
                                        {selectedPayment._id}
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">Customer Name:</span>
                                    <span className="value">{selectedPayment.userId?.name || "Unknown"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Customer Email:</span>
                                    <span className="value">{selectedPayment.userId?.email || "Unknown"}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">Amount Paid:</span>
                                    <span className="value" style={{color: '#4ade80', fontSize:'1.1rem'}}>
                                        Rs. {selectedPayment.amount.toLocaleString()}
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">Payment Method:</span>
                                    <span className="value">
                                        {selectedPayment.paymentMethod} (**** {selectedPayment.cardLast4})
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">Date & Time:</span>
                                    <span className="value">{formatDate(selectedPayment.createdAt)}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">Status:</span>
                                    <span className={`status-badge ${selectedPayment.status === 'Completed' ? 'status-success' : 'status-pending'}`}>
                                        {selectedPayment.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default AdminPayments;