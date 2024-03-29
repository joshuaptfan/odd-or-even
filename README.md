# Odd or Even

A reflex game of simple speed math. Play solo or local versus.

Play in the web app: __https://oddoreven.app/__

[Progressive Web App](https://developers.google.com/web/progressive-web-apps) &mdash; can be installed on Android/iOS for the best fullscreen experience. The UI will be larger, and the game won't exit fullscreen when switching back from another app.

## How to Play

### Solo

Choose whether each math expression's result is odd or even before time runs out. The time limit decreases gradually as the game progresses.

Keyboard controls are available in this mode.

| Key | Function |
| --- | --- |
| __Z__ | Odd |
| __X__ | Even |
| __Space__ | Restart |

### Versus

There are 2 teams, __Odd__ and __Even__. Each math expression's result has a _parity_ of either __odd__ or __even__.

There are 2 buttons in the center, &#9711; and &#10005;. If the parity matches your team, press &#9711;. If it doesn't match your team, press &#10005;. Race against your opponent to press the correct button for your team.

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

Easy and normal difficulties only include addition and subtraction, so determining parity is only a matter of counting the number of odd numbers. __If there are an odd number of odd numbers, the result is odd.__

Hard difficulty adds multiplication to the mix, forcing players to pay attention to the order of operations.

### Ideas for Play

* 2v2 &mdash; large touchscreen recommended
* Drinking game &mdash; winner takes a drink

## What Inspired This Game

In local multiplayer touchscreen games, there is a problem where the game has no way to be sure that any input originated from the correct player. So, I had an idea for a game that turns that problem into a feature. Originally, I wanted to make a game with 1 large button shared by all players, and that quickly evolved into the current nested 2-button design.

This game is free. If you enjoy it, consider making a small donation according to what you feel the game is worth.

[![PayPal](images/paypal.svg)](https://paypal.me/joshuaptfan)

## License

[MIT License](https://joshuaptfan.mit-license.org/)
