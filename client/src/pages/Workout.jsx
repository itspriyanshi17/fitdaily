import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { CheckCircle, Flame, Clock, PlayCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const Workout = () => {
  const { state, markWorkoutComplete } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState(dayjs().format('dddd'));
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workoutMinutes, setWorkoutMinutes] = useState(30);
  const [workoutIntensity, setWorkoutIntensity] = useState('moderate');
  const [selectedExercise, setSelectedExercise] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchWorkout = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/workout/${activeDay}`);
        if (res.data.success) {
          setWorkoutData(res.data.data);
        }
      } catch {
        setWorkoutData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [activeDay]);

  const handleMarkDone = async () => {
    if (activeDay !== dayjs().format('dddd')) {
      toast.error("You can only mark today's workout as done.");
      return;
    }
    
    const result = await markWorkoutComplete({
      durationMinutes: workoutMinutes,
      intensity: workoutIntensity,
    });
    if (result.success) {
      toast.success(`Workout complete! +${result.caloriesAdded} kcal added.`);
      navigate('/');
    }
  };

  const isToday = activeDay === dayjs().format('dddd');
  const isDoneToday = isToday && state.todayLog?.log?.workoutCompleted;

  return (
    <div className="space-y-6 pb-6">
      <GlassCard className="gradient-border-left">
        <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Today's Workout</p>
        <h1 className="text-3xl font-bold">{workoutData?.title || 'Workout Plan'} 💪</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {activeDay} • {workoutData?.exercises?.length || 0} exercises • ~{workoutData?.estimatedCaloriesBurn || 0} kcal • {workoutMinutes} min
        </p>
      </GlassCard>

      <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              activeDay === day 
                ? 'bg-[var(--accent-teal)] text-black' 
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            {day.slice(0, 2)}
            {day === dayjs().format('dddd') ? ' •' : ''}
          </button>
        ))}
      </div>

      <GlassCard>
        {loading ? (
          <p className="text-[var(--text-secondary)]">Loading workout...</p>
        ) : workoutData ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--accent-teal)]">{workoutData.title}</h2>
                <div className="flex items-center text-[var(--text-secondary)] mt-1 space-x-2 text-sm">
                  <Flame size={15} className="text-orange-500" />
                  <span>~{workoutData.estimatedCaloriesBurn} kcal burn</span>
                  <Clock size={15} className="ml-2" />
                  <span>{workoutMinutes} min</span>
                </div>
              </div>
              {isToday && isDoneToday && (
                <div className="bg-[var(--color-success)]/20 text-[var(--color-success)] px-3 py-1 rounded-full flex items-center space-x-1 text-sm border border-[var(--color-success)]/30">
                  <CheckCircle size={14} />
                  <span>Completed</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {workoutData.exercises.map((ex, idx) => (
                <div key={idx} className="glass-card flex flex-col gap-4 border-l-4 border-l-[var(--accent-teal)] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{idx + 1}. {ex.name}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {ex.sets && ex.reps ? `${ex.sets} sets × ${ex.reps} reps` : `${ex.sets} sets × ${ex.time}`}
                    </p>
                  </div>
                  {ex.videoUrl && (
                    <Button variant="secondary" onClick={() => setSelectedExercise(ex)}>
                      <PlayCircle size={16} /> Watch
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {isToday && !isDoneToday && (
              <>
                <div className="mt-8 p-4 rounded-lg border border-[#333] bg-[#1d1d1d] space-y-4">
                  <h3 className="font-semibold">Auto calorie calculation</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Workout duration (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={workoutMinutes}
                        onChange={(e) => setWorkoutMinutes(Math.max(5, Number(e.target.value) || 5))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Intensity</label>
                      <select
                        value={workoutIntensity}
                        onChange={(e) => setWorkoutIntensity(e.target.value)}
                        className="w-full"
                      >
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleMarkDone}
                  className="w-full btn-primary py-3 mt-4 flex justify-center items-center space-x-2"
                >
                  <CheckCircle size={20} />
                  <span>Mark Workout as Done</span>
                </button>
              </>
            )}
          </>
        ) : (
          <EmptyState title="Rest Day 💚" subtitle="Recovery is part of training. Stretch, hydrate, and sleep well." />
        )}
      </GlassCard>

      <Modal open={Boolean(selectedExercise)} onClose={() => setSelectedExercise(null)} title={selectedExercise?.name || 'Exercise'}>
        {selectedExercise?.videoUrl ? (
          <div className="space-y-3">
            <div className="aspect-video overflow-hidden rounded-lg border border-[var(--border-subtle)]">
              <iframe className="h-full w-full" src={selectedExercise.videoUrl} title={selectedExercise.name} allowFullScreen />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{selectedExercise.sets} sets × {selectedExercise.reps}</p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Workout;
