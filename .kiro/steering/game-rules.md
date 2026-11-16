---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 

# Haunted Adventure: project rules

## What this is
A haunted text adventure that runs in a web page, in the style of old games like Zork. The player types commands and reads text replies.

## Rules
- Build it with plain HTML, CSS and JavaScript. No frameworks.
- The game code keeps track of every fact: the current room, items carried, and the fear level.
- The AI narrator only describes what the game code tells it. It never decides what is true.
- Keep the code simple, with short comments, because the developer is a beginner.
- Make one small change at a time and explain what it does.
- Do not run syntax checks or install tools like Node.js. The developer tests in the browser.

## Story
The player is trapped in a haunted house. The front door locked itself and the key is in the cellar. An unseen presence called the Caretaker haunts the player. The tone is quiet, cold and unsettling, never gory. Keep new text short and atmospheric.

## Fear
The game keeps a fear number from 0 to 100 in the game state. Only game code changes it. The narrator never decides it.

## Existing code
The developer also edits files by hand. Always read the current game.js, index.html and style.css before changing them, and keep the developer's changes.