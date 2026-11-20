# Implementation Plan: Hint Command

## Overview

This plan adds the `hint` command in small steps. Every change is in `game.js`. `index.html` and `style.css` stay as they are. Each task is one small change with short comments in plain JavaScript. Read the current `game.js` before each task and keep the developer's own edits. No tests, syntax checks or tool installs are part of this plan. The developer tests in the browser.

Step 1 of the escape path is done only when the lamp is in the carried items. Entering the Library does not finish step 1.

## Tasks

- [x] 1. Add the hint constant and the new starting facts
  - Add `const HINT_FEAR_COST = 5;` with a short comment, next to the other fear constants at the top of `game.js`.
  - Add these fields to `INITIAL_STATE`, each with a short comment: `libraryEntered: false`, `cellarEntered: false`, `deskExamined: false`, `pageExamined: false`, `wallExamined: false`, `hintStep: 0`, `hintCount: 0`.
  - Restart already returns `INITIAL_STATE`, so these reset on restart.
  - _Requirements: 2.2, 5.1, 7.3_

- [x] 2. Record room entries in `handleGo`
  - When the player moves to `library`, return the new state with `libraryEntered: true`.
  - When the player moves to `cellar`, return the new state with `cellarEntered: true`.
  - Keep the reply text, the locked door message and the lying narrator arrival text exactly as they are.
  - _Requirements: 2.2, 2.6, 9.1, 9.3_

- [x] 3. Record examined things in `handleExamine`
  - In the branch that returns `room.details[thing]`, return a new state with `deskExamined: true` for the desk in the Library, `pageExamined: true` for the page in the Library, and `wallExamined: true` for the wall in the Cellar.
  - Keep the reply text unchanged. Only the returned state gains the flag.
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 9.1_

- [x] 4. Add the `HINT_TEXT` table
  - Add `HINT_TEXT` after `ITEM_DETAILS`, using the nine entries of three lines each from the design. Entry `HINT_TEXT[step - 1][level - 1]` is one line.
  - Level 1 is vague and level 3 names the object or place. No line contains the exact command to type.
  - Keep the tone quiet, cold and unsettling, without gore.
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Make `normalizeCommand` understand the hint words
  - Add `"hint": "hint"`, `"hints": "hint"` and `"help me": "hint"` to the existing `synonyms` list.
  - Do not change how `help` is handled.
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 6. Add the step helpers before `runCommand`
  - Add `isStepDone(state, step)` with a short comment. It uses only state facts: step 1 is done when the lamp is in `carriedItems`, step 2 when `libraryEntered`, step 3 when `deskExamined` and `pageExamined`, step 4 when `rooms.library.exits.down` exists, step 5 when `cellarEntered`, step 6 when `wallExamined`, step 7 when `rooms.cellar.stoneMoved`, step 8 when the key is in `carriedItems`.
  - Add `getCurrentStep(state)`. It returns the first step from 1 to 8 that is not done, or 9 when all are done.
  - Before wiring `handleHint` in task 7, check that the existing room data uses the names `stoneMoved` and `exits.down`. If it uses other names, use those names.
  - _Requirements: 2.1, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15_

- [x] 7. Add `handleHint` and connect it in `runCommand`
  - Add `handleHint(state)` with a short comment. It gets the current step, uses a count of 0 when the step differs from `hintStep`, and picks the level with `Math.min(count, 2) + 1`.
  - It returns a new state with `hintStep` set to the step and `hintCount` set to `Math.min(3, count + 1)`, one line from `HINT_TEXT`, and `hint: true`.
  - Do not pass the line through `applyLies`. Do not change the room, the carried items, the room data or `shownThresholds`.
  - In `runCommand`, add `if (command === "hint") { return handleHint(state); }` right after the `help` check.
  - _Requirements: 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 6.1, 6.2, 6.3_

- [x] 8. Charge the hint fear cost in `processCommand`
  - Add `applyHintFear(oldState, newState)` after `applyFear`. It sets fear to `Math.min(FEAR_MAX, oldState.fear + HINT_FEAR_COST)` and returns a new state.
  - In the fear cost step of `processCommand`, use `applyHintFear` when `result.hint` is true. Otherwise use `applyFear` as before.
  - Leave the threshold lines and game over steps unchanged so they also run for hints. Output order is the hint line, then threshold lines, then game over lines.
  - Leave the game over and escaped reminders unchanged, so a hint after an ending changes nothing.
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 7.1, 7.2, 9.2_

- [x] 9. Mention the hint command in the help text
  - Add one line to `handleHelp`: `"Stuck? Type hint."`
  - Keep `help` free of fear cost and of any `hintCount` change.
  - _Requirements: 8.1, 8.2_

- [x] 10. Checkpoint - Developer tries the game in the browser
  - Ask the developer to open the game in the browser and try these by hand: `hint`, `hints` and `help me`; repeating a hint on one step; a new step resetting to the vague line; the fear bar rising by 5; `help` showing the new line; `restart` resetting hints.
  - Ask the developer to confirm that the old commands, the fear meter, the lying narrator, the hidden key and the escape ending still work.
  - Do not run syntax checks or install tools. Ask the user if questions arise.
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

## Notes

- All tasks change only `game.js`, so each task runs in its own wave.
- The design has no Correctness Properties section and the developer wants no tests, so there are no test or property-based testing tasks.
- Tasks 1 to 3 only record facts. The player sees no change until tasks 5 to 9 are done.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2"] },
    { "id": 2, "tasks": ["3"] },
    { "id": 3, "tasks": ["4"] },
    { "id": 4, "tasks": ["5"] },
    { "id": 5, "tasks": ["6"] },
    { "id": 6, "tasks": ["7"] },
    { "id": 7, "tasks": ["8"] },
    { "id": 8, "tasks": ["9"] },
    { "id": 9, "tasks": ["10"] }
  ]
}
```
