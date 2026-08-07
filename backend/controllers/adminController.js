const Movie = require("../models/movie");
const Showtime = require("../models/Showtime");
const Hall = require("../models/Hall");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

exports.getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();

    // 1. Local Date Range for Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Summary Metrics (Parallel DB queries)
    const [
      totalMovies,
      upcomingShowtimesCount,
      totalHalls,
      totalCustomers,
      todayBookingsCount,
      todayPayments
    ] = await Promise.all([
      Movie.countDocuments().catch(() => 0),
      Showtime.countDocuments({ date: { $gte: startOfDay } }).catch(() => 0),
      Hall.countDocuments().catch(() => 0),
      User.countDocuments({ role: { $ne: 'admin' } }).catch(() => 0),
      Booking.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).catch(() => 0),
      Payment.find({
        status: 'Completed',
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).select('amount').catch(() => [])
    ]);

    const todayRevenue = (todayPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    // 3. Recent Bookings (Top 6)
    let recentBookings = [];
    try {
      const recentBookingsRaw = await Booking.find()
        .populate('userId', 'name email')
        .populate({
          path: 'showtimeId',
          populate: { path: 'movie', select: 'title poster posterUrl' }
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

      recentBookings = (recentBookingsRaw || []).map((b) => {
        const movieObj = b.showtimeId?.movie;
        const movieTitle = movieObj?.title || b.movieTitle || 'Movie Screening';
        const moviePoster = movieObj?.poster || movieObj?.posterUrl || '';
        const customerName = b.userId?.name || b.customerName || 'Customer';
        const customerEmail = b.userId?.email || b.customerEmail || 'N/A';
        const bRef = b.bookingReference || (b._id ? `#CN-${b._id.toString().slice(-6).toUpperCase()}` : 'N/A');

        return {
          _id: b._id,
          bookingReference: bRef,
          customerName,
          customerEmail,
          movieTitle,
          moviePoster,
          amount: b.totalPrice || b.amount || 0,
          status: b.status || 'Confirmed',
          createdAt: b.createdAt
        };
      });
    } catch (bErr) {
      console.error("Error populating recent bookings:", bErr);
    }

    // 4. Upcoming Showtimes (Top 6 chronologically)
    let upcomingShowtimes = [];
    try {
      const upcomingShowtimesRaw = await Showtime.find({ date: { $gte: startOfDay } })
        .populate('movie', 'title poster posterUrl')
        .populate('hall', 'name capacity')
        .sort({ date: 1, startTime: 1 })
        .limit(6)
        .lean();

      upcomingShowtimes = (upcomingShowtimesRaw || []).map((s) => {
        const movieObj = s.movie;
        const hallObj = s.hall;
        const movieTitle = movieObj?.title || 'Upcoming Screening';
        const moviePoster = movieObj?.poster || movieObj?.posterUrl || '';
        const hallName = hallObj?.name || s.cinemaHall || 'Cinema Hall';

        return {
          _id: s._id,
          movieTitle,
          moviePoster,
          hallName,
          date: s.date || (s.startTime ? new Date(s.startTime).toISOString().split('T')[0] : 'N/A'),
          startTime: s.startTime || s.time || '12:00 PM',
          ticketPrice: s.price || s.ticketPrice || 0,
          status: s.status || 'Active'
        };
      });
    } catch (sErr) {
      console.error("Error populating upcoming showtimes:", sErr);
    }

    // 5. Payment Status Overview
    const allPayments = await Payment.find().select('status amount').lean();
    const paymentStatusSummary = {
      Completed: 0,
      Pending: 0,
      Failed: 0,
      Cancelled: 0,
      Refunded: 0
    };

    allPayments.forEach((p) => {
      const st = p.status || 'Completed';
      if (paymentStatusSummary[st] !== undefined) {
        paymentStatusSummary[st] += 1;
      } else {
        paymentStatusSummary[st] = 1;
      }
    });

    // 6. Last 7 Days Revenue & Booking Breakdown
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date();
      dayEnd.setDate(dayEnd.getDate() - i);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLabel = dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      // Revenue for day (Completed payments only)
      const dayPayments = await Payment.find({
        status: 'Completed',
        createdAt: { $gte: dayStart, $lte: dayEnd }
      }).select('amount').lean();

      const dayRevenue = dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Bookings count for day
      const dayBookingsCount = await Booking.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      weeklyData.push({
        dayLabel,
        revenue: dayRevenue,
        bookings: dayBookingsCount
      });
    }

    // 7. Real Operational Alerts
    const operationalAlerts = [];

    if (paymentStatusSummary.Failed > 0) {
      operationalAlerts.push({
        type: 'warning',
        message: `${paymentStatusSummary.Failed} failed payment(s) require attention.`
      });
    }

    if (paymentStatusSummary.Pending > 0) {
      operationalAlerts.push({
        type: 'info',
        message: `${paymentStatusSummary.Pending} pending payment transaction(s) awaiting completion.`
      });
    }

    const moviesMissingPostersCount = await Movie.countDocuments({
      $or: [{ poster: { $exists: false } }, { poster: '' }, { poster: null }]
    });

    if (moviesMissingPostersCount > 0) {
      operationalAlerts.push({
        type: 'info',
        message: `${moviesMissingPostersCount} movie(s) missing poster image artwork.`
      });
    }

    // 8. Recent Customers (Top 5 registered customers - Safe fields only)
    const recentCustomersRaw = await User.find({ role: { $ne: 'admin' } })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      summary: {
        totalMovies,
        upcomingShowtimes: upcomingShowtimesCount,
        totalHalls,
        totalCustomers,
        todayBookings: todayBookingsCount,
        todayRevenue
      },
      recentBookings,
      upcomingShowtimes,
      paymentStatusSummary,
      weeklyData,
      operationalAlerts,
      recentCustomers: recentCustomersRaw
    });
  } catch (error) {
    console.error("Error generating admin dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load dashboard metrics. Please try again."
    });
  }
};
