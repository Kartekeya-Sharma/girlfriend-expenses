# Girlfriend's Finance Tracker

A beautiful and functional finance tracking application with a dark and girly theme.

## Features

- Track expenses with categories and remarks
- Record income from shoots
- View savings overview with a pie chart
- Beautiful dark theme with pink accents
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/girlfriend-expenses
   ```

## Running the Application

1. Start the MongoDB server
2. Start the backend server:
   ```bash
   npm run dev
   ```
3. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   ```

The application will be available at `http://localhost:3000`

## Technologies Used

- Frontend:

  - React
  - Material-UI
  - Chart.js
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose

## Deployment on Vercel

1. Push your changes to GitHub.
2. Log in to [Vercel](https://vercel.com/) and import your GitHub repository.
3. Configure the following environment variables in Vercel:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `PORT`: The port your server should run on (e.g., `5000`).
4. Deploy your project on Vercel.

The application will be available at the URL provided by Vercel.
