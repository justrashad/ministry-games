# Ministry Showdown

> Formerly called Survey Showdown. Browser storage keys still use the `survey-showdown:` prefix on purpose, so families who played before the rename keep their question sets, settings and history.

A family-friendly survey guessing game designed for family worship. Two teams try to guess the most popular answers to Bible-centered survey questions on a TV-sized game board, while one person hosts from a laptop, tablet, or phone.

Ministry Showdown is inspired by the general format of classic survey game shows. It uses no game-show branding, artwork, fonts, or sounds, and it is not produced by, affiliated with, or endorsed by Jehovah's Witnesses or the Watch Tower Bible and Tract Society.

## Features

- Two teams with custom names and colors, live scores, and a clear "playing" and "stealing" indicator
- Answer board with flip animations, a strike system with animated X marks, and a steal round
- Configurable rounds and multipliers (default 1×, 2×, 2×) plus a big-point final round with its own look, optional timer, answer limit, and "reveal all at once" mode
- Final Challenge: a two-player speed round after the game with a countdown clock, pass/skip, automatic answer matching with host override, duplicate-answer rules, reveal sequence, and a target score
- Two-window setup: host controls in one window, the game screen on the TV in another, kept in sync instantly with no server
- Phone remote: scan a QR code on the TV and host the whole game from a phone, connected device to device
- Buzz-in face-off: team captains buzz from their phones (or A and L on the TV keyboard); the first buzz wins control of the round
- Final Challenge on the player's own phone: each player types privately, and the phone only shows questions during that player's turn
- Share question sets as a link (no server, nothing uploaded) and print host cards or save them as a PDF
- Four themed question packs (Bible Characters, Kingdom Hall and Meetings, Creation, Christian Ministry) and "save recently played questions for later" so repeat nights feel fresh
- Installable and fully offline after the first visit (Progressive Web App)
- Question editor with question sets, categories, notes, per-question multipliers, reordering, alternate answers, and JSON import/export with validation
- 18 round questions, 2 final-round questions, and 12 Final Challenge questions included as a starting set
- House rules, timers, sound, animation, and reduced-motion settings
- Game history (last 50 games) with scores, winners, questions played, and Final Challenge results
- Recovers the game in progress after a browser refresh
- Keyboard shortcuts for the host, full keyboard navigation, screen-reader labels, reduced-motion support
- Works offline once loaded; all data stays in the browser

## Tech stack

React 18, TypeScript, Vite 5, Tailwind CSS 3, Lucide icons, Vitest, vite-plugin-pwa (Workbox service worker), PeerJS (WebRTC phone remote), and qrcode. Fonts (Fredoka and Nunito) are bundled through Fontsource so nothing loads from the internet at runtime. Sounds are generated with the Web Audio API. There is no backend.

## Installation

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

`npm run build` type-checks and writes a static site to `dist/`. The build uses relative paths and hash routing, so `dist/` can be copied to any static host or folder. For the two-window sync to work reliably, serve it over `http://` (for example `npm run preview` or any static server) rather than opening `index.html` directly from disk.

## Running tests

```bash
npm test
```

The game engine and sync rules are pure TypeScript with no UI dependencies, so they are tested directly: revealing answers, double-reveal and double-scoring protection, strikes and strike limits, steals (success, failure, cancel, answer-only rule), round multipliers and per-question overrides, round transitions, resetting a round (including undoing an award), new-game resets, negative-score protection, the shared timer, question ordering and randomization, import validation, answer matching, the complete Final Challenge flow, envelope merging (including the TV-wins rule when a phone joins), and room codes.

`npm run typecheck` runs the TypeScript compiler on its own.

## How to play

1. Split into two teams.
2. The host reads the question.
3. Teams try to guess the most popular answers.
4. Correct answers flip over and add their points.
5. Three answers that aren't on the board give the other team a chance to steal.
6. The team with the most points at the end wins.

After the main game, the winning team can play the Final Challenge: Player 1 answers five quick questions against the clock while Player 2 waits out of earshot, then Player 2 answers the same questions. The host checks the matches, reveals them one by one, and the family tries to reach the target score together.

## Hosting a game

1. Choose **Start new game**, name the teams, pick a question set, and press **Start game**. By default this also opens the game screen in a new window.
2. Drag the game screen window to the TV and press **F** (or the corner button) for full screen. If the browser blocked sound, click **Click to turn on sound** once on that window.
3. On the host controls, press **Start round 1**, pick which team is playing, then **Show question**.
4. Press **Correct** next to an answer the team guesses. Use **Strike** for answers that aren't on the board. The final strike automatically opens the steal.
5. During a steal, press **Steal it** next to the answer the stealing team guessed, or **Steal missed** to give the round to the team that was playing.
6. When a team finishes the board, the round is awarded automatically. You can also end any round with **Award ... to ...**.
7. **Next round** continues. After the last round the TV shows the results, and the host can start the Final Challenge, play again, or pick new questions.

