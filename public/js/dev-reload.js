(function () {
  if (typeof io === "undefined") return;

  var socket = io();
  var storageKey = "quiz-dev-session";

  socket.on("dev:session", function (sessionId) {
    var previous = sessionStorage.getItem(storageKey);
    var next = String(sessionId);
    sessionStorage.setItem(storageKey, next);
    if (previous && previous !== next) {
      window.location.reload();
    }
  });
})();
