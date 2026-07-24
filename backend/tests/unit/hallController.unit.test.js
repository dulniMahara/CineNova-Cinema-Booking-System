const { createHall, getHalls, updateHall, deleteHall } = require('../../controllers/hallController');
const Hall = require('../../models/Hall');
const httpMocks = require('node-mocks-http');

// Mock the Hall Model
jest.mock('../../models/Hall');

describe('Hall Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
    });

    // --- TEST 1: Create Hall ---
    it('should create a hall successfully', async () => {
        const mockHall = { name: 'IMAX', totalRows: 5, totalCols: 5, seatCapacity: 25 };
        req.body = mockHall;
        
        // Mock Hall.create to return the data immediately
        Hall.create.mockResolvedValue(mockHall);

        await createHall(req, res);

        expect(res.statusCode).toBe(201);
        expect(res._getJSONData().success).toBe(true);
        expect(res._getJSONData().data.name).toBe('IMAX');
    });

    // --- TEST 2: Get Halls ---
    it('should return all halls', async () => {
        const mockHalls = [
            { name: 'Hall A', seatCapacity: 50 },
            { name: 'Hall B', seatCapacity: 100 }
        ];
        
        Hall.find.mockResolvedValue(mockHalls);

        await getHalls(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().data.length).toBe(2);
        expect(res._getJSONData().data[0].name).toBe('Hall A');
    });

    // --- TEST 3: Delete Hall ---
    it('should delete a hall if it exists', async () => {
        req.params.id = 'dummy_id';

        // 1. Mock findById to return a hall (so it passes the "not found" check)
        Hall.findById.mockResolvedValue({ _id: 'dummy_id', name: 'To Delete' });
        // 2. Mock findByIdAndDelete
        Hall.findByIdAndDelete.mockResolvedValue({});

        await deleteHall(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().success).toBe(true);
    });

    // --- TEST 4: Handle 404 on Delete ---
    it('should return 404 if hall to delete is not found', async () => {
        req.params.id = 'non_existent_id';
        
        Hall.findById.mockResolvedValue(null); // Simulate not found

        await deleteHall(req, res);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData().message).toBe('Hall not found');
    });
});