# 채용 파이프라인 보드

채용 담당자가 지원자 카드를 `서류검토 → 면접 → 처우협의 → 최종합격 / 불합격` 단계로 옮기며 관리하는 보드. 백엔드 없이 자체 구현한 mock API(지연 200~800ms, 실패율 15%) 위에서 낙관적 업데이트와 롤백을 다룬다.

**배포**: https://recruit-pipeline-board.vercel.app — 에러 화면은 [`?failRate=1`](https://recruit-pipeline-board.vercel.app/?failRate=1), 빈 상태는 [`?seed=0`](https://recruit-pipeline-board.vercel.app/?seed=0)

## 실행

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

`pnpm test` 테스트(75개) · `pnpm typecheck` · `pnpm lint` · `pnpm build`

## 확인해 볼 것

| 하고 싶은 것 | 방법 |
|---|---|
| 낙관적 업데이트·롤백 | 카드의 단계 셀렉트를 바꾸면 즉시 옮겨지고, 15% 확률로 실패 → 원래 컬럼 복귀 + 재시도 토스트 |
| 에러 화면 | `?failRate=1` → 조회 실패 + 다시 시도 |
| 빈 상태 | `?seed=0` (데이터 0건) / 검색어를 아무거나 |
| 되돌리기 | 이동 성공 토스트의 [되돌리기] |
| 키보드만으로 | Tab → 카드 이름에서 ↑/↓(같은 컬럼) ←/→(옆 컬럼), Enter 상세, Esc 닫기, 셀렉트로 이동 |
| 모바일 | 창 폭 768px 미만: 컬럼 가로 스크롤, 상세는 전체 화면 시트 |
| 1,000건 | `?seed=1000` — 컬럼 가상 스크롤, 키보드 탐색은 화면 밖 카드까지 |
| 데이터 초기화 | `?reset` (localStorage 비우고 250건 다시 생성) |

`?failRate` `?delay` `?seed` `?reset`은 개발·검증용 스위치다 — [`src/api/mock/devOverrides.ts`](src/api/mock/devOverrides.ts).

## 스택

Vite · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query(서버 상태) · zustand(토스트·상세 선택 등 공유 클라이언트 상태) · Vitest + Testing Library

Next.js를 쓰지 않은 이유, TanStack Query를 쓰면서도 롤백 로직을 직접 작성한 이유 등은 [DECISIONS.md](DECISIONS.md).

## 구조

```
src/
  api/                 API 계약(contract.ts)과 교체 지점(index.ts). 화면·훅은 인터페이스만 의존
    mock/              mock 구현체 — seed 250건, 지연·실패율·저장소 주입 가능, localStorage 영속
  app/                 Provider 조립, QueryClient 설정
  features/
    board/             컬럼 레이아웃(가상 스크롤), 목록 쿼리, 단계별 그룹핑, 키보드 탐색
    candidate-card/    카드
    stage-move/        단계 이동 — 낙관적 반영·항목 단위 롤백(optimistic.ts)·같은 카드 직렬화·되돌리기
    search-filter/     이름 검색 + 직무 필터 (순수 함수 + useDeferredValue)
    detail-panel/      상세 — 모바일 시트 / 오버레이 / 사이드 패널
    status/            ErrorBoundary, 에러·빈 상태
    toast/             토스트 스토어(aria-live)
    a11y/              이동 후 포커스 복원
```

기능 단위 = 폴더 = 커밋 = [PROMPTS.md](PROMPTS.md) 섹션.

## mock API

- `CandidateApi { fetchCandidates, moveCandidate }` 인터페이스를 두고 mock이 구현. 실제 백엔드가 붙으면 `src/api/index.ts` 한 줄만 바뀐다.
- 모든 호출에 200~800ms 랜덤 지연, 실패율 쓰기 15% · 조회 5%. 실패는 `ApiError { code, status, retryable }`.
- 첫 실행 시 고정 시드로 250건 생성 → localStorage. 지연·실패율·난수·저장소를 주입할 수 있어 테스트가 결정적.

## 주요 결정

- **낙관적 업데이트는 항목 단위 롤백** — 목록 전체 스냅샷을 복원하면 그 사이 다른 카드에 반영된 낙관적 상태까지 지워진다. 순수 함수로 분리해 테스트로 대조.
- **같은 카드 연속 이동은 요청을 직렬화하고, 롤백 기준은 "서버가 마지막으로 확정한 단계"** — TanStack Query의 `scope`는 요청만 미루고 `onMutate`는 즉시 실행되므로 별도 추적.
- **단계 이동은 드래그앤드롭 대신 셀렉트** — 어느 단계로든 한 번에, 키보드 접근성 기본.
- **상세는 뷰포트별 형태 전환** — 1280px 이상 사이드 패널, 미만 백드롭 오버레이, 모바일 전체 화면 시트.
- 전체 목록: [DECISIONS.md](DECISIONS.md)

- **1,000건은 컬럼 가상 스크롤 + 카드 memo** — 병목은 스크롤이 아니라 커밋이었다(필터 150ms → 38ms, 이동 250ms → 17ms). 키보드 탐색은 DOM에 없는 카드도 인덱스로 찾아 스크롤 후 포커스.

## 안 한 것

- 드래그앤드롭, 카드 생성·삭제·편집, 라우팅 — 요구사항 밖.

## 문서

- [PROMPTS.md](PROMPTS.md) — 기능별 프롬프트 원문 · AI 출력 · 리뷰/검증 · 판단
- [DECISIONS.md](DECISIONS.md) — 설계 결정과 근거, 기각한 대안, 못 끝낸 것
- [REQUIREMENTS.md](REQUIREMENTS.md) · [PLAN.md](PLAN.md) — 인수 기준 체크리스트, 작업 단위
- [CLAUDE.md](CLAUDE.md) — AI 협업 규칙
