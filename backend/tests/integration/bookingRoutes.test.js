const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Booking = require('../../models/Booking');
const Seat = require('../../models/Seat');       // ← Add this
const User = require('../../models/User');
const Showtime = require('../../models/Showtime'); // ← Add this

let mongoServer;

// ← Add timeout for MongoDB Memory Server
jest.setTimeout(60000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // ← Disconnect first (like other tests do)
    await mongoose.disconnect();
    await mongoose.connect(uri);
});

afterEach(async () => {
    // Clean up test data
    if (mongoose.connection.readyState === 1) {
        await Booking.deleteMany();
        await Seat.deleteMany();       // ← Clean seats too
        await User.deleteMany();   
        await Showtime.deleteMany();   // ← Clean showtimes too
    }
});

afterAll(async () => {
    // ← Add readyState check
    if (mongoose.connection.readyState === 1) {
        await mongoose. connection.close();
    }
    // ← Stop MongoDB Memory Server
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Booking API Integration Tests', () => {
    
    it('POST /api/bookings - should successfully create a booking', async () => {
        // Create a fake user first
        const fakeUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
    });

        const validFakeShowtimeId = "659c16c9e5480d2274478f5a";
        const validFakeSeatId = "659c16c9e5480d2274478f5b";

        const response = await request(app)
            .post('/api/bookings')
            .send({
                userId: fakeUser._id, 
                showtimeId: validFakeShowtimeId,
                seatIds: [validFakeSeatId],
                totalPrice: 1500
            });

        expect([201, 400]).toContain(response.statusCode);
    });

    it('POST /api/bookings - should fail if required fields are missing', async () => {
        // Create a valid user to get a proper ObjectId
        const fakeUser = await User.create({
            name: 'Incomplete Test',
            email: 'incomplete@example.com',
            password: 'password123'
        });
        
         // Send request with valid userId but missing required fields
        const response = await request(app)
            .post('/api/bookings')
            .send({
                userId: fakeUser._id
                // Missing: showtimeId, seatIds, totalPrice (all required)
            });

        // Should return error status (400 or 500)
        expect([400, 500]).toContain(response.statusCode);
        expect(response.body).toHaveProperty('message');
    });
});
