const request = require("supertest");
const mongoose = require("mongoose");
const {MongoMemoryServer} = require("mongodb-memory-server");
const app = require("../../app");

const User = require("../../models/User");
const Notification = require("../../models/Notification");

let mongoServer;
let token;
let userId;
let notificationId;

// ⏱ Increase timeout for integration tests
jest.setTimeout(60000);

beforeAll(async () => {
  // ✅ CONNECT TO IN-MEMORY DATABASE
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.disconnect();
  await mongoose.connect(uri);

  // Clean test data
  await User.deleteMany({});
  await Notification.deleteMany({});

  // Create test user
  const user = await User.create({
    name: "Notify Test User",
    email: "notify@test.com",
    password: "password123",
    isEmailVerified: true
  });

  userId = user._id;
  // Login to get JWT token
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "notify@test.com",
      password: "password123"
    });

  token = res.body.token;

  // Create test notification
  const notification = await Notification.create({
    userId,
    message: "Test notification message"
  });

  notificationId = notification._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Notification.deleteMany({});
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("🔔 Notification Integration Tests", () => {

  test("GET /api/notifications/my - fetch user notifications", async () => {
    const res = await request(app)
      .get("/api/notifications/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].message).toBe("Test notification message");
  });

  test("PUT /api/notifications/:id/read - mark as read", async () => {
    const res = await request(app)
      .put(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.isRead).toBe(true);
  });

  test("DELETE /api/notifications/:id - delete notification", async () => {
    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Notification removed");
  });

});