Mistakes are easy to fix: undo a strike, un-reveal an answer before the round is awarded, replay a round (which takes back its points exactly), change a question, or edit a team's name, color, or score directly.

### Host keyboard shortcuts

| Key | Action |
| --- | --- |
| 1 to 9 | Correct: reveal that answer and add its points (awards the steal during a steal) |
| Shift + 1 to 9 | Show that answer without points |
| X / Z | Strike / undo strike (or cancel a steal) |
| S | Start the steal |
| B | Open the face-off buzzers again |
| [ and ] | Team 1 or Team 2 is playing |
| Q | Show the question |
| R | Reveal the next hidden answer |
| T | Start or pause the timer |
| N | Next round |
| P | Pause or resume |

## Creating questions

Open **Questions**. Each question set holds three kinds of questions:

- **Round question**: played in the regular rounds.
- **Final round**: saved for the big-point final round.
- **Use for Final Challenge**: used only in the two-player Final Challenge. These can also list alternate acceptable answers (for example "Go for a stroll" counts as "Take a walk").

Enter answers from most to least popular, with a point value for each. Point values are game values created for the question set, not real survey statistics. Optional fields include a category, a multiplier that overrides the round's multiplier, a time limit, and host notes (shown only on the host controls).

The editor checks that the question and every answer have text, that points are numbers between 0 and 1000, and that alternate answers point to an answer that still exists.

## Import and export

Select a set and press **Export question set** to download a `.json` file. On another computer, press **Import question set** and choose that file. Imports are validated before anything is saved: invalid JSON, missing fields, empty text, non-numeric points, or files from a newer version are rejected with a friendly explanation, and duplicate IDs are replaced automatically.

The file format:

```json
{
  "name": "Family Worship Questions",
  "version": 1,
  "questions": [
    {
      "id": "q-1",
      "category": "Bible Characters",
      "question": "Name a Bible character a family might enjoy learning about.",
      "answers": [
        { "id": "a-1", "text": "David", "points": 24 },
        { "id": "a-2", "text": "Daniel", "points": 20 }
      ],
      "multiplier": 2,
      "isFinalRound": false,
      "isFinalChallenge": false,
      "alternateAnswers": [{ "acceptedAnswer": "King David", "matchesAnswerId": "a-1" }],
      "notes": "Optional host note"
    }
  ]
}
```

Only `question` and `answers` (with `text` and `points`) are required; everything else is optional. A plain array of questions is also accepted.

## How the two-screen setup works

Every window holds a copy of the game state. When the host presses a button, that window applies the change with the game engine, increases a revision number, saves the state to `localStorage`, and broadcasts it on a `BroadcastChannel`. Other windows adopt any newer revision immediately. If `BroadcastChannel` is unavailable, windows fall back to the browser's `storage` event plus polling `localStorage` every 600 ms.

Timers are stored as wall-clock data (time remaining and when it started) rather than ticking counters, so every window shows the same time without constant messages.

The game screen announces itself every two seconds. While it is open, sounds play on the TV; when it isn't, they play on the host window instead, so sounds are never doubled.

Both windows must be in the same browser profile on the same device (for example, a laptop connected to the TV by HDMI, with the game window dragged onto the TV). To host from a separate phone, use the phone remote below.

## Phone remote

1. On the TV's game screen, press **Use a phone as the remote** (or **Phone remote** in the bottom-left corner). The TV shows a QR code and a five-character room code.
2. On the phone, scan the QR code, or open the site and tap **Use this phone as the remote** and type the code.
3. The phone switches to the host controls. Start a new game from the phone (it uses the question sets saved on the phone) or control a game already started on the laptop.

How it works: the TV window opens a WebRTC peer with an id built from the room code. The free public PeerJS service introduces the two devices, then game data flows directly between them over an encrypted WebRTC data channel. Each phone connection is simply another sync transport alongside the local BroadcastChannel, and the TV relays between its laptop tabs and the phone, so any mix of laptop host, phone host and TV stays in step.

When a phone joins, the TV's game always wins: the phone replaces whatever game it had stored locally. Heartbeats detect a sleeping phone or dropped Wi-Fi within about 13 seconds; the phone shows a "Reconnecting" screen and rejoins on its own, and a refresh on either device reconnects to the same code. **New code** on the TV disconnects every phone and issues a fresh code, which is the fix if an unexpected device ever joins.

The remote needs internet for the moment the devices find each other. Everything else, including the rest of the app, works offline.

## What a connected phone can be

After a phone connects to the TV, it chooses a role (and can switch at any time):

