# Requirements Document

## Introduction

This feature adds synthesized sound and a start screen to the Haunted Adventure page. All sounds are generated in code with the Web Audio API. The page uses no audio files and no external libraries. The start screen is a green boot screen shown once per page load. It waits for the first key press, click or tap, which also starts the audio.

This feature changes presentation only. The game state, `processCommand`, `runCommand`, fear, hints, the lying narrator and all game rules stay exactly as they are. The typewriter, the underscore cursor and all existing commands keep working.

## Glossary

- **Page**: The Haunted Adventure web page made of index.html, style.css and game.js.
- **Sound_Engine**: The page code that creates the audio context and plays every synthesized sound.
- **Audio_Context**: The Web Audio API object that Sound_Engine uses to make sound.
- **Typewriter**: The existing code that types game text into the Output_Area one character at a time.
- **Output_Area**: The `#output` element where game text and the prompt appear.
- **Command_Input**: The `#command-input` element that receives the player's typing.
- **Status_Bar**: The `#status-bar` element at the top of the Page.
- **Sound_Toggle**: The clickable SOUND: ON / SOUND: OFF control at the right end of the Status_Bar.
- **Boot_Screen**: The green start screen of short typed lines shown in the Output_Area when the Page loads.
- **Boot_Lines**: The lines of the Boot_Screen: the game title, SYSTEM READY, the sound line, the skip line and PRESS ANY KEY.
- **Sound_Enabled_Flag**: The page variable that records whether sound is on or off. It starts from the saved choice, or from the SOUND_ENABLED constant when no valid saved choice exists.
- **Mute_Command**: One of the typed commands "sound on", "sound off", "mute" and "unmute".
- **Reduced_Motion**: The browser setting `prefers-reduced-motion: reduce`.
- **First_Gesture**: The first key press, click or tap the player makes on the Page.
- **Game_State**: The existing game state object that holds the room, items, fear and all other game facts.
- **Command_Handler**: The existing `processCommand` function and the `runCommand` function it uses.

## Requirements

### Requirement 1: Sound Settings Constants

**User Story:** As a developer, I want sound settings at the top of game.js, so that I can change them without reading the sound code.

#### Acceptance Criteria

1. THE Page SHALL define the constant SOUND_ENABLED with the boolean value true near the top of game.js, before any function definition.
2. THE Page SHALL define the constant SOUND_VOLUME with the number value 0.35 near the top of game.js, before any function definition, where the valid range is 0 to 1 inclusive.
3. THE Page SHALL define the constant SOUND_MIN_GAP_MS with the number value 25 near the top of game.js, before any function definition, as the minimum gap in milliseconds between the start of one sound and the start of the next.
4. IF SOUND_VOLUME is not a finite number from 0 to 1 inclusive, THEN THE Sound_Engine SHALL play no sound, show no error to the player, and leave the Game_State unchanged.
5. IF a sound is requested less than SOUND_MIN_GAP_MS milliseconds after the previous played sound started, THEN THE Sound_Engine SHALL skip that request, play no sound for it, and leave the Game_State unchanged.
6. WHEN the Sound_Engine plays a sound, THE Sound_Engine SHALL set the peak loudness of that sound to SOUND_VOLUME multiplied by the base loudness of the sound, where the base loudness is a number from 0 to 1 inclusive.

### Requirement 2: Typewriter Tick Sounds

**User Story:** As a player, I want soft ticks as game text is typed, so that the text feels like it is being written by an unseen hand.

#### Acceptance Criteria

1. WHEN the Typewriter shows a character that is not a space and not a line break, THE Sound_Engine SHALL play exactly one tick sound with a duration of 40 milliseconds or less.
2. WHEN the Sound_Engine plays a tick sound, THE Sound_Engine SHALL set the pitch to a random value between 90 percent and 110 percent of a base pitch.
3. WHEN the Sound_Engine plays a tick sound, THE Sound_Engine SHALL set the volume to a random value between 80 percent and 120 percent of a base tick volume, and the maximum possible tick volume SHALL be lower than the minimum possible volume of a key click.
4. WHEN the Typewriter shows a space character, THE Sound_Engine SHALL play no sound.
5. WHEN the Typewriter shows a line break or a blank line, THE Sound_Engine SHALL play no sound.
6. WHEN the player skips typing and the Page shows the remaining text at once, THE Sound_Engine SHALL play no tick sounds for that remaining text, and any tick sound already playing SHALL finish within its 40 millisecond limit.
7. WHILE the Page shows text without the Typewriter, including while Reduced_Motion is on, THE Sound_Engine SHALL play no tick sounds.
8. IF the Sound_Engine cannot play a tick sound, THEN THE Typewriter SHALL continue showing text at its normal speed with no error message shown to the player, and the Game_State SHALL remain unchanged.

