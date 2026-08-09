const Showtime = require("../models/Showtime");
const seedSeats = require("./seats");

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const seedShowtimes = async (movies, halls) => {
  const newShowtimesToInsert = [];

  const timeSlots = [
    { time: "10:30 AM", priceOffset: -200 },
    { time: "01:30 PM", priceOffset: 0 },
    { time: "04:30 PM", priceOffset: 100 },
    { time: "07:30 PM", priceOffset: 200 },
    { time: "09:15 PM", priceOffset: 300 }
  ];

  const hallBasePrices = {
    "IMAX 3D Laser": 2800,
    "Dolby Atmos 2D": 2200,
    "VIP Lounge 3D": 3500,
    "4DX Motion": 3000,
    "Standard 2D": 1800
  };

  // Only seed showtimes for Now Showing movies
  const nowShowingMovies = movies.filter(
    m => !m.status || String(m.status).toLowerCase() === "now"
  );

  const existingShowtimes = await Showtime.find();

  nowShowingMovies.forEach((movie, mIdx) => {
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + dayOffset);
      showDate.setHours(12, 0, 0, 0);

      // Select 2 halls for this movie on this day
      const hallIndices = [
        (mIdx + dayOffset) % halls.length,
        (mIdx + dayOffset + 2) % halls.length
      ];

      hallIndices.forEach((hIdx, slotNum) => {
        const hall = halls[hIdx];
        const slotIdx = (mIdx + dayOffset + slotNum * 2) % timeSlots.length;
        const slot = timeSlots[slotIdx];
        const basePrice = hallBasePrices[hall.name] || 2000;
        const calculatedPrice = basePrice + slot.priceOffset;

        // Check if duplicate showtime (movie, hall, date, startTime) exists in DB
        const isDuplicate = existingShowtimes.some(st => {
          const sameMovie = String(st.movie) === String(movie._id);
          const sameHall = String(st.hall) === String(hall._id);
          const sameDate = isSameDay(st.date, showDate);
          const sameTime = String(st.startTime).trim().toLowerCase() === slot.time.trim().toLowerCase();
          return sameMovie && sameHall && sameDate && sameTime;
        });

        if (!isDuplicate) {
          newShowtimesToInsert.push({
            movie: movie._id,
            hall: hall._id,
            date: showDate,
            startTime: slot.time,
            price: calculatedPrice,
            bookedSeats: []
          });
        }
      });
    }
  });

  if (newShowtimesToInsert.length === 0) {
    console.log("ℹ️ No new future showtimes needed. All slots already present in DB.");
    return existingShowtimes;
  }

  const createdShowtimes = await Showtime.insertMany(newShowtimesToInsert);
  console.log(`✅ ${createdShowtimes.length} New future showtimes seeded relative to current date.`);

  // Generate seat records for newly created showtimes
  if (typeof seedSeats === "function") {
    await seedSeats(createdShowtimes, halls);
  }

  return createdShowtimes;
};

module.exports = seedShowtimes;