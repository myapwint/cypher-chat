import mongoose from 'mongoose';

// Chat Schema
const chatSchema = new mongoose.Schema({
    name: {
      type: String
    },
    profilePicUrl: {
      type: String
    },
    type: {
      type: String,
      enum: ['individual', 'group'],
      required: true
    },
    users: {
      type: [String],
      required: true
    },
    createdBy: {
      type: String,
      required: true
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

chatSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;