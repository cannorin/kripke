const bitIsSet = (num: number, pos: number) => (num & (1 << pos)) !== 0;

export function encode<T>(all: readonly T[], set: Set<T>): number {
  let flags = 0;
  for (let i = 0; i < all.length; i++) {
    if (set.has(all[i])) {
      flags |= 1 << i;
    }
  }
  return flags;
}

export function decode<T>(all: readonly T[], flags: number): Set<T> {
  const total = 2 ** all.length;
  if (flags < 0 || flags >= total) throw Error("invalid flags");
  const decoded = new Set<T>();
  for (let j = 0; j < all.length; j++) {
    if (bitIsSet(flags, j)) decoded.add(all[j]);
  }
  return decoded;
}

export function* power<T>(xs: readonly T[]) {
  const total = 2 ** xs.length;
  for (let i = 0; i < total; i++) {
    yield decode(xs, i);
  }
}

export function permutations<T>(arr: readonly T[]): T[][] {
  if (arr.length === 0) return [[]];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(remaining)) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

export function sample<T>(arr: readonly T[], n: number = arr.length): T[] {
  if (n > arr.length) return sample(arr, arr.length);
  const copy = [...arr];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy.slice(0, n);
}
