const token = localStorage.getItem("token");

if (!token) {
  // إعادة توجيه لصفحة تسجيل الدخول
  window.location.href = "login.html"; // أو login.html حسب اسم الصفحة عندك
}

function openVolunteerForm() {
  document.getElementById("volunteerModal").style.display = "flex";
}
function closeVolunteerForm() {
  document.getElementById("volunteerModal").style.display = "none";
}
function toggleQuran() {
  const val = document.getElementById("memorizesQuran").value;
  document.getElementById("howMuchQuran").style.display =
    val === "نعم" ? "block" : "none";
}
function toggleSharia() {
  const val = document.getElementById("studiesSharia").value;
  document.getElementById("scholars").style.display =
    val === "نعم" ? "block" : "none";
}
const motivationalQuotes = [
  "إن الصلاة تنهى عن الفحشاء والمنكر.",
  "استعن بالله ولا تعجز.",
  "الصلاة مفتاح الجنة.",
  "أقم صلاتك لوقتها تكن في ذمة الله.",
  "إن أقرب ما يكون العبد من ربه وهو ساجد.",
  "ما ترك عبد الصلاة إلا ابتلاه الله بالضيق.",
  "نورك في وجهك، وطمأنينتك في سجودك.",
  "ثبّتك الله على طاعته.",
  "أعظم نجاح: أن تُرضي الله.",
  "اللهم اجعلني من المصلين الخاشعين.",
];
function showRandomMotivationalQuote() {
  const quoteEl = document.getElementById("motivationalQuote");
  if (!quoteEl) return;

  const quote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // إزالة الأنيميشن القديمة (إن وُجدت)
  quoteEl.classList.remove("animated");

  // تأخير بسيط قبل الإضافة لتفعيل الأنيميشن من جديد
  setTimeout(() => {
    quoteEl.innerText = `"${quote}"`;
    quoteEl.classList.add("animated");
  }, 50);
}

// إرسال طلب التطوع
const form = document.getElementById("volunteerForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return showNotification("الرجاء تسجيل الدخول أولاً.", true);

  const body = {
    memorizesQuran: document.getElementById("memorizesQuran").value,
    howMuchQuran: document.getElementById("howMuchQuran").value,
    studiesSharia: document.getElementById("studiesSharia").value,
    scholars: document.getElementById("scholars").value,
    motivation: document.getElementById("motivation").value,
    adviceExample: document.getElementById("adviceExample").value,
  };

  try {
    const res = await fetch("http://localhost:5000/api/volunteer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return showNotification(data.msg || "فشل في الإرسال", true);

    showNotification("تم إرسال طلب التطوع بنجاح");
    closeVolunteerForm();
    fetchVolunteerStatus();
  } catch (err) {
    showNotification("فشل في الاتصال بالخادم", true);
  }
});

