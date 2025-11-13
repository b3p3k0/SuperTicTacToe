# How the AI Opponent Works

Have you ever wondered how a computer can play games against you? It's not magic – it's actually a sophisticated decision-making system that thinks through moves just like you do, but much faster!

Imagine you're playing chess against a grandmaster. Before making each move, they're not just looking at the current board. They're thinking: "If I move here, my opponent will probably move there, then I could move here, and they might respond like this..." They're mentally playing out the game several moves ahead, weighing different possibilities.

Our Super Tic-Tac-Toe AI works similarly, but instead of one grandmaster, we've created four different AI "personalities," each with their own playing style and decision-making approach.

## Meet the Four AI Personalities

### Easy AI: The Forgetful Friend
The Easy AI is like playing against a friend who's still learning the game. It knows how to win when it sees the opportunity, but it doesn't always remember to block your winning moves.

**How it thinks:**
- It always takes a winning move when it sees one
- But it only remembers to block your wins about 45% of the time (it "forgets" 55% of the time!)
- For other moves, it picks decent spots but adds some randomness to keep things unpredictable

**Technical Detail:** The Easy AI uses something called "priority scoring" – it knows that center squares are generally better than corner squares, but then adds random "noise" to its decisions so it doesn't play perfectly predictably.

### Normal AI: The Strategic Thinker
The Normal AI is like playing against someone who's gotten pretty good at the game. It thinks ahead and rarely makes obvious mistakes, but it's not perfect.

**How it thinks:**
- Always blocks your winning moves (unlike Easy AI)
- Looks ahead 2 moves: "If I play here, what's the best move my opponent could make in response?"
- Uses pattern recognition to spot good combinations
- Sometimes makes deliberate small mistakes (about 12% of the time) to avoid being too predictable

**Mathematical Insight:** This AI evaluates each possible move by looking at all the ways it could lead to three-in-a-row patterns. It gives higher scores to moves that create multiple threats or block opponent threats.

### Hard AI: The Chess Master
Now we're getting serious! The Hard AI uses advanced algorithms that chess computers have used for decades.

**How it thinks:**
- Uses an algorithm called "minimax" – it assumes both players will make the best possible moves
- Looks ahead 4-6 moves deep (depending on how complex the position is)
- Has a "thinking budget" of about 750 milliseconds per move (but gets more time in complex endgames)
- Uses "alpha-beta pruning" – a clever trick that lets it skip evaluating moves that obviously won't matter

**The Cool Part:** The Hard AI remembers positions it has already calculated using a cache system. If it encounters the same position later, it instantly knows the answer without recalculating!

> **Static vs Adaptive Hard**
>
> - When the Adaptive Difficulty toggle is **off**, Hard sticks to its classic jittered personality (no Monte Carlo search, light randomness, steady 750 ms think time).
> - When Adaptive is **on** and you’re in the “flow” band, Hard becomes fully deterministic and plugs in a short burst of Monte Carlo Tree Search before each move, using the extra smarts only when you ask for it.

### Expert AI: The Perfect Machine
The Expert AI is like playing against a computer that never makes mistakes and never gets distracted.

**How it thinks:**
- Same algorithms as Hard AI, but with zero randomness
- Gets more thinking time (up to 1.4 seconds per move, 6 seconds in endgames)
- Uses more sophisticated position evaluation
- Never introduces any "jitter" or randomness into its decisions

> **Adaptive Expert Boost**
>
> When you enable Adaptive Difficulty and land in the “flow” band, Expert shifts into high gear: it raises the weight it gives to meta-board threats, spends a bigger Monte Carlo budget, and stretches its think time to roughly two seconds. The result is an AI that leans harder into long-term captures instead of just trading local wins.

## How the AI Actually Picks a Move

Let's follow along as the Hard AI decides what to do:

### Step 1: Opening Book Check
First, the AI checks if it has any "memorized" opening moves. Just like chess players study opening theory, our AI knows a few good standard starts:
- If it's going first, it usually plays the center square of the center board
- If you played center-center, it has a prepared response

### Step 2: Immediate Opportunities
Next, it scans for game-ending moves:
- Can it win immediately? If yes, it plays that move
- Can it block you from winning? If yes, it blocks you

### Step 3: The Deep Search
If there's no immediate win or block, it starts the real thinking process:

1. **Generate Candidates**: It lists all legal moves
2. **Order by Promise**: It sorts them by which look most promising (center squares, pattern-creating moves, etc.)
3. **Search Ahead**: For each promising move, it thinks through the game tree:
   - "If I play this move, what's your best response?"
   - "After your best response, what's my best counter-response?"
   - "After my counter, what's your best move?"
   - And so on...

### Step 4: Position Evaluation
When it reaches the end of its search depth, it evaluates the position by counting:
- Threat patterns (how close each player is to winning)
- Board control (who has more influence over key areas)
- Strategic factors (like controlling the center boards)

### Step 5: The Final Decision
After exploring thousands of possible game sequences, it chooses the move that leads to the best position for itself, assuming you also play perfectly.

## The Secret Sauce: Adaptive Learning

Here's something really cool – the AI doesn't always play at exactly the same strength. It has an "adaptive tuning" system that adjusts based on how you're doing:

- **If you're struggling** (losing several games): The AI might think a bit faster, make slightly more mistakes, or search less deeply
- **If you're doing well** (winning or tied): The AI might think longer, search deeper, or play more precisely
- **If you're in the zone** (competitive games): It maintains its normal strength

This system has three "bands":
- **Struggle Band**: AI eases up slightly
- **Flow Band**: Normal AI strength
- **Coast Band**: AI plays a bit stronger

## Fun Technical Facts

**Speed**: The Hard AI can evaluate about 10,000-50,000 possible positions per second, depending on the complexity.

**Memory**: It uses a caching system that can store thousands of previously-calculated positions to avoid redundant work.

**Pattern Recognition**: The AI knows all 8 possible ways to win a mini-board and uses this to instantly recognize threats and opportunities.

**Time Management**: Like a chess player in a tournament, the AI budgets its thinking time – it thinks longer in complex positions and faster in simple ones.

**Monte Carlo Tree Search**: The Expert difficulty sometimes uses an additional algorithm called MCTS that "plays out" random games to evaluate positions – like having the AI play against itself thousands of times in a few minutes!

## Why This Matters

Understanding how the AI works helps you become a better player! Now that you know it:
- Thinks several moves ahead
- Prioritizes center squares
- Looks for pattern-forming moves
- Always blocks immediate threats

You can try to think like the AI: look ahead, create multiple threats, and control the center boards. The AI might be fast, but human intuition and creativity can still find moves that surprise even the most sophisticated algorithms!
