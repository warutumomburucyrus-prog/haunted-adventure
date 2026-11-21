# Implementation Plan: Typewriter Effect

## Overview

This plan adds the typewriter effect as a presentation-only change. All new code goes in `game.js`, with one small rule in `style.css`. `index.html` and the game logic (`processCommand`, `runCommand`, `applyFear`, `applyHintFear`, `applyLies`) are not touched. Read the current `game.js`, `index.html` and `style.css` before each task and keep the developer's own edits. Keep the code plain JavaScript with short comments. Do not run syntax checks or install tools. The developer checks the result in the browser.

## Tasks

- [x] 1. Add the settings, the typing variables and the prompt style
  - [x] 1.1 Add the four named constants at the top of `game.js`
    - Declare `TYPEWRITER_ENABLED = true`, `TYPE_DELAY_MS = 6`, `PUNCTUATION_PAUSE_MS = 60` and `LINE_PAUSE_MS = 150` above every function
    - Give each a one-line comment with its purpose and unit
    - _Requirements: 6.1, 6.7_

  - [x] 1.2 Add the typing variables to `game.js`
    - Declare `typing`, `typingTimer`, `typingQueue`, `typingDiv` and `typingText` with a short comment each
    - They hold presentation facts only, never game facts
    - _Requirements: 7.1_

  - [x] 1.3 Add the hidden-prompt rule to `style.css`
    - Add `#command-form.typing { opacity: 0; }` with a short comment
    - Do not use `display: none` or `visibility: hidden`, so the layout space and focus stay
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1_

- [x] 2. Add the small helper functions
  - [x] 2.1 Move the scroll line of `renderOutput` into `scrollToPrompt()`
    - Create `scrollToPrompt()` holding the existing prompt-centering scroll code
    - Make `renderOutput` call it, so its behavior stays the same
    - _Requirements: 5.3, 6.2_

  - [x] 2.2 Add `typewriterActive()`
    - Return false if `TYPEWRITER_ENABLED` is false
    - Return false if `window.matchMedia` exists and `(prefers-reduced-motion: reduce)` matches, and read it on every call
    - Return false unless all three delay constants are finite numbers from 0 to 5000
    - _Requirements: 6.2, 6.3, 6.5, 6.6_

- [x] 3. Build the typing engine
  - [x] 3.1 Add `scrollWhileTyping()`
    - Set `#output` `scrollTop` to `Math.max(0, typingDiv.offsetTop + typingDiv.offsetHeight - output.clientHeight / 2)`
    - _Requirements: 5.2, 5.4, 5.5_

  - [x] 3.2 Add `endTyping()`
    - Set `typing = false` and remove the `typing` class from `#command-form`
    - Clear the input, redraw it with `showTyped()`, and focus it if it does not have focus
    - Call `scrollToPrompt()`
    - _Requirements: 3.11, 3.12, 3.13, 5.3, 7.4_

  - [x] 3.3 Add `typeNextLine()` and `typeChar(i)`
    - `typeNextLine()` takes the next line from `typingQueue`, adds a blank line at once with no delay, and calls `endTyping()` when the queue is empty
    - For a text line, insert an empty `div` before the form and start `typeChar(0)`
    - `typeChar(i)` shows `typingText.slice(0, i + 1)`, calls `scrollWhileTyping()`, then waits `PUNCTUATION_PAUSE_MS` after a non-final full stop, comma or question mark, `TYPE_DELAY_MS` after other characters, and `LINE_PAUSE_MS` before the next line
    - After the last character of the last line, call `endTyping()` with no extra pause
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 2.1, 2.4, 2.5, 7.4_

  - [x] 3.4 Add `startTyping(lines)` and `showLines(lines)`
    - `startTyping` sets `typing = true`, adds the `typing` class to `#command-form`, copies the lines into `typingQueue`, and calls `typeNextLine()`
    - `showLines` uses `renderOutput(lines)` when `typewriterActive()` is false or when no line has text, and otherwise calls `startTyping(lines)`
    - _Requirements: 1.1, 2.3, 3.1, 6.2, 6.3, 6.5_

  - [x] 3.5 Add `skipTyping()`
    - Cancel `typingTimer`, write the full text of the current line, add every queued line with `renderOutput`, then call `endTyping()`
    - Leave the game state unchanged
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.10_

- [x] 4. Wire the effect into the page
  - [x] 4.1 Change `handleSubmit(event)` in `game.js`
    - After `preventDefault()`, add `if (typing) { skipTyping(); return; }`
    - Keep the echo with `renderOutput`, update the status bar before the reply, then show the reply with `showLines`
    - Run the existing input clearing and focus lines only when no typing session started
    - _Requirements: 2.2, 2.3, 3.5, 3.14, 7.2, 7.3_

  - [x] 4.2 Change `init()` to type the intro
    - Replace the opening `renderOutput([...INTRO, ...])` call with `showLines` using the same lines, so the intro and the opening room are typed in order
    - Make the restart reply use `showLines` too, in the order `processCommand` returns the lines
    - _Requirements: 1.6, 1.7_

  - [x] 4.3 Add the event listeners in `init()`
    - Add the `keydown` listener: do nothing unless `typing`, never prevent when Ctrl, Alt or Meta is held, prevent and skip on Enter or Space, prevent only on single characters, Backspace, Delete and Tab, and leave every other key alone
    - Add the `input` listener that clears the input while `typing`
    - Add `mousedown` on `#output` that prevents default while `typing` (keeps focus), and `click` on `#output` that calls `skipTyping()` while `typing`
    - Keep the existing document click handler that refocuses the input
    - _Requirements: 3.3, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.13, 3.14, 4.5, 4.6, 4.7, 4.8, 4.9_

- [x] 5. Final checkpoint
  - Review that `processCommand`, `runCommand`, `applyFear`, `applyHintFear` and `applyLies` are unchanged, and ask the user if questions arise.
  - _Requirements: 7.1, 7.5_

## Notes

- No test tasks are included, as the project rules ask. The developer checks the effect by hand in the browser, using the checklist in the design document.
- Each task makes one small change and builds on the one before it. Nothing is left unconnected: the engine in task 3 is used by `showLines`, which task 4 calls.
- Each task references specific requirements for traceability.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["3.2"] },
    { "id": 6, "tasks": ["3.3"] },
    { "id": 7, "tasks": ["3.4"] },
    { "id": 8, "tasks": ["3.5"] },
    { "id": 9, "tasks": ["4.1"] },
    { "id": 10, "tasks": ["4.2"] },
    { "id": 11, "tasks": ["4.3"] },
    { "id": 12, "tasks": ["5"] }
  ]
}
```
