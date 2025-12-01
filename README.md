# Renewly - Subscription Management & Renewal Reminder

Renewly is a full-stack web application designed to help users track their subscriptions, monitor spending, and receive timely renewal reminders. With a modern dashboard, detailed analytics, and automated email notifications, Renewly ensures you never miss a payment or lose track of your recurring expenses.

## 🚀 Features

-   **Dashboard Overview:** Get a quick summary of your active subscriptions, total monthly cost, and upcoming renewals.
-   **Subscription Management:** Add, edit, and delete subscriptions with details like cost, renewal date, and frequency.
-   **Categories & Tags:** Organize subscriptions by categories (e.g., Entertainment, Utilities) and custom tags for better filtering.
-   **Analytics & Insights:** Visualize spending trends, category breakdowns, and year-over-year costs with interactive charts.
-   **Automated Reminders:** Receive email notifications before your subscriptions renew (customizable reminder timing).
-   **User Preferences:** Customize notification settings and other user-specific options.
-   **Secure Authentication:** User registration and login with JWT-based authentication.

## 🛠 Tech Stack

### Frontend
-   **Framework:** [React](https://react.dev/) (with [Vite](https://vitejs.dev/))
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Charts:** [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
-   **HTTP Client:** [Axios](https://axios-http.com/)
-   **Utilities:** `date-fns` (Date manipulation), `jspdf` (PDF generation)

### Backend
-   **Runtime:** [Node.js](https://nodejs.org/)
-   **Framework:** [Express.js](https://expressjs.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Database:** [PostgreSQL](https://www.postgresql.org/)
-   **ORM:** [Prisma](https://www.prisma.io/)
-   **Authentication:** JWT (JSON Web Tokens)
-   **Email Service:** [Nodemailer](https://nodemailer.com/)
-   **Scheduling:** `node-cron` for automated tasks

### DevOps & Tools
-   **Docker:** Containerization for backend and database.
-   **pgAdmin:** Database management interface (via Docker).

## 📂 Folder Structure

```
renewly/
├── backend/                # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth and error middleware
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic (Email, Cron)
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema and seeds
│   ├── Dockerfile          # Backend Docker configuration
│   └── docker-compose.yml  # Docker Compose setup
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API integration
│   │   └── types/          # TypeScript definitions
│   └── index.html          # Entry point
└── README.md               # Project documentation
```

## ⚙️ Installation & Setup

### Prerequisites
-   Node.js (v18+ recommended)
-   PostgreSQL (or Docker to run it in a container)
-   npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/renewly.git
cd renewly
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (copy from `.env.example` if available) and configure the following variables:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/renewly?schema=public"
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your_email@example.com"
SMTP_PASS="your_email_password"
FROM_EMAIL="noreply@renewly.com"
FRONTEND_URL="http://localhost:5173"
```

Run database migrations:
```bash
npx prisma migrate dev
```

(Optional) Seed the database:
```bash
npm run db:seed
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:3001/api
```

Start the development server:
```bash
npm run dev
```

### 🐳 Running with Docker
You can run the backend and database using Docker Compose:

```bash
cd backend
docker-compose up -d
```
This will start:
-   **PostgreSQL** on port `5433` (mapped to container 5432)
-   **pgAdmin** on port `8080`
-   **Backend API** on port `3001`

## 📡 API Endpoints

### Authentication
-   `POST /api/auth/register` - Register a new user
-   `POST /api/auth/login` - Login user
-   `POST /api/auth/refresh` - Refresh access token
-   `POST /api/auth/logout` - Logout user

### Subscriptions
-   `GET /api/subscriptions` - Get all subscriptions
-   `POST /api/subscriptions` - Create a subscription
-   `PUT /api/subscriptions/:id` - Update a subscription
-   `DELETE /api/subscriptions/:id` - Delete a subscription

### Categories & Tags
-   `GET /api/categories` - Get all categories
-   `POST /api/categories` - Create a category
-   `DELETE /api/categories/:id` - Delete a category
-   `GET /api/tags` - Get all tags
-   `POST /api/tags` - Create a tag
-   `DELETE /api/tags/:id` - Delete a tag

### Analytics
-   `GET /api/analytics/spending-trends` - Get spending trends data
-   `GET /api/analytics/category-breakdown` - Get spending by category
-   `GET /api/analytics/year-over-year` - Get yearly comparison
-   `GET /api/analytics/upcoming-costs` - Get upcoming renewal costs
-   `GET /api/analytics/insights` - Get spending insights

### User Preferences
-   `GET /api/users/preferences` - Get user notification preferences
-   `PUT /api/users/preferences` - Update preferences

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.