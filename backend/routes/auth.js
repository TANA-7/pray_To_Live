const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// تسجيل مستخدم جديد
router.post('/signup', async (req, res) => {
  const {
    username, email, password,
    fatherName, lastName, phone, birthDate,
    gender, country, city, mohafez, reasonLeavePrayer
  } = req.body;

  if (!username || !email || !password || !gender || !mohafez) {
    return res.status(400).json({ msg: 'يرجى تعبئة جميع الحقول المطلوبة' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'البريد مسجل مسبقًا' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ تحديد حالة الصلاة تلقائيًا
    const prayerStatus = mohafez === 'نعم' ? 'محافظ' : 'غير محافظ';

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fatherName,
      lastName,
      phone,
      birthDate,
      gender,
      country,
      city,
      mohafez,
      reasonLeavePrayer,
      prayerStatus, // ✅ توليد داخلي وليس من العميل
      role: 'user'
    });

    await newUser.save();
    res.status(201).json({ msg: 'تم إنشاء الحساب بنجاح، جاري التحويل لتسجيل الدخول' });
  } catch (err) {
    res.status(500).json({ msg: 'حدث خطأ بالسيرفر، يرجى المحاولة لاحقًا' });
  }
});



// تسجيل الدخول
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'البريد غير مسجل' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'كلمة المرور غير صحيحة' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ msg: 'تم تسجيل الدخول بنجاح', token, user });
  } catch (err) {
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

module.exports = router;