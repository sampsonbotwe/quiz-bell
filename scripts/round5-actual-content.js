const fs = require("fs");
const path = require("path");

const ladder = [
  { step: 1, amount: 10 },
  { step: 2, amount: 15 },
  { step: 3, amount: 25 },
  { step: 4, amount: 35 },
  { step: 5, amount: 40 },
  { step: 6, amount: 50 },
  { step: 7, amount: 60 },
  { step: 8, amount: 65 },
  { step: 9, amount: 75 },
  { step: 10, amount: 85 },
  { step: 11, amount: 90 },
  { step: 12, amount: 100 },
  { step: 13, amount: 110 },
  { step: 14, amount: 115 },
  { step: 15, amount: 125 },
];

function q(id, question, options, correctIndex, correctAnswer) {
  return {
    id,
    step: id,
    amount: ladder[id - 1].amount,
    question,
    options,
    correctIndex,
    correctAnswer,
  };
}

const round5 = {
  round: 5,
  title: "Round 5 — Who Wants to Be a Champion?",
  winnerOnly: true,
  currency: "GHS",
  totalPool: 1000,
  displayShowsOptions: true,
  ladder,
  question: [
    q(
      1,
      "What do Christians call the day Jesus rose from the dead?",
      ["Good Friday", "Palm Sunday", "Easter", "Pentecost"],
      2,
      "Easter"
    ),
    q(
      2,
      "Which of these is one of the Ten Commandments?",
      ["Thou shalt not steal", "Thou shalt not sleep late", "Thou shalt not travel", "Thou shalt not sing"],
      0,
      "Thou shalt not steal"
    ),
    q(
      3,
      "What is the last book of the Bible?",
      ["Jude", "Revelation", "Acts", "Hebrews"],
      1,
      "Revelation"
    ),
    q(
      4,
      "What is the prayer Jesus taught His disciples commonly called?",
      ["The Beatitudes", "The Lord's Prayer", "The Great Commission", "The Sermon on the Mount"],
      1,
      "The Lord's Prayer"
    ),
    q(
      5,
      "Which Christian holiday celebrates the birth of Jesus?",
      ["Easter", "Christmas", "Thanksgiving", "Advent"],
      1,
      "Christmas"
    ),
    q(
      6,
      "Which short Old Testament book tells the story of a Moabite woman's loyalty to her mother-in-law?",
      ["Esther", "Ruth", "Judges", "Joshua"],
      1,
      "Ruth"
    ),
    q(
      7,
      "What event does the Christian festival of Pentecost celebrate?",
      ["The resurrection of Jesus", "The coming of the Holy Spirit", "The birth of Jesus", "The Last Supper"],
      1,
      "The coming of the Holy Spirit"
    ),
    q(
      8,
      "Which reformer is credited with sparking the Protestant Reformation by nailing 95 Theses to a church door?",
      ["John Calvin", "Martin Luther", "John Wesley", "Huldrych Zwingli"],
      1,
      "Martin Luther"
    ),
    q(
      9,
      "What is the name of the Christian creed that begins, \"I believe in God, the Father Almighty\"?",
      ["Nicene Creed", "Apostles' Creed", "Athanasian Creed", "Westminster Confession"],
      1,
      "Apostles' Creed"
    ),
    q(
      10,
      "In which ancient language was the New Testament originally written?",
      ["Latin", "Hebrew", "Greek", "Aramaic"],
      2,
      "Greek"
    ),
    q(
      11,
      "Which African country is home to one of the oldest Christian traditions in the world, the Ethiopian Orthodox Church?",
      ["Kenya", "Ethiopia", "Nigeria", "Ghana"],
      1,
      "Ethiopia"
    ),
    q(
      12,
      "How many years did Jacob work for Laban in total to marry both Leah and Rachel?",
      ["7", "10", "14", "20"],
      2,
      "14"
    ),
    q(
      13,
      "What was the name of Joseph's Egyptian wife, given to him by Pharaoh?",
      ["Asenath", "Zipporah", "Rahab", "Tamar"],
      0,
      "Asenath"
    ),
    q(
      14,
      "Who is the General Overseer of Calvary Charismatic Church Global?",
      ["Pastor Sammy Aduamah", "Lady Getrude Aduamah", "Pastor Joshua Obeng", "Pastor Ransford Obeng"],
      3,
      "Pastor Ransford Obeng"
    ),
    q(
      15,
      "What year was CCC established?",
      ["1990", "1945", "1985", "1920"],
      2,
      "1985"
    ),
  ],
};

const outPath = path.join(__dirname, "..", "content", "round5.json");
fs.writeFileSync(outPath, JSON.stringify(round5, null, 2) + "\n");
console.log("Wrote", outPath, "—", round5.question.length, "questions");
