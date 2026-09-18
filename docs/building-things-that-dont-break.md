# Building Things That Don't Break: Software Testing and Quality

Imagine if every time you played our game, there was a chance that:

- Your winning move didn't register
- The AI froze mid-game
- Your phone crashed when you changed themes
- The rules quietly switched from Classic to Battle halfway through

That's what software testing exists to prevent. When you tap "New Game," the same reliable thing should happen every single time. Getting there takes three habits of mind: the detective's, the scientist's, and the builder's.

## Think Like a Detective

Testers are professionally suspicious. Their trick is to imagine every way something could go wrong, then check whether it does. When we test Super Tic-Tac-Toe, we don't just play normal games. We ask awkward questions:

- What if someone taps the same cell twice, really fast?
- What if someone switches themes in the middle of an animation?
- What if the screen is as narrow as a smartwatch?
- What if someone leaves the game open for 12 hours?
- What if someone's browser doesn't support a CSS feature we use?
- What if someone hammers "New Game" fifty times in a row?

Three of those turned into real work on our game:

**The impatient player.** A player taps a cell before the previous move's animation has finished. Risk: the game state gets confused and a move is lost. What we did: input is locked until the board is ready for the next move.

**The mid-animation theme switch.** A player changes theme while a board-winning animation is playing. Risk: two sets of styles fight and the board glitches. What we did: theme colors are CSS variables that transition smoothly, so a change mid-animation blends in instead of fighting.

**The tiny screen.** The game runs on a phone 320 pixels wide. Risk: buttons too small to tap, text too small to read. What we did: a responsive layout with minimum touch-target sizes and fonts that scale.

## Test on Purpose

Suspicion finds bugs. A plan finds them systematically. We sort our tests into five questions:

- **Does it work?** Can you actually win under each of the three rule sets, and does the AI only ever make legal moves?
- **Is it fast enough?** Do animations stay smooth on an old phone, and does the AI answer quickly on every difficulty?
- **Is it easy to use?** Can a new player work out the rules without being told, and can a color-blind player tell the pieces apart?
- **Does it work everywhere?** Chrome, Safari, Firefox, Edge; phone, tablet, desktop: the same game on all of them?
- **Is it safe?** The game runs entirely on your device and stores no personal data, so there's no server to attack. We check that stays true.

The most productive place to look is the edge of normal. What happens on the exact millisecond an animation starts? After 1,000 games in a row, does the saved history in your browser fill up? What's the smallest screen that's still playable, and the biggest that still looks right? Bugs love boundaries.

## Let the Computer Do the Boring Part

Humans are good at noticing that something looks wrong, imagining strange situations, and judging how the game feels. Computers are good at running the same check ten thousand times without getting bored. So we write tests as code, and they run while we sleep. They come in three sizes.

Unit tests check one piece on its own:

```javascript
// Does win detection work?
function testWinDetection() {
  const winningPattern = ["X", "X", "X", null, "O", null, "O", null, null];
  assert(detectWinner(winningPattern) === "X");
}
```

Integration tests check that pieces work together:

```javascript
// When a player wins a mini-board, does the big board notice?
function testMacroBoardUpdate() {
  simulateMove(0, 0); // Player X
  simulateMove(0, 4); // Player O
  simulateMove(0, 1); // Player X
  simulateMove(0, 5); // Player O
  simulateMove(0, 2); // Player X wins mini-board 0

  assert(getMacroBoardState()[0] === "X");
}
```

End-to-end tests play the game the way a person would:

```javascript
// Can a player get through a whole game?
function testCompleteGameflow() {
  clickNewGameButton();
  selectSoloMode();
  selectNormalDifficulty();
  selectBattleRules();
  playUntilGameComplete();

  assert(gameResultIsDisplayed());
  assert(playAgainButtonIsVisible());
}
```

## Design the Bugs Out

The cheapest bug is the one that can't happen. Four choices in how our game is built rule out whole categories of mistakes.

The engine never lets anyone edit the board directly. It hands out copies, so no part of the code can corrupt another part's view, and replaying a game is easy.

The code is written in TypeScript, which checks types before the game ever reaches you:

```typescript
function makeMove(boardIndex: number, cellIndex: number) {
  // ...
}

makeMove("invalid", 5); // Error at build time, not in your browser
```

The game logic, the AI, and the interface are kept separate, so a bug in a theme can't change the rules and a change to the AI can't break a button.

And the game has zero runtime dependencies: no outside libraries that could bring their own bugs, security holes, or surprise updates.

Even so, things will go wrong, and good software fails politely. Try an illegal move and you get a short dialog explaining why, and the board stays exactly as it was. If your browser lacks a fancy CSS feature, the styling falls back to something simpler and the game still plays.

## Testing an Opponent That Changes Its Mind

Our AI adapts to how you play, so it can make different moves from the same position. You can't test that with a single "expected answer." Instead we play it many games and check that its behavior stays inside the range we want: challenging, fair, and never slow, even on the most complicated board positions.

## Why It Matters

A tic-tac-toe bug costs you a game. The same kind of bug in a pacemaker, a car's braking software, a bank, or a voting system costs far more. Somewhere between those extremes is every app you use, and every one of them is asking for your time and your trust. Every bug prevented is a frustrating half-hour someone never has to have.

## Start Here

You can practice this on your own projects today:

- Feed your program something it doesn't expect: an empty input, a huge number, a word where it wants a number
- Try it on a phone, not just your laptop
- Ask a friend to break it. They will find things you didn't
- Learn your browser's developer tools; they show you what the page is really doing
- Read a post-mortem of a famous software failure and ask what test would have caught it

## The Point

No software is perfect, including ours. Quality isn't perfection. It's responsibility: understanding who uses your software, testing it honestly, fixing problems fast, and learning from each one. When you play a game and it just works, that's not luck. Somebody cared. The best software isn't the one with the most features. It's the one you can trust.
