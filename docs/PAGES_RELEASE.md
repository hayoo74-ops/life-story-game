# LIFE STORY — 실제 GitHub Pages 배포 검증

검증일: 2026-11-04.

**실제 게임 주소: https://hayoo74-ops.github.io/life-story-game/**

Galaxy Chrome에서 열어 새 게임/이어하기를 선택할 수 있습니다. 홈 화면 추가는 브라우저 메뉴를 사용합니다. 설치 메뉴 자체를 실제 Galaxy 기기에서 확인한 것은 아닙니다.

## 배포 결과

- [GitHub Actions 배포 실행](https://github.com/hayoo74-ops/life-story-game/actions/runs/41776578240): build와 deploy 모두 **success**.
- 배포 소스 커밋: `148a0e494690088a0ff0097a96da38c10086aa23`.
- Pages Source는 workflow, base와 PWA 범위는 `/life-story-game/`, HTTPS 강제 적용을 확인했습니다.
- 실제 외부 주소의 HTML이 **HTTP 200**으로 열리며 LIFE STORY 화면을 확인했습니다.
- HTML·JS·CSS·manifest·서비스 워커·아이콘 등 **15개 파일이 전부 HTTP 200**, 각각의 SHA-256이 로컬 production build 결과와 일치했습니다.

[배포 메타데이터](validation/pages-release/deployment.json), [실제 HTTP·파일 검증](validation/pages-release/http.json).

## 공개 범위와 수정한 배포 조건

Pages 설정을 확인하면서 저장소 자체도 Public으로 바뀐 것을 발견했습니다. 이전의 ‘비공개 소스’ 조건과 달라 추가로 확인했고, 사용자가 **저장소 공개도 명시적으로 허용**했습니다. 사이트 공개 승인과 소스 공개 승인을 별도로 처리합니다.

기존 워크플로의 비공개 전용 검사를, 명시적 `PUBLIC_SOURCE_APPROVED` 기록이 있는 Public 저장소도 허용하도록 수정했습니다. 승인이 없는 Public 저장소와 알 수 없는 공개 범위는 여전히 거부합니다. `approve_public_site`는 배포 요청마다 별도로 검사합니다. 저장소 공개 범위를 워크플로가 변경하는 코드는 없습니다.

현재 소스 저장소와 게임 사이트가 모두 공개임을 전제로 배포했습니다. 소스/실명/스토리는 외부에서 열람할 수 있습니다. 기존 게임 로직과 스토리·리소스·Vite base·의존성 lockfile은 이전 Pages 준비 커밋 `7ed9d7b`와 동일합니다. 변경은 배포 정책·검사·안내 문서입니다.

## 빌드와 자동 검사

- `npm ci --cache /tmp/life-story-npm-cache` 성공: 336개 패키지 설치.
- `npm run build` 성공: Vite 7.3.7 / Phaser 3.90.0, 5.57초, PWA 12개 사전 캐시 항목 / 1381.56 KiB.
- `npm test`: **37개 통과, 실패 0**. 새로 추가한 소스 공개 동의/알 수 없는 공개 범위 검사 포함.
- actionlint v1.7.12의 워크플로 검사 성공.
- 원격 Actions 로그에서도 테스트 37개 통과와 프로젝트 경로 브라우저 검사 6개 통과를 확인했습니다. 중복 push 검증 대신 동일 커밋의 workflow_dispatch에서 전체 설치·테스트·빌드·브라우저·배포를 실행했습니다.

[설치](validation/pages-release/npm-ci.txt), [빌드](validation/pages-release/build.txt), [단위 검사](validation/pages-release/unit-tests.txt).

## 실제 공개 주소에서 모바일 브라우저 검사

새 쿠키/저장 공간의 Headless Chromium 154 + Playwright 1.62.0으로 실제 HTTPS 게임 주소에 접속했습니다. 로컬 미리보기 결과로 대체하지 않았습니다.

1. JS·CSS·아이콘·manifest가 모두 프로젝트 경로에서 로딩됨.
2. 412×915 터치 화면에서 이동과 점프 동시 입력, 해제 후 정지.
3. 새 게임 → 오프닝 → NPC 대화와 선택지 → 가족 기억 획득 → 다음 장면.
4. 집 ↔ 골목 왕복, 장소 리소스 로딩.
5. 세로/가로 전환, 44px 이상 조작 영역, 게임과 조작 버튼의 겹침/가로 넘침 없음.
6. 실제 사이트 범위의 서비스 워커 활성화 후 네트워크 차단 → 내부 URL fallback → 이어하기. 저장 v4의 장면·장소·기억·선택이 유지됨.

**6개 그룹 통과, JavaScript 예외 0, 실패 HTTP 응답 0.** 실제 [모바일 캡처](screenshots/pages-release/mobile.png)와 [브라우저 결과](validation/pages-release/browser.json)를 보관했습니다.

실행 환경의 외부 API 요청이 직접 IPv6 연결을 시도해 ENETUNREACH가 발생한 부분은 테스트 실행기의 브라우저/요청 컨텍스트에 기존 환경 프록시를 적용해 해결했습니다. 사이트 코드나 TLS 검증을 끄지 않았습니다. 로컬 검사에는 프록시를 강제로 적용하지 않습니다.

## 저장과 검증 한계

기존 게임의 LocalStorage 키와 스키마는 변경하지 않았습니다. 이전 사이트와 origin이 다르면 저장은 자동 공유되지 않으므로 기존 게임 메뉴에서 JSON 내보내기 → 이 주소에서 가져오기로 옮겨야 합니다. 사용자 기기의 저장을 삭제하는 작업은 하지 않았습니다.

이번 검증은 터치 모바일 환경을 모사한 Chromium 검사입니다. Galaxy S24 Ultra 실기기, 삼성 인터넷, iOS Safari의 실제 터치/설치/성능은 직접 측정하지 않았습니다. 현재 사이트의 HTTP·리소스·게임 실행·모바일 입력·오프라인 복원 성공 범위만 보고합니다.
