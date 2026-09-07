import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  chatName: { type: String, required: true },
  username: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  extractedText: { type: String },
  // ADD THIS NEW FIELD:
  messages: [
    {
      sender: { type: String, enum: ['user', 'ai'] },
      text: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

export default mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);