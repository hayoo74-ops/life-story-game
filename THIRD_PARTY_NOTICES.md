# 외부 라이브러리

프로젝트 의존성은 `package.json`과 `package-lock.json`에 기록되어 있습니다.

- Phaser 3: MIT License — https://github.com/phaserjs/phaser
- Vite: MIT License — https://github.com/vitejs/vite
- vite-plugin-pwa: MIT License — https://github.com/vite-pwa/vite-plugin-pwa
- Workbox: MIT License — https://github.com/GoogleChrome/workbox

의존 패키지의 개별 라이선스는 설치된 패키지의 LICENSE 파일과 저장소를 따릅니다. Phaser 및 Vite의 저작권 고지는 해당 배포물에 유지됩니다.

플레이어, NPC, 배경, 사물, 설치 아이콘은 이 프로젝트를 위해 직접 제작한 코드 기반 픽셀 그래픽입니다. 음악과 효과음은 Web Audio로 합성합니다. 상업 게임의 캐릭터·맵·음악·스프라이트를 사용하지 않았습니다. 운영체제의 기본 한국어 글꼴을 사용하며 외부 폰트나 CDN을 요구하지 않습니다.

실제 인물과 인생 기록은 사용자가 제공한 내용이며, 제3자 배포·공유 시 개인정보와 이용 범위를 별도로 검토해야 합니다.

v1.3의 실내/바람/비/TV 환경음, 종이/연필/서랍/문/발걸음/장난감/기억 효과와 장면 선율도 `src/audio.js`에서 자체 합성합니다. 외부 오디오 샘플을 추가하지 않았습니다. 시스템의 AudioContext와 기본 글꼴 외에 실행 중 외부 리소스 요청은 없습니다.

Android v1.5에서는 Capacitor core/android/CLI 및 App, Preferences, Filesystem, Share, SplashScreen, StatusBar 공식 플러그인을 사용합니다(MIT, https://github.com/ionic-team/capacitor 및 https://github.com/ionic-team/capacitor-plugins). AndroidX와 Gradle 등 Android 빌드 의존성은 각 패키지의 Apache-2.0/MIT 등 라이선스를 따릅니다. 정확한 버전은 lockfile과 android/variables.gradle에 기록합니다. Android 아이콘은 기존 게임의 자체 제작 아이콘을 재사용합니다. 합성 오디오에 대한 상세 출처와 한계는 docs/AUDIO_V1_5.md에 기록합니다.
