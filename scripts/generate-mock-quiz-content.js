const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "content");

function block(main, sub1, sub2, ansMain, ansSub1, ansSub2) {
  return {
    main,
    subs: [sub1, sub2],
    answers: { main: ansMain, subs: [ansSub1, ansSub2] },
  };
}

function solo(main, ans) {
  return {
    main,
    subs: [],
    answers: { main: ans, subs: [] },
  };
}

const round1 = {
  round: 1,
  title: "Round 1",
  sets: {
    A: {
      label: "Set A",
      categories: [
        {
          id: "animal-kingdom",
          name: "Animal Kingdom",
          blocks: [
            block(
              "What animal spoke to Balaam on the road to Moab?",
              "What creature did God send to destroy the vines of Judah in Joel's prophecy?",
              "What animal did Saul go looking for when Samuel secretly anointed David?",
              "Donkey",
              "Locusts",
              "Donkeys"
            ),
            block(
              "What bird did Elijah say would feed him by the Brook Cherith?",
              "What animal carried Jesus into Jerusalem on Palm Sunday?",
              "What did Samson use to kill a thousand Philistines?",
              "Ravens",
              "Donkey",
              "The jawbone of a donkey"
            ),
            block(
              "What great fish swallowed Jonah?",
              "What animals did God use to deliver food to Elijah in the wilderness?",
              "What animal's jawbone did Samson use as a weapon?",
              "A great fish",
              "Ravens",
              "Donkey's jawbone"
            ),
          ],
        },
        {
          id: "lets-talk-food",
          name: "Let's Talk Food",
          blocks: [
            block(
              "What did Jesus use to feed five thousand men besides fish?",
              "What food did the Israelites crave in the wilderness instead of manna?",
              "What fruit did Eve eat from the forbidden tree?",
              "Five loaves of bread",
              "Meat / quail",
              "Forbidden fruit"
            ),
            block(
              "What did Esau sell his birthright for?",
              "What did Jesus turn water into at the wedding in Cana?",
              "What food sustained Elijah for forty days on Horeb?",
              "Red stew / lentil stew",
              "Wine",
              "A cake baked on hot stones"
            ),
            block(
              "What did Daniel and his friends refuse to eat in Babylon?",
              "What did Jesus eat with His disciples after His resurrection?",
              "What did God rain from heaven for Israel each morning?",
              "The king's food and wine",
              "Fish",
              "Manna"
            ),
          ],
        },
        {
          id: "whats-your-dream-team",
          name: "What's Your Dream Team",
          blocks: [
            block(
              "In Pharaoh's dream, what lean animals ate the fat ones?",
              "In Nebuchadnezzar's dream, what metal was the statue's head?",
              "In Jacob's dream, what connected heaven and earth?",
              "Cows",
              "Gold",
              "A ladder"
            ),
            block(
              "What did Joseph's sheaf of grain do in his dream?",
              "In Daniel's vision, what animal had four wings and a human heart?",
              "What appeared to Solomon in a dream at Gibeon?",
              "Bowed down to his sheaf",
              "A leopard",
              "God offering him anything he asked"
            ),
            block(
              "What did the sun, moon, and eleven stars bow to in Joseph's dream?",
              "In Peter's vision, what came down from heaven in a sheet?",
              "What did Pilate's wife dream about Jesus?",
              "Joseph",
              "Unclean animals",
              "Suffering because of Him"
            ),
          ],
        },
        {
          id: "numbers-dont-lie",
          name: "Numbers Don't Lie",
          blocks: [
            block(
              "How many days and nights did it rain during the flood?",
              "How many plagues did God send on Egypt?",
              "How many sons did Jacob have?",
              "40",
              "10",
              "12"
            ),
            block(
              "How many stones did David pick up to fight Goliath?",
              "How many disciples did Jesus choose?",
              "How many days was Lazarus dead before Jesus raised him?",
              "Five",
              "12",
              "Four"
            ),
            block(
              "How many years did the Israelites wander in the wilderness?",
              "How many books are in the New Testament?",
              "How many people were saved on Noah's ark besides Noah?",
              "40",
              "27",
              "Seven (Noah, wife, three sons, three daughters-in-law)"
            ),
          ],
        },
      ],
    },
    B: {
      label: "Set B",
      categories: [
        {
          id: "holy-places",
          name: "Holy Places",
          blocks: [
            block(
              "On what mountain did Moses receive the Ten Commandments?",
              "Where was Jesus crucified?",
              "Where did Jacob wrestle with God and receive the name Israel?",
              "Mount Sinai",
              "Golgotha / Calvary",
              "Peniel"
            ),
            block(
              "In what city was Jesus born?",
              "Where did Elijah challenge the prophets of Baal?",
              "Where did Solomon build the Temple?",
              "Bethlehem",
              "Mount Carmel",
              "Jerusalem"
            ),
            block(
              "Where was Paul when he wrote many of his letters while under house arrest?",
              "Where did Jesus walk on water?",
              "Where did Moses see the burning bush?",
              "Rome",
              "Sea of Galilee",
              "Mount Horeb"
            ),
          ],
        },
        {
          id: "famous-faces",
          name: "Famous Faces",
          blocks: [
            block(
              "Who was the first man God created?",
              "Who was the mother of Jesus?",
              "Who betrayed Jesus for thirty pieces of silver?",
              "Adam",
              "Mary",
              "Judas Iscariot"
            ),
            block(
              "Who was swallowed by a great fish?",
              "Who killed Goliath?",
              "Who denied Jesus three times?",
              "Jonah",
              "David",
              "Peter"
            ),
            block(
              "Who was thrown into a lions' den?",
              "Who led Israel out of Egypt?",
              "Who was the first king of Israel?",
              "Daniel",
              "Moses",
              "Saul"
            ),
          ],
        },
        {
          id: "acts-of-faith",
          name: "Acts of Faith",
          blocks: [
            block(
              "Who was willing to sacrifice Isaac on Mount Moriah?",
              "Who refused to bow to Haman and was nearly killed for it?",
              "Who walked on water toward Jesus?",
              "Abraham",
              "Mordecai",
              "Peter"
            ),
            block(
              "Who was lowered through a roof to meet Jesus?",
              "Who touched Jesus' garment and was healed of bleeding?",
              "Who climbed a sycamore tree to see Jesus?",
              "The paralyzed man (via friends)",
              "The woman with the issue of blood",
              "Zacchaeus"
            ),
            block(
              "Who offered his only son as a burnt offering at God's command?",
              "Who prayed and fire fell from heaven on Mount Carmel?",
              "Who said, 'Though He slay me, yet will I trust Him'?",
              "Abraham",
              "Elijah",
              "Job"
            ),
          ],
        },
        {
          id: "two-by-two",
          name: "Two By Two",
          blocks: [
            block(
              "Name the two sons of Adam and Eve mentioned first in Genesis.",
              "Name the two cities destroyed with fire and brimstone.",
              "Name the two tablets Moses brought down from Sinai.",
              "Cain and Abel",
              "Sodom and Gomorrah",
              "The Ten Commandments (on two stone tablets)"
            ),
            block(
              "Name the two animals Noah sent out from the ark as messengers.",
              "Name the two disciples on the road to Emmaus.",
              "Name the two brothers Jesus called 'Sons of Thunder.'",
              "Raven and dove",
              "Cleopas and another disciple",
              "James and John"
            ),
            block(
              "Name the two spies Joshua sent into Jericho.",
              "Name the two Old Testament figures taken up to heaven without dying.",
              "Name the two sons of Zebedee.",
              "Two spies (hidden by Rahab)",
              "Enoch and Elijah",
              "James and John"
            ),
          ],
        },
      ],
    },
    C: {
      label: "Set C",
      categories: [
        {
          id: "royal-affairs",
          name: "Royal Affairs",
          blocks: [
            block(
              "Who was the queen who saved the Jews from Haman's plot?",
              "Who was the king who saw a hand writing on the wall?",
              "Who was the queen who visited Solomon to test his wisdom?",
              "Esther",
              "Belshazzar",
              "The Queen of Sheba"
            ),
            block(
              "Who was the king who built the first Temple in Jerusalem?",
              "Who was the king when Daniel was thrown into the lions' den?",
              "Who was the king who saw a hand writing on the wall?",
              "Solomon",
              "Darius",
              "Belshazzar"
            ),
            block(
              "Who was the first king anointed by Samuel?",
              "Who was the king famous for his wisdom and wrote Proverbs?",
              "Who was the Roman king when Jesus was born?",
              "Saul",
              "Solomon",
              "Caesar Augustus"
            ),
          ],
        },
        {
          id: "storm-and-fire",
          name: "Storm & Fire",
          blocks: [
            block(
              "What did God send to destroy Sodom and Gomorrah?",
              "What did Elijah call down from heaven on Mount Carmel?",
              "What struck the ground when God answered Job from the whirlwind?",
              "Fire and brimstone",
              "Fire",
              "Lightning"
            ),
            block(
              "What calmed when Jesus said, 'Peace, be still'?",
              "What burned but was not consumed when Moses approached?",
              "What fell on the day of Pentecost?",
              "The storm / wind and waves",
              "The burning bush",
              "Tongues of fire"
            ),
            block(
              "What consumed Elijah's sacrifice on Mount Carmel?",
              "What did Shadrach, Meshach, and Abednego walk in without being burned?",
              "What did God use to lead Israel by night in the wilderness?",
              "Fire from heaven",
              "The fiery furnace",
              "A pillar of fire"
            ),
          ],
        },
        {
          id: "prophets-speak",
          name: "Prophets Speak",
          blocks: [
            block(
              "Which prophet was taken up to heaven in a whirlwind?",
              "Which prophet was swallowed by a great fish?",
              "Which prophet married Gomer as a sign to Israel?",
              "Elijah",
              "Jonah",
              "Hosea"
            ),
            block(
              "Which prophet saw a valley of dry bones?",
              "Which prophet was thrown into a cistern and left to die?",
              "Which prophet anointed David as king?",
              "Ezekiel",
              "Jeremiah",
              "Samuel"
            ),
            block(
              "Which prophet confronted King David about Bathsheba?",
              "Which prophet interpreted Nebuchadnezzar's dreams?",
              "Which prophet rode into Jerusalem on a donkey?",
              "Nathan",
              "Daniel",
              "Jesus (fulfilling prophecy)"
            ),
          ],
        },
        {
          id: "beginnings-and-endings",
          name: "Beginnings & Endings",
          blocks: [
            block(
              "What is the first book of the Bible?",
              "What is the last book of the Old Testament?",
              "What is the first book of the New Testament?",
              "Genesis",
              "Malachi",
              "Matthew"
            ),
            block(
              "What is the last book of the Bible?",
              "What was the first miracle Jesus performed?",
              "What were Jesus' last words on the cross in John?",
              "Revelation",
              "Turning water into wine",
              "It is finished"
            ),
            block(
              "Who was the first murderer in the Bible?",
              "Who was the last judge of Israel before the kings?",
              "Who wrote the final epistle before Revelation in the Bible?",
              "Cain",
              "Samuel",
              "Jude"
            ),
          ],
        },
      ],
    },
  },
};

