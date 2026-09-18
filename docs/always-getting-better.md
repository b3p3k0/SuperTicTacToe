# Always Getting Better

The game worked. People played it. The Hard and Expert opponents beat most of us most of the time. We called the AI done and moved on to themes, lessons, and buttons.

"Done" is a feeling, not a fact. This lesson is about the day we found that out.

## The Question We Almost Didn't Ask

Months after the AI shipped, new AI coding partners came out. They were much better than the ones that helped us build the game. So we tried something simple. We gave one the whole project and asked, in plain words: "Look at this critically and tell us what could be better." No hints. No list of suspects.

The answer came back as a ranked list. At the top was a sentence we did not expect: the Hard and Expert opponents cannot finish a won game.

## The Bug

Here is the position. O owns two big boards in a row. The third board in that row has two O marks and one empty square. Playing that square wins the whole game.

Normal, the middle difficulty, took the win every time. Hard and Expert, the strong ones, played somewhere else. Every time. In every rule set.

Why? The AI thinks in points. It looks a few moves ahead, adds up points for each position it can reach, and picks the move with the highest total. Owning a big board was worth 140 points or more. Winning the game was worth about 98 points.

Read that again. A finished, won game scored less than "I own one extra board." So the closer the AI got to winning, the less it wanted to win. Two different rulers had been used for two kinds of score, and nobody had held them side by side.

We had played hundreds of games against it and never noticed. Hard still won a lot, because it was very good at grabbing boards. It just took the long way round, and sometimes the long way gave us time to escape.

## Trust, But Measure

An AI partner told us this. We wanted proof, and we wanted a number, not a feeling.

So we built a tool. It makes the game's AI play against itself, hundreds of games in a few minutes, on the real rules engine. After every move, the tool asks two questions:

- Was there a move that won the game right now, and did the AI take it?
- Was there a move that lost the game next turn, and did the AI avoid it?

Then we ran 100 games of Hard against Hard in Battle mode. In those games the AI had 177 chances to win on the spot. It missed 91 of them. It walked into a one-move loss 106 times, out of 519 positions where a safe move existed.

That is not a small bug. That is a coin flip on the most important move of the game.

The tool also plays every difficulty against every other and prints a table. Expert, the level we call our best, scored 0.40 against Hard. It lost more than it won against the level below it. Nobody had ever checked.

The fix was a few lines: make "game won" worth more than any pile of boards, and check for a winning move before searching at all. Then we ran the same 100 games again. Missed wins: 0 of 93. Walked into a loss: 0 of 614.

If you have the code, you can run this yourself:

```bash
node bench/selfplay.mjs --games 100 --matchup hard-vs-hard
```

## The Second Surprise

With the first bug fixed, the tool kept running, and the numbers kept talking.

The AI has a notebook. When it scores a position, it writes the score down so it never has to score that position twice. Good idea. But the note did not record how far ahead the AI had looked when it wrote it. So when the AI came back to look deeper, it found the old note, trusted it, and stopped. For almost a year it had been looking four moves ahead while the code said six.

We took the notebook away. Now the AI really looks five moves ahead on Hard and up to seven on Expert. It takes a little longer to choose a move, and it wins about two games in three against the version that had the notebook. Slower and stronger was an easy trade.

## Making It Stick

A fix is only half a fix. The other half is making sure the bug cannot sneak back in.

We wrote 24 small tests. Each one sets up a board, asks the AI for a move, and checks whether it took the win or dodged the loss. On the old code, 17 of the 24 fail. On the new code, all 24 pass. Now every time anyone changes the AI, the tests run in a few seconds and tell us if the old mistake has returned.

The same review found more. The Battle rules say you can steal a board back by making a new three-in-a-row. The code let a board change hands on any move at all, once both players had a line in it. Our own paper rulesheet had it right; the program did not. That got a fix and a test too.

## Why We Keep Going

Three things we learned, and want you to keep.

Working is not the same as right. The game played fine. People had fun. The bug was there the whole time, waiting for a position that mattered.

Better tools change what is easy. A review like this used to mean a week of careful reading. This one took a day, because we could ask plainly and get a real answer. But the answer only counted after we checked it with our own tool and our own numbers. Ask boldly. Verify stubbornly.

The best time to look for problems is when you think there are none. That is exactly when nobody else is looking.

## Start Here

- Pick something you made that works. Ask a friend, or an AI, what could be better. Do not explain or defend. Just listen and write it down.
- Before you fix anything, measure it. Write down one number. Fix it. Write the number again.
- Turn every bug you fix into a test, so it stays fixed.
- When something feels finished, that is your cue to look again.

## The Point

Our AI was strong for almost a year and wrong the whole time. We did not find out by being clever. We found out by asking, measuring, and refusing to settle. Whatever you build, that is the habit worth keeping: it works today, so let's make it better tomorrow.
