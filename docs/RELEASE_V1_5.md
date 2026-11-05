# LIFE STORY v1.5 — 배경·소리·현관의 기억·Android

기존 v1.4를 수정했습니다. 챕터 1의 사건 순서, 이동/대화/선택/놀이, 기억 17개, v1~v4 저장 데이터 호환성을 유지합니다. 챕터 2~8은 기획 상태입니다.

## 실제 구현

- `src/data/architecture.js`: 건물 소유 ID와 지붕/외벽/층/창문/문/기초부를 계산합니다. 작은 원경 주택에도 같은 규칙을 적용합니다. 창문 프레임의 여유와 간판/문 간격을 확보합니다. 나무의 수관은 건물 사이 영역에 배치합니다.
- `src/art.js`, `src/game.js`, `src/data/chapter-one.js`: 대연동 배경의 중복 건물과 독립 창문 스프라이트를 실제 외벽 개구부와 연결합니다. 조사용 창문은 건물에 그려진 창문을 가리키며 허공에 또 그리지 않습니다. 실내의 기존 공통 바닥/벽면 배치 규칙을 유지하고 실제 표시 경계로 검사합니다.
- `src/audio.js`: TV 전원 클릭/CRT 잡음/낮은 합성 방송 질감, 속도에 연동되는 장난감 바퀴 마찰음/접촉음, 문/시계/실내·젖은 발걸음/비/처마/바람/먼 차량/새소리. [음원 출처·현재 한계](AUDIO_V1_5.md).
- `src/data/farewell.js`, `src/systems/farewell.js`: 독립 시네마틱 A~E. 장난감 놀이와 작은 TV 소리 → 엄마의 준비와 아이의 다가감 → 정확한 인사 → 현관문과 바깥 비 → 문이 닫혀도 남은 생활 소리 → 현관/TV/장난감 몽타주 → 세 독백과 마지막 문구. 음악은 멈춥니다. 타이머/카메라/동작/소리는 일시정지·앱 백그라운드·취소와 함께 정리합니다.
- `src/main.js`, `src/style.css`, `src/save.js`: 첫 감상부터 건너뛰기, 잠깐 멈추기, 앨범에서 전체 컷신 재감상, 종료 후 원래 진행 복귀. 컷신 동안 이동 버튼을 비활성화합니다. 첫 조사 전체 팝업/재조사 한 줄/앨범 재열람 정책은 유지합니다.
- `src/bootstrap.js`, `src/native.js`, `src/systems/runtime-storage.js`: 앱 전용 Preferences 저장, 시작 시 복원, 하드웨어 뒤로 가기, 백그라운드 사운드·게임 정지, 저장 JSON 공유. 웹에서는 기존 LocalStorage를 그대로 사용합니다.
- `android/`, `capacitor.config.json`, `vite.config.js`, `package*.json`: Capacitor 8, 앱 ID `com.hayoo74.lifestory`, v1.5.0, 세로·몰입 모드와 디스플레이 컷아웃 여백. Android 빌드는 독립된 `dist-native`를 패키징합니다. Pages의 기존 base와 PWA를 유지합니다.
- `.github/workflows/android.yml`, `scripts/verify-apk.py`, `tests/android_smoke.py`: 별도 APK 빌드/서명·ZIP·내장 파일 검사와 Android 에뮬레이터 설치 검사.
- `tests/v15.test.js`, `tests/browser_v15.py`, 기존 브라우저/단위 검사: 건물 규칙/출처/기존 저장/반복 조사 회귀/모든 스테이지의 실제 렌더링/소리 상태/컷신 전체·건너뛰기·앨범을 검사합니다.

## 서사 출처와 삽입 위치

