# Requirements Document

## Introduction

This feature replaces the typed green boot screen from the sound-and-start-screen spec with a cinematic start sequence. The sequence has three parts. A black loading screen with animated dots covers the Output_Area. After the first key press or tap, a synthesized storm cue plays for a few seconds. Then the loading screen is removed and the existing intro typing begins.

This feature changes presentation only. `processCommand`, `runCommand`, the Game_State, fear, hints, the lying narrator and all game rules stay exactly as they are. The Typewriter, the sound hooks, the underscore cursor code and all commands keep working. The page uses plain HTML, CSS and JavaScript, no audio files and no libraries.

The sequence replaces the old Boot_Screen code and the old boot lines (HAUNTED ADVENTURE, SYSTEM READY, the sound line, the skip line and PRESS ANY KEY). The sound settings, the Sound_Toggle, the Mute_Commands and the remembered sound choice from sound-and-start-screen stay as they are.

## Glossary

- **Page**: The Haunted Adventure web page made of index.html, style.css and game.js.
- **Start_Sequence**: The whole cinematic start: the Loading_Screen, the Storm_Cue and the hand-off to the intro. It runs once per page load.
- **Loading_Screen**: The black overlay that is positioned over the Output_Area element itself (and not over the Status_Bar) while the Start_Sequence runs.
- **Autostart_Timer**: The safety timer of LOADING_AUTOSTART_MS milliseconds that starts when the Page loads and continues the Start_Sequence when no Entry_Input happens.
- **Autostart**: The continuation of the Start_Sequence caused by the Autostart_Timer, on the silent path, with no Storm_Cue.
- **Loading_Word**: The word LOADING shown in large green text on the Loading_Screen.
- **Loading_Dots**: The dots shown after the Loading_Word. They cycle through zero, one, two and three dots.
- **Prompt_Line**: The blinking line "PRESS ANY KEY OR TAP TO ENTER" shown under the Loading_Word.
- **Skip_Hint_Line**: The smaller dim line "Press Enter or tap to skip typed text." shown under the Prompt_Line.
- **Entry_Input**: The first accepted key press, click or tap on the Loading_Screen, as defined in Requirement 3.
- **Storm_Cue**: The synthesized sound sequence made of rain, distant thunder, close thunder, a door slam and a lock click.
- **Rain_Layer**: The looping filtered noise that forms the rain sound.
- **Cue_Skip**: A key press, click or tap after Entry_Input that ends the Storm_Cue early.
- **Cue_Skip_Guard**: The first CUE_SKIP_GUARD_MS (800) milliseconds after Entry_Input, during which Cue_Skip is ignored.
- **Storm_Peak_Cap**: The maximum peak loudness of any Storm_Cue sound, equal to SOUND_VOLUME multiplied by STORM_PEAK_MAX.
- **Intro**: The existing opening text typed by `showLines` with the call that `finishBoot` makes before this change.
- **Sound_Engine**: The page code that creates the Audio_Context and plays every synthesized sound.
- **Audio_Context**: The Web Audio API object that the Sound_Engine uses to make sound.
- **Sound_Enabled_Flag**: The existing page variable that records whether sound is on or off.
- **Sound_Toggle**: The existing `#sound-toggle` button in the Status_Bar.
- **Mute_Command**: One of the typed commands "sound on", "sound off", "mute" and "unmute".
- **Status_Bar**: The existing `#status-bar` element.
- **Output_Area**: The existing `#output` element.
- **Typewriter**: The existing code that types game text into the Output_Area.
- **Reduced_Motion**: The browser setting `prefers-reduced-motion: reduce`.
- **Game_State**: The existing game state object that holds the room, items, fear and all other game facts.
- **Command_Handler**: The existing `processCommand` function and the `runCommand` function it uses.
- **Start_Constants**: The named constants at the top of game.js listed in Requirement 1.

## Requirements

### Requirement 1: Named Constants

**User Story:** As a developer, I want every number of the sequence in named constants at the top of game.js, so that I can tune the sequence without reading the code.

#### Acceptance Criteria

