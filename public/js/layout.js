// layout.js
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "guest";

  // ✅ Header (ترويسة الصفحة)
  const header = `
    <header class="layout-header" dir="rtl">
      <div class="layout-container">
        <div class="layout-logo">
          <img src="../media/logo.png" alt="Logo" />
          <p>بالصلاة نحيا</p>
        </div>
        <nav class="layout-nav">
          <ul>
            <li><a href="index.html">الرئيسية</a></li>
            <li><a href="#aboutUs">الميزات</a></li>
            <li><a href="#" onclick="openVolunteerForm()">التطوع</a></li>
            ${
              role !== "guest"
                ? `<li><a href="#" id="logoutBtn">تسجيل الخروج</a></li>`
                : `<li><a href="sign-up.html">انضم إلينا</a></li>`
            }
          </ul>
        </nav>
        <div class="layout-list-icon" onclick="toggleSidebar()">
          <i class="fa-solid fa-bars"></i>
        </div>
      </div>
    </header>
  `;

  // ✅ Sidebar (قائمة جانبية للجوال)
  const sidebar = `
    <aside class="layout-sidebar" id="layoutSidebar">
      <ul>
        <li><a href="index.html">الرئيسية</a></li>
        <li><a href="sign-up.html">التسجيل</a></li>
        <li><a href="#" onclick="openVolunteerForm()">التطوع</a></li>
        ${
          role !== "guest"
            ? `<li><a href="#" id="logoutBtnSide">تسجيل الخروج</a></li>`
            : ""
        }
      </ul>
    </aside>
  `;

  // ✅ Footer (فقط للزوار والصفحات العامة)
  const footer = `
    <footer class="layout-footer">
      <div class="layout-footer-container">
        <div class="layout-footer-section">
          <ul>
            <li><a href="">شروط الخدمة</a></li>
            <li><a href="">تواصل معنا</a></li>
          </ul>
          <div class="layout-social-icons">
            <a href="https://www.facebook.com/profile.php?id=61571734263777" target="_blank"><i class="fa-brands fa-facebook"></i></a>
            <a href="https://www.instagram.com/pray_2_live" target="_blank"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://t.me/pray_2l_ive" target="_blank"><i class="fa-brands fa-telegram"></i></a>
            <a href="https://whatsapp.com/channel/0029Vb384f2GZNClhWzUWD1P" target="_blank"><i class="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>
        <div class="layout-footer-section">
          <ul>
            <li><a href="index.html">الرئيسية</a></li>
            <li><a href="#" onclick="openVolunteerForm()">التطوع</a></li>
            <li><a href="sign-up.html">انضم إلينا</a></li>
          </ul>
        </div>
        <div class="layout-footer-brand">
          <img src="../media/logo.png" alt="Logo" />
          <h3>بالصلاة نحيا</h3>
          <p>ابدأ موعدك مع الرحمن</p>
        </div>
      </div>
      <div class="layout-copyright">
        <p>© 2025 جميع الحقوق محفوظة | بالصلاة نحيا</p>
      </div>
    </footer>
  `;

  // ✅ إدراج العناصر
  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", sidebar);

  if (!["admin", "supervisor"].includes(role)) {
    document.body.insertAdjacentHTML("beforeend", footer);
  }

  // ✅ زر تفعيل القائمة الجانبية
  window.toggleSidebar = () => {
    document.getElementById("layoutSidebar").classList.toggle("active");
  };

  // ✅ تسجيل الخروج
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutBtnSide = document.getElementById("logoutBtnSide");
  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  };
  if (logoutBtn) logoutBtn.addEventListener("click", logoutHandler);
  if (logoutBtnSide) logoutBtnSide.addEventListener("click", logoutHandler);
});