async function fetchVolunteerStatus() {
  const token = localStorage.getItem("token");
  const box = document.getElementById("volunteerStatus");
  if (!token || !box) return;

  try {
    const res = await fetch("http://localhost:5000/api/volunteer/my-status", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    if (!res.ok || data.status === "not_sent") {
      box.style.display = "none"; // ✅ إخفاء الرسالة إن لم يُرسل المستخدم طلبًا
      return;
    }

    const status = data.status;

    box.classList.remove(
      "volunteer-status-approved",
      "volunteer-status-rejected",
      "volunteer-status-pending"
    );

    if (status === "approved") {
      box.innerText = "🎉 تم قبول طلبك! أنت الآن مشرف.";
      box.classList.add("volunteer-status-approved");
    } else if (status === "rejected") {
      box.innerText = "❌ تم رفض طلبك. نشكرك على المبادرة.";
      box.classList.add("volunteer-status-rejected");
    } else if (status === "pending") {
      box.innerText = "⏳ طلبك قيد المراجعة. سيتم الرد قريبًا.";
      box.classList.add("volunteer-status-pending");
    }

    box.style.display = "block"; // ✅ إظهار الرسالة فقط إذا هناك حالة
  } catch (err) {
    console.error("فشل في جلب حالة التطوع:", err);
    box.style.display = "none";
  }
}

const prayerButtons = {
  fajrBtn: "الفجر",
  dhuhrBtn: "الظهر",
  asrBtn: "العصر",
  maghribBtn: "المغرب",
  ishaBtn: "العشاء",
};

const motivationMessages = [
  "بارك الله فيك! استمر في أداء الصلوات.",
  "ما شاء الله! زادك الله حرصًا.",
  "أحسنت! الصلاة نور.",
  "ثبتك الله على طاعته.",
  "جزاك الله خيرًا على محافظتك على الصلاة.",
];

let prayerCount = 0;
let prayerTimes = {};

for (const [btnId, prayerName] of Object.entries(prayerButtons)) {
  const button = document.getElementById(btnId);
  if (button) {
    button.addEventListener("click", () => {
      button.disabled = true;
      prayerCount++;

      const countEl = document.getElementById("prayerCount");
      const infoEl = document.getElementById("prayerCountInfo");
      const messageEl = document.getElementById("motivationMessage");

      if (countEl) countEl.innerText = prayerCount;
      if (infoEl) infoEl.innerText = prayerCount;

      const message =
        motivationMessages[
          Math.floor(Math.random() * motivationMessages.length)
        ];
      if (messageEl) messageEl.innerText = message;

      registerPrayer(prayerName);

      if (prayerCount >= 5) {
        showNotification(
          "ما شاء الله! لقد أتممت صلواتك لليوم. زادك الله ثباتًا."
        );
      }

      updateSpiritualProgress();
    });
  }
}

function getNextPrayer(prayerTimes) {
  const now = new Date();
  for (const [prayer, time] of Object.entries(prayerTimes)) {
    const [hours, minutes] = time.split(":").map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0);
    if (prayerTime > now) {
      return `${prayer} عند ${time}`;
    }
  }
  return "لا توجد صلوات متبقية اليوم.";
}

function updatePrayerButtons() {
  const now = new Date();
  const prayerOrder = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];
  resetAzkar();

  for (let i = 0; i < prayerOrder.length; i++) {
    const currentPrayer = prayerOrder[i];
    const nextPrayer = prayerOrder[i + 1];
    const btnId = Object.keys(prayerButtons).find(
      (key) => prayerButtons[key] === currentPrayer
    );
    const button = document.getElementById(btnId);
    const card = document.getElementById(btnId.replace("Btn", "Card"));

    const currentTime = prayerTimes[currentPrayer];
    const nextTime = nextPrayer ? prayerTimes[nextPrayer] : null;

    // تنظيف الألوان
    card?.classList.remove("locked", "active", "expired", "prayed");

    if (disabledPrayers.includes(currentPrayer)) {
      button.disabled = true;
      card?.classList.add("prayed"); // ✅ مصلي
      continue;
    }

    if (currentTime) {
      const [curH, curM] = currentTime.split(":").map(Number);
      const prayerStart = new Date();
      prayerStart.setHours(curH, curM, 0);

      let prayerEnd = new Date(prayerStart.getTime() + 60 * 60 * 1000); // ساعة للصلاة

      if (nextTime) {
        const [nextH, nextM] = nextTime.split(":").map(Number);
        prayerEnd.setHours(nextH, nextM, 0);
      }

      if (now < prayerStart) {
        button.disabled = true;
        card?.classList.add("locked"); // 🔒 لم يحن الوقت بعد
      } else if (now >= prayerStart && now < prayerEnd) {
        button.disabled = false;
        card?.classList.add("active"); // ✅ الوقت الحالي
      } else {
        button.disabled = true;
        card?.classList.add("expired"); // 🟥 انتهى الوقت ولم تُصلَّ
      }
    }
  }
}

function fetchPrayerTimes(lat, lon) {
  const today = new Date();
  const date = `${today.getDate()}-${
    today.getMonth() + 1
  }-${today.getFullYear()}`;

  fetch(
    `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=2`
  )
    .then((response) => response.json())
    .then((data) => {
      const timings = data.data.timings;
      const names = {
        Fajr: "الفجر",
        Dhuhr: "الظهر",
        Asr: "العصر",
        Maghrib: "المغرب",
        Isha: "العشاء",
      };

      prayerTimes = {};

      for (const key in names) {
        const arabic = names[key];
        if (timings[key]) {
          const time = timings[key].slice(0, 5); // فقط HH:MM
          prayerTimes[arabic] = time;

          // تحديث العنصر في HTML حسب id
          const el = document.getElementById(`time${key}`);
          if (el) el.innerText = time;
        }
      }

      // تحديث الوقت القادم
      const nextPrayerEl = document.getElementById("nextPrayerTime");
      if (nextPrayerEl) {
        nextPrayerEl.innerText = getNextPrayer(prayerTimes);
      }

      updatePrayerButtons();
    })
    .catch((err) => {
      console.error("Error fetching prayer times:", err);
      const el = document.getElementById("nextPrayerTime");
      if (el) el.innerText = "تعذر جلب أوقات الصلاة.";
    });
}



