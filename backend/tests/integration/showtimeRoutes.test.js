const request = require('supertest');
const app = require('../../app'); 
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server'); 
const Showtime = require('../../models/Showtime');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.disconnect();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Showtime.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Showtime API Integration Tests', () => {

  it('POST /api/showtimes - should save a new showtime to DB', async () => {
    const res = await request(app)
      .post('/api/showtimes')
      .send({
        movie: "650c1f1e1c9d440000000001",
        hall: "650c1f1e1c9d440000000002",
        date: "2025-12-31",
        startTime: "12:30 PM",
        price: 2000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.startTime).toBe("12:30 PM");

    const savedShowtime = await Showtime.findOne({ price: 2000 });
    expect(savedShowtime).toBeTruthy();
  });

  it('GET /api/showtimes/movie/:id - should return showtimes for specific movie', async () => {
    const movieId = "650c1f1e1c9d440000000001";
    
    await Showtime.create({
        movie: movieId,
        hall: "650c1f1e1c9d440000000002",
        date: "2025-01-01",
        startTime: "09:00 AM",
        price: 1000
    });

    const res = await request(app).get(`/api/showtimes/movie/${movieId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].price).toBe(1000);
  });
});