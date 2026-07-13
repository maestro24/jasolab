// jasolab 데이터 스토어 — localStorage 래퍼, DOM 없는 순수 ES module
//
// 스키마 (키 "jasolab_v1"):
// { version: 1, companies: [ { id, name, deadline|null, createdAt,
//     questions: [ { id, title, limit|null, unit, content, updatedAt,
//       snapshots: [ { ts, content } ] } ] } ] }
//
// 설계 노트:
// - storage / idFn / now 를 주입 가능하게 해서 node 환경에서 DOM 없이 테스트.
// - 모든 변경 메서드는 새 상태 객체를 만들어 교체(불변 패턴) 후 즉시 save().
// - 손상 데이터는 빈 스키마로 초기화하되 원본을 백업 키에 보존.

export const STORAGE_KEY = 'jasolab_v1';
export const BACKUP_KEY = 'jasolab_v1_corrupt_backup';

const SCHEMA_VERSION = 1;
const MAX_SNAPSHOTS = 20;
const DEFAULT_UNIT = 'chars_with_space';
const EXCERPT_LENGTH = 40;

function defaultIdFn() {
  const rand = Math.random().toString(36).slice(2, 6).padEnd(4, '0');
  return Date.now().toString(36) + rand;
}

function emptyState() {
  return { version: SCHEMA_VERSION, companies: [] };
}

function isQuestionValid(q) {
  return (
    q !== null &&
    typeof q === 'object' &&
    typeof q.id === 'string' &&
    typeof q.title === 'string' &&
    (q.limit === null || typeof q.limit === 'number') &&
    typeof q.unit === 'string' &&
    typeof q.content === 'string' &&
    typeof q.updatedAt === 'number' &&
    Array.isArray(q.snapshots) &&
    q.snapshots.every(
      (s) =>
        s !== null &&
        typeof s === 'object' &&
        typeof s.ts === 'number' &&
        typeof s.content === 'string',
    )
  );
}

function isCompanyValid(c) {
  return (
    c !== null &&
    typeof c === 'object' &&
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    (c.deadline === null || typeof c.deadline === 'string') &&
    typeof c.createdAt === 'number' &&
    Array.isArray(c.questions) &&
    c.questions.every(isQuestionValid)
  );
}

function validateState(data) {
  if (data === null || typeof data !== 'object') {
    return 'root must be an object';
  }
  if (data.version !== SCHEMA_VERSION) {
    return `version must be ${SCHEMA_VERSION}, got ${data.version}`;
  }
  if (!Array.isArray(data.companies)) {
    return 'companies must be an array';
  }
  const badIndex = data.companies.findIndex((c) => !isCompanyValid(c));
  if (badIndex !== -1) {
    return `invalid company at index ${badIndex}`;
  }
  return null; // valid
}

/**
 * jasolab 스토어를 생성한다.
 * @param {Storage} storage - localStorage 호환 객체 (getItem/setItem/removeItem)
 * @param {{idFn?: () => string, now?: () => number}} [options]
 */
