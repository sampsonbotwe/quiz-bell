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
const ladderQuestionEl = document.querySelector("[data-ladder-question]");
const ladderPlayingForEl = document.querySelector("[data-ladder-playing-for]");
const ladderGuaranteedEl = document.querySelector("[data-ladder-guaranteed]");
const earnedPanel = document.querySelector("[data-money-earned-panel]");
const earnedEl = document.querySelector("[data-earned]");
const celebrationEl = document.querySelector("[data-money-celebration]");
const celebrationTotalEl = document.querySelector("[data-celebration-total]");
const moneyRainEl = document.querySelector("[data-money-rain]");
const displayTimerEl = document.querySelector("[data-display-timer]");
const displayTimerValueEl = document.querySelector("[data-display-timer-value]");
const liveScoresEl = document.querySelector("[data-live-scores]");
const liveScoresTeamsEl = document.querySelector("[data-live-scores-teams]");
const displayPanel = document.querySelector(".display-panel");
const resultsOverlayEl = document.querySelector("[data-results-overlay]");
const resultsKickerEl = document.querySelector("[data-results-kicker]");
const resultsTitleEl = document.querySelector("[data-results-title]");
const resultsWinnerEl = document.querySelector("[data-results-winner]");
const resultsListEl = document.querySelector("[data-results-list]");
const resultsConfettiEl = document.querySelector("[data-results-confetti]");

var lastCategoryId = null;
var chosenTimer = null;
var CHOSEN_HOLD_MS = 1400;
var showingMoneyCelebration = false;
var resultsOverlayActive = false;
var quizDisplayLive = false;
var lastQuizPayload = null;
var displayTimerFadeTimer = null;
var displayTimerExpireTimer = null;
var displayTimerBuzzMs = 1800;
var liveScoresPayload = null;
var liveScoresHideTimer = null;
var liveScoresByTeam = {};
var LIVE_SCORES_ANIM_MS = 580;
var LIVE_SCORE_CHANGE_MS = 480;
var resultsConfettiTimer = null;

function createLiveScoresTeamCell(team) {
  var cell = document.createElement("div");
  cell.className = "display-live-scores-team";
  cell.dataset.team = team.id;
  cell.style.setProperty("--team-color", team.color);

  var name = document.createElement("span");
  name.className = "display-live-scores-name";
  name.textContent = team.name;

  var score = document.createElement("span");
  score.className = "display-live-scores-value";

  var number = document.createElement("span");
  number.className = "display-live-scores-number";
  number.textContent = String(team.score);
  score.appendChild(number);

  cell.appendChild(name);
  cell.appendChild(score);
  return cell;
}

function getScoreNumberEl(scoreWrap) {
  var number = scoreWrap.querySelector(".display-live-scores-number");
  if (!number) {
    number = document.createElement("span");
    number.className = "display-live-scores-number";
    number.textContent = scoreWrap.textContent;
    scoreWrap.textContent = "";
    scoreWrap.appendChild(number);
  }
  return number;
}

function animateScoreValue(numberEl, from, to) {
  numberEl.textContent = String(to);
  numberEl.classList.remove("display-live-scores-number--up", "display-live-scores-number--down");
  void numberEl.offsetWidth;
  numberEl.classList.add(to > from ? "display-live-scores-number--up" : "display-live-scores-number--down");

  setTimeout(function () {
    numberEl.classList.remove("display-live-scores-number--up", "display-live-scores-number--down");
  }, LIVE_SCORE_CHANGE_MS);
}

function renderLiveScoresTeams(teams) {
  if (!liveScoresTeamsEl || !teams) return;

  teams.forEach(function (team) {
    var cell = liveScoresTeamsEl.querySelector('[data-team="' + team.id + '"]');
    if (!cell) {
      cell = createLiveScoresTeamCell(team);
      liveScoresTeamsEl.appendChild(cell);
    }

    var scoreWrap = cell.querySelector(".display-live-scores-value");
    var scoreEl = scoreWrap ? getScoreNumberEl(scoreWrap) : null;
    var prevScore = liveScoresByTeam[team.id];
    var newScore = team.score;

    if (scoreEl && prevScore !== undefined && prevScore !== newScore) {
      animateScoreValue(scoreEl, prevScore, newScore);
    } else if (scoreEl) {
      scoreEl.textContent = String(newScore);
    }

    liveScoresByTeam[team.id] = newScore;
  });
}

