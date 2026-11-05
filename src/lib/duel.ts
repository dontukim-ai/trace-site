// AI 대결 성적표 데이터. 형식은 trace-data/docs/duel.md 의 '사이트 데이터' 절.
// src/data/duel.json 은 루틴 D 단계가 복사한다. 없으면 개발·미리보기 빌드에서는 예시(duel.sample.json)를 쓰고,
// 운영 빌드(Cloudflare 브랜치 claude/live)에서는 빈 상태를 보여 준다.

export type Call = 'up' | 'down';
export type Mark = 'o' | 'x' | '-' | '?';
export type Score = { hit: number; n: number; rate: number | null };
export type Pair = { gpt: Score; claude: Score };
export type DuelRecord = {
  date: string; ticker: string; name: string; market: 'KR' | 'US';
  gpt: Call; claude: Call; gpt_reasons: string[]; claude_reasons: string[];
  video_id: string | null; status: 'pending' | 'settled' | 'flat' | 'no_trade';
  pct: number | null; gpt_hit: 0 | 1 | null; claude_hit: 0 | 1 | null;
};
export type Duel = {
  updated: string | null; first_date: string | null; pending: number; sample?: boolean;
  total: Pair;
  weeks: ({ start: string } & Pair)[];
  tickers: ({ ticker: string; name: string; market: 'KR' | 'US' } & Pair)[];
  this_week: null | { start: string; days: string[];
    rows: { ticker: string; name: string; market: 'KR' | 'US'; cells: ({ gpt: Mark; claude: Mark } | null)[] }[] };
  records: DuelRecord[];
};

const files = import.meta.glob<Duel>('../data/duel*.json', { eager: true, import: 'default' });
const real = files['../data/duel.json'];
const isLive = process.env.CF_PAGES_BRANCH === 'claude/live';
export const duel: Duel | null = real ?? (isLive ? null : files['../data/duel.sample.json'] ?? null);
export const isSample = !real && !!duel;

export const AIS = [
  { key: 'gpt', label: 'ChatGPT' },
  { key: 'claude', label: 'Claude' },
] as const;
/** 적중률 공개 기준과 같은 취지: 판정 30건 미만은 '표본 적음' */
export const MIN_N = 30;

export const callLabel = (c: Call) => (c === 'up' ? '오른다' : '내린다');
export const markChar: Record<Mark, string> = { o: '○', x: '×', '-': '–', '?': '?' };
export const markLabel: Record<Mark, string> = { o: '적중', x: '빗나감', '-': '무효', '?': '판정 대기' };
export const hitMark = (h: 0 | 1 | null, status: DuelRecord['status']): Mark =>
  status === 'pending' ? '?' : h === 1 ? 'o' : h === 0 ? 'x' : '-';
/** 54.2% (판정 없으면 —) */
export const rate = (s: Score) => (s.rate == null ? '—' : `${(s.rate * 100).toFixed(1)}%`);
/** +1.23% / −3.17% (진짜 마이너스) */
export const pctText = (p: number) => `${p > 0 ? '+' : p < 0 ? '−' : ''}${Math.abs(p).toFixed(2)}%`;
export const pctDir = (p: number) => (p > 0 ? 'up' : p < 0 ? 'down' : 'flat');
const WD = ['일', '월', '화', '수', '목', '금', '토'];
/** 11/6(금) */
export const mdw = (d: string) => {
  const x = new Date(`${d}T00:00:00Z`);
  return `${x.getUTCMonth() + 1}/${x.getUTCDate()}(${WD[x.getUTCDay()]})`;
};
export const md = (d: string) => { const x = new Date(`${d}T00:00:00Z`); return `${x.getUTCMonth() + 1}/${x.getUTCDate()}`; };
export const korDay = (d: string) => { const x = new Date(`${d}T00:00:00Z`); return `${x.getUTCMonth() + 1}월 ${x.getUTCDate()}일`; };
export const marketLabel = (m: 'KR' | 'US') => (m === 'KR' ? '국장' : '미장');
export const shortsUrl = (id: string) => `https://www.youtube.com/shorts/${id}`;
