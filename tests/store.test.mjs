// jasolab store.js tests — node tests/store.test.mjs
import assert from 'node:assert/strict';
import { createStore, STORAGE_KEY, BACKUP_KEY } from '../js/store.js';

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

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

function seqIdFn() {
  let n = 0;
  return () => {
    n += 1;
    return `id-${n}`;
  };
}

function seqNowFn(start = 1000) {
  let t = start;
  return () => {
    t += 1;
    return t;
  };
}

function newStore() {
  const storage = createMemoryStorage();
  const store = createStore(storage, { idFn: seqIdFn(), now: seqNowFn() });
  return { storage, store };
}

// ---------- 회사 CRUD ----------

test('addCompany: 회사 추가 + 저장소 왕복', () => {
  const { storage, store } = newStore();
  const company = store.addCompany('네이버', '2026-08-01');
  assert.equal(company.name, '네이버');
  assert.equal(company.deadline, '2026-08-01');
  assert.ok(company.id);
  assert.deepEqual(company.questions, []);

  // 같은 storage로 새 store를 만들면 데이터가 살아있어야 함
  const store2 = createStore(storage);
  assert.equal(store2.load().companies.length, 1);
  assert.equal(store2.load().companies[0].name, '네이버');
});

test('addCompany: deadline 생략 시 null', () => {
  const { store } = newStore();
  const company = store.addCompany('카카오');
  assert.equal(company.deadline, null);
});

test('renameCompany / setDeadline', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  store.renameCompany(c.id, '네이버클라우드');
  store.setDeadline(c.id, '2026-09-01');
  const state = store.load();
  assert.equal(state.companies[0].name, '네이버클라우드');
  assert.equal(state.companies[0].deadline, '2026-09-01');
});

test('removeCompany: 삭제 후 목록에서 사라짐', () => {
  const { store } = newStore();
  const a = store.addCompany('A사');
  store.addCompany('B사');
  store.removeCompany(a.id);
  const state = store.load();
  assert.equal(state.companies.length, 1);
  assert.equal(state.companies[0].name, 'B사');
});

test('없는 회사 id 조작은 에러', () => {
  const { store } = newStore();
  assert.throws(() => store.renameCompany('nope', 'X'));
  assert.throws(() => store.addQuestion('nope', '문항'));
});

// ---------- 문항 CRUD ----------

test('addQuestion: 기본값 (limit null, unit chars_with_space, content 빈문자열)', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  assert.equal(q.title, '지원동기');
  assert.equal(q.limit, null);
  assert.equal(q.unit, 'chars_with_space');
  assert.equal(q.content, '');
  assert.deepEqual(q.snapshots, []);
  assert.ok(q.updatedAt);
});

test('updateQuestion: patch 병합 + updatedAt 갱신', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  const before = q.updatedAt;
  const updated = store.updateQuestion(c.id, q.id, {
    content: '저는...',
    limit: 500,
    unit: 'chars_no_space',
  });
  assert.equal(updated.content, '저는...');
  assert.equal(updated.limit, 500);
  assert.equal(updated.unit, 'chars_no_space');
  assert.equal(updated.title, '지원동기'); // 미지정 필드 보존
  assert.ok(updated.updatedAt > before);
});

test('removeQuestion', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  store.addQuestion(c.id, '입사 후 포부');
  store.removeQuestion(c.id, q.id);
  const company = store.load().companies[0];
  assert.equal(company.questions.length, 1);
  assert.equal(company.questions[0].title, '입사 후 포부');
});

// ---------- 스냅샷 ----------

test('snapshot: 최신이 맨 앞(unshift)', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  store.updateQuestion(c.id, q.id, { content: 'v1' });
  store.snapshot(c.id, q.id);
  store.updateQuestion(c.id, q.id, { content: 'v2' });
  store.snapshot(c.id, q.id);
  const snaps = store.load().companies[0].questions[0].snapshots;
  assert.equal(snaps.length, 2);
  assert.equal(snaps[0].content, 'v2');
  assert.equal(snaps[1].content, 'v1');
});

test('snapshot: 직전 스냅샷과 동일 내용이면 스킵', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  store.updateQuestion(c.id, q.id, { content: 'same' });
  const first = store.snapshot(c.id, q.id);
  const second = store.snapshot(c.id, q.id);
  assert.notEqual(first, null);
  assert.equal(second, null); // 스킵 표시
  assert.equal(store.load().companies[0].questions[0].snapshots.length, 1);
});

test('snapshot: 최대 20개 유지 (오래된 것부터 버림)', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  for (let i = 1; i <= 25; i += 1) {
    store.updateQuestion(c.id, q.id, { content: `v${i}` });
    store.snapshot(c.id, q.id);
  }
  const snaps = store.load().companies[0].questions[0].snapshots;
  assert.equal(snaps.length, 20);
  assert.equal(snaps[0].content, 'v25'); // 최신
  assert.equal(snaps[19].content, 'v6'); // v1~v5 는 밀려남
});

// ---------- restore ----------

