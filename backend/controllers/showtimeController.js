const Showtime = require('../models/Showtime');

exports.addShowtime = async (req, res) => {
  try {
    const { movie, hall, date, startTime, price } = req.body;

    const showtime = await Showtime.create({
      movie,
      hall,
      date,
      startTime,
      price
    });

    res.status(201).json({ success: true, data: showtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movie', 'title') 
      .populate('hall', 'name');

    res.status(200).json({ success: true, data: showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    await showtime.deleteOne();
    res.status(200).json({ success: true, message: 'Showtime removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true 
    });

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }
    // If price was updated, update all related seats
    if (typeof req.body.price !== 'undefined') {
      const Seat = require('../models/Seat');
      await Seat.updateMany(
        { showtimeId: showtime._id },
        { $set: { price: req.body.price } }
      );
    }

    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id); 

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getShowtimesByMovie = async (req, res) => {
  try {
    const showtimes = await Showtime.find({ movie: req.params.movieId })
      .sort({ date: 1, startTime: 1 }); 

    res.status(200).json({ success: true, data: showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};