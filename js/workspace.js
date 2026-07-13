// 자소서랩 워크스페이스 — 트리·에디터·카운터·스냅샷 UI
// 의존: js/store.js (createStore), js/counter.js (countAll, checkLimit), data/presets.json
import { createStore } from './store.js';
import { countAll, checkLimit } from './counter.js';

const $ = (id) => document.getElementById(id);
const store = createStore();
let state = store.load();
let cur = { companyId: null, qId: null };
let presets = { companies: [] };
let saveTimer = null;

// ── 토스트 ──
function toast(msg, duration = 1600) {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.prepend(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, duration);
}

// ── 유틸 ──
function findQ() {
  const c = state.companies.find((x) => x.id === cur.companyId);
  const q = c?.questions.find((x) => x.id === cur.qId);
  return { c, q };
}
function dday(deadline) {
  if (!deadline) return null;
  const diff = Math.ceil((Date.parse(deadline) - Date.now()) / 86400000);
  if (diff < 0) return { label: '마감', soon: false };
  return { label: diff === 0 ? 'D-Day' : `D-${diff}`, soon: diff <= 3 };
}
function fmtTs(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── 트리 렌더 ──
function renderTree() {
  const $tree = $('company-tree');
  $tree.innerHTML = '';
  if (state.companies.length === 0) {
    $tree.innerHTML = '<div class="empty">아직 회사가 없어요.<br/>아래에서 지원할 회사를 추가하세요.</div>';
    return;
  }
  for (const c of state.companies) {
    const box = document.createElement('div');
    box.className = 'company';
    const d = dday(c.deadline);
    const head = document.createElement('div');
    head.className = 'company-head';
    head.innerHTML = `<span class="name"></span>${d ? `<span class="dday${d.soon ? ' soon' : ''}">${d.label}</span>` : ''}<button class="btn btn-sm btn-ghost" data-act="add-q">+문항</button><button class="btn btn-sm btn-danger" data-act="del-c" aria-label="회사 삭제">✕</button>`;
    head.querySelector('.name').textContent = c.name;
    head.addEventListener('click', (e) => {
      const act = e.target.dataset?.act;
      if (act === 'add-q') {
        const q = store.addQuestion(c.id, `문항 ${c.questions.length + 1}`);
        state = store.load();
        selectQ(c.id, q.id);
      } else if (act === 'del-c') {
        if (confirm(`'${c.name}'와 문항 ${c.questions.length}개를 삭제할까요?`)) {
          store.removeCompany(c.id);
          state = store.load();
          if (cur.companyId === c.id) { cur = { companyId: null, qId: null }; renderEditor(); }
          renderTree();
        }
      } else {
        // 마감일 편집
        const v = prompt('마감일 (YYYY-MM-DD, 비우면 제거)', c.deadline || '');
        if (v !== null) {
          store.setDeadline(c.id, v.trim() || null);
          state = store.load();
          renderTree();
        }
      }
      e.stopPropagation();
    });
    box.appendChild(head);
    const list = document.createElement('div');
    list.className = 'q-list';
    for (const q of c.questions) {
      const item = document.createElement('div');
      item.className = 'q-item' + (cur.qId === q.id ? ' active' : '');
      const cnt = countAll(q.content || '');
      item.innerHTML = `<span class="t"></span><span class="n">${cnt.withSpace}자</span>`;
      item.querySelector('.t').textContent = q.title || '(제목 없음)';
      item.addEventListener('click', () => selectQ(c.id, q.id));
      list.appendChild(item);
    }
    box.appendChild(list);
    $tree.appendChild(box);
  }
}

// ── 에디터 ──
function selectQ(companyId, qId) {
  flushSave();
  cur = { companyId, qId };
  renderEditor();
  renderTree();
}

function renderEditor() {
  const { q } = findQ();
  $('editor-empty').hidden = !!q;
  $('editor').hidden = !q;
  if (!q) return;
  $('q-title').value = q.title || '';
  $('q-limit').value = q.limit ?? '';
  $('q-unit').value = q.unit || 'chars_with_space';
  $('q-content').value = q.content || '';
  $('snap-panel').hidden = true;
  renderCounter();
}

function renderCounter() {
  const { q } = findQ();
  if (!q) return;
  const text = $('q-content').value;
  const c = countAll(text);
  const limit = parseInt($('q-limit').value, 10) || null;
  const unit = $('q-unit').value;
  let limitHtml = '';
  let barHtml = '';
  if (limit) {
    const chk = checkLimit(text, limit, unit);
    const pct = Math.min(100, (chk.used / limit) * 100);
    const cls = chk.over ? 'over' : pct > 90 ? 'warn' : '';
    limitHtml = `<span class="${chk.over ? 'over' : ''}">제한 <b>${chk.used.toLocaleString()}/${limit.toLocaleString()}</b>${chk.over ? ` (${(chk.used - limit).toLocaleString()} 초과!)` : ` (${chk.remain.toLocaleString()} 남음)`}</span>`;
    barHtml = `<div class="progress"><span class="${cls}" style="width:${pct}%"></span></div>`;
  }
  $('counter-bar').innerHTML =
    `${limitHtml}<span>공백포함 <b>${c.withSpace.toLocaleString()}</b></span>` +
    `<span>공백제외 <b>${c.noSpace.toLocaleString()}</b></span>` +
    `<span>바이트 <b>${c.bytes.toLocaleString()}</b></span>` +
    `<span>원고지 <b>${c.manuscript}</b>매</span>` +
    `<span>문장 <b>${c.sentences}</b>개 (평균 ${c.avgSentence}자)</span>` +
    barHtml;
}

// 자동 저장 (debounce)
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 500);
}
function flushSave() {
  clearTimeout(saveTimer);
  const { q } = findQ();
  if (!q) return;
  store.updateQuestion(cur.companyId, cur.qId, {
    title: $('q-title').value,
    limit: parseInt($('q-limit').value, 10) || null,
    unit: $('q-unit').value,
    content: $('q-content').value,
  });
  state = store.load();
}

