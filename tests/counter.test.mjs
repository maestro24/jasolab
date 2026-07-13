// jasolab counter.js tests — node tests/counter.test.mjs
import assert from 'node:assert/strict';
import { countAll, checkLimit } from '../js/counter.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL - ${name}`);
    console.error(`  ${err.message}`);
  }
}

// ---------- countAll: 빈 문자열 ----------

test('countAll: 빈 문자열은 전부 0', () => {
  assert.deepEqual(countAll(''), {
    withSpace: 0,
    noSpace: 0,
    bytes: 0,
    manuscript: 0,
    sentences: 0,
    avgSentence: 0,
  });
});

// ---------- countAll: 한글 기본 ----------

test('countAll: 한글 5자 단문', () => {
  const r = countAll('안녕하세요');
  assert.equal(r.withSpace, 5);
  assert.equal(r.noSpace, 5);
  assert.equal(r.bytes, 10); // 한글 = 2바이트
  assert.equal(r.manuscript, 1);
  assert.equal(r.sentences, 1); // 구두점 없어도 잔여 텍스트는 1문장
  assert.equal(r.avgSentence, 5);
});

// ---------- countAll: 한/영/숫자 혼합 ----------

test('countAll: 한/영/숫자 혼합', () => {
  const r = countAll('Hello 세계 123');
  assert.equal(r.withSpace, 12); // 5 + 1 + 2 + 1 + 3
  assert.equal(r.noSpace, 10);
  assert.equal(r.bytes, 14); // ASCII 10(공백 2 포함) + 한글 2*2
});

// ---------- countAll: 이모지 ----------

test('countAll: 이모지 👍 는 글자 1, 바이트 2', () => {
  const r = countAll('\u{1F44D}');
  assert.equal(r.withSpace, 1);
  assert.equal(r.noSpace, 1);
  assert.equal(r.bytes, 2);
});

test('countAll: ZWJ 조합 이모지 👨‍👩‍👧 는 코드포인트 5개로 카운트', () => {
  const family = '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}';
  const r = countAll(family);
  assert.equal(r.withSpace, 5); // 채용시스템 관행: 코드포인트별
  assert.equal(r.noSpace, 5); // ZWJ는 공백이 아님
  assert.equal(r.bytes, 10); // 전부 > 0x7F
});

// ---------- countAll: 줄바꿈 / 공백류 ----------

test('countAll: \\r\\n 은 글자 1로 정규화, \\n 바이트 1', () => {
  const r = countAll('a\r\nb');
  assert.equal(r.withSpace, 3); // a, \n, b
  assert.equal(r.noSpace, 2);
  assert.equal(r.bytes, 3);
});

test('countAll: 전각공백 U+3000 은 공백 취급 (바이트는 2)', () => {
  const r = countAll('a　b');
  assert.equal(r.withSpace, 3);
  assert.equal(r.noSpace, 2);
  assert.equal(r.bytes, 4); // a(1) + U+3000(2) + b(1)
});

test('countAll: 탭·줄바꿈도 공백 제외 대상', () => {
  const r = countAll('a\tb\nc d');
  assert.equal(r.withSpace, 7);
  assert.equal(r.noSpace, 4);
});

// ---------- countAll: 바이트 경계 ----------

test('countAll: 바이트 경계 0x7F=1바이트, 0x80=2바이트', () => {
  assert.equal(countAll(String.fromCodePoint(0x7f)).bytes, 1);
  assert.equal(countAll(String.fromCodePoint(0x80)).bytes, 2);
});

// ---------- countAll: 원고지 ----------

test('countAll: 원고지 매수 200자=1매, 201자=2매', () => {
  assert.equal(countAll('가'.repeat(200)).manuscript, 1);
  assert.equal(countAll('가'.repeat(201)).manuscript, 2);
  assert.equal(countAll('가').manuscript, 1);
});

// ---------- countAll: 문장 ----------

test('countAll: 문장 수 . ! ? 。 기준', () => {
  const r = countAll('안녕. 반가워! 잘 지냈어? 그래。');
  assert.equal(r.sentences, 4);
});

test('countAll: 연속 구두점은 1개로 침', () => {
  assert.equal(countAll('정말?! 대박...').sentences, 2);
});

test('countAll: 구두점만 있으면 문장 0, avgSentence 0', () => {
  const r = countAll('...');
  assert.equal(r.sentences, 0);
  assert.equal(r.avgSentence, 0);
});

test('countAll: 구두점 뒤 공백뿐인 조각은 문장에서 제외', () => {
  assert.equal(countAll('끝. ').sentences, 1);
});

test('countAll: avgSentence 는 공백 제외 글자수 / 문장 수 반올림', () => {
  // "abc. de." → noSpace 7 (구두점 포함), 문장 2 → 3.5 → 4
  assert.equal(countAll('abc. de.').avgSentence, 4);
});

// ---------- checkLimit ----------

test('checkLimit: chars_with_space', () => {
  const r = checkLimit('가나다 라마', 10, 'chars_with_space');
  assert.deepEqual(r, { used: 6, limit: 10, remain: 4, over: false });
});

test('checkLimit: chars_no_space', () => {
  const r = checkLimit('가나다 라마', 10, 'chars_no_space');
  assert.deepEqual(r, { used: 5, limit: 10, remain: 5, over: false });
});

test('checkLimit: bytes', () => {
  const r = checkLimit('가나다 라마', 12, 'bytes');
  // 한글 5*2 + 공백 1 = 11
  assert.deepEqual(r, { used: 11, limit: 12, remain: 1, over: false });
});

test('checkLimit: 초과 시 over=true, remain 음수', () => {
  const r = checkLimit('가'.repeat(12), 10, 'chars_with_space');
  assert.deepEqual(r, { used: 12, limit: 10, remain: -2, over: true });
});

test('checkLimit: 정확히 limit 이면 over=false', () => {
  const r = checkLimit('가'.repeat(10), 10, 'chars_with_space');
  assert.equal(r.over, false);
  assert.equal(r.remain, 0);
});

test('checkLimit: 알 수 없는 unit 은 에러', () => {
  assert.throws(() => checkLimit('가', 10, 'words'));
});

// ---------- 결과 ----------

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