### Requirement 3: Player Typing Sounds

**User Story:** As a player, I want to hear my own typing, so that the command prompt feels like a real keyboard.

#### Acceptance Criteria

1. WHEN the Command_Input fires an input event after which its value length is greater than before the event, THE Sound_Engine SHALL play exactly one key click sound whose peak volume is higher than the peak volume of a tick sound.
2. WHEN the Command_Input fires an input event after which its value length is smaller than before the event, THE Sound_Engine SHALL play exactly one Backspace click sound whose peak volume is lower than the peak volume of a key click sound.
3. WHEN the player submits a command that the game runs, THE Sound_Engine SHALL play exactly one clack sound whose peak volume is higher than the peak volume of a key click sound and whose pitch is lower than the pitch of a key click sound.
4. THE Page SHALL classify each input event as typed or deleted by comparing the length of the Command_Input value before and after the event, and SHALL NOT use key names for this classification.
5. WHILE the Typewriter is typing, THE Page SHALL discard all input into the Command_Input, and THE Sound_Engine SHALL play zero key click sounds and zero Backspace click sounds for that discarded input.
6. IF a submit only skips the Typewriter and the game runs no command, THEN THE Sound_Engine SHALL play zero clack sounds for that submit.
7. IF the Command_Input value length is unchanged after an input event, THEN THE Sound_Engine SHALL play zero key click sounds and zero Backspace click sounds for that event.

### Requirement 4: Start Screen Display

**User Story:** As a player, I want a boot screen when the page loads, so that the game starts with an atmosphere and I can choose when to begin.

#### Acceptance Criteria

1. WHEN the Page loads, THE Page SHALL show the Boot_Screen in the Output_Area before any intro text.
2. WHEN the Boot_Screen starts typing, THE Boot_Screen SHALL type these Boot_Lines in this order: the game title "HAUNTED ADVENTURE", "SYSTEM READY", a line stating that sound is on and that typing "sound off" turns sound off, a line stating that pressing Enter or tapping skips the typing, and "PRESS ANY KEY".
3. THE Boot_Screen SHALL show all Boot_Lines in green text.
4. WHEN the Boot_Screen starts typing, THE Page SHALL finish typing all Boot_Lines within 2 seconds, with a tolerance of 0.5 seconds, measured from the first character shown to the last character shown.
5. WHILE the Boot_Screen is typing, THE Page SHALL hide the command prompt.
6. WHEN the player presses a key, clicks or taps while the Boot_Screen is typing, THE Page SHALL show all remaining Boot_Lines at once and stop the typing.
7. WHILE the Sound_Enabled_Flag is off, THE Boot_Screen SHALL show a sound line stating that sound is off and that typing "sound on" turns it on, in place of the line stating that sound is on.
8. WHERE Reduced_Motion is on, THE Page SHALL show all Boot_Lines at once without typing and then wait for a key press, click or tap.
9. WHEN all Boot_Lines are shown and the player presses a key, clicks or taps, THE Page SHALL hide none of the Boot_Lines, begin the intro typing, and show the command prompt once the intro finishes typing, as the Page does before this change.
10. THE Page SHALL show the Boot_Screen once per page load, and WHEN the player types restart, THE Page SHALL NOT show the Boot_Screen again until the Page is reloaded.

### Requirement 5: Start Screen Input Flow

**User Story:** As a player, I want to skip the boot typing and start the game with any key, so that I am never stuck waiting.

#### Acceptance Criteria

