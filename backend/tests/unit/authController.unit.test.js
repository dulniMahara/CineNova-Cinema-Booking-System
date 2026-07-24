const User = require('../../models/User');
const authController = require('../../controllers/authController');
const jwt = require('jsonwebtoken');
const sendEmail = require("../../utils/emailService");
// Mock the User model
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

jest.mock("../../utils/emailService");describe('Auth Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      userId: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      User.findOne.mockResolvedValue(null);
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        createEmailVerificationToken: jest.fn().mockReturnValue('mock-verification-token'),
        save: jest.fn().mockResolvedValue(true),
      };
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');
      sendEmail.mockResolvedValue(true);
      await authController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Verification email sent! Please check your email to verify your account.',
      });
    });

    it('should return 400 if user already exists', async () => {
      req.body = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      User.findOne.mockResolvedValue({ email: 'existing@example.com', isEmailVerified: true });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User already exists',
      });
    });

    it('should handle errors during registration', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');

      await authController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mock-token',
        user: expect.objectContaining({
          email: 'test@example.com',
        }),
      });
    });

    it('should return 401 for invalid email', async () => {
      req.body = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      User.findOne.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid email or password',
      });
    });

    it('should return 401 for invalid password', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        isEmailVerified: false,
      };

      User.findOne.mockResolvedValue(mockUser);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      req.userId = '123';
      req.body = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null);

      await authController.updateProfile(req, res);

      expect(mockUser.name).toBe('Updated Name');
      expect(mockUser.email).toBe('updated@example.com');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user not found', async () => {
      req.userId = '999';
      req.body = { name: 'Updated Name' };

      User.findById.mockResolvedValue(null);

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 400 if email already in use', async () => {
      req.userId = '123';
      req.body = {
        email: 'existing@example.com',
      };

      const mockUser = {
        _id: '123',
        email: 'test@example.com',
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email already in use',
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@test.com', role: 'customer' },
        { _id: '2', name: 'User 2', email: 'user2@test.com', role: 'admin' },
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      await authController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        users: mockUsers,
      });
    });

    it('should handle errors when fetching users', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await authController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });
});
