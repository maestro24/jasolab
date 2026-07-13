# 자소서랩 프리셋 데이터 출처 (PRESETS_SOURCES)

- 조사일: 2026-07-13 (WebSearch/WebFetch 기반 실조사)
- 신뢰도 등급
  - **A**: 공식 채용 사이트/공고 원문
  - **B**: 취업 정보 플랫폼의 공고 전재(하이잡·자소설닷컴·잡코리아·캐치 등 — 공고 문항을 그대로 옮긴 것)
  - **C**: 커뮤니티/블로그/합격 자소서 후기 (원문과 다를 수 있음)
- 공통 한계: 대부분 출처가 "공백 포함 여부"를 명시하지 않음 → presets.json 에서는 `chars_with_space` 기본값 + notes에 "공백 기준 미확인" 표기. 바이트 기준(KB국민·IBK·코레일 일부)만 명시적으로 `bytes` 사용.

## 대기업

| 기업 | 확인 연도 | 출처 | 신뢰도 |
|---|---|---|---|
| 삼성전자 | 2025 | [링커리어 커뮤니티 - 삼성 자소서 문항 총정리](https://community.linkareer.com/employment_data/4605711), [HAIJOB 2025 삼성그룹 계열사 자소서](https://www.haijob.co.kr/blog/2025-samsung-recruit-secondhalf-jaseo-guide/) | B (공고 전재, 복수 출처 일치: 700/1500/1000/1000) |
| SK하이닉스 | 2025 | [HAIJOB 2025 하반기 SK하이닉스 자소서](https://www.haijob.co.kr/blog/2025-sk-hynix-recruit-secondhalf-cover-letter-guide/), [careermizing](https://www.careermizing.com/article/hynix) | B (1000/600/600 + 선택 600) |
| LG전자 | 2025 | [HAIJOB 2025 하반기 LG전자 자소서](https://www.haijob.co.kr/blog/2025-lg-electronics-recruit-secondhalf-cover-letter-guide/) | B — 주의: [ontojob(잡프랩)](https://ontojob.co.kr/article/2025-%ED%95%98%EB%B0%98%EA%B8%B0-LG%EC%A0%84%EC%9E%90-%EC%9E%90%EC%86%8C%EC%84%9C-%EB%AC%B8%ED%95%AD-%EB%B6%84%EC%84%9D-%EC%99%84%EB%B2%BD-%EA%B0%80%EC%9D%B4%EB%93%9C)는 800자/600자 "내외"로 안내(권장 분량으로 판단). 제한값은 HAIJOB의 1000자 채택 |
| 현대자동차 | 2025 | [HAIJOB 2025.10 현대차 자소서](https://www.haijob.co.kr/blog/2025-hyundai-motor-recruit-october-cover-letter-guide/), [careermizing](https://www.careermizing.com/article/hyundai) | B (2문항 각 800자, 수시채용이라 공고별 변동 큼) |
| 기아 | 2025 | [HAIJOB 2025 하반기 기아 자소서](https://www.haijob.co.kr/blog/2025-kia-recruit-secondhalf-cover-letter-guide/) | B (600/750) |
| 포스코 | 2025 | [HAIJOB 2025 하반기 포스코 자소서](https://www.haijob.co.kr/blog/2025-posco-recruit-secondhalf-cover-letter-guide/) — WebFetch로 원문 확인(2문항 각 600자) | B |
| 한화(한화시스템 ICT) | 2025 | [HAIJOB 2025 하반기 한화시스템 ICT](https://www.haijob.co.kr/blog/2025-hanwha-systems-ict-recruit-secondhalf-cover-letter-guide/) | B (1000/700/700) — 그룹 대표값 아님, 계열사별 상이 |
| CJ제일제당 | 2025 | [HAIJOB 2025 하반기 CJ제일제당](https://www.haijob.co.kr/blog/2025-cj-cheiljedang-recruit-secondhalf-cover-letter-guide/), [자소설닷컴 공고](https://jasoseol.com/recruit/100002) | B (2문항 각 1000자) |
| 롯데(롯데케미칼) | 2025 | [잡코리아 롯데케미칼 자소서 항목](https://www.jobkorea.co.kr/company/1749358/keyword), [자소설닷컴 2025.9 공고](https://jasoseol.com/recruit/99777) | B (500/800/800/800, 16줄 제한 병행) — 그룹 대표값 아님 |
| GS칼텍스 | 2025 | [HAIJOB 2025 하반기 GS칼텍스](https://www.haijob.co.kr/blog/2025-gs-caltex-recruit-secondhalf-cover-letter-guide/) — WebFetch로 원문 확인(500/500/1500) | B |
| 두산(두산건설) | 2025 | [HAIJOB 2025 하반기 두산건설](https://www.haijob.co.kr/blog/2025-doosan-construction-recruit-secondhalf-cover-letter-guide/) | B (800/800) — 그룹 대표값 아님 |
| LS(LS ELECTRIC) | 2025 | [pagk.kr LS ELECTRIC 2025 AX 직무 자소서 자료](https://www.pagk.kr/%EC%9E%90%EC%86%8C%EC%84%9C-ls-electric-202/) | **C (신뢰도 낮음)** — 합격자료 판매 페이지 기반, 4문항 각 1000자. 교차검증 못 함 |
| HD현대 | 2025 | [체인지업 HD현대 자소서 가이드](https://alivechangeup.com/jobreport/?bmode=view&idx=18525631), [자소설닷컴 Junior Talent 공고](https://jasoseol.com/recruit/96902) | B (일반 4문항 각 500자 / 연구직 600·1000·600·600) |
| 대한항공 | 2025 | [탑티어 2025 하반기 대한항공 통합 자소서 가이드](https://www.top-tier.co.kr/notice/getNoticeDetail.hs?noticeSeq=992&type=BT04), [HAIJOB 2026 대한항공](https://www.haijob.co.kr/blog/2026-korean-air-recruitment-cover-letter-guide/) | B (4문항 각 600자) |

## 금융

| 기업 | 확인 연도 | 출처 | 신뢰도 |
|---|---|---|---|
| KB국민은행 | 2025 | [jasoseohero KB국민은행 신입행원 자소서](https://jasoseohero.com/entry/KB%EA%B5%AD%EB%AF%BC%EC%9D%80%ED%96%89-%EC%8B%A0%EC%9E%85%ED%96%89%EC%9B%90-%EC%B1%84%EC%9A%A9-%EC%9E%90%EA%B8%B0%EC%86%8C%EA%B0%9C%EC%84%9C-%EC%9E%91%EC%84%B1-%ED%8C%81-%ED%95%A9%EA%B2%A9) — WebFetch 확인. 바이트 기준(2400/1600/1600/1600, 공백 포함 2byte)은 [자소설닷컴 공고](https://jasoseol.com/recruit/99760) 검색결과와 일치 | B |
| 신한은행 | 2025 | [HAIJOB 2025 하반기 신한은행](https://www.haijob.co.kr/blog/2025-shinhan-bank-recruit-secondhalf-cover-letter-guide/) — WebFetch 확인(800/800/1000/1000) | B |
| 하나은행 | 2025 | [HAIJOB 2025 하반기 하나은행](https://www.haijob.co.kr/blog/2025-hana-bank-recruit-secondhalf-cover-letter-guide/) — WebFetch 확인(1000/800/800/800). 상반기는 4문항 각 800자([jasoseohero](https://jasoseohero.com/entry/%ED%95%98%EB%82%98%EC%9D%80%ED%96%89-%EC%8B%A0%EC%9E%85%ED%96%89%EC%9B%90-%EC%9E%90%EA%B8%B0%EC%86%8C%EA%B0%9C%EC%84%9C-2025%EB%85%84-%EC%83%81%EB%B0%98%EA%B8%B0-%EC%B1%84%EC%9A%A9-%EC%99%84%EB%B2%BD-%EA%B0%80%EC%9D%B4%EB%93%9C)) | B |
| 우리은행 | 2025 | [링커리어 합격자소서(2025 상반기 IT/디지털)](https://linkareer.com/cover-letter/35610) — WebFetch 확인(800/600/800), [HAIJOB 2025 하반기](https://www.haijob.co.kr/blog/2025-woori-bank-recruit-jaseo-guide/)는 "항목별 600~800자"만 안내 | C (합격자 제출본 기반, 부문별 3번 문항 상이) |
| IBK기업은행 | 2025 | [HAIJOB 2025 IBK기업은행](https://www.haijob.co.kr/blog/2025-ibk-bank-recruit-cover-letter-guide/) | B (Q1 1500byte, Q2 세부 4항목 각 400byte) |
| NH농협은행 | 2025 | [HAIJOB 2025 하반기 NH농협은행](https://www.haijob.co.kr/blog/2025-nh-bank-recruit-secondhalf-cover-letter-guide/) — WebFetch 확인(5문항 각 700자). 단, [자소설닷컴 공고](https://jasoseol.com/recruit/100265) 검색결과에는 byte 기준(200~1000byte) 언급 존재 → 단위 충돌, 공고 확인 필요 | B- |
| 삼성생명 | 2025 | [HAIJOB 2025 삼성그룹 계열사 자소서](https://www.haijob.co.kr/blog/2025-samsung-recruit-secondhalf-jaseo-guide/) | B (삼성 공통 700/1500/1000/1000) |

## IT

| 기업 | 확인 연도 | 출처 | 신뢰도 |
|---|---|---|---|
| 네이버 | 2025 | [2025 팀네이버 신입 공채 공식 페이지](https://recruit.navercorp.com/micro/teamnaver/2025), [캐치 공고](https://www.catch.co.kr/NCS/RecruitInfoDetails/491985) | B — Q1 1000자만 글자수 확인. Q2(도전·변화 경험) 글자수는 공개 출처에서 확인 실패 → JSON에서 제외 |
| 카카오 | 2026 | [HAIJOB 2026 카카오그룹 자소서](https://www.haijob.co.kr/blog/2026-kakao-group-recruit-cover-letter-guide/) — WebFetch 확인(3문항 모두 1000자), [자소설닷컴 2026 신입크루 공채](https://jasoseol.com/recruit/99919) | B |
| 우아한형제들 | (과거 공채) | [잡코리아 우아한형제들 자소서 항목](https://www.jobkorea.co.kr/company/1450187/keyword) | **C (신뢰도 낮음)** — 3문항 각 1000자는 과거 공채/인턴 문항. 현재 수시채용은 공고별 상이·자유 양식 가능 |

## 공기업

| 기업 | 확인 연도 | 출처 | 신뢰도 |
|---|---|---|---|
| 한국전력공사 | 2025 | [자소설닷컴 2025 하반기 4(나)직급 공고](https://jasoseol.com/recruit/100049), [캐치 공고](https://www.catch.co.kr/NCS/RecruitInfoDetails/522249), [잡코리아 자소서 항목](https://www.jobkorea.co.kr/company/1415214/keyword) | B- — 인재상 700자·지원동기 700자 확인. 협업·갈등 문항 글자수 미확인 → JSON 제외. 자소서는 필기 합격 후 작성 |
| 인천국제공항공사 | 2025 | [자소설닷컴 2025 NCS 신입 공고](https://jasoseol.com/recruit/100214), [잡코리아 자소서 항목](https://www.jobkorea.co.kr/company/1600511/keyword) | B (4문항 각 600자) |
| 한국철도공사(코레일) | 2025 | [지음(zieumworks) 2025 하반기 토목·전기통신 자소서 가이드](http://zieumworks.com/2025/11/11/2025%EB%85%84-%ED%95%98%EB%B0%98%EA%B8%B0-%ED%95%9C%EA%B5%AD%EC%B2%A0%EB%8F%84%EA%B3%B5%EC%82%AC-%EC%8B%A0%EC%9E%85%EC%82%AC%EC%9B%90%ED%86%A0%EB%AA%A9%C2%B7%EC%A0%84%EA%B8%B0%ED%86%B5%EC%8B%A0/) | **C (신뢰도 낮음)** — 사이트 인증서 오류로 원문 직접 확인 실패, 검색 스니펫 기반. 문항별 자수·byte 단위 혼재(700~1000자 / 400자·800byte). 반드시 공고 원문 확인 |

## 조사했으나 제외한 기업

| 기업 | 제외 사유 |
|---|---|
| 쿠팡 | 수시채용, 이력서(국·영문) 중심. 고정 자소서 문항·글자수 제한을 공개 출처에서 확인 못 함(자유 양식 사례만 존재) |
| 토스(비바리퍼블리카) | 이력서·경력기술 중심 수시채용. 문항 글자수 제한 없음("문항 제한 없음" 후기 확인) — [자소설닷컴](https://jasoseol.com/companies/11256/careers) |
| 크래프톤 | 공식 FAQ 기준 "자기소개서 정해진 양식 없음"(자유 기술) — [KRAFTON Careers FAQ](https://www.krafton.com/careers/faq/) |

## 접근 실패 로그 (참고)

- jasoseol.com 문항 상세: 로그인 필요 (목록/검색 스니펫만 활용)
- catch.co.kr: WebFetch 403 (검색 스니펫만 활용)
- linkareer.com 커뮤니티 일부·keyzard.cc: 403
- zieumworks.com: TLS 인증서 불일치로 직접 fetch 실패
