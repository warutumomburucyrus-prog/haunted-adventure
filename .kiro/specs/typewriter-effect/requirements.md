# Requirements Document

## Introduction

This feature adds a typewriter effect to the output area of the Haunted Adventure page. The intro, the game replies and the restart text are typed out one character at a time, one line after another. This is a presentation change only. The game state, fear, hints, the lying narrator and all game rules stay as they are. The timing values and the on/off switch are named constants at the top of game.js.

## Glossary

- **Output_Display**: The `#output` area of the page that shows the game text, with the prompt line as its last line.
- **Prompt_Line**: The `#command-form` element, which shows ">>", the typed text and the cursor.
- **Command_Input**: The text input element inside the Prompt_Line where the player types commands.
- **Visually_Hidden**: The state of an element that is not seen on screen because of the CSS property `visibility: hidden` or `opacity: 0`, while the element stays in the DOM, keeps its layout space and can keep keyboard focus. The CSS value `display: none` is not Visually_Hidden.
- **Skip_Request**: A player action during a Typing_Session that asks to show all remaining text at once: pressing Enter, pressing Space, or tapping or clicking anywhere on the Output_Display.
- **Typewriter**: The presentation code that shows text lines in the Output_Display one character at a time.
- **Typing_Session**: The period that starts when the Typewriter begins showing a list of lines and ends when the last character of the last line is shown.
- **Game_Text_Line**: A line produced by the game for display: an intro line, a reply line, a threshold line, an ending line or a restart line.
- **Blank_Line**: A Game_Text_Line that contains only a space or non-breaking space, used as a spacer.
- **Command_Echo**: The line made of ">>" followed by the command the player typed.
- **TYPE_DELAY_MS**: Constant in game.js. The number of milliseconds the Typewriter waits between two characters. Initial value 10.
- **PUNCTUATION_PAUSE_MS**: Constant in game.js. The number of milliseconds the Typewriter waits after a full stop, comma or question mark, instead of TYPE_DELAY_MS. Initial value 100.
- **LINE_PAUSE_MS**: Constant in game.js. The number of milliseconds the Typewriter waits after finishing one line before starting the next typed line. Initial value 150.
- **TYPEWRITER_ENABLED**: Constant in game.js. When false, the Typewriter is turned off.
- **Reduced_Motion_Setting**: The browser setting, read through the `prefers-reduced-motion: reduce` media query, that tells pages to avoid animation.
- **Status_Bar**: The `#status-bar` element that shows the room name and fear.

## Requirements

### Requirement 1: Type Text One Character at a Time

**User Story:** As a player, I want the game text typed out letter by letter, so that the house feels like it is speaking slowly to me.

#### Acceptance Criteria

1. WHEN the Typewriter is active and a list of Game_Text_Lines is shown, THE Typewriter SHALL add the characters of each non-blank line to the Output_Display one character at a time, in the original order of the characters, until every character of the line is displayed with none omitted, duplicated or reordered.
2. WHEN the Typewriter is active and a list of Game_Text_Lines is shown, THE Typewriter SHALL show the lines one after another in list order, starting each line only after the previous line is complete.
3. THE Typewriter SHALL wait TYPE_DELAY_MS milliseconds between two consecutive characters of the same line, except after a full stop, a comma or a question mark, which criterion 4 covers.
4. WHEN a character shown is a full stop, a comma or a question mark and it is not the last character of its line, THE Typewriter SHALL wait PUNCTUATION_PAUSE_MS milliseconds after that character instead of TYPE_DELAY_MS milliseconds.
5. WHEN a non-blank line is complete and another line follows, THE Typewriter SHALL wait LINE_PAUSE_MS milliseconds, and no other delay, before starting the next line.
6. WHEN the page loads, THE Typewriter SHALL type the intro lines followed by the opening room description, in that order.
7. WHEN the player types restart, THE Typewriter SHALL type the restart text returned by processCommand, in the order the lines are returned.
8. IF a line in the list is blank, THEN THE Typewriter SHALL add an empty line to the Output_Display immediately, without typing characters and without waiting TYPE_DELAY_MS, PUNCTUATION_PAUSE_MS or LINE_PAUSE_MS for that line.

### Requirement 2: Show Spacers and Commands at Once

**User Story:** As a player, I want spacer lines and my own command to appear instantly, so that waiting only happens for the story text.

#### Acceptance Criteria

1. WHEN a Blank_Line is shown, THE Output_Display SHALL show the Blank_Line in full within the same display update, with no per-character delay.
2. WHEN the player submits a command that is not empty and not only spaces, THE Output_Display SHALL show the Command_Echo in full within the same display update, with no per-character delay.
3. IF the player submits a command that is empty or only spaces, THEN THE Output_Display SHALL NOT add a Command_Echo and SHALL NOT start the Typewriter effect.
4. WHILE the Typewriter is typing a Game_Text_Line, THE Output_Display SHALL show each Blank_Line and Command_Echo in full without delay and in the order they were submitted.
5. THE Typewriter SHALL preserve the exact text of every Game_Text_Line, so that the final text on screen is character-for-character identical to the text shown with the effect off.

