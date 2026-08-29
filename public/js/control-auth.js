(function () {
  var logoutBtn = document.querySelector("[data-control-logout]");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    fetch("/api/control/logout", {
      method: "POST",
      credentials: "same-origin",
    })
      .finally(function () {
        var next = encodeURIComponent(window.location.pathname || "/host");
        window.location.href = "/login?next=" + next;
      });
  });
})();