// ── 스냅샷 ──
function renderSnaps() {
  const { q } = findQ();
  const $list = $('snap-list');
  $list.innerHTML = '';
  if (!q?.snapshots?.length) {
    $list.innerHTML = '<div class="empty">아직 스냅샷이 없어요. 📌 버튼으로 현재 버전을 저장해두세요.</div>';
    return;
  }
  for (const s of q.snapshots) {
    const el = document.createElement('div');
    el.className = 'snap-item';
    el.innerHTML = `<span class="ts">${fmtTs(s.ts)}</span><span class="preview"></span><span class="n">${countAll(s.content).withSpace}자</span><button class="btn btn-sm btn-ghost">복원</button>`;
    el.querySelector('.preview').textContent = s.content.slice(0, 60);
    el.querySelector('button').addEventListener('click', () => {
      if (!confirm('이 버전으로 복원할까요? (현재 내용은 자동 스냅샷됩니다)')) return;
      store.restore(cur.companyId, cur.qId, s.ts);
      state = store.load();
      renderEditor();
      toast('복원했어요 — 직전 내용도 스냅샷에 남아 있어요');
    });
    $list.appendChild(el);
  }
}

// ── 검색 ──
function renderSearch() {
  const kw = $('in-search').value.trim();
  const $res = $('search-results');
  $res.innerHTML = '';
  if (kw.length < 2) return;
  const hits = store.search(kw).slice(0, 8);
  if (!hits.length) { $res.innerHTML = '<p class="hint">결과 없음</p>'; return; }
  for (const h of hits) {
    const el = document.createElement('div');
    el.className = 'search-hit';
    el.innerHTML = `<div class="path"></div><div class="ex"></div>`;
    el.querySelector('.path').textContent = `${h.companyName} › ${h.title}`;
    el.querySelector('.ex').textContent = `…${h.excerpt}…`;
    el.addEventListener('click', () => { selectQ(h.companyId, h.qId); $('in-search').value = ''; renderSearch(); });
    $res.appendChild(el);
  }
}

