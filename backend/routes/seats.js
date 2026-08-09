const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Hall = require('../models/Hall');
const Showtime = require('../models/Showtime');

// 1. SMART GENERATE (Manual Trigger)
router.post('/generate', async (req, res) => {
    try {
        const { showtimeId } = req.body;
        if (!showtimeId || !mongoose.Types.ObjectId.isValid(showtimeId)) {
            return res.status(400).json({ success: false, message: "Invalid showtime ID" });
        }
        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        const hall = await Hall.findById(showtime.hall);
        if (!hall) return res.status(404).json({ error: "Hall not found" });

        if (!hall.seatLayout || hall.seatLayout.length === 0) {
            return res.status(400).json({ error: "Hall has no layout" });
        }

        const seats = await generateSeats(showtime, hall);
        await Seat.insertMany(seats);

        res.json({ message: `Success! Generated ${seats.length} seats.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SEATS (Auto-Generating / Self-Fixing!)
router.get('/:showtimeId', async (req, res) => {
    console.log("SEAT REQUEST RECEIVED:", req.params.showtimeId);

    try {
        const { showtimeId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
            return res.status(400).json({ success: false, message: "Invalid showtime ID" });
        }

        let seats = await Seat.find({ showtimeId });

        if (seats.length === 0) {
            console.log(`No seats found for ${showtimeId}. Auto-generating...`);
            const showtime = await Showtime.findById(showtimeId);
            if (!showtime) {
                return res.status(404).json({ error: "Showtime not found" });
            }
            const hall = await Hall.findById(showtime.hall);
            if (!hall || !hall.seatLayout) {
                return res.json([]);
            }
            const newSeats = await generateSeats(showtime, hall);
            if (newSeats.length > 0) {
                await Seat.insertMany(newSeats);
                console.log(`Auto-generated ${newSeats.length} seats.`);
                seats = newSeats;
            }
        }

        // Cross-reference confirmed Booking records for this showtimeId
        const Booking = require('../models/Booking');
        const activeBookings = await Booking.find({
            showtimeId,
            status: { $ne: 'Cancelled' }
        });

        if (activeBookings.length > 0) {
            const bookedSeatIdSet = new Set();
            activeBookings.forEach(b => {
                if (Array.isArray(b.seatIds)) {
                    b.seatIds.forEach(id => bookedSeatIdSet.add(String(id)));
                }
                if (Array.isArray(b.seatDetails)) {
                    b.seatDetails.forEach(sd => {
                        if (sd.seatId) bookedSeatIdSet.add(String(sd.seatId));
                    });
                }
            });

            if (bookedSeatIdSet.size > 0) {
                seats = seats.map(s => {
                    const sIdStr = String(s._id);
                    if (bookedSeatIdSet.has(sIdStr) && s.status !== 'booked') {
                        const sObj = typeof s.toObject === 'function' ? s.toObject() : s;
                        return { ...sObj, status: 'booked' };
                    }
                    return s;
                });
            }
        }

        return res.json(seats);

    } catch (err) {
        console.error("SEAT FETCH ERROR:", err);
        res.status(500).json({
            error: err.message,
            stack: err.stack
        });
    }
});

// 3. (NEW) BULK BOOK SEATS
router.post('/book-seats', async (req, res) => {
    try {
        const { seatIds } = req.body;

        if (!seatIds || seatIds.length === 0) {
            return res.status(400).json({ error: "No seats provided" });
        }

        // Update all matching seats to status: 'booked'
        await Seat.updateMany(
            { _id: { $in: seatIds } },
            { $set: { status: 'booked' } }
        );

        res.json({ success: true, message: "Seats marked as booked" });
    } catch (err) {
        console.error("Booking Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE SINGLE SEAT (Legacy/Admin)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const seat = await Seat.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(seat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. RESET (Helper)
router.delete('/reset', async (req, res) => {
    try {
        await Seat.deleteMany({});
        res.json({ message: "All seats deleted!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// HELPER FUNCTION
async function generateSeats(showtime, hall) {
    const seats = [];
    const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    hall.seatLayout.forEach((rowArr, rIndex) => {
        const currentRowLabel = rowLabels[rIndex];
        rowArr.forEach((status, cIndex) => {
            if (status == 1) {
                seats.push({
                    showtimeId: showtime._id,
                    row: currentRowLabel,
                    number: cIndex + 1,
                    price: showtime.price,
                    status: 'available'
                });
            }
        });
    });
    return seats;
}

module.exports = router;