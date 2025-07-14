# CinemaShow

CinemaShow is a full-stack web application for movie ticket booking, featuring user authentication, seat selection, payment integration, and an admin dashboard for managing shows and bookings.

## Features

- Browse and search movies currently showing
- View movie details, cast, and trailers
- Select showtimes and seats for booking
- Secure user authentication via Clerk
- Stripe payment integration for ticket purchases
- Favorite movies management
- Admin dashboard for adding shows, viewing bookings, and analytics
- Automated email notifications and reminders

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Clerk, Axios, React Router
- **Backend:** Node.js, Express, MongoDB, Mongoose, Stripe, Clerk, Inngest, Nodemailer
- **Other:** Email notifications, Webhooks, Cron jobs

## Project Structure

```
CinemaShow/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── configs/
│   ├── inngest/
│   ├── server.js
│   └── .env
├── client/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── .env
├── README.md
```

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB Atlas account
- Clerk account (for authentication)
- Stripe account (for payments)
- SMTP credentials (for email notifications)

### Setup

#### 1. Clone the repository

```sh
git clone https://github.com/yourusername/CinemaShow.git
cd CinemaShow
```

#### 2. Backend Setup

Navigate to `backend/` and install dependencies:

```sh
npm install
```

Create a `.env` file (see `backend/.env` for required variables):

```
PORT=5000
MONGO_URI=your_mongo_uri
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
TMDB_API_KEY=your_tmdb_api_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SENDER_EMAIL=your_email
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

Start the backend server:

```sh
npm start
```

#### 3. Frontend Setup

Navigate to `client/` and install dependencies:

```sh
npm install
```

Create a `.env` file (see `client/.env` for required variables):

```
VITE_CURRENCY='RWF'
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASE_URL=http://localhost:5000
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
```

Start the frontend development server:

```sh
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

- **User:** Browse movies, book tickets, manage favorites, view bookings.
- **Admin:** Login, add new shows, view all bookings, see dashboard analytics.

## Environment Variables

See `.env` files in both `backend/` and `client/` folders for required environment variables.

## License

MIT