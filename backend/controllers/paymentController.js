const Payment = require('../models/Payment');
const Booking = require('../models/Booking'); 
const Showtime = require('../models/Showtime'); // <--- 1. IMPORT SHOWTIME MODEL
const Seat = require('../models/Seat'); // Import Seat model
const sendEmail = require('../utils/emailService');
const Notification = require('../models/Notification'); // <--- Ensure this is imported

// @desc    Create Booking AND Process Payment together
// @route   POST /api/payments
// @access  Private
exports.processPayment = async (req, res) => {
    try {
        console.log("1. Payment Request Received:", req.body);

        let { bookingId, showtimeId, seats, amount, paymentMethod, cardLast4 } = req.body;

        // --- SCENARIO A: Creating a New Booking (The "Member 7" Way) ---
        if (!bookingId) {
            console.log("2. Creating new booking...");
            
            // Validate
            if (!showtimeId || !seats || seats.length === 0) {
                return res.status(400).json({ message: "Missing booking details (showtimeId or seats)." });
            }

            // Fetch actual seat details to store permanently
            const seatObjects = await Seat.find({ _id: { $in: seats } });
            const seatDetails = seatObjects.map(s => ({
                row: s.row,
                number: s.number,
                price: s.price,
                seatId: s._id
            }));

            // A. Create the Booking Receipt
            const newBooking = new Booking({
                userId: req.user._id,
                showtimeId,
                seatIds: seats,  // FIX: Use seatIds instead of seats
                seatDetails,     // FIX: Store seat details permanently
                totalPrice: amount,
                status: 'Confirmed' 
            });

            const savedBooking = await newBooking.save();
            bookingId = savedBooking._id; 
            console.log("3. New Booking Created:", bookingId);

            // B. CRITICAL: Update the Showtime to mark seats as "Booked"
             // This prevents other people from booking the same seats!
            await Showtime.findByIdAndUpdate(showtimeId, {
                $push: { bookedSeats: { $each: seats } } 
            });
            console.log("4. Seats marked as booked in Showtime:", seats);
        }

        // --- SCENARIO B: Processing the Payment ---
        console.log("5. Processing Payment...");

        const payment = new Payment({
            userId: req.user._id,
            bookingId: bookingId, 
            amount,
            paymentMethod: paymentMethod || 'Credit Card',
            cardLast4: cardLast4 || '0000',
            status: 'Completed'
        });

        const createdPayment = await payment.save();
        console.log("6. Payment Saved:", createdPayment._id);

        // --- 🔔 MEMBER 8 INTEGRATION: SEND NOTIFICATION ---
        try {
            // 1. Create Notification in Database
            const notifMessage = `Payment Successful! Booking Confirmed. (Payment ID: ${createdPayment._id})`;
            const notification = await Notification.create({
                userId: req.user._id,
                message: notifMessage
            });

            // 2. Send Real-Time Alert via Socket.IO
            const io = req.app.get('io');
            const onlineUsers = req.app.get('onlineUsers');
            const strUserId = String(req.user._id); // Force string matching

            if (onlineUsers && onlineUsers.has(strUserId)) {
                const socketId = onlineUsers.get(strUserId);
                io.to(socketId).emit('receive_notification', notification);
                console.log(`🔔 Notification SENT to User ${strUserId}`);
            } else {
                console.log(`⚠️ Notification saved, but User ${strUserId} is offline.`);
            }
        } catch (notifError) {
            console.error("Notification Error (Non-blocking):", notifError.message);
        }
        // --- 🔔 END INTEGRATION ---


        // --- SCENARIO C: Send Confirmation Email ---
        const fullBooking = await Booking.findById(bookingId)
            .populate({
                path: 'showtimeId',
                populate: { path: 'movie', select: 'title' }
            });

        if (fullBooking) {
            const movieTitle = fullBooking.showtimeId?.movie?.title || "Movie Ticket";
            
            // Handle seats display - use seatDetails first, then seatIds
            let seatDisplay = "General";
            if (fullBooking.seatDetails && fullBooking.seatDetails.length > 0) {
                seatDisplay = fullBooking.seatDetails.map(s => `${s.row}${s.number}`).join(', ');
            } else if (fullBooking.seatIds && fullBooking.seatIds.length > 0) {
                seatDisplay = fullBooking.seatIds.map(s => 
                    (typeof s === 'object' && s.row) ? `${s.row}${s.number}` : s
                ).join(', ');
            }

            const message = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      background-color: #141436;
                    }
                    .email-container {
                      max-width: 600px;
                      margin: 40px auto;
                      background: linear-gradient(135deg, #1a1a3e 0%, #2d2d5f 100%);
                      border-radius: 20px;
                      overflow: hidden;
                      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                      border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .email-header {
                      background: linear-gradient(135deg, #141436 0%, #1a1a3e 100%);
                      padding: 40px 30px;
                      text-align: center;
                      border-bottom: 2px solid rgba(255, 61, 0, 0.3);
                    }
                    .logo {
                      font-size: 32px;
                      font-weight: 800;
                      color: #ffffff;
                      margin: 0;
                      background: linear-gradient(135deg, #fff 0%, #ff3d00 100%);
                      -webkit-background-clip: text;
                      -webkit-text-fill-color: transparent;
                      background-clip: text;
                    }
                    .email-body {
                      padding: 50px 40px;
                      color: #ffffff;
                    }
                    .greeting {
                      font-size: 24px;
                      font-weight: 600;
                      margin-bottom: 20px;
                      color: #ffffff;
                    }
                    .message {
                      font-size: 16px;
                      line-height: 1.6;
                      color: #cccccc;
                      margin-bottom: 30px;
                    }
                    .success-badge {
                      display: inline-block;
                      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                      color: #ffffff;
                      padding: 12px 30px;
                      border-radius: 25px;
                      font-size: 16px;
                      font-weight: 700;
                      margin-bottom: 30px;
                    }
                    .booking-details {
                      background: rgba(255, 61, 0, 0.1);
                      border: 2px solid rgba(255, 61, 0, 0.5);
                      border-radius: 15px;
                      padding: 30px;
                      margin: 30px 0;
                    }
                    .detail-row {
                      padding: 18px 0;
                      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .detail-row:last-child {
                      border-bottom: none;
                    }
                    .detail-label {
                      font-size: 13px;
                      color: #cccccc;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      display: block;
                      margin-bottom: 8px;
                    }
                    .detail-value {
                      font-size: 18px;
                      color: #ffffff;
                      font-weight: 700;
                      display: block;
                    }
                    .amount-highlight {
                      color: #ff3d00;
                      font-size: 18px;
                    }
                    .movie-title {
                      font-size: 22px;
                      color: #ff3d00;
                      font-weight: 700;
                      margin-bottom: 20px;
                      text-align: center;
                    }
                    .enjoy-message {
                      background: rgba(255, 255, 255, 0.05);
                      border-left: 4px solid #ff3d00;
                      padding: 20px;
                      border-radius: 8px;
                      margin-top: 30px;
                      text-align: center;
                    }
                    .enjoy-text {
                      font-size: 18px;
                      color: #ffffff;
                      font-weight: 600;
                    }
                    .email-footer {
                      background: linear-gradient(135deg, #0f0f2e 0%, #141436 100%);
                      padding: 30px;
                      text-align: center;
                      border-top: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .footer-text {
                      font-size: 14px;
                      color: #888888;
                      margin: 5px 0;
                    }
                    .footer-brand {
                      font-size: 18px;
                      font-weight: 700;
                      color: #ff3d00;
                      margin-top: 15px;
                    }
                  </style>
                </head>
                <body>
                  <div class="email-container">
                    <div class="email-header">
                      <h1 class="logo">🎬 Cinema Booking</h1>
                    </div>
                    
                    <div class="email-body">
                      <div style="text-align: center;">
                        <div class="success-badge">✓ Payment Successful</div>
                      </div>
                      
                      <h2 class="greeting">Hi ${req.user.name}!</h2>
                      
                      <p class="message">
                        Your booking has been confirmed and payment processed successfully. Get ready for an amazing movie experience!
                      </p>
                      
                      <div class="movie-title">🎥 ${movieTitle}</div>
                      
                      <div class="booking-details">
                        <div class="detail-row">
                          <div class="detail-label">Seats</div>
                          <div class="detail-value">${seatDisplay}</div>
                        </div>
                        <div class="detail-row">
                          <div class="detail-label">Amount Paid</div>
                          <div class="detail-value amount-highlight">Rs. ${amount.toLocaleString()}</div>
                        </div>
                        <div class="detail-row">
                          <div class="detail-label">Payment Reference</div>
                          <div class="detail-value" style="font-size: 14px; word-break: break-all;">${createdPayment._id}</div>
                        </div>
                      </div>
                      
                      <div class="enjoy-message">
                        <div class="enjoy-text">🍿 Enjoy the movie!</div>
                      </div>
                      
                      <p class="message" style="margin-top: 30px; font-size: 14px;">
                        Please show this confirmation email or your booking reference at the cinema counter to collect your tickets.
                      </p>
                    </div>
                    
                    <div class="email-footer">
                      <p class="footer-text">This is an automated message, please do not reply.</p>
                      <p class="footer-text">© 2026 Cinema Booking System | All Rights Reserved</p>
                      <div class="footer-brand">Cinema Booking</div>
                    </div>
                  </div>
                </body>
                </html>
            `;

            try {
                await sendEmail({
                    email: req.user.email,
                    subject: `Booking Confirmed: ${movieTitle}`,
                    html: message
                });
            } catch (emailError) {
                console.error("Email failed:", emailError);
            }
        }

        res.status(201).json({ 
            success: true,
            payment: createdPayment, 
            booking: fullBooking 
        });

    } catch (error) {
        console.error("PAYMENT ERROR:", error);
        res.status(500).json({ message: 'Payment processing failed', error: error.message });
    }
};

// --- KEEP OTHER FUNCTIONS ---
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 })
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'showtimeId',
                    populate: { path: 'movie', select: 'title' }
                }
            });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email')
            .populate('bookingId', 'totalPrice status bookingReference')
            .sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all payments' });
    }
};

exports.deleteMyPayments = async (req, res) => {
    try {
        await Payment.deleteMany({ userId: req.user._id });
        res.json({ message: "Your payment history has been cleared." });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};