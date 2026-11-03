> v1.1의 변경 이력을 보관한 문서입니다. 최신 대사 정책과 형제 장면은 [v1.2 보고](NARRATIVE_V1_2.md)를 우선합니다.

# 챕터 1 전면 보강 — 최종 변경 보고

v1.1 · 2026-11-03. 기존 개발 원본 /workspace/sites/life-story는 변경하지 않았으며, GitHub 체크아웃의 작업 브랜치 feat/chapter-one-life-record에서 확장했습니다.

## 1. 수정·추가 파일

- .gitignore
- README.md
- VALIDATION.md
- docs/CHAPTER_1_REPORT.md
- docs/CHAPTER_1_REVISION.md
- docs/screenshots/daeyeon-mobile.png
- docs/screenshots/door-mobile.png
- docs/screenshots/hero-mobile.png
- docs/screenshots/study-mobile.png
- docs/validation/chapter-one-browser.json
- docs/validation/chapter-one-regressions.json
- index.html
- package-lock.json
- package.json
- src/art.js
- src/audio.js
- src/data/chapter-list.js
- src/data/chapter-one.js
- src/data/chapter-plans.js
- src/game.js
- src/life-record.js
- src/main.js
- src/save.js
- src/story.js
- src/style.css
- tests/browser_check.py
- tests/browser_regressions.py
- tests/save.test.js
- tests/story.test.js

## 2. 추가·재구성 장면

프롤로그: 2026년 현재, 움직여 사진첩 펼치기.

1. 학장동의 어린 시절 집 — 가족사진을 살펴보며 이 집의 첫 페이지를 여세요.
2. 부모님과 함께하는 일상 — 거실을 둘러본 뒤 종이가면을 찾아 착용하세요.
3. 우하하하! 난 액션가면! — 가면을 쓰고 아버지에게 다가가 ✦ 버튼을 누르세요.
4. 시간이 흐른 뒤 — 시간의 책갈피를 조사해 약 1~2년 뒤로 넘어가세요.
5. 부서진 방문 — 방문에 다가가 직접 목격한 기억을 확인하세요.
6. 달라진 가족 — 가족 구성의 변화를 담은 기록을 살펴보세요.
7. 아버지와 단둘이 — 약 1~2년의 기록을 확인한 뒤 다음 기억으로 이동하세요.
8. 새로운 동네, 대연동 — 새 동네를 걸어 조부모님 댁 표지판으로 이동하세요.
9. 공부방과 문제집 — 공부책상에서 문제집을 살펴보세요.
10. 회초리에 관한 기억 — 회초리의 기록을 확인하고 공부의 페이지를 닫으세요.
11. 현재의 재원 — 사진첩에서 기억을 시간 순서대로 정리하세요.
12. 다음 이야기 — 거리 끝의 다음 이야기 표지판을 살펴보세요.

맵 상태 13개에는 같은 집의 시기별 변형과 기존 선택 탐험이 포함됩니다. 모두 서로 다른 실제 거주지라는 뜻이 아닙니다.

## 3. NPC

실제 가족 4명: 아버지·어머니·할머니·할아버지. 창작 배경 인물 4종: 골목의 이웃·동네 아이·문구점 주인·대연동의 이웃. 시기별 11개 배치로 구성합니다. 실제 가족의 미확인 발언을 만들지 않고 기록 서술과 두 실제 직접 대사를 구분했습니다.

## 4. 상호작용

- 가족사진
- 텔레비전
- 장난감
- 거실 소파
- 신발장
- 창문
- 종이가면
- 아직 닫힌 방문
- 시간의 책갈피
- 방문에 남은 기록
- 가족 구성의 변화
- 두 사람의 자리
- 약 1~2년의 기록
- 아직 쓰지 않은 기록
- 대연동의 기록
- 공부책상
- 문제집
- 연필
- 지우개
- 시계
- 책장
- 회초리
- 공부의 페이지 닫기
- 현재의 사진첩
- 가로등
- 그네
- 문구점의 연필
- 학교 가방