### Requirement 3: Block Commands While Typing

**User Story:** As a player, I want the game to ignore new commands while text is typing, so that my commands do not pile up or interrupt the story.

#### Acceptance Criteria

1. WHEN a Typing_Session starts, THE Prompt_Line SHALL become Visually_Hidden, and it SHALL stay Visually_Hidden until the Typing_Session ends.
2. WHILE a Typing_Session is running, THE Prompt_Line SHALL stay in the DOM with its layout space kept, and THE System SHALL NOT set the CSS value `display: none` on the Prompt_Line or on the Command_Input.
3. WHILE a Typing_Session is running, THE Command_Input SHALL keep keyboard focus, so that `document.activeElement` is the Command_Input and no blur event is fired on the Command_Input.
4. WHEN a Typing_Session starts while the Command_Input has focus, THE System SHALL keep that focus, so that the on-screen keyboard of a phone is not closed and reopened between a submitted command and the end of its Typing_Session.
5. WHILE a Typing_Session is running, THE System SHALL call processCommand 0 times, whatever keys the player presses.
6. WHILE a Typing_Session is running, WHEN a keydown event occurs with Ctrl, Alt or Meta held, THE System SHALL NOT call preventDefault on the event, whatever the value of event.key, so that browser shortcuts such as Ctrl+R, Ctrl+Shift+I and Alt+Left keep working. Shift alone is not a modifier for this criterion.
7. WHILE a Typing_Session is running, WHEN a keydown event occurs with none of Ctrl, Alt and Meta held and event.key is Enter or Space (" "), THE System SHALL call preventDefault on the event and treat the key as a Skip_Request as defined in Requirement 4.
8. WHILE a Typing_Session is running, WHEN a keydown event occurs with none of Ctrl, Alt and Meta held and event.key.length === 1 (other than Space), or event.key is Backspace, Delete or Tab, THE System SHALL call preventDefault on the event and SHALL NOT add or remove any character in the Command_Input because of that key.
9. WHILE a Typing_Session is running, WHEN a keydown event occurs for any key not covered by criteria 6, 7 and 8, including F1 to F12, Escape and the arrow keys, THE System SHALL NOT call preventDefault on the event, so that reloading with F5 and opening developer tools with F11 or F12 keep working.
10. WHILE a Typing_Session is running, THE System SHALL call processCommand 0 times and leave the game state unchanged because of any key press that is not a Skip_Request, including keys that criterion 9 lets through.
11. WHEN a Typing_Session ends, THE Prompt_Line SHALL become visible, with the Visually_Hidden state removed.
12. WHEN a Typing_Session ends, THE System SHALL keep keyboard focus in the Command_Input, and IF the Command_Input does not have focus at that moment, THEN THE System SHALL place keyboard focus in the Command_Input.
13. WHEN a Typing_Session ends, THE System SHALL leave the Command_Input empty (0 characters), removing any text that reached the Command_Input during the Typing_Session despite criteria 6 to 9, such as text from pasting, drag and drop, or an on-screen keyboard that sends no usable keydown event.
14. IF the player presses Enter or Space without Ctrl, Alt or Meta held, or taps or clicks the Output_Display, during a Typing_Session, THEN THE System SHALL treat the action only as a Skip_Request as defined in Requirement 4, and SHALL not submit a command.

### Requirement 4: Skip the Typing

**User Story:** As a player, I want to skip the typing with a key press, a tap or a click, so that I can read at my own pace on a computer or a phone.

#### Acceptance Criteria

1. WHILE a Typing_Session is active, WHEN the player presses Enter with none of Ctrl, Alt and Meta held, THE Typewriter SHALL show all remaining text of the Typing_Session within 100 milliseconds and end the Typing_Session.
2. WHILE a Typing_Session is active, WHEN the player presses Space with none of Ctrl, Alt and Meta held, THE Typewriter SHALL show all remaining text of the Typing_Session within 100 milliseconds and end the Typing_Session.
3. WHILE a Typing_Session is active, WHEN the player taps or clicks anywhere on the Output_Display, THE Typewriter SHALL show all remaining text of the Typing_Session within 100 milliseconds and end the Typing_Session.
4. WHEN the player skips a Typing_Session, THE Output_Display SHALL show text identical, character for character, to the text it would show if the Typing_Session had run to the end.
5. WHILE a Typing_Session is active, WHEN the player skips it by pressing Enter or Space, THE System SHALL not submit a command, SHALL not insert an Enter or Space character into the Command_Input, and SHALL leave the existing Command_Input text unchanged.
6. WHILE a Typing_Session is active, WHEN the player skips it by tapping or clicking the Output_Display, THE System SHALL not submit a command and SHALL leave the existing Command_Input text unchanged.
7. WHILE a Typing_Session is active, WHEN the player skips it by tapping or clicking the Output_Display, THE Command_Input SHALL keep keyboard focus, so that no blur event is fired on the Command_Input and the on-screen keyboard of a phone stays open.
8. WHILE no Typing_Session is active, WHEN the player presses Enter or Space, THE System SHALL handle the key as it does without the Typewriter, so Enter submits the Command_Input and Space inserts a space character.
9. WHILE no Typing_Session is active, WHEN the player taps or clicks the Output_Display, THE System SHALL handle the tap or click as it does without the Typewriter, and SHALL not start a skip.
10. WHEN the player skips a Typing_Session, THE System SHALL leave the game state (current room, items carried, and fear level) unchanged by the skip.

