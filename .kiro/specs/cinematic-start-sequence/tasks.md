# Implementation Plan: Cinematic Start Sequence

## Overview

The plan adds the new loading screen and storm cue next to the old boot screen, switches the page over to the new code in one small step, and only then deletes the old boot code. The game keeps working after every task. All code is plain HTML, CSS and JavaScript with short comments. Read the current game.js, index.html and style.css before each task and keep the developer's own edits. Do not touch `processCommand`, `runCommand`, `INITIAL_STATE`, fear, hints or the lying narrator. No tests, syntax checks or tool installs. The developer checks the result in the browser.

## Tasks

- [x] 1. Add the start sequence constants
  - [x] 1.1 Add the "Start sequence settings" block to game.js
    - Put it with the other settings at the top, before any function. Keep `SOUND_ENABLED`, `SOUND_VOLUME`, `SOUND_MIN_GAP_MS` and `SOUND_STORAGE_KEY` as they are. Leave `BOOT_TOTAL_MS` for now, because the old boot code still uses it.
    - Timing constants: `LOADING_DOT_MS` 400, `LOADING_PROMPT_DELAY_MS` 1500, `STORM_CUE_MS` 5000, `LOADING_SILENT_MS` 2000, `LOADING_AUTOSTART_MS` 15000, `CUE_SKIP_GUARD_MS` 800, `CUE_FADE_OUT_MS` 200, `CUE_SKIP_RAIN_FADE_MS` 1500.
    - Word size constants: `LOADING_WORD_VW` 8, `LOADING_WORD_MIN_PX` 32, `LOADING_WORD_MAX_PX` 72.
    - Storm timing constants: `STORM_RAIN_FADE_IN_S` 1.5, `STORM_RAIN_FADE_OUT_S` 6, `STORM_DISTANT_THUNDER_S` 0.8, `STORM_CLOSE_THUNDER_S` 2.2, `STORM_DOOR_SLAM_S` 3.4, `STORM_LOCK_CLICK_S` 4.0, `STORM_LOCK_GAP_MS` 120.
    - Loudness constants: `STORM_PEAK_MAX` 0.6, `CLOSE_THUNDER_FACTOR` 0.8, `DISTANT_THUNDER_FACTOR` 0.4, `STORM_RAIN_FACTOR` 0.5, `STORM_SLAM_FACTOR` 1, `STORM_CLICK_FACTOR` 0.8.
    - Sound shape constants: `STORM_RAIN_LOW_HZ` 500, `STORM_RAIN_HIGH_HZ` 5000, `STORM_DISTANT_CUTOFF_HZ` 450, `STORM_CLOSE_CUTOFF_HZ` 800, `STORM_DISTANT_TAIL_S` 2.0, `STORM_CLOSE_TAIL_S` 2.6, `STORM_THUD_START_HZ` 150, `STORM_THUD_END_HZ` 70, `STORM_SLAM_BAND_LOW_HZ` 300, `STORM_SLAM_BAND_HIGH_HZ` 1500, `STORM_THUD_S` 0.4, `STORM_BURST_S` 0.08, `STORM_CLICK_S` 0.015, `STORM_CLICK_HZ` 1800, `STORM_NOISE_BUFFER_S` 3.
    - Add a short comment on each group saying what it tunes.
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Add the loading screen markup and styles (hidden for now)
  - [x] 2.1 Wrap `#output` and add the loading screen in index.html
    - Wrap the existing `#output` element in a new `<div id="output-wrap">`. Do not change `#output` or its contents.
    - Put `#loading-screen` inside the wrapper, before `#output`. It holds `#loading-title` (with `#loading-word` showing LOADING and an empty `#loading-dots`), `#loading-prompt` with the text "PRESS ANY KEY OR TAP TO ENTER" and `#loading-hint` with the text "Press Enter or tap to skip typed text.". Give the prompt and hint the class `loading-hidden`.
    - Do not add `class="starting"` to `<body>` yet. The old boot screen must keep working.
    - _Requirements: 2.1, 2.4, 2.6, 2.7, 2.10, 2.13_

  - [x] 2.2 Add the wrapper and loading screen rules to style.css
    - Add `#output-wrap` (`position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column`). Make sure `#output` still fills it and still scrolls, so the page looks the same as before.
    - Add `#loading-screen` as `display: none` with absolute `top/right/bottom/left: 0` and a `z-index`. Add `body.starting #loading-screen` (flex column, centered both ways, black background, padding) and `body.starting #output { visibility: hidden; }`.
    - Add `#loading-title` (monospace, green, `white-space: nowrap`), `#loading-dots` (inline-block, `width: 3ch`, left aligned), `#loading-prompt` (18 px green, blinking with a `blink-prompt` keyframes rule), `#loading-hint` (smaller and dim), and `.loading-hidden { visibility: hidden; }`.
    - Add `@media (prefers-reduced-motion: reduce)` turning off the prompt blink. Inside the existing `max-width: 600px` media query make the prompt and hint fonts smaller, so the prompt fits at 320 px.
    - Do not set the `#loading-word` font size here. JavaScript sets it.
    - Leave the old `.boot-line` rule for now.
    - _Requirements: 2.1, 2.2, 2.4, 2.8, 2.11, 2.12, 2.13, 7.1, 7.2_

