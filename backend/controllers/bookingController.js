const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const Seat = require('../models/Seat'); 
const Payment = require('../models/Payment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to normalize booking objects consistently across endpoints
const formatBookingResponse = (b, paymentDoc) => {
    if (!b) return null;
    const bObj = typeof b.toObject === 'function' ? b.toObject() : b;
    const showtime = bObj.showtimeId || {};
    const movie = showtime.movie || {};
    const hall = showtime.hall || {};
    
    let rawSeats = (bObj.seatIds && bObj.seatIds.length > 0) ? bObj.seatIds : (bObj.seatDetails || []);
    const formattedSeats = rawSeats.map(s => {
        if (typeof s === 'object' && s !== null) {
            const rowStr = s.row || '';
            const numVal = s.number || '';
            const label = rowStr && numVal ? `${rowStr}${numVal}` : (s.seatLabel || String(s._id || ''));
            return {
                _id: s._id || s.seatId || null,
                row: rowStr,
                number: numVal,
                seatLabel: label
            };
        }
        return { _id: String(s), row: '', number: '', seatLabel: String(s) };
    });

    const payment = paymentDoc || bObj.payment || null;

    return {
        _id: bObj._id,
        userId: bObj.userId,
        bookingReference: bObj.bookingReference || (bObj._id ? `CN-${String(bObj._id).slice(-6).toUpperCase()}` : 'Unavailable'),
        status: bObj.status || 'Confirmed',
        totalPrice: bObj.totalPrice || payment?.amount || 0,
        createdAt: bObj.createdAt,
        hiddenFromUser: bObj.hiddenFromUser || false,
        showtimeId: showtime,
        seatIds: bObj.seatIds,
        seatDetails: bObj.seatDetails,
        movie: {
            _id: movie._id || null,
            title: movie.title || 'Unavailable',
            posterUrl: movie.posterUrl || movie.poster || movie.bannerUrl || null,
            bannerUrl: movie.bannerUrl || null,
            description: movie.description || ''
        },
        showtime: {
            _id: showtime._id || null,
            date: showtime.date || null,
            startTime: showtime.startTime || 'Unavailable',
            price: showtime.price || 0
        },
        hall: {
            _id: hall._id || null,
            name: hall.name || 'Unavailable',
            type: hall.name || 'Unavailable'
        },
        seats: formattedSeats,
        payment: payment ? {
            _id: payment._id,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            status: payment.status,
            cardLast4: payment.cardLast4,
            createdAt: payment.createdAt
        } : null
    };
};

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

        const bookingIds = bookings.map(b => b._id);
        const payments = await Payment.find({ bookingId: { $in: bookingIds } })
            .select('bookingId amount paymentMethod status cardLast4 createdAt');
        
        const paymentMap = new Map();
        payments.forEach(p => paymentMap.set(String(p.bookingId), p));

        const normalizedBookings = bookings.map(b => formatBookingResponse(b, paymentMap.get(String(b._id))));
        res.json(normalizedBookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ message: "Error fetching bookings" });
    }
};

// CREATE: Confirm a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userId, showtimeId, seatIds, totalPrice } = req.body;

        if (!showtimeId || !mongoose.Types.ObjectId.isValid(showtimeId)) {
            return res.status(400).json({ success: false, message: "Invalid showtime ID" });
        }

        const existingBooking = await Booking.findOne({ 
            showtimeId, 
            seatIds: { $in: seatIds },
            status: 'Confirmed' 
        });

        if (existingBooking) {
            return res.status(400).json({ message: "One or more seats are already booked!" });
        }

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
            seatDetails,
            totalPrice 
        });
        await newBooking.save();

        await Seat.updateMany(
            { _id: { $in: seatIds } }, 
            { $set: { status: 'booked' } }
        );

        const message = `Booking Confirmed! Your Booking ID is ${newBooking._id}`;
        const notification = await Notification.create({
            userId: userId, 
            message: message
        });

        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        const strUserId = String(userId);

        if (onlineUsers && onlineUsers.has(strUserId)) {
            const socketId = onlineUsers.get(strUserId);
            io.to(socketId).emit('receive_notification', notification);
        }

        res.status(201).json({ message: "Booking successful!", booking: newBooking });
    } catch (error) {
        console.error("SERVER ERROR in Create:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 2. Get User History
exports.getUserBookings = async (req, res) => {
    try {
        let queryUserId = req.params.userId;

        if (req.user) {
            if (req.user.role !== 'admin' || queryUserId === 'me' || !mongoose.Types.ObjectId.isValid(queryUserId)) {
                queryUserId = req.user._id || req.user.id;
            }
        }

        const userExists = mongoose.Types.ObjectId.isValid(queryUserId) ? await User.findById(queryUserId) : null;
        if (!userExists && req.user) {
            queryUserId = req.user._id || req.user.id;
        }

        console.log("🔍 CHECKING HISTORY FOR USER:", queryUserId);

        const bookings = await Booking.find({ 
            userId: queryUserId,
            hiddenFromUser: { $ne: true }
        })
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

        const bookingIds = bookings.map(b => b._id);
        const payments = await Payment.find({ bookingId: { $in: bookingIds } })
            .select('bookingId amount paymentMethod status cardLast4 createdAt');
        
        const paymentMap = new Map();
        payments.forEach(p => paymentMap.set(String(p.bookingId), p));

        const normalizedBookings = bookings.map(b => formatBookingResponse(b, paymentMap.get(String(b._id))));
        console.log(`FOUND ${normalizedBookings.length} VISIBLE BOOKINGS.`);
        res.json(normalizedBookings);
    } catch (error) {
        console.error("SERVER ERROR in History:", error);
        res.status(500).json({ message: "Error fetching history" });
    }
};

// 3. Get Single Booking by ID (Secure Endpoint)
exports.getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: "Invalid booking ID" });
        }

        const booking = await Booking.findById(bookingId)
            .populate('userId', 'name email')
            .populate({
                path: 'showtimeId',
                populate: [
                    { path: 'movie' },
                    { path: 'hall' }
                ]
            })
            .populate('seatIds');

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Ownership verification (if auth middleware attached req.user)
        if (req.user) {
            const bookingOwnerId = String(booking.userId?._id || booking.userId);
            const requestingUserId = String(req.user._id || req.user.id);
            const isAdmin = req.user.role === 'admin';

            if (bookingOwnerId !== requestingUserId && !isAdmin) {
                return res.status(403).json({ success: false, message: "Unauthorized access to booking ticket" });
            }
        }

        const payment = await Payment.findOne({ bookingId: booking._id })
            .select('amount paymentMethod status cardLast4 createdAt');

        const normalizedBooking = formatBookingResponse(booking, payment);

        res.status(200).json({
            success: true,
            booking: normalizedBooking
        });
    } catch (error) {
        console.error("Error fetching single booking:", error);
        res.status(500).json({ success: false, message: "Error fetching booking details" });
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
        if (bookingToCancel.showtimeId) {
            await Showtime.findByIdAndUpdate(bookingToCancel.showtimeId, {
                $pull: { bookedSeats: { $in: bookingToCancel.seatIds } }
            });
        }

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