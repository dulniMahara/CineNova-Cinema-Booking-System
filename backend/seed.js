require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./models/User");
const Movie = require("./models/movie");
const Hall = require("./models/Hall");
const Showtime = require("./models/Showtime");
const Seat = require("./models/Seat");

const seedUsers = require("./seed/users");
const seedMovies = require("./seed/movies");
const seedHalls = require("./seed/halls");
const seedShowtimes = require("./seed/showtimes");
const seedSeats = require("./seed/seats");


const seedDatabase = async () => {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");


    // Clear existing data
    await User.deleteMany();
    await Movie.deleteMany();
    await Hall.deleteMany();
    await Showtime.deleteMany();
    await Seat.deleteMany();


    console.log("🧹 Old database cleared");


    // Create data in correct order

    await seedUsers();


    const movies = await seedMovies();


    const halls = await seedHalls();


    const showtimes = await seedShowtimes(
      movies,
      halls
    );


    await seedSeats(
      showtimes,
      halls
    );


    console.log(
      "🎬 Cinema database seeded successfully!"
    );


    await mongoose.disconnect();


  } catch(error) {

    console.log(
      "❌ Seeding error:",
      error
    );

    process.exit(1);

  }

};


seedDatabase();