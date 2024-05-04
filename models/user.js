
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// User Schema
const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true
    },
    password: {
      type: String,
      required: function() { return this.email !== undefined; }
    },
    profilePicUrl: {
      type: String
    },
    status: {
      type: String,
      enum: ['online', 'busy', 'away', 'offline'],
      default: 'offline'
    },
    fcmToken: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
});

userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

const User = mongoose.model('User', userSchema);
export default User;