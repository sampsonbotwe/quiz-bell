const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "content");
const ROUND_IDS = [1, 2, 3, 4, 5];
const SET_IDS = ["A", "B", "C"];
const PARTS = ["main", "sub1", "sub2"];

function loadRounds() {
  var rounds = {};
  for (var i = 0; i < ROUND_IDS.length; i++) {
    var id = ROUND_IDS[i];
    var filePath = path.join(CONTENT_DIR, "round" + id + ".json");
    rounds[id] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return rounds;
}

const ROUNDS = loadRounds();

const QUIZ_STATE_FILE = path.join(__dirname, ".quiz-state.json");
const PERSISTED_QUIZ_FIELDS = [
  "round",
  "set",
  "categoryId",
  "blockIndex",
  "part",
  "questionIndex",
  "riddleIndex",
  "cluesRevealed",
  "earnedAmount",
  "round5Complete",
  "round5LastResult",
  "round5LifelineUsed",
  "round5HiddenOptions",
  "visible",
  "answeredBlocks",
];

function createQuizState() {
  return {
    round: 1,
    set: null,
    categoryId: null,
    blockIndex: 0,
    part: "main",
    questionIndex: 0,
    riddleIndex: 0,
    cluesRevealed: 0,
    earnedAmount: 0,
    round5Complete: false,
    round5LastResult: null,
    round5LifelineUsed: false,
    round5HiddenOptions: [],
    visible: true,
    answeredBlocks: {},
  };
}

function loadPersistedQuizState() {
  try {
    if (!fs.existsSync(QUIZ_STATE_FILE)) return null;
    var raw = JSON.parse(fs.readFileSync(QUIZ_STATE_FILE, "utf8"));
    var state = createQuizState();
    for (var i = 0; i < PERSISTED_QUIZ_FIELDS.length; i++) {
      var key = PERSISTED_QUIZ_FIELDS[i];
      if (raw[key] !== undefined) state[key] = raw[key];
    }
    return state;
  } catch (err) {
    console.warn("Could not load quiz state:", err.message);
    return null;
  }
}

function saveQuizState(state) {
  try {
    var payload = {};
    for (var i = 0; i < PERSISTED_QUIZ_FIELDS.length; i++) {
      var key = PERSISTED_QUIZ_FIELDS[i];
      payload[key] = state[key];
    }
    fs.writeFileSync(QUIZ_STATE_FILE, JSON.stringify(payload, null, 2));
  } catch (err) {
    console.warn("Could not save quiz state:", err.message);
  }
}

function getRound1Categories(state) {
  var round = ROUNDS[1];
  var setData = round.sets[state.set];
  return setData ? setData.categories : [];
}

function getRound2Categories() {
  return ROUNDS[2].categories;
}

function getRound3Categories() {
  return ROUNDS[3].categories || [];
}

function isCategoryRound(round) {
  return round === 1 || round === 2 || round === 3;
}

function getCategoriesForRound(state) {
  if (state.round === 1) return getRound1Categories(state);
  if (state.round === 2) return getRound2Categories();
  if (state.round === 3) return getRound3Categories();
  return [];
}

function getCategoryById(state) {
  if (!isCategoryRound(state.round) || !state.categoryId) return null;
  var categories = getCategoriesForRound(state);
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].id === state.categoryId) return categories[i];
  }
  return null;
}

function findCategoryById(state, categoryId) {
  var categories = getCategoriesForRound(state);
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].id === categoryId) return categories[i];
  }
  return null;
}

function getCategoryTrackingKey(state, categoryId) {
  if (state.round === 1 && state.set) {
    return "1:" + state.set + ":" + categoryId;
  }
  if (state.round === 2) {
    return "2:" + categoryId;
  }
  if (state.round === 3) {
    return "3:" + categoryId;
  }
  return null;
}

function getAnsweredBlockIndices(state, categoryId) {
  if (!state.answeredBlocks) return [];
  var key = getCategoryTrackingKey(state, categoryId);
  if (!key || !state.answeredBlocks[key]) return [];
  return state.answeredBlocks[key].slice();
}

function isBlockAnswered(state, categoryId, blockIndex) {
  return getAnsweredBlockIndices(state, categoryId).indexOf(blockIndex) >= 0;
}

