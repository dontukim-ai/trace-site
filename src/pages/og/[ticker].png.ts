// 종목별 공유 이미지(1200×630). 빌드 때 satori(레이아웃→SVG) + resvg(SVG→PNG)로 만든다.
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { data, type Ticker, nameOf, pct, korDate } from '../../lib/data';

const W = 1200, H = 630;
const C = { ink: '#111214', ink2: '#5a5e66', ink3: '#6b6f76', line: '#e8e9eb', pre: '#c3c6cb', up: '#d1242f', down: '#2457d6' };
const nm = (p: string) => path.join(process.cwd(), 'node_modules', p);
const fonts = [
  { name: 'Pretendard', data: fs.readFileSync(nm('pretendard/dist/public/static/Pretendard-Regular.otf')), weight: 400 as const },
  { name: 'Pretendard', data: fs.readFileSync(nm('pretendard/dist/public/static/Pretendard-SemiBold.otf')), weight: 600 as const },
  { name: 'Pretendard', data: fs.readFileSync(nm('pretendard/dist/public/static/Pretendard-Bold.otf')), weight: 700 as const },
  { name: 'Source Serif 4', data: fs.readFileSync(nm('@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff')), weight: 400 as const },
  { name: 'Source Serif 4', data: fs.readFileSync(nm('@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff')), weight: 600 as const },
];

type El = { type: string; props: Record<string, any> };
const h = (type: string, style: Record<string, any>, ...children: any[]): El =>
  ({ type, props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children } });

/** 편입 전(회색)·후(방향색) 지수 선 */
function chartSvg(t: Ticker, w: number, hgt: number) {
  const s = t.series, n = s.length, ei = Math.max(0, s.findIndex(([d]) => d === t.entry_date));
  const vs = s.map(x => x[1]); const lo = Math.min(...vs, 100), hi = Math.max(...vs, 100);
  const x = (i: number) => (i / Math.max(1, n - 1)) * w, y = (v: number) => hgt - 6 - ((v - lo) / (hi - lo || 1)) * (hgt - 12);
  const pts = (a: number, b: number) => s.slice(a, b + 1).map(([, v], k) => `${x(a + k).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const col = t.ret_since_entry > 0 ? C.up : t.ret_since_entry < 0 ? C.down : C.ink;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}">`
    + `<line x1="0" x2="${w}" y1="${y(100)}" y2="${y(100)}" stroke="${C.line}" stroke-width="2"/>`
    + `<polyline points="${pts(0, ei)}" fill="none" stroke="${C.pre}" stroke-width="4" stroke-linejoin="round"/>`
    + `<polyline points="${pts(ei, n - 1)}" fill="none" stroke="${col}" stroke-width="5" stroke-linejoin="round"/>`
    + `<rect x="${x(ei) - 7}" y="${y(100) - 7}" width="14" height="14" fill="#fff" stroke="${C.ink}" stroke-width="3"/></svg>`;
}

export function getStaticPaths() {
  return data.tickers.map(t => ({ params: { ticker: t.ticker.toLowerCase() }, props: { t } }));
}

export const GET: APIRoute = async ({ props }) => {
  const t = (props as { t: Ticker }).t;
  const r = t.ret_since_entry, col = r > 0 ? C.up : r < 0 ? C.down : C.ink;
  const chart = 'data:image/svg+xml;base64,' + Buffer.from(chartSvg(t, 560, 230)).toString('base64');
  const tree = h('div', { width: W, height: H, background: '#fff', padding: '64px 80px 52px', flexDirection: 'column', fontFamily: 'Pretendard', color: C.ink },
    h('div', { alignItems: 'baseline', gap: 14 },
      h('span', { fontFamily: 'Source Serif 4', fontWeight: 600, fontSize: 44 }, 'Trace'),
      h('span', { fontSize: 22, color: C.ink2 }, 'by 필터 리포트')),
    h('div', { height: 1, background: C.ink, marginTop: 26 }),
    h('div', { flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', marginTop: 30 },
      h('div', { flexDirection: 'column', gap: 10 },
        h('span', { fontSize: 100, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }, t.ticker),
        h('span', { fontSize: 38, color: C.ink2, marginTop: 6 }, nameOf(t.ticker) || ' '),
        h('span', { fontSize: 24, color: C.ink3, marginTop: 18 }, `${t.episode}회 방송 · ${korDate(t.entry_date)} 편입 · 편입 후 ${t.days_since_entry}거래일`),
        h('div', { alignItems: 'baseline', gap: 16, marginTop: 14 },
          h('span', { fontSize: 26, color: C.ink3 }, '편입 후'),
          h('span', { fontFamily: 'Source Serif 4', fontSize: 92, color: col, lineHeight: 1 }, pct(r)))),
      h('img', { width: 560, height: 230 }, '')),
    h('div', { borderTop: `1px solid ${C.line}`, paddingTop: 20, justifyContent: 'space-between', fontSize: 22, color: C.ink3 },
      h('span', { fontWeight: 600, color: C.ink }, 'filterreport.co.kr'),
      h('span', {}, `${korDate(data.asof)} 미국 종가 · 편입일 종가 = 100 기록 · 투자 권유 아님`)));
  // img 요소에 src 지정 (h 는 style 만 받으므로 따로 넣는다)
  const img = (tree.props.children[2] as El).props.children[1] as El;
  img.props = { src: chart, width: 560, height: 230, style: { width: 560, height: 230 } };
  const svg = await satori(tree as any, { width: W, height: H, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
