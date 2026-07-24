const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const OTP = require('../../models/OTP');
const sendEmail = require('../../utils/sendEmail');

jest.mock('../../models/User');
jest.mock('../../models/OTP');
jest.mock('../../utils/sendEmail');

describe('Password Reset API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/password/send-otp', () => {
    it('should send OTP to registered email', async () => {
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

      const response = await request(app)
        .post('/api/password/send-otp')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'OTP sent to your email');
    });

    it('should return 404 for non-existent email', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/password/send-otp')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('POST /api/password/verify-otp', () => {
    it('should verify valid OTP', async () => {
      OTP.findOne.mockResolvedValue({
        email: 'test@example.com',
        otp: '123456',
      });

      const response = await request(app)
        .post('/api/password/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '123456',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'OTP verified successfully');
    });

    it('should reject invalid OTP', async () => {
      OTP.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/password/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '999999',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid or expired OTP');
    });
  });

  describe('POST /api/password/reset-password', () => {
    it('should reset password with valid data', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'oldpassword',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      OTP.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app)
        .post('/api/password/reset-password')
        .send({
          email: 'test@example.com',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password reset successfully');
      expect(mockUser.save).toHaveBeenCalled();
      expect(OTP.deleteMany).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return 404 for non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/password/reset-password')
        .send({
          email: 'test@example.com',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('Complete Password Reset Flow - Integration', () => {
    it('should complete full password reset process', async () => {
      const email = 'test@example.com';
      const otp = '123456';

      // Step 1: Send OTP
      User.findOne.mockResolvedValue({
        _id: '123',
        email: email,
        name: 'Test User',
      });
      OTP.create.mockResolvedValue({ email, otp });
      sendEmail.mockResolvedValue(true);

      const sendOTPResponse = await request(app)
        .post('/api/password/send-otp')
        .send({ email });

      expect(sendOTPResponse.status).toBe(200);

      // Step 2: Verify OTP
      OTP.findOne.mockResolvedValue({ email, otp });

      const verifyResponse = await request(app)
        .post('/api/password/verify-otp')
        .send({ email, otp });

      expect(verifyResponse.status).toBe(200);

      // Step 3: Reset Password
      const mockUser = {
        _id: '123',
        email: email,
        password: 'oldpassword',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      OTP.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const resetResponse = await request(app)
        .post('/api/password/reset-password')
        .send({
          email,
          newPassword: 'newpassword123',
        });

      expect(resetResponse.status).toBe(200);
      expect(mockUser.password).toBe('newpassword123');
    });
  });
});
