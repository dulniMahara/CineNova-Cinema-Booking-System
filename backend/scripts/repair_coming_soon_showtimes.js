const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('../models/movie');
const Hall = require('../models/Hall');
const Showtime = require('../models/Showtime');

async function repair() {
  console.log('--- STARTING COMING SOON & ORPHAN REPAIR ---');
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log('Connected to MongoDB database:', mongoose.connection.name);

  // 1. Find all Halls
  const halls = await Hall.find();
  const hallMap = {};
  halls.forEach(h => { hallMap[h.name] = h._id; });
  console.log('Loaded Halls:', Object.keys(hallMap));

  // 2. Repair orphaned showtimes referencing deleted Movie ID '6a6e102dee914de020a325c2'
  const oldMovieId = '6a6e102dee914de020a325c2';
  const currentOdyssey = await Movie.findOne({ title: 'The Odyssey' });

  if (currentOdyssey) {
    console.log(`\nCurrent "The Odyssey" Movie Document: ID [${currentOdyssey._id}], Status: "${currentOdyssey.status}"`);

    // Ensure status is 'soon'
    if (currentOdyssey.status !== 'soon') {
      currentOdyssey.status = 'soon';
      await currentOdyssey.save();
      console.log('Updated "The Odyssey" status to "soon".');
    }

    // Re-link orphaned showtimes
    const orphanResult = await Showtime.updateMany(
      { movie: oldMovieId },
      { $set: { movie: currentOdyssey._id } }
    );
    console.log(`Re-linked ${orphanResult.modifiedCount} orphaned showtimes to current "The Odyssey" ID [${currentOdyssey._id}].`);
  } else {
    console.error('ERROR: Could not find "The Odyssey" movie document in database.');
  }

  // 3. Find all Coming Soon movies
  const soonMovies = await Movie.find({ status: 'soon' });
  console.log(`\nFound ${soonMovies.length} Coming Soon movies:`);
  soonMovies.forEach(m => console.log(`  - "${m.title}" (ID: ${m._id})`));

  const movieMap = {};
  soonMovies.forEach(m => { movieMap[m.title] = m._id; });

  // 4. Define September 2026 showtime schedule for Coming Soon movies
  const septemberSchedule = [
    // Avengers: Doomsday
    { movieTitle: 'Avengers: Doomsday', hallName: 'IMAX 3D Laser', date: '2026-09-02', startTime: '02:15 PM', price: 3000 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'VIP Lounge 3D', date: '2026-09-02', startTime: '09:00 PM', price: 3800 },
    { movieTitle: 'Avengers: Doomsday', hallName: '4DX Motion', date: '2026-09-05', startTime: '10:30 AM', price: 2800 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'IMAX 3D Laser', date: '2026-09-05', startTime: '06:30 PM', price: 3000 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'Dolby Atmos 2D', date: '2026-09-09', startTime: '02:15 PM', price: 2400 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'Standard 2D', date: '2026-09-09', startTime: '06:30 PM', price: 1800 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'IMAX 3D Laser', date: '2026-09-12', startTime: '02:15 PM', price: 3000 },
    { movieTitle: 'Avengers: Doomsday', hallName: 'VIP Lounge 3D', date: '2026-09-12', startTime: '09:00 PM', price: 3800 },

    // Insidious
    { movieTitle: 'Insidious', hallName: 'Dolby Atmos 2D', date: '2026-09-03', startTime: '06:30 PM', price: 2400 },
    { movieTitle: 'Insidious', hallName: 'Standard 2D', date: '2026-09-03', startTime: '09:00 PM', price: 1800 },
    { movieTitle: 'Insidious', hallName: '4DX Motion', date: '2026-09-06', startTime: '02:15 PM', price: 2800 },
    { movieTitle: 'Insidious', hallName: 'VIP Lounge 3D', date: '2026-09-06', startTime: '09:00 PM', price: 3800 },
    { movieTitle: 'Insidious', hallName: 'Standard 2D', date: '2026-09-10', startTime: '10:30 AM', price: 1800 },
    { movieTitle: 'Insidious', hallName: 'Dolby Atmos 2D', date: '2026-09-10', startTime: '06:30 PM', price: 2400 },
    { movieTitle: 'Insidious', hallName: '4DX Motion', date: '2026-09-13', startTime: '02:15 PM', price: 2800 },
    { movieTitle: 'Insidious', hallName: 'Standard 2D', date: '2026-09-13', startTime: '09:00 PM', price: 1800 },

    // Avatar: Fire and Ash
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'IMAX 3D Laser', date: '2026-09-04', startTime: '01:30 PM', price: 3200 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'IMAX 3D Laser', date: '2026-09-04', startTime: '06:30 PM', price: 3200 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'VIP Lounge 3D', date: '2026-09-07', startTime: '05:00 PM', price: 4000 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'Dolby Atmos 2D', date: '2026-09-07', startTime: '08:30 PM', price: 2600 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'IMAX 3D Laser', date: '2026-09-11', startTime: '01:30 PM', price: 3200 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'VIP Lounge 3D', date: '2026-09-11', startTime: '06:30 PM', price: 4000 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'IMAX 3D Laser', date: '2026-09-14', startTime: '06:30 PM', price: 3200 },
    { movieTitle: 'Avatar: Fire and Ash', hallName: 'Standard 2D', date: '2026-09-14', startTime: '01:30 PM', price: 2000 },

    // The Odyssey
    { movieTitle: 'The Odyssey', hallName: 'IMAX 3D Laser', date: '2026-09-03', startTime: '01:30 PM', price: 3500 },
    { movieTitle: 'The Odyssey', hallName: 'VIP Lounge 3D', date: '2026-09-03', startTime: '07:30 PM', price: 4200 },
    { movieTitle: 'The Odyssey', hallName: 'Dolby Atmos 2D', date: '2026-09-08', startTime: '02:15 PM', price: 2600 },
    { movieTitle: 'The Odyssey', hallName: '4DX Motion', date: '2026-09-08', startTime: '08:00 PM', price: 3200 },
    { movieTitle: 'The Odyssey', hallName: 'IMAX 3D Laser', date: '2026-09-15', startTime: '02:15 PM', price: 3500 },
    { movieTitle: 'The Odyssey', hallName: 'VIP Lounge 3D', date: '2026-09-15', startTime: '08:30 PM', price: 4200 }
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

  console.log(`\nCreated ${addedCount} new September 2026 showtime records.`);

  // 5. Summary verification
  const finalSoonMovies = await Movie.find({ status: 'soon' });
  for (const m of finalSoonMovies) {
    const count = await Showtime.countDocuments({
      movie: m._id,
      date: { $gte: new Date('2026-09-01T00:00:00.000Z'), $lte: new Date('2026-09-30T23:59:59.999Z') }
    });
    console.log(`  - "${m.title}" [_id: ${m._id}]: ${count} September showtimes`);
  }

  await mongoose.disconnect();
  console.log('\n--- REPAIR COMPLETED SUCCESSFULLY ---');
}

repair().catch(err => {
  console.error('Repair failed:', err);
  process.exit(1);
});
