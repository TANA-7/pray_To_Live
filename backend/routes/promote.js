const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ترقية مستخدم (admin فقط)
router.patch('/:id/promote', auth, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'غير مصرح لك' });
  }

  if (!['user', 'supervisor', 'admin'].includes(role)) {
    return res.status(400).json({ msg: 'الدور غير صالح' });
  }

  try {
    const user = await User.findById(id);

    // ✅ منع تعديل دور الأدمن
    if (!user) return res.status(404).json({ msg: 'المستخدم غير موجود' });
    if (user.role === 'admin') {
      return res.status(400).json({ msg: 'لا يمكن تغيير دور الأدمن' });
    }

    user.role = role;
    await user.save();

    res.json({ msg: `تم تحديث الدور إلى ${role}`, user });
  } catch (err) {
    res.status(500).json({ msg: 'فشل في تحديث الدور' });
  }
});

module.exports = router;