### Requirement 5: Keep Newest Text Visible

**User Story:** As a player, I want the newest text to stay in view, so that I can always read what is being typed.

#### Acceptance Criteria

1. THE Output_Display SHALL keep the Prompt_Line as the last element in the Output_Display, after all game text, while the Prompt_Line is Visually_Hidden and while it is visible.
2. WHILE a Typing_Session is running, WHEN a character is added to the line being typed (typingLine), THE Output_Display SHALL set its scrollTop to the larger of 0 and (typingLine.offsetTop + typingLine.offsetHeight - Output_Display.clientHeight / 2), so that the bottom of the typed line is at the vertical middle of the visible output area, within 100 milliseconds after that character is added. The browser limit on the maximum scrollTop still applies.
3. WHEN a Typing_Session ends, THE Output_Display SHALL scroll so that the Prompt_Line is vertically centered in the visible output area, as it is without the Typewriter, within 100 milliseconds after the Typing_Session ends.
4. IF the value from the formula in criterion 2 is less than 0, or the Output_Display content is shorter than the visible output area, THEN THE Output_Display SHALL set scrollTop to 0 and SHALL NOT show an error.
5. IF the player manually scrolls the Output_Display while a Typing_Session is running, THEN THE Output_Display SHALL set scrollTop again by the formula in criterion 2 when the next character is added, so that the scroll position after that character is the same as if the player had not scrolled.

### Requirement 6: Configure and Disable the Effect

**User Story:** As a developer, I want the effect controlled by named constants and the reduced-motion setting, so that I can tune it and respect players who avoid animation.

#### Acceptance Criteria

1. THE System SHALL define TYPE_DELAY_MS, PUNCTUATION_PAUSE_MS and LINE_PAUSE_MS as named numeric constants in milliseconds, and TYPEWRITER_ENABLED as a named boolean constant, all declared above any function definition at the top of game.js, each with a one-line comment stating its purpose and unit.
7. THE System SHALL set the initial values of the constants to TYPE_DELAY_MS = 10, PUNCTUATION_PAUSE_MS = 100 and LINE_PAUSE_MS = 150, and THE developer SHALL be able to change each value by editing its declaration in game.js, with the System using the edited value without any other code change.
2. WHERE TYPEWRITER_ENABLED is false, THE System SHALL show every Game_Text_Line in full in the same screen update in which it is added, with no timers started and with the same text content and order as before this feature.
3. WHILE the Reduced_Motion_Setting is on, THE System SHALL show every Game_Text_Line in full in the same screen update in which it is added, regardless of the value of TYPEWRITER_ENABLED.
4. WHEN the Typewriter is not active, THE Prompt_Line SHALL be visible and THE System SHALL accept and process a submitted command within 100 ms.
5. IF TYPE_DELAY_MS, PUNCTUATION_PAUSE_MS or LINE_PAUSE_MS is not a finite number from 0 to 5000, THEN THE System SHALL show every Game_Text_Line in full at once, and THE game state SHALL remain unchanged.
6. WHEN the Reduced_Motion_Setting changes while the page is open, THE System SHALL apply the new setting to Game_Text_Lines added after the change, and SHALL NOT alter text already displayed.

### Requirement 7: Keep the Change Presentation-Only

**User Story:** As a developer, I want this to be a presentation-only change, so that the game rules cannot be broken by it.

#### Acceptance Criteria

1. THE System SHALL leave the behavior of processCommand, runCommand, applyFear, applyHintFear and applyLies unchanged. Unchanged means that, for the same game state and the same command text, each function returns the same value and produces the same changes to the game state fields (current room, items carried, fear level 0 to 100, and all other existing state fields) as before this feature.
2. WHEN a command is processed, THE Status_Bar SHALL show the new room and the new fear value within 100 milliseconds, before the Typewriter types the first character of the reply.
3. THE System SHALL keep every existing command working so that, for the same game state, the reply text, the fear cost and the ending outcome (continue, game over or escape) are identical to those before this feature. The text the Typewriter finishes typing SHALL equal the reply text character for character.
4. WHEN a reply ends the game by game over or escape, THE Typewriter SHALL type all of the ending lines, and THE System SHALL show the Prompt_Line within 500 milliseconds after the last ending character is typed, so that the player can type "restart".
5. THE System SHALL use only plain HTML, CSS and JavaScript, with no frameworks and no external libraries.