const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// 📥 إرسال إشعار لمستخدم معين
router.post("/", auth, async (req, res) => {
  const { userId, title, message } = req.body;
  if (!userId || !title || !message) {
    return res.status(400).json({ msg: "جميع الحقول مطلوبة" });
  }

  try {
    const notification = new Notification({
      userId,
      title,
      message,
      senderName: req.user.username || "مشرف"
    });

    await notification.save();
    res.status(201).json({ msg: "تم إرسال الإشعار بنجاح" });
  } catch (err) {
    res.status(500).json({ msg: "فشل في إرسال الإشعار" });
  }
});

// 📤 جلب إشعارات المستخدم
router.get("/user/:id", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب الإشعارات" });
  }
});


// ✅ تحديد كـ مقروء
router.patch("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true }
    );
    res.json({ msg: "تم التحديث بنجاح" });
  } catch (err) {
    res.status(500).json({ msg: "فشل في التحديث" });
  }
});
// 🗑️ حذف إشعار
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) return res.status(404).json({ msg: "الإشعار غير موجود" });

    res.json({ msg: "تم حذف الإشعار" });
  } catch (err) {
    console.error("فشل في حذف الإشعار:", err);
    res.status(500).json({ msg: "حدث خطأ أثناء حذف الإشعار" });
  }
});
// 💬 حفظ رد المستخدم على إشعار
router.post("/:id/reply", auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ msg: "الرد مطلوب" });

  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        reply: {
          text,
          date: new Date()
        }
      },
      { new: true }
    );

    if (!notif) return res.status(404).json({ msg: "لم يتم العثور على الإشعار" });

    res.json({ msg: "تم إرسال الرد بنجاح" });
  } catch (err) {
    console.error("خطأ في الرد:", err);
    res.status(500).json({ msg: "حدث خطأ أثناء إرسال الرد" });
  }
});
// للمشرف - جلب كل الإشعارات لمستخدم معين (مثلاً في لوحة المتابعة)
router.get("/user/:id", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب الإشعارات" });
  }
});
// 📤 جلب إشعارات المستخدم الحالي
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ msg: "فشل في جلب الإشعارات" });
  }
});


module.exports = router;