function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        fetchPrayerTimes(lat, lon);
        fetchNearestMasjid(lat, lon); // ✅ أضف هذه الدالة
      },
      () => {
        const el = document.getElementById("nearestMasjid");
        if (el) el.innerText = "تعذر تحديد الموقع.";
      }
    );
  }
}
async function fetchNearestMasjid(lat, lon) {
  const el = document.getElementById("nearestMasjid");
  if (!el) return;

  const overpassUrl = `https://overpass-api.de/api/interpreter`;

  const query = `
    [out:json];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lon});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lon});
    );
    out center 1;
  `;

  try {
    const res = await fetch(overpassUrl, {
      method: "POST",
      body: query,
    });

    const data = await res.json();
    if (!data.elements.length) {
      el.innerText = "لم يُعثر على مسجد قريب";
      return;
    }

    const place = data.elements[0];
    const name = place.tags?.name || "مسجد بالقرب منك";
    const latM = place.lat || place.center?.lat;
    const lonM = place.lon || place.center?.lon;

    el.innerText = name;
    el.href = `https://www.google.com/maps?q=${latM},${lonM}`;
  } catch (err) {
    console.error("فشل في جلب أقرب مسجد:", err);
    el.innerText = "خطأ في تحديد المسجد";
  }
}

async function fetchPrayerCount() {
  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];
  if (!token) return showNotification("الرجاء تسجيل الدخول أولاً.", true);

  try {
    const res = await fetch(
      `http://localhost:5000/api/prayers/count?date=${today}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    const data = await res.json();
    if (res.ok) {
      prayerCount = data.count;
      if (document.getElementById("prayerCount")) {
        document.getElementById("prayerCount").innerText = prayerCount;
      }
      updateSpiritualProgress();
    }
  } catch (err) {
    console.error("خطأ في جلب عدد الصلوات:", err);
  }
}

async function registerPrayer(prayerName) {
  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];

  if (!token) return showNotification("الرجاء تسجيل الدخول أولاً.", true);

  try {
    const res = await fetch("http://localhost:5000/api/prayers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ prayerName, date: today }),
    });

    const data = await res.json();
    if (res.ok) {
      showNotification(data.message);
      fetchPrayerCount();
    } else {
      showNotification(data.message || "فشل في التسجيل", true);
    }
  } catch (err) {
    console.error("خطأ أثناء تسجيل الصلاة:", err);
    showNotification("حدث خطأ أثناء تسجيل الصلاة", true);
  }
}

const azkarList = [
  "سبحان الله وبحمده، سبحان الله العظيم.",
  "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
  "اللهم اجعلني من التوابين، واجعلني من المتطهرين.",
  "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل.",
  "اللهم صل وسلم على نبينا محمد.",
];

function showRandomZekr() {
  const zekrText = document.getElementById("zekrText");
  zekrText.innerText = azkarList[Math.floor(Math.random() * azkarList.length)];
}

function updateUserInfo() {
  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");

  if (nameEl)
    nameEl.innerText = localStorage.getItem("userName") || "غير معروف";
  if (emailEl)
    emailEl.innerText = localStorage.getItem("userEmail") || "غير محدد";
}

function updateSpiritualProgress() {
  const percent = Math.min(100, Math.round((prayerCount / 5) * 100));
  const el = document.getElementById("spiritualProgress");
  const messageEl = document.getElementById("progressMessage");

  el.style.width = percent + "%";
  el.innerText = percent + "%";

  el.classList.remove("low-progress", "mid-progress", "high-progress");

  let message = "";

  if (percent < 40) {
    el.classList.add("low-progress");
    message = "ابدأ اليوم، لا تفوّت الصلاة!";
  } else if (percent < 80) {
    el.classList.add("mid-progress");
    message = "أداء طيب، بقي القليل!";
  } else {
    el.classList.add("high-progress");
    message = "ما شاء الله! استمر على هذا الثبات.";
  }

  if (messageEl) messageEl.innerText = message;
}

let zekrCount = 0;
function incrementZekr() {
  zekrCount++;
  document.getElementById("zekrCounter").innerText = zekrCount;
}
const tipsList = [
  "حافظ على وضوئك، فهو نور.",
  "أكثر من الاستغفار، فهو مفتاح الفرج.",
  "الصدقة تطفئ غضب الرب.",
  "ذكر الله يطمئن القلوب.",
  "احرص على قراءة القرآن يومياً.",
];

function showRandomTip() {
  const tip = tipsList[Math.floor(Math.random() * tipsList.length)];
  document.getElementById("dailyTip").innerText = tip;
}
function updateTasks() {
  const checkboxes = document.querySelectorAll(
    ".task-list input[type='checkbox']"
  );
  let done = 0;
  checkboxes.forEach((cb) => {
    if (cb.checked) done++;
  });
  document.getElementById("taskProgress").innerText = done;
}
function updateWeeklyProgress(count = 27) {
  const percent = Math.min(100, Math.round((count / 35) * 100));
  const el = document.getElementById("weeklyProgress");
  el.style.width = percent + "%";
  el.innerText = percent + "%";
}

document.querySelectorAll(".prayer-table td").forEach((cell) => {
  if (cell.cellIndex === 0) return;

  let states = ["unspecified", "prayed", "missed"];
  let symbols = ["", "●", "✘"];

  let current = 0;

  cell.addEventListener("click", () => {
    cell.classList.remove(...states);
    current = (current + 1) % states.length;
    cell.classList.add(states[current]);
    cell.textContent = symbols[current];
  });
});

async function fetchAndDisplayUserName() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("http://localhost:5000/api/users/me", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const user = await res.json();
    if (res.ok) {
      document.getElementById(
        "welcomeUser"
      ).innerText = `مرحبًا، ${user.username} 👋`;
    }
  } catch (err) {
    console.error("فشل في جلب اسم المستخدم:", err);
  }
}

function showNotification(message, isError = false) {
  const box = document.getElementById("notifyBox");
  box.innerText = message;
  box.className = "notify" + (isError ? " error" : "");
  setTimeout(() => box.classList.remove("hidden"), 10);
  setTimeout(() => box.classList.add("hidden"), 3000);
}
let disabledPrayers = []; // 🟢 قائمة لتخزين الصلوات التي تم تسجيلها من القاعدة

async function disablePrayedButtonsFromDB() {
  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:5000/api/prayers?date=${today}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const data = await res.json();

    if (res.ok && Array.isArray(data.prayers)) {
      disabledPrayers = data.prayers.map((p) => p.prayerName);
      updatePrayerButtons(); // ✅ أضف هذا السطر

      // استخدم prayerButtons الجديدة
      for (const [btnId, prayerName] of Object.entries(prayerButtons)) {
        const button = document.getElementById(btnId);
        if (button && disabledPrayers.includes(prayerName)) {
          button.disabled = true;
        }
      }
    }
  } catch (err) {
    console.error("فشل في التحقق من الصلوات المسجلة:", err);
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  window.location.href = "login.html";
}
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("logoutBtnSide").addEventListener("click", logout);

window.toggleSidebar = () => {
  document.getElementById("layoutSidebar").classList.toggle("active");
};
let notifications = [];

function toggleNotifications() {
  const panel = document.getElementById("notificationPanel");
  panel.classList.toggle("hidden");
  renderNotifications();
}

function renderNotifications() {
  const list = document.getElementById("notificationList");
  list.innerHTML = "";
  notifications.forEach((notif) => {
    const item = document.createElement("li");
    item.className = `notification-item ${notif.read ? "read" : "unread"}`;
    const shortMsg =
      notif.message.length > 60
        ? notif.message.slice(0, 60) + "..."
        : notif.message;
    item.innerHTML = `<h4>${notif.title}</h4><p>${shortMsg}</p>`;
    item.onclick = () => openMessageModal(notif._id);
    list.appendChild(item);
  });
  updateBadgeCount();
}

function updateBadgeCount() {
  const count = notifications.filter((n) => !n.read).length;
  const badge = document.getElementById("notificationCount");
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-block" : "none";
}

function openMessageModal(id) {
  selectedNotificationId = id;

  const notif = notifications.find((n) => n._id === id);
  if (notif) {
    notif.read = true;
    document.getElementById("modalTitle").textContent = notif.title;
    document.getElementById("modalMessage").textContent = notif.message;
    document.getElementById("modalSender").textContent = `من: ${
      notif.senderName || "مشرف"
    }`;

    const replySection = document.getElementById("replySection");
    if (notif.reply && notif.reply.text) {
      replySection.innerHTML = `<strong>ردك:</strong><p>${notif.reply.text}</p>`;
    } else {
      replySection.innerHTML = `
        <textarea id="replyText" placeholder="اكتب ردك هنا..."></textarea>
        <button onclick="submitReply()">إرسال الرد</button>
      `;
    }

    document.getElementById("messageModal").classList.remove("hidden");
    renderNotifications();
    markNotificationAsRead(notif._id);
  }
}

async function submitReply() {
  const text = document.getElementById("replyText").value.trim();
  if (!text) return showNotification("يرجى كتابة ردك أولاً", true);

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(
      `http://localhost:5000/api/notifications/${selectedNotificationId}/reply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      showNotification("تم إرسال الرد بنجاح");
      document.getElementById("messageModal").classList.add("hidden");
    } else {
      showNotification(data.message || "فشل في إرسال الرد", true);
    }
  } catch (err) {
    console.error("خطأ أثناء إرسال الرد:", err);
    showNotification("حدث خطأ أثناء إرسال الرد", true);
  }
}

