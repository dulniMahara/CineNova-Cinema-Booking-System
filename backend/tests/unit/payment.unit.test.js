const { processPayment } = require('../../controllers/paymentController');
const sendEmail = require('../../utils/emailService');
const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const httpMocks = require('node-mocks-http');

// MOCK DEPENDENCIES (Isolating the Unit)
jest.mock('../../utils/emailService');
jest.mock('../../models/Payment');
jest.mock('../../models/Booking');

describe('Unit Test: Payment Controller Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should trigger email service with correct details when payment succeeds', async () => {
        // 1. Setup Fake Request
        const req = httpMocks.createRequest({
            method: 'POST',
            user: { _id: 'userUnit', email: 'unit@test.com', name: 'Unit Tester' },
            body: { bookingId: 'b1', amount: 100 }
        });
        const res = httpMocks.createResponse();

        // 2. Mock Responses (Force success)
        Payment.prototype.save = jest.fn().mockResolvedValue({ _id: 'p1', status: 'Completed' });
        Booking.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue({
                seats: ['A1'],
                showtimeId: { movie: { title: 'Unit Movie' } }
            })
        });

        // 3. Run Function
        await processPayment(req, res);

        // 4. CHECK LOGIC: Did we try to send an email?
        expect(sendEmail).toHaveBeenCalledTimes(1);
        expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
            email: 'unit@test.com',
            subject: expect.stringContaining('Unit Movie')
        }));
    });
});