function isCategoryExhausted(state, categoryId) {
  var category = findCategoryById(state, categoryId);
  if (!category || !category.blocks || !category.blocks.length) return true;
  return getAnsweredBlockIndices(state, categoryId).length >= category.blocks.length;
}

function getNextUnansweredBlockIndex(state, categoryId) {
  var category = findCategoryById(state, categoryId);
  if (!category || !category.blocks || !category.blocks.length) return -1;
  var answered = getAnsweredBlockIndices(state, categoryId);
  for (var i = 0; i < category.blocks.length; i++) {
    if (answered.indexOf(i) < 0) return i;
  }
  return -1;
}

function hasPrevUnansweredBlock(state, categoryId, blockIndex) {
  for (var i = blockIndex - 1; i >= 0; i--) {
    if (!isBlockAnswered(state, categoryId, i)) return true;
  }
  return false;
}

function hasNextUnansweredBlock(state, categoryId, blockIndex) {
  var category = findCategoryById(state, categoryId);
  if (!category || !category.blocks) return false;
  for (var j = blockIndex + 1; j < category.blocks.length; j++) {
    if (!isBlockAnswered(state, categoryId, j)) return true;
  }
  return false;
}

function getAvailableCategories(state) {
  var categories = getCategoriesForRound(state);
  var available = [];
  for (var i = 0; i < categories.length; i++) {
    if (!isCategoryExhausted(state, categories[i].id)) {
      available.push({ id: categories[i].id, name: categories[i].name });
    }
  }
  return available;
}

function clearAnsweredBlocksForRound(state, round) {
  if (!state.answeredBlocks) return;
  var prefix = round + ":";
  Object.keys(state.answeredBlocks).forEach(function (key) {
    if (key.indexOf(prefix) === 0) delete state.answeredBlocks[key];
  });
}

function getCurrentBlock(state) {
  var category = getCategoryById(state);
  if (!category || !category.blocks || !category.blocks.length) return null;
  var blockIndex = Math.max(
    0,
    Math.min(state.blockIndex, category.blocks.length - 1)
  );
  return category.blocks[blockIndex];
}

function getBlockPartContent(block, part) {
  if (!block) return null;
  if (part === "main") {
    return {
      label: "Main question",
      question: block.main,
      answer: block.answers.main,
    };
  }
  if (part === "sub1" && block.subs && block.subs.length > 0) {
    return {
      label: "Sub 1",
      question: block.subs[0],
      answer: block.answers.subs[0],
    };
  }
  if (part === "sub2" && block.subs && block.subs.length > 1) {
    return {
      label: "Sub 2",
      question: block.subs[1],
      answer: block.answers.subs[1],
    };
  }
  return null;
}

function getRound5QuestionList() {
  return ROUNDS[5].question;
}

function getRound4Riddles() {
  return ROUNDS[4].riddles;
}

function getRound5Ladder() {
  return ROUNDS[5].ladder;
}

function formatCurrency(amount, currency) {
  var value = Number(amount) || 0;
  if (currency === "GHS") {
    return "GHS " + value.toFixed(2);
  }
  return value + " " + (currency || "");
}

