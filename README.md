# Odd or Even

Local multiplayer math game, played on a single touchscreen. Competitive, reflex-based gameplay.

Web app: __https://oddoreven.app/__

[Progressive Web App](https://developers.google.com/web/progressive-web-apps) &mdash; can be installed on Android/iOS for the best fullscreen experience.

This game is free. If you enjoy it, consider making a small donation according to what you feel the game is worth.

[![PayPal](images/paypal.svg)](https://paypal.me/joshuaptfan)

<details>
<summary>Table of Contents</summary>

* [Gameplay](#gameplay)
  * [Math Tips](#math-tips)
  * [Ideas for Play](#ideas-for-play)
* [Game Design](#game-design)
  * [Conception](#conception)
  * [Shared Buttons](#shared-buttons)
  * [Perfectly Symmetrical, As All Things Should Be](#perfectly-symmetrical-as-all-things-should-be)
  * [Fair Random](#fair-random)
  * [Pacing](#pacing)
</details>

## Gameplay

_Take the in-game tutorial for a shorter description of gameplay._

This is a game of simple speed math and reflexes, between 2 teams.

A math expression is shown. Its result's parity is either __odd__ or __even__. There are 2 buttons in the center, &#9711; and &#10005;. Each team asks themselves if the parity matches their team, and races to press &#9711; ("yes") or &#10005; ("no") before the other team. If they answer correctly, they will add a point to their team or subtract a point from the other team. Otherwise, they will do the opposite and benefit their opponent.

The math expression then changes, and the race begins anew. The game ends when one team gains a predetermined point lead over the other.

How the buttons work is that each turn, they both affect the score of the team whose parity matches the expression result, adding or subtracting 1 from that team's score.

### Math Tips

It is not necessary to actually evaluate the expression to find out its [parity](https://en.wikipedia.org/wiki/Parity_\(mathematics\)). These are the rules of parity:

#### Addition and subtraction

* even &pm; even = even
* even &pm; odd = odd
* odd &pm; odd = even

#### Multiplication

* even &times; even = even
* even &times; odd = even
* odd &times; odd = odd

Easy and normal difficulties only include addition and subtraction, so determining parity in those difficulties is only a matter of counting the number of odd numbers. __If there are an odd number of odd numbers, the result is odd.__

Hard difficulty adds multiplication to the mix, forcing players to pay attention to the order of operations.

### Ideas for Play

* 2v2 &mdash; large touchscreen recommended
* Drinking game &mdash; winner takes a drink

## Game Design

### Conception

In multiplayer games where players share a single touchscreen, there is a problem where the game has no way to be sure that any input originated from the correct player. So, I had an idea for a game that turns that problem into a feature. Originally, I wanted to make a game with 1 large button shared by all players, and that quickly evolved into the current nested 2-button design.

### Shared Buttons

The buttons are nested so that as a player is reaching for a button, it will be ambiguous to their opponent which button they will press, to prevent the strategy of just pressing the button opposite the one your opponent is reaching for. In this regard, there are alternative button designs that can also work, so long as the &#9711; and &#10005; tap areas are contiguous and they have a long shared border. I use a design that is rotationally symmetrical because initially I planned for this game to be playable by an arbitrary number of teams.

A common request during testing was for each team to have their own buttons. I ultimately decided against implementing this for several reasons:

1. The UI would be much more intuitive with a more conventional layout. However, the concept that both team's &#9711; and &#10005; buttons are linked together, i.e. pressing one &#9711; button also presses the other, would be proportionally _less_ intuitive.

2. I wanted the UI to emphasize the versus aspect of the game. If the UI could be divided such that each team only needed to pay attention to their side, then it would effectively be 2 single-player games bolted together.

3. Often, the motive for this request was rooted in the requester's personal discomfort with the possibility of making physical contact with another player when going for the smaller center button. However, one of the pillars of this game's design is to provoke conflict between players, up to and including that of a physical nature. (Yes, I have watched friends get into a wrestling match over this game. So worth it.) I determined that I should not make a compromise to satisfy a subset of players that would diminish the spirit of the game.

### Perfectly Symmetrical, As All Things Should Be

The game's symmetry makes it inherently balanced. Even the turns are simultaneous.

Some players speculate that the Even team has an advantage because even expressions are easier to spot. Even if that is true, which is debatable, it wouldn't affect the game balance, because then both teams could play as if they were Even, except Odd could just press the "wrong" button each time.

### Fair Random

Each turn, the expression's parity is chosen first, then the expression is generated and coerced into that parity.

The parity is chosen randomly, weighted towards the team that has been chosen fewer times previously. A fudge factor is thrown in so that no team is ever guaranteed to be chosen even if that team has never been chosen before.

### Pacing

In a game all about reaction speed, players need breaks at regular intervals from the core game mechanic to prevent mental exhaustion. I provide these with mandatory pauses between each turn and longer ones at the end of each game and the beginning of the next.

The pause between turns is &frac34; of a second, which is the longest break I feel I can give players without giving them time to begin wondering when the next turn will start. The math expression for the previous turn remains on-screen during this period so that the loser has extra time to process and learn from it.

Still, how long of a break each player needs is subjective and I observed that some players become mentally exhausted before they can finish even one game. For those players, I recommend playing with a lower score limit. There is no turn time limit, so that players can mutually set their own pace and take breaks at any time.

## License

[MIT License](https://joshuaptfan.mit-license.org/)