장면 6의 이혼 기록과 기억 획득 뒤, 장면 7의 아버지와 지내는 시기 앞입니다. 기존 숫자 장면 ID를 바꾸지 않았으며 저장은 장면 6의 안전한 체크포인트를 유지합니다. 도중 종료하면 그 체크포인트에서 다시 시작합니다. 진행이 뒤에 있는 기존 저장을 강제로 되돌리지 않습니다. 이미 본 경우 앨범의 가족 변화 기억에서 재감상할 수 있습니다.

엄마의 `엄마 나갔다올게 건강하게 잘있어`는 사용자가 실제 기억으로 지정한 **real_memory**입니다. 비, 외출 준비, 장난감 놀이, 동선, 몽타주와 독백은 **dramatic_reconstruction**입니다. 기존 **fictional_dialogue** 구분을 유지합니다. 엄마의 이후 행방, 사망/실종 또는 사건의 원인을 새로 확정하지 않습니다.

검은 화면의 창작 독백 순서:

1. 그날, 엄마는 나갔다 온다고 했다.
2. 나는 그 말이 정말 외출 인사인 줄 알았다.
3. 건강하게 잘있어.
4. 그 뒤로 다시는 엄마를 만날 수 없었다.

## 실행·설치

웹: https://hayoo74-ops.github.io/life-story-game/  
Android 빌드·갤럭시 설치·저장 이동: [ANDROID.md](ANDROID.md).

## 검증과 배포 기록

검증일: **2026-11-05 UTC**. 빌드·브라우저·네이티브 결과를 구분합니다.

| 검사 | 실제 결과 |
| --- | --- |
| `npm ci`, `npm test` | 설치 성공, **46개 통과/0 실패** |
| `npm run build` | 성공, Pages base `/life-story-game/`, 오프라인 precache 27개 |
| `npm run android:sync` | 성공, 앱용 상대 경로 빌드 + 6개 네이티브 플러그인 동기화 |
| 챕터 1 전체 진행 | **11개 그룹 통과**, 기억 17개/액션가면 22비트/선택 24개, 자동화 388초, JS 예외 0 |
| 최종 CI 웹 검사 | Pages **6개**, 기억/실내/작별 **4개**, v1.5 **5개** 그룹 통과, JS 예외 0 |
| 전체 스테이지 | **15곳 실제 렌더링**. 일반 14곳의 좌·중·우/세로 + 컷신 15단계, CI 스크린샷 **71장** 촬영. 컨택트 시트 검토, 외벽/가구 실제 경계 검사 |
| 공개 사이트 | HTTP **200**, 배포 파일 **30개**의 SHA-256/바이트 일치. 공개 주소에서 Pages 6개 + 기억/작별 4개 그룹 재검사 통과. JS 예외와 실패 HTTP 응답 0 |
| APK | **서명 v2 검증 성공**, ZIP CRC 정상, 내장 웹 파일 **26개** 로컬 빌드와 바이트 일치, 외부 게임 `server.url` 없음 |
| Android 설치 검사 | **API 35, Pixel 6 프로필 에뮬레이터 6개 그룹 통과**. Wi-Fi/데이터를 끄고 첫 시작/실제 터치 이동/세로 버튼 배치/백그라운드 복귀/화면 절전·깨우기/프로세스 재시작/같은 서명 덮어쓰기/뒤로 가기 검사. 원시 네이티브 Preferences 저장 위치 454, 스키마 4 유지. 잡힌 JS/네이티브 치명 오류 0 |

웹 배포 커밋: `7df1ff7cfb0e332c61860b31c804e2e68a931a7e`.  
APK 빌드 커밋: `dd63f69abf1304abd088ecae7d1e91e4a0578cb7` (이후 변경은 시작 로고 리소스뿐이며 웹 핵심 소스는 같습니다).  
전체 챕터 회귀 검사는 `1d95c20`에서 수행했고, 이후 비 창문/중립 표기/기존 저장의 앨범 진입/오디오 복귀 보강은 최종 CI와 공개 사이트에서 별도 검사했습니다. 실험용 저장 fixture를 사용하는 집중 검사와 처음부터 진행한 전체 경로 검사를 혼동하지 않습니다.

