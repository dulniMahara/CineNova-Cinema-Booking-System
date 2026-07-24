const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hall name'],
    unique: true,
    trim: true
  },
  // New Fields for Layout
  totalRows: { type: Number, required: true },
  totalCols: { type: Number, required: true },
  seatLayout: { 
    type: [[Number]], // A 2D Array (0 = Empty Space, 1 = Seat)
    required: true 
  },
  seatCapacity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hall', hallSchema);