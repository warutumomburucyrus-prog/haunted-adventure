# Implementation Plan: Sound and Start Screen

## Overview

This plan adds synthesized sound and a green boot screen using plain HTML, CSS and JavaScript. Each sub-task is one small change. Read the current `game.js`, `index.html` and `style.css` before each change and keep the developer's own edits. Do not edit `processCommand`, `runCommand`, `INITIAL_STATE`, fear, hints or the lying narrator. Add short comments for a beginner. The design has no Correctness Properties section and the project rules say the developer tests in the browser, so this plan has no test tasks and no syntax-check runs.

## Tasks

- [x] 1. Add the sound toggle button and its style
  - [x] 1.1 Add the toggle button to `index.html`
    - Add `<button type="button" id="sound-toggle">SOUND: ON</button>` inside `#status-bar`, after `#status-info`
    - _Requirements: 7.1, 7.2, 7.8_

  - [x] 1.2 Style the toggle and boot lines in `style.css`
    - Add `align-items: center` to `#status-bar`
    - Add the `#sound-toggle` rules (monospace, border, 44px minimum width and height, focus outline) and the `.boot-line` green color rule
    - _Requirements: 4.3, 7.1, 7.8_

- [x] 2. Add the sound engine to `game.js`
  - [x] 2.1 Add sound constants and variables
    - Near the top, before any function: `SOUND_ENABLED` (true), `SOUND_VOLUME` (0.35), `SOUND_MIN_GAP_MS` (25), `SOUND_STORAGE_KEY` ("haunted-sound")
    - Add the variables `soundEnabled`, `audioCtx` (null), `lastSoundTime` (-Infinity), `lastInputLength` (0)
    - _Requirements: 1.1, 1.2, 1.3, 8.1_

  - [x] 2.2 Add `ensureAudio` and `playSound`
    - `ensureAudio` creates the context only when sound is on and none exists, using `AudioContext` or `webkitAudioContext`, inside try/catch
    - `playSound(wave, pitch, seconds, baseLoudness)` returns silently when sound is off, the volume is invalid, there is no context, or the gap is under `SOUND_MIN_GAP_MS`
    - It calls `resume()` when suspended, ignores errors, builds oscillator and gain with peak `SOUND_VOLUME * baseLoudness`, ramps the gain down, and stops the oscillator
    - Do not read `gameState` in the sound code
    - _Requirements: 1.4, 1.5, 1.6, 6.10, 9.1, 9.2, 9.3, 9.4, 9.5, 9.7, 10.3, 10.6_

  - [x] 2.3 Add the four sound wrappers
    - `playTick(char)` skips spaces, uses triangle 1500 Hz x random 0.9 to 1.1, 0.03 s, loudness 0.25 x random 0.8 to 1.2
    - `playKeyClick()` square 1200 Hz, 0.05 s, loudness 0.50
    - `playBackspaceClick()` square 800 Hz, 0.05 s, loudness 0.35
    - `playClack()` square 300 Hz, 0.09 s, loudness 0.80
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

- [x] 3. Add the remembered sound choice and toggle behavior
  - [x] 3.1 Add the sound choice functions
    - `loadSoundChoice()` reads localStorage in try/catch and returns true for "on", false for "off", otherwise `SOUND_ENABLED`
    - `saveSoundChoice()` writes "on" or "off" in try/catch
    - `updateSoundToggle()` sets the button text to `SOUND: ON` or `SOUND: OFF`
    - `setSound(on)` sets `soundEnabled`, saves, updates the toggle, and calls `ensureAudio()` when turning on
    - _Requirements: 7.2, 7.3, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 9.6_

  - [x] 3.2 Wire the toggle click and first gesture in `init()`
    - In `init()` set `soundEnabled = loadSoundChoice()` and call `updateSoundToggle()`
    - Add the toggle click handler: flip with `setSound(!soundEnabled)`, add no output lines, and call `stopPropagation()` when `event.detail === 0` so keyboard focus stays on the button
    - Add a one-time capture-phase `keydown` and `click` listener on `document` that calls `ensureAudio()` and removes itself
    - _Requirements: 7.4, 7.5, 7.8, 9.1, 9.5_

