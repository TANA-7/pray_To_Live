const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fatherName: String,
  lastName: String,
  phone: String,
  birthDate: String,
  gender: String,
  country: String,
  city: String,
  mohafez: String,
  reasonLeavePrayer: String,
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: {
    type: String,
    enum: ['user', 'supervisor', 'admin'],
    default: 'user'
  },
  prayerStatus: {
    type: String,
    enum: ['محافظ', 'غير محافظ'],
    default: 'غير محدد'
  }
});


module.exports = mongoose.model('User', userSchema);