- [성공한 Pages 빌드·배포](https://github.com/hayoo74-ops/life-story-game/actions/runs/41948945433)
- [성공한 최종 APK 빌드·Android 설치 검사](https://github.com/hayoo74-ops/life-story-game/actions/runs/41949627725)
- [검증 원본 JSON/빌드 로그](validation/v1.5/), [수정 코드 전체 목록](validation/v1.5/changed-files.txt)

### APK 다운로드

**[LIFE-STORY-DEMO-v1.5.apk 다운로드](https://raw.githubusercontent.com/hayoo74-ops/life-story-game/main/downloads/v1.5.0/LIFE-STORY-DEMO-v1.5.apk)** — 4,576,943 bytes, 약 4.6MB.  
[SHA256SUMS.txt](../downloads/v1.5.0/SHA256SUMS.txt), [설치 방법](ANDROID.md).

```text
cfc2a1f70337db146bf6485b3480afed2e9f5ca77f31399781a2438443770cd8
```

Actions에서도 위 APK 실행의 **LIFE-STORY-DEMO-v1.5** 아티팩트를 받을 수 있습니다(로그인 필요, 30일 보관). 아티팩트 ZIP의 SHA-256은 GitHub의 업로드 digest와 같았으며 실제 다운로드·압축 해제에 성공했습니다. 최종 APK를 다시 내려받아 해시와 바이트 수를 검사했습니다.

GitHub `uploads.github.com`의 릴리스 첨부 업로드는 **HTTP 401: Bad credentials**로 거절됐습니다. 저장소/Actions API 인증과 main 푸시는 정상입니다. 인증 범위의 원인을 추정해 단정하지 않으며, 동일한 검증 APK를 버전별 `downloads/v1.5.0/`에 보관해 만료되지 않는 공개 파일 경로로 전달합니다. 릴리스 설명도 이 파일을 안내합니다.

### 화면

- [전체 15개 스테이지 컨택트 시트](screenshots/v1.5/all-stages.png)
- [실제 공개 사이트의 세로 작별 장면](screenshots/v1.5/farewell-live-portrait.png), [마지막 문구](screenshots/v1.5/farewell-live-final.png)
- [실제로 설치한 Android APK 화면](screenshots/v1.5/apk-game.png), [저장 복원 후](screenshots/v1.5/apk-restored.png)
- [좌·중·우/모바일/컷신의 개별 스크린샷](screenshots/v1.5/)

초기 SDK 설치의 폐지된 `tools` 패키지 오류는 `platform-tools`만 설치하도록 고쳤습니다. 최초 Android 자동 검사의 WebView 디버그 연결 실패는 실제 UIAutomator/기기 입력과 Preferences 검사로 대체했습니다. Android 첫 전체 화면 안내가 검사 버튼을 가리던 문제도 안내를 닫도록 수정한 뒤 통과했습니다. 이 실패들을 성공한 검사로 집계하지 않았습니다.

## 남는 한계

실제 Galaxy S24 Ultra/삼성 인터넷/iOS 기기 실측은 수행하지 않습니다. 합성 효과음은 실제 녹음 음원 또는 성우 연기가 아니며, TV는 알아들을 수 있는 한국어 방송 대신 낮은 합성 방송 질감입니다. 오디오의 사실성과 스피커별 음량은 실기기 청감 평가가 필요합니다. 기본 음소거는 유지합니다. Android에서 첫 장 전체 경로를 플레이한 것은 아니며, 전체 경로는 웹의 공통 게임 코드에서 검사했습니다. 네이티브 공유 대상 선택과 파일 선택기의 실기기 복원 동작, 실기기 FPS·전력 사용량은 추가 확인이 필요합니다. 웹과 Android 저장은 자동 동기화되지 않으며 JSON으로 옮깁니다. APK는 데모용 고정 개발 서명이고 스토어 릴리스가 아닙니다.
