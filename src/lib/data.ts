import trace from '../data/trace.json';
import meta from '../data/meta.json';

export type Band = { p05: number[]; p25: number[]; p50: number[]; p75: number[]; p95: number[] };
export type Ticker = {
  ticker: string; episode: number; entry_date: string; status: string;
  ret_since_entry: number; hi3m_date: string; entry_vs_hi3m: number; now_vs_hi3m: number;
  max_since_entry: number; min_since_entry: number; days_since_entry: number;
  series: [string, number][];
  kronos?: { origin: string; lookback: number; horizon: number; future: string[]; band: Band;
    median_by_lookback: Record<string, number>; model: string; model_rev: string; code_commit: string };
  screen?: { asof: string; result: string; stage: string; reasons: string };
};

export const data = trace as unknown as {
  asof: string; generated_utc: string; tickers: Ticker[];
  episodes: { episode: number; date: string; tickers: string[] }[];
  kronos_calibration: { pending: number; scored: number; judgeable: boolean;
    by_group: Record<string, { n: number; in90: number; in50: number }> };
  screen_funnel: Record<string, any> | null;
};
const M = meta as { tickers: Record<string, { name: string; sector: string }>; episodes: Record<string, { youtube: string; title: string }> };

export const nameOf = (t: string) => M.tickers[t]?.name ?? '';
export const sectorOf = (t: string) => M.tickers[t]?.sector ?? '';
export const video = (ep: number) => M.episodes[String(ep)];

/** +22.8% / −40.7% (true minus, one decimal) */
export const pct = (r: number, digits = 1) => {
  const v = r * 100;
  const s = Math.abs(v).toFixed(digits);
  if (s === (0).toFixed(digits)) return `${s}%`;
  return (v > 0 ? '+' : '−') + s + '%';
};
export const dir = (r: number) => (r > 0 ? 'up' : r < 0 ? 'down' : 'flat');
export const mmdd = (d: string) => `${d.slice(5, 7)}/${d.slice(8, 10)}`;
export const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
export const korDate = (d: string) => `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일`;

/** 공개 화면 용어: 탈락 → 조건 밖 */
export const screenLabel = (r?: string) => (r === '통과' ? '통과' : r === '대기' ? '대기' : '조건 밖');

export const entryIndex = (t: Ticker) => t.series.findIndex(([d]) => d === t.entry_date);
export const lookbackLevels = (t: Ticker) => {
  if (!t.kronos) return null;
  const last = t.series[t.series.length - 1][1];
  const m = t.kronos.median_by_lookback;
  return ['30', '60', '90'].filter(k => k in m).map(k => ({ lb: k, ret: m[k], level: +(last * (1 + m[k])).toFixed(1) }));
};
