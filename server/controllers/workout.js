import WorkoutPlan from '../models/WorkoutPlan.js';
import dayjs from 'dayjs';

export const getTodayWorkout = async (req, res) => {
  const dayOfWeek = dayjs().format('dddd');
  
  try {
    const workout = await WorkoutPlan.findOne({ day: dayOfWeek });
    res.json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWorkoutByDay = async (req, res) => {
  const { day } = req.params; // Expecting capitalized 'Monday', etc.
  
  try {
    const workout = await WorkoutPlan.findOne({ day });
    if (!workout) {
      return res.status(404).json({ success: false, error: 'Workout plan not found for this day' });
    }
    res.json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