// ── 프리셋 ──
async function loadPresets() {
  try {
    const res = await fetch('data/presets.json', { cache: 'no-cache' });
    presets = await res.json();
    const $sel = $('q-preset');
    for (const c of presets.companies) {
      for (const [i, qq] of c.questions.entries()) {
        const opt = document.createElement('option');
        opt.value = `${c.id}:${i}`;
        opt.textContent = `${c.name} — ${qq.type} (${qq.limit}${qq.unit === 'bytes' ? 'byte' : '자'})`;
        $sel.appendChild(opt);
      }
    }
  } catch { /* 프리셋 없이도 동작 */ }
}

// ── 이벤트 바인딩 ──
$('btn-add-company').addEventListener('click', () => {
  const name = $('in-new-company').value.trim();
  if (!name) return toast('회사 이름을 입력하세요');
  const c = store.addCompany(name);
  state = store.load();
  $('in-new-company').value = '';
  renderTree();
  const q = store.addQuestion(c.id, '문항 1');
  state = store.load();
  selectQ(c.id, q.id);
});
$('in-new-company').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('btn-add-company').click(); });

for (const id of ['q-title', 'q-limit', 'q-unit', 'q-content']) {
  $(id).addEventListener('input', () => { scheduleSave(); renderCounter(); if (id === 'q-title') renderTree(); });
}
$('q-preset').addEventListener('change', () => {
  const v = $('q-preset').value;
  if (!v) return;
  const [cid, idx] = v.split(':');
  const pc = presets.companies.find((x) => x.id === cid);
  const pq = pc?.questions[Number(idx)];
  if (!pq) return;
  $('q-limit').value = pq.limit;
  $('q-unit').value = pq.unit;
  if (!$('q-title').value || /^문항 \d+$/.test($('q-title').value)) $('q-title').value = pq.type;
  scheduleSave();
  renderCounter();
  toast(`${pc.name} ${pq.type} 프리셋 적용 (${pq.year}년 기준 — 실제 공고 확인!)`, 2600);
});

$('btn-snapshot').addEventListener('click', () => {
  flushSave();
  store.snapshot(cur.companyId, cur.qId);
  state = store.load();
  toast('스냅샷 저장 📌');
  if (!$('snap-panel').hidden) renderSnaps();
});
$('btn-snaplist').addEventListener('click', () => {
  state = store.load();
  $('snap-panel').hidden = !$('snap-panel').hidden;
  if (!$('snap-panel').hidden) renderSnaps();
});
$('btn-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('q-content').value); toast('본문 복사 📋'); }
  catch { toast('복사 실패 — 직접 선택해 주세요'); }
});
$('btn-txt').addEventListener('click', () => {
  const { c, q } = findQ();
  const blob = new Blob([$('q-content').value], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${c?.name || '자소서'}_${q?.title || '문항'}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
});
$('btn-del-q').addEventListener('click', () => {
  const { q } = findQ();
  if (!q) return;
  if (!confirm(`'${q.title}' 문항을 삭제할까요?`)) return;
  store.removeQuestion(cur.companyId, cur.qId);
  state = store.load();
  cur.qId = null;
  renderEditor();
  renderTree();
});

$('btn-export').addEventListener('click', () => {
  flushSave();
  const blob = new Blob([store.exportJSON()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `jasolab_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('백업 파일 다운로드 ⬇');
});
$('btn-import').addEventListener('click', () => $('file-import').click());
$('file-import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  if (!confirm('복원하면 현재 데이터를 덮어씁니다. 계속할까요?')) { e.target.value = ''; return; }
  const r = store.importJSON(text);
  if (r.ok) {
    state = store.load();
    cur = { companyId: null, qId: null };
    renderTree();
    renderEditor();
    toast('복원 완료 ⬆');
  } else {
    toast(`복원 실패: ${r.error}`, 2600);
  }
  e.target.value = '';
});

$('in-search').addEventListener('input', renderSearch);
$('btn-sidebar').addEventListener('click', () => $('sidebar').classList.toggle('collapsed'));
window.addEventListener('beforeunload', flushSave);

// ── 초기화 ──
renderTree();
renderEditor();
loadPresets();
