# FitDaily - Full-Stack Beginner Fitness Web App

FitDaily is a beginner-friendly fitness web application designed to help users track their daily water intake, protein, calories burned, steps, workouts, and to-do tasks.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v4, Chart.js, Lucide React, react-hot-toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT stored in httpOnly cookies

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory (already created for you) with:
   ```env
   MONGO_URI=mongodb://localhost:27017/fitdaily
   JWT_SECRET=super_secret_jwt_key_fitdaily
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```
4. Seed the database with workout plans:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

The app will be running at `http://localhost:5173`!

## Features
- Daily Score System based on goals achieved.
- Clean, dark-themed UI with specific metric colors.
- Workout tracker with embedded YouTube instructional videos.
- Progress dashboard with 7-day metric history charts.
- Built-in To-Do list categorized by Fitness, Nutrition, and General tasks.
