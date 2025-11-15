# How Games and AI Think

Strategy games feel alive because rules shape behavior and smart opponents respond to every move. In Super Tic-Tac-Toe, the same mathematical ideas that make rule sets interesting also power the AI that fights back. This lesson combines those perspectives so you can understand both the board's personality and the digital mind across from you.

## Rules Give Games a Personality

Game theory says a ruleset is like DNA: change a gene, and the organism behaves differently. Simple tweaks decide whether a match feels fair, frantic, or contemplative.

- **Emergent complexity**: Even 3×3 tic-tac-toe, with only 138 unique states, teaches planning and pattern spotting. Scale to a 9×9 meta-board and the possibility space explodes beyond 10^50 positions.
- **Skill vs. surprise**: Good rules reward smart play but keep just enough unpredictability—forcing players to weigh risk, tempo, and territory.
- **Shared information**: Super T3 is a perfect-information game. Every piece is visible, so outcomes hinge on decision quality, not hidden cards or dice.

## Super T3 Case Study: Three Ways to Play

| Ruleset | Key Rule | Strategic Vibe |
| --- | --- | --- |
| **Classic** | Winning a mini-board locks ownership forever, but the spaces remain playable. | A diplomatic land-grab where early territory gives lasting leverage. Mistakes linger, so cautious players thrive. |
| **Modern** | Captured or drawn boards close immediately. | The arena shrinks every turn. Aggressive players use fast strikes to cut off options and race to meta-lines. |
| **Battle** (default) | Boards stay live and can be recaptured until full. | Tug-of-war pressure. You must attack and defend simultaneously, weighing whether a capture is stable or bait. |

Each variant changes the value of routing (the board you send your opponent to next), meaning the "best" move often depends on both local wins and future destinations.

## Thinking in Decision Trees

When you pick a square, your brain sketches a tree of possibilities: "If I go here, they must play there…" Depth matters. Forks—positions that create two simultaneous threats—force the opponent into a lose/lose response. Super T3 adds layers:

- **Micro forks**: Two threats inside one mini-board.
- **Meta forks**: Owning two boards in a line and pressuring the third.
- **Routing traps**: Sacrificing a local win so the opponent lands on a terrible board.

Perfect play would lead to many draws, just like in chess at grandmaster level, but humans (and even AI under time pressure) rarely see everything. That's where our digital opponent comes in.

## Meet the Four AI Personalities

We tuned four distinctive AIs so every player can find a fun challenge:

1. **Easy – The Forgetful Friend**
   - Spots instant wins but purposely "forgets" to block about half the time.
   - Uses light heuristics (centers > corners) plus randomness for variety.
2. **Normal – The Strategic Thinker**
   - Always blocks threats, looks two moves ahead, and sometimes makes tiny blunders (~12%) to stay human-like.
   - Scores moves by counting patterns that create or block future forks.
3. **Hard – The Chess Master**
   - Runs minimax search 4–6 plies deep with alpha-beta pruning and a 750 ms budget per move.
   - Orders candidate moves by promise, caches repeated states, and sprinkles minimal randomness when Adaptive mode is off.
4. **Expert – The Perfect Machine**
   - Extends think time to ~1.4 s (and longer in endgames) and removes all randomness.
   - When Adaptive mode is on and you are in the "flow" band, it adds Monte Carlo Tree Search rollouts for extra foresight.

## How the AI Chooses a Move

1. **Opening book**: Early in the game, the AI checks a small library of proven sequences (e.g., center-center starts) to avoid aimless wandering.
2. **Immediate tactics**: It grabs instant wins or blocks yours before doing anything fancy.
3. **Generate & order moves**: Every legal move is scored quickly so promising options are searched first (centers, threats, routing plays).
4. **Search the tree**: Depending on difficulty, the AI explores alternating player turns, pruning branches that obviously fail. Leaves are evaluated with a shared heuristic that values board ownership, threats, routing control, and—under Battle rules—stability against recapture.
5. **Make the call**: After thousands of simulated futures, it chooses the move with the best outcome under the assumption that you counter perfectly.

## Adaptive Difficulty & Fun Facts

- **Tuning bands**: If you're losing several games, Adaptive mode eases up (shallower search, faster decisions). If you're dominating, it digs deeper. Close matches keep the default "flow" behavior.
- **Speed**: Hard can examine 10k–50k positions per second on a laptop browser.
- **Memory**: Transposition tables cache evaluated states so the AI can recall them instantly later in the match.
- **Diagnostics**: Enable `localStorage.setItem("st3.aiDebug", "1")` to log candidate scores and see the engine's thought process.

## What to Practice Next

- **Spot forks early**: Try to find two threats before the AI does—it's the fastest way to force errors.
- **Plan the destination**: Before taking a juicy win, ask which board you are sending the opponent to and whether it strengthens or weakens your meta plan.
- **Play both sides**: Switching between Classic, Modern, and Battle teaches how rule tweaks change the "value" of every square.
- **Think like the AI**: Pause and imagine the opponent's best reply. The more you imitate the search process, the faster you'll improve.

Games are laboratories for thinking. When you understand both the rules' personality and the AI's logic, every match becomes a chance to experiment, learn, and have more fun.
