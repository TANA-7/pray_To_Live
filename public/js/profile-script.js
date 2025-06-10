const token = localStorage.getItem("token");

if (!token) {
  // إعادة توجيه لصفحة تسجيل الدخول
  window.location.href = "login.html"; // أو login.html حسب اسم الصفحة عندك
}

let currentUser = null;

async function fetchUserInfo() {
  try {
    const res = await fetch("http://localhost:5000/api/users/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const user = await res.json();
    currentUser = user;
    const birthDate = new Date(user.birthDate);
    const age = Math.floor(
      (Date.now() - birthDate) / (1000 * 60 * 60 * 24 * 365.25)
    );
    document.getElementById("age").innerText = age + " سنة";
    document.getElementById("country").innerText = user.country || "غير محددة";

    // عرض البيانات
    document.getElementById("username").innerText = `${user.username} ${
      user.fatherName || ""
    } ${user.lastName || ""}`.trim();

    document.getElementById("email").innerText = user.email || "غير محدد";
    document.getElementById("phone").innerText = user.phone || "غير محدد";
    document.getElementById("city").innerText = user.city || "غير محددة";

    // للمشترك: عرض اسم المشرف
    if (user.role === "user" && user.supervisorId?.username) {
      document.getElementById("extraInfo").innerText =
        "المشرف المسؤول: " +
        `${user.supervisorId.username} ${
          user.supervisorId.lastName || ""
        }`.trim();
    }

    // للمشرف: عرض أسماء المشتركين
    if (user.role === "supervisor") {
      fetchMyUsers();
    }
  } catch (err) {
    showNotification("فشل في جلب البيانات", true);
  }
}

async function fetchMyUsers() {
  try {
    const res = await fetch("http://localhost:5000/api/users/my-users", {
      headers: { Authorization: "Bearer " + token },
    });
    const users = await res.json();
    const names = users
      .map((u) => `${u.username} ${u.lastName || ""}`.trim())
      .join("، ");
    document.getElementById("extraInfo").innerText =
      "المستخدمون المرتبطون بك: " + names;
  } catch (err) {
    document.getElementById("extraInfo").innerText = "تعذر جلب المستخدمين";
  }
}

// عرض نموذج التعديل
document.getElementById("editBtn").addEventListener("click", () => {
  document.getElementById("profileView").style.display = "none";
  document.getElementById("profileEdit").style.display = "block";

  document.getElementById("editUsername").value = currentUser.username || "";
  document.getElementById("editFatherName").value =
    currentUser.fatherName || "";
  document.getElementById("editLastName").value = currentUser.lastName || "";
  document.getElementById("editEmail").value = currentUser.email || "";
  document.getElementById("editPhone").value = currentUser.phone || "";
  document.getElementById("editCity").value = currentUser.city || "";
  document.getElementById("editCountry").value = currentUser.country || "";
});

// حفظ التعديلات
document.getElementById("saveBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const updatedData = {
    username: document.getElementById("editUsername").value.trim(),
    fatherName: document.getElementById("editFatherName").value.trim(),
    lastName: document.getElementById("editLastName").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
    phone: document.getElementById("editPhone").value.trim(),
    city: document.getElementById("editCity").value.trim(),
    country: document.getElementById("editCountry").value.trim(),
  };

  // ✅ التحقق من الحقول الفارغة
  for (const key in updatedData) {
    if (!updatedData[key]) {
      return showNotification("❌ يرجى تعبئة جميع الحقول قبل الحفظ", true);
    }
  }

  // ✅ التحقق من صحة البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(updatedData.email)) {
    return showNotification("❌ البريد الإلكتروني غير صالح", true);
  }

  try {
    const res = await fetch("http://localhost:5000/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await res.json();
    if (res.ok) {
      showNotification("✅ تم تحديث البيانات بنجاح");
      document.getElementById("profileEdit").style.display = "none";
      document.getElementById("profileView").style.display = "block";
      fetchUserInfo();
    } else {
      showNotification(data.msg || "❌ فشل في التحديث", true);
    }
  } catch (err) {
    showNotification("❌ حدث خطأ أثناء إرسال البيانات", true);
    console.error(err);
  }
});
function showNotification(message, isError = false) {
  const box = document.getElementById("notifyBox");
  box.innerText = message;
  box.className = "notify" + (isError ? " error" : "");
  setTimeout(() => box.classList.remove("hidden"), 10);
  setTimeout(() => box.classList.add("hidden"), 3000);
}

function toggleEdit(show) {
  if (show) {
    document.getElementById("profileView").style.display = "none";
    document.getElementById("profileEdit").style.display = "block";
  } else {
    document.getElementById("profileView").style.display = "block";
    document.getElementById("profileEdit").style.display = "none";
  }
}
window.toggleSidebar = () => {
  document.getElementById("layoutSidebar").classList.toggle("active");
};
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  window.location.href = "login.html";
}
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("logoutBtnSide").addEventListener("click", logout);

window.onload = fetchUserInfo;
