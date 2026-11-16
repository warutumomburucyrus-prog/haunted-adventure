# Implementation Plan: Fear Meter

## Overview

The fear meter is added to `game.js` in small steps. The existing command logic stays as written, including the developer's hand edits (synonyms, `examine`, `move rug`, `help`, the `>>` echo and the typed-text prompt). The old `processCommand` is renamed `runCommand`, and a new `processCommand` wraps it to add fear, threshold lines, game over and restart. All fear logic is pure and never touches the page. Only `handleSubmit`, `init` and the new `updateStatusBar` use the page.

The language is plain JavaScript, with short beginner-friendly comments. Per the project rules, no syntax checks are run and no tools are installed. The developer tests in the browser. Optional tests go in a separate `tests.html` that loads `game.js` and fast-check from a script tag.

Before each task, read the current `game.js`, `index.html` and `style.css`, and keep any hand edits.

## Tasks

- [x] 1. Add the fear constants
  - [x] 1.1 Add the Fear_Constants block at the very top of `game.js`
    - Place the block above `INITIAL_STATE`, because `INITIAL_STATE` will use `FEAR_START`.
    - Add `FEAR_START`, `FEAR_MAX`, `FEAR_COST_NORMAL`, `FEAR_COST_CELLAR`, `FEAR_CELLAR_ENTRY` and `FEAR_THRESHOLDS` with the values from the design.
    - Add `THRESHOLD_LINES` (same order as `FEAR_THRESHOLDS`), `GAME_OVER_LINES` and `GAME_OVER_REMINDER`. Keep the text short, quiet, cold and not gory.
    - Add a short comment on each constant explaining what it does.
    - _Requirements: 2.1, 2.2, 6.7, 7.2, 7.3_

- [x] 2. Add fear fields to the game state
  - [x] 2.1 Add `fear`, `shownThresholds` and `gameOver` to `INITIAL_STATE`
    - Set `fear: FEAR_START`, `shownThresholds: []` and `gameOver: false`.
    - Leave the `rooms` data and every other field as it is.
    - _Requirements: 1.1, 1.2, 6.6, 6.8, 7.1_

- [x] 3. Prepare the existing command logic for wrapping
  - [x] 3.1 Mark unknown results in `handleUnknown`
    - Add `unknown: true` to the object `handleUnknown` returns. The text and state stay the same.
    - _Requirements: 3.4, 9.4_

  - [x] 3.2 Rename the current `processCommand` to `runCommand`
    - Change only the function name and its comment. Do not change its body or the order of its checks.
    - Update the comment to say the new `processCommand` wraps it. The call in `handleSubmit` stays as is for now and still works until task 5.3 adds the new function.
    - _Requirements: 9.1, 9.2, 9.3, 9.6_

- [x] 4. Checkpoint - Check the existing game still runs
  - Ensure the page still loads and the old commands still work in the browser, ask the user if questions arise.