- [x] 4. Add the sound hooks to existing functions
  - [x] 4.1 Add the tick hook in `typeChar(i)`
    - After the line that updates the typing text, add `playTick(typingText.charAt(i));`
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 4.2 Add the typing click listener
    - At the end of `showTyped()` add `lastInputLength = input.value.length;` (use the real input variable name in `game.js`)
    - In `init()`, before the existing `showTyped` listeners, add an `input` listener that returns when `typing` is true or `bootPhase !== "done"`, then plays a key click when the length grew and a Backspace click when it shrank
    - Declare `let bootPhase = "done";` near the other variables for now, so this code works before the boot screen exists
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.7_

  - [x] 4.3 Add mute commands and the clack in `handleSubmit`
    - Add `getSoundCommand(text)` that trims, collapses whitespace, lowercases, and returns "off" for "sound off" and "mute", "on" for "sound on" and "unmute", otherwise null
    - After the echo line, when it returns a value, call `setSound`, show only `"Sound on."` or `"Sound off."`, and skip `processCommand` and the clack
    - Otherwise call `playClack()` just before `processCommand`. A submit that only skips the typewriter plays no clack
    - _Requirements: 3.3, 3.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 10.1, 10.2, 10.4_

- [x] 5. Checkpoint - Check sound in the browser
  - Ask the user to open `index.html` and check ticks, key clicks, the clack, `sound off`, `sound on` and the toggle. Ask the user if questions arise.

- [x] 6. Add the boot screen
  - [x] 6.1 Add boot lines and the typing functions
    - Add `BOOT_TOTAL_MS` (1800) with the other constants, plus `BOOT_LINES` building, `bootPhase`, `bootDivs`, `bootTimer`
    - Build the sound line from `soundEnabled`: `Sound is on. Type "sound off" to turn it off.` or `Sound is off. Type "sound on" to turn it on.`
    - Lines in order: `HAUNTED ADVENTURE`, `SYSTEM READY`, the sound line, `Press Enter or tap to skip the typing.`, `PRESS ANY KEY`
    - `startBoot()` sets `bootPhase = "typing"`, adds the `typing` class to the form to hide the prompt, creates one `div.boot-line` per line in the output area, and calls `skipBoot()` at once when Reduced_Motion is on
    - `typeBootChar()` adds one character per step with delay `BOOT_TOTAL_MS / total characters`
    - `skipBoot()` stops the timer, fills every div, and sets `bootPhase = "waiting"`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2_

  - [x] 6.2 Add `finishBoot` and the boot input listener
    - `finishBoot()` sets `bootPhase = "done"`, removes the `typing` class, calls the same `showLines([...INTRO, "\u00A0", ...handleLook(INITIAL_STATE).lines, "\u00A0"])` that `init()` used before, and refocuses the input
    - Add a capture-phase `keydown` and `click` listener on `document` that does nothing when `bootPhase === "done"`
    - It ignores events inside `#sound-toggle`, Ctrl, Alt or Meta keys, modifier-only keys, Tab, F1 to F12 and Escape, without calling `preventDefault` or `stopPropagation` for them
    - For any other event it calls `preventDefault()` and `stopPropagation()`, then calls `skipBoot()` when typing, or `ensureAudio()` and `finishBoot()` when waiting
    - _Requirements: 4.6, 4.9, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 5.9, 5.10, 5.11, 7.7, 9.1, 10.6_

  - [x] 6.3 Guard `handleSubmit` and start the boot screen from `init()`
    - Make the first line of `handleSubmit` `if (bootPhase !== "done") return;`
    - Change the declaration `let bootPhase = "done";` from task 4.2 to start as `"typing"`
    - In `init()` call `startBoot()` in place of the direct intro typing, and keep `restart` from calling it, so the boot screen shows once per page load
    - Leave `gameState` equal to `INITIAL_STATE` until the intro begins
    - _Requirements: 4.1, 4.9, 4.10, 5.7, 5.12, 10.4, 10.5_

- [x] 7. Final checkpoint - Check the whole feature in the browser
  - Ask the user to run the manual browser checklist in `design.md` under Testing Strategy. Ask the user if questions arise.

## Notes

- Make one small change at a time and explain what it does in plain words
- Do not run syntax checks or install tools. The developer tests in the browser
- Each task references specific requirements for traceability
- Checkpoints are for the developer to look at the page and report back

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["3.2"] },
    { "id": 6, "tasks": ["4.1"] },
    { "id": 7, "tasks": ["4.2"] },
    { "id": 8, "tasks": ["4.3"] },
    { "id": 9, "tasks": ["5"] },
    { "id": 10, "tasks": ["6.1"] },
    { "id": 11, "tasks": ["6.2"] },
    { "id": 12, "tasks": ["6.3"] },
    { "id": 13, "tasks": ["7"] }
  ]
}
```
