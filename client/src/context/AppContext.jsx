import { createContext, useReducer } from 'react';
import axios from 'axios';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();
const initialState = {
  todayLog: null,
  streak: 0,
  todos: [],
  workoutPlan: null,
  loading: false,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TODAY_LOG':
      return { ...state, todayLog: action.payload, streak: action.payload.streak };
    case 'UPDATE_LOG':
      return {
        ...state,
        todayLog: state.todayLog
          ? { ...state.todayLog, log: action.payload }
          : { log: action.payload, streak: state.streak },
      };
    case 'SET_TODOS':
      return { ...state, todos: action.payload };
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(t => t._id === action.payload._id ? action.payload : t)
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(t => t._id !== action.payload)
      };
    case 'SET_WORKOUT_PLAN':
      return { ...state, workoutPlan: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const fetchTodayData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [logRes, todoRes, workoutRes] = await Promise.all([
        axios.get('/log/today'),
        axios.get('/todo'),
        axios.get('/workout/today')
      ]);

      if (logRes.data.success) {
        dispatch({ type: 'SET_TODAY_LOG', payload: logRes.data.data });
      }
      if (todoRes.data.success) {
        dispatch({ type: 'SET_TODOS', payload: todoRes.data.data });
      }
      if (workoutRes.data.success) {
        dispatch({ type: 'SET_WORKOUT_PLAN', payload: workoutRes.data.data });
      }
    } catch (err) {
      console.error('Error fetching today data', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addWater = async (amount) => {
    try {
      const res = await axios.post('/log/water', { amount });
      if (res.data.success) dispatch({ type: 'UPDATE_LOG', payload: res.data.data });
    } catch (err) { console.error(err); }
  };

  const addProtein = async (amount) => {
    try {
      const res = await axios.post('/log/protein', { amount });
      if (res.data.success) dispatch({ type: 'UPDATE_LOG', payload: res.data.data });
    } catch (err) { console.error(err); }
  };

  const addCalories = async (calories) => {
    try {
      const res = await axios.post('/log/calories', { calories });
      if (res.data.success) dispatch({ type: 'UPDATE_LOG', payload: res.data.data });
    } catch (err) { console.error(err); }
  };

  const addSteps = async (steps) => {
    try {
      const res = await axios.post('/log/steps', { steps });
      if (res.data.success) dispatch({ type: 'UPDATE_LOG', payload: res.data.data });
    } catch (err) { console.error(err); }
  };

  const markWorkoutComplete = async (workoutInput = {}) => {
    try {
      const res = await axios.post('/log/workout', workoutInput);
      if (res.data.success) {
        dispatch({ type: 'UPDATE_LOG', payload: res.data.data });
        return { success: true, caloriesAdded: res.data.caloriesAdded || 0 };
      }
      return { success: false, caloriesAdded: 0 };
    } catch (err) { console.error(err); return { success: false, caloriesAdded: 0 }; }
  };

  const addTodo = async (text, category) => {
    try {
      const res = await axios.post('/todo', { text, category });
      if (res.data.success) dispatch({ type: 'ADD_TODO', payload: res.data.data });
    } catch (err) { console.error(err); }
  };

  const toggleTodo = async (id) => {
    try {
      const res = await axios.patch(`/todo/${id}/toggle`);
      if (res.data.success) dispatch({ type: 'TOGGLE_TODO', payload: res.data.data });
    } catch (err) { console.error(err); }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await axios.delete(`/todo/${id}`);
      if (res.data.success) dispatch({ type: 'DELETE_TODO', payload: id });
    } catch (err) { console.error(err); }
  };

  return (
    <AppContext.Provider value={{
      state,
      fetchTodayData,
      addWater,
      addProtein,
      addCalories,
      addSteps,
      markWorkoutComplete,
      addTodo,
      toggleTodo,
      deleteTodo
    }}>
      {children}
    </AppContext.Provider>
  );
};
