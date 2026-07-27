declare module 'culori' {
  export interface Oklch {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
    alpha?: number;
  }

  export interface Rgb {
    mode: 'rgb';
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }

  export type Color = Oklch | Rgb | Record<string, unknown>;

  export function parse(color: string): Color | undefined;
  export function oklch(color: Color | string): Oklch | undefined;
  export function formatHex(color: Color): string;
  export function wcagContrast(color1: Color | string, color2: Color | string): number;
  export function displayable(color: Color): boolean;
  export function clampChroma(color: Color, mode?: string): Color;
}