const round2 = {
  round: 2,
  title: "Round 2 — Books of the Bible",
  categories: [
    {
      id: "the-pentateuch",
      name: "The Pentateuch",
      blocks: [
        block(
          "In which book is the creation of the world recorded?",
          "In which book does God establish the covenant with Abraham?",
          "In which book is the story of Joseph and his coat of many colors?",
          "Genesis",
          "Genesis",
          "Genesis"
        ),
        block(
          "In which book does Moses lead Israel through the Red Sea?",
          "In which book are detailed laws about leprosy and cleanliness given?",
          "In which book does God give the Ten Commandments?",
          "Exodus",
          "Leviticus",
          "Exodus"
        ),
        block(
          "In which book do the Israelites count and organize tribes for the journey?",
          "In which book does Moses repeat the law before entering Canaan?",
          "In which book is the bronze serpent lifted in the wilderness?",
          "Numbers",
          "Deuteronomy",
          "Numbers"
        ),
      ],
    },
    {
      id: "kings-and-prophets",
      name: "Kings & Prophets",
      blocks: [
        block(
          "In which book does Saul become the first king of Israel?",
          "In which book does Solomon ask God for wisdom?",
          "In which book does Elijah call fire from heaven?",
          "1 Samuel",
          "1 Kings",
          "1 Kings"
        ),
        block(
          "In which book is the fall of Jerusalem to Babylon recorded?",
          "In which book does Isaiah prophesy about a virgin bearing a son?",
          "In which book does Jonah preach to Nineveh?",
          "2 Kings",
          "Isaiah",
          "Jonah"
        ),
        block(
          "In which book does Esther become queen?",
          "In which book does Nehemiah rebuild the walls of Jerusalem?",
          "In which book does Daniel interpret the writing on the wall?",
          "Esther",
          "Nehemiah",
          "Daniel"
        ),
      ],
    },
    {
      id: "the-gospels",
      name: "The Gospels",
      blocks: [
        block(
          "In which Gospel is Jesus' genealogy traced back to Abraham?",
          "In which Gospel is Jesus called the Word who became flesh?",
          "In which Gospel are the Beatitudes recorded in the Sermon on the Mount?",
          "Matthew",
          "John",
          "Matthew"
        ),
        block(
          "In which Gospel does Jesus calm the storm on the Sea of Galilee?",
          "In which Gospel is the parable of the Good Samaritan found?",
          "In which Gospel does Jesus feed five thousand with five loaves?",
          "Mark",
          "Luke",
          "John"
        ),
        block(
          "In which Gospel is Jesus' birth announced to shepherds?",
          "In which Gospel does Thomas doubt until he sees Jesus' wounds?",
          "In which Gospel is the Great Commission given on a mountain in Galilee?",
          "Luke",
          "John",
          "Matthew"
        ),
      ],
    },
    {
      id: "letters-and-revelation",
      name: "Letters & Revelation",
      blocks: [
        block(
          "In which letter does Paul explain salvation by faith, not works of the law?",
          "In which letter is the 'love chapter' (1 Corinthians 13) found?",
          "In which letter does Paul list the fruit of the Spirit?",
          "Romans",
          "1 Corinthians",
          "Galatians"
        ),
        block(
          "In which letter is faith without works called dead?",
          "In which letter does Paul describe the armor of God?",
          "In which letter is Jesus called the high priest after the order of Melchizedek?",
          "James",
          "Ephesians",
          "Hebrews"
        ),
        block(
          "In which book are the seven churches of Asia addressed?",
          "In which book is the new heaven and new earth described?",
          "In which letter does Jude warn about false teachers?",
          "Revelation",
          "Revelation",
          "Jude"
        ),
      ],
    },
  ],
};

