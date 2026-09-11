---
name: wrap-up
description: 마무리 절차. 인수 기준 전수 검증, README 작성, DECISIONS.md 빈 곳 채우기, 최종 검증·push. 사용자가 마무리·정리·최종 점검을 요청할 때 사용.
---

# wrap-up

1. **인수 기준 전수 검증** — REQUIREMENTS.md의 체크박스를 하나씩 실제로 확인하며 체크한다. 미충족 항목은 숨기지 말고 보고한다.
2. **README.md** — 실행 방법(설치·실행 명령 1~2줄) / 스택과 mock API 방식 / 폴더 구조 한 줄씩 / 주요 결정 요약(DECISIONS.md 링크) / 안 한 것과 이유. 화면 반 페이지 이내.
3. **DECISIONS.md 점검** — 주요 결정, AI 제안 중 채택·기각, 못 끝낸 기능과 이유. 빈 곳은 사용자와 함께 채운다. 지어내지 않는다.
4. **PROMPTS.md 점검** — 커밋 로그(`git log --oneline`)와 섹션이 1:1로 대응하는지 확인. 빠진 섹션이 있으면 보고.
5. **최종 `/verify`** 후 `docs(wrap-up)` 커밋 · push.
6. 완료 보고: 필수 요구사항 충족 표, 남은 것, 레포 URL.
