const Hall = require("../models/Hall");

const seedHalls = async () => {
  const halls = [
    {
      name: "IMAX 3D Laser",
      totalRows: 8,
      totalCols: 12,
      seatCapacity: 96,
      seatLayouts: [
        { type: "regular", capacity: 72 },
        { type: "premium", capacity: 24 }
      ]
    },
    {
      name: "Dolby Atmos 2D",
      totalRows: 8,
      totalCols: 10,
      seatCapacity: 80,
      seatLayouts: [
        { type: "regular", capacity: 80 }
      ]
    },
    {
      name: "VIP Lounge 3D",
      totalRows: 6,
      totalCols: 10,
      seatCapacity: 60,
      seatLayouts: [
        { type: "vip", capacity: 60 }
      ]
    },
    {
      name: "4DX Motion",
      totalRows: 8,
      totalCols: 8,
      seatCapacity: 64,
      seatLayouts: [
        { type: "premium", capacity: 64 }
      ]
    },
    {
      name: "Standard 2D",
      totalRows: 8,
      totalCols: 10,
      seatCapacity: 80,
      seatLayouts: [
        { type: "regular", capacity: 80 }
      ]
    }
  ];

  const createdHalls = await Hall.insertMany(halls);
  console.log("✅ 5 Cinema Experience Halls seeded successfully");
  return createdHalls;
};

module.exports = seedHalls;