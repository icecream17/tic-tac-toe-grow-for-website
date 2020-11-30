# Tic Tac Toe Grow
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)

Hi!

[View the current state of this project](https://htmlpreview.github.io/?https://github.com/icecream17/tic-tac-toe-grow/blob/main/game.html)



## How to play
Win by getting either 7-in-a-row, or a checkmark.  
The board grows 1-step orthogonally from each square that's been played.

A checkmark would be a right angle if the squares' height and width are the same,  
which they usually aren't.
A checkmark is connected diagonally,  
with two sides having 2 and 4 squares respectively,  
where all squares are played by the same player,  
and the two sides share a square.

Examples:

![Lots of moves have been played, O has won with a sideways checkmark.](https://user-images.githubusercontent.com/58114641/99096744-448ab900-259c-11eb-89b2-2d57672b40f9.png)
![Easy 7 in a row win. All moves by X are in the 7 in a row.](https://user-images.githubusercontent.com/58114641/99097026-a21f0580-259c-11eb-9955-e3f7d6663132.png)

There's a more detailed explanation if you scroll down: https://icecream17.github.io/Stuff/Tic%20Tac%20Toe%20Grow/game.html


## Todo
```
[ ] Add custom games  
   [ ] Add and delete people
   [ ] Add and delete bots
[ ] Add more bots
[ ] Reset button
[ ] Create a tournament to rank the bots
   [ ] Game history
[ ] Settings
   [ ] Green/red mode
   [ ] Max length and turns check
      [ ] Non constant
      [ ] Note: MAX_LENGTH and MAX_TURNS are/should be static properties
[ ] Highlight every square that has been played last by a player
[ ] Add helper/tic-tac-toe-grow.js for other people
   [ ] JSDoc or TypeScript maybe?

```

## List of strategies
```
[x] random   DONE
[x] middleIndex   DONE
[x] copy_index   DOESN'T WORK YET
[ ] self_play
[ ] spiral (8 ways)
[ ] firstOnDiagonal1
[ ] last~
[ ] first~2
[ ] last~2
[ ] huddle
[ ] swarm
[ ] avoidSelf
[ ] avoidOpp
[ ] avoidAll
[ ] lastBackwards~
[ ] orthgonalToOpponent
[ ] diagonalToOpponent
[ ] orthogonalToSelf
[ ] diagonalToSelf
[ ] closeToCenter
[ ] middleAlpha
[ ] middleRot13
[ ] randomStrat
[ ] pi
[ ] e
[ ] phi1&2
[ ] squareboard
[ ] EvenAlphaIndex
[ ] OddAlphaIndex
[ ] (first, last)knight
[ ] (biggest, average, smallest) ~ when (xor, or, and, left/right shift) with (previous index, 1, so many ideas)
[ ] previous number

```