export function createStore(
  storage = globalThis.localStorage,
  { idFn = defaultIdFn, now = Date.now } = {},
) {
  if (!storage || typeof storage.getItem !== 'function') {
    throw new TypeError('createStore: storage must implement getItem/setItem');
  }

  let state = readFromStorage();

  function readFromStorage() {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) {
      return emptyState();
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return recoverCorrupt(raw);
    }
    if (validateState(parsed) !== null) {
      return recoverCorrupt(raw);
    }
    return parsed;
  }

  function recoverCorrupt(raw) {
    storage.setItem(BACKUP_KEY, raw); // 원본 보존
    const fresh = emptyState();
    storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function save() {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function load() {
    state = readFromStorage();
    return state;
  }

  // ---------- 내부 헬퍼 (불변 갱신) ----------

  function findCompany(companyId) {
    const company = state.companies.find((c) => c.id === companyId);
    if (!company) {
      throw new Error(`store: company not found (id=${companyId})`);
    }
    return company;
  }

  function findQuestion(companyId, qId) {
    const question = findCompany(companyId).questions.find((q) => q.id === qId);
    if (!question) {
      throw new Error(`store: question not found (id=${qId})`);
    }
    return question;
  }

  function replaceCompany(companyId, updater) {
    findCompany(companyId); // 존재 검증
    state = {
      ...state,
      companies: state.companies.map((c) =>
        c.id === companyId ? updater(c) : c,
      ),
    };
    save();
  }

  function replaceQuestion(companyId, qId, updater) {
    findQuestion(companyId, qId); // 존재 검증
    replaceCompany(companyId, (company) => ({
      ...company,
      questions: company.questions.map((q) => (q.id === qId ? updater(q) : q)),
    }));
  }

  function pushSnapshot(question) {
    const latest = question.snapshots[0];
    if (latest && latest.content === question.content) {
      return question; // 직전 스냅샷과 동일 → 스킵
    }
    const snapshots = [
      { ts: now(), content: question.content },
      ...question.snapshots,
    ].slice(0, MAX_SNAPSHOTS);
    return { ...question, snapshots };
  }

  // ---------- 회사 ----------

  function addCompany(name, deadline = null) {
    const company = {
      id: idFn(),
      name,
      deadline,
      createdAt: now(),
      questions: [],
    };
    state = { ...state, companies: [...state.companies, company] };
    save();
    return company;
  }

  function renameCompany(companyId, name) {
    replaceCompany(companyId, (c) => ({ ...c, name }));
    return findCompany(companyId);
  }

  function setDeadline(companyId, deadline) {
    replaceCompany(companyId, (c) => ({ ...c, deadline }));
    return findCompany(companyId);
  }

  function removeCompany(companyId) {
    findCompany(companyId); // 존재 검증
    state = {
      ...state,
      companies: state.companies.filter((c) => c.id !== companyId),
    };
    save();
  }

  // ---------- 문항 ----------

  function addQuestion(companyId, title) {
    const question = {
      id: idFn(),
      title,
      limit: null,
      unit: DEFAULT_UNIT,
      content: '',
      updatedAt: now(),
      snapshots: [],
    };
    replaceCompany(companyId, (c) => ({
      ...c,
      questions: [...c.questions, question],
    }));
    return question;
  }

  const PATCHABLE_FIELDS = ['title', 'limit', 'unit', 'content'];

  function updateQuestion(companyId, qId, patch) {
    if (patch === null || typeof patch !== 'object') {
      throw new TypeError('updateQuestion: patch must be an object');
    }
    replaceQuestion(companyId, qId, (q) => {
      const next = { ...q, updatedAt: now() };
      for (const field of PATCHABLE_FIELDS) {
        if (field in patch) next[field] = patch[field];
      }
      return next;
    });
    return findQuestion(companyId, qId);
  }

  function removeQuestion(companyId, qId) {
    findQuestion(companyId, qId); // 존재 검증
    replaceCompany(companyId, (c) => ({
      ...c,
      questions: c.questions.filter((q) => q.id !== qId),
    }));
  }

  // ---------- 스냅샷 ----------

  function snapshot(companyId, qId) {
    const before = findQuestion(companyId, qId);
    const latest = before.snapshots[0];
    if (latest && latest.content === before.content) {
      return null; // 중복 → 스킵
    }
    replaceQuestion(companyId, qId, pushSnapshot);
    return findQuestion(companyId, qId).snapshots[0];
  }

  function restore(companyId, qId, ts) {
    const question = findQuestion(companyId, qId);
    const target = question.snapshots.find((s) => s.ts === ts);
    if (!target) {
      throw new Error(`store: snapshot not found (ts=${ts})`);
    }
    const restoredContent = target.content; // 자동 스냅샷이 밀어내도 안전하도록 먼저 확보
    replaceQuestion(companyId, qId, (q) => ({
      ...pushSnapshot(q), // 복원 전 현재 content 자동 백업
      content: restoredContent,
      updatedAt: now(),
    }));
    return findQuestion(companyId, qId);
  }

  // ---------- 검색 ----------

  function excerptAround(content, index, keywordLength) {
    const half = Math.floor((EXCERPT_LENGTH - keywordLength) / 2);
    const start = Math.max(0, index - Math.max(half, 0));
    return content.slice(start, start + EXCERPT_LENGTH);
  }

  function search(keyword) {
    if (typeof keyword !== 'string' || keyword.trim() === '') {
      return [];
    }
    const needle = keyword.toLowerCase();
    const results = [];
    for (const company of state.companies) {
      for (const question of company.questions) {
        const contentIdx = question.content.toLowerCase().indexOf(needle);
        const titleMatch = question.title.toLowerCase().includes(needle);
        if (contentIdx === -1 && !titleMatch) continue;
        const excerpt =
          contentIdx !== -1
            ? excerptAround(question.content, contentIdx, needle.length)
            : question.content.slice(0, EXCERPT_LENGTH);
        results.push({
          companyId: company.id,
          companyName: company.name,
          qId: question.id,
          title: question.title,
          excerpt,
        });
      }
    }
    return results;
  }

  // ---------- export / import ----------

  function exportJSON() {
    return JSON.stringify(state, null, 2);
  }

  function importJSON(str) {
    let parsed;
    try {
      parsed = JSON.parse(str);
    } catch (err) {
      return { ok: false, error: `invalid JSON: ${err.message}` };
    }
    const problem = validateState(parsed);
    if (problem !== null) {
      return { ok: false, error: `schema validation failed: ${problem}` };
    }
    state = parsed;
    save();
    return { ok: true };
  }

  return {
    load,
    save,
    addCompany,
    renameCompany,
    setDeadline,
    removeCompany,
    addQuestion,
    updateQuestion,
    removeQuestion,
    snapshot,
    restore,
    search,
    exportJSON,
    importJSON,
  };
}
