import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Task context requires a functional descriptive title'], 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Structural execution trace requires an associated owning User ID'] 
  }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);