import NativeRavenTurbo from './NativeRavenTurbo';

export function multiply(a: number, b: number): Promise<number> {
  const result = NativeRavenTurbo.multiply(a, b);
  return Promise.resolve(result);
}

export function add(a: number, b: number): Promise<number> {
  const result = NativeRavenTurbo.add(a, b);
  return Promise.resolve(result);
}
