const Showtime = require("../models/Showtime");

const seedShowtimes = async (movies, halls) => {
  const showtimes = [];

  const timeSlots = [
    { time: "10:30 AM", priceOffset: -200 },
    { time: "02:15 PM", priceOffset: 0 },
    { time: "06:30 PM", priceOffset: 200 },
    { time: "09:00 PM", priceOffset: 300 }
  ];

  // Base price map per hall experience type
  const hallBasePrices = {
    "IMAX 3D Laser": 2800,
    "Dolby Atmos 2D": 2200,
    "VIP Lounge 3D": 3500,
    "4DX Motion": 3000,
    "Standard 2D": 1800
  };

  // For each movie, generate showtimes across diverse halls over the next 7 days
  movies.forEach((movie, mIdx) => {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + dayOffset);
      showDate.setHours(12, 0, 0, 0);

      // Select 2-3 different halls for this movie on this day
      const hallIndices = [
        (mIdx + dayOffset) % halls.length,
        (mIdx + dayOffset + 2) % halls.length,
        (mIdx + dayOffset + 3) % halls.length
      ];

      hallIndices.forEach((hIdx, slotNum) => {
        const hall = halls[hIdx];
        const slotIdx = (mIdx + dayOffset + slotNum) % timeSlots.length;
        const slot = timeSlots[slotIdx];
        const basePrice = hallBasePrices[hall.name] || 2000;

        showtimes.push({
          movie: movie._id,
          hall: hall._id,
          date: showDate,
          startTime: slot.time,
          price: basePrice + slot.priceOffset,
          bookedSeats: []
        });
      });
    }
  });

  const createdShowtimes = await Showtime.insertMany(showtimes);
  console.log(`✅ ${createdShowtimes.length} Diverse showtimes seeded across upcoming 7 days.`);
  return createdShowtimes;
};

module.exports = seedShowtimes;