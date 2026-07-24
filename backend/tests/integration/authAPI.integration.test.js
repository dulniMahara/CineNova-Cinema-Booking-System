const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require("../../utils/emailService");
// Mock the database connection
jest.mock('../../models/User');

jest.mock("../../utils/emailService");

describe('Auth API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      User.findOne.mockResolvedValue(null);
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        createEmailVerificationToken: jest.fn().mockReturnValue('mock-token'),
        save: jest.fn().mockResolvedValue(true),
      };
      User.create.mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue(true);
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Verification email sent! Please check your email to verify your account.');
    });

    it('should return 400 if email already exists', async () => {
      User.findOne.mockResolvedValue({
        email: 'existing@example.com',
        isEmailVerified: true,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
        it('should not allow login before email verification', async () => {
          const mockUser = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'customer',
            isEmailVerified: false,
            comparePassword: jest.fn().mockResolvedValue(true),
          };

          User.findOne.mockResolvedValue(mockUser);

          const response = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123',
            });

          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty('message', 'Please verify your email before logging in. Check your inbox for the verification link.');
        });

        it('should allow login after email verification', async () => {
          // Simulate user registration
          User.findOne.mockResolvedValue(null);
          const mockUser = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'customer',
            isEmailVerified: false,
            createEmailVerificationToken: jest.fn().mockReturnValue('mock-token'),
            save: jest.fn().mockResolvedValue(true),
          };
          User.create.mockResolvedValue(mockUser);
          sendEmail.mockResolvedValue(true);
          await request(app)
            .post('/api/auth/register')
            .send({
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
            });

          // Simulate email verification
          // Setup verified user with required fields and comparePassword
          const verifiedUser = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'customer',
            isEmailVerified: true,
            comparePassword: jest.fn().mockResolvedValue(true),
          };
          User.findOne.mockResolvedValue(verifiedUser);

          // Attempt login
          const response = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123',
            });

          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('token');
          expect(response.body.user).toHaveProperty('email', 'test@example.com');
        });
    it('should login user with valid credentials', async () => {
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return 401 for wrong password', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
        isEmailVerified: true,      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });

  describe('GET /api/auth/users', () => {
    it('should return all users with admin token', async () => {
      const adminId = 'admin123';
      const mockAdminUser = {
        _id: adminId,
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
      };
      
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@test.com', role: 'customer' },
        { _id: '2', name: 'User 2', email: 'user2@test.com', role: 'admin' },
      ];

      // Mock for middleware authentication
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });
      
      // Mock for controller
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      // Generate admin token
      const adminToken = jwt.sign(
        { id: adminId, role: 'admin' },
        process.env.JWT_SECRET || 'secretkey123'
      );

      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body.users).toHaveLength(2);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile with valid token', async () => {
      const userId = '123';
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock jwt.verify to return the decoded payload
      const jwtSpy = jest.spyOn(jwt, 'verify');
      jwtSpy.mockReturnValue({ id: userId });

      // User without password for middleware
      const userWithoutPassword = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };
      
      // User with save method for controller
      const userToUpdate = {
        ...userWithoutPassword,
        save: jest.fn().mockResolvedValue({ ...userWithoutPassword, name: 'Updated Name' }),
      };

      // Mock User.findById for both middleware (with select) and controller (without select)
      let callCount = 0;
      User.findById.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call from middleware - return object with select method
          return {
            select: jest.fn().mockResolvedValue(userWithoutPassword),
          };
        } else {
          // Second call from controller - return user with save method
          return Promise.resolve(userToUpdate);
        }
      });
      
      User.findOne.mockResolvedValue(null);

      // Generate a valid token with id in payload
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secretkey123');

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Authentication Flow - Integration', () => {
    it('should complete full registration and login flow', async () => {
      // Step 1: Register
      User.findOne.mockResolvedValue(null);
      const mockRegistrationUser = {
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "customer",
        createEmailVerificationToken: jest.fn().mockReturnValue("mock-token"),
        save: jest.fn().mockResolvedValue(true),
      };
      User.create.mockResolvedValue(mockRegistrationUser);
      sendEmail.mockResolvedValue(true);
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      // Step 2: Login
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isEmailVerified: true,        role: 'customer',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body.user.email).toBe('test@example.com');
    });
  });
});
