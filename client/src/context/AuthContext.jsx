import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => checkUser());
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/auth/register', { name, email, password });
    if (res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    setUser(null);
  };

  const updateGoals = async (newGoals) => {
    const res = await axios.put('/user/goals', newGoals);
    if (res.data.success) {
      setUser({ ...user, goals: res.data.data });
    }
    return res.data;
  };

  const updateNotificationSettings = async (notificationSettings) => {
    const res = await axios.put('/notifications/settings', { notificationSettings });
    if (res.data.success) {
      setUser({ ...user, notificationSettings: res.data.data });
    }
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateGoals, updateNotificationSettings }}>
      {children}
    </AuthContext.Provider>
  );
};