- [x] 5. Add the fear logic
  - [x] 5.1 Write `applyFear(oldState, newState)`
    - Pick the cost from the room before the command: `FEAR_COST_CELLAR` if `oldState.currentRoomId` is `"cellar"`, else `FEAR_COST_NORMAL`.
    - Add `FEAR_CELLAR_ENTRY` when the old room was not the cellar and the new room is the cellar.
    - Clamp the result with `Math.min(FEAR_MAX, ...)` and return a new state with the new `fear`. Do not change the state in place.
    - Refused commands keep the same room, so they get the cost and no entry bonus.
    - _Requirements: 1.3, 1.4, 1.5, 3.1, 3.2, 3.5, 3.6, 4.1, 4.2, 4.3_

  - [x] 5.2 Write `getThresholdLines(oldFear, newState)`
    - Loop over `FEAR_THRESHOLDS` in order. A threshold counts when `oldFear` is below it, `newState.fear` is at or above it, and it is not in `newState.shownThresholds`.
    - Return `{ shownThresholds, lines }` with the matching `THRESHOLD_LINES` entries in ascending order, and the updated list of shown thresholds.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 5.3 Write the new `processCommand(state, rawInput)` wrapper
    - Normalize the input with `normalizeCommand`.
    - `restart`: return `INITIAL_STATE` with lines `[...INTRO, "\u00A0", ...handleLook(INITIAL_STATE).lines]`. This works in any state and costs no fear.
    - Empty input: return the same state and no lines, even after game over.
    - When `state.gameOver` is true: return the same state and one line, `GAME_OVER_REMINDER`.
    - Otherwise call `runCommand`. If the result has `unknown` or the command is `help`, return the result unchanged.
    - Otherwise call `applyFear`, then `getThresholdLines`, and join the lines in this order: the command reply, the threshold lines, then (if fear equals `FEAR_MAX`) `gameOver: true` and `GAME_OVER_LINES`.
    - Do not read or write the page (no `document`). Add short comments for each step.
    - _Requirements: 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.4, 8.5, 8.6, 8.7, 9.1, 9.2, 9.3, 9.4, 9.6_

  - [ ]* 5.4 Create `tests.html` and write a property test for fear validity
    - Create `tests.html` that loads `game.js` and fast-check from a script tag, and prints pass or fail in the page. No Node.js is needed.
    - Add a helper that runs a list of commands from `INITIAL_STATE` through `processCommand`.
    - **Property 1: Fear stays valid and matches game over**
    - **Validates: Requirements 1.1, 1.3, 1.4, 7.1**

  - [ ]* 5.5 Write a property test for fear cost
    - **Property 2: Fear cost follows the room before the command**
    - Build crafted states directly where needed (for example the cellar, or the trapdoor open with and without the lamp).
    - **Validates: Requirements 3.1, 3.2, 3.5, 3.6, 4.1, 4.2, 4.3**

  - [ ]* 5.6 Write a property test for free commands
    - **Property 3: Free commands leave fear unchanged**
    - **Validates: Requirements 3.3, 3.4, 9.4**

  - [ ]* 5.7 Write a property test for thresholds
    - **Property 4: Thresholds are shown once, in order**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.4**

  - [ ]* 5.8 Write a property test for the game over lock
    - **Property 5: Game over locks every command except restart**
    - **Validates: Requirements 7.5, 7.6**

  - [ ]* 5.9 Write a property test for restart
    - **Property 6: Restart gives a fresh game**
    - **Validates: Requirements 8.1, 8.4, 8.5, 8.6, 8.7**

  - [ ]* 5.10 Write a property test for preserved behavior
    - **Property 8: Existing behavior is preserved**
    - **Validates: Requirements 9.1, 9.2**

- [x] 6. Show fear in the status bar
  - [x] 6.1 Write `getStatusText(state)`
    - Return `"<Room name> | Fear: <number>"`, for example `Cellar | Fear: 12`, using `state.rooms[state.currentRoomId].name` and `state.fear`.
    - Keep it pure, with no page access.
    - _Requirements: 5.1_

  - [x] 6.2 Add `updateStatusBar(state)` and call it from `handleSubmit` and `init`
    - `updateStatusBar` finds `#status-bar` and sets its text to `getStatusText(state)`. If the element is missing, it does nothing.
    - In `handleSubmit`, call it right after `gameState = result.state;`. Leave the echo, blank lines, clearing, focus and scrolling as they are.
    - In `init`, call it right after `gameState = INITIAL_STATE;` so the bar shows `Hallway | Fear: 0`.
    - Leave `index.html` and `style.css` unchanged. The existing "HAUNTED ADVENTURE" text stays as the first-paint placeholder.
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.3, 9.5_

  - [ ]* 6.3 Write a property test for status text
    - **Property 7: Status text shows room and fear**
    - **Validates: Requirements 5.1**

- [x] 7. Final checkpoint - Ensure everything works
  - Ensure the game works in the browser and any optional tests in `tests.html` pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP.
- Each task references specific requirements for traceability.
- Do each task as one small change and explain what it does.
- The constants block must stay above `INITIAL_STATE` so `FEAR_START` is defined when it is used.
- Do not run syntax checks or install Node.js. The developer tests in the browser.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.2"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2"] },
    { "id": 6, "tasks": ["5.3"] },
    { "id": 7, "tasks": ["5.4", "6.1"] },
    { "id": 8, "tasks": ["5.5", "6.2"] },
    { "id": 9, "tasks": ["5.6"] },
    { "id": 10, "tasks": ["5.7"] },
    { "id": 11, "tasks": ["5.8"] },
    { "id": 12, "tasks": ["5.9"] },
    { "id": 13, "tasks": ["5.10"] },
    { "id": 14, "tasks": ["6.3"] }
  ]
}
```
