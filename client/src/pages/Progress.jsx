import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Flame, CheckSquare, Footprints, Map } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Progress = () => {
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [todosCompletionRate, setTodosCompletionRate] = useState(0);
  const [activeTab, setActiveTab] = useState('metrics');
  const [selectedWalk, setSelectedWalk] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [histRes, todayRes, todosRes] = await Promise.all([
          axios.get('/log/history?days=7'),
          axios.get('/log/today'),
          // Fetch todos for last 7 days roughly by getting all or calculating client side
          // Let's just fetch all todos and filter for the last 7 days locally for simplicity
          axios.get('/todo') 
        ]);

        if (histRes.data.success) {
          setHistory(histRes.data.data);
        }
        if (todayRes.data.success) {
          setStreak(todayRes.data.data.streak);
        }
        if (todosRes.data.success) {
          const sevenDaysAgo = dayjs().subtract(7, 'day');
          const recentTodos = todosRes.data.data.filter(t => dayjs(t.date).isAfter(sevenDaysAgo));
          if (recentTodos.length > 0) {
            const completed = recentTodos.filter(t => t.completed).length;
            setTodosCompletionRate(Math.round((completed / recentTodos.length) * 100));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20">Loading charts...</div>;

  const labels = history.map(log => dayjs(log.date).format('ddd'));
  const allWalks = history.flatMap(log => (log.walks || []).map(walk => ({ ...walk, date: log.date })));
  const weeklyWalkDistance = allWalks.reduce((sum, walk) => sum + (walk.distance || 0), 0);

  // Common options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false, color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
    }
  };

  const chartData = (label, dataKey, color, bgCol) => ({
    labels,
    datasets: [{
      label,
      data: history.map(log => log[dataKey]),
      borderColor: color,
      backgroundColor: bgCol || color,
      borderWidth: 2,
      borderRadius: bgCol ? 4 : 0,
      tension: 0.3,
    }]
  });

  const walkDistanceData = {
    labels,
    datasets: [{
      label: 'Walk Distance',
      data: history.map(log => (log.walks || []).reduce((sum, walk) => sum + (walk.distance || 0), 0)),
      backgroundColor: '#00d4aa',
      borderRadius: 4,
    }]
  };

  const formatDuration = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-6">
      <h1 className="text-2xl font-bold">Progress Dashboard</h1>

      <div className="flex rounded-full bg-[var(--bg-card)] p-1">
        {[
          { id: 'metrics', label: 'Metrics' },
          { id: 'walks', label: 'Walks' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-[var(--accent-teal)] text-black' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'metrics' ? (
        <>
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex items-center space-x-4">
          <div className="bg-orange-500/20 p-3 rounded-full">
            <Flame className="text-orange-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Workout Streak</p>
            <p className="text-2xl font-bold">{streak} Days</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center space-x-4">
          <div className="bg-blue-500/20 p-3 rounded-full">
            <CheckSquare className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Task Completion</p>
            <p className="text-2xl font-bold">{todosCompletionRate}%</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-3">
        <h3 className="font-semibold text-lg">Last 7 Days Workouts</h3>
        <div className="flex justify-between items-center px-2">
          {history.map((log, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                log.workoutCompleted 
                  ? 'bg-[var(--color-success)] text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                  : 'bg-[#333] text-gray-500'
              }`}>
                {log.workoutCompleted ? '✓' : '✗'}
              </div>
              <span className="text-xs text-gray-400">{dayjs(log.date).format('dd')}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calories Burned Chart */}
        <GlassCard className="h-80 flex flex-col">
          <h3 className="font-semibold mb-4 text-[var(--color-calories)]">Calories Burned (kcal)</h3>
          <div className="flex-1 min-h-0">
            <Bar options={commonOptions} data={chartData('Calories', 'caloriesBurned', 'transparent', '#ef4444')} />
          </div>
        </GlassCard>

        {/* Protein Intake Chart */}
        <GlassCard className="h-80 flex flex-col">
          <h3 className="font-semibold mb-4 text-[var(--color-protein)]">Protein Intake (g)</h3>
          <div className="flex-1 min-h-0">
            <Bar options={commonOptions} data={chartData('Protein', 'proteinIntake', 'transparent', '#f59e0b')} />
          </div>
        </GlassCard>

        {/* Water Intake Chart */}
        <GlassCard className="h-80 flex flex-col">
          <h3 className="font-semibold mb-4 text-blue-400">Water Intake (ml)</h3>
          <div className="flex-1 min-h-0">
            <Bar options={commonOptions} data={chartData('Water', 'waterIntake', 'transparent', '#60a5fa')} />
          </div>
        </GlassCard>

        {/* Steps Chart */}
        <GlassCard className="h-80 flex flex-col">
          <h3 className="font-semibold mb-4 text-purple-400">Steps</h3>
          <div className="flex-1 min-h-0">
            <Bar options={commonOptions} data={chartData('Steps', 'steps', 'transparent', '#c084fc')} />
          </div>
        </GlassCard>
      </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="flex items-center space-x-4">
              <div className="bg-[var(--color-primary)]/20 p-3 rounded-full">
                <Footprints className="text-[var(--color-primary)]" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Weekly Total</p>
                <p className="text-2xl font-bold">{weeklyWalkDistance.toFixed(1)} km</p>
              </div>
            </GlassCard>
            <GlassCard className="flex items-center space-x-4">
              <div className="bg-purple-500/20 p-3 rounded-full">
                <Map className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Walks Logged</p>
                <p className="text-2xl font-bold">{allWalks.length}</p>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="h-80 flex flex-col">
            <h3 className="font-semibold mb-4 text-[var(--color-primary)]">Daily Walk Distance (km)</h3>
            <div className="flex-1 min-h-0">
              <Bar options={commonOptions} data={walkDistanceData} />
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Walk History</h3>
              <p className="text-sm text-gray-400">You walked {weeklyWalkDistance.toFixed(1)} km this week.</p>
            </div>
            {allWalks.length === 0 ? (
              <EmptyState title="No walks logged" subtitle="Start a walk and it will appear here." />
            ) : (
              <div className="space-y-3">
                {allWalks.map((walk, index) => (
                  <button
                    key={walk._id || index}
                    onClick={() => setSelectedWalk(walk)}
                    className="w-full rounded-lg bg-[var(--bg-card)] p-4 text-left border border-[var(--border-subtle)] hover:border-[var(--accent-teal)]/50 transition-colors"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{dayjs(walk.date).format('MMM D, YYYY')}</p>
                        <p className="text-sm text-gray-400">Duration {formatDuration(walk.duration)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <span>{(walk.distance || 0).toFixed(2)} km</span>
                        <span>~{(walk.estimatedSteps || 0).toLocaleString()} steps</span>
                        <span>~{walk.caloriesBurned || 0} kcal</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </GlassCard>

          {selectedWalk && (
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Route Preview</h3>
                <button onClick={() => setSelectedWalk(null)} className="text-sm text-gray-400 hover:text-white">Close</button>
              </div>
              <div className="h-72 overflow-hidden rounded-lg border border-[#333]">
                <MapContainer
                  center={selectedWalk.routeCoordinates?.[0] || [28.6139, 77.2090]}
                  zoom={14}
                  className="h-full w-full"
                >
                  <TileLayer attribution="" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Polyline positions={selectedWalk.routeCoordinates || []} pathOptions={{ color: '#00d4aa', weight: 5 }} />
                </MapContainer>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};

export default Progress;
