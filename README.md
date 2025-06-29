# Renewly - Subscription Renewal Reminder App

A privacy-first subscription tracking app that helps users manage recurring subscriptions without linking bank accounts.

## 🎯 Features

- **Privacy-focused**: Manual subscription entry, no bank account linking
- **Smart reminders**: Daily email notifications for upcoming renewals
- **JWT authentication**: Secure access and refresh token system
- **Responsive design**: Works on desktop and mobile devices
- **Real-time updates**: Live dashboard with subscription insights

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL + Prisma
- **Authentication**: JWT with refresh tokens
- **Email**: Nodemailer (Mailtrap for development)
- **Scheduling**: node-cron for daily reminders

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Mailtrap account (for email testing)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd renewly

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database setup

```bash
# Install PostgreSQL (Ubuntu/WSL)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE USER renewly_user WITH PASSWORD 'renewly_password';
CREATE DATABASE renewly_db OWNER renewly_user;
GRANT ALL PRIVILEGES ON DATABASE renewly_db TO renewly_user;
\q

# Or use Docker (alternative)
cd backend
docker-compose up -d
```

### 3. Environment Configuration

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your database and Mailtrap credentials

# Frontend environment (optional)
cd ../frontend
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

### 4. Database Migration and Seeding

```bash
cd backend
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Database Admin** (if using Docker): `http://localhost:8080`

### 🧪 Testing

#### Manual Testing

Register a new account or use demo credentials:

- **Email**: `test@example.com`
- **Password**: `password123`

Add subscriptions with different renewal dates and frequencies

#### Test email reminders:

```bash
cd backend
node -e "require('./src/services/cronService').sendTestReminders()"
```

#### Email Configuration (Mailtrap)

1.  Sign up at [Mailtrap.io](https://mailtrap.io/)
2.  Create an inbox and get SMTP credentials
3.  Update `.env` file with your Mailtrap settings
4.  Test email delivery in Mailtrap inbox

### 📊 Project Structure

```
renewly/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth & validation
│   │   ├── services/       # Email & cron services
│   │   └── utils/          # JWT utilities
│   ├── prisma/             # Database schema & seeds
│   └── package.json
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── pages/          # Route components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API client
│   │   └── App.jsx
│   └── package.json
└── README.md
```

### 🔐 Security Features

- Password hashing with `bcryptjs`
- JWT access tokens (15min expiry) + refresh tokens (7 days)
- CORS protection
- `Helmet.js` security headers
- Input validation and sanitization
- Environment variable configuration

### 🚀 Deployment

#### Backend (Railway/Render)

1.  Connect your GitHub repository
2.  Set environment variables:
    - `DATABASE_URL` (use managed PostgreSQL)
    - `JWT_SECRET` & `JWT_REFRESH_SECRET`
    - `SMTP_*` credentials
3.  Deploy with build command: `npm install && npx prisma migrate deploy`

#### Frontend (Vercel/Netlify)

1.  Connect repository
2.  Set build settings:
    - **Build command**: `npm run build`
    - **Output directory**: `dist`
3.  Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

### 🔧 Development Commands

#### Backend

- `npm run dev` - Start development server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Prisma Studio

#### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### 🐛 Troubleshooting

#### Common Issues

- **Database connection failed**
  - Check PostgreSQL is running: `sudo systemctl status postgresql`
  - Verify `DATABASE_URL` in `.env`
- **Email not sending**
  - Verify Mailtrap credentials
  - Check email service connection: `await emailService.testConnection()`
- **Frontend can't connect to backend**
  - Ensure backend is running on port 3001
  - Check CORS configuration allows frontend URL

#### Logs

- **Backend logs**: Console output shows API requests and cron job status
- **Email logs**: Check Mailtrap inbox for delivered emails
- **Database logs**: Use `npm run db:studio` to inspect data

### 🔮 Future Improvements

- Multiple notification channels (SMS, Push notifications)
- Subscription categories and tagging
- Cost analytics and spending insights
- Mobile app with React Native
- Subscription sharing with family members
- Integration with calendar apps
- Dark mode UI theme
- Export data to CSV/PDF
- Advanced filtering and search
- Bulk subscription management

### 📄 License

[MIT License](LICENSE) - feel free to use this project for personal or commercial purposes.

### 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch: `git checkout -b feature/amazing-feature`
3.  Commit changes: `git commit -m 'Add amazing feature'`
4.  Push to branch: `git push origin feature/amazing-feature`
5.  Open a Pull Request

### 📞 Support

For questions or issues, please open a GitHub issue or contact [your-email@domain.com].