1. WHILE the Boot_Screen is typing, WHEN the player presses a key, clicks or taps, THE Page SHALL show all remaining Boot_Lines within 100 ms, including PRESS ANY KEY, and wait for another key press, click or tap.
2. WHILE the Boot_Screen is typing, WHEN the player presses a key, clicks or taps, THE Page SHALL NOT begin the intro typing.
3. WHILE the Boot_Screen waits at PRESS ANY KEY, WHEN the player presses a key, clicks or taps, THE Page SHALL start the audio when the Sound_Enabled_Flag is on and then begin the existing intro typing within 500 ms.
4. WHEN the intro typing begins, THE Page SHALL keep all Boot_Lines visible above the intro text.
5. WHILE the Boot_Screen is showing, THE Page SHALL keep the key or tap that dismisses the Boot_Screen out of the Command_Input, so the Command_Input contains 0 characters from that key or tap when the intro typing begins.
6. WHILE the Boot_Screen is showing, THE Page SHALL send 0 player inputs to the Command_Handler.
7. WHEN the intro typing begins, THE Page SHALL leave the Game_State equal to INITIAL_STATE.
8. IF the browser blocks or fails to start the audio, THEN THE Page SHALL still begin the existing intro typing within 500 ms, show no error to the player, and leave the Game_State equal to INITIAL_STATE.
9. WHILE the Boot_Screen is showing, WHEN the player presses a function key F1 to F12 or the Escape key, THE Page SHALL NOT call preventDefault or stopPropagation for that key press, so that F5, F11, F12 and Escape keep their normal browser behavior on the Boot_Screen.
10. WHILE the Boot_Screen is showing, THE Page SHALL NOT count a press of a function key F1 to F12 or the Escape key as a key press that skips the Boot_Screen typing, dismisses the Boot_Screen or starts the intro typing.
11. WHILE the Boot_Screen is showing, WHEN the player presses a function key F1 to F12 or the Escape key, THE Page SHALL leave the Boot_Screen phase, the Boot_Lines, the Command_Input and the Game_State unchanged.
12. WHILE the Boot_Screen is showing, WHEN the Page receives a command submit, THE Page SHALL return from the submit handler without doing anything, so that it plays no sound, sends 0 inputs to the Command_Handler and adds 0 lines to the Output_Area.

### Requirement 6: Sound Mute Commands

**User Story:** As a player, I want to turn sound off and on by typing, so that I can play quietly without leaving the keyboard.

#### Acceptance Criteria

1. WHEN the player submits a Mute_Command, THE Page SHALL handle the command in the page code and SHALL NOT call the Command_Handler for that submission.
2. WHEN the player submits "sound off" or "mute", THE Page SHALL set the Sound_Enabled_Flag to off and print the line "Sound off."
3. WHEN the player submits "sound on" or "unmute", THE Page SHALL set the Sound_Enabled_Flag to on and print the line "Sound on."
4. THE Page SHALL treat input as a Mute_Command if, after removing leading and trailing whitespace, collapsing each run of internal whitespace to one space, and ignoring letter case, the input equals "sound off", "mute", "sound on" or "unmute".
5. WHEN the player submits a Mute_Command, THE Page SHALL leave every Game_State value unchanged, including fear, the current room, carried items and hint counters.
6. WHEN the player submits a Mute_Command, THE Page SHALL print exactly one line, which is the sound line from criterion 2 or 3, and SHALL NOT print the line "That command is not recognized."
7. WHEN the player submits a Mute_Command after the game is over or after the player has escaped, THE Page SHALL print the sound line from criterion 2 or 3 and SHALL NOT print the game-over or escape reminder.
8. WHEN the player submits a Mute_Command, THE Page SHALL leave the status bar room text and fear text unchanged.
9. WHEN the player submits a Mute_Command that sets the Sound_Enabled_Flag to the value it already has, THE Page SHALL keep the flag unchanged and print the sound line for the submitted command.
10. WHILE the Sound_Enabled_Flag is off, THE Sound_Engine SHALL play no sound.

### Requirement 7: Sound Toggle Control

**User Story:** As a phone player, I want a button to turn sound on and off, so that I can control sound without typing.

#### Acceptance Criteria

