import User from '../models/User.js';

export const updateGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.goals = { ...user.goals, ...req.body };
    const updatedUser = await user.save();

    res.json({ success: true, data: updatedUser.goals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user.goals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
