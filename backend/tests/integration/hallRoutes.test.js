const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../app'); 
const Hall = require('../../models/Hall');

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }
});

afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        await Hall.deleteMany();
    }
});

afterAll(async () => {
    // Close mongoose connection
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection. close();
    }
    // Stop MongoDB Memory Server
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Hall API Integration Tests', () => {

    it('POST /api/halls - should create a new hall', async () => {
        const res = await request(app)
            .post('/api/halls')
            .send({
                name: "Integration Hall Test",
                totalRows: 5,
                totalCols: 5,
                seatLayout: [[1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1]],
                seatCapacity: 25
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.name).toBe("Integration Hall Test");
    });

    it('GET /api/halls - should return array of halls', async () => {
        await Hall.create({
            name: "Existing Hall Test",
            totalRows: 2, totalCols: 2, seatLayout: [[1,1],[1,1]], seatCapacity: 4
        });

        const res = await request(app).get('/api/halls');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body. data.length).toBeGreaterThanOrEqual(1);
    });

    it('PUT /api/halls/:id - should update hall details', async () => {
        const hall = await Hall.create({
            name: "Old Name Test",
            totalRows: 2, totalCols: 2, seatLayout: [[1,1],[1,1]], seatCapacity: 4
        });

        const res = await request(app)
            .put(`/api/halls/${hall._id}`)
            .send({ name: "New Name Test" });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe("New Name Test");
    });

    it('DELETE /api/halls/:id - should delete the hall', async () => {
        const hall = await Hall.create({
            name: "Delete Me Test",
            totalRows: 2, totalCols: 2, seatLayout: [[1,1],[1,1]], seatCapacity: 4
        });

        const res = await request(app).delete(`/api/halls/${hall._id}`);

        expect(res.statusCode).toBe(200);

        const check = await Hall.findById(hall._id);
        expect(check).toBeNull();
    });
});