- [x] 3. Add the loading screen logic (defined but not called yet)
  - [x] 3.1 Add the start variables and the loading functions to game.js
    - Add the variables `startPhase` (starts as `"loading"`), `entryTime`, `dotTimer`, `promptTimer`, `autostartTimer`, `handoffTimer`, `dotCount`. None of them go into `gameState`.
    - Add `updateDots()` (cycles 0 to 3 dots and writes them into `#loading-dots`) and `showLoadingPrompt()` (only when `startPhase === "loading"`, removes `loading-hidden` from the prompt and hint).
    - Add `startLoading()`: set the `#loading-word` font size with `clamp()` from the `LOADING_WORD_*` constants, start the dots (static `"..."` when reduced motion is on), and start the prompt timer. Do not start the autostart timer yet.
    - Do not call `startLoading()` from anywhere yet. The old boot still runs.
    - _Requirements: 1.3, 2.3, 2.5, 2.6, 2.7, 2.9, 7.1, 7.3, 7.4_

- [x] 4. Add the start input and hand-off logic (defined but not called yet)
  - [x] 4.1 Add `START_IGNORED_KEYS` and `handleStartInput(event)`
    - Reuse the old ignore list idea: modifiers, CapsLock and similar, Tab, Escape, and the F1 to F12 test.
    - Return without `preventDefault` or `stopPropagation` for: events inside `#sound-toggle`, keydown with Ctrl, Alt or Meta, `event.repeat`, ignored keys and F-keys. Do nothing when `startPhase === "done"`.
    - Otherwise consume the event with `preventDefault` and `stopPropagation`. Then by phase: `"loading"` calls `enterStart()`, `"cue"` calls `beginIntro(true)` only when `performance.now() - entryTime >= CUE_SKIP_GUARD_MS`, `"auto"` does nothing.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.11, 3.12, 4.5, 4.6, 4.7, 4.16, 6.4, 8.3, 8.4_

  - [x] 4.2 Add `enterStart()` and `beginIntro(skipped)` without sound
    - `enterStart()`: set `startPhase = "cue"` and `entryTime`, clear the prompt timer and the autostart timer, hide the prompt and hint (add `loading-hidden`), call `ensureAudio()`, and set `handoffTimer` to `STORM_CUE_MS` when `soundEnabled` or `LOADING_SILENT_MS` when not, both calling `beginIntro(false)`. Add a short comment that the storm call is added in a later task.
    - `beginIntro(skipped)`: return at once unless `startPhase` is `"cue"` or `"auto"`. Then set `"done"`, clear the four timers and the dot timer, remove `starting` from `body`, empty the command input and call `showTyped()`, call `showLines([...INTRO, "\u00A0", ...handleLook(INITIAL_STATE).lines, "\u00A0"])` exactly as `finishBoot` does, and focus the input.
    - _Requirements: 3.10, 3.11, 4.3, 4.4, 4.5, 4.8, 4.9, 4.10, 4.12_

