# 자소서랩 (JasoLab) — 자소서 문항 관리 작업대

회사별 자소서 문항을 한 곳에서: 글자수 3종(공백/바이트/원고지) 실시간, 기업 프리셋, 버전 스냅샷, 마감 D-day. 순수 정적, 서버 전송 0.

**운영 URL**: https://maestro24.github.io/jasolab/

## 구조

```
index.html               워크스페이스 (앱 본체 — 광고 없음)
count.html               글자수 세기 단독 (SEO 유입)
guide.html               글자수 규칙 해설
presets/                 기업별 랜딩 (generate_presets.py 산출물)
js/counter.js            카운터 순수 로직 (코드포인트·2byte·원고지·문장)
js/store.js              localStorage 스토어 (스냅샷·검색·백업, 손상 복구)
js/workspace.js          워크스페이스 UI
data/presets.json        기업 27사 83문항 프리셋 (출처: data/PRESETS_SOURCES.md)
scripts/generate_presets.py  presets.json → 기업 페이지 + sitemap
```

## 명령

```bash
node tests/counter.test.mjs && node tests/store.test.mjs   # 코어 46 테스트
python scripts/generate_presets.py                          # 프리셋 페이지 재생성
python -m http.server 8000
```

## 원칙

1. 자소서 본문은 브라우저(localStorage)에만 — GA 이벤트에도 본문 금지
2. 유실 방어: JSON 백업/복원, 스냅샷 최대 20, 복원 전 자동 백업, 손상 데이터는 백업 키 보존
3. 에디터 화면 광고 금지 — count/presets/guide만
4. 프리셋은 참고 정보: 연도·출처 명시, "실제 공고 확인" 고지 상시

## 연간 유지

- 공채 시즌 전(2월·8월) presets.json 기업 제한 확인·갱신 → generate_presets.py 재실행
