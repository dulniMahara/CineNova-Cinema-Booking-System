const bookingController = require('../../controllers/bookingController');
const Booking = require('../../models/Booking');
const Seat = require('../../models/Seat');
const Notification = require ('../../models/Notification');
const httpMocks = require('node-mocks-http');
const mongoose = require('mongoose');

// Mock the models
jest.mock('../../models/Booking');
jest.mock('../../models/Seat');
jest.mock('../../models/Notification');

describe('Booking Controller Unit Tests', () => {
    let req, res;
    let validUserId, validShowtimeId, validSeatId1, validSeatId2, validBookingId;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        // Mock the app object for Socket.IO dependencies
        req.app = {
            get: jest.fn((key) => {
                if (key === 'io') {
                    return {
                        to: jest.fn().mockReturnThis(),
                        emit: jest.fn()
                    };
                }
                if (key === 'onlineUsers') {
                    return new Map();
                }
                return null;
            })
        };

        jest.clearAllMocks();
        
        // Generate valid MongoDB ObjectIds for testing
        validUserId = new mongoose.Types.ObjectId();
        validShowtimeId = new mongoose.Types.ObjectId();
        validSeatId1 = new mongoose.Types.ObjectId();
        validSeatId2 = new mongoose.Types.ObjectId();
        validBookingId = new mongoose.Types.ObjectId();
    });

    // TEST 1: Create Booking Success
    it('should create a booking successfully', async () => {
        req.body = {
            userId: validUserId,
            showtimeId: validShowtimeId,
            seatIds: [validSeatId1, validSeatId2],
            totalPrice: 2000
        };

        // Mock finding existing booking (return null = no double booking)
        Booking.findOne.mockResolvedValue(null);
        // Mock Seat.find to return seat details
        Seat.find.mockResolvedValue([
            { _id: validSeatId1, row: 'A', number: 1, price: 1000 },
            { _id: validSeatId2, row: 'A', number: 2, price: 1000 }
        ]);
        
        // Mock save
        Booking.prototype.save = jest.fn().mockResolvedValue({
            _id: validBookingId,
            ...req.body
        });

        // Mock seat update
        Seat.updateMany.mockResolvedValue({});

            // Mock Notification creation
            Notification.create.mockResolvedValue({
                _id: 'notification_123',
                userId: req.body.userId,
                message: `Booking Confirmed! Your Booking ID is booking_123`
            });

        await bookingController.createBooking(req, res);

        expect(res.statusCode).toBe(201);
        expect(res._getJSONData()).toHaveProperty('message', 'Booking successful!');
    });

    // TEST 2: Prevent Double Booking
    it('should prevent booking if seats are already taken', async () => {
        req.body = {
            userId: validUserId,
            showtimeId: validShowtimeId,
            seatIds: [validSeatId1],
            totalPrice: 1000
        };

        // Mock finding an existing booking (return object = already booked)
        Booking.findOne.mockResolvedValue({
            _id: validBookingId,
            status: 'Confirmed'
        });

        await bookingController.createBooking(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toHaveProperty('message', 'One or more seats are already booked!');
    });

    // TEST 3: Get User History
    it('should return user bookings', async () => {
        req.params.userId = validUserId;

        const mockBookings = [
            { _id: validBookingId.toString(), showtimeId: { movie: { title: 'Movie A' } }, seatIds: [] }
        ];

        // Chainable mock for .populate().populate().sort()
        const mockFind = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockBookings)
        };

        Booking.find.mockReturnValue(mockFind);

        await bookingController.getUserBookings(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockBookings);
    });
});