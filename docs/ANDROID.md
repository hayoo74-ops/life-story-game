# LIFE STORY v1.5 Android 설치·개발

앱 이름: **LIFE STORY — 나의 인생**  
ID: `com.hayoo74.lifestory`  
버전 이름: `1.5.0`, versionCode: `10500`  
최소 Android: 7.0 (API 24). 권장 대상: Galaxy S24 Ultra, 최신 Android System WebView.

## 갤럭시에 설치하기

1. [APK 다운로드](https://raw.githubusercontent.com/hayoo74-ops/life-story-game/main/downloads/v1.5.0/LIFE-STORY-DEMO-v1.5.apk) 링크를 엽니다. [v1.5 배포·검증 기록](RELEASE_V1_5.md)에 SHA-256과 실제 검사 결과가 있습니다.
2. `LIFE-STORY-DEMO-v1.5.apk`를 내려받아 **내 파일 → 다운로드**에서 엽니다.
3. 요청되면 해당 브라우저 또는 내 파일의 **출처를 알 수 없는 앱 설치** 권한을 허용한 뒤 설치합니다. 기기 관리 정책이나 삼성 보안 위험 자동 차단이 설치를 막는 경우에는 기기에 표시되는 안내를 확인해야 합니다.
4. 홈 화면/앱스의 LIFE STORY 아이콘을 누릅니다. Chrome이나 삼성 인터넷을 따로 열지 않습니다.
5. 첫 실행부터 필수 게임 파일은 APK 안에 있습니다. 인터넷 없이 새 게임을 시작할 수 있습니다. 소리는 게임 상단의 음표 버튼으로 켭니다.

업데이트 시 앱을 제거하지 말고 같은 서명의 APK를 덮어 설치하세요. 앱 제거·저장 데이터 삭제는 Android에 보관된 진행을 지웁니다. **메뉴 → 저장 파일 내보내기**로 파일을 공유/보관할 수 있습니다. 웹 진행을 옮기려면 웹에서 JSON을 내보내고 앱에서 해당 파일을 가져오세요. 웹과 앱 저장은 자동으로 공유되지 않습니다.

## 로컬 빌드

```sh
npm ci
npm test
npm run android:sync
cd android
./gradlew assembleDebug
```

Java 21과 Android SDK 36, build-tools 36.0.0이 필요합니다. SDK 경로는 개발 환경의 `ANDROID_HOME` 또는 추적되지 않는 `android/local.properties`에서 지정합니다. 출력은 `android/app/build/outputs/apk/debug/app-debug.apk`입니다.

`npm run build`는 Pages용 `dist`를 만들며 base는 `/life-story-game/`입니다. `npm run build:android`는 상대 경로의 `dist-native`를 만듭니다. Capacitor 설정에 외부 `server.url`이 없으며 네이티브에서는 PWA 서비스 워커를 등록하지 않습니다.

## GitHub Actions

**Actions → Build LIFE STORY Android APK → Run workflow → main**을 선택합니다. `apk` 작업이 빌드·서명·모든 내장 파일 일치 검사를 수행합니다. 성공하면 **LIFE-STORY-DEMO-v1.5** 아티팩트에 APK, `SHA256SUMS.txt`, 서명·패키지 메타데이터가 들어갑니다. 일반 Actions 아티팩트 다운로드는 GitHub 로그인이 필요하며 보관 기간은 30일입니다. 최종 릴리스 다운로드는 별도로 기록합니다.

`emulator` 작업은 API 35 Pixel 6 프로필에서 인터넷을 끈 채 실제 APK를 설치하고, UIAutomator와 Android 입력으로 터치·저장·앱 복귀·프로세스 재시작·같은 서명 덮어쓰기·뒤로 가기를 검사합니다. 결과와 Android 스크린샷은 **Android-emulator-validation-v1.5**에 들어갑니다. 이 검사를 Galaxy 실기기 검사로 간주하지 않습니다.

Pages는 별도 `pages.yml`을 사용합니다. main 푸시는 검증을 실행하고, 실제 공개 배포는 기존 공개 승인 입력을 포함하는 workflow_dispatch로 수행합니다.

## 저장과 데모 서명

네이티브 부팅 시 Preferences를 먼저 읽은 후 게임을 시작합니다. 기존 저장 키, v1~v4 정규화, 조사·선택·기억 데이터는 유지합니다. WebView LocalStorage에 과거 앱 데이터가 있는 경우 비어 있는 Preferences 항목으로 옮기며 원본을 지우지 않습니다. 백그라운드 이동 시 저장 큐를 비웁니다. 앱 제거 후의 Android 자동 클라우드 복원은 활성화하지 않았습니다.

공개된 `android/debug-demo.keystore`는 이 데모의 재설치 없이 업데이트를 위한 고정 개발 키입니다. 실제 스토어 배포용 비밀 키가 아니며 정식 서명에는 사용하지 않습니다. 키 또는 앱 ID를 바꾸면 기존 앱 위에 업데이트할 수 없으므로 JSON 백업을 먼저 확보해야 합니다.
