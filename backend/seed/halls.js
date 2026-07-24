const Hall = require("../models/Hall");

const seedHalls = async () => {

  const halls = [
    {
      name: "IMAX Hall",
      totalRows: 8,
      totalCols: 12,
      seatCapacity: 96,
      seatLayouts: [
        {
          type: "regular",
          capacity: 72
        },
        {
          type: "premium",
          capacity: 24
        }
      ]
    },

    {
      name: "VIP Hall",
      totalRows: 6,
      totalCols: 10,
      seatCapacity: 60,
      seatLayouts: [
        {
          type: "vip",
          capacity: 60
        }
      ]
    }
  ];


  const createdHalls = await Hall.insertMany(halls);

  console.log("✅ Halls seeded");

  return createdHalls;
};


module.exports = seedHalls;