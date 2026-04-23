import mongoose from 'mongoose';

const UserPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Registration answers
  profile: {
    age: Number,
    gender: String,           // "male" | "female" | "other"
    weight: Number,           // kg
    height: Number,           // cm
    activityLevel: String,    // "sedentary" | "light" | "moderate" | "active" | "very_active"
    goal: String,             // "lose_weight" | "gain_muscle" | "maintain" | "improve_fitness"
    targetWeight: Number,     // kg
    timePeriod: Number,       // weeks (4/8/12/16/24)
    dietType: String,         // "vegetarian" | "non_vegetarian" | "vegan" | "eggetarian"
    allergies: [String],      // ["dairy", "gluten", "nuts", "soy"]
    mealsPerDay: Number,      // 3 | 4 | 5
    wakeUpTime: String,       // "06:00"
    sleepTime: String,        // "22:00"
    workoutPreference: String,// "home" | "gym" | "outdoor" | "no_equipment"
    fitnessLevel: String,     // "beginner" | "intermediate" | "advanced"
    medicalConditions: [String], // ["diabetes", "hypertension", "none"]
    waterIntakeGoal: Number,  // ml, auto-calculated
    stressLevel: String,      // "low" | "medium" | "high"
  },

  // Calculated values
  calculations: {
    bmi: Number,
    bmiCategory: String,
    bmr: Number,
    tdee: Number,
    targetCalories: Number,
    dailyDeficit: Number,
    weeklyWeightChange: Number,  // kg/week (negative = loss)
    estimatedCompletionDate: Date,
    proteinGoal: Number,         // grams
    carbsGoal: Number,           // grams
    fatGoal: Number,             // grams
    waterGoal: Number,           // ml
    stepGoal: Number,
  },

  // Generated workout plan (4-week rotating or based on timePeriod)
  workoutPlan: {
    planName: String,          // e.g. "Beginner Fat Loss - 12 Weeks"
    focusAreas: [String],      // ["cardio", "core", "full_body"]
    daysPerWeek: Number,
    sessionDuration: Number,   // minutes
    weeks: [{
      weekNumber: Number,
      theme: String,           // "Foundation Week", "Intensity Up", etc.
      days: [{
        day: String,           // "Monday"
        type: { type: String }, // "workout" | "rest" | "active_recovery"
        title: String,         // "Full Body Cardio"
        duration: Number,      // minutes
        estimatedCalories: Number,
        exercises: [{
          name: String,
          sets: Number,
          reps: String,        // "12-15" or "30 seconds"
          restSeconds: Number,
          videoUrl: String,
          description: String,
          modification: String // easier version for beginners
        }]
      }]
    }]
  },

  // Generated diet plan
  dietPlan: {
    planName: String,          // e.g. "Vegetarian Fat Loss Plan"
    dailyCalories: Number,
    macros: {
      protein: Number,         // grams
      carbs: Number,
      fat: Number,
      fiber: Number
    },
    hydration: Number,         // ml
    meals: [{
      mealName: String,        // "Breakfast" | "Mid-Morning" | "Lunch" | "Evening Snack" | "Dinner"
      time: String,            // "07:30" (calculated from wakeUpTime)
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      options: [{              // 3 meal options to choose from
        name: String,          // "Oats with banana and eggs"
        ingredients: [String], // ["1 cup oats", "1 banana", "2 eggs"]
        prepTime: Number,      // minutes
        recipe: String,        // short prep instruction
        isVeg: Boolean
      }]
    }],
    weeklyCheatMeal: String,   // "Saturday dinner — enjoy your favorite meal (keep under 800 kcal)"
    supplements: [{
      name: String,            // "Whey Protein" or "B12" (for vegans)
      timing: String,          // "Post workout"
      dose: String,            // "25g in water"
      required: Boolean        // required vs optional
    }],
    foodsToAvoid: [String],
    foodsToInclude: [String],
    tips: [String]
  },

  isActive: { type: Boolean, default: true },           // user can have multiple plans, only one active
}, { timestamps: true });

export default mongoose.model('UserPlan', UserPlanSchema);
