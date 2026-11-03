/** 후속 챕터 제작용 원자료. 모두 사용자가 제공한 기록이며 외부 검증을 뜻하지 않습니다.
 * 이 파일은 현재 플레이 가능한 챕터를 추가하지 않습니다.
 * 확인되지 않은 날짜·장소·대화·갈등의 세부 내용은 null로 유지합니다.
 */
export const LIFE_RECORD={
  source:'user-provided',
  protagonist:{name:'안재원',gender:'남성',birth:'1997-01-26',birthplace:'부산광역시',adultHeightCm:174,
    personality:['내향적','감수성이 풍부함','관계와 추억을 중요하게 여김'],
    appearanceReference:null},
  childhood:{
    place:'부산 학장동',district:null,districtNote:'사용자 기록의 사하구·학장동 조합은 행정구 확인이 필요해 게임에서는 구를 생략함.',
    family:['어린 시절 부모님의 이혼을 경험함','조부모님의 보살핌 속에서 성장함'],
    specificYears:null,realDialogue:null
  },
  education:[
    {period:'중학교 시절',event:'국제신문 명예학생기자단 활동',exactDates:null},
    {date:'2020-06-16',event:'고등학교 졸업학력 검정고시 합격'},
    {year:2021,event:'한양사이버대학교 해킹보안학과 입학'},
    {year:2025,event:'한양사이버대학교 졸업'}
  ],
  relationship:{partner:{name:'김서린',birth:'1998-09-29',likes:['초콜릿'],doesNotPrefer:['아메리카노']},
    started:'2019-08-25',continuesThrough:2026,firstMeetingPlace:null,firstConversation:null,
    anniversaries:[{date:'2025-08-25',years:6}],privateConflicts:null},
  employment:[
    {field:'휴대전화 대리점',exactDates:null},
    {field:'전자제품 관련 전산 업무',exactDates:null},
    {company:'번개장터',field:'고객지원·모니터링·거래 관련 업무',approximateMonths:20,exactDates:null},
    {company:'쿠팡',field:'전산·운영 업무',exactDates:null},
    {company:null,field:'온라인 커머스 부정거래 모니터링',start:'2026-03-03',end:'2026-08-24',
      tasks:['결제도용 의심 거래 확인','데이터 검수','모니터링','고객 문의 처리'],
      narrativePerspective:'주인공이 경험하고 느낀 내용',
      userReportedExperiences:['업무 목표와 실적 압박','직장 내 인간관계의 어려움'],
      coworkerIdentities:null,legalFindings:null,internalMaterials:null},
    {year:2026,event:'새로운 직장생활 시작',company:null,exactDate:null}
  ],
  travel:[{year:2025,place:'오사카'},{year:2025,place:'마쓰야마'},{year:2026,place:'후쿠오카'},{year:2026,place:'기타큐슈'}],
  hobbies:['일본 여행','게임','노래방','콘솔게임'],
  finalChapterQuote:'나의 이야기는 아직 끝나지 않았다.'
};
