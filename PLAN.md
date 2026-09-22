# 작업 계획

1단위 = 커밋 1개 = PROMPTS.md 섹션 1개. 각 단위는 `/unit-done`으로 마감. 순서는 세로 슬라이스: 데이터 → 화면 → 핵심 플로우 → 나머지 → 마감.

| # | scope | 내용 | 인수 기준 | 검증 |
|---|---|---|---|---|
| 0 | harness / setup | 규칙·스킬·스캐폴드 | — | ✅ 완료 |
| 1 | plan | TASK / REQUIREMENTS / PLAN | — | 사용자 확인 |
| 2 | mock-api | API 인터페이스 정의 + mock 구현체(seed·지연·실패율·localStorage). 지연/실패율 주입 가능 | 제약 4개, 설계 원칙 | 단위 테스트 |
| 3 | board-layout | 5컬럼 셸(모바일 가로 스크롤) + Suspense 로딩 폴백 + QueryClient | M1(컬럼), M6(로딩) | 미리보기 |
| 4 | card-list | useSuspenseQuery로 카드 렌더 | M1(카드) | 미리보기 |
| 5 | stage-move | 카드 안 셀렉트 + mutation + persist (아직 낙관적 아님) | M2 | 미리보기 + 새로고침 |
| 6 | optimistic-update | onMutate 스냅샷 / onError 롤백 / 토스트 / 테스트 | M3 | 테스트 + 미리보기 |
| 7 | search-filter | 이름 검색 + 직무 필터, useDeferredValue | M4 | 미리보기(250건) |
| 8 | detail-panel | PC 사이드 패널 / 모바일 전체 화면 시트, Esc 닫기, 포커스 복귀 | M5 | 미리보기 |
| 9 | loading-error-empty | ErrorBoundary + 재시도, 빈 상태 2종. mock 옵션 오버라이드 진입점(`?failRate=1` 등) 추가 | M6 | 미리보기(실패율 100%로) |
| 10 | a11y-keyboard | Tab/Enter, 이동 컨트롤 키보드, aria-live | S1 | 키보드만으로 시나리오 |
| 11 | wrap-up | README·DECISIONS·PROMPTS 대조·최종 verify | 전체 | ✅ 1차(9/22) |

## 시간 되면 (Must 전부 ✅ 이후)
| # | scope | 내용 |
|---|---|---|
| 12 | race-condition | 카드별 mutation 직렬화 (TanStack Query `scope`) + 테스트 |
| 13 | undo | 마지막 이동 역이동 (토스트에 되돌리기 버튼) |
| 14 | virtualization | 1,000건 seed 토글 + 컬럼 가상 스크롤 |
