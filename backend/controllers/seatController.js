const Seat = require('../models/Seat');
const Showtime = require('../models/Showtime');
const Hall = require('../models/Hall');

exports.getSeatsByShowtime = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    // 1. Fetch Data
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: "Showtime not found" });

    const hall = await Hall.findById(showtime.hall);
    if (!hall || !hall.seatLayout) return res.status(400).json({ message: "Hall empty" });

    // 2. Check for existing seats
    let existingSeats = await Seat.find({ showtimeId });

    // --- ♻️ FORCE REFRESH LOGIC ---
    // If no tickets are sold, ALWAYS regenerate the layout to match the Admin Panel exactly.
    const hasBookings = existingSeats.some(s => s.status === 'booked' || s.status === 'locked');

    if (!hasBookings) {
        // Delete old layout to apply new Admin updates
        await Seat.deleteMany({ showtimeId }); 
        existingSeats = []; 
    }
    // ------------------------------

    if (existingSeats.length > 0) return res.status(200).json(existingSeats);

    // 3. GENERATE SEATS WITH GAPS
    const seatsToCreate = [];
    const layoutGrid = hall.seatLayout;

    layoutGrid.forEach((rowArr, rowIndex) => {
        const rowLabel = String.fromCharCode(65 + rowIndex); // A, B, C...

        rowArr.forEach((status, colIndex) => {
            // ONLY create a seat if status is 1.
            // WE USE (colIndex + 1) AS THE NUMBER.
            // This ensures that if Col 1 is a seat, Col 2 is a gap, and Col 3 is a seat,
            // We get Seat 1 and Seat 3. (Seat 2 is skipped).
            if (status === 1) {
                seatsToCreate.push({
                    showtimeId: showtimeId,
                    row: rowLabel,
                    number: colIndex + 1, // <--- CRITICAL FIX: Position based numbering
                    type: 'standard',
                    price: showtime.price || 1000,
                    status: 'available'
                });
            }
        });
    });

    const savedSeats = await Seat.insertMany(seatsToCreate);
    res.status(200).json(savedSeats);

  } catch (error) {
    console.error("❌ CRASH REASON:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateSeat = async (req, res) => {
  try {
    const { status } = req.body;
    const seat = await Seat.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(seat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};