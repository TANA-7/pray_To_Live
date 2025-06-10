const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
// ✅ جلب المستخدمين المرتبطين بمشرف معيّن (لـ admin)
router.get("/by-supervisor/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "غير مصرح لك" });
  }

  try {
    const users = await User.find({ supervisorId: req.params.id }).select(
      "username email fatherName lastName"
    );
    res.json({ users });
  } catch (err) {
    console.error("خطأ في جلب المستخدمين حسب المشرف:", err);
    res.status(500).json({ msg: "حدث خطأ أثناء جلب المستخدمين" });
  }
});

// 🔗 ربط مستخدم بمشرف (admin فقط)
router.patch("/:userId/assign-supervisor", auth, async (req, res) => {
  const { supervisorId } = req.body;
  const { userId } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "غير مصرح لك" });
  }

  try {
    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(400).json({ msg: "المشرف غير موجود أو غير صحيح" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { supervisorId },
      { new: true }
    );
    res.json({ msg: "تم ربط المستخدم بالمشرف بنجاح", user });
  } catch (err) {
    res.status(500).json({ msg: "فشل في تحديث المستخدم" });
  }
});

// routes/users.js أو feedback.js
router.get("/my-users", auth, async (req, res) => {
  if (req.user.role !== "supervisor") {
    return res.status(403).json({ msg: "مصرح للمشرف فقط" });
  }

  try {
    const users = await User.find({ supervisorId: req.user.id }).select(
      "username email prayerStatus fatherName lastName"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب المستخدمين" });
  }
});
// جلب المستخدمين غير المرتبطين بأي مشرف
router.get("/unassigned-users", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "غير مصرح لك" });
  }

  try {
    const users = await User.find({
      role: "user",
      $or: [{ supervisorId: { $exists: false } }, { supervisorId: null }],
    }).select("username email fatherName lastName");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب المستخدمين" });
  }
});
// جلب قائمة المشرفين
router.get("/supervisors", auth, async (req, res) => {
  try {
    const supervisors = await User.find({ role: "supervisor" }).select(
      "_id username fatherName lastName"
    );
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب المشرفين" });
  }
});

// جلب جميع المستخدمين (admin فقط)
router.get("/all", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "غير مصرح" });
  try {
    const users = await User.find({ role: "user" });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب المستخدمين" });
  }
});
// تحديث جميع بيانات المستخدم
router.patch("/me", auth, async (req, res) => {
  try {
    const {
      username,
      email,
      fatherName,
      lastName,
      phone,
      birthDate,
      gender,
      country,
      city,
      reasonLeavePrayer,
    } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      username,
      email,
      fatherName,
      lastName,
      phone,
      birthDate,
      gender,
      country,
      city,
      reasonLeavePrayer,
    });

    res.json({ msg: "تم التحديث بنجاح" });
  } catch (err) {
    res.status(500).json({ msg: "فشل في التحديث" });
  }
});
// جلب بيانات إضافية حسب الدور
router.get("/profile/extra", auth, async (req, res) => {
  try {
    if (req.user.role === "user") {
      // تعديل جلب بيانات المستخدم
      const user = await User.findById(req.user.id)
        .select("-password")
        .populate("supervisorId", "username ");
      return res.json({
        supervisor: user.supervisorId?.username || "غير مرتبط",
      });
    }

    if (req.user.role === "supervisor") {
      const users = await User.find({ supervisorId: req.user.id }).select(
        "username fatherName lastName"
      );
      return res.json({ myUsers: users.map((u) => u.username) });
    }

    res.json({});
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب البيانات الإضافية" });
  }
});
// ✅ جلب بيانات المستخدم الحالي
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('supervisorId', 'username fatherName lastName'); // لجلب اسم المشرف إن وجد
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'فشل في جلب البيانات' });
  }
});

module.exports = router;
