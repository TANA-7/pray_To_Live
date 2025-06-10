const mongoose = require('mongoose');

const FatwaSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, refPath: 'assignedModel', required: true },
  assignedModel: { type: String, enum: ['User', 'Admin'], required: true },
  createdAt: { type: Date, default: Date.now },

  // الرد:
  answer: {
    text: { type: String, default: null },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'answeredByModel' },
    answeredByModel: { type: String, enum: ['User', 'Admin'], default: null },
    answeredAt: { type: Date, default: null }
  }
});

module.exports = mongoose.model('Fatwa', FatwaSchema);
