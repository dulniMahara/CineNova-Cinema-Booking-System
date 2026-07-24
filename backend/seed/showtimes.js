const Showtime = require("../models/Showtime");


const seedShowtimes = async (movies, halls) => {

  const today = new Date();

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);


  const showtimes = [

    {
      movie: movies[0]._id,
      hall: halls[0]._id,
      date: today,
      startTime: "18:30",
      price: 1800,
      bookedSeats: []
    },

    {
      movie: movies[1]._id,
      hall: halls[0]._id,
      date: today,
      startTime: "21:00",
      price: 2200,
      bookedSeats: []
    },


    {
      movie: movies[2]._id,
      hall: halls[1]._id,
      date: today,
      startTime: "19:30",
      price: 2000,
      bookedSeats: []
    },


    {
      movie: movies[3]._id,
      hall: halls[1]._id,
      date: tomorrow,
      startTime: "17:30",
      price: 2500,
      bookedSeats: []
    },


    {
      movie: movies[4]._id,
      hall: halls[0]._id,
      date: tomorrow,
      startTime: "20:00",
      price: 2000,
      bookedSeats: []
    }

  ];


  const createdShowtimes = await Showtime.insertMany(showtimes);


  console.log("✅ Showtimes seeded");


  return createdShowtimes;

};


module.exports = seedShowtimes;