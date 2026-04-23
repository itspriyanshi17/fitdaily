import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, CheckSquare, BarChart2, User, Footprints, Target, SunMoon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const Sidebar = () => {
  const { toggleTheme } = useContext(ThemeContext);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstall(false);
      toast.success('FitDaily installed! 🎉');
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={24} /> },
    { name: 'Workout', path: '/workout', icon: <Dumbbell size={24} /> },
    { name: 'Walk', path: '/walk', icon: <Footprints size={24} /> },
    { name: 'My Plan', path: '/my-plan', icon: <Target size={24} /> },
    { name: 'Todos', path: '/todos', icon: <CheckSquare size={24} /> },
    { name: 'Progress', path: '/progress', icon: <BarChart2 size={24} /> },
    { name: 'Profile', path: '/profile', icon: <User size={24} /> },
  ];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--border-subtle)] bg-[var(--bg-elevated)] md:flex md:w-16 md:flex-col lg:w-60">
        <div className="px-3 py-6 lg:px-5">
          <h1 className="text-center text-lg font-extrabold lg:text-left lg:text-2xl">
            <span className="bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-blue)] bg-clip-text text-transparent">Fit</span>
            <span>Daily</span>
          </h1>
        </div>
        <nav className="flex-1 space-y-2 px-2 lg:px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              title={item.name}
              className={({ isActive }) =>
                `group relative flex h-11 items-center rounded-[var(--radius-md)] px-3 transition-all lg:px-4 ${
                  isActive
                    ? 'border-l-[3px] border-[var(--accent-teal)] bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="ml-3 hidden font-medium lg:block">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 p-2 lg:p-4">
          <button onClick={toggleTheme} className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] lg:justify-start lg:px-4">
            <SunMoon size={18} />
            <span className="ml-3 hidden text-sm font-medium lg:block">Theme</span>
          </button>
          {showInstall && (
            <button onClick={handleInstall}
              style={{
                background: 'linear-gradient(135deg, #00D4AA, #00a884)',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px'
              }}
              className="w-full flex items-center justify-center lg:justify-start mt-2"
            >
              <span className="mr-2">📲</span>
              <span className="hidden lg:inline">Install App</span>
            </button>
          )}
          <div className="hidden items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 lg:flex mt-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-purple)]" />
            <span className="text-sm text-[var(--text-secondary)]">You</span>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-subtle)] bg-[rgba(22,27,39,0.86)] backdrop-blur-xl md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <nav className="flex h-16 items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative flex h-full w-full flex-col items-center justify-center space-y-1 transition-all ${isActive ? 'text-[var(--accent-teal)]' : 'text-[var(--text-muted)]'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <span className="absolute top-1 h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)]" /> : null}
                  {item.icon}
                  <span className="text-[10px]">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
