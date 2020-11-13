# Tic Tac Toe Grow
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)

Hi!

This isn't done yet

## How to play
Win by getting either 7-in-a-row, or a checkmark.  
The board grows 1-step orthogonally from each square that's been played.

A checkmark would be a right angle if the squares' height and width are the same,  
which they usually aren't.
A checkmark is connected diagonally,  
with two sides having 2 and 4 squares respectively,  
where all squares are played by the same player,  
and the two sides share a square.

Example:
```
O wins!
 ___   
_XOX__
 __O_X_
  _XO_O_
   __OX_
     __
```

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
[ ] Highlight every square that has been played last by a player

```

## List of strategies
```
[x] random   DONE
[ ] copy~
[ ]    self_play
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
[x] middleIndex   DONE
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
