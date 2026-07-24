const Seat = require("../models/Seat");


const seedSeats = async (showtimes, halls) => {

  let seats = [];


  for (const showtime of showtimes) {


    const hall = halls.find(
      h => h._id.toString() === showtime.hall.toString()
    );


    for (let row = 0; row < hall.totalRows; row++) {


      const rowLetter = String.fromCharCode(65 + row);


      for (let number = 1; number <= hall.totalCols; number++) {


        seats.push({

          row: rowLetter,

          number: number,

          price: showtime.price,

          status: "available",

          showtimeId: showtime._id

        });


      }

    }

  }


  await Seat.insertMany(seats);


  console.log("✅ Seats seeded");


  return seats;

};


module.exports = seedSeats;