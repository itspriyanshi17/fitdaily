import webPush from 'web-push';
import User from '../models/User.js';

const configureWebPush = () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;

  webPush.setVapidDetails(
    VAPID_EMAIL || 'mailto:fitdaily@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  return true;
};

export const getPublicKey = (req, res) => {
  res.json({ success: true, data: { publicKey: process.env.VAPID_PUBLIC_KEY || '' } });
};

export const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ success: false, error: 'Invalid push subscription' });
    }

    const user = await User.findById(req.user._id);
    user.pushSubscription = subscription;
    await user.save();

    res.status(201).json({ success: true, data: { subscribed: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { pushSubscription: null } });
    res.json({ success: true, data: { subscribed: false } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings pushSubscription');
    res.json({
      success: true,
      data: {
        notificationSettings: user.notificationSettings,
        subscribed: Boolean(user.pushSubscription),
        publicKey: process.env.VAPID_PUBLIC_KEY || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const currentSettings = user.notificationSettings?.toObject?.() || user.notificationSettings || {};
    user.notificationSettings = {
      ...currentSettings,
      ...req.body.notificationSettings,
    };
    await user.save();

    res.json({ success: true, data: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendTestNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.pushSubscription) {
      return res.status(400).json({ success: false, error: 'Notifications are not enabled for this browser' });
    }
    if (!configureWebPush()) {
      return res.status(500).json({ success: false, error: 'VAPID keys are not configured' });
    }

    await webPush.sendNotification(user.pushSubscription, JSON.stringify({
      title: 'FitDaily notifications are on',
      body: 'Your reminders are ready to keep you moving.',
      icon: '/icons/badge.svg',
      badge: '/icons/badge.svg',
      data: { url: '/' },
    }));

    res.json({ success: true, data: { sent: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
