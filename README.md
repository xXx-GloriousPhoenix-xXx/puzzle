# Puzzle

Implementation of a puzzle-solving app for the **Become a Developer** internship program.

---

## How It Works

Each puzzle fragment is a 6-digit string split into three parts:

| Part    | Digits | Description              |
|---------|--------|--------------------------|
| `inner` | 0–1    | Left connector           |
| `value` | 2–3    | Payload of the fragment  |
| `outer` | 4–5    | Right connector          |

Fragments are chained when `fragment[n].outer === fragment[n+1].inner`.  
The goal is to find the **longest possible chain** of fragments.

---

## Usage

```bash
npm install
npm run start
```

You will be prompted to choose a mode:

```
? Оберіть режим:
❯ Звичайний (data/)
  Тест (test_*/)
```

### Normal mode

Reads from `./data/source.txt`, finds the longest chain, writes the result to `./data/destination.txt`.

### Test mode

```
? Оберіть тест:
❯ Всі тести
  1
  2
```

Runs one or all tests and compares output against the expected result.

---

## Project Structure

```
puzzle/
├── data/
│   ├── source.txt        # Input fragments
│   └── destination.txt   # Output result (generated)
├── test/
│   ├── test_1/
│   │   ├── source.txt    # Test input
│   │   └── expected.txt  # Expected output
│   └── test_2/
│       ├── source.txt
│       └── expected.txt
├── app.ts
├── package.json
└── tsconfig.json
```

---

## Time Complexity

| Operation               | Complexity     | Notes                                                              |
|-------------------------|----------------|--------------------------------------------------------------------|
| Reading fragments       | O(n)           | One pass through the file lines                                    |
| Building adjacency list | O(n²)          | Each fragment compared against all others                          |
| Finding longest path    | O(n! / worst)  | DFS with backtracking + Warnsdorff heuristic + pruning; NP-hard problem, heuristic significantly reduces search space in practice |
| Merging result          | O(n)           | Single pass through the chain                                      |
| Writing result          | O(1)           | Single file write                                                  |

---

## Algorithm — Longest Path (DFS + Backtracking)

Finding the longest path in a directed graph is an **NP-hard** problem.  
This implementation uses three techniques to make it practical:

- **DFS with backtracking** — explores all possible paths, backtracks on dead ends
- **Warnsdorff heuristic** — at each step, prefers nodes with the fewest onward moves, reducing dead ends early
- **Pruning** — skips branches where even the optimistic remaining count cannot beat the current best

---

## Dependencies

| Package             | Purpose                        |
|---------------------|--------------------------------|
| `tsx`               | TypeScript runner (ESM-native) |
| `@inquirer/prompts` | Interactive CLI prompts        |
| `chalk`             | Colored terminal output        |