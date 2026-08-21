require("dotenv").config();

const Movie = require("../models/movie");
const Hall = require("../models/Hall");
const Showtime = require("../models/Showtime");
const seedShowtimes = require("../seed/showtimes");

const runFutureShowtimeSeeder = async () => {
  try {
    // server.js is responsible for connecting to MongoDB.
    // This function only checks/creates the required showtimes.

    const nowShowingMovies = await Movie.find({ status: "now" });
    const halls = await Hall.find();

    console.log(
      `Found ${nowShowingMovies.length} Now Showing movie(s) and ${halls.length} hall(s) in DB.`
    );

    if (nowShowingMovies.length === 0 || halls.length === 0) {
      console.log(
        "⚠️ Movies or Halls missing. Skipping automatic showtime refresh."
      );
      return;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const pastCount = await Showtime.countDocuments({
      date: { $lt: startOfToday }
    });

    console.log(`Historical past showtimes in DB: ${pastCount}`);

    await seedShowtimes(nowShowingMovies, halls);

    const totalCount = await Showtime.countDocuments();

    const futureCount = await Showtime.countDocuments({
      date: { $gte: startOfToday }
    });

    console.log("\n--- SHOWTIME DATABASE SUMMARY ---");
    console.log(`- Total Showtimes in DB: ${totalCount}`);
    console.log(`- Past Showtimes Preserved: ${pastCount}`);
    console.log(`- Future Showtimes Available: ${futureCount}`);
    console.log(
      `- Date Range Covered: ${new Date().toDateString()} to ${new Date(
        Date.now() + 7 * 86400000
      ).toDateString()}`
    );
    console.log(
      `- Covered Movies: ${nowShowingMovies.map((m) => m.title).join(", ")}`
    );
    console.log(
      `- Covered Halls: ${halls.map((h) => h.name).join(", ")}`
    );

    console.log("✅ Automatic Showtime refresh completed successfully!");
  } catch (err) {
    console.error("❌ Automatic Showtime refresh failed:", err);
    throw err;
  }
};

module.exports = runFutureShowtimeSeeder;