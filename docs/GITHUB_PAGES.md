# Galaxy에서 실행하기 위한 GitHub Pages 준비

## 현재 공개 범위와 배포 상태

2026-11-04 사용자는 게임 사이트 공개에 이어 **소스 저장소 공개도 별도로 승인**했습니다. 현재 `hayoo74-ops/life-story-game`은 Public이며, Pages가 활성화됐고 Source/build_type은 GitHub Actions/workflow입니다. 저장소 공개 범위를 코드나 배포 작업이 자동 변경하지는 않습니다.

소스 공개 승인 기록은 워크플로의 `PUBLIC_SOURCE_APPROVED: 'true'`에 명시합니다. 사이트 공개 동의는 수동 배포의 `approve_public_site`로 별도 확인합니다. 기본 정책 함수는 소스 공개 승인이 없는 Public 저장소나 알 수 없는 공개 범위를 계속 거부합니다.

공개 Pages의 방문자는 실명·개인/가족 이야기와 JavaScript 리소스를 내려받을 수 있고 Public 저장소의 소스도 볼 수 있습니다. URL 숨김이나 검색 제한은 접근 제어가 아닙니다. 두 공개 범위 모두 사용자 승인에 따라 사용합니다.

공식 문서: [Pages 공개 범위](https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site).

이전 Private 상태에서 Pages API가 403을 반환해 배포를 보류했던 기록은 [기존 준비 검증](PAGES_VALIDATION.md)에 남아 있습니다. 현재 Pages API 조회는 성공하며 Source=workflow를 확인했습니다. 실제 배포 결과와 접속 주소는 Actions의 성공한 deploy 환경 URL로 확인합니다.

## 경로와 로컬 실행

기본 Vite base는 `/life-story-game/`입니다. PWA scope/start_url/id도 같은 경로를 사용하고 JS/CSS/아이콘은 빌드 시 프로젝트 경로로 변환됩니다. 게임 로직·스토리·LocalStorage 키·세이브 v4 스키마는 변경하지 않았습니다.

```sh
npm ci
npm test
npm run build
npm run preview
```

출력된 로컬 주소의 `/life-story-game/`에서 엽니다. 개발 서버도 `npm run dev` 후 같은 경로를 사용합니다. 루트 경로를 사용하는 다른 호스팅이 필요하다면 다음과 같이 별도로 빌드합니다.

```sh
VITE_BASE_PATH=/ npm run build
```

이는 로컬 실행 안내이며 외부 접속이 확인된 배포 주소가 아닙니다.

## Actions의 동작

`.github/workflows/pages.yml`은 다음과 같이 동작합니다.

- `main` push: 실제 소스 공개 범위와 명시적 승인 확인 → Node 24 / `npm ci` → 단위 검사 → production build → 모바일 브라우저/프로젝트 경로/PWA 검사. **이 이벤트는 사이트를 배포하지 않습니다.**
- 수동 `Run workflow`: 기본값은 검증만 합니다. `publish`를 체크해야 배포 작업을 요청합니다. main에서만 배포할 수 있습니다.
- 배포 직전 실제 저장소와 Pages 설정을 API로 조회합니다. Public 소스는 별도 승인 기록이 있어야 하며 사이트의 public 값도 확인돼야 합니다.
- 사이트가 공개이면 `approve_public_site`를 명시적으로 체크해야 진행합니다. 확인된 비공개 사이트는 공개 동의 없이 배포할 수 있지만, 현재 개인 계정에서 제공되는 기능이라는 뜻은 아닙니다.
- 조회 403/404, 알 수 없는 공개 범위, 별도 승인이 없는 Public 소스, 동의 없는 공개 사이트는 배포를 중단합니다. Pages를 자동 생성/활성화하거나 저장소 공개 범위를 바꾸지 않습니다.
- 배포 요청 시에만 private Actions artifact를 1일 보관합니다. 실제 publish 단계는 공식 configure-pages/deploy-pages 액션을 사용하며 Pages/ID token 쓰기 권한은 배포 job에만 부여합니다.

현재 main의 자동 작업은 검증까지만 합니다. 공개 승인이 있어도 매 배포는 수동 요청하며, 요청한 커밋을 다시 빌드·검사한 뒤 배포합니다.

## 배포 실행

1. Pages Source가 GitHub Actions인지 확인합니다. 현재 설정을 확인했으며 워크플로가 저장소의 공개 범위를 변경하지 않습니다.
2. Actions → Verify and deploy LIFE STORY Pages → Run workflow → main에서 `publish`와 `approve_public_site`를 체크합니다.
3. build/deploy가 성공하면 해당 환경의 실제 `page_url`을 엽니다. 외부 HTTP 접속과 게임 실행을 확인한 주소만 배포 성공 주소로 공유합니다.
4. 다시 비공개 소스를 원하면 계정의 비공개 Pages 지원 여부를 먼저 확인하고 저장소 설정과 `PUBLIC_SOURCE_APPROVED` 기록을 함께 조정해야 합니다. 워크플로 플래그만 끄는 것으로 이미 공개된 저장소나 사이트가 비공개가 되지는 않습니다.

## 기존 저장 옮기기

LocalStorage는 **브라우저와 사이트 origin(프로토콜·호스트·포트)**별로 분리됩니다. 같은 origin에서 경로만 바뀌면 기존 저장 키를 계속 읽습니다. localhost나 다른 호스팅에서 GitHub Pages로 이동하면 origin이 달라지므로 자동으로 세이브를 가져올 수 없습니다.

기존 게임의 메뉴 → 저장 파일 내보내기로 JSON을 보관한 뒤, 새 주소를 같은 Galaxy Chrome에서 열고 저장 파일 가져오기로 복구하세요. Chrome과 삼성 인터넷도 저장 공간이 서로 다릅니다. 배포 과정은 사용자 기기의 LocalStorage를 삭제하거나 서버로 업로드하지 않습니다.

최초 온라인 리소스 캐싱 뒤에는 서비스 워커가 `/life-story-game/` 범위에서 오프라인 재실행을 지원합니다. 다른 사이트의 캐시나 다른 앱의 저장을 초기화하는 코드는 추가하지 않았습니다.

## 브라우저 검사 재현

```sh
python -m pip install -r tests/requirements-browser.txt
python -m playwright install chromium
# 별도 터미널에서 npm run preview
npm run test:pages
```

서버와 브라우저를 바꾸려면 `GAME_URL`, `CHROMIUM_PATH`를 설정합니다. GitHub runner는 Playwright가 설치한 Chromium을 사용하며 로컬 환경에서는 시스템 Chromium도 사용할 수 있습니다. [이번 검증 결과](PAGES_VALIDATION.md)를 참조하세요.
