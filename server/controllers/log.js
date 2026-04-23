import DailyLog from '../models/DailyLog.js';
import WorkoutPlan from '../models/WorkoutPlan.js';
import UserPlan from '../models/UserPlan.js';
import dayjs from 'dayjs';

// Helper to get or create today's log
const getTodayLogOrCreate = async (userId) => {
  const today = dayjs().format('YYYY-MM-DD');
  let log = await DailyLog.findOne({ userId, date: today });
  
  if (!log) {
    log = await DailyLog.create({ userId, date: today });
  }
  return log;
};

const calculateWorkoutCalories = (durationMinutes, intensity, weightKg) => {
  const safeDuration = Math.max(0, Number(durationMinutes) || 0);
  const safeWeight = Math.max(30, Number(weightKg) || 70);
  const metByIntensity = {
    low: 4,
    moderate: 6,
    high: 8,
  };
  const met = metByIntensity[intensity] || metByIntensity.moderate;
  return Math.round((met * 3.5 * safeWeight / 200) * safeDuration);
};

export const getTodayLog = async (req, res) => {
  try {
    const log = await getTodayLogOrCreate(req.user._id);

    // Calculate streak
    const pastLogs = await DailyLog.find({ userId: req.user._id, workoutCompleted: true })
      .sort({ date: -1 })
      .exec();
    
    let streak = 0;
    let currentDate = dayjs().format('YYYY-MM-DD');

    for (let i = 0; i < pastLogs.length; i++) {
      if (pastLogs[i].date === currentDate) {
        streak++;
        currentDate = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
      } else if (dayjs(pastLogs[i].date).isBefore(currentDate)) {
        // If there's a gap, break streak
        break;
      }
    }

    res.json({ success: true, data: { log, streak } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addWater = async (req, res) => {
  const { amount } = req.body;
  try {
    let log = await getTodayLogOrCreate(req.user._id);
    log.waterIntake += amount;
    await log.save();
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addSteps = async (req, res) => {
  const { steps } = req.body;
  try {
    let log = await getTodayLogOrCreate(req.user._id);
    log.steps += steps;
    await log.save();
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markWorkoutComplete = async (req, res) => {
  try {
    let log = await getTodayLogOrCreate(req.user._id);
    
    if (log.workoutCompleted) {
      return res.status(400).json({ success: false, error: 'Workout already completed for today' });
    }

    const dayOfWeek = dayjs().format('dddd');
    const todayWorkout = await WorkoutPlan.findOne({ day: dayOfWeek });
    const activeUserPlan = await UserPlan.findOne({ userId: req.user._id, isActive: true });
    const body = req.body || {};
    const durationMinutes = Math.round(Number(body.durationMinutes) || 0);
    const intensity = ['low', 'moderate', 'high'].includes(body.intensity) ? body.intensity : 'moderate';
    const profileWeight = activeUserPlan?.profile?.weight;
    const caloriesByUserInput = durationMinutes > 0
      ? calculateWorkoutCalories(durationMinutes, intensity, profileWeight)
      : 0;
    const caloriesToAdd = caloriesByUserInput || todayWorkout?.estimatedCaloriesBurn || 0;
    
    log.workoutCompleted = true;
    log.caloriesBurned += caloriesToAdd;

    if (todayWorkout) {
      log.workoutDayName = `${dayOfWeek} - ${todayWorkout.title}`;
    } else {
      log.workoutDayName = dayOfWeek;
    }

    if (durationMinutes > 0) {
      log.workoutDayName = `${log.workoutDayName} (${durationMinutes} min, ${intensity})`;
    }

    await log.save();
    res.json({ success: true, data: log, caloriesAdded: caloriesToAdd });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addWeight = async (req, res) => {
  const { weight } = req.body;
  try {
    let log = await getTodayLogOrCreate(req.user._id);
    log.weight = weight;
    await log.save();
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addProtein = async (req, res) => {
  const { amount } = req.body;
  try {
    let log = await getTodayLogOrCreate(req.user._id);
    log.proteinIntake += amount;
    await log.save();
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addCalories = async (req, res) => {
  const { calories } = req.body;
  try {
    let log = await getTodayLogOrCreate(req.user._id);
    log.caloriesBurned += calories;
    await log.save();
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addWalk = async (req, res) => {
  const { distance, duration, steps, calories, routeCoordinates, startTime, endTime } = req.body;

  try {
    const log = await getTodayLogOrCreate(req.user._id);
    const estimatedSteps = Math.max(0, Math.round(Number(steps) || 0));
    const caloriesBurned = Math.max(0, Math.round(Number(calories) || 0));

    log.walks.push({
      distance: Math.max(0, Number(distance) || 0),
      duration: Math.max(0, Math.round(Number(duration) || 0)),
      estimatedSteps,
      caloriesBurned,
      routeCoordinates: Array.isArray(routeCoordinates) ? routeCoordinates : [],
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(),
    });
    log.steps += estimatedSteps;
    log.caloriesBurned += caloriesBurned;
    await log.save();

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWalks = async (req, res) => {
  const date = req.query.date || dayjs().format('YYYY-MM-DD');

  try {
    const log = await DailyLog.findOne({ userId: req.user._id, date });
    res.json({ success: true, data: log?.walks || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHistory = async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const startDate = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD');

  try {
    const logs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
