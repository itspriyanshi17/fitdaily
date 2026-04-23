import cron from 'node-cron';
import webPush from 'web-push';
import dayjs from 'dayjs';
import User from '../models/User.js';
import DailyLog from '../models/DailyLog.js';
import WorkoutPlan from '../models/WorkoutPlan.js';

const today = () => dayjs().format('YYYY-MM-DD');
let schedulerStarted = false;

const configureWebPush = () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('Push notifications disabled: missing VAPID keys');
    return false;
  }

  webPush.setVapidDetails(
    VAPID_EMAIL || 'mailto:fitdaily@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  return true;
};

const getTodayLog = async (userId) => {
  const date = today();
  let log = await DailyLog.findOne({ userId, date });
  if (!log) {
    log = await DailyLog.create({ userId, date });
  }
  return log;
};

const sendPush = async (user, payload) => {
  if (!user.pushSubscription) return;

  try {
    await webPush.sendNotification(user.pushSubscription, JSON.stringify(payload));
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      user.pushSubscription = null;
      await user.save();
    } else {
      console.error('Push notification failed:', error.message);
    }
  }
};

const currentTime = () => dayjs().format('HH:mm');

const runWaterReminders = async () => {
  const users = await User.find({
    pushSubscription: { $ne: null },
    'notificationSettings.waterReminderEnabled': true,
  });

  await Promise.all(users.map(async (user) => {
    const interval = Number(user.notificationSettings?.waterReminderIntervalHours || 2);
    const hour = dayjs().hour();
    if (interval > 1 && (hour - 8) % interval !== 0) return;

    const log = await getTodayLog(user._id);
    if (log.waterIntake >= user.goals.waterGoal) return;

    await sendPush(user, {
      title: 'Hydration Reminder',
      body: `You've had ${log.waterIntake}ml today. Drink a glass of water now!`,
      icon: '/icons/water.svg',
      badge: '/icons/badge.svg',
      data: { url: '/' },
    });
  }));
};

const runWorkoutReminders = async () => {
  const now = currentTime();
  const users = await User.find({
    pushSubscription: { $ne: null },
    'notificationSettings.workoutReminderEnabled': true,
    'notificationSettings.workoutReminderTime': now,
  });

  const workout = await WorkoutPlan.findOne({ day: dayjs().format('dddd') });
  await Promise.all(users.map(async (user) => {
    const log = await getTodayLog(user._id);
    if (log.workoutCompleted) return;

    await sendPush(user, {
      title: 'Workout Time!',
      body: `It's time for your workout: ${workout?.title || 'today\'s session'}. Let's go!`,
      icon: '/icons/workout.svg',
      actions: [
        { action: 'start', title: 'Start Now' },
        { action: 'later', title: 'Remind in 30 min' },
      ],
      data: { url: '/workout' },
    });
  }));
};

const runMissedWorkoutAlerts = async () => {
  const now = currentTime();
  const users = await User.find({
    pushSubscription: { $ne: null },
    'notificationSettings.missedWorkoutAlertEnabled': true,
    'notificationSettings.missedWorkoutAlertTime': now,
  });

  await Promise.all(users.map(async (user) => {
    const log = await getTodayLog(user._id);
    if (log.workoutCompleted) return;

    await sendPush(user, {
      title: 'Missed Workout Alert',
      body: 'You have not worked out today. Do a quick 10-min session?',
      icon: '/icons/alert.svg',
      data: { url: '/workout' },
    });
  }));
};

const runStepReminders = async () => {
  const now = currentTime();
  const users = await User.find({
    pushSubscription: { $ne: null },
    'notificationSettings.stepReminderEnabled': true,
    'notificationSettings.stepReminderTime': now,
  });

  await Promise.all(users.map(async (user) => {
    const log = await getTodayLog(user._id);
    if (log.steps >= user.goals.stepGoal) return;

    await sendPush(user, {
      title: 'Step Goal Reminder',
      body: `You have ${user.goals.stepGoal - log.steps} steps to go. A short walk will do it!`,
      icon: '/icons/walk.svg',
      badge: '/icons/badge.svg',
      data: { url: '/' },
    });
  }));
};

export const startNotificationScheduler = () => {
  if (schedulerStarted || !configureWebPush()) return;
  schedulerStarted = true;

  cron.schedule('0 8,10,12,14,16,18,20 * * *', runWaterReminders);
  cron.schedule('* * * * *', async () => {
    await runWorkoutReminders();
    await runMissedWorkoutAlerts();
    await runStepReminders();
  });

  console.log('Notification scheduler started');
};
