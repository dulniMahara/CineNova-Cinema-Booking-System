const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');

async function backfillLegacyBookings() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinema';
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for Backfill Check...");

    const bookings = await Booking.find();
    console.log(`Inspecting ${bookings.length} total booking documents...`);

    const showtimes = await Showtime.find();
    if (showtimes.length === 0) {
      console.log("No active showtimes found. Run node seed.js first.");
      mongoose.disconnect();
      return;
    }

    let updatedCount = 0;
    for (const b of bookings) {
      let isOrphaned = false;
      if (!b.showtimeId) {
        isOrphaned = true;
      } else {
        const stExists = await Showtime.findById(b.showtimeId);
        if (!stExists) isOrphaned = true;
      }

      if (isOrphaned) {
        const match = showtimes.find(st => st.price === b.totalPrice) || showtimes[0];
        b.showtimeId = match._id;

        if (!b.seatIds || b.seatIds.length === 0) {
          const sampleSeat = await Seat.findOne({ showtimeId: match._id });
          if (sampleSeat) {
            b.seatIds = [sampleSeat._id];
            b.seatDetails = [{
              row: sampleSeat.row,
              number: sampleSeat.number,
              price: sampleSeat.price,
              seatId: sampleSeat._id
            }];
          }
        }

        await b.save();
        updatedCount++;
        console.log(`Backfilled Booking [${b._id}] -> linked to Showtime [${match._id}]`);
      }
    }

    console.log(`Backfill complete. Updated ${updatedCount} orphaned booking records.`);
    mongoose.disconnect();
  } catch (err) {
    console.error("Backfill failed:", err);
    mongoose.disconnect();
  }
}

if (require.main === module) {
  backfillLegacyBookings();
}

module.exports = backfillLegacyBookings;