const round3 = {
  round: 3,
  title: "Round 3 — 60s Rapid Fire",
  timeLimitSeconds: 60,
  categories: [
    {
      id: "quick-recall",
      name: "Quick Recall",
      blocks: [
        solo("Who was the strongest man in the Bible?", "Samson"),
        solo("What is the shortest verse in the Bible?", "Jesus wept"),
        solo("How many books are in the Bible?", "66"),
        solo("Who was thrown into a lions' den?", "Daniel"),
        solo("What did Jesus feed five thousand people with?", "Five loaves and two fish"),
        solo("Who built the ark?", "Noah"),
        solo("What is the first commandment?", "You shall have no other gods before Me"),
        solo("Who was sold into slavery by his brothers?", "Joseph"),
        solo("What river was Jesus baptized in?", "Jordan"),
        solo("Who wrote most of the Psalms?", "David"),
      ],
    },
    {
      id: "people-and-places",
      name: "People & Places",
      blocks: [
        solo("Where was Jesus born?", "Bethlehem"),
        solo("Who was the Roman governor at Jesus' trial?", "Pontius Pilate"),
        solo("What city did Joshua march around seven times?", "Jericho"),
        solo("Who was the mother of John the Baptist?", "Elizabeth"),
        solo("Where did Paul have his vision of a man from Macedonia?", "Troas"),
        solo("Who was the high priest when Jesus was arrested?", "Caiaphas"),
        solo("What mountain did Moses receive the law on?", "Sinai"),
        solo("Who was the first martyr in the New Testament?", "Stephen"),
        solo("What island was Paul shipwrecked on?", "Malta"),
        solo("Who hid the spies in Jericho?", "Rahab"),
      ],
    },
    {
      id: "stories-and-miracles",
      name: "Stories & Miracles",
      blocks: [
        solo("Who walked on water?", "Peter (and Jesus)"),
        solo("What did Jesus raise Lazarus from?", "Death (after four days)"),
        solo("Who was healed of leprosy by Elisha?", "Naaman"),
        solo("What did Moses' rod turn into before Pharaoh?", "A serpent"),
        solo("Who was healed when she touched Jesus' garment?", "The woman with the issue of blood"),
        solo("What did Jesus do at the wedding in Cana?", "Turned water into wine"),
        solo("Who was healed at the Pool of Bethesda?", "A man who had been invalid 38 years"),
        solo("What happened when Paul and Silas sang in prison?", "An earthquake opened the doors"),
        solo("Who was swallowed by a great fish?", "Jonah"),
        solo("What did Jesus do on the cross for the thief?", "Promised him paradise"),
      ],
    },
    {
      id: "scripture-and-truth",
      name: "Scripture & Truth",
      blocks: [
        solo("What is the greatest commandment according to Jesus?", "Love the Lord your God"),
        solo("Who said, 'Here am I, send me'?", "Isaiah"),
        solo("What book says, 'The Lord is my shepherd'?", "Psalms"),
        solo("Who wrote, 'Faith is the substance of things hoped for'?", "Paul (Hebrews)"),
        solo("What fruit did Eve eat?", "Forbidden fruit from the tree of knowledge"),
        solo("Who said, 'My Lord and my God'?", "Thomas"),
        solo("What is the last book of the Bible?", "Revelation"),
        solo("Who said, 'Speak, Lord, for your servant is listening'?", "Samuel"),
        solo("What did Jesus say is the second greatest commandment?", "Love your neighbor as yourself"),
        solo("Who asked, 'How can a man be born when he is old'?", "Nicodemus"),
      ],
    },
  ],
};

