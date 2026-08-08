const express = require('express');
const router = express.Router();

// 1. IMPORT FUNCTIONS
const { 
    processPayment, 
    getMyPayments, 
    getAllPayments,
    deleteMyPayments 
} = require('../controllers/paymentController');

// 2. IMPORT MIDDLEWARE
const { protect, isAdmin } = require('../middlewares/authMiddleware'); 

// --- USER ROUTES ---
router.post('/', protect, processPayment);           // Pay & Book
router.get('/my-payments', protect, getMyPayments);  // History
router.delete('/my-payments', protect, deleteMyPayments); // Clear History

// --- ADMIN ROUTES ---
router.get('/all', protect, isAdmin, getAllPayments);         // See all payments (Admin Only)

module.exports = router;