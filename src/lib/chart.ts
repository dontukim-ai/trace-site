import { type Ticker, entryIndex, lookbackLevels } from './data';

/** Geometry for TraceChart (design system: TraceChart). Pure function, runs at build time. */
export function geometry(t: Ticker, W: number, H: number, opts: { lo?: number; hi?: number; rightPad?: number } = {}) {
  const s = t.series.map(([, v]) => v);
  const ei = entryIndex(t);
  const k = t.kronos;
  const F = k ? k.band.p50.length : 0;
  const N = s.length, T = N - 1 + F, PW = W - (opts.rightPad ?? 14);
  const lbs = lookbackLevels(t) ?? [];
  const all = s.concat(k ? k.band.p05 : [], k ? k.band.p95 : [], lbs.map(l => l.level));
  let lo = Math.min(...all), hi = Math.max(...all);
  const pd = (hi - lo) * 0.06; lo -= pd; hi += pd;
  if (opts.lo !== undefined) lo = opts.lo;
  if (opts.hi !== undefined) hi = opts.hi;
  const y = (v: number) => +(H - ((v - lo) / (hi - lo)) * H).toFixed(1);
  const x = (i: number) => +((i / T) * PW).toFixed(1);
  const line = (arr: number[], off: number) => arr.map((v, i) => (i ? 'L' : 'M') + x(i + off) + ' ' + y(v)).join('');
  const last = s[N - 1];
  const band = (a: number[], b: number[]) => {
    const top = [last, ...b], bot = [last, ...a];
    return 'M' + top.map((v, i) => `${x(N - 1 + i)} ${y(v)}`).join('L') + 'L' + bot.map((v, i) => `${x(N - 1 + i)} ${y(v)}`).reverse().join('L') + 'Z';
  };
  const bx = PW + Math.min(11, (opts.rightPad ?? 14) - 3);
  return {
    x, y, N, T, PW, lo, hi, ei,
    pre: line(s.slice(0, ei + 1), 0),
    post: line(s.slice(ei), ei),
    outer: k ? band(k.band.p05, k.band.p95) : '',
    inner: k ? band(k.band.p25, k.band.p75) : '',
    med: k ? line([last, ...k.band.p50], N - 1) : '',
    base: y(100), lx: x(N - 1), ex: x(ei), ey: y(s[ei]),
    bx, lbs: lbs.map(l => ({ ...l, y: y(l.level) })),
    by1: lbs.length ? y(Math.max(...lbs.map(l => l.level))) : 0,
    by2: lbs.length ? y(Math.min(...lbs.map(l => l.level))) : 0,
    by60: lbs.find(l => l.lb === '60') ? y(lbs.find(l => l.lb === '60')!.level) : 0,
  };
}
