# GitHub Pages 배포 준비 검증

2026-11-04 (Asia/Seoul). 기준 게임 커밋 `b795d62`. 게임의 배포 경로와 Actions 설정을 추가한 작업이며, 개인 스토리를 공개하는 실제 배포는 수행하지 않았습니다.

## 설치·빌드·정책

- `npm ci --cache /tmp/life-story-npm-cache` 성공: lockfile 기준 336개 패키지 설치. 처음 기본 캐시 경로가 쓰기 불가능하여 임시 캐시를 사용했습니다. 기존 원본 프로젝트의 node_modules 링크는 별도로 보관하고 작업 복사본에 독립 설치했습니다.
- `npm run build` 성공: Vite 7.3.7, Phaser 3.90.0, 5.72초. PWA 12개 항목 / 1381.56 KiB 생성.
- `npm test`: **35개 통과, 실패 0**. 기존 31개와 공개 승인/비공개 유지 정책 검사 4개.
- `actionlint v1.7.12`: **오류·경고 0**. 공식 릴리스의 SHA-256을 검증한 뒤 워크플로 문법과 표현식을 검사했습니다. YAML 파싱과 두 배포 입력의 false 기본값도 확인했습니다.
- `src/`, `public/`, `package-lock.json`은 기준 커밋과 변경 없음. 스토리·게임 로직·저장 키와 스키마는 그대로입니다. 설정은 Vite base와 PWA scope/start_url/id, 테스트 실행 명령 및 배포 정책에 한정됩니다.

[설치 출력](validation/pages/npm-ci.txt), [빌드 출력](validation/pages/build.txt), [단위 검사](validation/pages/unit-tests.txt), [워크플로 검사](validation/pages/actionlint.txt), [유지한 파일 SHA-256](validation/pages/preserved-files.json).

## 실제 브라우저 — 6개 그룹 통과

로컬 production preview의 `/life-story-game/` 경로에서 Chromium 154 / Playwright 1.62.0으로 실행했습니다. 소스 위치를 조작하지 않고 새 게임·실제 UI 입력으로 검사했습니다.

1. 하위 경로의 HTML·JavaScript·CSS·설치 아이콘·manifest 정상 로딩.
2. 412×915 모바일 화면에서 CDP 터치 입력으로 이동과 점프 동시 사용, 터치 해제 후 정지.
3. 새 게임·오프닝·엄마 대화·선택지·가족 기억 획득·다음 장면.
4. 집 → 골목 → 집 왕복, 장소별 배경과 오브젝트 로딩.
5. 세로/가로 전환, 가로 넘침/게임·조작 영역 겹침 없음, 44px 이상의 조작 버튼.
6. 프로젝트 경로의 서비스 워커와 캐싱, 네트워크를 끈 상태에서 캐시되지 않은 내부 URL로 이동 → 해당 프로젝트의 index fallback → 이어하기. 기존 `life-story:save`의 v4 장면·장소·기억·선택을 복원했습니다.

JavaScript 예외 **0**, 실패 HTTP 응답 **0**. 신규 설치에서 활성화된 서비스 워커가 다음 탐색부터 페이지를 제어하는 정상 수명주기도 반영했습니다.

[브라우저 결과](validation/pages/browser.json), [세로 화면 캡처](screenshots/pages/mobile.png), 재현: `npm run test:pages`. CI에서도 같은 검사와 고정된 Playwright 의존성을 사용합니다.

## GitHub 상태와 공개 제한

- 저장소 메타데이터: `visibility: private`, `private: true`, `has_pages: false`, 소유자 유형 User.
- Pages 설정 조회: **HTTP 403 — `Resource not accessible by integration`**. 현재 연결로 Pages 설정을 읽거나 변경할 권한이 확인되지 않았습니다. 설정 쓰기를 시도하지 않았습니다.
- Actions 권한 설정 조회도 같은 403이었지만, Actions 실행 목록 읽기는 가능했습니다. 권한 설정 조회 실패와 실제 워크플로 실행 가능 여부는 구분합니다.
- 공식 문서상 비공개 Pages 접근 제어는 지원되는 GitHub Enterprise Cloud 조직 프로젝트 대상입니다. 개인 계정의 공개 Pages를 승인받지 않은 상태에서 활성화하지 않았습니다. 계정 요금제는 확인하지 못했습니다.
- main push의 워크플로는 검증만 수행합니다. 배포는 수동 요청과 실제 공개 범위 검사, 공개 사이트인 경우 명시적 동의를 통과해야 합니다. 403/404 또는 알 수 없는 공개 범위에서는 중단합니다.

원격 Actions 실행 결과는 GitHub의 해당 커밋 실행 화면에서 별도로 확인해야 합니다. 로컬 검사 통과를 원격 CI나 공개 배포 성공으로 표현하지 않습니다.

## 검증 한계·다음 단계

- **이번 GitHub Pages 작업에서 외부 접속이 확인된 게임 주소는 아직 없습니다.** 공개 Pages를 허용할지, 로그인 접근 제어가 있는 호스팅을 사용할지 먼저 정해야 합니다. 현재 Pages 권한 제한도 해결해야 합니다.
- Galaxy S24 Ultra 실기기/삼성 인터넷/iOS Safari는 이번 환경에서 검사하지 않았습니다. 실제 Galaxy Chrome에서 URL을 열어 보는 최종 검증은 배포 뒤에 가능합니다.
- origin이 바뀌면 브라우저의 기존 저장을 직접 읽을 수 없습니다. 기존 주소에서 JSON 내보내기 → 새 주소에서 가져오기를 사용해야 하며 기존 데이터를 자동 삭제하는 코드는 없습니다.
- 이전 v1.3의 챕터 전체 엔딩 검사는 기존 [검증 기록](../VALIDATION.md)에 보존했습니다. 이번 작업에서는 위 6개 배포 경로 검사와 35개 단위 검사를 실행했습니다.

[설정·승인·세이브 이전 절차](GITHUB_PAGES.md).
