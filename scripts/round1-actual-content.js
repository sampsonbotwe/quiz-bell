const fs = require("fs");
const path = require("path");

function block(main, sub1, sub2, ansMain, ansSub1, ansSub2) {
  return {
    main,
    subs: [sub1, sub2],
    answers: { main: ansMain, subs: [ansSub1, ansSub2] },
  };
}

function category(id, name, blocks) {
  return { id, name, blocks };
}

const round1 = {
  round: 1,
  title: "Round 1",
  sets: {
    A: {
      label: "Set A",
      categories: [
        category("lets-build-for-the-lord", "Let's Build for the Lord", [
          block(
            "Who built the ark that saved his family and the animals from the flood?",
            "What type of wood was the ark built from?",
            "What tower did the people build in an attempt to reach the heavens?",
            "Noah",
            "Gopher",
            "Babel"
          ),
          block(
            "Who built the first Temple in Jerusalem?",
            "Which king of Tyre supplied cedar wood and craftsmen for the Temple's construction?",
            "What was the name of the great bronze basin built for the priests to wash in at the Temple?",
            "Solomon",
            "Hiram",
            "Sea (the Molten/Bronze Sea)"
          ),
          block(
            "Who rebuilt the walls of Jerusalem after the Babylonian exile?",
            "How many days did it take to complete the rebuilding of the wall?",
            "Who built the first city mentioned in the Bible, naming it after his son?",
            "Nehemiah",
            "52",
            "Cain"
          ),
        ]),
        category("short-shorter-shortest", "Short, Shorter, Shortest", [
          block(
            "Who was the short tax collector who climbed a tree to see Jesus?",
            "What kind of tree did he climb?",
            "Which king of Israel reigned for only seven days before taking his own life?",
            "Zacchaeus",
            "Sycamore",
            "Zimri"
          ),
          block(
            "Which judge deliberately reduced his army down to a small number so Israel couldn't boast?",
            "How many men were left in his army?",
            "Which king's reign was cut short by God because of his disobedience regarding the Amalekites?",
            "Gideon",
            "300",
            "Saul"
          ),
          block(
            "Which prophet delivered the shortest recorded warning to a city, and it repented?",
            "How many days did he give Nineveh before judgment?",
            "Who was the smallest and youngest of Jesse's sons, overlooked at first?",
            "Jonah",
            "40",
            "David"
          ),
        ]),
        category("prophecy-to-me", "Prophecy to Me", [
          block(
            "Which prophet foretold that a virgin would conceive and bear a son called Immanuel?",
            "Which prophet anointed David as the future king while he was still a shepherd boy?",
            "Who interpreted Pharaoh's dreams and predicted seven years of famine?",
            "Isaiah",
            "Samuel",
            "Joseph"
          ),
          block(
            "Which prophet foretold the fall of Jerusalem and wrote the book of Lamentations?",
            "Which prophet was swallowed by a great fish after refusing to prophesy to Nineveh?",
            "Which prophet confronted King David after his sin with Bathsheba?",
            "Jeremiah",
            "Jonah",
            "Nathan"
          ),
          block(
            "Which prophetess and judge sat under a palm tree to deliver God's messages to Israel?",
            "Which prophet anointed Saul as the first king of Israel?",
            "Which New Testament prophet foretold a great famine in the days of Claudius?",
            "Deborah",
            "Samuel",
            "Agabus"
          ),
        ]),
        category("im-all-about-the-js", "I'm All About the J's", [
          block(
            "Who was sold into slavery by his brothers and later became governor of Egypt?",
            "Who was the father of the twelve tribes of Israel, renamed by God after wrestling Him?",
            "Who succeeded Moses and led Israel into the Promised Land?",
            "Joseph",
            "Jacob",
            "Joshua"
          ),
          block(
            "Which wicked queen of Israel promoted the worship of Baal and persecuted the prophets?",
            "Who betrayed Jesus with a kiss for thirty pieces of silver?",
            "Who baptized Jesus in the River Jordan?",
            "Jezebel",
            "Judas",
            "John"
          ),
          block(
            "Which king of Israel was famous for driving his chariot furiously and killed Jezebel?",
            "Which righteous king of Judah won a battle by sending singers ahead of his army?",
            "Which woman killed the enemy commander Sisera by driving a tent peg through his head?",
            "Jehu",
            "Jehoshaphat",
            "Jael"
          ),
        ]),
      ],
    },
    B: {
      label: "Set B",
      categories: [
        category("alphabet", "Alphabet", [
          block(
            "What Greek word, meaning \"word,\" is used to describe Jesus in John chapter 1?",
            "What Greek-derived title means \"unveiling\" and is another name for the book of Revelation?",
            "What is the name of the second letter of the Hebrew alphabet, also the second section-title in Psalm 119?",
            "Logos",
            "Apocalypse",
            "Beth"
          ),
          block(
            "Which Old Testament book mourning Jerusalem's fall is structured as a Hebrew acrostic poem?",
            "How many chapters does the book of Lamentations have?",
            "Which book and chapter of the Bible, describing the \"virtuous woman,\" is arranged as a 22-line Hebrew acrostic?",
            "Lamentations",
            "Five",
            "Proverbs 31"
          ),
          block(
            "What is the Hebrew name for the smallest letter of the alphabet, referenced by Jesus as the \"jot\"?",
            "What is the last letter of the Hebrew alphabet, symbolizing completeness?",
            "What word, meaning \"so be it,\" did Jesus often repeat twice for emphasis?",
            "Yodh",
            "Tav",
            "Amen"
          ),
        ]),
        category("women-empowerment", "Women Empowerment", [
          block(
            "Which businesswoman, a seller of purple cloth, became a prominent convert in Philippi?",
            "Which woman, alongside her husband Aquila, taught Apollos more accurately about the faith?",
            "Which elderly prophetess recognized the infant Jesus when He was presented at the Temple?",
            "Lydia",
            "Priscilla",
            "Anna"
          ),
          block(
            "Which wealthy woman built a room on her roof to host the prophet Elisha whenever he passed by?",
            "Which prophetess, sister of Moses and Aaron, led the women in song after crossing the Red Sea?",
            "Which woman placed her baby son in a basket among the reeds of the Nile to save his life?",
            "The Shunammite woman",
            "Miriam",
            "Jochebed"
          ),
          block(
            "Which queen was removed from her position for refusing to appear before King Xerxes at his banquet?",
            "Which barren woman was promised a son in her old age, later becoming mother of Isaac?",
            "Which sister of Lazarus and Martha sat at Jesus' feet to listen to His teaching?",
            "Vashti",
            "Sarah",
            "Mary"
          ),
        ]),
        category("back-in-time", "Back in Time", [
          block(
            "How many tribes of Israel descended from the sons of Jacob?",
            "Which tribe served as Israel's priests and received no land inheritance of their own?",
            "Which judge and priest led Israel for 40 years before Samuel took over?",
            "Twelve",
            "Levi",
            "Eli"
          ),
          block(
            "What was the name of the sacred chest that carried the tablets of the Law through the wilderness?",
            "Which spy, alongside Joshua, gave a faithful, positive report about conquering Canaan?",
            "How many spies in total were sent to scout the land of Canaan?",
            "Ark",
            "Caleb",
            "Twelve"
          ),
          block(
            "Under which king did Israel become a united kingdom for the very first time?",
            "After which king's death did the united kingdom of Israel split into two?",
            "What was the name of the northern kingdom after the nation split in two?",
            "Saul",
            "Solomon",
            "Israel"
          ),
        ]),
        category("royalty", "Royalty", [
          block(
            "Which king of Israel built the city of Samaria to be his new capital?",
            "Which notoriously wicked king of Judah sacrificed his own son and practiced sorcery?",
            "Which king tore his royal robes upon hearing the long-lost Book of the Law read aloud?",
            "Omri",
            "Manasseh",
            "Josiah"
          ),
          block(
            "Which ruler was struck down and eaten by worms after accepting worship as a god?",
            "Which Persian king made Esther his queen after a kingdom-wide search?",
            "Which king secretly consulted a medium at Endor the night before his final, fatal battle?",
            "Herod",
            "Xerxes",
            "Saul"
          ),
          block(
            "Which final king of Judah was captured, blinded, and taken in chains to Babylon?",
            "Which ruthless queen mother tried to destroy the entire royal family to seize Judah's throne?",
            "Which king of Israel reigned only two years before being assassinated by his own official?",
            "Zedekiah",
            "Athaliah",
            "Nadab"
          ),
        ]),
      ],
    },
    C: {
      label: "Set C",
      categories: [
        category("new-and-old-covenants", "New and Old Covenants", [
          block(
            "What is the sign given by God in his covenant with Noah, promising never again to destroy all life with a flood?",
            "Which promised son did God ask Abraham to offer as a test of his obedience?",
            "Which item contained the covenant Law given to Israel through Moses at Sinai?",
            "Rainbow",
            "Isaac",
            "The Stone Tablets"
          ),
          block(
            "According to Hebrews, who is the great High Priest and mediator of the new covenant, \"after the order of Melchizedek\"?",
            "Who was the priest-king of Salem who blessed Abram, prefiguring Christ's eternal priesthood?",
            "What did Jesus pour out at the Last Supper, calling it \"the blood of the covenant\"?",
            "Jesus",
            "Melchizedek",
            "Wine"
          ),
          block(
            "What object in the Most Holy Place did the high priest sprinkle blood on once a year for national atonement?",
            "What was the name of the annual old covenant observance where the high priest atoned for Israel's sins?",
            "What consequence did Deuteronomy 28 warn Israel would follow persistent covenant disobedience?",
            "Mercy-seat",
            "Day of Atonement",
            "Exile"
          ),
        ]),
        category("father-and-sons", "Father and Sons", [
          block(
            "Which father, with his wife Hannah, dedicated his young son Samuel to serve in the Tabernacle?",
            "Who was the father of Boaz, the kinsman-redeemer in the book of Ruth?",
            "Which father had seventy sons, most of whom were murdered by his own ambitious son Abimelech?",
            "Elkanah",
            "Salmon",
            "Gideon"
          ),
          block(
            "Who was the father of Abraham, who began the family's journey out of Ur?",
            "Who was the father of Obed, grandfather of Jesse, in the ancestral line leading to David?",
            "Which father's harsh son Rehoboam caused ten tribes of Israel to revolt after his death?",
            "Terah",
            "Boaz",
            "Solomon"
          ),
          block(
            "Which son of Isaac deceitfully obtained his father's blessing meant for his older twin brother?",
            "Which son of Solomon lost ten tribes of Israel due to his harsh rule?",
            "Which son of Gideon murdered sixty-nine of his brothers to make himself king?",
            "Jacob",
            "Rehoboam",
            "Abimelech"
          ),
        ]),
        category("super-heroes", "Super Heroes", [
          block(
            "Who was Israel's very first judge, nephew of Caleb, who delivered Israel from a Mesopotamian king?",
            "Which judge killed a thousand Philistines with a donkey's jawbone?",
            "Who was the last and greatest of Israel's judges, transitioning the nation into the monarchy?",
            "Othniel",
            "Samson",
            "Samuel"
          ),
          block(
            "Which 85-year-old warrior personally drove the giant Anakim out of Hebron to claim his inheritance?",
            "Who served as commander of King David's army for many years?",
            "Which of David's mighty men killed a lion in a pit on a snowy day?",
            "Caleb",
            "Joab",
            "Benaiah"
          ),
          block(
            "Which priest organized a coup to overthrow the wicked queen Athaliah and crown the rightful boy-king?",
            "Which apostle escaped prison after an angel miraculously opened his chains and the gates at night?",
            "Which missionary sang hymns in a Philippian jail cell before an earthquake set him free?",
            "Jehoiada",
            "Peter",
            "Paul"
          ),
        ]),
        category("god-made-science", "God Made Science", [
          block(
            "On which day of creation did God make land animals and creeping things?",
            "What did God call the gathered waters He made on the third day?",
            "What did God command the earth to produce on the third day, besides seas appearing?",
            "Sixth",
            "Seas",
            "Grass"
          ),
          block(
            "What sound accompanied God's presence at Mount Sinai, along with a trumpet blast?",
            "What covered Mount Sinai, hiding it from view when God descended upon it?",
            "What did God turn the Nile River into during the first plague on Egypt?",
            "Thunder",
            "Smoke",
            "Blood"
          ),
          block(
            "What did Israel do, together with the trumpet blasts, right before the walls of Jericho collapsed?",
            "What did God cause to move backward on a stairway as a sign confirming Hezekiah's healing?",
            "What insect swarm made up the eighth plague sent on Egypt?",
            "Shout",
            "Shadow",
            "Locusts"
          ),
        ]),
      ],
    },
  },
};

const outPath = path.join(__dirname, "..", "content", "round1.json");
fs.writeFileSync(outPath, JSON.stringify(round1, null, 2) + "\n");
console.log("Wrote", outPath);
