const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/movie');
const Hall = require('./models/Hall');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Seat = require('./models/Seat');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log('--- STARTING COMING SOON SHOWTIME MIGRATION ---');

  // 1. Find Coming Soon Movies
  const soonMovies = await Movie.find({ status: 'soon' });
  console.log(`Found ${soonMovies.length} Coming Soon movies:`);
  soonMovies.forEach(m => console.log(`  - ${m.title} (ID: ${m._id})`));

  const movieMap = {};
  soonMovies.forEach(m => { movieMap[m.title] = m._id; });

  // 2. Find Halls
  const halls = await Hall.find();
  const hallMap = {};
  halls.forEach(h => { hallMap[h.name] = h._id; });
  console.log('\nHalls loaded:', Object.keys(hallMap));

  // 3. Remove unreferenced August showtimes for Coming Soon movies
  const soonMovieIds = soonMovies.map(m => m._id);
  const augustShowtimes = await Showtime.find({
    movie: { $in: soonMovieIds },
    date: { $gte: new Date('2026-08-01T00:00:00.000Z'), $lte: new Date('2026-08-31T23:59:59.999Z') }
  });

  let removedCount = 0;
  let preservedCount = 0;

  for (const st of augustShowtimes) {
    const bookingCount = await Booking.countDocuments({ showtime: st._id });
    const paymentCount = await Payment.countDocuments({ showtimeId: st._id });
    const bookedSeatCount = await Seat.countDocuments({ showtimeId: st._id, status: { $in: ['booked', 'locked'] } });

    if (bookingCount === 0 && paymentCount === 0 && bookedSeatCount === 0) {
      await Showtime.findByIdAndDelete(st._id);
      removedCount++;
    } else {
      console.log(`PRESERVED referenced August showtime [${st._id}] for ${st.movie}`);
      preservedCount++;
    }
  }

  console.log(`\nRemoved ${removedCount} unreferenced August showtimes for Coming Soon movies.`);
  console.log(`Preserved ${preservedCount} referenced August showtimes.`);

  // 4. Define September 2026 showtimes schedule
  const septemberSchedule = [
    // Avengers: Doomsday (ID: movieMap['Avengers: Doomsday'])
    { movieTitle: 'Avengers: Doomsday', hallName: 'IMAX 3D Laser', date: '2026-09-02', startTime: '02:15 PM', price: 3000 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'VIP Lounge 3D', date: '2026-09-02', startTime: '09:00 PM', price: 3800 },
    { movieTitle: 'Avengers: Doomsday', hallName: '4DX Motion', date: '2026-09-05', startTime: '10:30 AM', price: 2800 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'IMAX 3D Laser', date: '2026-09-05', startTime: '06:30 PM', price: 3000 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'Dolby Atmos 2D', date: '2026-09-09', startTime: '02:15 PM', price: 2400 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'Standard 2D', date: '2026-09-09', startTime: '06:30 PM', price: 1800 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'IMAX 3D Laser', date: '2026-09-12', startTime: '02:15 PM', price: 3000 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'VIP Lounge 3D', date: '2026-09-12', startTime: '09:00 PM', price: 3800 },

    // Insidious (ID: movieMap['Insidious'])
    { movieTitle: 'Insidious', hallName: 'Dolby Atmos 2D', date: '2026-09-03', startTime: '06:30 PM', price: 2400 },
    { movieTitle: 'Insidious', hallName: 'Standard 2D', date: '2026-09-03', startTime: '09:00 PM', price: 1800 },
    { movieTitle: 'Insidious', hallName: '4DX Motion', date: '2026-09-06', startTime: '02:15 PM', price: 2800 },
    { movieTitle: 'Insidious', hallName: 'VIP Lounge 3D', date: '2026-09-06', startTime: '09:00 PM', price: 3800 },
    { movieTitle: 'Insidious', hallName: 'Standard 2D', date: '2026-09-10', startTime: '10:30 AM', price: 1800 },
    { movieTitle: 'Insidious', hallName: 'Dolby Atmos 2D', date: '2026-09-10', startTime: '06:30 PM', price: 2400 },
    { movieTitle: 'Insidious', hallName: '4DX Motion', date: '2026-09-13', startTime: '02:15 PM', price: 2800 },
    { movieTitle: 'Insidious', hallName: 'Standard 2D', date: '2026-09-13', startTime: '09:00 PM', price: 1800 },

    // Avatar: Fire and Ash (ID: movieMap['Avatar: Fire and Ash'])
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'IMAX 3D Laser', date: '2026-09-04', startTime: '01:30 PM', price: 3200 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'IMAX 3D Laser', date: '2026-09-04', startTime: '06:30 PM', price: 3200 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'VIP Lounge 3D', date: '2026-09-07', startTime: '05:00 PM', price: 4000 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'Dolby Atmos 2D', date: '2026-09-07', startTime: '08:30 PM', price: 2600 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'IMAX 3D Laser', date: '2026-09-11', startTime: '01:30 PM', price: 3200 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'VIP Lounge 3D', date: '2026-09-11', startTime: '06:30 PM', price: 4000 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'IMAX 3D Laser', date: '2026-09-14', startTime: '06:30 PM', price: 3200 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'Standard 2D', date: '2026-09-14', startTime: '01:30 PM', price: 2000 }
  ];

  let addedCount = 0;
  for (const item of septemberSchedule) {
    const movieId = movieMap[item.movieTitle];
    const hallId = hallMap[item.hallName];
    if (!movieId || !hallId) {
      console.error(`Skipping ${item.movieTitle} / ${item.hallName}: ID not found`);
      continue;
    }

    const showtimeDate = new Date(`${item.date}T00:00:00.000Z`);

    // Check duplicate
    const existing = await Showtime.findOne({
      movie: movieId,
      hall: hallId,
      date: showtimeDate,
      startTime: item.startTime
    });

    if (!existing) {
      await Showtime.create({
        movie: movieId,
        hall: hallId,
        date: showtimeDate,
        startTime: item.startTime,
        price: item.price
      });
      addedCount++;
    }
  }

  console.log(`\nAdded ${addedCount} new September showtimes.`);

  // 5. Verification summary
  const finalSoonSt = await Showtime.find({ movie: { $in: soonMovieIds } }).populate('movie').populate('hall');
  console.log(`\nFinal total showtimes for Coming Soon movies: ${finalSoonSt.length}`);
  finalSoonSt.forEach(s => {
    console.log(`  [${s.movie?.title}] | ${s.hall?.name} | ${new Date(s.date).toISOString().split('T')[0]} ${s.startTime} | Rs. ${s.price}`);
  });

  await mongoose.disconnect();
  console.log('\n--- MIGRATION COMPLETE ---');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
