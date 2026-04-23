import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkoutPlan from './models/WorkoutPlan.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitdaily')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

const workoutSeedData = [
  {
    day: 'Monday',
    title: 'Upper Body',
    estimatedCaloriesBurn: 280,
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 15, videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4' },
      { name: 'Dumbbell Rows', sets: 3, reps: 12, videoUrl: 'https://www.youtube.com/embed/roCP6wCXPqo' },
      { name: 'Shoulder Press', sets: 3, reps: 12, videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog' }
    ]
  },
  {
    day: 'Tuesday',
    title: 'Legs & Core',
    estimatedCaloriesBurn: 320,
    exercises: [
      { name: 'Squats', sets: 3, reps: 20, videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U' },
      { name: 'Lunges', sets: 3, reps: 12, videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U' },
      { name: 'Plank', time: '45sec', sets: 3, videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw' }
    ]
  },
  {
    day: 'Wednesday',
    title: 'Rest / Light Cardio',
    estimatedCaloriesBurn: 150,
    exercises: [
      { name: 'Walk 20 min', sets: 1, reps: 1, videoUrl: 'https://www.youtube.com/embed/njeZ29umqVE' }
    ]
  },
  {
    day: 'Thursday',
    title: 'Upper Body',
    estimatedCaloriesBurn: 260,
    exercises: [
      { name: 'Tricep Dips', sets: 3, reps: 15, videoUrl: 'https://www.youtube.com/embed/-sZE8E9rR5o' },
      { name: 'Bicep Curls', sets: 3, reps: 12, videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo' },
      { name: 'Push-ups Wide', sets: 3, reps: 12, videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4' }
    ]
  },
  {
    day: 'Friday',
    title: 'Legs & Core',
    estimatedCaloriesBurn: 340,
    exercises: [
      { name: 'Deadlifts', sets: 3, reps: 12, videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q' },
      { name: 'Crunches', sets: 3, reps: 20, videoUrl: 'https://www.youtube.com/embed/Xyd_fa5zoEU' },
      { name: 'Mountain Climbers', sets: 3, reps: 30, videoUrl: 'https://www.youtube.com/embed/nmwgirgXLYM' }
    ]
  },
  {
    day: 'Saturday',
    title: 'Full Body',
    estimatedCaloriesBurn: 400,
    exercises: [
      { name: 'Burpees', sets: 3, reps: 10, videoUrl: 'https://www.youtube.com/embed/dZgVxmf6jkA' },
      { name: 'Jump Squats', sets: 3, reps: 15, videoUrl: 'https://www.youtube.com/embed/A-cFYWvaHr0' },
      { name: 'Superman', sets: 3, reps: 15, videoUrl: 'https://www.youtube.com/embed/z6PJMT2y8GQ' }
    ]
  },
  {
    day: 'Sunday',
    title: 'Rest',
    estimatedCaloriesBurn: 80,
    exercises: [
      { name: 'Stretching', time: '10min', sets: 1, videoUrl: 'https://www.youtube.com/embed/sTANio_2E0Q' }
    ]
  }
];

const seedDB = async () => {
  try {
    await WorkoutPlan.deleteMany({});
    console.log('Cleared existing workout plans.');

    await WorkoutPlan.insertMany(workoutSeedData);
    console.log('Workout plans seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
