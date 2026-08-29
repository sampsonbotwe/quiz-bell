# Quiz Bell

A local quiz app for three teams: **Dunamis**, **Zoe**, and **Pneuma**. Teams buzz in on their phones, the host runs questions from the Quiz Host screen, and overlays feed vMix/OBS on the LED machine.

No database is required. Everything runs in memory on one machine on your local network.

## Teams

| Team | Color | Bell page |
| --- | --- | --- |
| Dunamis | Blue | `/dunamis` |
| Zoe | Red | `/zoe` |
| Pneuma | Gold | `/pneuma` |

## Screens

| Screen | URL | Purpose |
| --- | --- | --- |
| Home | `/` | Links to all pages |
| Dunamis | `/dunamis` | Dunamis team bell button |
| Zoe | `/zoe` | Zoe team bell button |
| Pneuma | `/pneuma` | Pneuma team bell button |
| Admin | `/admin` | See live order, reset bells, and play team bell sounds |
| Display | `/display` | Bell order + question overlay (chroma key green) |
| Timer | `/timer` | Large countdown display (chroma key green) |
| Timer Control | `/timer-control` | Set, start, stop, and reset the timer |
| Quiz Host | `/host` | Host control — rounds, questions, answers, scoring |

## Quiz rounds

Question content lives in `content/round1.json` through `content/round5.json`.

| Round | Format |
| --- | --- |
| 1 | Sets A/B/C — pick a category, 3 blocks × (main + 2 subs) |
| 2 | Pick a book — 4 books, 5 questions each (main + 2 subs) |
| 3 | 60s blitz — 4 books (Daniel, Esther, Exodus, 1 Samuel), 20 questions each; use Timer Control |
| 4 | Riddles — 6 riddles; first three clues are very difficult, fourth clue is clearer |
| 5 | Who Wants to Be a Champion? — winner only, 15 multiple choice + GHS ladder |

## Quiz Host

Open `/host` on the host laptop.

- Switch **R1–R5** at any time — each round picks up where you left off
- **Reset round** (top bar) clears progress for the current round only
- **Round 1:** pick Set A/B/C, choose a category, navigate main/sub questions
- **Round 2:** pick a category, navigate questions
- **Round 3:** pick a category — the team answers questions in that category. Use **Question done** after each one; tap **Category done** if time runs out before all 10 are finished. That category is then closed and other teams can pick from what remains.
- **Round 4:** reveal clues to the display; all clues + answer visible to host
- **Round 5:** mark **Correct** or **Wrong** to advance the money ladder
- **Hide display** toggles the question overlay off without changing position
- Progress shows current question number at the top

## Display

Open `/display` on the LED machine. Green background (`#00FF00`) for chroma key — key out the green in vMix/OBS.

- **Right side:** live bell order (who rang 1st, 2nd, 3rd)
- **Bottom left:** question lower-third when the host sends one
- Rounds 1–3: question text only
- Round 4: revealed clues only (no riddle title on screen)
- Round 5: question, four options, and money ladder

Use **Hide display** on the Quiz Host page to clear the question overlay; the bell panel stays visible.

## Bells

1. Start the app on the host laptop.
2. Open each team page on a phone or tablet.
3. Open the admin page on the host laptop.
4. Open the display page on the LED machine.
5. When a question is live, teams press **RING** once.
6. Each button locks after one press.
7. The display shows who rang first, second, and third.
8. After the answer, admin presses **Reset bells** for the next question.

## Timer

Use **Timer Control** for Round 3 (60s per team) or any timed segment.

- Pick 5s, 10s, 60s, or a custom duration, then start.
- Duration is locked while running.
- **Stop** pauses; **Reset** restores the selected duration.
- Sound plays on **Timer Control** when time reaches 0.

## Requirements

- Node.js 8.9.4 or newer
- All devices on the same Wi-Fi/network as the host machine

## Run locally

```bash
npm install
npm start
```

For development, run with auto-restart when server or question files change:

```bash
npm run dev
```

Nodemon watches `server.js`, `quiz-state.js`, `content/*.json`, and files in `public/`. Open pages reload automatically when the server restarts — no manual refresh needed.

The server prints URLs for `localhost` and your machine's network IP.

Use the network IP on phones and the LED machine.

## Optional settings

Change the port:

```bash
PORT=4000 npm start
```

## Notes

- State is stored in memory only. Restarting the server clears bells, timer, and quiz position.
- The admin page plays team bell sounds. Tap the page once if the browser blocks audio.
- The display is silent. Bell order sits on the right; questions appear as a lower-third on the left. Key out the green background in vMix.
- Edit questions by changing the JSON files in `content/` — `npm run dev` picks up changes automatically.
