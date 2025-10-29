# BookIt: Experiences & Slots

A fullstack web application for discovering and booking travel experiences. Built with React, TypeScript, Node.js, Express, and PostgreSQL.

## 🚀 Features

- **Experience Discovery**: Browse and search through various travel experiences
- **Slot Management**: View available time slots for each experience
- **Booking System**: Complete booking flow with user information and promo codes
- **Promo Code Validation**: Apply discount codes during checkout
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS
- **Real-time Availability**: Live slot availability updates
- **Booking Confirmation**: Detailed confirmation with receipt download

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate Limiting** for API protection

## 📁 Project Structure

```
bookit-fullstack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── config/             # Database config
│   ├── scripts/            # Database seeding
│   ├── package.json
│   └── index.js
└── package.json            # Root package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookit-fullstack
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb bookit_db
   
   # Or using psql
   psql -U postgres -c "CREATE DATABASE bookit_db;"
   ```

4. **Configure environment variables**
   
   **Backend** (`server/config.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bookit_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key_here
   ```

   **Frontend** (`client/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Initialize the database**
   ```bash
   cd server
   npm run seed
   ```

6. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

## 📊 Database Schema

### Tables

- **experiences**: Store experience information
- **slots**: Store available time slots for each experience
- **bookings**: Store booking information and references
- **promo_codes**: Store promotional codes and their rules

### Sample Data

The seed script creates:
- 6 sample experiences with different categories
- Available slots for the next 30 days
- 4 promotional codes (SAVE10, FLAT100, WELCOME20, EARLYBIRD)

## 🔌 API Endpoints

### Experiences
- `GET /api/experiences` - Get all experiences
- `GET /api/experiences/:id` - Get experience details with slots
- `GET /api/experiences/:id/slots` - Get slots for an experience

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:reference` - Get booking by reference

### Promo Codes
- `POST /api/promo/validate` - Validate a promo code
- `GET /api/promo/codes` - Get all promo codes

### Health
- `GET /api/health` - API health check

## 🎨 Design System

The application follows a consistent design system:

- **Colors**: Primary blue (#3b82f6), Secondary gray scale
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Components**: Reusable button, input, and card components
- **Responsive**: Mobile-first design approach

## 🧪 Testing

### Manual Testing Checklist

- [ ] Experience listing loads correctly
- [ ] Search and filtering works
- [ ] Experience details page displays properly
- [ ] Slot selection works
- [ ] Booking form validation
- [ ] Promo code validation
- [ ] Booking confirmation
- [ ] Responsive design on mobile
- [ ] Error handling for API failures

## 🚀 Deployment

### Backend Deployment (Render/Railway)

1. **Prepare for deployment**
   ```bash
   cd server
   npm install --production
   ```

2. **Environment variables**
   Set the following environment variables:
   - `NODE_ENV=production`
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET`

3. **Database setup**
   - Create PostgreSQL database on your hosting platform
   - Run the seed script to populate initial data

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   cd client
   npm run build
   ```

2. **Environment variables**
   - `VITE_API_URL=https://your-backend-url.com/api`

3. **Deploy**
   - Upload the `dist` folder to your hosting platform
   - Configure environment variables

## 🔧 Development Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run install:all` - Install all dependencies

### Backend (`server/`)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed the database with sample data

### Frontend (`client/`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database exists

2. **API connection errors**
   - Check backend server is running
   - Verify CORS configuration
   - Check API URL in frontend

3. **Build errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify TypeScript configuration

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions:
- Email: support@bookit.com
- Phone: +1 (555) 123-4567

---

**Made with ❤️ for adventure seekers**

