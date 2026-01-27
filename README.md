# 🏨 Rentify - Complete Hospitality Management Platform

A full-stack web application that provides an integrated hospitality ecosystem featuring hotel bookings, food services, and ride management - all in one platform.

## ✨ Features

### 🏢 Hotel Management
- Browse and search hotels with detailed information
- Real-time room availability checking
- Seamless booking with check-in/check-out management
- Room extension capabilities
- Property verification system
- Review and rating system

### 🍽️ Food Services
- In-hotel food ordering system
- Dynamic menu management
- Order tracking and status updates
- Real-time notifications for food preparation
- Vendor dashboard for order management

### 🚗 Ride Services
- Integrated ride request and booking
- Real-time rider tracking with map integration
- Fare estimation
- Driver/Rider dashboard
- Earnings tracking
- Rating system for riders
- Document verification for drivers

### 👨‍💼 Admin Dashboard
- Comprehensive booking control
- User management
- Hotel and property verification
- Finance overview and transaction tracking
- Content Management System (CMS)
- AI-powered analytics
- Notification center
- Pricing rules management

### 🤖 AI-Powered Features
- Smart hotel recommendations
- Predictive analytics for business insights
- Data-driven decision making

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Maps:** Leaflet & React Leaflet
- **Icons:** Lucide React
- **UI Components:** Custom component library

### Backend
- **Language:** PHP 8+
- **Database:** MySQL (MariaDB)
- **Server:** Apache (XAMPP)
- **Architecture:** RESTful API

### Key Features
- JWT-based authentication
- CORS-enabled API
- Transaction management system
- Real-time notifications
- File upload handling
- Session management

## 📁 Project Structure

```
Rentify/
├── api/                      # Backend API endpoints
│   ├── admin/               # Admin management APIs
│   ├── auth/                # Authentication endpoints
│   ├── bookings/            # Booking management
│   ├── food/                # Food service APIs
│   ├── hotels/              # Hotel operations
│   ├── rides/               # Ride management
│   ├── rider/               # Rider-specific endpoints
│   ├── driver/              # Driver operations
│   ├── vendor/              # Vendor dashboard APIs
│   ├── notifications/       # Notification system
│   ├── reviews/             # Review management
│   ├── user/                # User profile management
│   └── ai/                  # AI recommendation engine
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── context/         # React context providers
│   │   └── mobile/          # Mobile-optimized components
│   └── public/              # Static assets
├── assets/                   # Backend assets (images, sounds)
├── logs/                     # Application logs
└── db_conn.php              # Database connection config
```

## 🚀 Installation & Setup

### Prerequisites
- PHP 8.0 or higher
- MySQL/MariaDB 5.7+
- Node.js 18+ and npm
- XAMPP (or similar LAMP/WAMP stack)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/69Alamin/Rentify.git
   cd Rentify
   ```

2. **Configure Database**
   - Create a MySQL database named `rentify_db`
   - Import the database schema (if provided)
   - Update database credentials in `db_conn.php`:
     ```php
     define('DB_HOST', 'localhost');
     define('DB_USER', 'your_username');
     define('DB_PASS', 'your_password');
     define('DB_NAME', 'rentify_db');
     ```

3. **Set up in XAMPP**
   - Copy project to `C:\xampp\htdocs\Rentify`
   - Start Apache and MySQL from XAMPP Control Panel
   - Access backend at `http://localhost/Rentify`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   - Update API base URL in service files to point to your backend

4. **Run development server**
   ```bash
   npm run dev
   ```
   - Frontend will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

## 🗄️ Database Schema

The application uses a MySQL database with the following main tables:
- `users` - User accounts and authentication
- `hotels` - Hotel listings and details
- `bookings` - Booking records
- `rooms` - Room inventory
- `food_menu` - Food items and pricing
- `food_orders` - Food order management
- `rides` - Ride requests and history
- `riders` - Rider profiles and availability
- `notifications` - System notifications
- `reviews` - User reviews and ratings
- `transactions` - Financial transactions

