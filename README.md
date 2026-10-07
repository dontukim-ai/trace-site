# trace-site

Trace by 필터 리포트 사이트 (Astro 5, 정적 사이트).

## 구조

| 경로 | 내용 |
| --- | --- |
| `src/data/trace.json` | 사이트 데이터. `trace-data` 저장소 `claude/data` 브랜치의 `site/trace.json`을 매일 복사해 온다. 직접 고치지 않는다 |
| `src/data/meta.json` | 종목 한글명·업종, 회차별 유튜브 영상 ID·제목. 새 회차를 낼 때 사람이 고친다 |
| `src/styles/global.css` | 디자인 토큰 ("Trace 디자인 시스템" tokens.json v1과 같은 값) |
| `src/components/` | TraceChart, StockRow (디자인 시스템 컴포넌트와 같은 이름) |
| `src/pages/` | `/` Tracing, `/t/<ticker>/` 종목 상세, `/changes/`, `/episodes/`, `/kronos/`, `/criteria/` |
| `public/fonts/` | Pretendard 가변 글꼴 (SIL OFL 1.1) |

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 생성
```

## 배포 흐름

1. 매일 아침 루틴이 `trace-data`에서 `site/trace.json`을 만든다.
2. 같은 루틴이 이 저장소의 `src/data/trace.json`으로 복사해 `claude/live` 브랜치에 푸시한다.
3. 호스팅(Cloudflare Pages)이 `claude/live`를 운영 브랜치로 보고 자동으로 빌드·배포한다.

빌드 설정: 빌드 명령 `npm run build`, 출력 폴더 `dist`, Node 20 이상.

## 새 회차를 낼 때

`trace-data`의 `data/pool.csv`에 종목을 추가하는 것(계획표 B2 체크리스트)과 별도로, 이 저장소의 `src/data/meta.json`에 다음을 추가한다. 없으면 종목명 칸이 비어 보인다.

- 새 종목의 `name`(한글명)·`sector`
- `episodes`에 회차 번호 → `youtube`(영상 ID)·`title`
