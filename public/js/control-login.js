(function () {
  var form = document.querySelector("[data-control-login-form]");
  var passwordInput = document.getElementById("control-password");
  var errorEl = document.querySelector("[data-control-login-error");

  if (!form || !passwordInput) return;

  var params = new URLSearchParams(window.location.search);
  var nextPath = params.get("next") || "/host";
  if (nextPath.indexOf("/login") === 0) nextPath = "/host";

  fetch("/api/control/session", { credentials: "same-origin" })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data && data.authenticated) {
        window.location.replace(nextPath);
      }
    })
    .catch(function () {});

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (errorEl) errorEl.classList.add("hidden");

    fetch("/api/control/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput.value }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("login failed");
        return res.json();
      })
      .then(function () {
        window.location.replace(nextPath);
      })
      .catch(function () {
        if (errorEl) errorEl.classList.remove("hidden");
        passwordInput.select();
      });
  });
})();
