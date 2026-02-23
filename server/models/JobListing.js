import mongoose from 'mongoose';

const JobListingSchema = new mongoose.Schema({
  // Job metadata
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    index: true
  },
  location: String,
  salaryRange: {
    min: Number,
    max: Number,
    currency: String
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    default: 'Full-time'
  },
  
  // Job details
  description: {
    type: String,
    required: true
  },
  requiredSkills: [String],
  preferredSkills: [String],
  experience: String, // e.g., "2-5 years"
  
  // Source information
  source: {
    type: String,
    enum: ['LinkedIn', 'Indeed', 'GitHub', 'Stack Overflow', 'AngelList', 'Custom'],
    default: 'Custom'
  },
  sourceUrl: String,
  postedDate: Date,
  expiryDate: Date,
  
  // Meta information
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
  
  // Tracking
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
});

// Index for faster queries
JobListingSchema.index({ 'source': 1, 'isActive': 1 });
JobListingSchema.index({ 'requiredSkills': 1 });
JobListingSchema.index({ 'company': 1, 'isActive': 1 });

export default mongoose.model('JobListing', JobListingSchema);