1. THE Page SHALL define each of these constants at the top of game.js, before any function definition: LOADING_DOT_MS (400), LOADING_PROMPT_DELAY_MS (1500), STORM_CUE_MS (5000), LOADING_SILENT_MS (2000), CUE_SKIP_GUARD_MS (800), CUE_FADE_OUT_MS (200), LOADING_AUTOSTART_MS (15000) and CUE_SKIP_RAIN_FADE_MS (1500).
2. THE Page SHALL define named constants at the top of game.js for the Loading_Word font size (8 vw, minimum 32 px, maximum 72 px), the Rain_Layer fade-in time (1.5 seconds), the Rain_Layer fade-out time (6 seconds), the distant thunder time (0.8 seconds), the close thunder time (2.2 seconds), the door slam time (3.4 seconds), the lock click time (4.0 seconds) and the gap between the two lock clicks (120 ms), the loudness cap STORM_PEAK_MAX (0.6), the close thunder loudness factor CLOSE_THUNDER_FACTOR (0.8) and the distant thunder loudness factor DISTANT_THUNDER_FACTOR (0.4).
3. THE Page SHALL use these named constants everywhere the sequence needs the values, and SHALL NOT repeat the literal numbers in the sequence code.
4. THE Page SHALL keep the existing constants SOUND_ENABLED, SOUND_VOLUME, SOUND_MIN_GAP_MS and SOUND_STORAGE_KEY with their current values.
5. THE Page SHALL remove the constant BOOT_TOTAL_MS and the boot variables that only the old Boot_Screen used.

### Requirement 2: Loading Screen Display

**User Story:** As a player, I want a dark loading screen with animated dots when the page opens, so that the game starts with a cinematic mood.

#### Acceptance Criteria

1. WHEN the Page loads, THE Page SHALL show the Loading_Screen as a black overlay that is positioned over the Output_Area element itself, so that the overlay covers exactly the area of the Output_Area and leaves the Status_Bar visible.
2. THE Loading_Screen SHALL show the Loading_Word in green, centered horizontally and vertically inside the Loading_Screen.
3. THE Loading_Word SHALL use a font size of 8 vw, limited to a minimum of 32 px and a maximum of 72 px.
4. THE Loading_Screen SHALL show the Loading_Dots directly after the Loading_Word on the same line.
5. WHILE the Loading_Screen is showing and Reduced_Motion is off, THE Page SHALL change the Loading_Dots every LOADING_DOT_MS milliseconds, cycling through zero dots, one dot, two dots, three dots and back to zero dots.
6. WHEN LOADING_PROMPT_DELAY_MS milliseconds have passed since the Page loaded, THE Page SHALL show the Prompt_Line with the text "PRESS ANY KEY OR TAP TO ENTER" under the Loading_Word.
7. WHEN LOADING_PROMPT_DELAY_MS milliseconds have passed since the Page loaded, THE Page SHALL show the Skip_Hint_Line with the text "Press Enter or tap to skip typed text." under the Prompt_Line, in a smaller and dimmer style than the Prompt_Line.
8. WHILE the Prompt_Line is showing and Reduced_Motion is off, THE Page SHALL blink the Prompt_Line.
9. WHILE the Loading_Screen is showing, THE Page SHALL keep animating the Loading_Dots, including while the Prompt_Line is showing and while the Storm_Cue plays.
10. THE Page SHALL contain no Output_Area lines with the text HAUNTED ADVENTURE, SYSTEM READY, the sound line or PRESS ANY KEY from the old Boot_Screen.
11. WHILE the Loading_Screen is showing, THE Page SHALL keep the command prompt hidden.
12. WHILE the Loading_Screen is showing, THE Loading_Screen SHALL fit inside a phone screen 320 CSS pixels wide, with the Loading_Word and the Loading_Dots on one line without horizontal scrolling.
13. WHILE the Loading_Screen is showing, THE Page SHALL position the Loading_Screen relative to the Output_Area element and SHALL NOT use a fixed offset or a fixed height for the Status_Bar, so that the Loading_Screen covers the Output_Area and leaves the whole Status_Bar visible whatever the Status_Bar height is, including when the Status_Bar text wraps onto several lines on a phone screen 320 CSS pixels wide.

### Requirement 3: Entry Input

**User Story:** As a player, I want any normal key or tap to start the show, so that I do not need to find a special button.

#### Acceptance Criteria

