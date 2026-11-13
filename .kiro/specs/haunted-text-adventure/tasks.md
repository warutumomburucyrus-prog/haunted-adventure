# Implementation Plan: Haunted Text Adventure

## Overview

This plan builds the foundational Haunted Adventure game as three plain files — `index.html`, `style.css`, and `game.js` — that run by opening `index.html` in a browser. There is no build step, no framework, and no external resource.

The work is ordered so that each small step leaves the game in a working state, and a beginner can make one change at a time and immediately see what it does. After the three files are in place, a final manual checkpoint walks through every command in the browser to confirm the game behaves as specified.

Per the user's instruction, this plan deliberately **excludes** automated tests, unit tests, property-based tests, and the fast-check library. All verification is done by simple manual checks in the browser.

## Tasks

- [x] 1. Build the HTML page (index.html)
  - [x] 1.1 Create `index.html` with the Game_Page structure
    - Add a scrollable `#output` area (the Output_Display) where text replies appear.
    - Add a `<form>` wrapping a text `#command-input` field with `maxlength="100"` and `autofocus` (the Command_Input).
    - Link `style.css` and `game.js` with relative paths only — no external URLs.
    - _Requirements: 3.1, 10.1, 10.2_
    - Manual check: open `index.html` in a browser — you should see a text field on the page.

- [x] 2. Build the dark presentation (style.css)
  - [x] 2.1 Create `style.css` for the haunted dark look
    - Give `html`/`body` a dark background that covers the full viewport (`min-height: 100vh`).
    - Set all text to a light color that is readable against the dark background.
    - Style `#output` with a monospace font, left-aligned text, growing with content and scrolling when it overflows.
    - Style `#command-input` with light text on a dark field and a visible caret.
    - Use no external fonts, images, or other resources.
    - _Requirements: 1.1, 1.2, 10.2_
    - Manual check: reload the page — the dark background covers the whole screen and the text/input are visible.

- [x] 3. Build the Game_Engine (game.js) — one small piece at a time
  - [x] 3.1 Add the game state
    - Define `INITIAL_STATE` with `currentRoomId: "hallway"`, `carriedItems: []`, and a `rooms.hallway` object (name, description, `items: ["lamp"]`).
    - Add a `let gameState` variable to hold the current state.
    - _Requirements: 2.1, 2.2, 2.3, 9.1, 9.2_
  - [x] 3.2 Add `normalizeCommand(rawInput)`
    - Return `rawInput.trim().toLowerCase()` so commands match regardless of case and surrounding whitespace.
    - _Requirements: 3.3_
  - [x] 3.3 Add `renderOutput(lines)`
    - Append each line in `lines` to `#output` as a new element (do nothing for an empty array).
    - _Requirements: 4.1 (rendering path)_
  - [x] 3.4 Add the first `processCommand(state, rawInput)` and `handleUnknown`
    - Normalize the input; if it is empty/whitespace-only, return `{ state, lines: [] }` (no message, no change).
    - Otherwise return `handleUnknown(state)`, which returns a "not recognized" line and the same state reference (state unchanged).
    - _Requirements: 3.4, 8.1, 8.2, 9.4_
  - [x] 3.5 Add `handleSubmit(event)`
    - Prevent the form's default submit and read the text from `#command-input`.
    - Call `processCommand(gameState, text)`, update `gameState`, call `renderOutput(lines)`, then clear and focus the input.
    - _Requirements: 3.2_
  - [x] 3.6 Add `init()` and run it on `DOMContentLoaded`
    - Set `gameState = INITIAL_STATE`, display the Hallway description in `#output`, wire the form's `submit` event to `handleSubmit`, and focus the input.
    - _Requirements: 2.4_
    - Manual check: reload the page — the Hallway description appears automatically; typing nonsense shows "not recognized" and clears the input; typing nothing shows no message.
  - [x] 3.7 Add `handleLook` and wire `"look"`
    - Return the current room's description plus a mention of every item present in that room.
    - Add the `"look"` case to `processCommand` dispatch.
    - _Requirements: 4.1_
    - Manual check: type `look` — the Hallway description and the lamp are shown.
  - [x] 3.8 Add `handleGoNorth` and wire `"go north"`
    - Return a line stating the player cannot move north, and return the same state (room unchanged).
    - Add the `"go north"` case to `processCommand` dispatch.
    - _Requirements: 5.1, 5.2_
    - Manual check: type `go north` — a cannot-move message appears and the room stays the Hallway.
  - [x] 3.9 Add `handleInventory` and wire `"inventory"`
    - If `carriedItems` is non-empty, output the name of every carried item; otherwise output a "carries nothing" line. State unchanged.
    - Add the `"inventory"` case to `processCommand` dispatch.
    - _Requirements: 7.1, 7.2, 9.3_
    - Manual check: type `inventory` — it says you carry nothing (before taking the lamp).
  - [x] 3.10 Add `handleTakeLamp` and wire `"take lamp"`
    - If the lamp is in the current room's `items`, remove it from the room, add it to `carriedItems`, and return a "taken" line.
    - If the lamp is already in `carriedItems`, return an "already carries the lamp" line and leave state unchanged.
    - Add the `"take lamp"` case to `processCommand` dispatch.
    - _Requirements: 6.1, 6.2, 9.3_
    - Manual check: type `take lamp` (a "taken" message), then `inventory` (lamp listed), then `take lamp` again ("already carries").

- [x] 4. Checkpoint - manually verify the whole game in the browser
  - Reload the page and confirm the Hallway description appears (Requirement 2.4).
  - Type `look` and confirm the Hallway description and the lamp are shown (Requirement 4.1).
  - Type `go north` and confirm a cannot-move message with the room unchanged (Requirements 5.1, 5.2).
  - Type `take lamp`, then `inventory`, and confirm the lamp is listed (Requirements 6.1, 7.1).
  - Type `take lamp` again and confirm an "already carries" message (Requirement 6.2).
  - Restart the page, then type `inventory` with no items and confirm "carries nothing" (Requirement 7.2).
  - Type nonsense like `fly` and confirm a "not recognized" message with state unchanged (Requirements 8.1, 8.2).
  - Confirm the input clears after each command and that the page uses no external resources (Requirements 3.2, 10.2).
  - Ensure all manual checks pass; ask the user if questions arise.

## Notes

- Tasks are ordered so each small step keeps the game in a working state; do them in order.
- Each coding task includes a short manual check so a beginner can see what the change does in the browser.
- This plan intentionally excludes automated, unit, and property-based tests, and the fast-check library, per the user's instruction; all verification is manual.
- Each task references specific requirements for traceability.
- The final checkpoint confirms every command behaves as the requirements specify.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["3.2"] },
    { "id": 2, "tasks": ["3.3"] },
    { "id": 3, "tasks": ["3.4"] },
    { "id": 4, "tasks": ["3.5"] },
    { "id": 5, "tasks": ["3.6"] },
    { "id": 6, "tasks": ["3.7"] },
    { "id": 7, "tasks": ["3.8"] },
    { "id": 8, "tasks": ["3.9"] },
    { "id": 9, "tasks": ["3.10"] }
  ]
}
```
