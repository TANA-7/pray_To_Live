const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    message: String,
    senderName: String,
    read: { type: Boolean, default: false },
    reply: {
      text: String,
      date: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
