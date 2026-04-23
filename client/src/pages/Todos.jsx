import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import TodoItemUI from '../components/TodoItemUI';
import dayjs from 'dayjs';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';

const Todos = () => {
  const { state, addTodo, toggleTodo, deleteTodo } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('All');
  
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('general');

  useEffect(() => {
    const fetchTodosForDate = async () => {
      try {
        const res = await axios.get(`/todo?date=${currentDate}`);
        if (res.data.success) {
          setTodos(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // If it's today, we can use context state, but fetching guarantees we have the right date
    if (currentDate === dayjs().format('YYYY-MM-DD')) {
      queueMicrotask(() => setTodos(state.todos.filter(t => t.date === currentDate)));
    } else {
      fetchTodosForDate();
    }
  }, [currentDate, state.todos]);

  const handlePrevDay = () => setCurrentDate(dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD'));
  const handleNextDay = () => setCurrentDate(dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD'));
  const isToday = currentDate === dayjs().format('YYYY-MM-DD');

  const getDisplayDate = () => {
    if (isToday) return 'Today';
    if (currentDate === dayjs().subtract(1, 'day').format('YYYY-MM-DD')) return 'Yesterday';
    if (currentDate === dayjs().add(1, 'day').format('YYYY-MM-DD')) return 'Tomorrow';
    return dayjs(currentDate).format('MMM D, YYYY');
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    
    if (isToday) {
      await addTodo(newTodoText, newTodoCategory);
    } else {
      // Direct API call if not today (since context mainly tracks today)
      try {
        const res = await axios.post('/todo', { 
          text: newTodoText, 
          category: newTodoCategory, 
          date: currentDate 
        });
        if (res.data.success) setTodos([...todos, res.data.data]);
      } catch (err) { console.error(err); }
    }
    setNewTodoText('');
  };

  const handleToggle = async (id) => {
    if (isToday) {
      await toggleTodo(id);
    } else {
      try {
        const res = await axios.patch(`/todo/${id}/toggle`);
        if (res.data.success) {
          setTodos(todos.map(t => t._id === id ? res.data.data : t));
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleDelete = async (id) => {
    if (isToday) {
      await deleteTodo(id);
    } else {
      try {
        const res = await axios.delete(`/todo/${id}`);
        if (res.data.success) {
          setTodos(todos.filter(t => t._id !== id));
        }
      } catch (err) { console.error(err); }
    }
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Completed') return t.completed;
    return t.category.toLowerCase() === filter.toLowerCase();
  });

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">To-Do List</h1>
        <div className="text-sm text-[var(--text-secondary)]">
          {completedCount}/{todos.length} completed
        </div>
      </div>

      <GlassCard className="flex items-center justify-between p-3">
        <button onClick={handlePrevDay} className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="font-semibold">{getDisplayDate()}</div>
        <button onClick={handleNextDay} className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors">
          <ChevronRight size={20} />
        </button>
      </GlassCard>

      <GlassCard>
        <form onSubmit={handleAddTodo} className="sticky top-0 z-10 mb-6 flex flex-col gap-2 rounded-full bg-[var(--bg-elevated)] p-2 md:flex-row">
          <select 
            className="rounded-full"
            value={newTodoCategory}
            onChange={(e) => setNewTodoCategory(e.target.value)}
          >
            <option value="fitness">🏋️ Fitness</option>
            <option value="nutrition">🥗 Nutrition</option>
            <option value="general">📋 General</option>
          </select>
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              placeholder={`Add task for ${getDisplayDate().toLowerCase()}...`}
              className="flex-1 rounded-full"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
            />
            <button type="submit" className="btn-primary px-4">
              <Plus size={24} />
            </button>
          </div>
        </form>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {['All', 'Fitness', 'Nutrition', 'General', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-[var(--accent-teal)] text-black'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <EmptyState title="No tasks for this day" subtitle="Start fresh with one simple task." />
          ) : (
            filteredTodos.map(todo => (
              <TodoItemUI 
                key={todo._id} 
                todo={todo} 
                onToggle={handleToggle} 
                onDelete={handleDelete} 
              />
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Todos;