const round4 = {
  round: 4,
  title: "Round 4 — Riddles",
  displayShowsQuestion: false,
  riddles: [
    {
      id: 1,
      answer: "Ruth",
      clues: [
        "My homeland lay beyond the Jordan, a place my mother-in-law begged me never to return to.",
        "I gleaned at the edge of a field belonging to a kinsman whose name means 'my strength is in the LORD.'",
        "At the city gate, a nearer redeemer declined his right, and another took up my cause with sandal and oath.",
        "I pledged, 'Where you go I will go,' and became great-grandmother to Israel's greatest king.",
      ],
    },
    {
      id: 2,
      answer: "Lazarus",
      clues: [
        "My sisters sent word that I was ill, yet the One they called Master deliberately stayed away two days.",
        "By the time He arrived, I had already been sealed in a tomb carved from rock for four days.",
        "Many mourners wept with my family in a village near Jerusalem, and some said He could have prevented this.",
        "He called my name aloud, and I walked out still wrapped in grave clothes.",
      ],
    },
    {
      id: 3,
      answer: "Gideon",
      clues: [
        "I was threshing wheat in a winepress to hide from Midianite raiders when an angel addressed me as a mighty warrior.",
        "I asked for a sign involving dew on fleece alone, then dry fleece while the ground was wet.",
        "My army was reduced from thousands to three hundred men carrying trumpets, jars, and torches.",
        "At my command they broke the jars, blew trumpets, and routed an enemy camp without swords.",
      ],
    },
    {
      id: 4,
      answer: "The Tabernacle",
      clues: [
        "My design was shown on a mountain to a leader who had fled Egypt decades earlier.",
        "Skilled craftsmen built me with acacia wood overlaid in gold, blue, purple, and scarlet yarn.",
        "Only one priest could enter my innermost room once a year, bearing blood for atonement.",
        "I traveled through the wilderness before a permanent house was built in Jerusalem.",
      ],
    },
    {
      id: 5,
      answer: "Paul",
      clues: [
        "I was a citizen of a free city, trained under a famous rabbi, and zealous for the traditions of my fathers.",
        "On a road to Damascus I was struck blind by a light brighter than the noonday sun.",
        "A disciple named Ananias restored my sight and I was baptized after three days of fasting.",
        "I wrote many letters to churches and was shipwrecked while being taken to Rome as a prisoner.",
      ],
    },
  ],
};

