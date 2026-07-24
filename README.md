# Cinema Booking System

A full-stack web application for managing cinema operations, movie bookings, and seat reservations with real-time features and secure payment processing.

## 🎬 Features

- **User Management**: User registration, login, and authentication with JWT
- **Movie Management**: Browse movies with detailed information, ratings, and trailers
- **Seat Selection**: Interactive seat map with real-time availability updates
- **Booking System**: Complete booking workflow with confirmation and history
- **Payment Processing**: Secure payment integration with validation
- **Real-time Updates**: Live seat availability using WebSocket connections
- **Notifications**: Email notifications and in-app messaging system
- **OTP Verification**: Secure two-factor authentication for account security
- **Admin Dashboard**: Administrative features for managing movies, halls, and showtimes
- **Responsive Design**: Mobile-friendly interface with modern UI components

## 🏗️ Architecture

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO for live updates
- **Email**: Nodemailer for notifications
- **Testing**: Jest with comprehensive test coverage
- **Validation**: Express-validator for input sanitization

### Frontend (React)
- **Framework**: React 19 with modern hooks
- **Routing**: React Router DOM for navigation
- **State Management**: React Context API
- **HTTP Client**: Axios for API communication
- **UI Components**: Custom components with React Icons
- **Styling**: CSS modules with responsive design
- **Real-time**: Socket.IO client for live features
- **Testing**: React Testing Library with Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager
- Git for version control

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cinema-booking-system.git
cd cinema-booking-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5001
MONGODB_URI=your-mongodb-connection-string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

## 🏃‍♂️ Running the Application

### Development Mode

**Start Backend Server:**
```bash
cd backend
npm start
```
Backend will run on http://localhost:5001

**Start Frontend Development Server:**
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

### Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Start Production Server:**
```bash
cd backend
NODE_ENV=production npm start
```

## 📊 Database Schema

### Core Entities
- **Users**: Authentication, profiles, and user preferences
- **Movies**: Film information, ratings, posters, and trailers
- **Halls**: Cinema hall configurations and seating layouts
- **Seats**: Individual seat management with real-time status
- **Showtimes**: Movie screening schedules and timing
- **Bookings**: Reservation records and user booking history
- **Payments**: Transaction processing and payment verification
- **Notifications**: System messages and email communications
- **OTP**: One-time password verification records

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Generate coverage report
npm run test:watch         # Watch mode for development
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:ci           # Run tests in CI mode
```

### Coverage Requirements
- **Backend**: 70% minimum coverage for branches, functions, lines, and statements
- **Frontend**: Comprehensive component and integration testing

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🚀 Deployment

### CI/CD Pipeline
The project includes GitHub Actions for automated testing:
- Runs on push to `main` branch
- Executes backend unit and integration tests
- Ensures code quality before deployment

### Production Deployment
1. Update environment variables for production
2. Build the frontend application
3. Deploy backend to your hosting service
4. Serve frontend build files
5. Configure reverse proxy if needed

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie details
- `POST /api/movies` - Create movie (admin)
- `PUT /api/movies/:id` - Update movie (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:userId` - Get user bookings
- `PUT /api/bookings/:id` - Update booking status

### Seats
- `GET /api/seats/showtime/:showtimeId` - Get seat availability
- `PUT /api/seats/reserve` - Reserve seats
- `PUT /api/seats/release` - Release reserved seats

## 🔐 Security Features

- JWT-based authentication with secure token handling
- Password hashing using bcryptjs
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Environment variable protection for sensitive data
- OTP verification for enhanced security
- Rate limiting and request validation

## 🏗️ Project Structure

```
cinema-booking-system/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middleware
│   ├── utils/            # Helper functions
│   ├── tests/            # Test files
│   ├── scripts/          # Database scripts
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── tests/       # Test files
│   └── public/          # Static assets
└── .github/
    └── workflows/       # CI/CD pipelines
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write tests for new features
- Ensure all tests pass before submitting
- Update documentation as needed
- Use meaningful commit messages

## 📄 License

This project is licensed under the ISC License. See the `LICENSE` file for details.

## 👥 Support

For support and questions:
- Create an issue in the GitHub repository
- Review existing documentation
- Check the test files for usage examples

## 🔮 Future Enhancements

- Mobile application development
- Advanced reporting and analytics
- Integration with external payment gateways
- Multi-language support
- Advanced seat selection features
- Loyalty program implementation
- Social media integration
- Enhanced notification system