import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import NotificationBanner from './components/NotificationBanner';

// Pages (to be created)
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Workout from './pages/Workout';
import Walk from './pages/Walk';
import Todos from './pages/Todos';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import DietRegister from './pages/DietRegister';
import MyPlan from './pages/MyPlan';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="app-shell-bg flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 md:ml-16 lg:ml-60">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen bg-[var(--color-bg)] flex items-center justify-center">Loading...</div>;

  return (
    <>
      <NotificationBanner user={user} />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
        <Route path="/walk" element={<ProtectedRoute><Walk /></ProtectedRoute>} />
        <Route path="/todos" element={<ProtectedRoute><Todos /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/diet-register" element={<ProtectedRoute><DietRegister /></ProtectedRoute>} />
        <Route path="/my-plan" element={<ProtectedRoute><MyPlan /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
