import TodoItem from '../models/TodoItem.js';
import dayjs from 'dayjs';

export const getTodos = async (req, res) => {
  const date = req.query.date || dayjs().format('YYYY-MM-DD');
  
  try {
    const todos = await TodoItem.find({ userId: req.user._id, date }).sort({ createdAt: 1 });
    res.json({ success: true, data: todos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createTodo = async (req, res) => {
  const { text, category, date } = req.body;
  const targetDate = date || dayjs().format('YYYY-MM-DD');
  
  try {
    const todo = await TodoItem.create({
      userId: req.user._id,
      text,
      category,
      date: targetDate
    });
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    
    todo.completed = !todo.completed;
    await todo.save();
    
    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
