# LIFE STORY v1.2 — 대화와 가족의 장면

2026-11-04. 최신 요청에 따라 일반 플레이의 보고서형 설명을 제거하고, 인물 대사·독백·행동으로 다시 썼습니다. 핵심 사건과 가족 구성의 시간 순서는 유지합니다.

## 변경 파일

- README.md
- VALIDATION.md
- docs/CHAPTER_1_REPORT.md
- docs/CHAPTER_1_REVISION.md
- docs/NARRATIVE_V1_2.md
- docs/screenshots/brother-paper.png
- docs/screenshots/family-source-notes.png
- docs/screenshots/father-meal.png
- docs/screenshots/grandma-after-study.png
- docs/screenshots/natural-door.png
- docs/screenshots/natural-hero.png
- docs/screenshots/natural-mother.png
- docs/validation/natural-dialogue-browser.json
- docs/validation/natural-dialogue-regressions.json
- docs/validation/natural-dialogue-transcript.txt
- package-lock.json
- package.json
- src/art.js
- src/data/chapter-one.js
- src/data/chapter-plans.js
- src/data/dialogue.js
- src/data/family.js
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

## 대사와 진행

- 어머니: 아침 인사·사진 선택, 종이와 가면 준비, 가면 착용 후 반응, 반복 대화. 예: “재원아, 일어났나? 거실에 와 봐라.”
- 아버지: TV와 준비 중인 아이의 대화, 액션가면 장면, 가족 변화 이후 신발 준비, 아버지와 단둘이 지낼 때 식사/수저/외출 대화. 예: “수저는 잘 놓았네.” 선택에 따라 외출 준비 반응으로 달라집니다.
- 형: 비행기/배를 고르는 첫 종이놀이, 접은 뒤 반응, 후반부 다시 만나는 대화. 예: “이 종이, 반으로 접어 볼까?”
- 할머니: 공부 준비·연필·문제 읽기 선택, 재촉과 공부 후 정리. 예: “문제집 다 봤으면 책부터 정리해라.”
- 할아버지: 풀이 방법 선택, 동그라미/숫자에 대한 반응, 정답/오답/그림부터 보기와 공부 후 대화.
- 배경 NPC 및 사물: ‘기록의 맥락을 읽는다’ 같은 메타 선택 대신 그네 구경·연필 고르기·장난감 밀기·신발 정리 같은 작은 행동으로 바꿨습니다.

NPC 대화는 storyScene·dialogueVisits·choices·진행 이벤트에 따라 달라집니다. 주요 가족 대화가 완료돼야 사진·가면·가족 변화·외출·공부의 다음 장면이 열립니다. 사물만 조사하고 모두 지나갈 수 없습니다.

## 전용 장면

- 액션가면: **22개 대사·행동**. 부모님의 TV 시청과 반응, 가면 착용·영웅 포즈, 아버지 장난·웃음, 어머니·재원 반응을 조합했습니다. 두 실제 대사는 그대로입니다. TV로 시선을 돌리고 플레이어를 화면 밖으로 처리하므로 신체/속옷 노출이 없습니다. 부모의 웃음·놀란 표정 프레임, 움직임, 카메라와 합성 효과음을 사용합니다.
- 방문: **7개 대사·행동**. 어린 재원이 직접 목격했다는 핵심을 유지하고 짧은 문학적 독백·문 파손·충격음·정적으로 전달합니다. 원인·추가 폭력·다른 목격자를 만들지 않습니다.
- 형제: **9개 대사·행동**의 종이접기 막간. 형 전용 픽셀 캐릭터, 종이/색연필, 비행기/배 선택, 양쪽을 잡고 접는 연출, 기억 17번째 조각과 가족 프로필을 추가했습니다.

형은 실제 가족으로 포함하지만 동거 시기·나이 차이·성격·두 핵심 사건의 목격 여부는 null로 남깁니다. ‘막간 · 종이 한 장’은 날짜/주거지를 지정하지 않는 극적 재구성입니다. 부모님 거실, 방문 사건, 아버지와의 단독 동거 맵에는 형 NPC를 넣지 않았습니다. 형이 핵심 사건의 참여자였다고 확정하지 않습니다.

## 출처와 창작

각 대사에 sourceType을 보관합니다: real_memory / fictional_dialogue / dramatic_reconstruction. 핵심 사건과 두 직접 대사 외의 일상 말·반응은 창작입니다. 방문 앞 독백은 실제 당시 생각의 인용이 아니라 문학적 재구성입니다.

출처 배지·확인 문구는 일반 대화/회상/기억 획득에서 표시하지 않습니다. ‘가족과 이야기의 출처’ 메뉴와 앨범의 접힌 ‘출처와 제작 메모’에서만 열람합니다. 부모님 이혼의 원인·법적 절차, 미확인 중대한 폭언/폭력, 특정 조부모의 체벌 행위·횟수·상해는 추가하지 않습니다.

## 저장과 반복 플레이

v3는 v2의 장면/위치/기억/퀘스트/설정을 보존하며 새 대화 횟수·선택·개정 컷신 관람·막간 복귀점을 저장합니다. v2 원본도 별도 백업합니다. v1의 원본/이전 수집 보존 정책은 유지합니다. 새로운 22개 대본을 모두 본 뒤에만 재관람 생략이 열립니다. 이전 버전의 짧은 컷신 이력으로 새로운 대본을 처음부터 생략하지 않습니다.

## 검증 결과

빌드 성공, 단위 검사 **19개**, 전체 UI 플레이 **11개 그룹**, 최종 부분 회귀 **7개 그룹** 통과. JavaScript 예외 0건. 전체 플레이에서 기억 17개와 선택 21개를 저장했으며, 대화/회상 259개 화면에서 보고서형 문구가 나오지 않음을 확인했습니다. 일부 반응/표정 추가 뒤에는 해당 부분을 최종 빌드에서 별도 재검증했습니다. 실제 UI 전체 플레이와 fixture 부분 검사를 [검증 기록](../VALIDATION.md)에 구분했습니다.

## 미완성·한계

실제 사진 기반 외형·음성 연기·S24 Ultra 실기기 검증·사람의 읽기 시간 측정은 하지 않았습니다. 형의 미확인 성장 정보를 중요한 실제 사건으로 만들지 않았습니다. 챕터 2–8은 기획만 있습니다. 원본 작업 폴더와 기존 커밋 이력은 유지하며 node_modules/dist/임시 테스트 결과는 커밋에서 제외합니다.

## GitHub

저장소: https://github.com/hayoo74-ops/life-story-game
작업 브랜치: feat/natural-dialogue-and-brother
반영 대상: main

빌드·검사 후 커밋하고 원격 파일 해시를 대조합니다. 실제 반영 커밋 ID는 최종 작업 응답에 제공합니다.
