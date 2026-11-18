# Implementation Plan: Lying Narrator

## Overview

All changes are in game.js. index.html and style.css stay as they are. First add the `applyLies` function and connect it to the code that shows room text. With no lies in the room data yet, the game behaves exactly as before. Then add the four lies to the room data, one at a time. Each task is one small change with a short comment, and the developer tests it in the browser. No automated tests, syntax checks or tool installs are part of this plan. Read the current game.js before each task and keep the developer's hand edits.

## Tasks

- [ ] 1. Add the lie engine and connect it to room text
  - [ ] 1.1 Add the `applyLies` function to game.js
    - Place it just above `handleLook`, with a short beginner-friendly comment
    - It takes `(room, text, fear, carriedItems)` and returns a string. It never receives or returns a state
    - Return the text unchanged if `room.lies` is not an array
    - Skip any lie with a missing or invalid field, a `minFear` above the current fear, or an `unlessCarried` item that is carried
    - When several active lies replace the same sentence, keep the one with the highest `minFear`
    - Replace each true sentence using `split(...).join(...)`, so a sentence that is not found changes nothing
    - Explain to the developer what the function does and why it cannot change the game state
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.4, 2.5, 3.1, 3.5_

  - [ ] 1.2 Use `applyLies` in `handleLook`
    - Wrap the room description and each item line with `applyLies`, passing `state.fear` and `state.carriedItems`
    - Keep the existing fallback line "There is a ... here." for items with no `ITEM_TEXT` entry
    - Leave `handleInventory`, `handleExamine`, the action handlers, `getThresholdLines`, `getStatusText`, `INTRO`, `ESCAPE_LINES` and `GAME_OVER_LINES` untouched
    - Explain that `handleLook` runs before `applyFear`, so it sees the Fear from before the command's cost
    - _Requirements: 2.1, 2.3, 2.7, 4.1, 4.2, 4.5, 4.6, 4.7, 4.8, 9.1, 9.5_

  - [ ] 1.3 Use `applyLies` on the arrival text in `handleGo`
    - Wrap the arrival text with `applyLies(nextRoom, arrival, state.fear, state.carriedItems)` before it is added to `lines`
    - Leave the movement, the dark-room check and the blocked messages unchanged
    - The room description shown after arrival already goes through `handleLook`, so it needs no further change
    - _Requirements: 2.2, 3.2, 5.5, 6.6, 7.5, 7.6, 9.1, 9.3_

- [ ] 2. Checkpoint - Check the engine in the browser
  - Ask the developer to reload the page and play a few commands. All room text should read exactly as before, because no room has lies yet. Ask the user if questions arise.

- [ ] 3. Add the lies to the room data
  - [ ] 3.1 Add the hallway lie
    - Add a `lies` list to the `hallway` room in `INITIAL_STATE`, with a comment saying `replaces` must match the room text exactly
    - One lie: `minFear: 50`, `replaces: "behind you the front door waits, silent and shut."`, `text: "behind you the front door stands open to the night."`
    - Explain that "go south" still gives the locked-door message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 3.2 Add the library lie
    - Add a `lies` list to the `library` room, with the same kind of comment
    - One lie: `minFear: 50`, `replaces: "The only light comes from the way you came in."`, `text: "The way back is bricked up. Only bare wall remains."`
    - Explain that "go south" still leads to the hallway
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 3.3 Add the cellar steps lie
    - Add a `lies` list to the `cellar` room, with the same kind of comment
    - One lie: `minFear: 50`, `replaces: "the steps behind you lead back up."`, `text: "the steps behind you have collapsed."`
    - Explain that "go up" still leads to the library
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 3.4 Add the cellar key lie
    - Add a second lie to the cellar `lies` list
    - `minFear: 75`, `replaces` is the full text of `ITEM_TEXT.key` ("In the hollow, an old iron key lies in the dust, dull and cold, as if it has waited a long time."), `text: "The key is already in your hand, cold against your palm."`, `unlessCarried: "key"`
    - Add a comment saying the `replaces` text is a copy of `ITEM_TEXT.key`, because `ITEM_TEXT` is defined after `INITIAL_STATE`, and both must be edited together
    - Explain that the inventory does not list the key and "take key" still works
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ] 4. Final checkpoint - Play through the lies in the browser
  - Ask the developer to follow the manual browser checks in design.md (low Fear, hallway, library, cellar steps, cellar key, truthful text, restart). Ask the user if questions arise.

## Notes

- This plan has no test tasks. The project rules say the developer tests in the browser, and no tests or syntax checks are written or run.
- Each task changes one small thing in game.js. Explain it briefly after making it.
- Each task references requirements for traceability. Requirements 3.x, 4.x and 9.x are kept true by design: `applyLies` returns text only and is called only from `handleLook` and `handleGo`.
- Every leaf task edits game.js, so each is in its own wave.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2"] },
    { "id": 5, "tasks": ["3.3"] },
    { "id": 6, "tasks": ["3.4"] }
  ]
}
```
