import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  waterIntake: { type: Number, default: 0 }, // ml
  steps: { type: Number, default: 0 },
  workoutCompleted: { type: Boolean, default: false },
  workoutDayName: { type: String }, // e.g. "Monday - Upper Body"
  weight: { type: Number }, // kg
  proteinIntake: { type: Number, default: 0 }, // grams
  caloriesBurned: { type: Number, default: 0 }, // kcal
  walks: [{
    distance: { type: Number, default: 0 }, // km
    duration: { type: Number, default: 0 }, // seconds
    estimatedSteps: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    routeCoordinates: { type: [[Number]], default: [] },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: Date.now },
  }],
  score: { type: Number, default: 0 }
});

// Calculate score before saving
dailyLogSchema.pre('save', async function(next) {
  try {
    const user = await mongoose.model('User').findById(this.userId);
    if (!user) return next();

    let newScore = 0;
    if (this.waterIntake >= user.goals.waterGoal) newScore += 10;
    if (this.workoutCompleted) newScore += 30;
    if (this.steps >= user.goals.stepGoal) newScore += 20;
    if (this.proteinIntake >= user.goals.proteinGoal) newScore += 10;
    if (this.caloriesBurned >= user.goals.caloriesBurnGoal) newScore += 10;

    // Max score is 80
    this.score = Math.min(newScore, 80);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('DailyLog', dailyLogSchema);
