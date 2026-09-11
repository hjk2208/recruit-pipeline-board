# 채용 파이프라인 보드

채용 담당자가 지원자 카드를 `서류검토 → 면접 → 처우협의 → 최종합격 / 불합격` 단계로 옮기며 관리하는 보드.

## 실행

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

`pnpm test` 테스트 · `pnpm typecheck` 타입 · `pnpm lint` 린트 · `pnpm build` 빌드

## 스택

Vite · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query (서버 상태) · zustand (토스트 등 공유 클라이언트 상태) · Vitest + Testing Library

## mock API

백엔드 없이 `src/api/mock/`에서 자체 구현. 화면·훅은 `src/api/contract.ts`의 `CandidateApi` 인터페이스만 의존하고, `src/api/index.ts`에서 구현체를 고른다 — 실제 백엔드가 붙으면 이 한 줄만 바뀐다.

- 모든 호출에 **200~800ms 랜덤 지연**
- **실패율** 쓰기(단계 이동) 15% · 조회 5%
- 데이터는 `localStorage`에 저장 — 새로고침해도 유지. 첫 실행 시 고정 시드로 250건 생성
- 지연·실패율·난수·저장소는 옵션으로 주입 가능 → 테스트에서 결정적으로 재현

## 진행 현황

| 단위 | 상태 |
|---|---|
| mock API (지연·실패율·영속) | ✅ |
| 보드 레이아웃 · 카드 목록 (250건) | ✅ |
| 단계 이동 (셀렉트) · 새로고침 유지 | ✅ |
| 낙관적 업데이트 · 항목 단위 롤백 · 재시도 토스트 | ✅ |
| 검색 · 직무 필터 | 진행 예정 |
| 상세 패널 | 진행 예정 |
| 로딩 · 에러 · 빈 상태 | 로딩만 (에러·빈 상태 예정) |
| 키보드 접근성 | 이름 버튼·셀렉트 포커스까지 (상세 열기 예정) |
| 경쟁 상태 · Undo · 1,000건 가상 스크롤 | 예정 |

## 문서

- [PROMPTS.md](PROMPTS.md) — 기능별 프롬프트 원문 · AI 출력 · 리뷰/검증 · 판단
- [DECISIONS.md](DECISIONS.md) — 설계 결정과 근거, 기각한 대안
- [REQUIREMENTS.md](REQUIREMENTS.md) · [PLAN.md](PLAN.md) — 인수 기준 체크리스트, 작업 단위
- [CLAUDE.md](CLAUDE.md) — AI 협업 규칙
