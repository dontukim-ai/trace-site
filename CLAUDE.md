# trace-site — Claude Code 작업 규칙

Trace by 필터 리포트 공개 사이트(Astro 5, 정적 사이트)다. 데이터는 `dontukim-ai/trace-data`에서 매일 받아 온다.

**할 일은 `trace-data` 저장소의 `PLAN.md`에 있다.** 답변과 커밋 메시지는 한국어로 쓴다.

## 절대 원칙

- 매수·매도 권유, 목표가, 예상가, "오를 확률" 같은 표현을 화면에 쓰지 않는다. 모든 페이지 끝에는 "리서치 기록이며 투자 권유가 아닙니다."가 들어간다.
- 달러 가격, 거래량, 목표가를 보여 주지 않는다. 차트는 편입일 종가 = 100 지수, 수치는 비율만 쓴다.
- `src/data/trace.json`은 루틴이 덮어쓰는 파일이므로 직접 고치지 않는다.

## 브랜치와 배포

- `main`: 코드 원본.
- **`claude/live`**: Cloudflare Pages 운영 브랜치. `main`의 코드에 매일 갱신되는 `src/data/trace.json`을 더한 것이다.
- Cloudflare 프로젝트 `trace-site`는 https://trace-site-bjb.pages.dev 이고, 운영 도메인은 https://filterreport.co.kr 이다(가비아 등록, 네임서버는 Cloudflare). 빌드 설정은 아래와 같다.
  - 빌드 명령: `npm run build`
  - 출력 폴더: `dist`
  - 환경 변수: `NODE_VERSION=22`
- 매일 루틴의 D 단계가 `origin/main`을 `claude/live`에 병합하고 `trace.json`을 복사해 푸시한다.
- **Claude Code 세션에서는 `claude/` 브랜치에만 푸시할 수 있다.**
  1. 코드 수정은 `claude/live`에서 작업한다. 먼저 `git pull`을 하고, 수정한 뒤 `npm run build`로 확인하고 푸시한다. 푸시하면 몇 분 안에 운영에 반영된다.
  2. 같은 수정이 `main`에도 들어가야 한다. 그러지 않으면 다음 병합 때 충돌하거나 수정이 사라질 수 있다. 사용자에게 `claude/live` → `main` 반영을 요청한다. GitHub에서 PR을 만들어 병합하거나, 해당 파일을 업로드하면 된다.
  3. `src/data/trace.json`은 커밋 대상에서 신경 쓰지 않는다. 루틴이 관리한다.
- 검색 노출: 2026-10-13 정식 출시(E1)로 `public/_headers`의 `noindex`를 삭제했다. 검색엔진 수집은 `public/robots.txt`와 sitemap으로 안내한다.
- `astro.config.mjs`의 `site`는 `https://filterreport.co.kr`이다. canonical 주소에 쓰인다.

## 구조

| 경로 | 내용 |
| --- | --- |
| `src/data/trace.json` | 사이트 데이터. `meta`(한글명·업종·회차 영상)를 포함한다 |
| `src/data/meta.json` | 예비용. `trace.json`에 `meta`가 없을 때만 쓴다 |
| `src/lib/data.ts` | 타입·헬퍼: `pct`(진짜 마이너스 −), `dir`, `nameOf`, `video`(영상 없는 회차는 undefined) 등 |
| `src/lib/chart.ts` | TraceChart 좌표 계산 |
| `src/components/TraceChart.astro` | 목록용 차트 (lookback 막대 없음) |
| `src/components/StockRow.astro` | 목록 한 행. 980px 이하에서 세 줄로 접힌다 |
| `src/layouts/Base.astro` | 머리글(글자 아랫선 정렬)·바닥글·960px 이하 햄버거 메뉴 |
| `src/styles/global.css` | 디자인 토큰 |
| `src/pages/` | `/` Tracing, `/t/<ticker>/` 종목 상세, `/changes/`, `/episodes/`, `/kronos/`, `/criteria/` |
| `public/fonts/PretendardVariable.woff2` | Pretendard (SIL OFL) |

## 디자인 규칙 (디자인 시스템 "Trace" v3)

- 디자인 시스템: https://claude.ai/artifact/PyhFaY2wUdxhdcT2gbfkMH
  - 값을 바꿀 때는 디자인 시스템과 `global.css`를 함께 고친다.
- 바탕은 흰색이다. 카드, 그림자, 그라디언트는 쓰지 않고 가는 선으로 행을 나눈다.
- 글꼴:
  - Pretendard: 한글과 UI 전체.
  - **Source Serif 4**: 워드마크·제목 600, 수익률·종목 수·순번 400, 숫자는 `lining-nums tabular-nums`.
- 색: 상승 빨강 `--up #d1242f`, 하락 파랑 `--down #2457d6`. 숫자 글자와 편입 후 차트 선에만 쓰고, 면에는 쓰지 않는다.
- 차트:
  - 편입 전 선은 회색이다.
  - 편입 후 선은 수익률 방향 색이다.
  - Kronos 밴드는 회색 음영과 중앙값 점선으로 그린다.
  - lookback 30·60·90일 막대는 종목 상세의 큰 차트에만 그린다.
- 홈 제목 줄은 `Tracing 37 종목 | 편입 후 수익률 순` 형태다.
- 회차 필터는 최근 4회 버튼만 두고, 그 이전 회차는 "이전 회차" 선택 상자에 넣는다.
- 한글은 단어 단위로 줄을 바꾼다(`word-break: keep-all`).
- 시안 캔버스: https://claude.ai/artifact/6ctXaPgLWY5Qj6kWRwkF1W

## 로컬 확인

```bash
npm install
npm run build && npx astro preview   # http://localhost:4321
```

최신 데이터로 보려면 `trace-data`의 `site/trace.json`을 `src/data/trace.json`으로 복사한다. 이 복사본은 커밋하지 않는다.

화면을 고치면 1280px, 800px, 390px 세 폭에서 확인한다.