1. WHEN the first accepted key press, click or tap happens after the Page loads, THE Page SHALL treat it as the Entry_Input.
2. THE Page SHALL accept the Entry_Input from any key press, click or tap, except those listed in criteria 3 to 8.
3. WHILE the Loading_Screen is showing, THE Page SHALL NOT count a press of the Tab key as the Entry_Input.
4. WHILE the Loading_Screen is showing, THE Page SHALL NOT count a press of a function key F1 to F12 as the Entry_Input.
5. WHILE the Loading_Screen is showing, THE Page SHALL NOT count a press of the Escape key as the Entry_Input.
6. WHILE the Loading_Screen is showing, THE Page SHALL NOT count a key press with the Ctrl, Alt or Meta key held, or a press of a modifier key alone, as the Entry_Input.
7. WHILE the Loading_Screen is showing, THE Page SHALL NOT count a key event with the auto-repeat flag set as the Entry_Input.
8. WHILE the Loading_Screen is showing, THE Page SHALL NOT count an event on the Sound_Toggle as the Entry_Input.
9. WHEN the Entry_Input happens before LOADING_PROMPT_DELAY_MS has passed, THE Page SHALL accept it and continue the Start_Sequence in the same way as after the delay.
10. WHEN the Entry_Input happens, THE Page SHALL start the Audio_Context when the Sound_Enabled_Flag is on, remove the Prompt_Line, remove the Skip_Hint_Line, and cancel the Autostart_Timer.
11. WHEN the Entry_Input happens, THE Page SHALL keep the key or tap out of the Command_Input, so the Command_Input contains 0 characters from it when the Intro begins.
12. WHILE the Loading_Screen is showing, WHEN the player presses F5, F11, F12, Escape or Tab, THE Page SHALL NOT call preventDefault or stopPropagation for that key press, so that the browser keeps its normal behavior for it.
13. IF the browser blocks or fails to start the Audio_Context, THEN THE Page SHALL continue the Start_Sequence with no sound, show no error to the player, and leave the Game_State unchanged.

### Requirement 4: Storm Cue Timing and Hand-off

**User Story:** As a player, I want a short storm scene before the story starts, with a way to skip it, so that I feel the setting without being stuck.

#### Acceptance Criteria

1. WHEN the Entry_Input happens and the Sound_Enabled_Flag is on, THE Page SHALL start the Storm_Cue.
2. WHILE the Storm_Cue plays, THE Page SHALL keep the Loading_Screen showing with the Loading_Dots animating.
3. WHEN STORM_CUE_MS milliseconds have passed since the Entry_Input, THE Page SHALL remove the Loading_Screen, leave the Output_Area with no lines other than the command prompt, and begin the Intro.
4. WHEN the Page begins the Intro, THE Page SHALL make the same `showLines` call with the same lines that `finishBoot` made before this change.
5. WHEN a key press, click or tap happens after the Entry_Input and after the Cue_Skip_Guard has passed, THE Page SHALL end the Storm_Cue at once, remove the Loading_Screen, begin the Intro, stop the thunder, door slam and lock click sounds with a fade-out over CUE_FADE_OUT_MS milliseconds, and fade the Rain_Layer out as defined in Requirement 6.
6. WHILE the Cue_Skip_Guard has not passed, THE Page SHALL ignore key presses, clicks and taps for the purpose of Cue_Skip.
7. THE Page SHALL apply the ignore rules of Requirement 3 criteria 3 to 8 and criterion 12 to a Cue_Skip in the same way as to the Entry_Input.
8. WHILE the Sound_Enabled_Flag is off at the Entry_Input, THE Page SHALL play no Storm_Cue, keep the Loading_Screen for LOADING_SILENT_MS milliseconds after the Entry_Input, and then begin the Intro in the same way as in criteria 3 and 4.
9. WHEN the Page begins the Intro, THE Page SHALL leave the Game_State equal to INITIAL_STATE.
10. WHEN the Intro finishes typing, THE Page SHALL show the command prompt and focus the Command_Input, as the Page did before this change.
11. THE Page SHALL run the Start_Sequence once per page load, and WHEN the player types restart, THE Page SHALL NOT show the Loading_Screen or play the Storm_Cue again.
12. WHEN a Cue_Skip, the end of STORM_CUE_MS, the end of the silent wait or the Autostart begins the Intro, THE Page SHALL ensure the Intro begins only once, even if two of these happen at nearly the same time.
13. WHEN the Page loads, THE Page SHALL start the Autostart_Timer with a duration of LOADING_AUTOSTART_MS milliseconds.
14. IF LOADING_AUTOSTART_MS milliseconds pass after the Page loads with no Entry_Input, THEN THE Page SHALL perform the Autostart: THE Page SHALL play no Storm_Cue, SHALL NOT start the Audio_Context, SHALL remove the Prompt_Line and the Skip_Hint_Line, SHALL keep the Loading_Screen showing for LOADING_SILENT_MS milliseconds, and SHALL then begin the Intro in the same way as in criteria 3 and 4.
15. WHEN the Autostart happens, THE Page SHALL leave the Sound_Enabled_Flag, the Sound_Toggle text and the remembered sound choice unchanged, and SHALL treat the Autostart as the silent path whatever the value of the Sound_Enabled_Flag is.
16. WHILE the Autostart wait of LOADING_SILENT_MS milliseconds runs, THE Page SHALL ignore key presses, clicks and taps for the purpose of Entry_Input and Cue_Skip, and SHALL keep the Loading_Dots animating.
17. WHILE the Autostart wait runs, WHEN the Sound_Enabled_Flag turns on, THE Page SHALL NOT start the Storm_Cue.

