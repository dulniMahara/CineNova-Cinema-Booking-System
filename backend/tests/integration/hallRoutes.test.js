const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../app'); 
const Hall = require('../../models/Hall');
const User = require('../../models/User');

jest.setTimeout(60000);

let mongoServer;
let adminToken;
let customerToken;

beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }
});

beforeEach(async () => {
    const secret = process.env.JWT_SECRET || 'secretkey123';
    const adminUser = await User.create({
        name: 'Admin User',
        email: `admin_${Date.now()}@test.com`,
        password: 'password123',
        role: 'admin'
    });
    const customerUser = await User.create({
        name: 'Customer User',
        email: `customer_${Date.now()}@test.com`,
        password: 'password123',
        role: 'customer'
    });

    adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, secret);
    customerToken = jwt.sign({ id: customerUser._id, role: 'customer' }, secret);
});

afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        await Hall.deleteMany();
        await User.deleteMany();
    }
});

afterAll(async () => {
    // Close mongoose connection
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
    // Stop MongoDB Memory Server
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Hall API Integration Tests', () => {

    it('GET /api/halls - should return array of halls (Public)', async () => {
        await Hall.create({
            name: "Existing Hall Test",
            totalRows: 2, totalCols: 2, seatLayout: [[1,1],[1,1]], seatCapacity: 4
        });

        const res = await request(app).get('/api/halls');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/halls - should reject without token (401)', async () => {
        const res = await request(app)
            .post('/api/halls')
            .send({
                name: "Unauth Hall",
                totalRows: 2, totalCols: 2, seatLayout: [[1,1],[1,1]], seatCapacity: 4
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/Access denied/i);
    });

    it('PUT /api/halls/:id - should reject customer token (403)', async () => {
        const hall = await Hall.create({
            name: "Customer Protected Hall",
            totalRows: 2, totalCols: 2, seatLayout: [[1,1],[1,1]], seatCapacity: 4
        });

        const res = await request(app)
            .put(`/api/halls/${hall._id}`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ name: "Attempted Update" });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/Admin access required/i);
    });

    it('POST /api/halls - should create a new hall with admin token', async () => {
        const res = await request(app)
            .post('/api/halls')
            .set('Authorization', `Bearer ${adminToken}`)
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

    it('PUT /api/halls/:id - should update hall details with admin token', async () => {
        const hall = await Hall.create({
            name: "Old Name Test",
            totalRows: 8, totalCols: 10, seatLayout: Array(8).fill(Array(10).fill(1)), seatCapacity: 80
        });

        const newLayout = Array(10).fill(Array(10).fill(1));
        const res = await request(app)
            .put(`/api/halls/${hall._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: "Updated Name Test",
                totalRows: 10,
                totalCols: 10,
                seatLayout: newLayout,
                seatCapacity: 100
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe("Updated Name Test");
        expect(res.body.data.totalRows).toBe(10);
        expect(res.body.data.seatCapacity).toBe(100);
    });

    it('DELETE /api/halls/:id - should delete the hall with admin token', async () => {
        const hall = await Hall.create({
            name: "Delete Me Test",
            totalRows: 2, totalCols: 2, seatLayout: [[1,1],[1,1]], seatCapacity: 4
        });

        const res = await request(app)
            .delete(`/api/halls/${hall._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        const check = await Hall.findById(hall._id);
        expect(check).toBeNull();
    });
});