const Notification = require("../../models/Notification");
const {
  getMyNotifications,
  markAsRead,
  deleteNotification
} = require("../../controllers/notificationController");

// Mock Notification model
jest.mock("../../models/Notification");

describe("Notification Controller Unit Tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1. Get notifications
  it("should return notifications for logged-in user", async () => {
    const req = {
      user: { _id: "user123" }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Notification.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { message: "Booking confirmed" }
      ])
    });

    await getMyNotifications(req, res);

    expect(Notification.find).toHaveBeenCalledWith({ userId: "user123" });
    expect(res.json).toHaveBeenCalled();
  });

  // ✅ 2. Mark as read
  it("should mark notification as read", async () => {
    const req = {
      params: { id: "notif123" },
      user: { _id: "user123" }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    const mockNotification = {
      userId: "user123",
      isRead: false,
      save: jest.fn().mockResolvedValue({ isRead: true })
    };

    Notification.findById.mockResolvedValue(mockNotification);

    await markAsRead(req, res);

    expect(Notification.findById).toHaveBeenCalledWith("notif123");
    expect(mockNotification.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  // ✅ 3. Delete notification
  it("should delete notification", async () => {
    const req = {
      params: { id: "notif123" },
      user: { _id: "user123" }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    const mockNotification = {
      userId: "user123",
      _id: "notif123"
    };

    Notification.findById.mockResolvedValue(mockNotification);
    Notification.findByIdAndDelete.mockResolvedValue({});

    await deleteNotification(req, res);

    expect(Notification.findById).toHaveBeenCalledWith("notif123");
    expect(Notification.findByIdAndDelete).toHaveBeenCalledWith("notif123");
    expect(res.json).toHaveBeenCalled();
  });
});
