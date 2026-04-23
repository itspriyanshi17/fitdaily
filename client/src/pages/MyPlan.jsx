import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  Flame, Droplets, Target, Activity, Dumbbell, 
  Utensils, ChevronRight, AlertCircle, Info, Calendar, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

const MyPlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'workout', 'diet', 'progress'
  const [selectedWeek, setSelectedWeek] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get('/plan/my-plan');
        setPlan(res.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/diet-register');
        } else {
          toast.error('Failed to load your plan');
          setLoading(false);
        }
      }
    };
    fetchPlan();
  }, [navigate]);

  if (loading) return <div className="text-center mt-20 text-gray-400">Loading your plan...</div>;
  if (!plan) return null;

  const { calculations, workoutPlan, dietPlan } = plan;

  const chartData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{
      data: [calculations.proteinGoal, calculations.carbsGoal, calculations.fatGoal],
      backgroundColor: ['#f59e0b', '#14b8a6', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const chartOptions = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.parsed}g`
        }
      }
    }
  };

  const currentWeekPlan = workoutPlan.weeks.find(w => w.weekNumber === selectedWeek);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target size={150} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              calculations.bmiCategory === 'Normal' ? 'bg-green-500/20 text-green-300' :
              calculations.bmiCategory === 'Overweight' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              BMI: {calculations.bmi} ({calculations.bmiCategory})
            </span>
            <span className="px-4 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider">
              {workoutPlan.planName}
            </span>
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2">{dietPlan.planName}</h1>
          <p className="text-indigo-200 text-lg mb-6">
            Target: {plan.profile.weight}kg → {plan.profile.targetWeight}kg in {plan.profile.timePeriod} weeks
          </p>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5 min-w-[140px]">
              <div className="flex items-center gap-2 text-indigo-300 mb-1">
                <Flame size={16} /> Daily Calories
              </div>
              <div className="text-2xl font-bold text-white">{Math.round(calculations.targetCalories)} <span className="text-sm font-normal text-gray-400">kcal</span></div>
            </div>
            <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5 min-w-[140px]">
              <div className="flex items-center gap-2 text-indigo-300 mb-1">
                <Dumbbell size={16} /> Protein
              </div>
              <div className="text-2xl font-bold text-white">{calculations.proteinGoal} <span className="text-sm font-normal text-gray-400">g</span></div>
            </div>
            <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5 min-w-[140px]">
              <div className="flex items-center gap-2 text-indigo-300 mb-1">
                <Droplets size={16} /> Water
              </div>
              <div className="text-2xl font-bold text-white">{(calculations.waterGoal / 1000).toFixed(1)} <span className="text-sm font-normal text-gray-400">L</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10">
        {['overview', 'workout', 'diet', 'progress'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold text-sm capitalize whitespace-nowrap transition-all ${
              activeTab === tab 
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">Macro Distribution</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-40 h-40 relative shrink-0">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white">{Math.round(calculations.targetCalories)}</span>
                    <span className="text-xs text-gray-400">kcal</span>
                  </div>
                </div>
                <div className="space-y-4 w-full sm:flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-amber-500 font-bold">Protein</span>
                      <span className="text-white">{calculations.proteinGoal}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[35%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-teal-500 font-bold">Carbs</span>
                      <span className="text-white">{calculations.carbsGoal}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-teal-500 w-[35%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-500 font-bold">Fat</span>
                      <span className="text-white">{calculations.fatGoal}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[30%]"></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4">Plan Summary</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                  <Activity className="text-blue-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold">BMR & TDEE</h4>
                    <p className="text-gray-400 text-sm">Your basal metabolic rate is {calculations.bmr} kcal. With your activity level, you burn ~{calculations.tdee} kcal daily.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                  <Target className="text-red-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold">Weekly Goal</h4>
                    <p className="text-gray-400 text-sm">Targeting {calculations.weeklyWeightChange} kg per week to reach your goal safely.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-[var(--bg-card)] rounded-3xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4">Recommended Supplements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {dietPlan.supplements.map((supp, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-white font-bold">{supp.name}</h4>
                    <p className="text-sm text-[var(--color-primary)] my-1">{supp.dose}</p>
                    <p className="text-xs text-gray-400">{supp.timing}</p>
                    {supp.required && <span className="mt-2 inline-block px-2 py-1 bg-red-500/20 text-red-400 text-[10px] uppercase font-bold rounded">Essential</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKOUT TAB */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {workoutPlan.weeks.map(w => (
                <button
                  key={w.weekNumber}
                  onClick={() => setSelectedWeek(w.weekNumber)}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedWeek === w.weekNumber 
                    ? 'bg-[var(--color-primary)] text-black' 
                    : 'bg-[var(--bg-card)] text-white hover:bg-white/10'
                  }`}
                >
                  Week {w.weekNumber}
                </button>
              ))}
            </div>

            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-white/5">
              {currentWeekPlan ? (
                <>
                  <h3 className="text-xl font-black text-[var(--color-primary)] mb-1">{currentWeekPlan.theme}</h3>
                  <p className="text-gray-400 mb-6">Focus: {workoutPlan.focusAreas?.join(', ')} • {workoutPlan.daysPerWeek} days/week</p>

                  <div className="space-y-4">
                    {currentWeekPlan.days.map((day, i) => (
                      <div key={i} className={`p-5 rounded-2xl border ${day.type === 'rest' ? 'border-green-500/20 bg-green-500/5' : 'border-white/5 bg-white/5'} overflow-hidden`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-400 uppercase tracking-wider text-sm w-10">{day.day.substring(0,3)}</span>
                            <h4 className={`text-lg font-bold ${day.type === 'rest' ? 'text-green-400' : 'text-white'}`}>{day.title}</h4>
                          </div>
                          {day.type !== 'rest' && (
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1"><Clock size={14} /> {day.duration}m</span>
                              <span className="flex items-center gap-1"><Flame size={14} /> {day.estimatedCalories}</span>
                            </div>
                          )}
                        </div>
                        
                        {day.type !== 'rest' && day.exercises.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5 grid gap-3">
                            {day.exercises.map((ex, j) => (
                              <div key={j} className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">{j+1}</div>
                                  <div>
                                    <h5 className="text-white font-medium">{ex.name}</h5>
                                    <p className="text-xs text-gray-400">{ex.sets} sets × {ex.reps}</p>
                                  </div>
                                </div>
                                {ex.videoUrl && (
                                  <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                                    <ChevronRight size={16} />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-400">No workout plan available for this week.</p>
              )}
            </div>
          </div>
        )}

        {/* DIET TAB */}
        {activeTab === 'diet' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2"><AlertCircle size={16} /> Avoid</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {dietPlan.foodsToAvoid.map((food, i) => <li key={i}>• {food}</li>)}
                </ul>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2"><AlertCircle size={16} /> Include</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {dietPlan.foodsToInclude.map((food, i) => <li key={i}>• {food}</li>)}
                </ul>
              </div>
              <div className="col-span-2 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2"><Info size={16} /> Tips</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {dietPlan.tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Daily Meals</h3>
            <div className="space-y-4">
              {dietPlan.meals.map((meal, i) => (
                <div key={i} className="bg-[var(--bg-card)] border border-white/5 rounded-3xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-white">{meal.mealName}</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-gray-300">{meal.time}</span>
                    </div>
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="text-gray-400">{meal.calories} kcal</span>
                      <span className="text-amber-500">{meal.protein}g P</span>
                      <span className="text-teal-500">{meal.carbs}g C</span>
                    </div>
                  </div>
                  
                  <div className="p-4 flex gap-4 overflow-x-auto scrollbar-hide">
                    {meal.options.map((opt, j) => (
                      <div key={j} className="min-w-[280px] p-4 rounded-2xl bg-black/20 border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-indigo-300">{opt.name}</h5>
                          {opt.isVeg && <span className="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>}
                        </div>
                        <p className="text-xs text-gray-400 mb-3">{opt.prepTime} min prep</p>
                        <div className="text-sm text-gray-300 mb-3">
                          <strong>Ingredients:</strong>
                          <ul className="list-disc pl-4 mt-1 opacity-80">
                            {opt.ingredients.map((ing, k) => <li key={k}>{ing}</li>)}
                          </ul>
                        </div>
                        <p className="text-xs text-gray-400 italic bg-white/5 p-2 rounded-lg">{opt.recipe}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 p-6 rounded-2xl mt-6 text-center">
              <h4 className="text-[var(--color-primary)] font-bold text-lg mb-2">Cheat Meal Policy</h4>
              <p className="text-gray-300">{dietPlan.weeklyCheatMeal}</p>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-white/5 text-center">
              <Calendar size={48} className="mx-auto text-[var(--color-primary)] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Estimated Completion</h3>
              <p className="text-xl text-gray-300 mb-6">{new Date(calculations.estimatedCompletionDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[var(--color-primary)] w-[10%]"></div>
              </div>
              <p className="text-gray-400 text-sm">You are just getting started! Stay consistent.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyPlan;
