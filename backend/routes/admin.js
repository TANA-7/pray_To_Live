const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// جلب المستخدمين غير المرتبطين بأي مشرف
router.get('/unassigned-users', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'غير مصرح لك' });
  }

  try {
    const users = await User.find({ role: 'user', supervisorId: { $exists: false } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'فشل في جلب المستخدمين' });
  }
});

// ربط مستخدم بمشرف
router.patch('/assign-supervisor', auth, async (req, res) => {
  const { userId, supervisorId } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'غير مصرح لك' });
  }

  try {
    await User.findByIdAndUpdate(userId, { supervisorId });
    res.json({ msg: 'تم ربط المستخدم بالمشرف' });
  } catch (err) {
    res.status(500).json({ msg: 'فشل في عملية الربط' });
  }
});

module.exports = router;