function closeMessageModal() {
  document.getElementById("messageModal").classList.add("hidden");
}

function replyToMessage() {
  showNotification("تم فتح نافذة الرد."); // مكان تنفيذ نافذة الرد
}
let selectedNotificationId = null;
async function deleteMessage() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(
      `http://localhost:5000/api/notifications/${selectedNotificationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const data = await res.json();

    if (res.ok) {
      showNotification("تم حذف الإشعار.");
      closeMessageModal();
      fetchNotifications(); // تحديث القائمة
    } else {
      showNotification(data.message || "فشل في حذف الإشعار", true);
    }
  } catch (err) {
    console.error("خطأ في حذف الإشعار:", err);
    showNotification("حدث خطأ أثناء حذف الإشعار", true);
  }
}

async function fetchNotifications() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("http://localhost:5000/api/notifications", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();

    if (res.ok) {
      notifications = data.notifications || [];
      renderNotifications();
    }
  } catch (err) {
    console.error("فشل في جلب الإشعارات:", err);
  }
}

async function markNotificationAsRead(id) {
  const token = localStorage.getItem("token");
  try {
    await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("فشل في تحديث حالة الإشعار:", err);
  }
}

// فتوى
const textarea = document.querySelector('.question-box');
const sendBtn = document.querySelector('.forum-buttons button:first-child');

sendBtn.addEventListener('click', async () => {
  const question = textarea.value.trim();
const userId = localStorage.getItem('userId');

  if (!question) {
    alert('الرجاء كتابة السؤال أولاً');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/fatwa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, userId })
    });

    const data = await response.json();
    if (data.success) {
      alert('تم إرسال الفتوى بنجاح!');
      textarea.value = ''; // تفريغ الحقل
      // يمكنك تحديث قائمة الفتاوى أو عمل أي شيء آخر
    } else {
      alert('حدث خطأ: ' + data.message);
    }
  } catch (error) {
    console.error('خطأ في إرسال الفتوى:', error);
    alert('تعذر إرسال الفتوى');
  }
});
const viewBtn = document.querySelector('.forum-buttons button:last-child');
const fatwaListContainer = document.createElement('div');
document.querySelector('.forum').appendChild(fatwaListContainer);

viewBtn.addEventListener('click', async () => {
  const userId = localStorage.getItem('userId'); // ✅ بدل النص الثابت
  if (!userId) {
    alert('لم يتم العثور على معرف المستخدم');
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/fatwa/user/${userId}`);
    const fatwas = await response.json();

    fatwaListContainer.innerHTML = ''; // تفريغ المحتوى

    fatwas.forEach(fatwa => {
      const fatwaEl = document.createElement('div');
      fatwaEl.style.border = '1px solid #ccc';
      fatwaEl.style.padding = '10px';
      fatwaEl.style.marginBottom = '8px';
      fatwaEl.innerHTML = `
        <p><strong>السؤال:</strong> ${fatwa.question}</p>
        <p><strong>الرد:</strong> ${fatwa.answer || 'لم يتم الرد بعد'}</p>
        <p><small>تاريخ الإرسال: ${new Date(fatwa.createdAt).toLocaleString()}</small></p>
      `;
      fatwaListContainer.appendChild(fatwaEl);
    });
  } catch (error) {
    console.error('خطأ في جلب الفتاوى:', error);
    alert('تعذر جلب الفتاوى السابقة');
  }
});


