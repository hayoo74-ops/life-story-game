# Galaxy에서 실행하기 위한 GitHub Pages 준비

## 현재 공개 범위와 배포 상태

2026-11-04 확인 시 `hayoo74-ops/life-story-game`은 **비공개**이고 `has_pages: false`였습니다. 저장소의 공개 범위를 변경하지 않았으며 실제 게임 사이트는 배포하지 않았습니다.

GitHub Pages 사이트의 공개 범위는 소스 저장소와 별개입니다. 개인 계정 소유 프로젝트의 Pages 사이트를 비공개로 제한하는 기능은 제공되지 않습니다. 비공개 사이트의 접근 제어는 GitHub Enterprise Cloud 조직 소유의 지원되는 프로젝트에 해당합니다. 현재 계정 요금제는 이 연결로 확인하지 못했습니다. 비공개 소스의 Pages 이용에 요금제 변경이 필요할 수 있으며, 소스 저장소를 공개로 바꾸는 방법은 사용하지 않습니다.

공개 Pages를 승인하면 방문자는 실명·개인/가족 이야기와 이를 포함한 JavaScript 리소스를 내려받을 수 있습니다. URL을 숨기거나 검색을 제한하는 방법은 로그인 접근 제어가 아닙니다. **현재는 공개 배포 동의가 없으므로 활성화하지 않았습니다.**

공식 문서: [Pages 공개 범위](https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site), [Pages와 계정 요금제](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages).

현재 연결에서 Pages 조회는 `403 Resource not accessible by integration`으로 거부됐습니다. 사이트가 꺼져 있다는 판단은 별도로 조회에 성공한 저장소 메타데이터의 `has_pages`를 근거로 했습니다. 설정 쓰기는 시도하지 않았습니다.

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

- `main` push: 비공개 저장소 확인 → Node 24 / `npm ci` → 단위 검사 → production build → 모바일 브라우저/프로젝트 경로/PWA 검사. **이 이벤트는 사이트를 배포하지 않습니다.**
- 수동 `Run workflow`: 기본값은 검증만 합니다. `publish`를 체크해야 배포 작업을 요청합니다. main에서만 배포할 수 있습니다.
- 배포 직전 실제 저장소와 Pages 설정을 API로 조회합니다. 소스가 비공개인지, 사이트의 public 값이 확인되는지 검사합니다.
- 사이트가 공개이면 `approve_public_site`를 명시적으로 체크해야 진행합니다. 확인된 비공개 사이트는 공개 동의 없이 배포할 수 있지만, 현재 개인 계정에서 제공되는 기능이라는 뜻은 아닙니다.
- 조회 403/404, 알 수 없는 공개 범위, 비공개가 아닌 소스, 동의 없는 공개 사이트는 배포를 중단합니다. Pages를 자동 생성/활성화하거나 저장소 공개 범위를 바꾸지 않습니다.
- 배포 요청 시에만 private Actions artifact를 1일 보관합니다. 실제 publish 단계는 공식 configure-pages/deploy-pages 액션을 사용하며 Pages/ID token 쓰기 권한은 배포 job에만 부여합니다.

공개 승인 전 자동 발행을 방지하기 위해 현재 main의 자동 작업은 검증까지만 합니다. 공개 또는 접근 제한 호스팅 방식을 확정한 뒤 배포 정책을 바꿀 수 있습니다.

## 공개를 승인한 뒤 필요한 설정

1. 저장소는 계속 Private로 유지합니다. Settings → Pages에서 현재 요금제로 이 비공개 저장소의 Pages를 사용할 수 있는지 확인합니다. 사용이 불가하면 소스를 Public으로 바꾸지 말고 지원 요금제 또는 인증이 있는 다른 호스팅을 선택합니다.
2. 공개 사이트가 되는 것에 동의한 경우에만 Pages의 Build and deployment → Source를 GitHub Actions로 설정합니다. 연결 권한이 부족하면 GitHub 연결의 Pages/Workflows 권한을 별도로 허용해야 합니다.
3. Actions → Verify and deploy LIFE STORY Pages → Run workflow → main을 선택합니다. `publish`를 체크하고 공개 사이트이면 `approve_public_site`도 체크합니다.
4. build/deploy 성공 뒤 환경의 실제 `page_url`을 확인합니다. Galaxy Chrome에서 게임·터치·대화·이동을 확인하고, 외부 접속이 확인된 주소만 배포 완료 주소로 공유합니다.

현재는 위 공개 승인/설정 과정을 수행하지 않았으므로, 접속 가능한 Pages 주소를 발급됐다고 보고하지 않습니다.

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
