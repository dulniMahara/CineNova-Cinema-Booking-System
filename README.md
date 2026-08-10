# 🎬 CineNova Cinema Booking System

CineNova is a full-stack cinema booking and management web application built using the MERN stack.

The system provides separate customer and administrator experiences for browsing movies, scheduling showtimes, managing cinema halls, selecting seats, completing bookings, processing payments, receiving notifications, and monitoring cinema operations.

The application was developed as a university software engineering project with a focus on full-stack development, authentication, role-based access control, persistent booking data, responsive user interfaces, and structured cinema management workflows.

---

## ✨ Features

### 👤 Customer Features

- Customer registration and secure login
- Email verification for newly registered accounts
- JWT-based authentication
- Customer profile management
- Browse Now Showing movies
- Browse Coming Soon movies
- View detailed movie information
- View posters, banners, genres, ratings, descriptions, and trailers
- View actual available showtimes
- Select screening dates and showtimes
- Interactive cinema seat selection
- View cinema hall seating layouts
- Showtime-specific seat availability
- Persistent booked-seat locking
- Multiple seat selection
- Complete cinema booking workflow
- Booking confirmation page
- View booking history through **My Bookings**
- Persistent bookings after logout/login
- Customer payment workflow
- Credit / Debit Card payment option
- Mobile Banking payment option
- Pay at Counter option
- Payment validation
- Customer notifications
- Notification unread-count management
- Persistent notification read status
- Responsive CineNova-themed interface

---

## 🛠️ Administrator Features

CineNova includes a separate protected administrator interface.

### Admin Dashboard

- Cinema operation overview
- Movie statistics
- Hall information
- Showtime information
- Customer information
- Booking information
- Revenue and payment summaries
- Recent cinema activity

### Movie Management

Administrators can:

- Add movies
- Edit movie information
- Delete movies
- Manage movie status
- Change movies between:
  - Now Showing
  - Coming Soon
- Manage movie posters and banners
- Manage trailers
- Update movie genres, ratings, descriptions, and runtime

Movie status changes are reflected on the customer side.

### Showtime Management

Administrators can:

- Create showtimes
- Edit existing showtimes
- Manage screening schedules
- Select movies
- Select cinema halls
- Configure screening dates
- Configure start times
- Configure ticket prices
- Schedule future screenings
- Create future showtimes for Coming Soon movies

Customer Movie Details pages use the actual showtime records created through the administrative system.

### Hall Management

Administrators can:

- Create and manage cinema halls
- Configure hall rows and columns
- Edit cinema seating layouts
- Configure seats and aisles
- View hall layouts
- Automatically calculate hall capacity
- Update existing hall structures

Updated hall layouts are reflected in the customer seat-selection experience.

### User Management

Administrators can:

- View registered customers
- Search customer records
- View account information
- Monitor customer verification status

### Booking Management

Administrators can:

- View customer bookings
- Review booking references
- View customer information
- View movie and showtime information
- View selected seats
- View booking amounts and statuses

### Payment Management

Administrators can:

- Monitor cinema transactions
- View payment records
- Review payment methods
- View revenue information
- Review transaction details

### Admin Notifications

Administrators receive activity notifications related to cinema operations.

The notification interface includes:

- Recent notifications
- Notification badge
- Read/unread status
- Notification dropdown
- Full Notifications page

---

## 🎟️ Booking and Seat Availability

CineNova manages seat availability on a **per-showtime basis**.

This means a physical seat can be available for one screening and booked for another screening without modifying the physical hall structure.

The hall defines the cinema seating layout, while bookings determine which seats are occupied for a particular showtime.

### Booking Flow

```text
Customer
   ↓
Select Movie
   ↓
Select Showtime
   ↓
Select Seats
   ↓
Choose Payment Method
   ↓
Confirm Booking
   ↓
Booking Stored
   ↓
Seats Locked for Selected Showtime
   ↓
Booking Confirmation
```

Once a booking is successfully completed, the selected seats become unavailable for that specific showtime.

---

## 📅 Showtime Architecture

Cinema showtimes stored in MongoDB are used as the main scheduling source.

Admin-created showtimes are displayed on the customer Movie Details page and are used for seat selection and booking.

```text
Admin Showtime Management
           ↓
        MongoDB
           ↓
Customer Movie Details
           ↓
   Showtime Selection
           ↓
      Seat Selection
```

Future screenings can also be created for Coming Soon movies, allowing customers to view scheduled screenings in advance.

---

## 💳 Payment Methods

CineNova currently supports the following booking payment options:

- Credit / Debit Card
- Mobile Banking
- Pay at Counter

The payment forms include input validation, and successful bookings continue to the booking confirmation process.

---

## 🔔 Notification System

CineNova contains separate notification experiences for customers and administrators.

### Customer Notifications

Customers can:

- View notifications
- See unread notification counts
- Open the Notifications page
- Mark viewed notifications as read
- Retain notification read status after refresh and navigation
- Receive new unread notifications when new activity occurs

### Administrator Notifications

Administrators can:

- View recent administrative notifications
- Open the notification dropdown
- View the full Admin Notifications page
- Monitor cinema-related activity
- View read and unread notification states

---

## 🔐 Authentication and Authorization

CineNova uses JWT-based authentication.

The system supports role-based access for:

- Customers
- Administrators

Protected frontend routes help prevent unauthorized navigation, while protected backend routes enforce authorization for sensitive operations.

