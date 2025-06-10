const express = require('express');
const router = express.Router();
const VolunteerRequest = require('../models/VolunteerRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ إرسال طلب تطوع
router.post('/', auth, async (req, res) => {
  const {
    memorizesQuran,
    howMuchQuran,
    studiesSharia,
    scholars,
    motivation,
    adviceExample
  } = req.body;

  const userId = req.user.id;

  if (!memorizesQuran || !studiesSharia || !motivation || !adviceExample) {
    return res.status(400).json({ msg: 'يرجى تعبئة جميع الحقول المطلوبة' });
  }

  try {
    // إذا المستخدم أرسل طلب مسبقًا
    const existing = await VolunteerRequest.findOne({ userId });
    if (existing) {
      return res.status(400).json({ msg: 'لقد أرسلت طلبًا مسبقًا' });
    }

    const request = new VolunteerRequest({
      userId,
      memorizesQuran,
      howMuchQuran,
      studiesSharia,
      scholars,
      motivation,
      adviceExample
    });

    await request.save();
    res.status(201).json({ msg: 'تم إرسال الطلب بنجاح' });
  } catch (err) {
    console.error("🔥 خطأ أثناء حفظ الطلب:", err);
    res.status(500).json({ msg: 'فشل في إرسال الطلب' });
  }
});

// ✅ جلب كل طلبات التطوع (admin فقط)
router.get('/requests', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'غير مصرح لك' });
  }

  try {
    const requests = await VolunteerRequest.find()
      .populate('userId', 'username lastName email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: 'فشل في جلب الطلبات' });
  }
});

// ✅ تحديث حالة الطلب (قبول/رفض)
router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'غير مصرح لك' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ msg: 'حالة غير صالحة' });
  }

  try {
    const updated = await VolunteerRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    // إذا تم القبول، رقِّ المستخدم لمشرف
    if (updated && status === 'approved') {
      await User.findByIdAndUpdate(updated.userId, { role: 'supervisor' });
    }

    res.json({ msg: 'تم تحديث الحالة' });
  } catch (err) {
    console.error("🔥 خطأ أثناء تحديث الحالة:", err);
    res.status(500).json({ msg: 'فشل في تحديث الحالة' });
  }
});

// ✅ جلب حالة الطلب للمستخدم الحالي
router.get('/my-status', auth, async (req, res) => {
  try {
    const request = await VolunteerRequest.findOne({ userId: req.user.id });
    if (!request) {
      return res.json({ status: 'not_sent' });
    }
    res.json({ status: request.status });
  } catch (err) {
    console.error("🔥 خطأ في /my-status:", err);
    res.status(500).json({ msg: 'حدث خطأ أثناء جلب حالة التطوع' });
  }
});

module.exports = router;
