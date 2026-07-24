const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seatRoutes = require('../../routes/seats');
const Seat = require('../../models/Seat');
const Hall = require('../../models/Hall');         // We need this now!
const Showtime = require('../../models/Showtime'); // We need this now!

const app = express();
app.use(express.json());
app.use('/', seatRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Seat.deleteMany();
  await Hall.deleteMany();
  await Showtime.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Smart Seat Generation API', () => {

  test('POST /generate - Should generate seats based on Hall Layout', async () => {
    // 1. Create a HALL with a specific layout (1 = Seat, 0 = Aisle)
    // Layout: [Seat, Aisle, Seat] (Row A)
    const hall = await Hall.create({
      name: "IMAX Test Hall",
      totalRows: 1,
      totalCols: 3,
      seatCapacity: 2,
      seatLayout: [[1, 0, 1]] // <-- The secret map!
    });

    // 2. Create a SHOWTIME linked to that Hall
    const showtime = await Showtime.create({
      movie: new mongoose.Types.ObjectId(), // Fake Movie ID
      hall: hall._id,                       // Link to our Hall
      date: new Date(),
      startTime: "10:00",
      price: 1500
    });

    // 3. Call your NEW Generate Route
    const res = await request(app)
      .post('/generate')
      .send({ showtimeId: showtime._id });

    // 4. VERIFY
    expect(res.statusCode).toBe(200);
    
    // We expect exactly 2 seats (because layout was 1, 0, 1)
    const seats = await Seat.find({ showtimeId: showtime._id });
    expect(seats.length).toBe(2);

    // Check that the middle seat (number 2) was SKIPPED
    const seatNumbers = seats.map(s => s.number);
    expect(seatNumbers).toContain(1); // Row A, Seat 1
    expect(seatNumbers).toContain(3); // Row A, Seat 3
    expect(seatNumbers).not.toContain(2); // Seat 2 should be missing (Aisle)
    
    // Check price came from Showtime
    expect(seats[0].price).toBe(1500);
  });

});