function setLiveScoresVisible(show) {
  if (!liveScoresEl) return;

  clearTimeout(liveScoresHideTimer);

  if (show) {
    liveScoresEl.classList.remove("hidden");
    void liveScoresEl.offsetWidth;
    liveScoresEl.classList.add("display-live-scores-visible");
    return;
  }

  liveScoresEl.classList.remove("display-live-scores-visible");
  liveScoresHideTimer = setTimeout(function () {
    if (!liveScoresEl.classList.contains("display-live-scores-visible")) {
      liveScoresEl.classList.add("hidden");
    }
  }, LIVE_SCORES_ANIM_MS);
}

function renderLiveScores(payload) {
  liveScoresPayload = payload || null;
  if (!liveScoresEl || !liveScoresTeamsEl) return;

  if (payload && payload.resultsOverlay) {
    showResultsOverlay(payload);
    return;
  }

  if (resultsOverlayActive) {
    hideResultsOverlay();
    if (lastQuizPayload) {
      renderQuiz(lastQuizPayload, { live: quizDisplayLive });
    }
  }

  if (payload && payload.teams) {
    renderLiveScoresTeams(payload.teams);
  }

  var show = Boolean(payload && payload.showOnDisplay);
  setLiveScoresVisible(show);
}

function stopResultsConfetti() {
  if (resultsConfettiTimer) {
    clearInterval(resultsConfettiTimer);
    resultsConfettiTimer = null;
  }
  if (resultsConfettiEl) {
    resultsConfettiEl.innerHTML = "";
    resultsConfettiEl.classList.add("hidden");
  }
}

function startResultsConfetti() {
  if (!resultsConfettiEl) return;
  stopResultsConfetti();
  resultsConfettiEl.classList.remove("hidden");

  var colors = ["#fde68a", "#2563eb", "#e63946", "#ca8a04", "#72c044", "#ffffff"];

  function spawnPiece() {
    if (!resultsConfettiEl) return;
    var piece = document.createElement("span");
    piece.className = "display-results-confetti__piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.4 + Math.random() * 1.6 + "s";
    piece.style.animationDelay = Math.random() * 0.35 + "s";
    piece.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
    resultsConfettiEl.appendChild(piece);
    setTimeout(function () {
      piece.remove();
    }, 4500);
  }

  for (var i = 0; i < 28; i++) spawnPiece();
  resultsConfettiTimer = setInterval(spawnPiece, 160);
}

function hideResultsOverlay() {
  if (!resultsOverlayEl) return;
  stopResultsConfetti();
  resultsOverlayActive = false;
  resultsOverlayEl.classList.add("hidden");
  resultsOverlayEl.classList.remove("display-results-overlay--visible");
  if (displayPanel) displayPanel.classList.remove("hidden");
}

