const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// 1. Clear History (Authenticated User)
router.post('/clear-history', protect, bookingController.clearUserHistory);

// 2. Admin Get All Bookings (Admin Only)
router.get('/all', protect, isAdmin, bookingController.getAllBookings);

// 3. Create Booking (Authenticated User)
router.post('/', protect, bookingController.createBooking);

// 4. Get User History (Authenticated User)
router.get('/user/:userId', protect, bookingController.getUserBookings);

// 5. Get Single Booking by ID (Secure Ticket Endpoint)
router.get('/:bookingId', protect, bookingController.getBookingById);

// 6. Cancel Single Booking (Authenticated User)
router.delete('/:id', protect, bookingController.cancelBooking);

module.exports = router;