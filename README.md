# KRIPKE

## Setup

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.33. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Rules

* A Kripke frame with 4 worlds is generated.
* The game tells you how many accessibility relations are in the frame, but *not* the exact shape of it.
* You have a total of 10 moves. In each move you can do one of the following:
    - Enter a modal formula.
      - The game tells you in how many worlds the formula is valid (for every valuation).
    - Guess the Kripke frame.
      - If your frame is equal or isomorphic to the secret frame, you win.
* You lose when you run out of moves.

A typical gameplay looks like this:
```
A new Kripke frame is created! It has 4 worlds and 4 relations.
[10] Lp -> p
valid in 1 worlds, invalid in the rest.
[9] ~L0
valid in 3 worlds, invalid in the rest.
[8] ML0
valid in 1 worlds, invalid in the rest.
[7] (Lp -> p) & ML0
invalid.
[6] M(Lp -> p) & ML0
invalid.
[5] M(Lp -> p)
valid in 2 worlds, invalid in the rest.
[4] !guess aRa, bRc, bRd, dRa
incorrect.
[3] !guess aRa, bRc, dRa, dRb
incorrect.
[2] !guess aRa, bRc, dRa, dRc
incorrect.
[1] !guess aRa, bRc, dRa, aRd
correct! congratulations!!
id: 389
a ==> a
a ==> c
b ==> d
c ==> a
```

A professional gameplay:
```
A new Kripke frame is created! It has 4 worlds and 11 relations.
[10] ~L0
valid!
[9] Lp -> p
valid!
[8] LLp -> Lp
valid!
[7] L(L(p -> Lp) -> p) -> p
valid in 1 worlds, invalid in the rest.
[6] (L(L(p -> Lp) -> p) -> p) & (Lp v L(p -> q))
valid in 1 worlds, invalid in the rest.
[5] M((L(L(p -> Lp) -> p) -> p) & (Lp v L(p -> q)))
valid!
[4] !guess aRa, aRb, aRc, aRd, bRa, bRb, bRc, cRc, dRa, dRc, dRd
correct! congratulations!!
id: 36287
a ==> a
a ==> b
a ==> c
a ==> d
b ==> a
b ==> b
b ==> d
c ==> a
c ==> c
c ==> d
d ==> d
```

## Syntax

See `syntax.ts` for details.

### Formulae

You may use the following symbols:
* propositional variables, `p`, `q`, `r`, `s` (four are enough)
* verum: `T`, `⊤`, `1`, `\top`
* falsum: `F`, `⊥`, `0`, `\bot`
* negation: `~`, `¬`, `\neg`, `\lnot`
* box modality: `[]`, `□`, `L`, `\Box`
* diamond modality: `<>`, `⋄`, `M`, `\Diamond`
* conjunction: `&`, `^`, `∧`, `\wedge`, `\land`
* disjunction: `|`, `v`, `∨`, `\vee`, `\lor`
* implication: `->`, `→`, `\rightarrow`, `\to`, `\implies`
* equivalence: `<->`, `↔`, `\leftrightarrow`, `\iff`
* parentheses: `(`, `)`

All operators are right associative.

### Frames

You may use the following symbols:
* worlds: `a`, `b`, `c`, `d`
* accessibility relation: `R`, `<`, `≺`, `\prec`
* comma: `,` (to separate relations)

## License

MIT