function showResultsOverlay(payload) {
  if (!resultsOverlayEl) return;

  var isFinal = Boolean(payload.announceWinner);
  resultsOverlayActive = true;
  showingMoneyCelebration = false;
  stopResultsConfetti();

  resultsOverlayEl.classList.toggle("display-results-overlay--final", isFinal);

  setLiveScoresVisible(false);
  if (liveScoresEl) liveScoresEl.classList.add("hidden");
  overlay.classList.add("hidden");
  if (displayPanel) displayPanel.classList.add("hidden");
  if (displayTimerEl) {
    displayTimerEl.classList.add("hidden");
    displayTimerEl.classList.remove("display-timer-visible", "display-timer-fade-out");
  }
  if (ladderPanel) ladderPanel.classList.add("hidden");
  if (celebrationEl) celebrationEl.classList.add("hidden");
  if (earnedPanel) earnedPanel.classList.add("hidden");
  document.body.classList.remove("display-money-active");

  if (resultsKickerEl) {
    resultsKickerEl.textContent = "Round " + payload.round + " complete";
  }
  if (resultsTitleEl) {
    resultsTitleEl.textContent =
      payload.round === 4 ? "Final scores" : "Total scores";
  }

  if (resultsWinnerEl) {
    if (payload.announceWinner && payload.winnerNames && payload.winnerNames.length) {
      resultsWinnerEl.classList.remove("hidden", "display-results-overlay__winner--tie");
      resultsWinnerEl.textContent = payload.isTie
        ? payload.winnerNames.join(" & ") + " — tied winners"
        : payload.winnerNames[0];
      if (payload.isTie) {
        resultsWinnerEl.classList.add("display-results-overlay__winner--tie");
      }
      resultsWinnerEl.style.setProperty(
        "--results-index",
        String((payload.resultsTeams || []).length)
      );
    } else {
      resultsWinnerEl.classList.add("hidden");
      resultsWinnerEl.textContent = "";
      resultsWinnerEl.style.removeProperty("--results-index");
    }
  }

  if (resultsListEl) {
    resultsListEl.innerHTML = "";
    (payload.resultsTeams || []).forEach(function (team, index) {
      var isWinner =
        isFinal &&
        payload.winnerIds &&
        payload.winnerIds.indexOf(team.id) >= 0;

      var row = document.createElement("li");
      row.className = "display-results-overlay__row";
      row.style.setProperty("--results-index", String(index));

      if (isWinner) {
        var cup = document.createElement("span");
        cup.className = "display-results-overlay__cup";
        cup.setAttribute("aria-hidden", "true");
        cup.textContent = "🏆";
        cup.style.setProperty("--results-index", String(index));
        row.appendChild(cup);
      } else if (isFinal) {
        var cupSpacer = document.createElement("span");
        cupSpacer.className = "display-results-overlay__cup-spacer";
        cupSpacer.setAttribute("aria-hidden", "true");
        row.appendChild(cupSpacer);
      }

      var item = document.createElement("div");
      item.className = "display-results-overlay__item";
      item.style.setProperty("--results-index", String(index));
      if (isWinner) {
        item.classList.add("display-results-overlay__item--winner");
      }
      item.style.setProperty("--team-color", team.color);

      if (isFinal) {
        var place = document.createElement("span");
        place.className = "display-results-overlay__place";
        if (team.place === 1) place.classList.add("display-results-overlay__place--1");
        if (team.place === 2) place.classList.add("display-results-overlay__place--2");
        if (team.place === 3) place.classList.add("display-results-overlay__place--3");
        place.textContent =
          team.place === 1
            ? "1st"
            : team.place === 2
              ? "2nd"
              : team.place === 3
                ? "3rd"
                : String(team.place);
        item.appendChild(place);
      }

      var copy = document.createElement("div");
      copy.className = "display-results-overlay__copy";

      var name = document.createElement("span");
      name.className = "display-results-overlay__name";

      var nameText = document.createElement("span");
      nameText.className = "display-results-overlay__name-text";
      nameText.textContent = team.name;
      name.appendChild(nameText);

      var meta = document.createElement("span");
      meta.className = "display-results-overlay__meta";
      meta.textContent = "Total points";

      copy.appendChild(name);
      copy.appendChild(meta);

      var scoreWrap = document.createElement("span");
      scoreWrap.className = "display-results-overlay__score";

      var score = document.createElement("span");
      score.className = "display-results-overlay__score-value";
      score.textContent = String(team.score);

      var scoreLabel = document.createElement("span");
      scoreLabel.className = "display-results-overlay__score-label";
      scoreLabel.textContent = "pts";

      scoreWrap.appendChild(score);
      scoreWrap.appendChild(scoreLabel);

      item.appendChild(copy);
      item.appendChild(scoreWrap);
      row.appendChild(item);
      resultsListEl.appendChild(row);
    });
  }

  resultsOverlayEl.classList.remove("hidden");
  resultsOverlayEl.classList.remove("display-results-overlay--visible");
  void resultsOverlayEl.offsetWidth;
  resultsOverlayEl.classList.add("display-results-overlay--visible");

  if (isFinal) {
    startResultsConfetti();
  }
}

document.addEventListener(
  "pointerdown",
  function () {
    if (window.unlockBells) window.unlockBells();
  },
  { once: true }
);

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
  if (resultsOverlayActive) return;
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
  ladderPanel.classList.add("hidden");
  if (earnedPanel) earnedPanel.classList.add("hidden");
  hideMoneyCelebration();
  document.body.classList.remove("display-money-active");
  overlay.classList.remove("display-mode-picker", "display-mode-question");
}

function hideMoneyCelebration() {
  if (!celebrationEl) return;
  showingMoneyCelebration = false;
  celebrationEl.classList.add("hidden");
  celebrationEl.classList.remove("display-money-celebration--visible");
  if (window.MoneyAnimate) {
    MoneyAnimate.stopMoneyRain();
  }
}

