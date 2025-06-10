const mongoose = require('mongoose');

const VolunteerRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memorizesQuran: String,
  howMuchQuran: String,
  studiesSharia: String,
  scholars: String,
  motivation: String,
  adviceExample: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});


module.exports = mongoose.model('VolunteerRequest', VolunteerRequestSchema);
