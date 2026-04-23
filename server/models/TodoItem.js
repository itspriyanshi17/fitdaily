import mongoose from 'mongoose';

const todoItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  category: { 
    type: String, 
    enum: ['fitness', 'nutrition', 'general'],
    default: 'general'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TodoItem', todoItemSchema);
