import {
  type Token,
  alt,
  apply,
  buildLexer,
  expectEOF,
  expectSingleResult,
  kmid,
  lrec_sc,
  rule,
  seq,
  tok,
} from "typescript-parsec";
import { type Relation, worlds } from "./semantics";
import {
  type Formula,
  and,
  bot,
  box,
  diamond,
  iff,
  not,
  or,
  propVars,
  propvar,
  to,
  top,
} from "./syntax";

enum TokenKind {
  PropVar = 0,
  Top = 1,
  Bot = 2,
  Not = 3,
  Box = 4,
  Diamond = 5,
  And = 6,
  Or = 7,
  To = 8,
  Iff = 9,
  LParen = 10,
  RParen = 11,
  Space = 12,
}

const lexer = buildLexer([
  [true, /^[pqrs]/g, TokenKind.PropVar],
  [true, /^(T|⊤|1|\\top)/g, TokenKind.Top],
  [true, /^(F|⊥|0|\\bot)/g, TokenKind.Bot],
  [true, /^(~|¬|\\neg|\\lnot)/g, TokenKind.Not],
  [true, /^(\[\]|□|L|\\Box)/g, TokenKind.Box],
  [true, /^(<>|⋄|M|\\Diamond)/g, TokenKind.Diamond],
  [true, /^(&|\^|∧|\\wedge|\\land)/g, TokenKind.And],
  [true, /^(\||v|∨|\\vee|\\lor)/g, TokenKind.Or],
  [true, /^(->|→|\\rightarrow|\\to|\\implies)/g, TokenKind.To],
  [true, /^(<->|↔|\\leftrightarrow|\\iff)/g, TokenKind.Iff],
  [true, /^(\(|\\left\()/g, TokenKind.LParen],
  [true, /^(\)|\\right\))/g, TokenKind.RParen],
  [false, /^\s+/g, TokenKind.Space],
]);

function atom(
  value: Token<TokenKind.PropVar | TokenKind.Top | TokenKind.Bot>,
): Formula {
  switch (value.kind) {
    case TokenKind.PropVar: {
      if (propVars.includes(value.text)) {
        return propvar(value.text);
      }
      throw new Error(`Unknown atom: ${value.text}`);
    }
    case TokenKind.Top:
      return top;
    case TokenKind.Bot:
      return bot;
    default:
      throw new Error(`Unknown atom: ${value.text}`);
  }
}

function unary([op, value]: [
  Token<TokenKind.Not | TokenKind.Box | TokenKind.Diamond>,
  Formula,
]): Formula {
  switch (op.kind) {
    case TokenKind.Not:
      return not(value);
    case TokenKind.Box:
      return box(value);
    case TokenKind.Diamond:
      return diamond(value);
    default:
      throw new Error(`Unknown unary operator: ${op.text}`);
  }
}

function binary(
  left: Formula,
  [op, right]: [
    Token<TokenKind.And | TokenKind.Or | TokenKind.To | TokenKind.Iff>,
    Formula,
  ],
): Formula {
  switch (op.kind) {
    case TokenKind.And:
      return and(left, right);
    case TokenKind.Or:
      return or(left, right);
    case TokenKind.To:
      return to(left, right);
    case TokenKind.Iff:
      return iff(left, right);
    default:
      throw new Error(`Unknown binary operator: ${op.text}`);
  }
}

const TERM = rule<TokenKind, Formula>();
const ANDOR = rule<TokenKind, Formula>();
const EXP = rule<TokenKind, Formula>();

TERM.setPattern(
  alt(
    apply(
      alt(tok(TokenKind.PropVar), tok(TokenKind.Top), tok(TokenKind.Bot)),
      atom,
    ),
    apply(
      seq(
        alt(tok(TokenKind.Not), tok(TokenKind.Box), tok(TokenKind.Diamond)),
        TERM,
      ),
      unary,
    ),
    kmid(tok(TokenKind.LParen), EXP, tok(TokenKind.RParen)),
  ),
);

ANDOR.setPattern(
  lrec_sc(TERM, seq(alt(tok(TokenKind.And), tok(TokenKind.Or)), ANDOR), binary),
);

EXP.setPattern(
  lrec_sc(ANDOR, seq(alt(tok(TokenKind.To), tok(TokenKind.Iff)), EXP), binary),
);

export function parse(expr: string): Formula {
  return expectSingleResult(expectEOF(EXP.parse(lexer.parse(expr))));
}

const frameLexer = buildLexer([
  [true, /^[abcd]/g, "world" as const],
  [true, /^(R|<|≺|\\prec)/g, "relation" as const],
  [true, /^,/g, "separator" as const],
  [false, /^\s+/g, "spaces" as const],
]);

const RELATION = rule<
  "world" | "relation" | "separator" | "spaces",
  Set<Relation>
>();
RELATION.setPattern(
  apply(seq(tok("world"), tok("relation"), tok("world")), ([x, _r, y]) => {
    const w1 = x.text;
    const w2 = y.text;
    if (!worlds.includes(w1) || !worlds.includes(w2)) throw new Error();
    return new Set<Relation>([`${w1}${w2}`]);
  }),
);
const RELATIONS = rule<
  "world" | "relation" | "separator" | "spaces",
  Set<Relation>
>();
RELATIONS.setPattern(
  lrec_sc(
    RELATION,
    seq(tok("separator"), RELATIONS),
    (l, [_s, r]) => new Set<Relation>([...l, ...r]),
  ),
);

export function parseFrame(expr: string): Set<Relation> {
  return expectSingleResult(expectEOF(RELATIONS.parse(frameLexer.parse(expr))));
}
