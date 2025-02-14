export type PropVar = "p" | "q" | "r" | "s";

export const propVars: PropVar[] = ["p", "q", "r", "s"];

export type Formula =
  | { type: "top" | "bot" }
  | { type: "propvar"; name: PropVar }
  | { type: "not" | "box" | "diamond"; fml: Formula }
  | {
      type: "to" | "or" | "and" | "iff";
      left: Formula;
      right: Formula;
    };

export function vars(fml: Formula): Set<PropVar> {
  switch (fml.type) {
    case "top":
    case "bot":
      return new Set();
    case "box":
    case "diamond":
    case "not":
      return vars(fml.fml);
    case "to":
    case "or":
    case "and":
    case "iff":
      return new Set([...vars(fml.left), ...vars(fml.right)]);
    case "propvar":
      return new Set([fml.name]);
  }
}

export const propvar = (name: PropVar) => ({ type: "propvar", name }) as const;

export const top = { type: "top" } as const satisfies Formula;
export const bot = { type: "bot" } as const satisfies Formula;

export const box = (fml: Formula) =>
  ({ type: "box", fml }) as const satisfies Formula;
export const diamond = (fml: Formula) =>
  ({ type: "diamond", fml }) as const satisfies Formula;
export const not = (fml: Formula) =>
  ({ type: "not", fml }) as const satisfies Formula;

export const to = (left: Formula, right: Formula) =>
  ({ type: "to", left, right }) as const satisfies Formula;
export const and = (left: Formula, right: Formula) =>
  ({ type: "and", left, right }) as const satisfies Formula;
export const or = (left: Formula, right: Formula) =>
  ({ type: "or", left, right }) as const satisfies Formula;
export const iff = (left: Formula, right: Formula) =>
  ({ type: "iff", left, right }) as const satisfies Formula;
