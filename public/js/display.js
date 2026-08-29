const socket = io();

const slotsContainer = document.querySelector("[data-slots]");
const overlay = document.querySelector("[data-quiz-overlay]");
const pickerEl = document.querySelector("[data-category-picker]");
const categoryGridEl = document.querySelector("[data-category-grid]");
const chosenEl = document.querySelector("[data-category-chosen]");
const chosenNameEl = document.querySelector("[data-chosen-name]");
const questionPanel = document.querySelector("[data-question-panel]");
const questionCard = document.querySelector(".question-lower-third");
const roundLabel = document.querySelector("[data-round-label]");
const questionEl = document.querySelector("[data-question]");
const cluesEl = document.querySelector("[data-clues]");
const optionsEl = document.querySelector("[data-options]");
const ladderPanel = document.querySelector("[data-ladder-panel]");
const ladderEl = document.querySelector("[data-ladder]");
const earnedEl = document.querySelector("[data-earned]");

var lastCategoryId = null;
var chosenTimer = null;
var CHOSEN_HOLD_MS = 1400;

function formatTime(deltaMs) {
  if (deltaMs === 0) return "1st";
  return "+" + (deltaMs / 1000).toFixed(1) + "s";
}

function createSlot(ring) {
  var article = document.createElement("article");
  article.className = "slot live";
  article.dataset.order = ring.order;
  article.dataset.team = ring.team;

  var bar = document.createElement("div");
  bar.className = "slot-bar";

  var place = document.createElement("span");
  place.className = "slot-place";
  place.textContent = ring.order;

  var name = document.createElement("span");
  name.className = "slot-name";
  name.textContent = ring.name;

  var time = document.createElement("span");
  time.className = "slot-time";
  time.textContent = formatTime(ring.deltaMs);

  bar.appendChild(place);
  bar.appendChild(name);
  bar.appendChild(time);
  article.appendChild(bar);
  return article;
}

function updateSlot(node, ring) {
  node.querySelector(".slot-place").textContent = ring.order;
  node.querySelector(".slot-name").textContent = ring.name;
  node.querySelector(".slot-time").textContent = formatTime(ring.deltaMs);
}

function renderBells(state) {
  if (!state.rings.length) {
    slotsContainer.innerHTML = "";
    return;
  }

  var orders = {};
  state.rings.forEach(function (ring) {
    orders[ring.order] = ring;
  });

  slotsContainer.querySelectorAll(".slot").forEach(function (node) {
    if (!orders[node.dataset.order]) node.remove();
  });

  state.rings.forEach(function (ring) {
    var existing = slotsContainer.querySelector('[data-order="' + ring.order + '"]');
    if (existing) {
      updateSlot(existing, ring);
      return;
    }

    var article = createSlot(ring);
    article.classList.add("slot-enter");
    slotsContainer.appendChild(article);
  });
}

function flashSlot(order) {
  var node = slotsContainer.querySelector('[data-order="' + order + '"]');
  if (!node) return;
  node.classList.remove("flash");
  void node.offsetWidth;
  node.classList.add("flash");
}

function clearChosenTimer() {
  if (chosenTimer) {
    clearTimeout(chosenTimer);
    chosenTimer = null;
  }
}

function hideQuizPanels() {
  pickerEl.classList.add("hidden");
  chosenEl.classList.add("hidden");
  questionPanel.classList.add("hidden");
  overlay.classList.remove("display-mode-picker", "display-mode-question");
}

function hideQuestionContent() {
  questionEl.classList.add("hidden");
  cluesEl.classList.add("hidden");
  optionsEl.classList.add("hidden");
  ladderPanel.classList.add("hidden");
}

function renderCategoryPicker(payload) {
  clearChosenTimer();
  hideQuizPanels();
  overlay.classList.remove("hidden");
  overlay.classList.add("display-mode-picker");
  pickerEl.classList.remove("hidden");
  pickerEl.classList.remove("display-picker-exit");
  void pickerEl.offsetWidth;
  pickerEl.classList.add("display-picker-enter");

  if (!payload.categories || !payload.categories.length) {
    categoryGridEl.innerHTML =
      '<p class="display-picker-empty">No categories loaded</p>';
    lastCategoryId = null;
    return;
  }

  categoryGridEl.innerHTML = "";
  payload.categories.forEach(function (cat, index) {
    var block = document.createElement("div");
    var colorIndex = index % 4;
    block.className =
      "display-category-block display-category-block--" + colorIndex;
    block.style.animationDelay = index * 80 + "ms";
    block.innerHTML =
      '<span class="display-category-block__label">' + cat.name + "</span>";
    categoryGridEl.appendChild(block);
  });

  lastCategoryId = null;
}

function renderCategoryChosen(name, colorIndex, onDone) {
  pickerEl.classList.remove("display-picker-enter");
  pickerEl.classList.add("display-picker-exit");

  window.setTimeout(function () {
    pickerEl.classList.add("hidden");
    chosenEl.classList.remove(
      "hidden",
      "display-chosen-exit",
      "display-category-chosen--0",
      "display-category-chosen--1",
      "display-category-chosen--2",
      "display-category-chosen--3"
    );
    if (colorIndex != null) {
      chosenEl.classList.add(
        "display-category-chosen--" + (colorIndex % 4)
      );
    }
    chosenNameEl.textContent = name;
    void chosenEl.offsetWidth;
    chosenEl.classList.add("display-chosen-enter");

    clearChosenTimer();
    chosenTimer = window.setTimeout(function () {
      chosenEl.classList.remove("display-chosen-enter");
      chosenEl.classList.add("display-chosen-exit");
      window.setTimeout(function () {
        chosenEl.classList.add("hidden");
        onDone();
      }, 450);
    }, CHOSEN_HOLD_MS);
  }, 280);
}

