import { type Formula, type PropVar, and, propVars, vars } from "./syntax";
import { decode, encode, permutations, power } from "./utils";

export const worlds = ["a", "b", "c", "d"] as const;

export type World = (typeof worlds)[number];

export type Relation = `${World}${World}`;
export const left = (rel: Relation) => rel[0] as World;
export const right = (rel: Relation) => rel[1] as World;

export const relation: Relation[] = worlds.flatMap((w) =>
  worlds.map((x) => `${w}${x}` as const),
);

export interface Frame {
  relations: Set<Relation>;
}

export interface Model extends Frame {
  valuations: Set<`${World}${PropVar}`>;
}

export function valuation(fml?: Formula): `${World}${PropVar}`[] {
  const vs = fml ? Array.from(vars(fml)) : propVars;
  return worlds.flatMap((w) => vs.map((p) => `${w}${p}` as const));
}

export function satisfy(m: Model, w: World, fml: Formula): boolean {
  switch (fml.type) {
    case "top":
      return true;
    case "bot":
      return false;
    case "propvar":
      return m.valuations.has(`${w}${fml.name}`);
    case "not":
      return !satisfy(m, w, fml.fml);
    case "box": {
      for (const rel of m.relations.values()) {
        if (left(rel) !== w) continue;
        if (!satisfy(m, right(rel), fml.fml)) return false;
      }
      return true;
    }
    case "diamond": {
      for (const rel of m.relations.values()) {
        if (left(rel) !== w) continue;
        if (satisfy(m, right(rel), fml.fml)) return true;
      }
      return false;
    }
    case "to": {
      if (!satisfy(m, w, fml.left)) return true;
      return satisfy(m, w, fml.right);
    }
    case "or": {
      if (satisfy(m, w, fml.left)) return true;
      return satisfy(m, w, fml.right);
    }
    case "and": {
      if (!satisfy(m, w, fml.left)) return false;
      return satisfy(m, w, fml.right);
    }
    case "iff": {
      return satisfy(m, w, fml.left) === satisfy(m, w, fml.right);
    }
  }
}

export const validInModel = (m: Model, fml: Formula) =>
  worlds.every((w) => satisfy(m, w, fml));

export function validInFrame(f: Frame, fml: Formula) {
  for (const valuations of power(valuation(fml))) {
    if (!validInModel({ ...f, valuations }, fml)) return false;
  }
  return true;
}

export function validWorlds(f: Frame, fml: Formula) {
  const result: World[] = [];
  for (const w of worlds) {
    let valid = true;
    for (const valuations of power(valuation(fml))) {
      if (!satisfy({ ...f, valuations }, w, fml)) {
        valid = false;
        break;
      }
    }
    if (valid) result.push(w);
  }
  return result;
}

export function getFrame(id: number): Frame {
  return { relations: decode(relation, id) };
}

export function getId(frame: Frame) {
  return encode(relation, frame.relations);
}

const worldPermutations = permutations(worlds).map(
  (perm) => new Map(worlds.map((k, i) => [k, perm[i]])),
);

function applyPermutation<T extends Frame>(
  frame: T,
  permutation: Map<World, World>,
) {
  const relations = new Set<Relation>();
  for (const rel of frame.relations) {
    const l = left(rel);
    const r = right(rel);
    relations.add(
      `${permutation.get(l) ?? l}${permutation.get(r) ?? r}` as Relation,
    );
  }
  return { ...frame, relations } as T;
}

export function generateAllFrames() {
  const canonicals: number[] = [];
  const map = new Map<number, number>();

  const total = 2 ** relation.length;
  for (let id = 0; id < total; id++) {
    if (map.has(id)) continue;

    const relations = decode(relation, id);
    const frame = { relations };
    const equivalentIds: number[] = [];

    let canonicalId = id;
    for (const perm of worldPermutations) {
      const permuted = applyPermutation(frame, perm);
      const permutedId = encode(relation, permuted.relations);
      equivalentIds.push(permutedId);
      if (canonicalId === null || permutedId < canonicalId) {
        canonicalId = permutedId;
      }
    }

    canonicals.push(canonicalId);
    for (const equivalentId of equivalentIds) {
      map.set(equivalentId, canonicalId);
    }
  }

  const mapping: Uint16Array = new Uint16Array(total);
  for (let id = 0; id < total; id++) {
    const value = map.get(id);
    if (value === undefined) throw Error(`impossible (${id})`);
    mapping[id] = value;
  }

  return { canonicals, mapping };
}

const { canonicals, mapping } = generateAllFrames();
export { canonicals, mapping };