- [x] 5. Switch the page to the new loading screen
  - [x] 5.1 Turn the loading screen on and replace the old boot calls
    - In index.html add `class="starting"` to `<body>`.
    - In `init()` replace the two `handleBootInput` listeners with `handleStartInput` (same capture phase and event types). Replace the final `startBoot()` call with `startLoading()`. Keep the `firstAction` listeners.
    - Change `bootPhase !== "done"` to `startPhase !== "done"` in `handleSubmit` and in the key-sound `input` listener in `init()`.
    - Leave the old boot functions and variables in the file, unused. The page now shows the black screen, LOADING and dots, then the blinking prompt, and a key press starts the intro after 2 seconds (no storm yet).
    - _Requirements: 2.1, 2.2, 2.11, 3.1, 4.8, 8.1, 8.2, 8.5, 8.6_

- [x] 6. Add the autostart
  - [x] 6.1 Add `startAuto()` and start the autostart timer
    - `startAuto()`: return unless `startPhase === "loading"`. Set `startPhase = "auto"`, clear the prompt timer, hide the prompt and hint, and set `handoffTimer` to `LOADING_SILENT_MS` calling `beginIntro(false)`. It must not call `ensureAudio`, `resume`, or any storm function, and must not change `soundEnabled`, the toggle text or the saved choice.
    - In `startLoading()` set `autostartTimer` with `LOADING_AUTOSTART_MS` calling `startAuto`.
    - In `enterStart()` make sure the autostart timer is cleared (it should already be from task 4.2).
    - _Requirements: 3.10, 4.12, 4.13, 4.14, 4.15, 4.16, 4.17_

- [x] 7. Add the storm sound helpers (defined but not called yet)
  - [x] 7.1 Add the storm variables, `stormPeak`, `makeNoise` and `trackSource`
    - Add the variables `stormMaster`, `stormSources` (empty array), `stormNoise`, `rainSource`, `rainGain`.
    - `stormPeak(factor)` returns `SOUND_VOLUME * STORM_PEAK_MAX * factor`. `makeNoise()` builds the shared noise buffer once (`STORM_NOISE_BUFFER_S`, random values from -1 to 1). `trackSource(source)` pushes into `stormSources`.
    - Place these after the existing sound engine functions. Do not use `playSound` or its gap rule, and do not read or write `gameState`.
    - _Requirements: 5.1, 5.2, 5.11, 5.12_

  - [x] 7.2 Add `startRain(t0)`
    - Looping noise source through a high-pass and a low-pass filter (`STORM_RAIN_LOW_HZ`, `STORM_RAIN_HIGH_HZ`), then `rainGain`, then straight to the speakers (not `stormMaster`). `rainGain` starts at 0 and ramps linearly to `stormPeak(STORM_RAIN_FACTOR)` over `STORM_RAIN_FADE_IN_S`. Keep the source in `rainSource`.
    - _Requirements: 5.3, 5.16_

  - [x] 7.3 Add `scheduleThunder(when, factor, cutoffHz, tailS)`
    - Noise through a low-pass filter (default Q), then a gain node after the filter: quick rise to `stormPeak(factor)`, long exponential fall (ramp to 0.0001, not 0). Connect to `stormMaster` and track the source.
    - _Requirements: 5.4, 5.5, 5.14, 5.15_

  - [x] 7.4 Add `scheduleDoorSlam(when)` and `scheduleLockClick(when)`
    - Door slam: a sine thud dropping from `STORM_THUD_START_HZ` to `STORM_THUD_END_HZ` over `STORM_THUD_S`, plus a noise burst of `STORM_BURST_S` through a band-pass. Compute the band-pass center as the square root of low times high and Q as center divided by (high minus low), from `STORM_SLAM_BAND_LOW_HZ` and `STORM_SLAM_BAND_HIGH_HZ`. Each part has its own gain node after its filter or oscillator, peaking at `stormPeak(STORM_SLAM_FACTOR)`. Connect to `stormMaster` and track the sources.
    - Lock click: a very short square wave (`STORM_CLICK_HZ`, `STORM_CLICK_S`) at `stormPeak(STORM_CLICK_FACTOR)`, connected to `stormMaster` and tracked.
    - _Requirements: 5.6, 5.7, 5.13, 5.16_

