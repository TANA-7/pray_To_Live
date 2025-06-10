const express = require('express');
const router = express.Router();
const Fatwa = require('../models/Fatwa');

// مثال: لو تعرف موديل المشرف والمستخدم والأدمن موجودين:
// const User = require('./models/User');
// const Admin = require('./models/Admin');

// إضافة فتوى جديدة
router.post('/', async (req, res) => {
  try {
    const { question, userId } = req.body;
    if (!question || !userId) return res.status(400).json({ success: false, message: 'الفتوى أو المستخدم مفقود' });

    // هنا منطق تحديد المشرف (مثلاً استعلام)
    // هذا مجرد مثال افتراضي
    // const supervisor = await User.findOne({ role: 'supervisor', active: true });
    // لو ما في مشرف نعين الادمن (هنا نستخدم ObjectId وهمي للاختبار)
    const supervisorId = null; // مثال: null تعني ما في مشرف حاليا
    const adminId = '64aebc7d7e4c7a3d9b123456'; // عدلها برقم الادمن الفعلي

    const assignedTo = supervisorId || adminId;
    const assignedModel = supervisorId ? 'User' : 'Admin';

    const fatwa = new Fatwa({
      question,
      userId,
      assignedTo,
      assignedModel
    });

    await fatwa.save();

    res.json({ success: true, fatwaId: fatwa._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// جلب الفتاوى الخاصة بالمستخدم
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const fatwas = await Fatwa.find({ userId }).sort({ createdAt: -1 });

    res.json(fatwas);
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// جلب الفتاوى المكلف بها مشرف أو ادمن
router.get('/assigned/:assignedId', async (req, res) => {
  try {
    const assignedTo = req.params.assignedId;
    const fatwas = await Fatwa.find({ assignedTo }).sort({ createdAt: -1 });
    res.json(fatwas);
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// الرد على فتوى
router.post('/answer/:fatwaId', async (req, res) => {
  try {
    const fatwaId = req.params.fatwaId;
    const { answer } = req.body;

    const fatwa = await Fatwa.findById(fatwaId);
    if (!fatwa) return res.status(404).json({ success: false, message: 'الفتوى غير موجودة' });

    fatwa.answer = {
  text,
  answeredBy: req.user.id,
  answeredByModel: req.user.role === 'admin' ? 'Admin' : 'User',
  answeredAt: new Date()
};

    fatwa.answeredAt = new Date();
    await fatwa.save();

    res.json({ success: true, fatwa });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
