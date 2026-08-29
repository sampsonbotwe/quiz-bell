(function (global) {
  var activeFrame = null;

  function formatMoney(amount, currency) {
    var value = Number(amount) || 0;
    if (currency === "GHS") {
      return "GHS " + value.toFixed(2);
    }
    return value + " " + (currency || "");
  }

  function formatGain(amount, currency) {
    return "+ " + formatMoney(amount, currency);
  }

  function ensureAudio() {
    if (typeof global.unlockBells === "function") {
      return global.unlockBells();
    }
    return Promise.resolve();
  }

  function playTickForValue(from, to, value) {
    if (typeof global.playMoneyTick !== "function") return;
    if (to <= from) return;
    var progress = (value - from) / (to - from);
    global.playMoneyTick(progress);
  }

  function playLandSound() {
    if (typeof global.playMoneyLand === "function") {
      global.playMoneyLand();
    }
  }

  function animateMoneyCount(el, from, to, currency, duration, onDone) {
    if (activeFrame) {
      cancelAnimationFrame(activeFrame);
      activeFrame = null;
    }

    var start = null;
    from = Number(from) || 0;
    to = Number(to) || 0;
    duration = duration || 900;
    var lastValue = from;
    var lastSoundAt = 0;

    function frame(ts) {
      if (!start) start = ts;
      var progress = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(from + (to - from) * eased);
      el.textContent = formatMoney(value, currency);

      if (value > lastValue && ts - lastSoundAt > 65) {
        playTickForValue(from, to, value);
        lastValue = value;
        lastSoundAt = ts;
      }

      if (progress < 1) {
        activeFrame = requestAnimationFrame(frame);
        return;
      }

      activeFrame = null;
      el.textContent = formatMoney(to, currency);
      if (to > lastValue) {
        playLandSound();
      }
      if (onDone) onDone();
    }

    activeFrame = requestAnimationFrame(frame);
  }

  function pulseMoney(el) {
    if (!el) return;
    if (el.classList.contains("money-celebration-total")) return;
    el.classList.remove("money-total-pop");
    void el.offsetWidth;
    el.classList.add("money-total-pop");
  }

  function runMoneyGain(el, payload) {
    if (!el || !payload) return;
    ensureAudio().then(function () {
      pulseMoney(el);
      animateMoneyCount(
        el,
        payload.total - payload.gained,
        payload.total,
        payload.currency,
        900
      );
    });
  }

  var rainInterval = null;
  var rainContainer = null;

  function stopMoneyRain() {
    if (rainInterval) {
      clearInterval(rainInterval);
      rainInterval = null;
    }
    if (rainContainer) {
      rainContainer.innerHTML = "";
      rainContainer = null;
    }
  }

  function spawnMoneyPiece(container) {
    var symbols = ["₵", "GHS", "💰"];
    var piece = document.createElement("span");
    piece.className = "money-rain-piece";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = Math.random() * 100 + "%";
    piece.style.animationDuration = 2.4 + Math.random() * 2.2 + "s";
    piece.style.animationDelay = Math.random() * 0.4 + "s";
    piece.style.fontSize = 18 + Math.random() * 26 + "px";
    piece.style.opacity = 0.55 + Math.random() * 0.45;
    container.appendChild(piece);
    piece.addEventListener("animationend", function () {
      piece.remove();
    });
  }

  function startMoneyRain(container) {
    if (!container) return;
    stopMoneyRain();
    rainContainer = container;
    for (var i = 0; i < 28; i++) {
      (function (delay) {
        setTimeout(function () {
          if (rainContainer === container) spawnMoneyPiece(container);
        }, delay);
      })(i * 90);
    }
    rainInterval = setInterval(function () {
      spawnMoneyPiece(container);
    }, 160);
  }

  function runMoneyCelebration(totalEl, payload, options) {
    if (!totalEl || !payload) return;
    options = options || {};
    var total = Number(payload.total) || 0;
    var currency = payload.currency;

    if (options.animate === false) {
      totalEl.textContent = formatMoney(total, currency);
      if (!totalEl.classList.contains("money-celebration-total")) {
        pulseMoney(totalEl);
      }
      if (total > 0) {
        ensureAudio().catch(function () {});
        playLandSound();
      }
      return;
    }

    ensureAudio().catch(function () {});
    totalEl.textContent = formatMoney(0, currency);
    pulseMoney(totalEl);
    animateMoneyCount(totalEl, 0, total, currency, 1400, playLandSound);
  }

  global.MoneyAnimate = {
    formatMoney: formatMoney,
    formatGain: formatGain,
    runMoneyGain: runMoneyGain,
    runMoneyCelebration: runMoneyCelebration,
    startMoneyRain: startMoneyRain,
    stopMoneyRain: stopMoneyRain,
    setTotal: function (el, total, currency) {
      if (!el) return;
      el.textContent = formatMoney(total, currency);
    },
  };
})(window);
