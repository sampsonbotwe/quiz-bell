# Quiz Bell

A local quiz buzzer app for three teams: **Dunamis**, **Zoe**, and **Pneuma**.

Teams press a bell on their phone during a riddle. The app records who rang first, plays a unique sound for each team, and shows the order on a display screen. An admin can reset the bells after each question.

No database is required. Everything runs in memory on one machine on your local network.

## Teams

| Team | Color | Bell page |
| --- | --- | --- |
| Dunamis | Blue | `/dunamis` |
| Zoe | Green | `/zoe` |
| Pneuma | Gold | `/pneuma` |

## Screens

| Screen | URL | Purpose |
| --- | --- | --- |
| Home | `/` | Links to all pages |
| Dunamis | `/dunamis` | Dunamis team bell button |
| Zoe | `/zoe` | Zoe team bell button |
| Pneuma | `/pneuma` | Pneuma team bell button |
| Admin | `/admin` | See live order, reset bells, and play team bell sounds |
| Display | `/display` | LED overlay with order (silent) |
| Timer | `/timer` | Large countdown display with wrong-answer sound at 0 |
| Timer Control | `/timer-control` | Set, start, stop, and reset the timer |

## How it works

1. Start the app on the host laptop.
2. Open each team page on a phone or tablet.
3. Open the admin page on the host laptop.
4. Open the display page on the LED machine.
5. When a riddle is read, teams press **RING** once.
6. Each button locks after one press so teams cannot ring twice.
7. The display shows who rang first, second, and third, with timings.
8. After the answer, admin presses **Reset bells** for the next question.

## Timer

Use **Timer Control** to pick 5s, 10s, 60s, or a custom number of seconds, then start the countdown.

- Once the timer is running, the duration cannot be changed until you stop it.
- **Stop** pauses the countdown and enables **Reset**.
- **Reset** puts the timer display back to the selected duration. Your duration choice stays on the control page.
- **Timer** shows the live countdown. Sound plays on **Timer Control** when it reaches 0.

## Requirements

- Node.js 8.9.4 or newer
- All devices on the same Wi-Fi/network as the host machine

## Run locally

```bash
npm install
npm start
```

The server prints URLs for `localhost` and your machine's network IP, for example:

```text
Home     http://192.168.1.10:3000/
Dunamis  http://192.168.1.10:3000/dunamis
Zoe      http://192.168.1.10:3000/zoe
Pneuma   http://192.168.1.10:3000/pneuma
Admin    http://192.168.1.10:3000/admin
Display  http://192.168.1.10:3000/display
Timer    http://192.168.1.10:3000/timer
Timer Control  http://192.168.1.10:3000/timer-control
```

Use the network IP on phones and the LED machine.

## Optional settings

Change the port:

```bash
PORT=4000 npm start
```

## Notes

- State is stored in memory only. Restarting the server clears the current round.
- The admin page plays team bell sounds. Tap the page once if the browser blocks audio.
- The display is silent and designed for the right side of the screen so video can sit on the left in vMix or similar software.
