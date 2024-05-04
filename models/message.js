import mongoose from 'mongoose';

// Message Schema
const messageSchema = new mongoose.Schema({
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: function() { return this.mediaType === 'text'; }
    },
    mediaUrl: {
      type: String
    },
    mediaType: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'document']
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

  messageSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });

const Message = mongoose.model('Message', messageSchema);
export default Message;