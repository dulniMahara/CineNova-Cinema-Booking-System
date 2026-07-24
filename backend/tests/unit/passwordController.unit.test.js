const User = require('../../models/User');
const OTP = require('../../models/OTP');
const passwordController = require('../../controllers/passwordController');
const sendEmail = require('../../utils/sendEmail');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../models/OTP');
jest.mock('../../utils/sendEmail');

describe('Password Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('sendOTP', () => {
    it('should send OTP to valid email', async () => {
      req.body = { email: 'test@example.com' };

      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      User.findOne.mockResolvedValue(mockUser);
      OTP.create.mockResolvedValue({
        email: 'test@example.com',
        otp: '123456',
      });
      sendEmail.mockResolvedValue(true);

      await passwordController.sendOTP(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(OTP.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          otp: expect.any(String),
        })
      );
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP sent to your email',
      });
    });

    it('should return 404 if user not found', async () => {
      req.body = { email: 'nonexistent@example.com' };

      User.findOne.mockResolvedValue(null);

      await passwordController.sendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should handle errors when sending OTP', async () => {
      req.body = { email: 'test@example.com' };

      User.findOne.mockRejectedValue(new Error('Database error'));

      await passwordController.sendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should generate 6-digit OTP', async () => {
      req.body = { email: 'test@example.com' };

      const mockUser = { email: 'test@example.com' };
      User.findOne.mockResolvedValue(mockUser);

      let capturedOTP;
      OTP.create.mockImplementation((data) => {
        capturedOTP = data.otp;
        return Promise.resolve(data);
      });
      sendEmail.mockResolvedValue(true);

      await passwordController.sendOTP(req, res);

      expect(capturedOTP).toMatch(/^\d{6}$/);
      expect(parseInt(capturedOTP)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(capturedOTP)).toBeLessThanOrEqual(999999);
    });
  });

  describe('verifyOTP', () => {
    it('should verify valid OTP', async () => {
      req.body = {
        email: 'test@example.com',
        otp: '123456',
      };

      const mockOTP = {
        email: 'test@example.com',
        otp: '123456',
        createdAt: new Date(),
      };

      OTP.findOne.mockResolvedValue(mockOTP);

      await passwordController.verifyOTP(req, res);

      expect(OTP.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
        otp: '123456',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP verified successfully',
      });
    });

    it('should return 400 for invalid OTP', async () => {
      req.body = {
        email: 'test@example.com',
        otp: '999999',
      };

      OTP.findOne.mockResolvedValue(null);

      await passwordController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired OTP',
      });
    });

    it('should handle errors during OTP verification', async () => {
      req.body = {
        email: 'test@example.com',
        otp: '123456',
      };

      OTP.findOne.mockRejectedValue(new Error('Database error'));

      await passwordController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      req.body = {
        email: 'test@example.com',
        newPassword: 'newpassword123',
      };

      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'oldpassword',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      OTP.deleteMany.mockResolvedValue({ deletedCount: 1 });

      await passwordController.resetPassword(req, res);

      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(OTP.deleteMany).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successfully',
      });
    });

    it('should return 404 for non-existent user', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        newPassword: 'newpassword123',
      };

      User.findOne.mockResolvedValue(null);

      await passwordController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });


  });
});
