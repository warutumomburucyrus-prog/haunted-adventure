# Haunted Adventure

> Resurrecting Zork-style text adventures: escape a haunted house where rising fear makes the narrator lie. Only your inventory tells the truth.

**Kiroween 2026 · Category: Resurrection · Built with Kiro**

▶ **Play it:** https://haunted-adventure.vercel.app
Works in any modern browser, and on phones. Turn the sound on for the full effect.

## The idea

The storm shut the door behind you, and something is walking upstairs. You must find the key and get out.

Every action raises your fear. As fear climbs, the narrator starts to describe the house falsely: a locked door "stands open", the way back is "bricked up". The game code keeps every fact. The narrator only changes description text, and never what is true. Replies to your actions, the inventory strip, the status bar and the hints never lie. As the torn page in the library says: *trust only what you can hold in your hands.*

## How to play

Type short commands at the `>>` prompt.

| Command | What it does |
|---|---|
| `look`, `examine <thing>` | Describe the room, or look closely at something |
| `go <direction>` | north, south, east, west, up, down |
| `take <item>`, `inventory` | Pick things up, list what you carry |
| `open`, `pull`, `fill lamp`, `light lamp`, `unlock door` | Use things |
| `hint` | A nudge for your current step (costs 5 fear) |
| `help`, `restart` | Reminders, or start over |
| `sound on`, `sound off`, `mute`, `unmute` | Control sound |

At 100 fear the Caretaker catches you. Enter, Space or a tap skips the typing.

<details>
<summary>Spoiler: walkthrough</summary>

Take the lamp. Go north. Read the page on the desk. Open the odd book and take the brass key. Go back south and east (the brass key opens the kitchen). Open the drawer, take the lighter and the rusty key. Go north (the rusty key opens the storeroom) and take the oil can. Fill the lamp, then light it. Return to the library, pull the rug aside and go down. Examine the wall, pull the crooked stone, take the iron key. Go back up and south, and unlock the front door.

</details>

## Features

- Five rooms, locked doors, a lamp puzzle (fill it, then light it) and hidden keys
- A fear meter from 0 to 100, with warnings at 25, 50 and 75, and a game over at 100
- A lying narrator: false description lines that appear at higher fear
- A 15-step hint system that gets clearer each time you ask
- Inventory strip with pixel-art icons drawn in code. The lamp shows empty, full or lit
- Typewriter text, a cinematic loading screen, and synthesized sound (typing ticks, key clicks, a storm with thunder, a slamming door and a lock click)
- Reduced-motion support, a mute control, and a pinned header on small screens

## How Kiro was used

- **Steering:** `.kiro/steering/game-rules.md` holds the story, the "game code owns every fact" rule, the fear rule, and the rule to keep my hand edits.
- **Specs** (requirements, design, then tasks), in `.kiro/specs/`: `haunted-text-adventure` (the first playable game), `fear-meter`, `lying-narrator`, `hint-command`, `lamp-puzzle-and-locked-rooms`, `typewriter-effect`, `sound-and-start-screen`, the cinematic start sequence, and the inventory strip. `retro-terminal-ui` has requirements only, because I built that look by hand.
- **Directly in chat, without a spec:** the hidden key and escape ending, the longer hint path, and some command-word fixes.
- **By hand:** the green terminal look, the underscore cursor, the prompt in the output, and fixes from friends' playtests.
- **Not used:** agent hooks and MCP servers.
- Each spec was reviewed before building, and `git diff` was used to check that Kiro kept my hand-built code.

## Built with

Plain HTML, CSS and JavaScript. No frameworks, no build step, no libraries, no image files and no audio files. Sound is synthesized with the Web Audio API, and the icons are 12 by 12 pixel grids drawn as SVG. Game logic is separate from presentation. Each command returns a new game state and never edits the old one.

## Run it locally

Download the files and open `index.html` in a browser. It works offline, and nothing needs installing.

## Testing

Tested by hand in the browser, by me and by friends. There are no automated tests.

## Known limits

- Sound starts after your first key press or tap, because browsers block audio before that.
- Progress is not saved. Reloading starts a new game.
- Developed mainly in Brave (Chromium) and on a phone. Other browsers should work but are less tested.

## License and credits

MIT, see `LICENSE`. Inspired by Zork and the Infocom text adventures. No Infocom text or assets are used. There are no third-party assets or libraries.