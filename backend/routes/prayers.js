const express = require('express');
const router = express.Router();
const Prayer = require('../models/Prayer');
const auth = require('../middleware/auth');

// 🕌 تسجيل صلاة
router.post('/', auth, async (req, res) => {
  const { prayerName, date } = req.body;

  if (!prayerName || !date) {
    return res.status(400).json({ message: 'يرجى إدخال اسم الصلاة والتاريخ' });
  }

  try {
    const existing = await Prayer.findOne({ userId: req.user.id, prayerName, date });
    if (existing) {
      return res.status(400).json({ message: 'تم تسجيل هذه الصلاة مسبقًا' });
    }

    const prayer = new Prayer({
      userId: req.user.id,
      prayerName,
      date
    });

    await prayer.save();
    res.status(201).json({ message: 'تم تسجيل الصلاة بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء التسجيل' });
  }
});


// 📊 إحصائية عدد الصلوات ليوم محدد
router.get('/count', auth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'يجب إرسال التاريخ' });

  try {
    const count = await Prayer.countDocuments({ userId: req.user.id, date });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'فشل في جلب البيانات' });
  }
});
// 📊 جلب عدد صلوات مستخدم معين
router.get('/count/:userId', auth, async (req, res) => {
  try {
    const count = await Prayer.countDocuments({ userId: req.params.userId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'فشل في جلب عدد الصلوات' });
  }
});
// ✅ جلب صلوات المستخدم لليوم الواحد
router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'يرجى إرسال التاريخ' });

  try {
    const prayers = await Prayer.find({ userId: req.user.id, date });
    res.json({ prayers });
  } catch (err) {
    res.status(500).json({ message: 'فشل في جلب الصلوات' });
  }
});
// جلب إحصائيات الأسبوع الأخير
router.get("/week-summary", auth, async (req, res) => {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); // 7 أيام

    const prayers = await Prayer.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end }
    });

    const result = Array(7).fill(0); // [0,0,0,0,0,0,0]

    prayers.forEach(p => {
      const dayIndex = Math.floor((new Date(p.date).getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      result[dayIndex]++;
    });

    res.json({ weekStats: result });
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب الإحصائيات" });
  }
});

module.exports = router;
