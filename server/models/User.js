import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  sessionId: { type: String, unique: true, sparse: true },
  portfolios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to generate a simple session ID
userSchema.methods.generateSession = function () {
  this.sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return this.sessionId;
};

export default mongoose.model('User', userSchema);
