const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Routes
const authRoutes = require('./routes/auth');
const prayerRoutes = require('./routes/prayers');
const volunteerRoutes = require('./routes/volunteer');
const promoteRoutes = require('./routes/promote');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const fatwaRoutes = require('./routes/fatwa'); // تأكد من المسار صحيح (routes/fatwa.js)

// ✅ Route Usage (مرة واحدة فقط لكل راوت)
app.use('/api/auth', authRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/promote', promoteRoutes); // الأفضل فصلها عن users
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fatwa', fatwaRoutes);

// ✅ اتصال قاعدة البيانات
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ✅ راوت افتراضي للاختبار
app.get('/', (req, res) => {
  res.send('Welcome to PrayToLive API!');
});


// ✅ بدء التشغيل
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
