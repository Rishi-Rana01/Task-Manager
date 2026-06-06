import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required to initialize a profile'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email authentication profile parameter is required'], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid structural email handle']
  },
  password: { 
    type: String, 
    required: [true, 'Secure password vector required'], 
    minlength: [6, 'Security constraints require a minimum password length of 6 characters'] 
  }
}, { timestamps: true });

// Pre-save middleware to salt and hash security credentials
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
