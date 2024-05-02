# Tetris Match

## Description

Tetris Match is an online multiplayer game of Tetris.

## Setup

```bash
$ git clone
$ cd tetris-match
$ npm install
$ npm start
```

## Tasks

-   [x] Landing Page

    -   [x] Logo?

    -   [x] Authentication

        -   [x] [front] Component for Login form
        -   [x] [back] Login form logic

        -   [x] [front] Component for Signup form
        -   [x] [back] Signup form logic

    -   [x] How to Play Page

        -   [x] [front + text] Game Rules
        -   [x] [front + text] Controls

    -   [x] Play Now Button
        -   [x] [front] Play Now Button
        -   [x] [back] Play Now Button Logic
            -   [x] Invite Code Logic
            -   [x] Matchmaking Logic

-   [ ] Game Page

    -   [x] Game Board
        -   [x] [front] Game Canvas Component
        -   [x] [back] Game Canvas Logic
    -   [x] Game Controls
        -   [x] [back] Game Controls Logic
        -   [x] [back] Cheat key logic
    -   [ ] Game Sprites
        -   [x] [front] Tetris Piece Component
        -   [x] [back] Tetris Piece Logic
    -   [ ] Game Mechanisms
        -   [ ] Levels?

-   [x] Game Over Page
    -   [x] [front] Game Over Message
    -   [x] [front] Play Again Button
    -   [x] [back] Play Again Button Logic
    -   [x] [front] Return to Home Button
    -   [x] [back] Return to Home Button Logic
-   [x] Leaderboard Page

    -   [x] [front] Leaderboard Table
    -   [x] [back] Leaderboard Logic

-   [x] Profile Page?
-   [x] Settings Page?

## Marking Scheme
-   [x] Game front page 40

    -   [x] Game description and instructions 5
        - [x] The game description and instructions are clearly shown and written on the page
    -   [x] Player registration 10
        - [x] New players can register for a new account 
in the front page
    -   [x] Player sign-in 10
        - [x] Players can sign in the front page with an
account
    -   [x] Player pair up 15
        - [x] Players can join a game with another player


-   [x] Game play page 95

    -   [x] Things in the game 40
        -   [ ] There are at least 4 types of ‘things’ in the game
        -   [ ] For example, bullets in a shooting game or cards 
in a card game are considered one type of thing
        -   [ ] Any collection of the same thing that is animated / 
can be interacted counts as one type of thing
        -   [ ] Static objects / text do not count
        - Tetrominoes, (TODO: cloud, clock, sun)
    -   [x] Players’ interaction 20
        -   [x] Some kind of players’ interaction is shown 
in almost real-time
        -   [x] WebSocket is used for the real-time communication
    -   [x] Game controls 10
        -   [x] Some things can be controlled by the mouse 
and/or keyboard
    -   [x] Game duration 10
        -   [x] A normal game should not last for more than 
3 - 4 minutes
    -   [x] Cheat mode 15
        -   [x] A key/button can be used to activate the cheat mode
        -   [x] The game can be completed much quicker once the 
cheat mode is on (for example, unlimited bullets/ 
greater power/ ability to swap cards, etc)

 -  [x] Game over page 30

    -   [x] Player statistics 10
        -   [x] Relevant statistics of the game play is shown for each player

    -   [x] Player ranking 10
        -   [x] Overall ranking of the players of some useful 
measures is shown
    -   [x] Restart the game/ back to front page 10
        -   [x] The game can be quickly restarted in this page
        -   [x] Or, the player can go back to the front page

 -   [x] Graphic and sounds 10
    -   [x] Game play uses SVG or canvas
    -   [x] At least two different sounds (i.e. 2 sound files)
are used during game play
 -   [x] Running the project 15
        -   [x] A single ‘npm install’ can install all package 
dependencies
        -   [x] A single line of instruction starts the server
        -   [x] The game is started using http://localhost:800
 -   [x] User support 30
        -   [x] This refers to how well your project handles users
        -   [x] If the project can only handle one person at a time 
(turn-based ‘monopoly’ style), it may get 10 marks
        -   [x] But if the project can handle multiple people at the
same time, in real time, it may get 30 marks
 -   [x] Game quality 40
        -   [x] This part is awarded based on the overall 
game quality in terms of creativity, 
completeness and playability
        -   [x] This is a general score given relative 
to the quality of work of the entire class

 -   [x] Project details announcement 20
 -   [ ] Project video 20