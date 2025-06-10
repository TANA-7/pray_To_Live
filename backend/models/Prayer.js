const mongoose = require('mongoose');

const prayerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  prayerName: {
    type: String,
    required: true,
    enum: ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'],
  },
  date: {
    type: String, // "YYYY-MM-DD"
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Prayer', prayerSchema);
