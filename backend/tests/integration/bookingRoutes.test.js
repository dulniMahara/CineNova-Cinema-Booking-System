const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Booking = require('../../models/Booking');
const Seat = require('../../models/Seat');
const User = require('../../models/User');
const Showtime = require('../../models/Showtime');

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.disconnect();
    await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        await Booking.deleteMany();
        await Seat.deleteMany();
        await User.deleteMany();
        await Showtime.deleteMany();
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Booking API Integration Tests', () => {

    it('POST /api/bookings - should require authentication', async () => {
        const response = await request(app)
            .post('/api/bookings')
            .send({
                userId: new mongoose.Types.ObjectId(),
                showtimeId: new mongoose.Types.ObjectId(),
                seatIds: [new mongoose.Types.ObjectId()],
                totalPrice: 1500
            });

        expect(response.statusCode).toBe(401);
    });

});