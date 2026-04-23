import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import CircularRing from '../components/CircularRing';
import ProgressBar from '../components/ProgressBar';
import TodoItemUI from '../components/TodoItemUI';
import { Link } from 'react-router-dom';
import { Droplets, Footprints, Flame, Plus, CheckCircle, Award, Bell, ArrowRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import StatPill from '../components/ui/StatPill';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import dayjs from 'dayjs';

const Home = () => {
  const { user } = useContext(AuthContext);
  const { 
    state, 
    fetchTodayData, 
    addWater, 
    addProtein, 
    addCalories, 
    addSteps, 
    addTodo,
    toggleTodo,
    deleteTodo
  } = useContext(AppContext);
  
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('fitness');

  useEffect(() => {
    fetchTodayData();
  }, []);

  if (state.loading || !state.todayLog) {
    return <div className="flex justify-center mt-20">Loading...</div>;
  }

  const { log, streak } = state.todayLog;
  const { goals } = user;
  
  // Score calculations
  const maxScore = 80;
  const score = log.score || 0;
  
  let scoreColor = 'var(--color-primary)';
  if (score < 30) scoreColor = 'var(--color-error)';
  else if (score < 60) scoreColor = 'var(--color-warning)';

  const getMotivation = () => {
    if (score === 0) return "Let's get moving today! 💪";
    if (score < 40) return "Good start, keep going! 🔥";
    return "Crushing it today! 🏆";
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    addTodo(newTodoText, newTodoCategory);
    setNewTodoText('');
  };

  const todayTodos = state.todos.filter(t => t.date === log.date).slice(0, 5);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Good {dayjs().hour() < 12 ? 'Morning' : dayjs().hour() < 17 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-[var(--text-secondary)]">{dayjs().format('dddd, D MMMM')} • Let's crush it today</p>
        </div>
        <button className="relative rounded-full bg-[var(--bg-card)] p-3 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]">
          <Bell size={18} />
          <span className="pulse-dot absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>
      </div>

      <GlassCard className="gradient-border-left">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Today's Score</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold text-[var(--accent-teal)]">{score}</span>
              <span className="pb-1 text-2xl text-[var(--text-secondary)]">/ {maxScore}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{getMotivation()}</p>
          </div>
          <CircularRing value={score} max={maxScore} size={86} strokeWidth={8} color={scoreColor} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatPill value="💧+10" label="" color="teal" />
          <StatPill value="💪+30" label="" color="purple" />
          <StatPill value={`🚶${log.steps >= goals.stepGoal ? '+20' : '❌'}`} label="" color="blue" />
          <StatPill value="🥩+10" label="" color="amber" />
          <StatPill value="🔥+10" label="" color="rose" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 font-semibold">
              <Droplets className="text-[var(--accent-teal)]" size={20} />
              <h3 className="font-semibold">Water</h3>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{goals.waterGoal}ml goal</span>
          </div>
          <div className="water-glass">
            <div className="water-fill" style={{ height: `${Math.min(100, Math.round((log.waterIntake / goals.waterGoal) * 100))}%` }} />
          </div>
          <p className="text-center text-lg font-bold">{log.waterIntake} / {goals.waterGoal} ml</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[250, 500, 750, 1000].map((ml) => (
              <button key={ml} onClick={() => addWater(ml)} className="btn-secondary px-3 py-1 text-xs">+{ml}ml</button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Award className="text-[var(--accent-amber)]" size={20} />
              <h3 className="font-semibold">Protein</h3>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{goals.proteinGoal}g goal</span>
          </div>
          <ProgressBar value={log.proteinIntake} max={goals.proteinGoal} color="amber" />
          <div className="flex justify-between items-end text-sm">
            <div>
              <span className="text-[var(--text-secondary)] block mb-1">{log.proteinIntake} / {goals.proteinGoal} g</span>
              <span className="text-[10px] text-[var(--text-muted)]">🥚 🍗 🧀 🥛</span>
            </div>
            <div className="flex space-x-1">
              {[10, 20, 30, 50].map(amt => (
                <button 
                  key={amt}
                  onClick={() => addProtein(amt)}
                  className="btn-secondary px-2 py-1 text-xs"
                >
                  +{amt}g
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-6">
          <CircularRing value={log.caloriesBurned} max={goals.caloriesBurnGoal} size={90} strokeWidth={8} color="var(--accent-rose)">
            <Flame size={20} className="text-[var(--color-calories)]" />
          </CircularRing>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Calories Burned</h3>
              {log.caloriesBurned >= goals.caloriesBurnGoal && <CheckCircle size={16} className="text-[var(--color-success)]" />}
            </div>
            <p className="text-[var(--text-secondary)] text-sm mt-1">{log.caloriesBurned} / {goals.caloriesBurnGoal} kcal</p>
            <button 
              onClick={() => addCalories(50)}
              className="mt-2 text-[10px] rounded-full bg-[var(--accent-rose-dim)] px-2 py-1 text-[var(--accent-rose)] border border-rose-400/30"
            >
              +50 kcal
            </button>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">Auto-updated when workout done</p>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Footprints className="text-[var(--accent-blue)]" size={20} />
              <h3 className="font-semibold">Steps</h3>
            </div>
            {log.steps >= goals.stepGoal && <CheckCircle size={20} className="text-[var(--color-success)]" />}
          </div>
          <div className="flex items-center gap-4">
            <CircularRing value={log.steps} max={goals.stepGoal} size={100} strokeWidth={8} color="var(--accent-blue)" />
            <div>
              <p className="text-2xl font-bold">{log.steps.toLocaleString()} steps</p>
              <p className="text-sm text-[var(--text-secondary)]">Goal: {goals.stepGoal.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">~{(log.steps / 1312).toFixed(1)} km • ~{Math.round((log.steps / 1312) * 60)} kcal</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[500, 1000, 2000, 5000].map((step) => (
              <button key={step} onClick={() => addSteps(step)} className="btn-secondary px-3 py-1 text-xs">+{step}</button>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="gradient-border-left flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="font-semibold text-lg">Today's Workout</h3>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {state.workoutPlan ? `${state.workoutPlan.day} - ${state.workoutPlan.title}` : 'Rest Day'}
          </p>
        </div>
        {log.workoutCompleted ? (
          <div className="bg-[var(--color-success)]/20 text-[var(--color-success)] px-4 py-2 rounded-lg flex items-center justify-center space-x-2 font-medium border border-[var(--color-success)]/30">
            <CheckCircle size={18} />
            <span>Completed</span>
          </div>
        ) : (
          <Link to="/workout" className="btn-primary px-6 py-2 flex items-center justify-center gap-2">
            Start Workout <ArrowRight size={16} />
          </Link>
        )}
      </GlassCard>

      <GlassCard>
        <SectionHeader
          title="Today's Tasks"
          subtitle={`${todayTodos.filter((t) => t.completed).length}/${todayTodos.length} done`}
          action={<Link to="/todos" className="text-sm text-[var(--accent-teal)]">View All →</Link>}
        />
        
        <form onSubmit={handleAddTodo} className="flex space-x-2 mb-4">
          <select 
            className="text-sm"
            value={newTodoCategory}
            onChange={(e) => setNewTodoCategory(e.target.value)}
          >
            <option value="fitness">🏋️ Fitness</option>
            <option value="nutrition">🥗 Nutrition</option>
            <option value="general">📋 General</option>
          </select>
          <input
            type="text"
            placeholder="Add a task..."
            className="flex-1 text-sm"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
          />
          <button type="submit" className="btn-primary px-4">
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-2">
          {todayTodos.length === 0 ? (
            <EmptyState title="No tasks today. Add one! ✨" subtitle="Keep momentum with one small task." />
          ) : (
            todayTodos.map(todo => (
              <TodoItemUI 
                key={todo._id} 
                todo={todo} 
                onToggle={toggleTodo} 
                onDelete={deleteTodo} 
              />
            ))
          )}
        </div>
      </GlassCard>

      <div className="rounded-[var(--radius-lg)] border border-[var(--accent-teal)]/30 bg-gradient-to-r from-[var(--accent-teal-dim)] to-[var(--accent-purple-dim)] p-4">
        <p className="text-sm font-semibold">💡 Did you know?</p>
        <p className="text-sm text-[var(--text-secondary)]">Consistency matters more than intensity. A 30-minute daily walk can dramatically improve your weekly score.</p>
      </div>
    </div>
  );
};

export default Home;