// اذكار
function setupZikrCounters() {
  const items = document.querySelectorAll(".zikr-item");

  items.forEach((item) => {
    const max = parseInt(item.getAttribute("data-max"));
    const countEl = item.querySelector(".zikr-count");
    const fillPath = item.querySelector(".progress-fill");

    item.addEventListener("click", () => {
      let current = parseInt(item.getAttribute("data-current"));
      if (current >= max) return;

      current++;
      item.setAttribute("data-current", current);
      countEl.innerText = current;

      const percentage = current / max;
      const offset = 125.66 * (1 - percentage); // لـ stroke-dasharray
      fillPath.style.strokeDashoffset = offset;

      const allDone = [...items].every((el) => {
        return (
          parseInt(el.getAttribute("data-current")) >=
          parseInt(el.getAttribute("data-max"))
        );
      });

      if (allDone) {
        showFinalAzkar();
      }
    });
  });
}

function showFinalAzkar() {
  document.querySelectorAll(".zikr-item").forEach((item) => {
    item.classList.add("exit");
  });

  setTimeout(() => {
    document.getElementById("zikrCounterSection").style.display = "none";
    document.getElementById("finalAzkarSection").classList.remove("hidden");
  }, 600);
}

function resetAzkar() {
  document.getElementById("zikrCounterSection").style.display = "flex";
  document.getElementById("finalAzkarSection").classList.add("hidden");

  document.querySelectorAll(".zikr-item").forEach((item) => {
    item.setAttribute("data-current", "0");
    item.querySelector(".zikr-count").innerText = "0";
    item.querySelector(".progress-fill").style.strokeDashoffset = 125.66;
    item.classList.remove("exit");
  });
}