### Requirement 5: Storm Cue Sound

**User Story:** As a player, I want rain, thunder, a slamming door and a lock click, so that I hear myself being trapped in the house.

#### Acceptance Criteria

1. THE Sound_Engine SHALL synthesize the whole Storm_Cue with the Web Audio API, load zero audio files and load zero external libraries.
2. THE Sound_Engine SHALL scale the peak loudness of every Storm_Cue sound by SOUND_VOLUME and SHALL keep the peak loudness of every Storm_Cue sound at or below the Storm_Peak_Cap (SOUND_VOLUME multiplied by STORM_PEAK_MAX).
3. WHEN the Storm_Cue starts, THE Sound_Engine SHALL start the Rain_Layer as looping filtered noise and fade it in from silence over 1.5 seconds.
4. WHEN 0.8 seconds have passed since the Storm_Cue started, THE Sound_Engine SHALL play a distant thunder sound.
5. WHEN 2.2 seconds have passed since the Storm_Cue started, THE Sound_Engine SHALL play a close thunder sound that is louder than the distant thunder.
6. WHEN 3.4 seconds have passed since the Storm_Cue started, THE Sound_Engine SHALL play a heavy door slam made of a low thud and a short noise burst.
7. WHEN 4.0 seconds have passed since the Storm_Cue started, THE Sound_Engine SHALL play a lock click made of two very short clicks 120 ms apart.
8. WHEN the Intro begins and the Rain_Layer is still playing, THE Sound_Engine SHALL keep the Rain_Layer playing under the start of the Intro and fade it out over 6 seconds.
9. WHEN the Rain_Layer fade-out ends, THE Sound_Engine SHALL stop the noise source.
10. THE Sound_Engine SHALL schedule the Storm_Cue events so that a Cue_Skip or a sound-off stops events that have not yet played.
11. THE Sound_Engine SHALL NOT apply the SOUND_MIN_GAP_MS gap rule to Storm_Cue events, so that the thunder, the thud and the noise burst can overlap.
12. THE Sound_Engine SHALL read the Game_State for none of the Storm_Cue sounds and SHALL leave every Game_State field unchanged.
13. THE Sound_Engine SHALL set the peak loudness of the door slam, for the low thud and for the short noise burst each, to the Storm_Peak_Cap.
14. THE Sound_Engine SHALL set the peak loudness of the close thunder to the Storm_Peak_Cap multiplied by CLOSE_THUNDER_FACTOR.
15. THE Sound_Engine SHALL set the peak loudness of the distant thunder to the Storm_Peak_Cap multiplied by DISTANT_THUNDER_FACTOR.
16. THE Sound_Engine SHALL set the peak loudness of the Rain_Layer and of each lock click at or below the Storm_Peak_Cap.

### Requirement 6: Stopping the Storm Cue

**User Story:** As a player, I want to silence the storm at any moment, so that I stay in control of sound.

#### Acceptance Criteria