function hideQuestionContent() {
  questionEl.classList.add("hidden");
  cluesEl.classList.add("hidden");
  optionsEl.classList.add("hidden");
  optionsEl.classList.remove("question-options--grid", "question-options--money");
  questionCard.classList.remove("question-lower-third--money");
  ladderPanel.classList.add("hidden");
  if (earnedPanel) earnedPanel.classList.add("hidden");
  document.body.classList.remove("display-money-active");
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
      '<p class="display-picker-empty">All categories complete</p>';
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

function renderLadder(payload, animateTotal) {
  ladderEl.innerHTML = "";
  if (!payload.ladder || !payload.ladder.length) return;

  document.body.classList.add("display-money-active");

  var milestones = [5, 10, 15];
  var cumulative = 0;
  var rungs = payload.ladder.map(function (step) {
    cumulative += step.amount;
    return {
      step: step.step,
      increment: step.amount,
      total: cumulative,
    };
  });

  function formatLadderAmount(amount) {
    if (!amount) return "—";
    return window.MoneyAnimate
      ? MoneyAnimate.formatMoney(amount, payload.currency)
      : amount + " " + payload.currency;
  }

  function findRung(step) {
    for (var i = 0; i < rungs.length; i++) {
      if (rungs[i].step === step) return rungs[i];
    }
    return null;
  }

  var activeStep = payload.step || 1;
  var questionsPassed = payload.gameOver
    ? Math.max(0, activeStep - 1)
    : Math.max(0, activeStep - 1);
  var currentRung = findRung(activeStep);
  var lastSafe = null;
  milestones.forEach(function (m) {
    if (m <= questionsPassed) lastSafe = m;
  });

  if (ladderQuestionEl) {
    ladderQuestionEl.textContent =
      "Question " + activeStep + " / " + (payload.total || rungs.length);
  }
  if (ladderPlayingForEl) {
    ladderPlayingForEl.textContent = currentRung
      ? formatLadderAmount(currentRung.total)
      : formatLadderAmount(0);
  }
  if (ladderGuaranteedEl) {
    var safeRung = lastSafe ? findRung(lastSafe) : null;
    ladderGuaranteedEl.textContent = safeRung
      ? formatLadderAmount(safeRung.total)
      : formatLadderAmount(0);
    ladderGuaranteedEl.classList.toggle("money-ladder-guaranteed-amount--active", !!lastSafe);
  }

  rungs
    .slice()
    .reverse()
    .forEach(function (rung) {
      var li = document.createElement("li");
      li.className = "money-ladder-row";
      li.dataset.step = String(rung.step);

      var isCurrent = !payload.gameOver && rung.step === activeStep;
      var isBanked = rung.step < activeStep;
      var isMilestone = milestones.indexOf(rung.step) >= 0;

      li.classList.toggle("money-ladder-row--current", isCurrent);
      li.classList.toggle("money-ladder-row--banked", isBanked);
      li.classList.toggle("money-ladder-row--milestone", isMilestone);

      var frame = document.createElement("div");
      frame.className = "money-ladder-row-frame";

      var inner = document.createElement("div");
      inner.className = "money-ladder-row-inner";

      var stepNum = document.createElement("span");
      stepNum.className = "money-ladder-step";
      stepNum.textContent = rung.step;

      var tag = document.createElement("span");
      tag.className = "money-ladder-tag";
      if (isMilestone && !isCurrent) {
        tag.textContent = "safe";
      }

      var amount = document.createElement("span");
      amount.className = "money-ladder-amount";
      amount.textContent = formatLadderAmount(rung.total);

      var diamond = document.createElement("span");
      diamond.className = "money-ladder-diamond";
      diamond.setAttribute("aria-hidden", "true");

      inner.appendChild(stepNum);
      inner.appendChild(tag);
      inner.appendChild(amount);
      inner.appendChild(diamond);

      if (isCurrent) {
        var sheen = document.createElement("span");
        sheen.className = "money-ladder-sheen";
        sheen.setAttribute("aria-hidden", "true");
        inner.appendChild(sheen);
      }

      frame.appendChild(inner);
      li.appendChild(frame);
      ladderEl.appendChild(li);
    });

  if (animateTotal) {
    ladderPanel.classList.remove("hidden");
    if (earnedPanel) earnedPanel.classList.remove("hidden");
    return;
  }

  if (window.MoneyAnimate) {
    MoneyAnimate.setTotal(earnedEl, payload.earnedAmount, payload.currency);
  } else {
    earnedEl.textContent = payload.earnedAmount + " " + payload.currency;
  }
  ladderPanel.classList.remove("hidden");
  if (earnedPanel) earnedPanel.classList.remove("hidden");
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

function resolveQuestionTheme(payload) {
  if (payload.type === "block" && payload.categoryColorIndex != null) {
    return payload.categoryColorIndex;
  }
  if (payload.round >= 3 && payload.round <= 5) {
    return 0;
  }
  return null;
}

function formatRoundLabel(payload) {
  if (payload.categoryName) {
    var label = payload.roundTitle + " - " + payload.categoryName;
    if (payload.part === "sub1" || payload.part === "sub2") {
      label += " (Bonus)";
    }
    return label;
  }
  if (payload.setLabel) {
    return payload.roundTitle + " - " + payload.setLabel;
  }
  return payload.roundTitle;
}

function renderQuestionContent(payload, animateOpen) {
  hideQuestionContent();
  setQuestionTheme(resolveQuestionTheme(payload));
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

  if (payload.type === "money" && payload.round === 5) {
    if (payload.gameOver) {
      return;
    }
    renderLadder(payload);
    questionCard.classList.add("question-lower-third--money");
    roundLabel.textContent = "Money Round";
    if (payload.gameOver) {
      questionEl.textContent = "Money Round complete";
      questionEl.classList.remove("hidden");
      return;
    }
    questionEl.textContent = payload.question;
    questionEl.classList.remove("hidden");
    optionsEl.innerHTML = "";
    optionsEl.classList.remove("question-options--grid", "question-options--money");
    if (payload.displayShowsOptions && payload.options && payload.options.length) {
      var hiddenOptions = payload.hiddenOptions || [];
      payload.options.forEach(function (opt, index) {
        var li = document.createElement("li");
        li.dataset.optionIndex = String(index);
        var letter = String.fromCharCode(65 + index);
        var isDropped = hiddenOptions.indexOf(index) >= 0;
        if (isDropped) {
          li.classList.add("question-option--dropped");
          li.textContent = letter + ". —";
        } else {
          li.textContent = letter + ". " + opt;
        }
        optionsEl.appendChild(li);
      });
      optionsEl.classList.add("question-options--grid", "question-options--money");
      optionsEl.classList.remove("hidden");
    } else {
      optionsEl.classList.add("hidden");
    }
    return;
  }

  questionCard.classList.remove("question-lower-third--money");
  optionsEl.classList.remove("question-options--grid", "question-options--money");

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

function flashCorrectAnswer(correctIndex) {
  if (!optionsEl || correctIndex == null) {
    flashCorrectQuestion();
    return;
  }
  var option = optionsEl.querySelector(
    '[data-option-index="' + correctIndex + '"]'
  );
  if (
    !option ||
    option.classList.contains("question-option--dropped") ||
    optionsEl.classList.contains("hidden")
  ) {
    flashCorrectQuestion();
    return;
  }
  option.classList.remove("question-option--correct-flash");
  void option.offsetWidth;
  option.classList.add("question-option--correct-flash");
}

function flashCorrectQuestion() {
  if (!questionEl) return;
  questionEl.classList.remove("question-body--correct-flash");
  void questionEl.offsetWidth;
  questionEl.classList.add("question-body--correct-flash");
}

function celebrationEarned(payload) {
  return Number(payload.earnedAmount) || 0;
}

function updateMoneyCelebrationTotal(payload) {
  if (!celebrationTotalEl) return;
  var earned = celebrationEarned(payload);
  var currency = payload.currency || "GHS";
  if (window.MoneyAnimate) {
    MoneyAnimate.setTotal(celebrationTotalEl, earned, currency);
  } else {
    celebrationTotalEl.textContent = earned + " " + currency;
  }
}

function showMoneyCelebration(payload) {
  showingMoneyCelebration = true;
  overlay.classList.add("hidden");
  overlay.classList.remove("display-mode-picker", "display-mode-question");
  questionPanel.classList.add("hidden");
  ladderPanel.classList.add("hidden");
  if (earnedPanel) earnedPanel.classList.add("hidden");
  document.body.classList.remove("display-money-active");

  celebrationEl.classList.remove("hidden");
  celebrationEl.classList.remove("display-money-celebration--visible");
  void celebrationEl.offsetWidth;
  celebrationEl.classList.add("display-money-celebration--visible");

  var earned = celebrationEarned(payload);
  var currency = payload.currency || "GHS";

  if (window.MoneyAnimate) {
    MoneyAnimate.startMoneyRain(moneyRainEl);
    MoneyAnimate.runMoneyCelebration(
      celebrationTotalEl,
      { total: earned, currency: currency },
      { animate: false }
    );
  } else {
    celebrationTotalEl.textContent = earned + " " + currency;
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

function renderQuiz(payload, options) {
  options = options || {};
  if (resultsOverlayActive) return;
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

  if (
    payload.round === 5 &&
    payload.type === "money" &&
    payload.gameOver
  ) {
    if (showingMoneyCelebration) {
      updateMoneyCelebrationTotal(payload);
      return;
    }
    clearChosenTimer();
    lastCategoryId = null;
    hideQuizPanels();
    showMoneyCelebration(payload);
    return;
  }

  if (showingMoneyCelebration) {
    hideMoneyCelebration();
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
socket.on("teamScores", renderLiveScores);
socket.on("ring", function (ring) {
  flashSlot(ring.order);
});

fetch("/api/team-scores")
  .then(function (res) {
    return res.json();
  })
  .then(renderLiveScores)
  .catch(function () {});

socket.on("quiz:display", function (payload) {
  lastQuizPayload = payload;
  renderQuiz(payload, { live: quizDisplayLive });
  quizDisplayLive = true;
});

socket.on("quiz:round5CorrectReveal", function (data) {
  if (!data || data.correctIndex == null) return;
  flashCorrectAnswer(data.correctIndex);
});

socket.on("quiz:moneyRoundEnd", function (data) {
  if (!data) return;
  if (!celebrationTotalEl) return;
  if (window.MoneyAnimate) {
    MoneyAnimate.setTotal(celebrationTotalEl, data.total, data.currency);
    MoneyAnimate.runMoneyCelebration(
      celebrationTotalEl,
      { total: data.total, currency: data.currency },
      { animate: false }
    );
  } else {
    celebrationTotalEl.textContent = data.total + " " + data.currency;
  }
});

socket.on("quiz:moneyGain", function (data) {
  if (!earnedEl || !data) return;
  if (window.MoneyAnimate) {
    MoneyAnimate.runMoneyGain(earnedEl, data);
  }
  if (data.step && ladderEl) {
    var stepEl = ladderEl.querySelector(
      '.money-ladder-row[data-step="' + data.step + '"]'
    );
    if (stepEl) {
      stepEl.classList.remove("money-ladder-row--pop");
      void stepEl.offsetWidth;
      stepEl.classList.add("money-ladder-row--pop");
    }
  }
});

function formatDisplayTimer(ms, status) {
  if (status === "expired") return "Time up";
  if (status === "idle" && ms <= 0) return "00";
  var seconds = Math.max(0, Math.ceil(ms / 1000));
  return String(seconds);
}

function clearDisplayTimerTimers() {
  if (displayTimerFadeTimer) clearTimeout(displayTimerFadeTimer);
  if (displayTimerExpireTimer) clearTimeout(displayTimerExpireTimer);
  displayTimerFadeTimer = null;
  displayTimerExpireTimer = null;
}

function hideDisplayTimer() {
  if (!displayTimerEl) return;
  displayTimerEl.classList.remove("display-timer-visible", "display-timer-fade-out");
  displayTimerEl.classList.add("hidden");
  displayTimerEl.setAttribute("aria-hidden", "true");
}

function showDisplayTimer() {
  if (!displayTimerEl) return;
  displayTimerEl.classList.remove("hidden", "display-timer-fade-out");
  displayTimerEl.classList.add("display-timer-visible");
  displayTimerEl.setAttribute("aria-hidden", "false");
}

function fadeOutDisplayTimer() {
  if (!displayTimerEl) return;
  displayTimerEl.classList.add("display-timer-fade-out");
  displayTimerFadeTimer = setTimeout(hideDisplayTimer, 700);
}

function renderDisplayTimer(state) {
  if (!displayTimerEl || !displayTimerValueEl || !state) return;
  if (resultsOverlayActive) {
    hideDisplayTimer();
    return;
  }

  displayTimerValueEl.textContent = formatDisplayTimer(
    state.remainingMs,
    state.status
  );
  document.body.classList.toggle("display-timer-expired", state.status === "expired");

  if (state.status === "running") {
    clearDisplayTimerTimers();
    showDisplayTimer();
    return;
  }

  if (state.status === "expired") {
    if (displayTimerEl.classList.contains("hidden")) {
      showDisplayTimer();
    }
    if (
      !displayTimerExpireTimer &&
      !displayTimerEl.classList.contains("display-timer-fade-out")
    ) {
      displayTimerExpireTimer = setTimeout(fadeOutDisplayTimer, displayTimerBuzzMs);
    }
    return;
  }

  clearDisplayTimerTimers();
  hideDisplayTimer();
}

hideDisplayTimer();
socket.on("timerState", renderDisplayTimer);