const round5 = {
  round: 5,
  title: "Round 5 — Money Round",
  winnerOnly: true,
  currency: "GHS",
  totalPool: 1000,
  displayShowsOptions: true,
  ladder: [
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
  ],
  question: [
    {
      id: 1,
      step: 1,
      amount: 10,
      question: "Who was the first woman God created?",
      options: ["Eve", "Sarah", "Ruth", "Mary"],
      correctIndex: 0,
      correctAnswer: "Eve",
    },
    {
      id: 2,
      step: 2,
      amount: 15,
      question: "Which sea did Moses part for Israel to cross?",
      options: ["Red Sea", "Dead Sea", "Mediterranean Sea", "Sea of Galilee"],
      correctIndex: 0,
      correctAnswer: "Red Sea",
    },
    {
      id: 3,
      step: 3,
      amount: 25,
      question: "Who denied Jesus three times before the rooster crowed?",
      options: ["Judas", "Peter", "Thomas", "John"],
      correctIndex: 1,
      correctAnswer: "Peter",
    },
    {
      id: 4,
      step: 4,
      amount: 35,
      question: "What is the first book of the New Testament?",
      options: ["Mark", "Luke", "Matthew", "Acts"],
      correctIndex: 2,
      correctAnswer: "Matthew",
    },
    {
      id: 5,
      step: 5,
      amount: 40,
      question: "Who interpreted the writing on the wall for Belshazzar?",
      options: ["Daniel", "Joseph", "Ezra", "Jeremiah"],
      correctIndex: 0,
      correctAnswer: "Daniel",
    },
    {
      id: 6,
      step: 6,
      amount: 50,
      question: "On what day of creation did God create human beings?",
      options: ["Day 5", "Day 6", "Day 7", "Day 3"],
      correctIndex: 1,
      correctAnswer: "Day 6",
    },
    {
      id: 7,
      step: 7,
      amount: 60,
      question: "Who was the father of John the Baptist?",
      options: ["Joseph", "Zechariah", "Simeon", "Nicodemus"],
      correctIndex: 1,
      correctAnswer: "Zechariah",
    },
    {
      id: 8,
      step: 8,
      amount: 65,
      question: "Which apostle doubted Jesus' resurrection until he saw the wounds?",
      options: ["Andrew", "Philip", "Thomas", "Bartholomew"],
      correctIndex: 2,
      correctAnswer: "Thomas",
    },
    {
      id: 9,
      step: 9,
      amount: 75,
      question: "Who was the queen who saved the Jewish people from Haman?",
      options: ["Jezebel", "Esther", "Deborah", "Bathsheba"],
      correctIndex: 1,
      correctAnswer: "Esther",
    },
    {
      id: 10,
      step: 10,
      amount: 85,
      question: "How many books are in the Old Testament?",
      options: ["27", "39", "66", "73"],
      correctIndex: 1,
      correctAnswer: "39",
    },
    {
      id: 11,
      step: 11,
      amount: 90,
      question: "Who was the tax collector Jesus called from a tree?",
      options: ["Matthew", "Zacchaeus", "Levi", "Simon"],
      correctIndex: 1,
      correctAnswer: "Zacchaeus",
    },
    {
      id: 12,
      step: 12,
      amount: 100,
      question: "Which prophet was taken up to heaven in a whirlwind?",
      options: ["Elisha", "Elijah", "Enoch", "Isaiah"],
      correctIndex: 1,
      correctAnswer: "Elijah",
    },
    {
      id: 13,
      step: 13,
      amount: 110,
      question: "What did Jesus say to the storm on the Sea of Galilee?",
      options: ["Be gone", "Peace, be still", "Calm yourselves", "Why are you afraid?"],
      correctIndex: 1,
      correctAnswer: "Peace, be still",
    },
    {
      id: 14,
      step: 14,
      amount: 115,
      question: "Who wrote the book of Acts?",
      options: ["Paul", "Peter", "Luke", "John"],
      correctIndex: 2,
      correctAnswer: "Luke",
    },
    {
      id: 15,
      step: 15,
      amount: 125,
      question: "What is the last word of the Bible in most English translations?",
      options: ["Amen", "Come", "Forever", "Light"],
      correctIndex: 0,
      correctAnswer: "Amen",
    },
  ],
};

function writeRound(name, data) {
  const filePath = path.join(CONTENT_DIR, name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log("Wrote", name);
}

writeRound("round1.json", round1);
writeRound("round2.json", round2);
writeRound("round3.json", round3);
writeRound("round4.json", round4);
writeRound("round5.json", round5);

console.log("R4 riddles:", round4.riddles.length);
