import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
    },
  },
  { timestamps: true }
);

// Prevent mongoose from recompiling the model upon hot-reloads
export default mongoose.models.User || mongoose.model('User', UserSchema);