Administrator-only operations include:

- Movie management
- Showtime management
- Hall management
- User management
- Booking management
- Payment management
- Administrative notifications

Passwords are securely hashed before being stored.

---

## 📧 Email Verification

Newly registered customer accounts support email verification.

A verification email is sent after registration so that the customer can verify the account before continuing to use the system.

Sensitive email credentials, JWT secrets, database credentials, and other private configuration values are stored using environment variables and should never be committed to GitHub.

---

## 🏗️ Technology Stack

### Frontend

- React
- JavaScript
- React Router DOM
- Axios
- React Icons
- HTML5
- CSS3
- Responsive Web Design

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens
- bcrypt / bcryptjs
- Nodemailer
- REST APIs

### Development and Testing Tools

- Git
- GitHub
- npm
- MongoDB
- Jest
- React Testing Library
- GitHub Actions

---

## 📁 Project Structure

```text
CineNova-Cinema-Booking-System/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── seed/
│   ├── tests/
│   ├── utils/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │
│   └── src/
│       ├── components/
│       ├── pages/
│       │   ├── admin/
│       │   └── customers/
│       ├── services/
│       ├── tests/
│       ├── utils/
│       └── App.js
│
├── .github/
│   └── workflows/
│
└── README.md
```

---

## ⚙️ Prerequisites

Before running CineNova, install:

- Node.js
- npm
- MongoDB or create a MongoDB Atlas account
- Git

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dulniMahara/CineNova-Cinema-Booking-System.git
cd CineNova-Cinema-Booking-System
```

---

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
npm start
```

The backend runs locally on:

```text
http://localhost:5001
```

---

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm start
```

The frontend runs locally on:

```text
http://localhost:3000
```

---

## 🌐 Local Application URLs

### Customer Application

```text
http://localhost:3000
```

### Admin Login

```text
http://localhost:3000/admin-login
```

### Backend API

```text
http://localhost:5001/api
```

---

## 🗄️ Main Database Entities

CineNova manages data for the following main entities:

- Users
- Movies
- Cinema Halls
- Showtimes
- Bookings
- Payments
- Notifications

These entities work together to manage movie schedules, cinema seating layouts, customer bookings, transactions, and application activity.

---

## 🧪 Testing

The project includes frontend and backend tests for important application functionality.

Examples include:

- Hall route integration testing
- Notification controller unit testing
- Movie Details testing
- Showtime Manager testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

The exact available test scripts can be found inside the relevant `package.json` files.

---

## 🔄 CI Pipeline

The GitHub repository includes GitHub Actions workflows for automated project checks.

The CI workflow helps verify backend functionality when changes are pushed to the repository.

This provides an additional layer of automated testing during development.

---

## 🛡️ Security Practices

CineNova applies several security practices, including:

- JWT authentication
- Role-based authorization
- Password hashing
- Protected administrator routes
- Backend authorization checks
- Environment variables for sensitive configuration
- Input validation
- Email account verification

Sensitive information such as passwords, database credentials, JWT secrets, email App Passwords, and API keys should never be committed to source control.

---

## 🎨 User Interface

CineNova uses a custom cinema-inspired interface.

The application design includes:

- Dark backgrounds
- Deep green surfaces
- Emerald green accents
- High-contrast text
- Responsive layouts
- Consistent customer and administrator interfaces
- Movie poster and banner presentation
- Interactive seating layouts
- Responsive management tables and forms

The administrator interface focuses on cinema management, while the customer interface focuses on movie discovery, booking, payments, and booking history.

---

## 📸 Screenshots

Screenshots of the completed application can be added to this section.

### Recommended Customer Screenshots

- Customer Home Page
- Now Showing Movies
- Coming Soon Movies
- Movie Details
- Showtime Selection
- Seat Selection
- Payment Page
- Booking Confirmation
- My Bookings
- Customer Notifications

### Recommended Administrator Screenshots

- Admin Dashboard
- Movie Management
- Showtime Management
- Hall Management
- User Management
- Booking Management
- Payment Management
- Admin Notifications

Example image syntax:

```markdown
![CineNova Customer Home](docs/screenshots/customer-home.png)
```

---

## 🔮 Future Improvements

Possible future improvements for CineNova include:

- Integration with a production payment gateway
- QR-code cinema tickets
- Digital ticket scanning
- Advanced revenue analytics
- Detailed cinema reports and charts
- Promotional codes
- Loyalty rewards
- Multi-cinema or branch support
- Mobile application development
- Multi-language support
- Automated booking reminders
- Additional notification delivery options

---

## 🎓 Academic Project

CineNova was developed as a university software engineering project.

The project demonstrates practical implementation of:

- Full-stack web development
- REST API development
- Database design
- Authentication
- Authorization
- React application development
- Node.js and Express backend development
- MongoDB integration
- Cinema booking workflows
- Payment workflows
- Software testing
- Version control using Git and GitHub
- CI workflows
- Responsive user interface development

---

## 💻 Development Process

The project was developed incrementally using Git for version control.

Development activities included:

- Feature implementation
- Frontend and backend integration
- Authentication implementation
- Cinema hall and seat-layout development
- Showtime scheduling
- Booking and payment implementation
- Notification development
- Testing
- Bug fixing
- User interface refinement
- Database synchronization
- Documentation

---

## 📄 License

This project is intended primarily for educational and academic use.