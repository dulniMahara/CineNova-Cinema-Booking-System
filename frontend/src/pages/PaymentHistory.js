import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageLayout from '../components/PageLayout'; 
import './PaymentHistory.css';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // NEW: State for Receipt Popup
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const fetchMyPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/payments/my-payments?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPayments(sorted);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching history:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPayments();
    }, []);

    const handleClearHistory = async () => {
        if (payments.length === 0) return alert("History is already empty.");
        if (!window.confirm("Are you sure you want to clear your entire payment history?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/payments/my-payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments([]);
            alert("History Cleared!");
        } catch (error) {
            alert("Failed to clear history.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    };

    const getBookingRef = (payment) => {
        if (!payment.bookingId) return 'NO-REF';
        const id = payment.bookingId._id || payment.bookingId;
        return typeof id === 'string' ? id.slice(-6).toUpperCase() : 'UNK-REF';
    };

    if (loading) return <div style={{padding:'50px', color:'white', textAlign:'center'}}>Loading History...</div>;

    return (
        <PageLayout>
            <div className="payment-history-container">
                
                {/* LEFT SIDEBAR */}
                <div className="history-sidebar">
                    <div className="summary-card">
                        <h1 className="history-title">MY<br/>PAYMENT<br/>HISTORY</h1>
                        <p className="history-subtitle">You have {payments.length} past transactions.</p>
                        <button className="sidebar-btn secondary" onClick={handleClearHistory}>
                            Clear History
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE: GRID */}
                <div className="history-grid">
                    {payments.map(payment => (
                        <div key={payment._id} className="payment-card">
                            <div className="card-header-ref">
                                REF: #{getBookingRef(payment)}
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Movie:</span>
                                    <span className="info-value">
                                        {payment.bookingId?.showtimeId?.movie?.title || "Wicked: For Good"}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Date:</span>
                                    <span className="info-value">{formatDate(payment.createdAt)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Paid:</span>
                                    <span className="info-value val-green">Rs. {payment.amount.toLocaleString()}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Status:</span>
                                    <span className="info-value val-green">{payment.status}</span>
                                </div>
                            </div>
                            
                            {/* VIEW RECEIPT BUTTON (Now Active) */}
                            <button 
                                className="card-btn-outline"
                                onClick={() => setSelectedReceipt(payment)}
                            >
                                VIEW RECEIPT
                            </button>
                        </div>
                    ))}
                    
                    {payments.length === 0 && (
                        <div style={{gridColumn:'1/-1', textAlign:'center', color:'#9ca3af', padding:'50px'}}>
                            No payment history found.
                        </div>
                    )}
                </div>

                {/* --- RECEIPT POPUP MODAL --- */}
                {selectedReceipt && (
                    <div className="receipt-overlay" onClick={() => setSelectedReceipt(null)}>
                        <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
                            
                            {/* Header */}
                            <div className="receipt-header">
                                <h2>Payment Receipt</h2>
                                <button className="close-receipt-btn" onClick={() => setSelectedReceipt(null)}>×</button>
                            </div>

                            {/* Body */}
                            <div className="receipt-body">
                                <div className="receipt-row">
                                    <span className="r-label">Transaction ID</span>
                                    <span className="r-value" style={{fontSize:'0.8rem', fontFamily:'monospace'}}>
                                        {selectedReceipt._id}
                                    </span>
                                </div>

                                <div className="receipt-row">
                                    <span className="r-label">Booking Reference</span>
                                    <span className="r-value" style={{color:'#fbbf24'}}>
                                        #{getBookingRef(selectedReceipt)}
                                    </span>
                                </div>

                                <div className="receipt-row">
                                    <span className="r-label">Payment Date</span>
                                    <span className="r-value">{formatDate(selectedReceipt.createdAt)}</span>
                                </div>

                                <div className="receipt-row">
                                    <span className="r-label">Payment Time</span>
                                    <span className="r-value">{formatTime(selectedReceipt.createdAt)}</span>
                                </div>

                                <div className="receipt-row">
                                    <span className="r-label">Payment Method</span>
                                    <span className="r-value">
                                        {selectedReceipt.paymentMethod} (**** {selectedReceipt.cardLast4})
                                    </span>
                                </div>

                                <div className="receipt-total">
                                    <span className="total-label">TOTAL PAID</span>
                                    <span className="total-amount">Rs. {selectedReceipt.amount.toLocaleString()}</span>
                                </div>

                                <div style={{textAlign:'center', marginTop:'10px', color:'#9ca3af', fontSize:'0.8rem'}}>
                                    Thank you for choosing Cinema Booking!
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </PageLayout>
    );
};

export default PaymentHistory;