1. THE Status_Bar SHALL show the Sound_Toggle at its right end, after all other Status_Bar items.
2. WHILE the Sound_Enabled_Flag is on, THE Sound_Toggle SHALL show the text "SOUND: ON".
3. WHILE the Sound_Enabled_Flag is off, THE Sound_Toggle SHALL show the text "SOUND: OFF".
4. WHEN the player clicks or taps the Sound_Toggle, THE Page SHALL flip the Sound_Enabled_Flag and update the Sound_Toggle text within 100 ms.
5. WHEN the player clicks or taps the Sound_Toggle, THE Page SHALL leave every Game_State value unchanged and add 0 lines to the Output_Area.
6. WHEN a Mute_Command changes the Sound_Enabled_Flag, THE Page SHALL update the Sound_Toggle text to match the new flag value within 100 ms.
7. WHEN the player clicks or taps the Sound_Toggle while the Boot_Screen is showing, THE Page SHALL flip the Sound_Enabled_Flag, update the Sound_Toggle text, keep the Boot_Screen showing, and not start the game intro.
8. THE Sound_Toggle SHALL be a button element that the player can focus with the Tab key and activate with the Enter key or the Space key, with a tap area of at least 44 by 44 CSS pixels.

### Requirement 8: Remembered Sound Choice

**User Story:** As a player, I want the page to remember my sound choice, so that I do not have to mute the game on every visit.

#### Acceptance Criteria

1. WHEN the Sound_Enabled_Flag changes, THE Page SHALL save the new choice (on or off) in localStorage inside a try/catch block, replacing any previously saved choice.
2. WHEN the Page loads, THE Page SHALL read the saved choice from localStorage inside a try/catch block and use it as the starting value of the Sound_Enabled_Flag.
3. IF no saved choice exists or the saved value is not one of the two values the Page writes for on and off, THEN THE Page SHALL start the Sound_Enabled_Flag from the SOUND_ENABLED constant and SHALL NOT display an error to the player.
4. IF localStorage throws an error on read or on write, THEN THE Page SHALL continue to run without displaying an error to the player, and SHALL keep the current choice in the Sound_Enabled_Flag until the page is closed.
5. IF a valid saved choice exists, THEN THE Page SHALL use the saved choice as the starting value of the Sound_Enabled_Flag regardless of the value of the SOUND_ENABLED constant.

### Requirement 9: Safe Audio Startup

**User Story:** As a player, I want the page to work on every browser, so that missing or blocked audio never breaks the game.

#### Acceptance Criteria

1. WHEN the First_Gesture occurs and the Sound_Enabled_Flag is on, THE Sound_Engine SHALL create the Audio_Context, and THE Sound_Engine SHALL create no Audio_Context before the First_Gesture.
2. WHEN the Sound_Engine plays a sound and the Audio_Context state is suspended, THE Sound_Engine SHALL call resume on the Audio_Context.
3. IF the Web Audio API is missing from the browser, THEN THE Page SHALL play no sound, display no error message to the player, and accept and process player commands as it does when audio is available.
4. IF creating, resuming or using the Audio_Context throws an error, THEN THE Sound_Engine SHALL catch the error, play no sound for that call, display no error message to the player, leave the Game_State unchanged, and keep accepting player commands.
5. WHILE the Sound_Enabled_Flag is off at the First_Gesture, THE Sound_Engine SHALL create no Audio_Context until the Sound_Enabled_Flag turns on.
6. WHEN the Sound_Enabled_Flag later turns on and no Audio_Context exists, THE Sound_Engine SHALL create the Audio_Context within the same user action that turned the flag on.
7. THE Page SHALL generate all sound with the Web Audio API alone, load zero audio files, and load zero external libraries.

### Requirement 10: Presentation-Only Change

**User Story:** As a developer, I want sound and the start screen to stay out of the game rules, so that the game code still owns every fact.

#### Acceptance Criteria

1. THE Page SHALL keep the source code of processCommand, runCommand, the Game_State definition, the fear calculation, the hint logic and the lying narrator logic identical to its state before this change.
2. WHEN the Command_Handler receives a command, THE Command_Handler SHALL return the same resulting Game_State and the same output lines for the same starting Game_State and command, whether the Sound_Enabled_Flag is on or off and whether the Boot_Screen is shown or dismissed.
3. WHEN the Sound_Engine plays a sound, THE Sound_Engine SHALL read the Game_State and SHALL leave every Game_State field with the same value it had before the read.
4. WHEN the player types restart, THE Page SHALL keep the Sound_Enabled_Flag at the value it had before the command, and SHALL NOT show the Boot_Screen.
5. THE Page SHALL keep the Typewriter, the underscore cursor, the skip behavior and every command that existed before this change producing the same output and behavior as before.
6. IF the browser blocks or fails to start sound playback, THEN THE Page SHALL continue the game with unchanged Game_State and unchanged output lines, and SHALL NOT show an error to the player.
