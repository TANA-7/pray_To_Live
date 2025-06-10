const token = localStorage.getItem("token");

if (!token) {
  // إعادة توجيه لصفحة تسجيل الدخول
  window.location.href = "login.html";
}

let supervisorsList = [];

async function updateStatus(id, status) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(
      `http://localhost:5000/api/volunteer/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      alert("تم التحديث بنجاح");
      loadVolunteerRequests(); // إعادة تحميل الجدول بعد التحديث
    } else {
      alert(data.msg || "فشل في التحديث");
    }
  } catch (err) {
    alert("حدث خطأ أثناء التحديث");
    console.error(err);
  }
}
async function loadSupervisors() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("http://localhost:5000/api/users/supervisors", {
      headers: { Authorization: "Bearer " + token },
    });
    supervisorsList = await res.json();
  } catch (err) {
    alert("فشل في تحميل قائمة المشرفين");
    console.error(err);
  }
}

async function loadUnassignedUsers() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      "http://localhost:5000/api/users/unassigned-users",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    const users = await res.json();
    const tbody = document.getElementById("unassignedBody");
    tbody.innerHTML = "";

    users.forEach((user) => {
      const row = document.createElement("tr");
      const supervisorOptions = supervisorsList
        .map(
          (sup) =>
            `<option value="${sup._id}">${sup.username} ${
              sup.lastName || ""
            }</option>`
        )
        .join("");

      row.innerHTML = `
<td>${user.username} ${user.lastName || ""}</td>
        <td>${user.email}</td>
        <td>
          <select id="supervisorFor-${user._id}">
            <option value="">اختر مشرفًا</option>
            ${supervisorOptions}
          </select>
          <button onclick="assignSupervisor('${user._id}')">تعيين</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    alert("فشل في تحميل المستخدمين غير المربوطين");
    console.error(err);
  }
}

async function assignSupervisor(userId) {
  const token = localStorage.getItem("token");
  const supervisorId = document
    .getElementById(`supervisorFor-${userId}`)
    .value.trim();
  if (!supervisorId) return alert("يرجى اختيار مشرف");

  try {
    const res = await fetch(
      `http://localhost:5000/api/users/${userId}/assign-supervisor`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ supervisorId }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      alert("تم التعيين بنجاح");
      loadUnassignedUsers();
    } else {
      alert(data.msg || "فشل في التعيين");
    }
  } catch (err) {
    alert("حدث خطأ أثناء عملية التعيين");
    console.error(err);
  }
}

async function loadVolunteerRequests() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("http://localhost:5000/api/volunteer/requests", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    const tbody = document.getElementById("volunteerTableBody");
    tbody.innerHTML = "";

    data.forEach((req) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${
          (req.userId?.username || "") + " " + (req.userId?.lastName || "")
        }</td>
        <td>${req.userId?.email || "-"}</td>
        <td>${req.memorizesQuran}</td>
        <td>${req.howMuchQuran || "-"}</td>
        <td>${req.studiesSharia}</td>
        <td>${req.scholars || "-"}</td>
        <td>${req.motivation}</td>
        <td>${req.adviceExample}</td>
        <td>
          ${
            req.status === "pending"
              ? `
            <button onclick="updateStatus('${req._id}', 'approved')">قبول</button>
            <button onclick="updateStatus('${req._id}', 'rejected')">رفض</button>
          `
              : req.status === "approved"
              ? "✔️ مقبول"
              : "❌ مرفوض"
          }
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("فشل في جلب طلبات التطوع", err);
  }
}

async function fetchPrayerCount(userId) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(
      `http://localhost:5000/api/prayers/count/${userId}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    const data = await res.json();
    return data.count || 0;
  } catch (err) {
    console.error("فشل في جلب عدد الصلوات للمستخدم", err);
    return 0;
  }
}

async function loadAllUsers() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("http://localhost:5000/api/users/all", {
      headers: { Authorization: "Bearer " + token },
    });
    const users = await res.json();

    const tbody = document.querySelector(".admin-panel tbody");
    tbody.innerHTML = "";

    for (const user of users) {
      const count = await fetchPrayerCount(user._id);
      const status = user.prayerStatus || "غير محدد";
      const statusClass =
        status === "محافظ" ? "user-status" : "user-status off";

      const row = document.createElement("tr");
      row.innerHTML = `
<td>${user.username} ${user.lastName || ""}</td>
        <td class="${statusClass}">${status}</td>
        <td>${count} صلوات</td>
        <td><button onclick="toggleStatus('${
          user._id
        }')">تغيير الحالة</button></td>
      `;
      tbody.appendChild(row);
    }
  } catch (err) {
    console.error("فشل في تحميل المستخدمين", err);
  }
}

async function loadSupervisorsAndUsers() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("http://localhost:5000/api/users/supervisors", {
      headers: { Authorization: "Bearer " + token },
    });
    const supervisors = await res.json();

    const tbody = document.querySelector(".supervisors-panel tbody");
    tbody.innerHTML = "";

    for (const supervisor of supervisors) {
const userRes = await fetch(
  `http://localhost:5000/api/users/by-supervisor/${supervisor._id}`,
  {
    headers: { Authorization: "Bearer " + token },
  }
);
const usersData = await userRes.json();
const userNames = usersData.users
  .map((u) => `${u.username} ${u.lastName || ""}`)
  .join("، ");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${supervisor.username} ${supervisor.lastName}</td>
        <td>${userNames}</td>
        <td><button onclick="addSupervisor()">إضافة مشرف</button></td>
      `;
      tbody.appendChild(row);
    }
  } catch (err) {
    console.error("فشل في تحميل المشرفين أو المستخدمين", err);
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

window.onload = async function () {
  await loadSupervisors();
  await loadUnassignedUsers();
  await loadVolunteerRequests();
  await loadAllUsers();
  await loadSupervisorsAndUsers();
};
