const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  row: { 
    type: String, 
    required: true 
  },
  number: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'reserved', 'locked'], // ✅ Fix 1: Added 'available'
    default: 'available',
    required: true
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true // ✅ Fix 2: Made this required as requested
  }
});

module.exports = mongoose.model('Seat', seatSchema);