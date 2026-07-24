const Booking = require('../models/Booking');
const Seat = require('../models/Seat'); 
const Notification = require('../models/Notification'); // <--- Added for Pop-ups

// Get ALL bookings (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate({
                path: 'showtimeId',
                populate: [
                    { path: 'movie' },
                    { path: 'hall' }
                ]
            })
            .populate('seatIds')
            .sort({ createdAt: -1 });

        // Debug log to check seat population
        if (bookings.length > 0) {
            console.log('📊 Sample booking seats:', bookings[0].seatIds);
        }

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ message: "Error fetching bookings" });
    }
};

// CREATE: Confirm a new booking
// 1. Create Booking
exports.createBooking = async (req, res) => {
    try {
        // 👇 SPY LOGS START
        console.log("------------------------------------------------");
        console.log("ATTEMPTING TO CREATE BOOKING:");
        console.log("   👉 User ID:   ", req.body.userId);
        console.log("   👉 Showtime:  ", req.body.showtimeId);
        console.log("   👉 Seats:     ", req.body.seatIds);
        console.log("------------------------------------------------");
        // 👆 SPY LOGS END

        const { userId, showtimeId, seatIds, totalPrice } = req.body;

        // Validation: Prevent double booking
        const existingBooking = await Booking.findOne({ 
            showtimeId, 
            seatIds: { $in: seatIds },
            status: 'Confirmed' 
        });

        if (existingBooking) {
            console.log("FAILURE: Seats already booked!");
            return res.status(400).json({ message: "One or more seats are already booked!" });
        }

        // 👇 NEW: Fetch actual seat details to store permanently
        const seats = await Seat.find({ _id: { $in: seatIds } });
        const seatDetails = seats.map(s => ({
            row: s.row,
            number: s.number,
            price: s.price,
            seatId: s._id
        }));

        const newBooking = new Booking({ 
            userId, 
            showtimeId, 
            seatIds,
            seatDetails, // Store seat info permanently
            totalPrice 
        });
        await newBooking.save();

        // Update Seats
        await Seat.updateMany(
            { _id: { $in: seatIds } }, 
            { $set: { status: 'booked' } }
        );

        // --- NEW: NOTIFICATION LOGIC (Added to Old Code) ---
        // 1. Save to DB
        const message = `Booking Confirmed! Your Booking ID is ${newBooking._id}`;
        const notification = await Notification.create({
            userId: userId, 
            message: message
        });

        // 2. Send Real-Time Popup
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        const strUserId = String(userId);

        if (onlineUsers && onlineUsers.has(strUserId)) {
            const socketId = onlineUsers.get(strUserId);
            io.to(socketId).emit('receive_notification', notification);
            console.log(`🔔 Notification SENT to Socket ${socketId}`);
        }
        // ---------------------------------------------------

        console.log("SUCCESS: Booking Created!");
        res.status(201).json({ message: "Booking successful!", booking: newBooking });
    } catch (error) {
        console.error("SERVER ERROR in Create:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 2. Get User History
exports.getUserBookings = async (req, res) => {
    try {
        console.log("🔍 CHECKING HISTORY FOR USER:", req.params.userId);

        // Only show bookings that are NOT hidden by the user
        const bookings = await Booking.find({ 
            userId: req.params.userId,
            hiddenFromUser: { $ne: true }  // Exclude hidden bookings
        })
            .populate('userId', 'name email')
            .populate({
                path: 'showtimeId',   // <--- CHANGED from 'showtime' to 'showtimeId'
                populate: { path: 'movie' }   
            })
            .populate('seatIds')      // <--- CHANGED from 'seats' to 'seatIds'
            .sort({ createdAt: -1 });        

        console.log(`FOUND ${bookings.length} VISIBLE BOOKINGS.`);
        res.json(bookings);
    } catch (error) {
        console.error("SERVER ERROR in History:", error);
        res.status(500).json({ message: "Error fetching history" });
    }
};


// UPDATE: Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        // 1. Find the booking first to get the seat IDs
        const bookingToCancel = await Booking.findById(req.params.id);
        
        if (!bookingToCancel) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 2. Change Booking Status
        bookingToCancel.status = 'Cancelled';
        await bookingToCancel.save();

        // 3. FREE UP THE SEATS (Make them available again)
        await Seat.updateMany(
            { _id: { $in: bookingToCancel.seatIds } },
            { $set: { status: 'available' } }
        );

        // 1. Create Notification
        const message = `Booking Cancelled. Your seats have been unlocked and refunded. (ID: ${bookingToCancel._id})`;
        const notification = new Notification({
            userId: bookingToCancel.userId,
            message: message,
            isRead: false
        });
        await notification.save();

        // 2. Send Real-Time Popup
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        const strUserId = String(bookingToCancel.userId);

        if (onlineUsers && onlineUsers.has(strUserId)) {
            const socketId = onlineUsers.get(strUserId);
            io.to(socketId).emit('receive_notification', notification);
            console.log(`🔔 SENT POPUP to User ${strUserId}`);
        }
        // ---------------------------------------------------

        res.json({ message: "Booking cancelled successfully", booking: bookingToCancel });
    } catch (error) {
        res.status(500).json({ message: "Cancel failed", error: error.message });
    }
};
// UPDATE: Hide cancelled bookings from user view (soft delete)
exports.clearUserHistory = async (req, res) => {
    try {
        // CHANGED: We now get the ID from the "body", not the URL
        const { userId } = req.body; 

        console.log(`HIDING CANCELLED BOOKINGS for user: ${userId}`);

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Mark cancelled bookings as hidden (soft delete) - they stay in DB for admin
        const result = await Booking.updateMany({ 
            userId, 
            status: 'Cancelled' 
        }, {
            $set: { hiddenFromUser: true }
        });
        
        console.log(`Hidden ${result.modifiedCount} cancelled bookings (still in DB for admin)`);
        res.status(200).json({ 
            message: `Cleared ${result.modifiedCount} cancelled booking(s) from your view`,
            hiddenCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Clear History Error:", error);
        res.status(500).json({ message: "Could not clear history" });
    }
};