# 챕터를 확장하는 방법

현재 플레이 가능한 장은 1뿐입니다. `src/data/chapter-plans.js`는 2–8의 설계와 확인된 기록을 담고 있습니다. 준비 상태를 바꾸는 것만으로 플레이가 만들어지지 않습니다.

1. 확인된 기록을 검토하고 새로운 `src/data/chapter-N.js`에 scenes/stages/npcs/objects/memories를 작성합니다. 미확인 정보는 null로 남깁니다. 일상 대사는 `say`, 묘사는 `narrate`, 선택은 `choice`를 사용하고 출처 메타데이터를 붙입니다.
2. `src/systems/catalog.js`의 등록 정의에 데이터를 연결합니다. 플레이 가능한 정의에는 `entry: {scene,stage}`, `scenes`, `stages`, NPC 대사 함수, 사물, 기억이 필요합니다. 다음 장면·장소·포털·NPC·사물 참조를 검사합니다. 장면 ID는 장 내부에서 고유하게, 장소/기억 ID는 전체 게임에서 충돌하지 않게 만드세요.
3. 장소는 기존 `kind`(interior/shop/town/park/school), `variant`, `music`, `player`, width/spawn/entities를 사용합니다. 새 고유 배경은 `src/art.js`에 추가합니다. 캐릭터는 32×40, 13프레임이며 기존 0–8 프레임을 유지하고 9–10 독서, 11–12 자세를 추가했습니다.
4. NPC는 `{type:'npc',id,x,label,character,dialogue}`로 등록하고 사물은 object 키를 연결합니다. `interaction`에 television/toy/photo/read/drawer/rest를 지정하면 현재 공통 조사 동작을 재사용할 수 있습니다.
5. 미니게임의 규칙은 `src/data/minigames.js`, 입력·상태 전이는 `src/systems/minigames.js`, 장면 동작은 `LifeScene`에 구현합니다. 새 놀이 ID를 추가하면 저장 정규화의 허용 목록도 확장하고, sourceType과 실제 기록의 경계를 문서화해야 합니다.
6. `catalog.complete(state,action)`은 챕터별 읽은 장면과 완료 상태를 기록합니다. 기존 `choices`, `events`, `memories`, `chapterProgress`, `memoryTraces`는 같은 세이브의 공통 필드입니다. 새 장의 메인 이벤트·전환·앨범은 `main.js`에 연결해야 합니다. 현재 챕터 1 전용 조건/대본을 새 장에 그대로 적용하지 마세요.
7. 등록·저장 구조는 갖췄으나 **모든 후속 장면이 코드 수정 없이 자동 실행되는 편집기는 아닙니다.** 새 챕터의 이벤트 라우팅, 기억 허용 목록, 전용 배경/연출, 선택 메뉴의 실행 경로를 실제로 연결한 뒤에만 playable로 변경하세요. 원본 세이브를 백업하고 스키마 변경 시 이전 버전 이관 검사를 추가합니다.
8. 전체 경로와 선택 분기·가져오기·중단/복원·오프라인을 검사합니다. 민감한 사건은 당사자의 시점과 확인된 범위를 유지합니다. 날짜가 겹치는 장을 임의의 연대기 사실로 재배열하지 마세요.

`MINI_DEFINITIONS`, `ChapterCatalog`, `recordChoice`, `recordMini`, `TextPlayer`, `FrameMetrics`는 Phaser 화면과 분리되어 단위 검사할 수 있습니다. 새 콘텐츠를 위해 엔진이나 프레임워크를 교체할 필요가 없습니다.