function resolveCurrentItem(state) {
  if (isCategoryRound(state.round)) {
    if (!state.categoryId) return null;
    var category = getCategoryById(state);
    if (!category || !category.blocks.length) return null;

    var blockIndex = Math.max(
      0,
      Math.min(state.blockIndex, category.blocks.length - 1)
    );
    state.blockIndex = blockIndex;
    var block = category.blocks[blockIndex];
    var content = getBlockPartContent(block, state.part);
    if (!content) {
      state.part = "main";
      content = getBlockPartContent(block, "main");
    }
    if (!content) return null;

    var subCount = block.subs ? block.subs.length : 0;
    var answeredCount = getAnsweredBlockIndices(state, state.categoryId).length;
    return {
      type: "block",
      round: state.round,
      categoryName: category.name,
      label: content.label,
      question: content.question,
      answer: content.answer,
      part: state.part,
      mainIndex: blockIndex,
      mainTotal: category.blocks.length,
      subCount: subCount,
      index: blockIndex,
      total: category.blocks.length,
      hasPrevUnanswered: hasPrevUnansweredBlock(
        state,
        state.categoryId,
        blockIndex
      ),
      hasNextUnanswered: hasNextUnansweredBlock(
        state,
        state.categoryId,
        blockIndex
      ),
      blocksRemaining: category.blocks.length - answeredCount,
      answeredBlockIndices: getAnsweredBlockIndices(state, state.categoryId),
      isAnswered: isBlockAnswered(state, state.categoryId, blockIndex),
    };
  }

  if (state.round === 4) {
    var riddles = getRound4Riddles();
    if (!riddles.length) return null;
    var rIdx = Math.max(0, Math.min(state.riddleIndex, riddles.length - 1));
    var riddle = riddles[rIdx];
    var clues = riddle.clues;
    return {
      type: "riddle",
      round: 4,
      label: "Riddle " + (rIdx + 1),
      answer: riddle.answer,
      clues: clues,
      allClues: riddle.clues,
      cluesTotal: riddle.clues.length,
      index: rIdx,
      total: riddles.length,
    };
  }

  if (state.round === 5) {
    if (state.round5Complete) {
      return {
        type: "money",
        round: 5,
        label: "Money Round",
        gameOver: true,
        earnedAmount: state.earnedAmount,
        index: state.questionIndex,
        total: getRound5QuestionList().length,
      };
    }
    var moneyQs = getRound5QuestionList();
    if (!moneyQs.length) return null;
    var mIdx = Math.max(0, Math.min(state.questionIndex, moneyQs.length - 1));
    var mq = moneyQs[mIdx];
    return {
      type: "money",
      round: 5,
      label: "Money Round — " + formatCurrency(mq.amount, ROUNDS[5].currency),
      question: mq.question,
      options: mq.options,
      correctIndex: mq.correctIndex,
      correctAnswer: mq.correctAnswer,
      amount: mq.amount,
      step: mq.step,
      earnedAmount: state.earnedAmount,
      index: mIdx,
      total: moneyQs.length,
      gameOver: false,
    };
  }

  return null;
}

function publicDisplayPayload(state) {
  if (!state.visible) {
    return { visible: false };
  }

  if (state.round === 1 && !state.set) {
    return { visible: false };
  }

  if (state.round === 1 || state.round === 2 || state.round === 3) {
    if (!state.categoryId) {
      return {
        visible: true,
        type: "category-picker",
        round: state.round,
        roundTitle: ROUNDS[state.round].title,
        setLabel:
          state.round === 1 ? ROUNDS[1].sets[state.set].label : null,
        categories: getAvailableCategories(state),
      };
    }
  }

  if (state.round === 4) {
    return { visible: false };
  }

  var item = resolveCurrentItem(state);
  if (!item) {
    return { visible: false };
  }

  var payload = {
    visible: true,
    round: state.round,
    roundTitle: ROUNDS[state.round].title,
    type: item.type,
    label: item.label,
    index: item.index,
    total: item.total,
  };

  if (item.type === "block") {
    payload.question = item.question;
    payload.categoryId = state.categoryId;
    payload.categoryName = item.categoryName;
    payload.part = item.part;
    var blockCategories = getCategoriesForRound(state);
    for (var c = 0; c < blockCategories.length; c++) {
      if (blockCategories[c].id === state.categoryId) {
        payload.categoryColorIndex = c % 4;
        break;
      }
    }
  }

  if (item.type === "rapid") {
    payload.question = item.question;
    payload.setLabel = item.setLabel;
  }

  if (item.type === "riddle") {
    payload.clues = item.clues;
    payload.clueCount = item.clues.length;
    payload.cluesTotal = item.cluesTotal;
  }

  if (item.type === "money" && !item.gameOver) {
    payload.question = item.question;
    payload.amount = item.amount;
    payload.step = item.step;
    payload.earnedAmount = item.earnedAmount;
    payload.ladder = getRound5Ladder();
    payload.currency = ROUNDS[5].currency;
    payload.totalPool = ROUNDS[5].totalPool || 1000;
    payload.displayShowsOptions = ROUNDS[5].displayShowsOptions !== false;
    payload.lifelineUsed = state.round5LifelineUsed;
    payload.lifelineAvailable = !state.round5LifelineUsed;
    if (payload.displayShowsOptions) {
      payload.options = item.options;
      payload.hiddenOptions = state.round5HiddenOptions || [];
    }
  }

  if (item.type === "money" && item.gameOver) {
    payload.gameOver = true;
    payload.earnedAmount = state.earnedAmount;
    payload.round5LastResult = state.round5LastResult;
    payload.ladder = getRound5Ladder();
    payload.currency = ROUNDS[5].currency;
    payload.totalPool = ROUNDS[5].totalPool || 1000;
  }

  return payload;
}