## 🔐 API Authentication

The API uses session-based authentication for most endpoints. Admin routes are protected with middleware authentication.

### Key API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/hotels` - List all hotels
- `POST /api/bookings/create` - Create booking
- `GET /api/food/menu` - Get food menu
- `POST /api/rides/request` - Request a ride
- `GET /api/admin/stats` - Admin statistics (protected)

## 👥 User Roles

1. **Guest/Customer** - Book hotels, order food, request rides
2. **Vendor** - Manage hotel properties, rooms, and food orders
3. **Rider/Driver** - Accept rides, track earnings
4. **Admin** - Full system control and analytics

## 🎨 Features in Detail

### Hotel Booking Flow
1. Browse available hotels
2. View hotel details and amenities
3. Check room availability
4. Complete booking with payment
5. Receive booking confirmation
6. Check-in at property
7. Order food during stay
8. Check-out and review

### Ride Service Flow
1. Request a ride with destination
2. Get fare estimate
3. View available riders
4. Rider accepts request
5. Track ride in real-time
6. Complete ride and rate driver

## 📱 Mobile Responsiveness

The application is fully responsive with dedicated mobile components for optimal user experience across all devices.

## 🔔 Notification System

Real-time notifications for:
- Booking confirmations
- Food order updates
- Ride status changes
- Admin alerts
- System announcements

## 📊 Analytics & Reporting

Admin dashboard provides:
- Booking statistics
- Revenue analytics
- User activity metrics
- AI-powered business insights
- Performance trends

## ⚠️ Limitations & Known Issues

### Current Limitations

1. **Payment Integration**
   - No real payment gateway integration (mock payments only)
   - No PCI compliance implementation
   - Limited transaction security features

2. **Communication System**
   - No email notification system
   - No SMS integration
   - No push notifications for mobile devices

3. **Real-time Features**
   - Limited WebSocket implementation
   - Map updates require manual refresh
   - No live chat support system

4. **Security Concerns**
   - Database credentials stored in plain PHP files
   - Session-based authentication (vulnerable to CSRF)
   - No API rate limiting
   - Limited input validation on some endpoints
   - No encryption for sensitive data at rest

5. **Scalability**
   - No load balancing configuration
   - Single database instance (no replication)
   - No caching layer (Redis/Memcached)
   - Limited horizontal scaling support

6. **Development & Deployment**
   - No automated testing suite (unit/integration tests)
   - No CI/CD pipeline
   - No Docker containerization
   - Manual deployment process
   - No staging environment setup

7. **Application Features**
   - Single language support (no internationalization)
   - No Progressive Web App (PWA) capabilities
   - No native mobile applications
   - Limited offline functionality
   - No data export/import features

8. **Monitoring & Logging**
   - Basic error logging only
   - No centralized logging system
   - No application performance monitoring (APM)
   - No automated backup system
   - Limited analytics tracking

9. **User Experience**
   - No dark mode support
   - Limited accessibility features (WCAG compliance)
   - No advanced search filters
   - Basic recommendation algorithm

10. **API & Documentation**
    - No API versioning
    - Limited API documentation
    - No OpenAPI/Swagger specification
    - No SDK for third-party integration

### Planned Improvements

- [ ] Integrate Stripe/PayPal for payments
- [ ] Add email service (SendGrid/Mailgun)
- [ ] Implement WebSocket for real-time updates
- [ ] Add comprehensive test coverage
- [ ] Implement JWT authentication across all endpoints
- [ ] Add Docker support
- [ ] Create CI/CD pipeline
- [ ] Implement API rate limiting
- [ ] Add multi-language support (i18n)
- [ ] Develop native mobile apps
- [ ] Implement data encryption
- [ ] Add monitoring and alerting system

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Alamin**
- GitHub: [@69Alamin](https://github.com/69Alamin)

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ by Alamin
