import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "./components/PageLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import MovieList from "./pages/customers/MovieList";
import MovieDetails from "./pages/customers/MovieDetails";
import Home from "./pages/customers/Home";
import AboutUs from "./pages/customers/AboutUs";
import MovieManager from "./pages/admin/MovieManager";
import AddMovieForm from "./pages/admin/AddMovieForm";
import EditMovieForm from "./pages/admin/EditMovieForm";
import Login from "./pages/customers/Login";
import Register from "./pages/customers/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/customers/ForgotPassword";
import ResetPassword from "./pages/customers/ResetPassword";
import ConfirmPassword from "./pages/customers/ConfirmPassword";
import UsersList from "./pages/admin/UsersList";
import { SearchProvider } from "./context/SearchContext";
import ShowtimeManager from "./pages/admin/ShowtimeManager";
import AddShowtimeForm from "./pages/admin/AddShowtimeForm";
import EditShowtimeForm from "./pages/admin/EditShowtimeForm";
import ShowtimeSelection from "./pages/customers/ShowtimeSelection";
import HallManager from './pages/admin/HallManager';
import AdminBookings from './pages/admin/AdminBookings';
import SeatSelection from './SeatSelection';
import BookingSuccess from './pages/BookingSuccess';
import CreateBookingPage from './pages/CreateBookingPage';
import MyBookingPage from './pages/MyBookingsPage';
import './pages/Booking.css';
import PaymentPage from './pages/PaymentPage';
import AdminPayments from './pages/admin/AdminPayments';
import PaymentHistory from './pages/PaymentHistory';
import Notifications from "./pages/customers/Notifications";
import EmailVerification from "./pages/EmailVerification";
import ResendVerification from "./pages/ResendVerification";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './ToastStyles.css';

function App() {
  const role = localStorage.getItem("role"); 

  return (
    <SearchProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        
        {/* --- Notification Popup Container --- */}
        <ToastContainer 
          position="top-right"
          autoClose={4000}
          theme="dark"
          newestOnTop={true}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 99999999, fontSize: '16px' }} 
        />

        <Routes>
          <Route
            path="/"
            element={
              role === "admin" ? (
                <Navigate to="/admin/movies" />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/home"
            element={
              <PageLayout>
                <Home />
              </PageLayout>
            }
          />
          <Route
            path="/movies"
            element={
              <PageLayout>
                <MovieList />
              </PageLayout>
            }
          />
          <Route
            path="/movies/:id"
            element={
              <PageLayout>
                <MovieDetails />
              </PageLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PageLayout>
                <AboutUs />
              </PageLayout>
            }
          />

          <Route
            path="/admin/movies"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <MovieManager />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/movies/add"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <AddMovieForm />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/movies/edit/:id"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <EditMovieForm />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <UsersList />
                </PageLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm-password" element={<ConfirmPassword />} />
          <Route path="/seats" element={<SeatSelection />} />
          <Route path="/booking/:showtimeId" element={<SeatSelection />} />
          <Route path="/create-booking" element={<CreateBookingPage />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingPage /></ProtectedRoute>} />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageLayout>
                  <Profile />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          {/*Admin Bookings Route */}
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <AdminBookings />
                </PageLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <PageLayout>
                <h2>Page not found</h2>
              </PageLayout>
            }
          />

          <Route
            path="/admin/showtimes"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <ShowtimeManager />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/showtimes/add"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <AddShowtimeForm />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/showtimes/edit/:id"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <EditShowtimeForm />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/buy-tickets/:movieId" 
            element={
              <PageLayout>
              <ShowtimeSelection />
              </PageLayout>
            } 
          />
          <Route path="/admin/halls"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                   <HallManager />
                </PageLayout>
              </ProtectedRoute>
            } 
           />
           <Route path="/payment/:bookingId" 
            element={
              <ProtectedRoute>
                <PageLayout>
                   <PaymentPage />
                </PageLayout>
              </ProtectedRoute>
            } 
           />
           <Route path="/payments" 
             element={
               <ProtectedRoute roleRequired="admin">
                   <AdminPayments />
               </ProtectedRoute>
             } 
           />

           <Route path="/my-payments" 
             element={
               <ProtectedRoute>
                 <PaymentHistory />
               </ProtectedRoute>
             } 
           />

           {/* --- NEW ROUTE (Added at end to preserve order) --- */}
           <Route 
             path="/notifications" 
             element={
               <ProtectedRoute>
                 <PageLayout>
                   <Notifications />
                 </PageLayout>
               </ProtectedRoute>
             } 
           />
          
        </Routes>
      </Router>
    </SearchProvider>
  );
}

export default App;