- [x] 8. Add the storm start, stop, skip and fade functions (defined but not called yet)
  - [x] 8.1 Add `startStormCue()`
    - Whole body in `try/catch`. Return if there is no `audioCtx` or `SOUND_VOLUME` is not a number from 0 to 1. Call `audioCtx.resume()` (ignore errors). Create `stormMaster` (gain 1, to the speakers) and call `makeNoise()`. Schedule on the audio clock: rain at 0, distant thunder (`STORM_DISTANT_THUNDER_S`, `DISTANT_THUNDER_FACTOR`, `STORM_DISTANT_CUTOFF_HZ`, `STORM_DISTANT_TAIL_S`), close thunder (`STORM_CLOSE_THUNDER_S`, `CLOSE_THUNDER_FACTOR`, `STORM_CLOSE_CUTOFF_HZ`, `STORM_CLOSE_TAIL_S`), door slam at `STORM_DOOR_SLAM_S`, lock clicks at `STORM_LOCK_CLICK_S` and `STORM_LOCK_GAP_MS / 1000` later. On any error call `stopStormCue(0)` inside its own `try` and return quietly.
    - _Requirements: 3.13, 5.1, 5.3, 5.4, 5.5, 5.6, 5.7, 5.10, 6.9, 6.10_

  - [x] 8.2 Add `stopStormCue(fadeMs)` and `fadeRain(seconds)`
    - `stopStormCue(fadeMs)`: do nothing when neither `stormMaster` nor `rainSource` exists. Otherwise ramp `stormMaster` and `rainGain` to 0 over `fadeMs` (or set 0 at once when `fadeMs` is 0), call `stop(now + fade)` on every tracked source and on `rainSource`, each in its own `try`, then reset all storm variables.
    - `fadeRain(seconds)`: do nothing without rain. Cancel the scheduled values on `rainGain`, hold its current value, ramp to 0 over `seconds`, call `rainSource.stop` at the end of the ramp, and reset the rain variables in the source's `onended`. Wrap in `try/catch`.
    - _Requirements: 5.8, 5.9, 6.1, 6.3, 6.7, 6.9, 6.10_

  - [x] 8.3 Add `skipStormCue()`
    - Ramp `stormMaster` to 0 over `CUE_FADE_OUT_MS` and stop every tracked effect source at the end of that fade, so events not yet played never start. Then call `fadeRain(CUE_SKIP_RAIN_FADE_MS / 1000)`. Do not use `CUE_FADE_OUT_MS` for the rain. Wrap in `try/catch`.
    - _Requirements: 4.5, 6.6, 6.7, 6.8, 6.9, 6.10_

