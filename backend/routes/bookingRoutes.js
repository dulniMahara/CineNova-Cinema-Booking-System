const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

// 1. Clear History
router.post('/clear-history', bookingController.clearUserHistory);

// 2. Admin Get All
router.get('/all', bookingController.getAllBookings);

// 3. Create Booking
router.post('/', bookingController.createBooking);

// 4. Get User History
router.get('/user/:userId', bookingController.getUserBookings);

// 5. Get Single Booking by ID (Secure Ticket Endpoint)
router.get('/:bookingId', protect, bookingController.getBookingById);

// 6. Cancel Single Booking
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;