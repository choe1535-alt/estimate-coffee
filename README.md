# 커피24 견적서 스튜디오

정리본 `커피24 견적서 AX TF.xlsx`의 변수/단가 구조를 그대로 따른 인쇄용 견적서 에디터입니다.
Figma/Framer 스타일의 3-column 에디터 레이아웃 위에 5가지 테마로 견적서를 미리보고 PDF/인쇄가 가능합니다.

> **LLM(Claude / Gemini / Codex 등)으로 이 프로젝트를 고치는 분이라면** [`AGENTS.md`](./AGENTS.md) 를 먼저 읽혀주세요.
> 비개발자 사용자를 전제로 한 작업 흐름·git 절차·배포 가이드가 정리되어 있습니다.

## 스택

- React 18 + TypeScript + Vite
- React Router v7
- TanStack Query 5 + axios — 머신/원두/담당자 데이터를 `public/api/*.json`에서 mock API로 호출
- Zustand — 견적 폼 상태 (localStorage persist)
- Tailwind CSS + shadcn-ui 스타일 프리미티브 (Radix Primitives)

## 핵심 룰 (템플릿 엑셀 충실)

- `원두포함여부 = ISBLANK(원두) ? "X" : "O"`
  - 원두 미포함 → **머신 단독 렌탈** 섹션만 노출
  - 원두 포함 → **머신렌탈 & 원두구독** 섹션만 노출
- 머신 단가 = `머신단가` 시트의 (머신, 약정, 원두포함여부) lookup
- 원두 합계(VAT 포함)가 5만원 미만이면 택배비 3,500원(VAT 포함) 자동 추가
- 케어주기 추가비용은 원두구독 옵션에서만 별도 라인으로 합산

## 디렉터리

```
public/api/        — mock JSON (machines, machine-prices, care-cycles, beans, sales-reps, constants)
src/api/           — axios 호출 함수
src/hooks/         — TanStack Query 훅 (useMachines, useCoffeeBundle 등)
src/lib/           — quote 계산, utils, axios 인스턴스
src/stores/        — zustand store
src/components/
  editor/          — TopBar, SectionTabs, LeftSidebar, RightSidebar, Canvas
  quote/           — QuotePaper, SectionCard, PricingTable
  ui/              — shadcn-style primitives (button, input, select, switch, tabs …)
src/pages/         — EditorPage
src/styles/        — Tailwind base + theme tokens
```

## 실행

```bash
npm install
npm run dev      # http://localhost:5173/estimate-coffee/
npm run build    # dist/
npm run preview  # built artifact 확인
```

## 데이터 재생성

정리본 엑셀을 수정한 뒤에는 아래 명령으로 `public/api/*.json` 을 다시 생성하세요. (현재 스크립트는 `app/data.js` 출력이므로 추후 갱신 예정)

```bash
python3 tools/build_data.py
```

## 향후 작업

- `VITE_API_BASE` 환경변수만 바꾸면 사내 DB API로 연결됩니다 (`src/lib/api.ts`).
- 담당자/머신/원두 정보가 코드/JSON에 노출되어 있으므로, 사내 API 인증 흐름을 붙이는 작업이 다음 단계입니다.

## 배포

GitHub Actions가 `main` push 시 `npm run build` 후 `dist/`를 Pages에 배포합니다.
사이트: <https://choe1535-alt.github.io/estimate-coffee/>
