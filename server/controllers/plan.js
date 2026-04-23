import UserPlan from '../models/UserPlan.js';
import User from '../models/User.js';
import { generatePlan } from '../utils/planGenerator.js';

// @route   POST /api/plan/register
// @desc    Register a new plan for user
// @access  Private
export const registerPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const answers = req.body;

    // Generate plan
    const generatedData = generatePlan(answers);

    // Inactivate existing plans
    await UserPlan.updateMany({ userId }, { isActive: false });

    // Create new plan
    const newPlan = new UserPlan({
      userId,
      profile: answers,
      calculations: generatedData.calculations,
      workoutPlan: generatedData.workoutPlan,
      dietPlan: generatedData.dietPlan,
      isActive: true,
    });

    await newPlan.save();

    // Update user's goals based on the generated plan
    const user = await User.findById(userId);
    if (user) {
      if (!user.goals) user.goals = {};
      user.goals.waterGoal = generatedData.calculations.waterGoal;
      user.goals.stepGoal = generatedData.calculations.stepGoal;
      user.goals.proteinGoal = generatedData.calculations.proteinGoal;
      user.goals.caloriesBurnGoal = Math.round(generatedData.calculations.stepGoal * 0.04);
      user.goals.caloriesGoal = generatedData.calculations.targetCalories;
      user.goals.weightGoal = answers.targetWeight;
      await user.save();
    }

    res.status(201).json(newPlan);
  } catch (err) {
    console.error('Error generating plan:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/plan/my-plan
// @desc    Get the active plan for user
// @access  Private
export const getMyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const activePlan = await UserPlan.findOne({ userId, isActive: true });
    
    if (!activePlan) {
      return res.status(404).json({ message: 'No active plan found' });
    }

    res.json(activePlan);
  } catch (err) {
    console.error('Error fetching plan:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT /api/plan/regenerate
// @desc    Regenerate plan with updated answers
// @access  Private
export const regeneratePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedAnswers = req.body;

    // Generate new plan
    const generatedData = generatePlan(updatedAnswers);

    // Find active plan and update it
    const activePlan = await UserPlan.findOne({ userId, isActive: true });
    
    if (!activePlan) {
      return res.status(404).json({ message: 'No active plan found to regenerate' });
    }

    activePlan.profile = updatedAnswers;
    activePlan.calculations = generatedData.calculations;
    activePlan.workoutPlan = generatedData.workoutPlan;
    activePlan.dietPlan = generatedData.dietPlan;

    await activePlan.save();

    // Update user goals
    const user = await User.findById(userId);
    if (user) {
      user.goals.waterGoal = generatedData.calculations.waterGoal;
      user.goals.stepGoal = generatedData.calculations.stepGoal;
      user.goals.proteinGoal = generatedData.calculations.proteinGoal;
      user.goals.caloriesBurnGoal = Math.round(generatedData.calculations.stepGoal * 0.04);
      user.goals.caloriesGoal = generatedData.calculations.targetCalories;
      user.goals.weightGoal = updatedAnswers.targetWeight;
      await user.save();
    }

    res.json(activePlan);
  } catch (err) {
    console.error('Error regenerating plan:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/plan/reset
// @desc    Reset/Deactivate current plan
// @access  Private
export const resetPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    await UserPlan.updateMany({ userId }, { isActive: false });
    res.json({ message: 'Plan reset successfully' });
  } catch (err) {
    console.error('Error resetting plan:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
