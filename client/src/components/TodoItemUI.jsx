import React from 'react';
import { Check, Trash2 } from 'lucide-react';

const TodoItemUI = ({ todo, onToggle, onDelete }) => {
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'fitness': return 'border-l-[var(--color-fitness)]';
      case 'nutrition': return 'border-l-[var(--color-nutrition)]';
      default: return 'border-l-[var(--color-general)]';
    }
  };

  const getBadgeColor = (cat) => {
    switch (cat) {
      case 'fitness': return 'bg-[var(--color-fitness)] text-black';
      case 'nutrition': return 'bg-[var(--color-nutrition)] text-black';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className={`glass-card flex items-center justify-between border-l-4 py-3 ${getCategoryColor(todo.category)} animate-fade-in`}>
      <div className="flex items-center space-x-3 flex-1 overflow-hidden">
        <button 
          onClick={() => onToggle(todo._id)}
          className={`h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
            todo.completed ? 'border-[var(--color-success)] bg-[var(--color-success)]' : 'border-[var(--border-default)]'
          }`}
        >
          {todo.completed && <Check size={14} className="text-white" />}
        </button>
        <div className="flex flex-col truncate pr-2">
          <span className={`truncate text-sm transition-all ${todo.completed ? 'line-through text-[var(--text-muted)]' : 'text-white'}`}>
            {todo.text}
          </span>
          <span className={`mt-1 w-fit rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(todo.category)}`}>
            {todo.category}
          </span>
        </div>
      </div>
      <button 
        onClick={() => onDelete(todo._id)}
        className="shrink-0 rounded-full p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--color-error)]"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default TodoItemUI;
