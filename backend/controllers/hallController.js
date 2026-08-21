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
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }

    const newRows = Number(req.body.totalRows) || hall.totalRows;
    const newCols = Number(req.body.totalCols) || hall.totalCols;

    // ---------------------------------------------------------
    // 1. Get all showtimes for this hall ONCE
    // ---------------------------------------------------------
    const linkedShowtimes = await Showtime.find({
      hall: hall._id
    }).select('_id price');

    const showtimeIds = linkedShowtimes.map(st => st._id);

    // ---------------------------------------------------------
    // 2. If dimensions are being reduced, make sure no booked
    //    or locked seats would be removed
    // ---------------------------------------------------------
    if (newRows < hall.totalRows || newCols < hall.totalCols) {
      if (showtimeIds.length > 0) {
        const bookedSeats = await Seat.find({
          showtimeId: { $in: showtimeIds },
          status: { $in: ['booked', 'locked'] }
        }).select('row number');

        const rowLabels = [
          "A", "B", "C", "D", "E", "F", "G", "H", "I",
          "J", "K", "L", "M", "N", "O", "P", "Q", "R",
          "S", "T", "U", "V", "W", "X", "Y", "Z"
        ];

        const hasBookedConflict = bookedSeats.some(seat => {
          const rowIndex = rowLabels.indexOf(seat.row);
          const colIndex = seat.number - 1;

          return rowIndex >= newRows || colIndex >= newCols;
        });

        if (hasBookedConflict) {
          return res.status(400).json({
            success: false,
            message:
              'Cannot reduce hall dimensions: customer bookings exist in the removed seat positions.'
          });
        }
      }
    }

    // ---------------------------------------------------------
    // 3. Update the hall
    // ---------------------------------------------------------
    const updatedHall = await Hall.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // ---------------------------------------------------------
    // 4. No showtimes = nothing else to synchronize
    // ---------------------------------------------------------
    if (showtimeIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: updatedHall
      });
    }

    // ---------------------------------------------------------
    // 5. Find ALL booked/locked showtimes in ONE query
    // ---------------------------------------------------------
    const bookedSeats = await Seat.find({
      showtimeId: { $in: showtimeIds },
      status: { $in: ['booked', 'locked'] }
    }).select('showtimeId');

    const showtimesWithBookings = new Set(
      bookedSeats.map(seat => String(seat.showtimeId))
    );

    // ---------------------------------------------------------
    // 6. Only rebuild showtimes that have NO bookings
    // ---------------------------------------------------------
    const showtimesToRebuild = linkedShowtimes.filter(
      st => !showtimesWithBookings.has(String(st._id))
    );

    if (showtimesToRebuild.length === 0) {
      return res.status(200).json({
        success: true,
        data: updatedHall
      });
    }

    // ---------------------------------------------------------
    // 7. Delete seats for all affected showtimes in ONE query
    // ---------------------------------------------------------
    const rebuildIds = showtimesToRebuild.map(st => st._id);

    await Seat.deleteMany({
      showtimeId: { $in: rebuildIds }
    });

    // ---------------------------------------------------------
    // 8. Build all new seats in memory
    // ---------------------------------------------------------
    const rowLabels = [
      "A", "B", "C", "D", "E", "F", "G", "H", "I",
      "J", "K", "L", "M", "N", "O", "P", "Q", "R",
      "S", "T", "U", "V", "W", "X", "Y", "Z"
    ];

    const newSeats = [];

    if (Array.isArray(updatedHall.seatLayout)) {
      for (const st of showtimesToRebuild) {
        updatedHall.seatLayout.forEach((rowArr, rowIndex) => {
          const rowLabel = rowLabels[rowIndex];

          if (!rowLabel || !Array.isArray(rowArr)) {
            return;
          }

          rowArr.forEach((status, colIndex) => {
            if (status === 1) {
              newSeats.push({
                showtimeId: st._id,
                row: rowLabel,
                number: colIndex + 1,
                price: st.price,
                status: 'available'
              });
            }
          });
        });
      }
    }

    // ---------------------------------------------------------
    // 9. Insert ALL new seats in ONE database operation
    // ---------------------------------------------------------
    if (newSeats.length > 0) {
      await Seat.insertMany(newSeats);
    }

    console.log(
      `✅ Hall "${updatedHall.name}" updated. Rebuilt ${showtimesToRebuild.length} showtime seat layouts (${newSeats.length} seats).`
    );

    return res.status(200).json({
      success: true,
      data: updatedHall
    });

  } catch (error) {
    console.error('Error updating hall:', error);

    res.status(400).json({
      success: false,
      message: error.message
    });
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