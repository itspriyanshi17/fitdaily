// ─── CALCULATIONS ───────────────────────────────

function calculateBMI(weight, height) {
  const h = height / 100;
  return Number((weight / (h * h)).toFixed(1));
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function calculateBMR(weight, height, age, gender) {
  // Mifflin-St Jeor Equation
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === "male" ? base + 5 : base - 161;
}

function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

function calculateTargetCalories(tdee, goal, weeklyChange) {
  // weeklyChange in kg (negative for loss, positive for gain)
  const dailyAdjustment = (weeklyChange * 7700) / 7;
  const target = tdee + dailyAdjustment;
  return Math.max(1200, Math.min(target, tdee + 500)); // safety bounds
}

function calculateMacros(targetCalories, goal) {
  let proteinRatio, carbRatio, fatRatio;
  if (goal === "lose_weight") {
    proteinRatio = 0.35; carbRatio = 0.35; fatRatio = 0.30;
  } else if (goal === "gain_muscle") {
    proteinRatio = 0.30; carbRatio = 0.45; fatRatio = 0.25;
  } else {
    proteinRatio = 0.25; carbRatio = 0.45; fatRatio = 0.30;
  }
  return {
    protein: Math.round((targetCalories * proteinRatio) / 4),
    carbs: Math.round((targetCalories * carbRatio) / 4),
    fat: Math.round((targetCalories * fatRatio) / 9),
    fiber: goal === "lose_weight" ? 30 : 25
  };
}

function calculateWaterGoal(weight, activityLevel) {
  const base = weight * 35; // ml per kg
  const activityBonus = {
    sedentary: 0, light: 200, moderate: 400,
    active: 600, very_active: 800
  };
  return base + activityBonus[activityLevel];
}

function calculateStepGoal(goal, fitnessLevel) {
  const base = { beginner: 6000, intermediate: 8000, advanced: 10000 };
  const goalBonus = { lose_weight: 2000, gain_muscle: 0, maintain: 1000, improve_fitness: 2000 };
  return base[fitnessLevel] + goalBonus[goal];
}

// ─── UTILS ──────────────────────────────────────

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatGoal(goal) {
  const map = {
    lose_weight: "Fat Loss",
    gain_muscle: "Muscle Gain",
    maintain: "Maintenance",
    improve_fitness: "Fitness Improvement"
  };
  return map[goal] || "Fitness";
}

function formatDietType(dietType) {
  const map = {
    vegetarian: "Vegetarian",
    non_vegetarian: "Non-Vegetarian",
    vegan: "Vegan",
    eggetarian: "Eggetarian"
  };
  return map[dietType] || "Balanced";
}

function getFocusAreas(goal) {
  if (goal === "lose_weight") return ["cardio", "core", "full_body"];
  if (goal === "gain_muscle") return ["strength", "hypertrophy", "core"];
  return ["full_body", "endurance", "flexibility"];
}

function getWorkoutTypeForDay(day, goal) {
  if (goal === "lose_weight") {
    if (day === "Monday" || day === "Thursday") return { title: "Full Body Cardio", type: "cardio" };
    if (day === "Tuesday" || day === "Friday") return { title: "Strength & Core", type: "strength" };
    return { title: "Active Recovery", type: "core" };
  } else {
    if (day === "Monday") return { title: "Upper Body Strength", type: "strength" };
    if (day === "Tuesday") return { title: "Lower Body Strength", type: "strength" };
    if (day === "Thursday") return { title: "Core & Mobility", type: "core" };
    if (day === "Friday") return { title: "Full Body Power", type: "strength" };
    return { title: "Cardio", type: "cardio" };
  }
}

// Exercise library (home vs gym vs outdoor):
function getExerciseLibrary(preference) {
  // HOME exercises (no equipment):
  const home = {
    cardio: [
      { name: "Jumping Jacks", sets: 3, reps: "30 sec", videoUrl: "https://youtube.com/watch?v=c4DAnQ6DtF8", calories: 8 },
      { name: "High Knees", sets: 3, reps: "30 sec", videoUrl: "https://youtube.com/watch?v=oDdkytliOqE", calories: 10 },
      { name: "Burpees", sets: 3, reps: "10", videoUrl: "https://youtube.com/watch?v=dZgVxmf6jkA", calories: 15 },
      { name: "Mountain Climbers", sets: 3, reps: "30 sec", videoUrl: "https://youtube.com/watch?v=nmwgirgXLYM", calories: 10 },
      { name: "Jump Rope (imaginary)", sets: 3, reps: "1 min", videoUrl: "https://youtube.com/watch?v=FJmRQ5iTXKE", calories: 12 }
    ],
    strength: [
      { name: "Push-ups", sets: 3, reps: "12-15", videoUrl: "https://youtube.com/watch?v=IODxDxX7oi4", calories: 8 },
      { name: "Squats", sets: 3, reps: "20", videoUrl: "https://youtube.com/watch?v=aclHkVaku9U", calories: 10 },
      { name: "Lunges", sets: 3, reps: "12 each leg", videoUrl: "https://youtube.com/watch?v=QOVaHwm-Q6U", calories: 9 },
      { name: "Plank", sets: 3, reps: "30-45 sec", videoUrl: "https://youtube.com/watch?v=pSHjTRCQxIw", calories: 5 },
      { name: "Glute Bridge", sets: 3, reps: "15", videoUrl: "https://youtube.com/watch?v=8bbE64NuDTU", calories: 6 },
      { name: "Superman", sets: 3, reps: "15", videoUrl: "https://youtube.com/watch?v=z6PJMT2y8GQ", calories: 5 }
    ],
    core: [
      { name: "Crunches", sets: 3, reps: "20", videoUrl: "https://youtube.com/watch?v=Xyd_fa5zoEU", calories: 6 },
      { name: "Leg Raises", sets: 3, reps: "15", videoUrl: "https://youtube.com/watch?v=JB2oyawG9KI", calories: 7 },
      { name: "Russian Twist", sets: 3, reps: "20", videoUrl: "https://youtube.com/watch?v=wkD8rjkodUI", calories: 7 },
      { name: "Bicycle Crunches", sets: 3, reps: "20", videoUrl: "https://youtube.com/watch?v=9FGilxCbdz8", calories: 8 }
    ]
  };

  // GYM exercises:
  const gym = {
    cardio: [
      { name: "Treadmill Run", sets: 1, reps: "20 min", videoUrl: "https://youtube.com/watch?v=kGSw6JXDVWQ", calories: 200 },
      { name: "Cycling", sets: 1, reps: "15 min", videoUrl: "https://youtube.com/watch?v=5EvP0DXttHQ", calories: 150 },
      { name: "Elliptical", sets: 1, reps: "15 min", videoUrl: "https://youtube.com/watch?v=LJsaBDMpFtg", calories: 160 }
    ],
    strength: [
      { name: "Bench Press", sets: 4, reps: "10-12", videoUrl: "https://youtube.com/watch?v=rT7DgCr-3pg", calories: 30 },
      { name: "Deadlift", sets: 4, reps: "8-10", videoUrl: "https://youtube.com/watch?v=op9kVnSso6Q", calories: 40 },
      { name: "Lat Pulldown", sets: 3, reps: "12", videoUrl: "https://youtube.com/watch?v=CAwf7n6Luuc", calories: 25 },
      { name: "Leg Press", sets: 4, reps: "15", videoUrl: "https://youtube.com/watch?v=IZxyjW7MPJQ", calories: 35 },
      { name: "Shoulder Press", sets: 3, reps: "12", videoUrl: "https://youtube.com/watch?v=qEwKCR5JCog", calories: 25 },
      { name: "Cable Row", sets: 3, reps: "12", videoUrl: "https://youtube.com/watch?v=GZbfZ033f74", calories: 25 }
    ],
    core: [
      { name: "Cable Crunch", sets: 3, reps: "15", videoUrl: "https://youtube.com/watch?v=Wm6vZe8oJDk", calories: 10 },
      { name: "Hanging Knee Raise", sets: 3, reps: "15", videoUrl: "https://youtube.com/watch?v=Pr1ieGZ5atk", calories: 12 }
    ]
  };

  return preference === "gym" ? gym : home;
}

function selectExercises(library, workoutType, weekNum, fitnessLevel) {
  // Simple selection: pick 4-6 exercises based on type
  const typeKey = workoutType.type;
  const exercises = library[typeKey] || library.strength;
  
  // Increase sets/reps slightly based on weekNum and fitnessLevel
  return exercises.slice(0, 5).map(ex => {
    let sets = ex.sets;
    if (fitnessLevel === "intermediate") sets += 1;
    if (fitnessLevel === "advanced") sets += 2;
    if (weekNum > 4) sets += 1;
    return { ...ex, sets, restSeconds: 60 };
  });
}

// Weekly day structure generator:
function generateWeek(weekNum, daysPerWeek, duration, library, goal, fitnessLevel) {
  const themes = {
    1: "Foundation Week — Learn the basics",
    2: "Building Consistency",
    3: "Intensity Increase",
    4: "Push Your Limits",
    5: "Halfway Strong",
    6: "Advanced Week",
    7: "Peak Performance",
    8: "Recovery & Review"
  };

  const dayPlans = {
    3: ["Monday", "Wednesday", "Friday"],
    4: ["Monday", "Tuesday", "Thursday", "Friday"],
    5: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"]
  };

  const workoutDays = dayPlans[daysPerWeek] || dayPlans[3];
  const allDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  
  return {
    weekNumber: weekNum,
    theme: themes[Math.min(weekNum, 8)] || `Week ${weekNum} — Keep Going`,
    days: allDays.map(day => {
      if (!workoutDays.includes(day)) {
        return { day, type: "rest", title: "Rest Day", duration: 0, estimatedCalories: 0, exercises: [] };
      }
      // Assign workout type based on day
      const workoutType = getWorkoutTypeForDay(day, goal);
      const exercises = selectExercises(library, workoutType, weekNum, fitnessLevel);
      const totalCalories = exercises.reduce((sum, ex) => sum + (ex.calories || 10), 0);
      
      return {
        day,
        type: "workout",
        title: workoutType.title,
        duration,
        estimatedCalories: totalCalories,
        exercises
      };
    })
  };
}

// ─── WORKOUT PLAN GENERATOR ──────────────────────

function generateWorkoutPlan(profile, calculations) {
  const { goal, fitnessLevel, workoutPreference, timePeriod } = profile;
  
  // Determine days per week based on fitness level
  const daysPerWeek = { beginner: 3, intermediate: 4, advanced: 5 }[fitnessLevel];
  
  // Session duration
  const duration = { beginner: 30, intermediate: 45, advanced: 60 }[fitnessLevel];

  // Exercise library based on workoutPreference:
  const exerciseLibrary = getExerciseLibrary(workoutPreference);
  
  // Generate weekly structure
  const weeks = [];
  for (let w = 1; w <= Math.min(timePeriod, 16); w++) {
    weeks.push(generateWeek(w, daysPerWeek, duration, exerciseLibrary, goal, fitnessLevel));
  }

  return {
    planName: `${capitalize(fitnessLevel)} ${formatGoal(goal)} - ${timePeriod} Weeks`,
    focusAreas: getFocusAreas(goal),
    daysPerWeek,
    sessionDuration: duration,
    weeks
  };
}

// ─── DIET PLAN GENERATOR ─────────────────────────

function calculateMealTimes(wakeUpTime, mealsPerDay) {
  const [hours, minutes] = wakeUpTime.split(':').map(Number);
  const wakeUpDate = new Date(2000, 0, 1, hours, minutes);
  
  const addHours = (date, h) => new Date(date.getTime() + h * 60 * 60 * 1000);
  
  const times = [];
  if (mealsPerDay === 3) {
    times.push(addHours(wakeUpDate, 1).toTimeString().substring(0,5)); // Breakfast (1h after wake)
    times.push(addHours(wakeUpDate, 5).toTimeString().substring(0,5)); // Lunch
    times.push(addHours(wakeUpDate, 10).toTimeString().substring(0,5)); // Dinner
  } else if (mealsPerDay === 4) {
    times.push(addHours(wakeUpDate, 1).toTimeString().substring(0,5)); // Breakfast
    times.push(addHours(wakeUpDate, 3.5).toTimeString().substring(0,5)); // Mid-morning
    times.push(addHours(wakeUpDate, 6).toTimeString().substring(0,5)); // Lunch
    times.push(addHours(wakeUpDate, 10).toTimeString().substring(0,5)); // Dinner
  } else {
    times.push(addHours(wakeUpDate, 1).toTimeString().substring(0,5)); // Breakfast
    times.push(addHours(wakeUpDate, 3).toTimeString().substring(0,5)); // Mid-morning
    times.push(addHours(wakeUpDate, 5).toTimeString().substring(0,5)); // Lunch
    times.push(addHours(wakeUpDate, 8).toTimeString().substring(0,5)); // Snack
    times.push(addHours(wakeUpDate, 11).toTimeString().substring(0,5)); // Dinner
  }
  return times;
}

// Meal options database (vegetarian & non-veg):
function getMealOptions(mealName, dietType) {
  const vegMeals = {
    "Breakfast": [
      { name: "Oats with banana & almonds", ingredients: ["1 cup rolled oats", "1 banana", "10 almonds", "1 cup milk"], prepTime: 10, recipe: "Cook oats in milk, top with banana and almonds", isVeg: true },
      { name: "Moong dal chilla + curd", ingredients: ["1 cup moong dal batter", "1/2 cup curd", "green chutney"], prepTime: 15, recipe: "Pour batter on tawa, cook like pancake. Serve with curd", isVeg: true },
      { name: "Paneer scramble + toast", ingredients: ["100g paneer", "2 whole wheat toast", "veggies"], prepTime: 10, recipe: "Crumble paneer, sauté with veggies, serve with toast", isVeg: true }
    ],
    "Lunch": [
      { name: "Brown rice + dal + sabzi + curd", ingredients: ["1 cup brown rice", "1 cup dal", "1 cup sabzi", "1/2 cup curd"], prepTime: 30, recipe: "Standard balanced Indian thali", isVeg: true },
      { name: "Roti + paneer curry + salad", ingredients: ["2 roti", "100g paneer curry", "salad"], prepTime: 25, recipe: "Whole wheat roti with homemade paneer curry", isVeg: true },
      { name: "Quinoa bowl with rajma", ingredients: ["1 cup quinoa", "1 cup rajma", "veggies"], prepTime: 20, recipe: "Cook quinoa, top with rajma masala and diced veggies", isVeg: true }
    ],
    "Dinner": [
      { name: "Khichdi + raita", ingredients: ["1 cup rice+dal khichdi", "1/2 cup raita"], prepTime: 20, recipe: "Light khichdi with cucumber raita", isVeg: true },
      { name: "Roti + dal + salad", ingredients: ["2 roti", "1 cup dal", "salad"], prepTime: 20, recipe: "Simple light dinner", isVeg: true },
      { name: "Vegetable soup + 2 roti", ingredients: ["vegetable soup", "2 whole wheat roti"], prepTime: 15, recipe: "Light soup with roti", isVeg: true }
    ],
    "Mid-Morning Snack": [
      { name: "Fruit + handful of nuts", ingredients: ["1 apple/banana", "10 mixed nuts"], prepTime: 2, recipe: "No prep needed", isVeg: true },
      { name: "Greek yogurt + berries", ingredients: ["150g greek yogurt", "berries"], prepTime: 2, recipe: "Mix and eat", isVeg: true },
      { name: "Roasted chana", ingredients: ["30g roasted chana"], prepTime: 0, recipe: "Ready to eat", isVeg: true }
    ],
    "Evening Snack": [
      { name: "Protein shake + banana", ingredients: ["1 scoop protein powder", "1 banana", "water"], prepTime: 2, recipe: "Blend and drink", isVeg: true },
      { name: "Sprouts chaat", ingredients: ["1 cup mixed sprouts", "lemon", "spices"], prepTime: 5, recipe: "Mix sprouts with lemon and spices", isVeg: true },
      { name: "Makhana (fox nuts)", ingredients: ["30g roasted makhana"], prepTime: 0, recipe: "Ready to eat", isVeg: true }
    ]
  };

  const nonVegMeals = {
    ...vegMeals,
    "Breakfast": [
      { name: "Eggs + whole wheat toast + milk", ingredients: ["3 eggs", "2 whole wheat toast", "1 cup milk"], prepTime: 10, recipe: "Boil or scramble eggs, serve with toast", isVeg: false },
      { name: "Omelette with veggies + oats", ingredients: ["2 eggs", "veggies", "1 cup oats"], prepTime: 15, recipe: "Make veggie omelette, eat with oats", isVeg: false },
      { name: "Chicken sandwich + milk", ingredients: ["50g grilled chicken", "2 bread slices", "lettuce", "milk"], prepTime: 10, recipe: "Layer chicken with veggies in bread", isVeg: false }
    ],
    "Lunch": [
      { name: "Chicken rice bowl", ingredients: ["100g grilled chicken", "1 cup rice", "salad"], prepTime: 25, recipe: "Grill chicken, serve with rice and salad", isVeg: false },
      { name: "Fish curry + roti + sabzi", ingredients: ["100g fish curry", "2 roti", "sabzi"], prepTime: 30, recipe: "Homestyle fish curry with roti", isVeg: false },
      { name: "Egg fried rice + dal", ingredients: ["2 eggs", "1 cup rice", "dal"], prepTime: 20, recipe: "Make egg fried rice, serve with dal", isVeg: false }
    ],
    "Dinner": [
      { name: "Grilled chicken + roti + salad", ingredients: ["80g chicken", "2 roti", "salad"], prepTime: 20, recipe: "Light grilled chicken dinner", isVeg: false },
      { name: "Egg curry + rice", ingredients: ["2 eggs curry", "1 cup rice"], prepTime: 20, recipe: "Simple egg curry", isVeg: false },
      { name: "Fish + quinoa + veggies", ingredients: ["80g fish", "1 cup quinoa", "veggies"], prepTime: 25, recipe: "Baked fish with quinoa", isVeg: false }
    ],
    "Mid-Morning Snack": [
      { name: "Boiled eggs + fruit", ingredients: ["2 boiled eggs", "1 fruit"], prepTime: 10, recipe: "Boil eggs in advance", isVeg: false },
      { name: "Tuna on crackers", ingredients: ["50g tuna", "3-4 crackers"], prepTime: 2, recipe: "Spread tuna on crackers", isVeg: false },
      { name: "Chicken tikka bites (small)", ingredients: ["50g chicken tikka"], prepTime: 0, recipe: "Pre-cooked, grab and go", isVeg: false }
    ],
    "Evening Snack": [
      { name: "Whey protein shake", ingredients: ["1 scoop whey", "water/milk"], prepTime: 2, recipe: "Shake and drink", isVeg: false },
      { name: "Boiled egg + fruit", ingredients: ["1 egg", "1 fruit"], prepTime: 5, recipe: "Boil egg, eat with fruit", isVeg: false },
      { name: "Greek yogurt + nuts", ingredients: ["150g yogurt", "nuts"], prepTime: 2, recipe: "Mix and eat", isVeg: false }
    ]
  };

  const meals = (dietType === "non_vegetarian" || dietType === "eggetarian") ? nonVegMeals : vegMeals;
  return meals[mealName] || vegMeals[mealName] || [];
}

function getSupplements(dietType, goal) {
  const base = [
    { name: "Multivitamin", timing: "Morning with breakfast", dose: "1 tablet", required: true }
  ];
  if (goal === "gain_muscle" || goal === "improve_fitness") {
    base.push({ name: "Whey Protein", timing: "Post workout", dose: "25g in 250ml water", required: false });
    base.push({ name: "Creatine", timing: "Daily with water", dose: "5g", required: false });
  }
  if (dietType === "vegan" || dietType === "vegetarian") {
    base.push({ name: "Vitamin B12", timing: "Morning", dose: "1 tablet", required: true });
    base.push({ name: "Iron supplement", timing: "With vitamin C", dose: "As prescribed", required: false });
  }
  if (goal === "lose_weight") {
    base.push({ name: "Omega-3 Fish Oil", timing: "With meals", dose: "1000mg", required: false });
  }
  return base;
}

function getFoodsToAvoid(goal) {
  if (goal === "lose_weight") {
    return ["Sugary drinks", "Deep fried foods", "Processed snacks", "Refined grains", "Alcohol"];
  }
  return ["Excessive added sugar", "Trans fats", "Highly processed meats"];
}

function getFoodsToInclude(dietType, goal) {
  const base = ["Leafy greens", "Fresh fruits", "Whole grains", "Nuts and seeds"];
  if (dietType === "non_vegetarian") base.push("Lean chicken", "Fish", "Eggs");
  if (dietType === "vegetarian" || dietType === "vegan") base.push("Lentils", "Beans", "Tofu", "Tempeh");
  if (goal === "gain_muscle") base.push("Oats", "Sweet potatoes", "Greek yogurt (if dairy ok)");
  return base;
}

function getDietTips(goal) {
  if (goal === "lose_weight") {
    return [
      "Drink a glass of water before every meal.",
      "Eat your protein and veggies first.",
      "Avoid eating 2 hours before bedtime.",
      "Chew your food slowly to feel full faster."
    ];
  }
  return [
    "Stay consistent with your meals.",
    "Don't skip breakfast.",
    "Stay hydrated throughout the day.",
    "Focus on nutrient-dense foods, not just empty calories."
  ];
}

function generateDietPlan(profile, calculations) {
  const { dietType, mealsPerDay, wakeUpTime, goal } = profile;
  const { targetCalories, macros, waterGoal } = calculations;

  // Calculate meal times based on wakeUpTime
  const mealTimes = calculateMealTimes(wakeUpTime, mealsPerDay);

  // Split calories across meals
  const mealCaloriesSplit = {
    3: [0.30, 0.40, 0.30],            // breakfast, lunch, dinner
    4: [0.25, 0.15, 0.35, 0.25],      // + mid-morning
    5: [0.20, 0.10, 0.30, 0.15, 0.25] // + evening snack
  };

  const mealNames = {
    3: ["Breakfast", "Lunch", "Dinner"],
    4: ["Breakfast", "Mid-Morning Snack", "Lunch", "Dinner"],
    5: ["Breakfast", "Mid-Morning Snack", "Lunch", "Evening Snack", "Dinner"]
  };

  const meals = mealNames[mealsPerDay].map((mealName, i) => {
    const mealCalories = Math.round(targetCalories * mealCaloriesSplit[mealsPerDay][i]);
    return {
      mealName,
      time: mealTimes[i],
      calories: mealCalories,
      protein: Math.round(macros.protein * mealCaloriesSplit[mealsPerDay][i]),
      carbs: Math.round(macros.carbs * mealCaloriesSplit[mealsPerDay][i]),
      fat: Math.round(macros.fat * mealCaloriesSplit[mealsPerDay][i]),
      options: getMealOptions(mealName, dietType)
    };
  });

  return {
    planName: `${formatDietType(dietType)} ${formatGoal(goal)} Plan`,
    dailyCalories: targetCalories,
    macros,
    hydration: waterGoal,
    meals,
    weeklyCheatMeal: goal !== "gain_muscle"
      ? "Saturday dinner — enjoy your favorite meal (keep under 800 kcal)"
      : "Sunday lunch — high-carb refeed meal",
    supplements: getSupplements(dietType, goal),
    foodsToAvoid: getFoodsToAvoid(goal),
    foodsToInclude: getFoodsToInclude(dietType, goal),
    tips: getDietTips(goal)
  };
}

// ─── MAIN EXPORT ──────────────────────────────────

export function generatePlan(profile) {
  const { weight, height, age, gender, activityLevel, goal, targetWeight, timePeriod, fitnessLevel } = profile;

  // 1. Calculations
  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  
  const targetWeightLoss = weight - targetWeight; // positive means loss, negative means gain
  let weeklyWeightChange = 0;
  if (timePeriod > 0) {
    weeklyWeightChange = targetWeightLoss > 0 ? -(targetWeightLoss / timePeriod) : Math.abs(targetWeightLoss / timePeriod);
  }

  const targetCalories = calculateTargetCalories(tdee, goal, weeklyWeightChange);
  const macros = calculateMacros(targetCalories, goal);
  const waterGoal = calculateWaterGoal(weight, activityLevel);
  const stepGoal = calculateStepGoal(goal, fitnessLevel);

  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + (timePeriod * 7));

  const calculations = {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    targetCalories,
    macros,
    dailyDeficit: tdee - targetCalories,
    weeklyWeightChange,
    estimatedCompletionDate,
    proteinGoal: macros.protein,
    carbsGoal: macros.carbs,
    fatGoal: macros.fat,
    waterGoal,
    stepGoal,
  };

  // 2. Workout Plan
  const workoutPlan = generateWorkoutPlan(profile, calculations);

  // 3. Diet Plan
  const dietPlan = generateDietPlan(profile, calculations);

  return { calculations, workoutPlan, dietPlan };
}