function renderLadder(payload) {
  ladderEl.innerHTML = "";
  if (!payload.ladder) return;

  payload.ladder.forEach(function (step) {
    var li = document.createElement("li");
    li.textContent = step.amount + " " + payload.currency;
    var isCurrent = !payload.gameOver && payload.step === step.step;
    var isPassed = payload.earnedAmount >= step.amount && !isCurrent;
    li.classList.toggle("ladder-current", isCurrent);
    li.classList.toggle("ladder-passed", isPassed);
    ladderEl.appendChild(li);
  });

  earnedEl.textContent = "Earned: " + payload.earnedAmount + " " + payload.currency;
  ladderPanel.classList.remove("hidden");
}

function setQuestionTheme(colorIndex) {
  questionCard.classList.remove(
    "question-lower-third--0",
    "question-lower-third--1",
    "question-lower-third--2",
    "question-lower-third--3"
  );
  roundLabel.classList.remove(
    "question-round--0",
    "question-round--1",
    "question-round--2",
    "question-round--3"
  );
  if (colorIndex == null) return;
  var idx = colorIndex % 4;
  questionCard.classList.add("question-lower-third--" + idx);
  roundLabel.classList.add("question-round--" + idx);
}

function formatRoundLabel(payload) {
  if (payload.categoryName) {
    var label = payload.roundTitle + " - " + payload.categoryName;
    if (payload.part === "sub1" || payload.part === "sub2") {
      label += " (Bonus)";
    }
    return label;
  }
  return payload.roundTitle;
}

function renderQuestionContent(payload, animateOpen) {
  hideQuestionContent();
  if (payload.type === "block" && payload.categoryColorIndex != null) {
    setQuestionTheme(payload.categoryColorIndex);
  } else {
    setQuestionTheme(null);
  }
  roundLabel.textContent = formatRoundLabel(payload);

  if (payload.type === "riddle") {
    if (payload.clues && payload.clues.length) {
      cluesEl.innerHTML = "";
      payload.clues.forEach(function (clue, index) {
        var li = document.createElement("li");
        li.textContent = "Clue " + (index + 1) + ": " + clue;
        cluesEl.appendChild(li);
      });
      cluesEl.classList.remove("hidden");
    } else {
      roundLabel.textContent = payload.roundTitle + " · Awaiting first clue";
    }
    return;
  }

  if (payload.type === "money") {
    renderLadder(payload);
    if (payload.gameOver) {
      questionEl.textContent = "Money Round complete";
      questionEl.classList.remove("hidden");
      return;
    }
    questionEl.textContent = payload.question;
    questionEl.classList.remove("hidden");
    optionsEl.innerHTML = "";
    payload.options.forEach(function (opt, index) {
      var li = document.createElement("li");
      li.textContent = String.fromCharCode(65 + index) + ". " + opt;
      optionsEl.appendChild(li);
    });
    optionsEl.classList.remove("hidden");
    return;
  }

  if (payload.question) {
    questionEl.textContent = payload.question;
    questionEl.classList.remove("hidden");
    if (animateOpen) {
      questionEl.classList.remove("display-question-reveal");
      void questionEl.offsetWidth;
      questionEl.classList.add("display-question-reveal");
    }
  }
}

function showQuestionPanel(payload, animateOpen) {
  overlay.classList.add("display-mode-question");
  questionPanel.classList.remove("hidden");
  if (animateOpen) {
    questionPanel.classList.remove("display-question-panel-open");
    void questionPanel.offsetWidth;
    questionPanel.classList.add("display-question-panel-open");
  }
  renderQuestionContent(payload, animateOpen);
}

function renderQuiz(payload) {
  if (!payload.visible) {
    clearChosenTimer();
    hideQuizPanels();
    overlay.classList.add("hidden");
    lastCategoryId = null;
    return;
  }

  if (payload.type === "category-picker") {
    renderCategoryPicker(payload);
    return;
  }

  if (payload.type === "block") {
    var isNewCategory = payload.categoryId !== lastCategoryId;
    lastCategoryId = payload.categoryId;

    if (isNewCategory) {
      clearChosenTimer();
      questionPanel.classList.add("hidden");
      overlay.classList.remove("hidden");
      overlay.classList.add("display-mode-picker");
      renderCategoryChosen(
        payload.categoryName,
        payload.categoryColorIndex,
        function () {
        overlay.classList.remove("display-mode-picker");
        showQuestionPanel(payload, true);
      });
      return;
    }

    overlay.classList.remove("hidden");
    showQuestionPanel(payload, false);
    return;
  }

  clearChosenTimer();
  lastCategoryId = null;
  hideQuizPanels();
  overlay.classList.remove("hidden");
  overlay.classList.add("display-mode-question");
  questionPanel.classList.remove("hidden");
  renderQuestionContent(payload, false);
}

socket.on("state", renderBells);
socket.on("ring", function (ring) {
  flashSlot(ring.order);
});
socket.on("quiz:display", renderQuiz);