1. WHEN the player turns sound off with the Sound_Toggle, THE Sound_Engine SHALL stop all Storm_Cue sounds at once, including the Rain_Layer and its fade-out.
2. WHEN the player submits a Mute_Command that turns sound off, THE Sound_Engine SHALL stop all Storm_Cue sounds at once, including the Rain_Layer and its fade-out.
3. WHEN the Sound_Enabled_Flag turns off for any reason, THE Sound_Engine SHALL stop all Storm_Cue sounds at once and cancel the Storm_Cue events that have not yet played.
4. WHEN the player clicks or taps the Sound_Toggle while the Storm_Cue plays, THE Page SHALL stop the Storm_Cue only if the click turns sound off, SHALL keep the Loading_Screen showing, and SHALL NOT count the click as a Cue_Skip.
5. WHEN the Sound_Enabled_Flag turns on again while the Storm_Cue has already been stopped, THE Sound_Engine SHALL NOT restart the Storm_Cue.
6. WHEN a Cue_Skip happens, THE Sound_Engine SHALL stop the playing thunder, door slam and lock click sounds with a fade-out over CUE_FADE_OUT_MS milliseconds and play none of the Storm_Cue events that have not yet played.
7. WHEN a Cue_Skip happens, THE Sound_Engine SHALL fade the Rain_Layer out over CUE_SKIP_RAIN_FADE_MS milliseconds, keep it playing under the start of the Intro during that fade, stop the noise source when the fade ends, and SHALL NOT start the 6 second Rain_Layer fade-out.
8. WHEN a Cue_Skip happens, THE Sound_Engine SHALL NOT use CUE_FADE_OUT_MS for the Rain_Layer.
9. IF any Audio_Context call for the Storm_Cue throws an error, THEN THE Sound_Engine SHALL catch the error, show no error to the player, leave the Game_State unchanged, and let the Start_Sequence continue on its timers.
10. THE Sound_Engine SHALL wrap every Audio_Context call of the Storm_Cue so that a failure is silent.

### Requirement 7: Reduced Motion

**User Story:** As a player who prefers less motion, I want a calm loading screen, so that the sequence does not flash or move.

#### Acceptance Criteria

1. WHERE Reduced_Motion is on, THE Loading_Screen SHALL show the Loading_Dots as a static set of three dots.
2. WHERE Reduced_Motion is on, THE Page SHALL show the Prompt_Line without blinking.
3. WHERE Reduced_Motion is on, THE Page SHALL still run the whole Start_Sequence, including the Entry_Input, the Storm_Cue timing and the hand-off to the Intro.
4. WHERE Reduced_Motion is on, THE Page SHALL show the Prompt_Line and the Skip_Hint_Line after LOADING_PROMPT_DELAY_MS milliseconds, as when Reduced_Motion is off.

### Requirement 8: Input Safety During the Sequence

**User Story:** As a player, I want browser keys and the sound button to keep working on the loading screen, so that the page never feels locked.

#### Acceptance Criteria

1. WHILE the Start_Sequence is running, THE Page SHALL send 0 player inputs to the Command_Handler.
2. WHILE the Start_Sequence is running, WHEN the Page receives a command submit, THE Page SHALL return from the submit handler without doing anything, so that it plays no sound, sends 0 inputs to the Command_Handler and adds 0 lines to the Output_Area.
3. WHILE the Start_Sequence is running, THE Sound_Toggle SHALL keep working: WHEN the player clicks or taps it, THE Page SHALL flip the Sound_Enabled_Flag, update the Sound_Toggle text, keep the Loading_Screen showing, and add 0 lines to the Output_Area.
4. WHILE the Start_Sequence is running, WHEN the player presses the Enter key or the Space key on the focused Sound_Toggle, THE Page SHALL activate the Sound_Toggle and SHALL NOT count the key press as the Entry_Input or a Cue_Skip.
5. WHILE the Start_Sequence is running, THE Page SHALL play no key click, Backspace click, clack or tick sound.
6. WHILE the Start_Sequence is running, THE Page SHALL leave the Game_State, the Status_Bar room text and the Status_Bar fear text unchanged.

### Requirement 9: Presentation-Only Change

**User Story:** As a developer, I want the start sequence to stay out of the game rules, so that the game code still owns every fact.

#### Acceptance Criteria

1. THE Page SHALL keep the source code of processCommand, runCommand, the Game_State definition, the fear calculation, the hint logic and the lying narrator logic identical to its state before this change.
2. WHEN the Command_Handler receives a command, THE Command_Handler SHALL return the same resulting Game_State and the same output lines for the same starting Game_State and command as before this change.
3. THE Page SHALL keep the Typewriter, the sound hooks, the underscore cursor code, the Mute_Commands, the Sound_Toggle, the remembered sound choice and every command that existed before this change working with the same output and behavior as before.
4. THE Page SHALL keep the developer's existing edits in game.js, index.html and style.css that are not part of the old Boot_Screen.
5. THE Page SHALL use plain HTML, CSS and JavaScript with short comments, and SHALL NOT add a framework, an audio file or an external library.
6. WHEN the player types restart, THE Page SHALL keep the Sound_Enabled_Flag at the value it had before the command and SHALL NOT start any part of the Start_Sequence.
