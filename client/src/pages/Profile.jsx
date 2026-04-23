import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Save, Send, RefreshCw } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';

const defaultNotificationSettings = {
  waterReminderEnabled: true,
  waterReminderIntervalHours: 2,
  workoutReminderEnabled: true,
  workoutReminderTime: '18:00',
  missedWorkoutAlertEnabled: true,
  missedWorkoutAlertTime: '20:00',
  stepReminderEnabled: true,
  stepReminderTime: '19:00',
};

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[var(--accent-teal)]' : 'bg-[#374151]'}`}
    aria-pressed={checked}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateGoals, updateNotificationSettings } = useContext(AuthContext);
  const { fetchTodayData } = useContext(AppContext);
  const [goals, setGoals] = useState(user?.goals || {});
  const [notificationSettings, setNotificationSettings] = useState({
    ...defaultNotificationSettings,
    ...(user?.notificationSettings || {}),
  });
  const [saving, setSaving] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  const handleChange = (e) => {
    setGoals({ ...goals, [e.target.name]: Number(e.target.value) });
  };

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const res = await axios.get('/notifications/settings');
        if (res.data.success) {
          setNotificationSettings({
            ...defaultNotificationSettings,
            ...res.data.data.notificationSettings,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGoals(goals);
      toast.success('Goals updated successfully');
      // Refresh context data to reflect new goals in UI
      fetchTodayData(); 
    } catch {
      toast.error('Failed to update goals');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotificationSettings({ ...notificationSettings, [key]: value });
  };

  const handleToggle = async (key) => {
    const previousSettings = { ...notificationSettings };
    const updated = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    };
    setNotificationSettings(updated);
    try {
      await axios.put('/notifications/settings', {
        notificationSettings: updated
      });
      toast.success('Notification settings saved');
    } catch (err) {
      setNotificationSettings(previousSettings);
      toast.error('Failed to save settings');
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await updateNotificationSettings(notificationSettings);
      toast.success('Notification settings saved');
    } catch {
      toast.error('Failed to save notification settings');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await axios.post('/notifications/test');
      toast.success('Test notification sent');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enable notifications first');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      <GlassCard className="flex items-center space-x-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-purple)] text-xl font-bold">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-[var(--accent-teal-dim)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-teal)]">Member since this year</span>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => navigate('/diet-register')}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-black px-4 py-2 rounded-lg font-bold hover:shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Regenerate My Plan</span>
          </button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
        <SectionHeader title="Personal Goals" subtitle="Tune your daily targets for hydration, steps and macros" action={
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-primary px-4 py-2 flex items-center space-x-2 text-sm"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Goals'}</span>
          </button>
        } />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Water Goal (ml)</label>
            <input 
              type="number" 
              name="waterGoal"
              className="w-full"
              value={goals.waterGoal}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Step Goal</label>
            <input 
              type="number" 
              name="stepGoal"
              className="w-full"
              value={goals.stepGoal}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Protein Goal (g)</label>
            <input 
              type="number" 
              name="proteinGoal"
              className="w-full"
              value={goals.proteinGoal}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Calories Burn Goal (kcal)</label>
            <input 
              type="number" 
              name="caloriesBurnGoal"
              className="w-full"
              value={goals.caloriesBurnGoal}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Current Weight (kg)</label>
            <input 
              type="number" 
              name="weightGoal" // Just storing weight here for simplicity as per model
              className="w-full"
              value={goals.weightGoal || ''}
              onChange={handleChange}
              placeholder="e.g. 70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Target Weight (kg)</label>
            <input 
              type="number" 
              name="targetWeight"
              className="w-full"
              value={goals.targetWeight || ''}
              onChange={handleChange}
              placeholder="e.g. 65"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#333] pb-4">
          <div className="flex items-center space-x-2">
            <Bell size={20} className="text-[var(--color-primary)]" />
            <h3 className="font-semibold text-lg">Notifications</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTestNotification}
              className="rounded-lg bg-[#2a2a2a] px-3 py-2 text-sm hover:bg-[#333] flex items-center space-x-2"
            >
              <Send size={15} />
              <span>Test</span>
            </button>
            <button
              onClick={handleSaveNotifications}
              disabled={savingNotifications}
              className="btn-primary px-4 py-2 flex items-center space-x-2 text-sm"
            >
              <Save size={16} />
              <span>{savingNotifications ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Water Reminders</p>
              <p className="text-sm text-gray-400">Prompt me if I am behind on hydration.</p>
            </div>
            <Toggle
              checked={notificationSettings.waterReminderEnabled}
              onChange={() => handleToggle('waterReminderEnabled')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Water reminder interval</label>
            <select
              value={notificationSettings.waterReminderIntervalHours}
              onChange={(e) => handleNotificationChange('waterReminderIntervalHours', Number(e.target.value))}
              className="w-full bg-[#222] border border-[#333] rounded-lg p-3 focus:outline-none"
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Workout Reminder</p>
                  <p className="text-sm text-gray-400">Tell me when it is workout time.</p>
                </div>
                <Toggle
                  checked={notificationSettings.workoutReminderEnabled}
                  onChange={() => handleToggle('workoutReminderEnabled')}
                />
              </div>
              <input
                type="time"
                value={notificationSettings.workoutReminderTime}
                onChange={(e) => handleNotificationChange('workoutReminderTime', e.target.value)}
                className="w-full bg-[#222] border border-[#333] rounded-lg p-3 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Missed Workout Alert</p>
                  <p className="text-sm text-gray-400">Give me one evening rescue reminder.</p>
                </div>
                <Toggle
                  checked={notificationSettings.missedWorkoutAlertEnabled}
                  onChange={() => handleToggle('missedWorkoutAlertEnabled')}
                />
              </div>
              <input
                type="time"
                value={notificationSettings.missedWorkoutAlertTime}
                onChange={(e) => handleNotificationChange('missedWorkoutAlertTime', e.target.value)}
                className="w-full bg-[#222] border border-[#333] rounded-lg p-3 focus:outline-none"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Step Reminder</p>
                  <p className="text-sm text-gray-400">Nudge me when my step goal needs attention.</p>
                </div>
                <Toggle
                  checked={notificationSettings.stepReminderEnabled}
                  onChange={() => handleToggle('stepReminderEnabled')}
                />
              </div>
              <input
                type="time"
                value={notificationSettings.stepReminderTime}
                onChange={(e) => handleNotificationChange('stepReminderTime', e.target.value)}
                className="w-full bg-[#222] border border-[#333] rounded-lg p-3 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <button 
        onClick={logout}
        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg py-3 flex justify-center items-center space-x-2 transition-colors mt-8"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Profile;
