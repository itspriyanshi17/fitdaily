import mongoose from 'mongoose';

const workoutPlanSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  title: { type: String, required: true },
  estimatedCaloriesBurn: { type: Number, required: true },
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number },
    reps: { type: Number },
    time: { type: String }, // For timed exercises like planks
    videoUrl: { type: String }
  }]
});

export default mongoose.model('WorkoutPlan', workoutPlanSchema);