- **Host controls**: the full host screen, with Strike, Undo and Steal pinned to the bottom for one-handed play.
- **Team buzzer**: one giant button in the team's color. It lights up when the question appears; the first buzz to reach the TV wins control, the TV shows "First to buzz" with a chime, and the phone vibrates. The host can re-open the buzzers (Face-off again, or the B key) or simply pick a team.
- **Final Challenge player**: the player picks their seat and types their own answers. The phone shows questions only during that player's turn and never shows the other player's answers. The host can still type for them, and a late answer for a question the host already moved past is dropped instead of landing on the wrong question.

Buzzes and player answers are sent to the TV as requests, and the TV applies them in the order they arrive using its own clock. That keeps buzz races fair and stops a phone with a wrong clock from beating the timer. Only those two kinds of request are accepted from buzzer and player phones.

## Sharing and printing question sets

- **Share link** packs the whole set into the link itself (compressed), so a family can text it to another family. Opening the link shows a preview and **Add to my questions**. The part of a link after `#` is never sent to a web server, so the questions stay between the two families. Very large sets make very long links; for those, Export and send the file.
- **Print host cards** opens a printer-friendly page with every question, answer, point value, alternate answers and host notes. Choose "Save as PDF" in the print dialog to keep a copy.
- **Question packs** adds editable copies of four themed packs. Each has round questions, a final round question and five Final Challenge questions.

## Offline and installing

The production build includes a service worker that caches the entire app, fonts and sample questions. After one visit, the game loads with no connection. Browsers offer **Install** (Chrome, Edge) or **Add to Home Screen** (Safari) so it opens like a regular app. When a new version is deployed, the host sees **A new version of Ministry Showdown is ready** with a Reload button; updates never reload in the middle of a game on their own, and a game in progress survives the reload anyway.

During the Final Challenge, answers can be typed on either window, so a player can type on a keyboard connected to the TV computer or the host can type what the player says.

## How data is stored

Everything lives in the browser's `localStorage` under keys prefixed with `survey-showdown:`:

- question sets and questions
- settings and house rules
- the game in progress (for refresh recovery and two-window sync)
- game history (last 50 games)

Nothing is sent to a server. Clearing site data in the browser erases it, so export question sets you want to keep. **Settings > Data** shows approximate storage use and lets you reset settings, clear the current game, or erase everything. If storage is full or blocked, the app keeps working for the current session and shows a warning.

## Customizing

- **House rules** (Settings): rounds, multipliers per round, strikes before a steal, whether a steal wins all round points or only that answer's points, whether remaining answers are revealed at the end of a round, negative scores, and the final round (number of questions, multiplier, answers shown, timer, reveal style).
- **Timing**: an optional per-round timer (off, 15, 20, 30 seconds, or custom), a final-round timer, and Final Challenge clocks for each player.
- **Final Challenge**: number of questions (3 to 5), target score, and how duplicate answers are scored.
- **Face-off buzzers** (House rules): on by default; turn off to always choose the playing team yourself.
- **Save recently played questions for later** (Questions): questions from the last few games (default 3) move to the back of the deck. They are never removed, so small sets still work.
- **Visuals**: animations, celebration effects, reduced motion (follow device, always reduce, or full), and whether point values show on hidden answers.
- **Look and feel**: design tokens live in `tailwind.config.js` (colors and fonts) and `src/index.css` (component styles, board, animations).
- **Sample questions**: `src/data/sampleQuestions.ts`. Use **Add a fresh sample set** on the Questions page to restore them.

## Project structure

```
src/
  types.ts                  Shared types: questions, settings, game state, history
  engine/                   Pure game logic (no React), fully unit tested
    game.ts                 Main reducer: rounds, reveals, strikes, steals, scoring, timer
    finalChallenge.ts       Final Challenge reducer and scoring
    createGame.ts           Builds a new game from settings and a question set
    questionPicker.ts       Ordering, shuffling, no-repeat selection
    matching.ts             Forgiving answer matching for the Final Challenge
    validation.ts           Question and import validation
    timer.ts, events.ts, defaults.ts, random.ts
  data/sampleQuestions.ts   Built-in sample content
  state/                    Persistent stores (settings, library, history)
  sync/                     Replicated game store, transports (BroadcastChannel, WebRTC phone remote), presence, room codes
  hooks/                    Motion, count-up, sounds, timer driver, history recorder
  lib/                      Storage, sound synthesis, confetti, router, downloads
  components/ui/            Buttons, modal, confirm, toast, fields, toggle, tabs
  components/game/          Board, scores, strikes, timer, round header, wordmark
  screens/                  Home, New game, Game screen, Host, Questions, Settings, History, How to play
```

## Browser support

Current versions of Chrome, Edge, Firefox, and Safari. Sound requires the Web Audio API and one click on the game screen in browsers that block autoplay; the game works fully with sound off.

