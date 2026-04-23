import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Target, Activity, Salad, Dumbbell, 
  Clock, Heart, ChevronRight, ChevronLeft, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const DietRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const [formData, setFormData] = useState({
    age: 25,
    gender: '',
    weight: 70,
    height: 170,
    activityLevel: '',
    goal: '',
    targetWeight: 65,
    timePeriod: 12,
    dietType: '',
    allergies: [],
    mealsPerDay: 3,
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    workoutPreference: '',
    fitnessLevel: '',
    medicalConditions: [],
    stressLevel: ''
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 10));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
      // If selecting 'None', clear others
      if (value === 'None') return { ...prev, [field]: ['None'] };
      // If selecting something else, remove 'None'
      const withoutNone = current.filter(item => item !== 'None');
      return { ...prev, [field]: [...withoutNone, value] };
    });
  };

  const calculateLiveBMI = () => {
    const h = formData.height / 100;
    const bmi = (formData.weight / (h * h)).toFixed(1);
    let category = "Normal";
    let color = "text-green-400 border-green-400";
    if (bmi < 18.5) { category = "Underweight"; color = "text-blue-400 border-blue-400"; }
    else if (bmi >= 25 && bmi < 30) { category = "Overweight"; color = "text-yellow-400 border-yellow-400"; }
    else if (bmi >= 30) { category = "Obese"; color = "text-red-400 border-red-400"; }
    return { bmi, category, color };
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    const steps = [
      "Calculating your BMI...",
      "Analyzing your goals...",
      "Building workout schedule...",
      "Creating your diet plan...",
      "Personalizing recommendations..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingText(steps[i]);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      await axios.post('/plan/register', formData);
      toast.success('Plan generated successfully!');
      navigate('/my-plan');
    } catch (err) {
      toast.error('Failed to generate plan. Please try again.');
      setIsGenerating(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const OptionCard = ({ selected, onClick, icon: Icon, title, subtitle }) => (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl cursor-pointer border-2 transition-all duration-300 flex flex-col items-center text-center gap-3 ${
        selected 
        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
        : 'border-white/10 hover:border-white/30 bg-white/5'
      }`}
    >
      {Icon && <Icon size={32} className={selected ? 'text-[var(--color-primary)]' : 'text-gray-400'} />}
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-4">
              <Target size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Let's Build Your Personal Fitness Plan 🎯
            </h1>
            <p className="text-gray-400 text-lg">
              Answer 10 quick questions to get a fully tailored workout and diet schedule. Takes just 2 minutes.
            </p>
            <button 
              onClick={nextStep}
              className="mt-8 px-8 py-4 bg-[var(--color-primary)] text-[var(--color-bg)] font-bold rounded-full text-lg hover:shadow-[0_0_20px_var(--color-primary)] transition-all flex items-center gap-2"
            >
              Get Started <ChevronRight size={24} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 w-full max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Tell us about yourself</h2>
            <div className="space-y-6">
              <div>
                <label className="text-gray-300 font-medium mb-2 block">Age ({formData.age} years)</label>
                <input 
                  type="range" min="15" max="70" 
                  value={formData.age} 
                  onChange={(e) => handleSelect('age', Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-gray-300 font-medium mb-4 block">Gender</label>
                <div className="grid grid-cols-3 gap-4">
                  {['male', 'female', 'other'].map(g => (
                    <OptionCard 
                      key={g} 
                      title={g.charAt(0).toUpperCase() + g.slice(1)} 
                      selected={formData.gender === g}
                      onClick={() => handleSelect('gender', g)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        const { bmi, category, color } = calculateLiveBMI();
        return (
          <div className="space-y-8 w-full max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Current Measurements</h2>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg">
              <p className="text-gray-400 mb-2">Live BMI Preview</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl font-black text-white">{bmi}</span>
                <span className={`px-4 py-1 border rounded-full text-sm font-bold ${color}`}>{category}</span>
              </div>
            </div>

            <div className="space-y-6 mt-8">
              <div>
                <div className="flex justify-between text-gray-300 font-medium mb-2">
                  <label>Current Weight</label>
                  <span>{formData.weight} kg</span>
                </div>
                <input 
                  type="range" min="30" max="150" 
                  value={formData.weight} 
                  onChange={(e) => handleSelect('weight', Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>
              <div>
                <div className="flex justify-between text-gray-300 font-medium mb-2">
                  <label>Height</label>
                  <span>{formData.height} cm</span>
                </div>
                <input 
                  type="range" min="140" max="210" 
                  value={formData.height} 
                  onChange={(e) => handleSelect('height', Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">What's your main goal?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OptionCard 
                icon={Target} title="Lose Weight" subtitle="Burn fat and get lean"
                selected={formData.goal === 'lose_weight'} onClick={() => handleSelect('goal', 'lose_weight')}
              />
              <OptionCard 
                icon={Dumbbell} title="Build Muscle" subtitle="Gain strength and mass"
                selected={formData.goal === 'gain_muscle'} onClick={() => handleSelect('goal', 'gain_muscle')}
              />
              <OptionCard 
                icon={Activity} title="Stay Fit" subtitle="Maintain current physique"
                selected={formData.goal === 'maintain'} onClick={() => handleSelect('goal', 'maintain')}
              />
              <OptionCard 
                icon={Heart} title="Improve Fitness" subtitle="Better endurance and health"
                selected={formData.goal === 'improve_fitness'} onClick={() => handleSelect('goal', 'improve_fitness')}
              />
            </div>
          </div>
        );

      case 5:
        const weightDiff = formData.targetWeight - formData.weight;
        const weeklyChange = (weightDiff / formData.timePeriod).toFixed(2);
        const isHealthy = Math.abs(weeklyChange) <= 1.0;
        
        return (
          <div className="space-y-8 w-full max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Target & Timeline</h2>
            
            {formData.goal !== 'maintain' && (
              <div>
                <div className="flex justify-between text-gray-300 font-medium mb-2">
                  <label>Target Weight</label>
                  <span>{formData.targetWeight} kg</span>
                </div>
                <input 
                  type="range" min="30" max="150" 
                  value={formData.targetWeight} 
                  onChange={(e) => handleSelect('targetWeight', Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>
            )}

            <div>
              <label className="text-gray-300 font-medium mb-4 block">Time Period (Weeks)</label>
              <div className="flex flex-wrap gap-3">
                {[4, 8, 12, 16, 24].map(w => (
                  <button
                    key={w}
                    onClick={() => handleSelect('timePeriod', w)}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                      formData.timePeriod === w 
                      ? 'bg-[var(--color-primary)] text-black' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {w} Weeks
                  </button>
                ))}
              </div>
            </div>

            {formData.goal !== 'maintain' && (
              <div className={`p-4 rounded-xl border ${isHealthy ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'} flex items-start gap-3`}>
                <Clock className="shrink-0 mt-1" />
                <div>
                  <p className="font-bold">Projection: {Math.abs(weeklyChange)} kg / week</p>
                  <p className="text-sm opacity-80">
                    {isHealthy ? "This is a healthy and sustainable rate of progress." : "Warning: This is an aggressive pace. A healthy rate is up to 1kg/week."}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 w-full max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">How active are you?</h2>
            <div className="space-y-3">
              {[
                { id: 'sedentary', icon: '🛋️', title: 'Sedentary', desc: 'Desk job, little to no exercise' },
                { id: 'light', icon: '🚶', title: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                { id: 'moderate', icon: '🏃', title: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                { id: 'active', icon: '💪', title: 'Very Active', desc: 'Heavy exercise 6-7 days/week' },
                { id: 'very_active', icon: '🔥', title: 'Athlete', desc: 'Very heavy training twice a day' },
              ].map(level => (
                <div 
                  key={level.id}
                  onClick={() => handleSelect('activityLevel', level.id)}
                  className={`p-4 rounded-xl cursor-pointer border flex items-center gap-4 transition-all ${
                    formData.activityLevel === level.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                >
                  <span className="text-3xl">{level.icon}</span>
                  <div>
                    <h4 className="text-white font-bold">{level.title}</h4>
                    <p className="text-gray-400 text-sm">{level.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8 w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Diet Preferences</h2>
            
            <div>
              <label className="text-gray-300 font-medium mb-3 block">Diet Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'vegetarian', label: '🌱 Vegetarian' },
                  { id: 'non_vegetarian', label: '🍗 Non-Veg' },
                  { id: 'vegan', label: '🥦 Vegan' },
                  { id: 'eggetarian', label: '🥚 Eggetarian' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleSelect('dietType', type.id)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                      formData.dietType === type.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-medium mb-3 block">Meals per Day</label>
              <div className="flex gap-3">
                {[3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleSelect('mealsPerDay', num)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                      formData.mealsPerDay === num
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'border-white/10 bg-white/5 text-gray-300'
                    }`}
                  >
                    {num} Meals
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-medium mb-3 block">Allergies / Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {['Dairy', 'Gluten', 'Nuts', 'Soy', 'None'].map(item => (
                  <button
                    key={item}
                    onClick={() => handleMultiSelect('allergies', item)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                      formData.allergies.includes(item)
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-8 w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Workout Details</h2>
            
            <div>
              <label className="text-gray-300 font-medium mb-3 block">Location Preference</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'home', label: '🏠 Home (No Equip)' },
                  { id: 'gym', label: '🏋️ Gym' }
                ].map(loc => (
                  <OptionCard 
                    key={loc.id} title={loc.label}
                    selected={formData.workoutPreference === loc.id} 
                    onClick={() => handleSelect('workoutPreference', loc.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-medium mb-3 block">Current Fitness Level</label>
              <div className="flex gap-3">
                {[
                  { id: 'beginner', label: '🌱 Beginner' },
                  { id: 'intermediate', label: '🔥 Intermediate' },
                  { id: 'advanced', label: '⚡ Advanced' }
                ].map(level => (
                  <button
                    key={level.id}
                    onClick={() => handleSelect('fitnessLevel', level.id)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
                      formData.fitnessLevel === level.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'border-white/10 bg-white/5 text-gray-300'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-8 w-full max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Daily Schedule & Lifestyle</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-gray-300 font-medium mb-2 block">Wake up time</label>
                <input 
                  type="time" 
                  value={formData.wakeUpTime} 
                  onChange={(e) => handleSelect('wakeUpTime', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-gray-300 font-medium mb-2 block">Sleep time</label>
                <input 
                  type="time" 
                  value={formData.sleepTime} 
                  onChange={(e) => handleSelect('sleepTime', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-medium mb-4 block">Stress Level</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'low', label: '😌 Low' },
                  { id: 'medium', label: '😐 Medium' },
                  { id: 'high', label: '😫 High' }
                ].map(s => (
                  <OptionCard 
                    key={s.id} title={s.label}
                    selected={formData.stressLevel === s.id} 
                    onClick={() => handleSelect('stressLevel', s.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="flex flex-col items-center justify-center space-y-8 min-h-[400px]">
            <div className="w-24 h-24 relative">
              <svg className="animate-spin w-full h-full text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Salad className="text-[var(--color-primary)] animate-pulse" size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Generating Your Master Plan</h2>
            
            <div className="w-full max-w-sm space-y-4">
              <p className="text-[var(--color-primary)] text-center font-medium animate-pulse">{loadingText || "Processing..."}</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-primary)] transition-all duration-1000 ease-out" 
                  style={{ width: loadingText === "Personalizing recommendations..." ? "100%" : loadingText ? "75%" : "25%" }}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch(step) {
      case 2: return formData.gender !== '';
      case 4: return formData.goal !== '';
      case 6: return formData.activityLevel !== '';
      case 7: return formData.dietType !== '' && formData.allergies.length > 0;
      case 8: return formData.workoutPreference !== '' && formData.fitnessLevel !== '';
      case 9: return formData.stressLevel !== '';
      default: return true;
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col pt-10">
      
      {/* Progress Bar */}
      {step < 10 && (
        <div className="w-full max-w-2xl mx-auto mb-10 flex gap-2">
          {[1,2,3,4,5,6,7,8,9].map(i => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 w-full"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {step > 1 && step < 10 && (
        <div className="w-full max-w-2xl mx-auto mt-10 flex justify-between">
          <button 
            onClick={prevStep}
            className="px-6 py-3 rounded-full text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 font-bold"
          >
            <ChevronLeft size={20} /> Back
          </button>
          
          {step === 9 ? (
            <button 
              onClick={() => {
                setStep(10);
                generatePlan();
              }}
              disabled={!isStepValid()}
              className="px-8 py-3 rounded-full text-black bg-[var(--color-primary)] hover:shadow-[0_0_20px_var(--color-primary)] transition-all flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Plan <Target size={20} />
            </button>
          ) : (
            <button 
              onClick={nextStep}
              disabled={!isStepValid()}
              className="px-8 py-3 rounded-full text-black bg-white hover:bg-gray-200 transition-colors flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DietRegister;