- [x] 9. Wire the storm into the sequence and the sound switch
  - [x] 9.1 Call the storm from `enterStart` and `beginIntro`
    - In `enterStart()`, after `ensureAudio()`, call `startStormCue()` when `soundEnabled`.
    - In `beginIntro(skipped)`, after the phase is set to `"done"`, call `skipStormCue()` when skipped, or `fadeRain(STORM_RAIN_FADE_OUT_S)` when not. On the silent paths these do nothing because no storm exists.
    - _Requirements: 4.1, 4.2, 4.5, 4.8, 5.8, 6.7_

  - [x] 9.2 Stop the storm when sound turns off
    - In `setSound(on)`, add one line after the flag is set: `if (!soundEnabled) stopStormCue(0);`. This covers the Sound_Toggle and the mute commands. Turning sound on again must not restart the storm.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Remove the old boot code
  - [x] 10.1 Delete the old boot code from game.js
    - Remove `BOOT_TOTAL_MS`, the variables `bootPhase`, `bootLines`, `bootDivs`, `bootTimer`, `bootLineIndex`, `bootCharCount`, `bootDelay`, and the functions `startBoot`, `typeBootChar`, `skipBoot`, `finishBoot`, `handleBootInput` and `BOOT_IGNORED_KEYS`. Search the file for `boot` first, so nothing that is still used is removed. Keep the developer's other edits.
    - _Requirements: 1.5, 2.10, 9.4_

  - [x] 10.2 Delete the old boot styles from style.css
    - Remove the `.boot-line` rule and any other rule that only the old boot screen used. Search for `boot` first.
    - _Requirements: 2.10, 9.4_

- [~] 11. Checkpoint - Manual browser check
  - Open index.html in the browser and go through these checks. Ask the user if questions arise.
  - Loading screen: black screen over the output area only, green LOADING with moving dots, centered. The blinking prompt and the dim skip line appear after 1.5 seconds. Narrow the window to 320 px with a wrapping status bar: the status bar stays fully visible, the prompt fits, no sideways scroll.
  - Ignored keys: Tab, F5, F12, Escape, Ctrl+R, Shift and a held key do not start anything, and F5 and F12 still work in the browser. Enter or Space on the focused SOUND button flips sound and does not start the sequence.
  - Storm: press a letter with sound on. Check rain, distant thunder, louder close thunder, the door slam as the loudest sound, and two lock clicks. The loading screen stays for 5 seconds, then the intro types and the rain fades over about 6 seconds. The command input is empty.
  - Skip: a key during the first 0.8 seconds is ignored. A key after that starts the intro at once, the effects stop within about 0.2 seconds, and the rain fades over about 1.5 seconds.
  - Sound off: clicking SOUND during the storm stops everything and does not skip. Turning it on again does not restart the storm. Typing `mute` during the rain fade stops the rain. With sound off at entry there is no storm, and the intro starts after 2 seconds.
  - Autostart: touch nothing for 15 seconds. The prompt disappears, there is no sound, keys are ignored, and the intro starts once after 2 more seconds. The SOUND button text is unchanged.
  - After the intro: `look`, `hint`, `mute`, `sound on` and `restart` work as before, and `restart` shows no loading screen and no storm. Also check reduced motion (static dots, no blink) and a browser with audio blocked (no errors, intro still starts after 5 seconds).
  - _Requirements: 2.1 to 2.13, 3.1 to 3.13, 4.1 to 4.17, 5.1 to 5.16, 6.1 to 6.10, 7.1 to 7.4, 8.1 to 8.6, 9.1 to 9.6_

## Notes

- Every task changes one small thing. The old boot screen keeps working until task 5.1, and the old code is deleted only in task 10.
- Tasks 7 and 8 add storm code that nothing calls yet. Task 9 connects it.
- The design has no Correctness Properties section and the project rules say the developer tests in the browser, so there are no test tasks. Task 11 is the manual browser check.
- Tasks that edit game.js are in separate waves so they never write the same file at the same time.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2"] },
    { "id": 6, "tasks": ["5.1"] },
    { "id": 7, "tasks": ["6.1"] },
    { "id": 8, "tasks": ["7.1"] },
    { "id": 9, "tasks": ["7.2"] },
    { "id": 10, "tasks": ["7.3"] },
    { "id": 11, "tasks": ["7.4"] },
    { "id": 12, "tasks": ["8.1"] },
    { "id": 13, "tasks": ["8.2"] },
    { "id": 14, "tasks": ["8.3"] },
    { "id": 15, "tasks": ["9.1"] },
    { "id": 16, "tasks": ["9.2"] },
    { "id": 17, "tasks": ["10.1"] },
    { "id": 18, "tasks": ["10.2"] },
    { "id": 19, "tasks": ["11"] }
  ]
}
```