## Selling Ministry Showdown

Ministry Showdown is a paid game with a free one-round demo.

- **Full game ($39.99, one-time):** unlocks the app on the device plus the 32-question Mixed Family Worship starter set.
- **Question packs ($9.99 each, one-time):** each unlocks one themed pack.
- **Mega Pack ($49.99, one-time):** every question pack, including packs released later.
- **Complete Edition ($79.99, one-time):** the game plus every question pack, including packs released later.
- **Free demo:** one round drawn from five sample questions, with reveals, strikes, steals and buzzers. No final round or Final Challenge.
- **Guests are free:** phones that join as a buzzer, Final Challenge player or remote for a game started on a licensed device need no license.

### How purchases work

1. The customer buys through a Lemon Squeezy checkout link (opened from the Store screen). Lemon Squeezy is the merchant of record: it charges the card, sends the receipt and collects sales tax.
2. Lemon Squeezy emails a license key. The customer pastes it on the Store screen (or any paywall).
3. The app sends the key to the site's own function at `/api/activate`. The function asks Lemon Squeezy to activate it, confirms the key belongs to **this** store and to a known product, and returns a token signed with a server secret. For a pack key it also returns that pack's questions.
4. Mega Pack and Complete Edition keys unlock every pack. Packs released later are added to the buyer's library automatically the next time the app opens online (the app remembers which packs it already added, so a set someone deleted on purpose isn't re-added).
5. The token is saved on the device. About once a week, when online, the app re-checks it (`/api/validate`), so refunded keys stop working. Being offline never locks anyone out.
6. **Remove from this device** (Store screen) frees the activation so the key can be used elsewhere.

Paid pack questions live in `server/packs.ts`, which is bundled only into the Netlify Function, never into the public website. The public app knows only pack names and counts (`src/commerce/catalog.ts`, kept in sync by a test). The game unlock itself is checked on the device, so a determined person could bypass it; the packs cannot be taken without a valid key.

### One-time setup

1. **Lemon Squeezy:** create an account and store (selling under Washington Technologies works), connect payouts, and create:
   - one product **Ministry Showdown** at $39.99, and
   - **Mega Pack** at $49.99 and **Complete Edition** at $79.99, and
   - one product per pack at $9.99 (Bible Characters, Kingdom Hall and Meetings, Creation, Christian Ministry, Life of Jesus, Bible Accounts, Little Ones, Family Life, Bible Places, The Paradise Hope).

   On each product: turn on **Generate license keys**, set the activation limit (3 is a good default: the TV laptop, a phone and a spare), keep license length **unlimited**, and set the confirmation button link to `https://ministry-showdown.netlify.app/#/store`.
2. **Netlify environment variables** (Site configuration → Environment variables), then redeploy:
   - `LS_STORE_ID`: the store's numeric ID (Lemon Squeezy → Settings → Stores).
   - `LICENSE_SIGNING_SECRET`: a random string of at least 32 characters (for example the output of `openssl rand -hex 32`). Keep it secret; changing it signs everyone out.
   - `LS_CATALOG`: JSON mapping each entitlement to its product ID, checkout link and displayed price:
     ```json
     {
       "game": { "productId": 111111, "checkoutUrl": "https://YOURSTORE.lemonsqueezy.com/buy/…", "price": "$39.99" },
       "bible-characters": { "productId": 222222, "checkoutUrl": "https://YOURSTORE.lemonsqueezy.com/buy/…", "price": "$9.99" }
     }
     ```
     Bundle IDs: `mega-pack`, `complete`. Pack IDs: `bible-characters`, `kingdom-hall`, `creation`, `ministry`, `life-of-jesus`, `bible-accounts`, `little-ones`, `family-life`, `bible-places`, `paradise-hope`.

   - `OWNER_KEY` (optional): your personal master key, at least 24 characters. Entering it on the Store screen unlocks the full game and every pack on that device, with no purchase and no activation limit. It works even before the Lemon Squeezy variables exist (only `LICENSE_SIGNING_SECRET` is required). Changing it signs out every device that used the old one.

   Until the Lemon Squeezy variables are set, the app shows **Store opening soon** and activation politely reports that the store isn't open; the demo still works.
3. **Test mode first:** Lemon Squeezy test mode products issue test keys that work with the same API. Use test products in `LS_CATALOG`, buy with a test card, activate, then switch the catalog to the live products.

### Developing the store locally

`npm run dev` serves only the app, so `/api/*` isn't available and the store shows "opening soon". To run the function too, use the Netlify CLI with the variables in a local `.env` file (never commit it):

```bash
npx netlify dev
```

The payment provider is isolated in `server/licensing.ts` (`ProviderClient`), so moving from Lemon Squeezy to another provider (for example Stripe Managed Payments) means writing one new client, not touching the app.
