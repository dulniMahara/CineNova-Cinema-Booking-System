const Hall = require('../models/Hall');

// @desc    Get all halls
// @route   GET /api/halls
// @access  Public
const getHalls = async (req, res) => {
  try {
    const halls = await Hall.find();
    // Return standard response structure
    res.status(200).json({ success: true, data: halls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new hall
// @route   POST /api/halls
// @access  Private
const createHall = async (req, res) => {
  try {
    const hall = await Hall.create(req.body);
    res.status(201).json({ success: true, data: hall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');

// @desc    Update hall
// @route   PUT /api/halls/:id
// @access  Private
const updateHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    const newRows = Number(req.body.totalRows) || hall.totalRows;
    const newCols = Number(req.body.totalCols) || hall.totalCols;

    // Validation: Check if reducing hall dimensions would truncate existing customer bookings
    if (newRows < hall.totalRows || newCols < hall.totalCols) {
      const linkedShowtimes = await Showtime.find({ hall: hall._id });
      const showtimeIds = linkedShowtimes.map(s => s._id);

      if (showtimeIds.length > 0) {
        const bookedSeats = await Seat.find({
          showtimeId: { $in: showtimeIds },
          status: { $in: ['booked', 'locked'] }
        });

        const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        const hasBookedConflict = bookedSeats.some(s => {
          const rIdx = rowLabels.indexOf(s.row);
          const cIdx = s.number - 1;
          return rIdx >= newRows || cIdx >= newCols;
        });

        if (hasBookedConflict) {
          return res.status(400).json({
            success: false,
            message: 'Cannot reduce hall dimensions: customer bookings exist in the removed seat positions.'
          });
        }
      }
    }

    const updatedHall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Synchronize Seat collection for linked showtimes that have no active bookings
    const linkedShowtimes = await Showtime.find({ hall: updatedHall._id });
    for (const st of linkedShowtimes) {
      const bookedCount = await Seat.countDocuments({
        showtimeId: st._id,
        status: { $in: ['booked', 'locked'] }
      });
      if (bookedCount === 0) {
        await Seat.deleteMany({ showtimeId: st._id });
        const newSeats = [];
        const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        if (Array.isArray(updatedHall.seatLayout)) {
          updatedHall.seatLayout.forEach((rowArr, rIndex) => {
            const currentRowLabel = rowLabels[rIndex];
            if (currentRowLabel && Array.isArray(rowArr)) {
              rowArr.forEach((status, cIndex) => {
                if (status == 1) {
                  newSeats.push({
                    showtimeId: st._id,
                    row: currentRowLabel,
                    number: cIndex + 1,
                    price: st.price,
                    status: 'available'
                  });
                }
              });
            }
          });
          if (newSeats.length > 0) {
            await Seat.insertMany(newSeats);
          }
        }
      }
    }

    res.status(200).json({ success: true, data: updatedHall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete hall
// @route   DELETE /api/halls/:id
// @access  Private
const deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    await Hall.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHalls,
  createHall,
  updateHall,
  deleteHall,
};