function publicHostPayload(state) {
  var item = resolveCurrentItem(state);
  var roundMeta = ROUNDS[state.round];

  var payload = {
    round: state.round,
    roundTitle: roundMeta.title,
    visible: state.visible,
    item: item,
  };

  if (state.round === 1) {
    payload.set = state.set;
    payload.setLabel = state.set ? roundMeta.sets[state.set].label : null;
    payload.sets = Object.keys(roundMeta.sets).map(function (setId) {
      return { id: setId, label: roundMeta.sets[setId].label };
    });
    payload.categories = state.set ? getAvailableCategories(state) : [];
    payload.categoryId = state.categoryId;
  }

  if (state.round === 2 || state.round === 3) {
    payload.categories = getAvailableCategories(state);
    payload.categoryId = state.categoryId;
  }

  if (state.round === 3) {
    payload.timeLimitSeconds = roundMeta.timeLimitSeconds;
  }

  if (state.round === 4) {
    payload.riddleIndex = state.riddleIndex;
  }

  if (state.round === 5) {
    payload.earnedAmount = state.earnedAmount;
    payload.round5Complete = state.round5Complete;
    payload.round5LastResult = state.round5LastResult;
    payload.round5LifelineUsed = state.round5LifelineUsed;
    payload.round5HiddenOptions = state.round5HiddenOptions || [];
    payload.ladder = getRound5Ladder();
    payload.currency = roundMeta.currency;
    payload.questionIndex = state.questionIndex;
  }

  payload.atRoundEnd = isAtRoundEnd(state);

  return payload;
}

function resetRoundFields(state, round) {
  state.round = round;
  state.categoryId = null;
  state.blockIndex = 0;
  state.part = "main";
  state.questionIndex = 0;
  state.riddleIndex = 0;
  state.cluesRevealed = 0;
  state.earnedAmount = 0;
  state.round5Complete = false;
  state.round5LastResult = null;
  state.round5LifelineUsed = false;
  state.round5HiddenOptions = [];
  state.visible = round !== 5;
  if (isCategoryRound(round)) {
    clearAnsweredBlocksForRound(state, round);
  }
  if (round === 1) state.set = null;
}

function selectCategory(state, categoryId) {
  if (!isCategoryRound(state.round)) return false;
  if (isCategoryExhausted(state, categoryId)) return false;
  if (
    state.round === 3 &&
    getAnsweredBlockIndices(state, categoryId).length > 0
  ) {
    return false;
  }
  var nextIndex = getNextUnansweredBlockIndex(state, categoryId);
  if (nextIndex < 0) return false;
  state.categoryId = categoryId;
  state.blockIndex = nextIndex;
  state.part = "main";
  state.visible = true;
  return true;
}

function markBlockAnswered(state) {
  if (!isCategoryRound(state.round)) return false;
  if (!state.categoryId) return false;
  if (isBlockAnswered(state, state.categoryId, state.blockIndex)) return false;
  var key = getCategoryTrackingKey(state, state.categoryId);
  if (!key) return false;
  if (!state.answeredBlocks) state.answeredBlocks = {};
  if (!state.answeredBlocks[key]) state.answeredBlocks[key] = [];
  var blockIndex = state.blockIndex;
  var categoryId = state.categoryId;
  if (state.answeredBlocks[key].indexOf(blockIndex) < 0) {
    state.answeredBlocks[key].push(blockIndex);
    state.answeredBlocks[key].sort(function (a, b) {
      return a - b;
    });
  }

  if (state.round === 3) {
    var nextIndex = getNextUnansweredBlockIndex(state, categoryId);
    if (nextIndex >= 0) {
      state.blockIndex = nextIndex;
      state.part = "main";
      return true;
    }
  }

  state.categoryId = null;
  state.blockIndex = 0;
  state.part = "main";
  return true;
}

function navigatePrev(state) {
  if (isCategoryRound(state.round)) {
    if (!state.categoryId) return;
    var category = getCategoryById(state);
    if (!category || !category.blocks.length) return;
    state.blockIndex = Math.max(0, state.blockIndex - 1);
    state.part = "main";
    return;
  }
  if (state.round === 4) {
    if (state.riddleIndex > 0) {
      state.riddleIndex -= 1;
      state.cluesRevealed = 0;
    }
    return;
  }
}

