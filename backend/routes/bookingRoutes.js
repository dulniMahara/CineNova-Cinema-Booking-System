const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Debug Log
console.log("ROUTER RELOADED: POST METHOD IS ACTIVE!"); 

// ----------------------------------------------------
// NEW: GET ALL BOOKINGS (Admin)
// ----------------------------------------------------
router.get('/all', bookingController.getAllBookings);  
// ----------------------------------------------------                                                                                                            // ----------------------------------------------------
// 1. Clear History (Cheat Code: POST)
// ----------------------------------------------------
router.post('/clear-history', bookingController.clearUserHistory);

// ----------------------------------------------------
// 2. Create Booking
// ----------------------------------------------------
router.post('/', bookingController.createBooking);

// ----------------------------------------------------
// 3. Get User History
// ----------------------------------------------------
router.get('/user/:userId', bookingController.getUserBookings);

// ----------------------------------------------------
// 4. Cancel Single Booking (YOU WERE MISSING THIS!)
// ----------------------------------------------------
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;