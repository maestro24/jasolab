// jasolab 글자수 코어 로직 — DOM 없는 순수 ES module
//
// 카운트 규약 (한국 채용시스템 관행):
// - 글자수: 유니코드 코드포인트 기준 (Array.from). 서로게이트 페어 이모지 👍 = 1글자.
//   ZWJ 조합 이모지(👨‍👩‍👧)는 코드포인트별로 셈 → 5글자 (채용시스템과 동일).
// - 바이트: 코드포인트 > 0x7F → 2바이트, 아니면 1바이트. 줄바꿈 \n = 1바이트.
// - \r\n 은 사전에 \n 으로 정규화 (글자 1).
// - 공백 제외: 스페이스·탭·줄바꿈·전각공백(U+3000) 등 유니코드 공백 전부 제외.

const MANUSCRIPT_PAGE_SIZE = 200;
const ASCII_MAX = 0x7f;
const SENTENCE_DELIMITERS = /[.!?。]+/; // . ! ? 。 (연속 구두점은 1개)
const WHITESPACE = /\s/u; // JS \s 는 U+3000(전각공백) 포함

export const LIMIT_UNITS = Object.freeze([
  'chars_with_space',
  'chars_no_space',
  'bytes',
]);

function normalize(text) {
  if (typeof text !== 'string') {
    throw new TypeError(`countAll: text must be a string, got ${typeof text}`);
  }
  return text.replace(/\r\n/g, '\n');
}

function countBytes(codePoints) {
  return codePoints.reduce(
    (sum, ch) => sum + (ch.codePointAt(0) > ASCII_MAX ? 2 : 1),
    0,
  );
}

function countSentences(text) {
  return text
    .split(SENTENCE_DELIMITERS)
    .filter((fragment) => fragment.trim().length > 0).length;
}

/**
 * 텍스트의 모든 카운트 지표를 계산한다.
 * @param {string} text
 * @returns {{withSpace:number, noSpace:number, bytes:number,
 *            manuscript:number, sentences:number, avgSentence:number}}
 */
export function countAll(text) {
  const normalized = normalize(text);
  const codePoints = Array.from(normalized);

  const withSpace = codePoints.length;
  const noSpace = codePoints.filter((ch) => !WHITESPACE.test(ch)).length;
  const bytes = countBytes(codePoints);
  const manuscript =
    withSpace === 0 ? 0 : Math.ceil(withSpace / MANUSCRIPT_PAGE_SIZE);
  const sentences = countSentences(normalized);
  const avgSentence = sentences === 0 ? 0 : Math.round(noSpace / sentences);

  return { withSpace, noSpace, bytes, manuscript, sentences, avgSentence };
}

/**
 * 글자수 제한 대비 사용량을 계산한다.
 * @param {string} text
 * @param {number} limit
 * @param {"chars_with_space"|"chars_no_space"|"bytes"} unit
 * @returns {{used:number, limit:number, remain:number, over:boolean}}
 */
export function checkLimit(text, limit, unit) {
  if (!Number.isFinite(limit)) {
    throw new TypeError(`checkLimit: limit must be a finite number, got ${limit}`);
  }
  const counts = countAll(text);
  const usedByUnit = {
    chars_with_space: counts.withSpace,
    chars_no_space: counts.noSpace,
    bytes: counts.bytes,
  };
  if (!(unit in usedByUnit)) {
    throw new RangeError(
      `checkLimit: unknown unit "${unit}" (expected ${LIMIT_UNITS.join(' | ')})`,
    );
  }
  const used = usedByUnit[unit];
  return { used, limit, remain: limit - used, over: used > limit };
}