// مهام
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
// عند تحميل الصفحة: تحميل المهام من التخزين المحلي
window.addEventListener("DOMContentLoaded", () => {
  const savedTasks = JSON.parse(localStorage.getItem("spiritualTasks")) || [];
  savedTasks.forEach((task) => {
    renderTask(task.text, task.completed);
  });
});

// حفظ جميع المهام إلى LocalStorage
function saveTasks() {
  const tasks = [];
  const listItems = todoList.querySelectorAll("li");

  listItems.forEach((li) => {
    const span = li.querySelector("span");
    tasks.push({
      text: span.textContent,
      completed: span.classList.contains("completed"),
    });
  });

  localStorage.setItem("spiritualTasks", JSON.stringify(tasks));
}

function addTask() {
  const taskText = todoInput.value.trim();
  if (taskText === "") return;

  renderTask(taskText, false);
  todoInput.value = "";
  saveTasks(); // <-- تأكد من الحفظ هنا بعد الإضافة
}
document.getElementById("add-task-btn").addEventListener("click", addTask);

function renderTask(text, completed) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;
  span.style.flex = "1";
  span.style.cursor = "pointer";
  if (completed) span.classList.add("completed");

  span.addEventListener("click", () => {
    span.classList.toggle("completed");
    li.classList.toggle("completed"); // <-- لتلوين الخلفية أيضًا
    saveTasks();
  });

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fas fa-trash delete-icon";
  deleteIcon.title = "حذف";
  deleteIcon.addEventListener("click", () => {
    todoList.removeChild(li);
    saveTasks(); // تحديث التخزين بعد الحذف
  });

  actions.appendChild(deleteIcon);
  li.appendChild(span);
  li.appendChild(actions);
  todoList.appendChild(li);
}

// إضافة عند الضغط على Enter
todoInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});
// تحميل
window.onload = async () => {
  await disablePrayedButtonsFromDB();
  getUserLocation();
  fetchPrayerCount();
  updateUserInfo();
  fetchVolunteerStatus();
  fetchAndDisplayUserName();
  fetchNotifications(); // ⬅️ تحميل الإشعارات عند الدخول
  setTimeout(updatePrayerButtons, 500); // ✅ تأخير بسيط لحل تزامن DOM
  setInterval(showRandomMotivationalQuote, 30000);
  setupZikrCounters();
};
