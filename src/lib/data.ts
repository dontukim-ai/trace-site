import trace from '../data/trace.json';
import meta from '../data/meta.json';

export type Band = { p05: number[]; p25: number[]; p50: number[]; p75: number[]; p95: number[] };
export type Ticker = {
  ticker: string; episode: number; entry_date: string; status: string; exit_date?: string | null;
  ret_since_entry: number; hi3m_date: string; entry_vs_hi3m: number; now_vs_hi3m: number;
  max_since_entry: number; min_since_entry: number; days_since_entry: number;
  series: [string, number][];
  kronos?: { origin: string; lookback: number; horizon: number; future: string[]; band: Band;
    median_by_lookback: Record<string, number>; model: string; model_rev: string; code_commit: string };
  screen?: { asof: string; result: string; stage: string; reasons: string };
  fundamentals?: Fundamentals;
};
export type Fundamentals = { asof: string; rev_growth: number | null; op_margin: number | null;
  fcf_margin: number | null; net_debt_ebitda: number | null; net_cash: boolean | null };

export const data = trace as unknown as {
  asof: string; generated_utc: string; hold_days?: number; tickers: Ticker[];
  episodes: { episode: number; date: string; tickers: string[] }[];
  kronos_calibration: { pending: number; scored: number; judgeable: boolean;
    by_group: Record<string, { n: number; in90: number; in50: number }> };
  screen_funnel: Record<string, any> | null;
};
// trace.json 의 meta(trace-data/data/meta.json)를 우선 쓰고, 없으면 저장소의 meta.json 을 쓴다.
const M = ((trace as any).meta ?? meta) as { tickers: Record<string, { name: string; sector: string; about?: string }>; episodes: Record<string, { youtube: string; title: string }> };

export const nameOf = (t: string) => M.tickers[t]?.name ?? '';
export const sectorOf = (t: string) => M.tickers[t]?.sector ?? '';
export const aboutOf = (t: string) => M.tickers[t]?.about ?? '';
/** 영상 ID가 아직 없는 회차(방송 전)는 undefined */
export const video = (ep: number) => { const v = M.episodes[String(ep)]; return v?.youtube ? v : undefined; };

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
/** 사이트 데이터를 만든 날 (한국 시간). 매일 아침 루틴이 갱신한다 */
export const builtKst = new Date(Date.parse(data.generated_utc) + 9 * 3600e3).toISOString().slice(0, 10);

/** 편입 후 이 거래일 수가 지나면 기록을 끝낸다 (trace-data scripts/expire_pool.py) */
export const HOLD_DAYS = data.hold_days ?? 126;
export const isEnded = (t: Ticker) => t.status === 'ended';

/** 주요 재무지표 한 줄 (비율만) */
export const fundParts = (f?: Fundamentals) => {
  if (!f) return [];
  const p = (r: number) => pct(r).replace(/^\+/, '');
  const out: string[] = [];
  if (f.rev_growth != null) out.push(`최근 분기 매출 전년 대비 ${pct(f.rev_growth)}`);
  if (f.op_margin != null) out.push(`영업이익률 ${p(f.op_margin)}`);
  if (f.fcf_margin != null) out.push(`잉여현금흐름률 ${p(f.fcf_margin)}`);
  if (f.net_cash) out.push('순현금');
  else if (f.net_debt_ebitda != null) out.push(`순부채/EBITDA ${f.net_debt_ebitda.toFixed(1)}배`);
  return out;
};

/** 공개 화면 용어: 탈락 → 조건 밖 */
export const screenLabel = (r?: string) => (r === '통과' ? '통과' : r === '대기' ? '대기' : '조건 밖');

export const entryIndex = (t: Ticker) => t.series.findIndex(([d]) => d === t.entry_date);
export const lookbackLevels = (t: Ticker) => {
  if (!t.kronos) return null;
  const last = t.series[t.series.length - 1][1];
  const m = t.kronos.median_by_lookback;
  return ['30', '60', '90'].filter(k => k in m).map(k => ({ lb: k, ret: m[k], level: +(last * (1 + m[k])).toFixed(1) }));
};
