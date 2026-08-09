require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("../models/movie");
const Hall = require("../models/Hall");
const Showtime = require("../models/Showtime");
const seedShowtimes = require("../seed/showtimes");

const runFutureShowtimeSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected for Showtime Seeder");

    // Fetch existing Now Showing movies and Halls
    const nowShowingMovies = await Movie.find({ status: "now" });
    const halls = await Hall.find();

    console.log(`Found ${nowShowingMovies.length} Now Showing movie(s) and ${halls.length} hall(s) in DB.`);

    if (nowShowingMovies.length === 0 || halls.length === 0) {
      console.log("⚠️ Movies or Halls missing. Please run main database seed first.");
      process.exit(1);
    }

    const pastCount = await Showtime.countDocuments({
      date: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    console.log(`Historical past showtimes in DB (Aug 1–7): ${pastCount}`);

    const result = await seedShowtimes(nowShowingMovies, halls);

    const totalCount = await Showtime.countDocuments();
    const futureCount = await Showtime.countDocuments({
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    console.log("\n--- SHOWTIME DATABASE SUMMARY ---");
    console.log(`- Total Showtimes in DB: ${totalCount}`);
    console.log(`- Past Showtimes Preserved: ${pastCount}`);
    console.log(`- Future Showtimes Available: ${futureCount}`);
    console.log(`- Date Range Covered: ${new Date().toDateString()} to ${new Date(Date.now() + 7 * 86400000).toDateString()}`);
    console.log(`- Covered Movies: ${nowShowingMovies.map(m => m.title).join(", ")}`);
    console.log(`- Covered Halls: ${halls.map(h => h.name).join(", ")}`);

    await mongoose.disconnect();
    console.log("✅ Showtime Seeder completed successfully!");
  } catch (err) {
    console.error("❌ Showtime Seeder failed:", err);
    process.exit(1);
  }
};

runFutureShowtimeSeeder();