test('restore: 복원 + 복원 전 현재 content 자동 스냅샷', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  store.updateQuestion(c.id, q.id, { content: '옛날 버전' });
  const snap = store.snapshot(c.id, q.id);
  store.updateQuestion(c.id, q.id, { content: '현재 버전' });

  store.restore(c.id, q.id, snap.ts);

  const question = store.load().companies[0].questions[0];
  assert.equal(question.content, '옛날 버전');
  // 자동 백업: 복원 직전의 '현재 버전'이 스냅샷 맨 앞에 있어야 함
  assert.equal(question.snapshots[0].content, '현재 버전');
});

test('restore: 없는 ts 는 에러 (데이터 불변)', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  store.updateQuestion(c.id, q.id, { content: 'x' });
  assert.throws(() => store.restore(c.id, q.id, 999999));
  const question = store.load().companies[0].questions[0];
  assert.equal(question.content, 'x');
  assert.equal(question.snapshots.length, 0);
});

// ---------- export / import ----------

test('exportJSON → importJSON 무손실 왕복', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버', '2026-08-01');
  const q = store.addQuestion(c.id, '지원동기');
  store.updateQuestion(c.id, q.id, { content: '본문', limit: 700 });
  store.snapshot(c.id, q.id);
  const exported = store.exportJSON();

  const { store: store2 } = newStore();
  const result = store2.importJSON(exported);
  assert.equal(result.ok, true);
  assert.deepEqual(store2.load(), store.load());
});

test('importJSON: 버전 불일치 거부', () => {
  const { store } = newStore();
  const bad = JSON.stringify({ version: 2, companies: [] });
  const result = store.importJSON(bad);
  assert.equal(result.ok, false);
  assert.ok(result.error);
});

test('importJSON: 필수 필드 누락 거부 (companies 없음)', () => {
  const { store } = newStore();
  const result = store.importJSON(JSON.stringify({ version: 1 }));
  assert.equal(result.ok, false);
});

test('importJSON: 잘못된 타입 거부 (questions 가 배열 아님)', () => {
  const { store } = newStore();
  const bad = JSON.stringify({
    version: 1,
    companies: [
      { id: 'c1', name: 'X', deadline: null, createdAt: 1, questions: 'nope' },
    ],
  });
  const result = store.importJSON(bad);
  assert.equal(result.ok, false);
});

test('importJSON: JSON 파싱 불가 문자열 거부', () => {
  const { store } = newStore();
  const result = store.importJSON('{broken');
  assert.equal(result.ok, false);
});

test('importJSON: 실패 시 기존 데이터 불변', () => {
  const { store } = newStore();
  store.addCompany('보존되어야 함');
  store.importJSON('{broken');
  store.importJSON(JSON.stringify({ version: 99, companies: [] }));
  assert.equal(store.load().companies.length, 1);
  assert.equal(store.load().companies[0].name, '보존되어야 함');
});

// ---------- 손상 데이터 복구 ----------

test('손상 JSON: 빈 스키마로 초기화 + 원본을 백업 키에 보존', () => {
  const storage = createMemoryStorage();
  storage.setItem(STORAGE_KEY, '{corrupted!!!');
  const store = createStore(storage);
  const state = store.load();
  assert.equal(state.version, 1);
  assert.deepEqual(state.companies, []);
  assert.equal(storage.getItem(BACKUP_KEY), '{corrupted!!!');
});

test('스키마 위반 데이터도 손상으로 취급', () => {
  const storage = createMemoryStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ hello: 'world' }));
  const store = createStore(storage);
  assert.deepEqual(store.load().companies, []);
  assert.ok(storage.getItem(BACKUP_KEY));
});

// ---------- search ----------

test('search: 본문 대소문자 무시 매칭 + excerpt 40자', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  const q = store.addQuestion(c.id, '지원동기');
  const long = 'a'.repeat(50) + 'KEYWORD' + 'b'.repeat(50);
  store.updateQuestion(c.id, q.id, { content: long });

  const results = store.search('keyword');
  assert.equal(results.length, 1);
  assert.equal(results[0].companyId, c.id);
  assert.equal(results[0].companyName, '네이버');
  assert.equal(results[0].qId, q.id);
  assert.equal(results[0].title, '지원동기');
  assert.ok(results[0].excerpt.includes('KEYWORD'));
  assert.ok(results[0].excerpt.length <= 40);
});

test('search: 제목 매칭 (본문에 없어도)', () => {
  const { store } = newStore();
  const c = store.addCompany('카카오');
  store.addQuestion(c.id, '성장과정과 가치관');
  const results = store.search('성장과정');
  assert.equal(results.length, 1);
  assert.equal(results[0].title, '성장과정과 가치관');
});

test('search: 매칭 없으면 빈 배열, 빈 키워드도 빈 배열', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  store.addQuestion(c.id, '지원동기');
  assert.deepEqual(store.search('없는말'), []);
  assert.deepEqual(store.search(''), []);
  assert.deepEqual(store.search('   '), []);
});

// ---------- id 주입 ----------

test('idFn 주입: 결정적 id 생성', () => {
  const { store } = newStore();
  const c = store.addCompany('네이버');
  assert.equal(c.id, 'id-1');
  const q = store.addQuestion(c.id, '지원동기');
  assert.equal(q.id, 'id-2');
});

// ---------- 결과 ----------

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
