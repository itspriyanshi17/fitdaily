import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

const DISMISSED_KEY = 'fitdaily_notifications_dismissed_until';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const NotificationBanner = ({ user }) => {
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!user || !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    queueMicrotask(() => {
      const dismissedUntil = Number(localStorage.getItem(DISMISSED_KEY) || 0);
      setVisible(Notification.permission === 'default' && Date.now() > dismissedUntil);
    });
  }, [user]);

  const subscribe = async () => {
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notifications were not enabled');
        setVisible(false);
        return;
      }

      const keyRes = await axios.get('/notifications/public-key');
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyRes.data.data.publicKey),
      });

      await axios.post('/notifications/subscribe', { subscription });
      toast.success('Notifications enabled');
      setVisible(false);
    } catch (error) {
      toast.error('Could not enable notifications');
      console.error(error);
    } finally {
      setSubscribing(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + 3 * 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 md:inset-0 md:flex md:items-end md:justify-center md:bg-black/35 md:backdrop-blur-sm">
      <div className="mobile-sheet w-full p-5 md:mb-6 md:max-w-xl md:rounded-[var(--radius-xl)] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)]">
        <div className="mb-4 flex items-start gap-3">
          <Bell className="mt-0.5 shrink-0 text-[var(--accent-teal)]" size={24} />
          <div>
            <p className="font-semibold text-white">Stay on Track</p>
            <p className="text-sm text-[var(--text-secondary)]">Get reminders for water, workouts and steps.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={subscribe} disabled={subscribing} className="btn-primary flex-1 px-4 py-2 text-sm">
            {subscribing ? 'Enabling...' : 'Enable Notifications'}
          </button>
          <button onClick={dismiss} className="btn-secondary flex-1 px-4 py-2 text-sm" aria-label="Not now">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