function navigateNext(state) {
  if (isCategoryRound(state.round)) {
    if (!state.categoryId) return;
    var category = getCategoryById(state);
    if (!category || !category.blocks.length) return;
    state.blockIndex = Math.min(
      category.blocks.length - 1,
      state.blockIndex + 1
    );
    state.part = "main";
    return;
  }
  if (state.round === 4) {
    var riddles = getRound4Riddles();
    if (state.riddleIndex < riddles.length - 1) {
      state.riddleIndex += 1;
      state.cluesRevealed = 0;
    }
    return;
  }
}

function selectBlockPart(state, part) {
  if (!isCategoryRound(state.round)) return;
  if (!state.categoryId) return;
  if (PARTS.indexOf(part) < 0) return;
  var block = getCurrentBlock(state);
  if (!block) return;
  if (part === "main") {
    state.part = "main";
    return;
  }
  if (part === "sub1" && block.subs && block.subs.length > 0) {
    state.part = "sub1";
    return;
  }
  if (part === "sub2" && block.subs && block.subs.length > 1) {
    state.part = "sub2";
  }
}

function nextSet(state) {
  if (state.round !== 1) return;
  var setIndex = SET_IDS.indexOf(state.set);
  if (setIndex < 0 || setIndex >= SET_IDS.length - 1) return;
  state.set = SET_IDS[setIndex + 1];
  state.categoryId = null;
  state.blockIndex = 0;
  state.part = "main";
}

function markRound5Answer(state, correct) {
  if (state.round !== 5 || state.round5Complete) return;

  var questionList = getRound5QuestionList();
  var current = questionList[state.questionIndex];
  if (!current) return;

  state.round5LastResult = correct ? "correct" : "wrong";

  if (correct) {
    state.earnedAmount += current.amount;
    state.round5HiddenOptions = [];
    if (state.questionIndex >= questionList.length - 1) {
      state.round5Complete = true;
    } else {
      state.questionIndex += 1;
    }
    return;
  }

  state.round5Complete = true;
}

function applyRound5Lifeline(state) {
  if (state.round !== 5 || state.round5Complete || state.round5LifelineUsed) {
    return false;
  }

  var questionList = getRound5QuestionList();
  var current = questionList[state.questionIndex];
  if (!current || !current.options || current.options.length < 4) return false;

  var correctIndex = current.correctIndex;
  var wrongIndices = [];
  for (var i = 0; i < current.options.length; i++) {
    if (i !== correctIndex) wrongIndices.push(i);
  }

  for (var j = wrongIndices.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var temp = wrongIndices[j];
    wrongIndices[j] = wrongIndices[k];
    wrongIndices[k] = temp;
  }

  state.round5HiddenOptions = wrongIndices.slice(0, 2);
  state.round5LifelineUsed = true;
  return true;
}

function hasActiveQuestion(state) {
  if (state.round === 5) return true;
  return resolveCurrentItem(state) !== null;
}

function isAtRoundEnd(state) {
  if (state.round < 1 || state.round > 4) return false;
  var item = resolveCurrentItem(state);
  if (!item || !item.total) return false;
  if (item.type === "block") {
    return item.mainIndex >= item.mainTotal - 1;
  }
  return item.index >= item.total - 1;
}

function getRoundSummaries() {
  return ROUND_IDS.map(function (id) {
    return { id: id, title: ROUNDS[id].title };
  });
}

module.exports = {
  ROUNDS: ROUNDS,
  SET_IDS: SET_IDS,
  createQuizState: createQuizState,
  loadPersistedQuizState: loadPersistedQuizState,
  saveQuizState: saveQuizState,
  publicDisplayPayload: publicDisplayPayload,
  publicHostPayload: publicHostPayload,
  resetRoundFields: resetRoundFields,
  selectCategory: selectCategory,
  navigatePrev: navigatePrev,
  navigateNext: navigateNext,
  selectBlockPart: selectBlockPart,
  nextSet: nextSet,
  markRound5Answer: markRound5Answer,
  applyRound5Lifeline: applyRound5Lifeline,
  markBlockAnswered: markBlockAnswered,
  getRoundSummaries: getRoundSummaries,
  hasActiveQuestion: hasActiveQuestion,
  isAtRoundEnd: isAtRoundEnd,
};
