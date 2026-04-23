import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  goals: {
    waterGoal: { type: Number, default: 2500 }, // ml
    stepGoal: { type: Number, default: 8000 },
    weightGoal: { type: Number, default: null }, // kg
    targetWeight: { type: Number, default: null }, // kg
    proteinGoal: { type: Number, default: 120 }, // grams
    caloriesBurnGoal: { type: Number, default: 400 }, // kcal
  },
  pushSubscription: { type: Object, default: null },
  notificationSettings: {
    waterReminderEnabled: { type: Boolean, default: true },
    waterReminderIntervalHours: { type: Number, default: 2 },
    workoutReminderEnabled: { type: Boolean, default: true },
    workoutReminderTime: { type: String, default: '18:00' },
    missedWorkoutAlertEnabled: { type: Boolean, default: true },
    missedWorkoutAlertTime: { type: String, default: '20:00' },
    stepReminderEnabled: { type: Boolean, default: true },
    stepReminderTime: { type: String, default: '19:00' },
  },
  reminderTime: { type: String, default: '18:00' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
