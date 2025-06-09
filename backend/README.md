markdown

# Renewly Backend

Subscription renewal reminder backend API built with Node.js, Express, PostgreSQL, and Prisma.

## Features

- JWT-based authentication with refresh tokens
- CRUD operations for subscriptions
- Daily email reminders via cron jobs
- PostgreSQL database with Prisma ORM
- Email service with Nodemailer

## Setup

1. Install dependencies:
   ```bash
   npm install
Set up environment variables:

bash

cp .env.example .env
# Edit .env with your database and email credentials
Set up database:

bash

npm run db:migrate
npm run db:seed
Start the server:

bash

npm run dev


## API Endpoints

- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Logout user
- GET /api/subscriptions - Get user subscriptions
- POST /api/subscriptions - Create subscription
- PUT /api/subscriptions/:id - Update subscription
- DELETE /api/subscriptions/:id - Delete subscription

## Scripts

- npm start - Start production server
- npm run dev - Start development server with nodemon
- npm run db:migrate - Run database migrations
- npm run db:seed - Seed database with test data
- npm run db:studio - Open Prisma Studio