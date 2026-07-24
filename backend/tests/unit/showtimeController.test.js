const showtimeController = require('../../controllers/showtimeController');
const Showtime = require('../../models/Showtime');
const httpMocks = require('node-mocks-http');

jest.mock('../../models/Showtime');

let req, res, next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
});

describe('Showtime Controller - Unit Tests', () => {
  
  it('should have an addShowtime function', () => {
    expect(typeof showtimeController.addShowtime).toBe('function');
  });

  it('should call Showtime.create with correct data', async () => {
    const newShowtime = { 
      movie: "650c1f1e1c9d440000000001", 
      hall: "650c1f1e1c9d440000000002", 
      date: "2025-12-31",
      startTime: "10:00 AM",
      price: 1500 
    };
    req.body = newShowtime;

    Showtime.create.mockReturnValue(newShowtime);

    await showtimeController.addShowtime(req, res, next);

    expect(Showtime.create).toHaveBeenCalledWith(newShowtime); 
    expect(res.statusCode).toBe(201); 
    expect(res._isEndCalled()).toBeTruthy(); 
  });

  it('should return 500 if database fails', async () => {
    const errorMessage = { message: "Database Error" };
    const rejectedPromise = Promise.reject(errorMessage);
    Showtime.create.mockReturnValue(rejectedPromise);

    await showtimeController.addShowtime(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({ 
        success: false, 
        message: "Database Error" 
    });
  });
});