28종의 데이터 중 26종은 조사 사물로 배치하고 현재 사진첩·공부 마무리는 이벤트로 연결합니다. 전체 조사 경로에서 26개 사물과 27개의 고유 선택을 확인했습니다. 공부는 정답/오답/건너뛰기 모두 진행합니다. 완료 뒤 수집을 보존하며 이전 장면에 재방문할 수 있습니다.

## 5. 기억의 조각

- 함께 살았던 학장동의 집 (fact / staged)
- 액션가면의 추억 (fact / staged)
- 약 1~2년 뒤의 책갈피 (fact / staged)
- 직접 목격한 부서진 방문 (fact / staged)
- 달라진 가족의 구성 (fact / staged)
- 아버지와 단둘이 지낸 시간 (fact / staged)
- 대연동으로 옮긴 거처 (fact / staged)
- 공부가 중심이던 집 (fact / staged)
- 회초리에 관한 기억 (fact / staged)
- 거실의 텔레비전 (fact / staged)
- 작은 장난감의 자리 (fiction / staged)
- 골목의 가로등 (fiction / staged)
- 그네 옆의 여백 (fiction / staged)
- 연필을 고르는 페이지 (fiction / staged)
- 공부책상에 남긴 기록 (fact / staged)
- 순서대로 놓은 기억 (staged / staged)

선택 탐험의 조각을 모두 수집하지 않아도 완료할 수 있습니다.

## 6. 실제 기억과 재구성·창작

fact=사용자가 제공한 기억, staged=공간·애니메이션·카메라·현재 사진첩의 재구성, fiction=익명 배경 대화·사물·예시 문항. 주요 사건 12개와 개별 대사·기억에 분류를 저장합니다. 직접 대사는 제공된 두 문장만 재생합니다. 사건의 원인, 미확인 감정·나이·연도·주소·추가 폭력은 넣지 않습니다. 자세한 사실 순서와 표현 범위는 [시나리오 보강 기록](CHAPTER_1_REVISION.md)을 참조하세요.

## 7. 빌드·검사

npm run build 성공, 단위 검사 14개, 전체 브라우저 검증 14개 그룹, 부분 회귀 검사 3개 그룹 통과. 브라우저 JavaScript 예외 0건. 컷신 중 저장 복원·취소, 멀티터치, 모바일 경계, 오프라인, v1 마이그레이션, 선택 수집 없는 완료를 확인했습니다. [상세 검증](../VALIDATION.md)에 실제 실행과 fixture 검사를 구분했습니다.

## 8. 예상 플레이 시간

선택 조사를 읽는 기준 20–30분 목표. 사물 대사 한 분기씩 약 4,100자, NPC 기록 약 1,200자, 기억 약 1,350자, 사진첩 정리 약 830자와 전용 회상이 있습니다. 읽기 400–550자/분이라는 추정 가정과 이동·조사 시간을 고려했습니다. 빠른 주요 경로는 더 짧으며 사람의 실측 결과가 아닙니다. 자동화 266초를 사람의 분량으로 해석하지 않습니다.

## 9. 미완성

챕터 2–8은 10개 항목의 구조·데이터 설계만 있습니다. 실제 플레이·엔딩은 미구현입니다. 아버지와 단둘이 지낸 기간의 구체적인 일상, 사진 기반 캐릭터, 실제 S24 Ultra·삼성 인터넷 검증, 실제 사용자 읽기 시간 측정, 외부 호스팅 배포는 완료로 보고하지 않습니다.

## 10. GitHub 반영

저장소: https://github.com/hayoo74-ops/life-story-game
작업 브랜치: feat/chapter-one-life-record
반영 대상: main

기존 커밋 이력과 README의 제목·소개를 보존하고 node_modules·dist·임시 테스트 결과물은 제외합니다. 보관한 보고서·선별 스크린샷은 docs에 포함합니다. 최종 작업 응답에 실제 반영 커밋과 원격 검증 결과를 제공합니다.
