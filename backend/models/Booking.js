const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Reference to User collection
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }, 

  //  LINK TO SHOWTIME COLLECTION (Fixes "Movie Name Loading...")
  showtimeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Showtime', // This tells Mongoose to look in the "Showtime" table
      required: true 
  }, 

  //  LINK TO SEAT COLLECTION (Fixes "Seats" listing)
  seatIds: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Seat',     // This tells Mongoose to look in the "Seat" table
      required: true 
  }], 

  //  NEW: Store seat details for historical record
  seatDetails: [{
    row: String,
    number: Number,
    price: Number,
    seatId: mongoose.Schema.Types.ObjectId
  }],
  
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Confirmed' }, 
  
  // Track if user has hidden this from their view (soft delete)
  hiddenFromUser: { type: Boolean, default: false },
  
  // Unique code for the user
  bookingReference: { 
    type: String, 
    unique: true, 
    default: () => Math.random().toString(36).substring(2, 10).toUpperCase() 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);