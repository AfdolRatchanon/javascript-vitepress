# 13-01: Unit Testing with Jest 🃏

> 💡 **เป้าหมาย:** เรียนรู้การเขียน Unit Test ด้วย Jest ตั้งแต่ Matchers, Mock, Coverage
> เมื่อเรียนจบจะสามารถเขียน Test สำหรับ Business Logic ของ TP2026 ได้อย่างมั่นใจ

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Test Pyramid

```
TEST PYRAMID
============================================================

              /\
             /  \
            / E2E\       ← น้อย / ช้า / แพง
           /──────\        (เปิด Browser, คลิกจริง)
          / Integr-\
         / ation    \    ← กลาง / ปานกลาง
        /────────────\     (ยิง API จริง ต่อ DB)
       /              \
      /   Unit Tests   \  ← เยอะ / เร็ว / ถูก
     /──────────────────\   (ทดสอบ function เดียว)

  เป้าหมาย: Unit Test เยอะ, Integration พอสมควร, E2E น้อย
```

การเขียน Test ช่วยให้:
1. **มั่นใจ** — แก้โค้ดแล้วของเก่าไม่พัง (Regression Testing)
2. **Document** — Test คือเอกสารที่รันได้จริง
3. **Refactor** — ปรับโครงสร้างโค้ดได้อย่างสบายใจ

---

### ติดตั้ง Jest

```bash
npm install jest --save-dev
```

แก้ `package.json`:

```json
{
  "scripts": {
    "test"          : "jest",
    "test:watch"    : "jest --watch",
    "test:coverage" : "jest --coverage"
  },
  "jest": {
    "testEnvironment"            : "node",
    "coveragePathIgnorePatterns" : ["/node_modules/"]
  }
}
```

---

### โครงสร้างไฟล์ Test

```
tp2026-api/
├── src/
│   ├── utils/
│   │   └── scoring.js       ← Business Logic
│   └── validators/
│       └── submission.js    ← Validation
├── __tests__/               ← Jest ค้นหาอัตโนมัติ
│   ├── scoring.test.js
│   └── submission.test.js
└── package.json
```

---

### Anatomy of a Test (AAA Pattern)

```js
test('ชื่อที่อธิบายว่าทดสอบอะไร', () => {
  // Arrange — เตรียมข้อมูล
  const submission = { score: 85, maxScore: 100 };

  // Act — เรียก function ที่ทดสอบ
  const result = calculatePercentage(submission);

  // Assert — ตรวจสอบผลลัพธ์
  expect(result).toBe(85);
});
```

---

### Common Matchers

```js
// Equality
expect(value).toBe(3)               // ===  (primitive)
expect(obj).toEqual({ a: 1 })       // deep equal (object/array)
expect(obj).not.toEqual({ a: 2 })   // negation

// Truthiness
expect(null).toBeNull()
expect(undefined).toBeUndefined()
expect('hello').toBeTruthy()
expect('').toBeFalsy()

// Numbers
expect(score).toBeGreaterThan(0)
expect(score).toBeLessThanOrEqual(100)
expect(0.1 + 0.2).toBeCloseTo(0.3)  // float comparison

// Strings
expect(url).toMatch(/^https?:\/\//)

// Arrays
expect(results).toContain('pending')
expect(results).toHaveLength(3)

// Objects
expect(submission).toHaveProperty('status', 'scored')

// Errors
expect(() => fn()).toThrow()
expect(() => fn()).toThrow('ข้อความ error')
```

---

### describe / it / beforeEach / afterEach

```
GROUP STRUCTURE
============================================================

  describe('Feature Group') {
    beforeAll(() => {})   ← รันครั้งเดียวก่อนทุก test ใน group
    afterAll(() => {})    ← รันครั้งเดียวหลังทุก test ใน group
    beforeEach(() => {})  ← รันก่อนทุก test
    afterEach(() => {})   ← รันหลังทุก test

    it('test case 1') { ... }
    it('test case 2') { ... }
  }
```

---

### jest.fn() — Mock Functions

```
MOCK FUNCTION
============================================================

  jest.fn()  สร้าง function ปลอมที่:
  - บันทึกว่าถูกเรียกกี่ครั้ง
  - บันทึก arguments ที่ส่งเข้ามา
  - สามารถกำหนด return value ได้

  Matchers สำหรับ Mock:
  expect(mockFn).toHaveBeenCalled()
  expect(mockFn).toHaveBeenCalledTimes(2)
  expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
  expect(mockFn).toHaveBeenLastCalledWith(arg)
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

::: code-group

```js [src/utils/scoring.js]
/**
 * Scoring Utilities — WSA2026 Test Submission Management System
 */

/**
 * คำนวณคะแนนสุดท้าย (หักคะแนน Late Penalty ถ้าส่งช้า)
 * @param {number} rawScore       คะแนนดิบ 0-100
 * @param {number} maxScore       คะแนนสูงสุดของ Task
 * @param {boolean} isLate        ส่งช้าหรือไม่
 * @param {number} latePenaltyPct % หักคะแนน ถ้าส่งช้า (default 20%)
 * @returns {number} คะแนนสุดท้าย
 */
function calculateScore(rawScore, maxScore, isLate = false, latePenaltyPct = 20) {
  if (rawScore < 0 || rawScore > maxScore) {
    throw new Error(`rawScore ต้องอยู่ระหว่าง 0 และ ${maxScore}`);
  }
  if (maxScore <= 0) {
    throw new Error('maxScore ต้องมากกว่า 0');
  }

  const penalty   = isLate ? (rawScore * latePenaltyPct) / 100 : 0;
  const finalScore = Math.max(0, rawScore - penalty);
  return Math.round(finalScore * 100) / 100; // ปัดทศนิยม 2 ตำแหน่ง
}

/**
 * ตรวจว่า Submission ส่งช้าหรือไม่
 * @param {Date|string} submittedAt  เวลาที่ส่งงาน
 * @param {Date|string} deadline     เวลา Deadline
 * @returns {boolean}
 */
function isSubmissionLate(submittedAt, deadline) {
  const submitted = new Date(submittedAt);
  const due       = new Date(deadline);

  if (isNaN(submitted.getTime())) throw new Error('submittedAt ไม่ใช่ Date ที่ถูกต้อง');
  if (isNaN(due.getTime()))       throw new Error('deadline ไม่ใช่ Date ที่ถูกต้อง');

  return submitted > due;
}

/**
 * คำนวณ Rank จาก Array ของ Candidates
 * @param {Array<{id, total_score}>} candidates
 * @returns {Array<{id, total_score, rank}>}
 */
function assignRanks(candidates) {
  if (!Array.isArray(candidates)) throw new Error('candidates ต้องเป็น Array');

  const sorted = [...candidates].sort((a, b) => b.total_score - a.total_score);

  return sorted.map((c, index, arr) => {
    // ถ้าคะแนนเท่ากับคนก่อนหน้า → rank เดิม
    const rank = index === 0 || c.total_score < arr[index - 1].total_score
      ? index + 1
      : sorted[index - 1].rank;
    return { ...c, rank };
  });
}

module.exports = { calculateScore, isSubmissionLate, assignRanks };
```

```js [src/validators/submission.js]
/**
 * Submission Validators — WSA2026 Test Submission Management System
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * ตรวจ URL ว่าถูกต้องหรือไม่
 * @param {string} url
 * @returns {{ valid: boolean, error?: string }}
 */
function validateSubmissionUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL ต้องเป็น string ที่ไม่ว่าง' };
  }

  try {
    const parsed = new URL(url);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return { valid: false, error: 'URL ต้องเป็น http หรือ https เท่านั้น' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'URL รูปแบบไม่ถูกต้อง' };
  }
}

/**
 * ตรวจว่า score อยู่ในช่วงที่อนุญาต
 * @param {*} score
 * @param {number} maxScore
 * @returns {{ valid: boolean, error?: string }}
 */
function validateScore(score, maxScore = 100) {
  if (typeof score !== 'number' || isNaN(score)) {
    return { valid: false, error: 'score ต้องเป็นตัวเลข' };
  }
  if (score < 0 || score > maxScore) {
    return { valid: false, error: `score ต้องอยู่ระหว่าง 0 และ ${maxScore}` };
  }
  return { valid: true };
}

module.exports = { validateSubmissionUrl, validateScore };
```

```js [__tests__/scoring.test.js]
/**
 * Unit Tests: Scoring Utilities
 * WSA2026 Test Submission Management System
 */
const { calculateScore, isSubmissionLate, assignRanks } = require('../src/utils/scoring');

// ─── calculateScore ────────────────────────────────────────
describe('calculateScore()', () => {

  it('คืนคะแนนปกติเมื่อส่งทันเวลา', () => {
    expect(calculateScore(80, 100, false)).toBe(80);
  });

  it('หักคะแนน 20% เมื่อส่งช้า', () => {
    // 80 - (80 * 20%) = 80 - 16 = 64
    expect(calculateScore(80, 100, true, 20)).toBe(64);
  });

  it('ไม่ให้คะแนนติดลบ แม้ penalty สูงมาก', () => {
    expect(calculateScore(10, 100, true, 200)).toBe(0);
  });

  it('throw error ถ้า rawScore มากกว่า maxScore', () => {
    expect(() => calculateScore(110, 100)).toThrow('rawScore ต้องอยู่ระหว่าง 0 และ 100');
  });

  it('throw error ถ้า rawScore ติดลบ', () => {
    expect(() => calculateScore(-5, 100)).toThrow();
  });

  it('throw error ถ้า maxScore เป็น 0', () => {
    expect(() => calculateScore(0, 0)).toThrow('maxScore ต้องมากกว่า 0');
  });

  it('คำนวณคะแนนเต็มถูกต้อง', () => {
    expect(calculateScore(100, 100, false)).toBe(100);
  });
});

// ─── isSubmissionLate ──────────────────────────────────────
describe('isSubmissionLate()', () => {

  it('คืน false เมื่อส่งก่อน deadline', () => {
    const submitted = '2026-05-07T09:00:00Z';
    const deadline  = '2026-05-07T10:00:00Z';
    expect(isSubmissionLate(submitted, deadline)).toBe(false);
  });

  it('คืน true เมื่อส่งหลัง deadline', () => {
    const submitted = '2026-05-07T11:00:00Z';
    const deadline  = '2026-05-07T10:00:00Z';
    expect(isSubmissionLate(submitted, deadline)).toBe(true);
  });

  it('คืน false เมื่อส่งพอดี deadline', () => {
    const dt = '2026-05-07T10:00:00Z';
    expect(isSubmissionLate(dt, dt)).toBe(false);
  });

  it('throw error ถ้า submittedAt ไม่ใช่ Date ที่ถูกต้อง', () => {
    expect(() => isSubmissionLate('invalid-date', '2026-05-07')).toThrow();
  });
});

// ─── assignRanks ──────────────────────────────────────────
describe('assignRanks()', () => {

  it('เรียงลำดับจากคะแนนมากไปน้อย', () => {
    const input  = [
      { id: 3, total_score: 70 },
      { id: 1, total_score: 285 },
      { id: 2, total_score: 270 },
    ];
    const result = assignRanks(input);
    expect(result[0]).toMatchObject({ id: 1, rank: 1 });
    expect(result[1]).toMatchObject({ id: 2, rank: 2 });
    expect(result[2]).toMatchObject({ id: 3, rank: 3 });
  });

  it('ให้ rank เท่ากันเมื่อคะแนนเท่ากัน', () => {
    const input = [
      { id: 1, total_score: 285 },
      { id: 2, total_score: 285 },
      { id: 3, total_score: 270 },
    ];
    const result = assignRanks(input);
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(1);
    expect(result[2].rank).toBe(3); // ข้าม rank 2
  });

  it('throw error ถ้า input ไม่ใช่ Array', () => {
    expect(() => assignRanks(null)).toThrow('candidates ต้องเป็น Array');
  });

  it('คืน array ว่างเมื่อ input ว่าง', () => {
    expect(assignRanks([])).toEqual([]);
  });
});
```

```js [__tests__/submission-validator.test.js]
/**
 * Unit Tests: Submission Validators
 * WSA2026 Test Submission Management System
 */
const { validateSubmissionUrl, validateScore } = require('../src/validators/submission');

// ─── validateSubmissionUrl ─────────────────────────────────
describe('validateSubmissionUrl()', () => {

  it('ยอมรับ http URL ที่ถูกต้อง', () => {
    const result = validateSubmissionUrl('http://example.com/project');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('ยอมรับ https URL ที่ถูกต้อง', () => {
    const result = validateSubmissionUrl('https://github.com/user/repo');
    expect(result.valid).toBe(true);
  });

  it('ปฏิเสธ URL ที่ไม่ใช่ http/https', () => {
    const result = validateSubmissionUrl('ftp://files.example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/http/);
  });

  it('ปฏิเสธ URL รูปแบบผิด', () => {
    expect(validateSubmissionUrl('not-a-url').valid).toBe(false);
    expect(validateSubmissionUrl('').valid).toBe(false);
    expect(validateSubmissionUrl(null).valid).toBe(false);
  });
});

// ─── validateScore ──────────────────────────────────────────
describe('validateScore()', () => {

  it('ยอมรับคะแนนในช่วง 0-100', () => {
    expect(validateScore(0).valid).toBe(true);
    expect(validateScore(50).valid).toBe(true);
    expect(validateScore(100).valid).toBe(true);
  });

  it('ปฏิเสธคะแนนมากกว่า maxScore', () => {
    const result = validateScore(101, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/0 และ 100/);
  });

  it('ปฏิเสธคะแนนติดลบ', () => {
    expect(validateScore(-1).valid).toBe(false);
  });

  it('ปฏิเสธ string', () => {
    expect(validateScore('90').valid).toBe(false);
    expect(validateScore('A').valid).toBe(false);
  });

  it('ปฏิเสธ NaN', () => {
    expect(validateScore(NaN).valid).toBe(false);
  });
});
```

```js [__tests__/mock-example.test.js]
/**
 * Mock Examples — jest.fn() และ jest.mock()
 * WSA2026 Test Submission Management System
 */

// ─── jest.fn() — Manual Mock ──────────────────────────────
describe('jest.fn() Manual Mock', () => {

  it('นับจำนวนครั้งที่ function ถูกเรียก', () => {
    const mockNotify = jest.fn();

    // สมมติ Controller เรียก mockNotify เมื่อบันทึกคะแนนสำเร็จ
    mockNotify({ candidateId: 7, score: 95 });
    mockNotify({ candidateId: 8, score: 80 });

    expect(mockNotify).toHaveBeenCalledTimes(2);
    expect(mockNotify).toHaveBeenLastCalledWith({ candidateId: 8, score: 80 });
  });

  it('กำหนด return value ของ mock', () => {
    const mockDb = {
      query: jest.fn().mockResolvedValue([[
        { id: 1, name: 'Somchai', total_score: 285 },
      ]]),
    };

    // ใช้ mock แทน DB จริง
    return mockDb.query('SELECT ...').then((result) => {
      expect(result[0][0].name).toBe('Somchai');
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });

  it('reset mock ด้วย beforeEach', () => {
    const mockFn = jest.fn();

    beforeEach(() => {
      mockFn.mockClear(); // ล้าง call history
    });
  });
});

// ─── beforeEach / afterEach ────────────────────────────────
describe('beforeEach / afterEach', () => {
  let submissionData;

  beforeEach(() => {
    // เตรียมข้อมูลใหม่ก่อนทุก test
    submissionData = {
      id           : 1,
      candidate_id : 7,
      task_id      : 3,
      score        : null,
      status       : 'submitted',
    };
  });

  it('ควรมี status = submitted เมื่อยังไม่ให้คะแนน', () => {
    expect(submissionData.status).toBe('submitted');
    expect(submissionData.score).toBeNull();
  });

  it('สามารถอัปเดต status ได้', () => {
    submissionData.score  = 90;
    submissionData.status = 'scored';
    expect(submissionData.status).toBe('scored');
  });
});
```

:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** เขียนฟังก์ชัน `formatTaskTitle(title, maxLength)` ที่:
- ถ้า title ยาวกว่า maxLength → ตัดแล้วต่อ `...` 
- ถ้าสั้นกว่า → คืนค่าเดิม
- ถ้า title เป็น falsy → throw Error

แล้วเขียน Unit Test ให้ครอบคลุมทุก case

::: details 💡 คำใบ้ (Hint)

```js
function formatTaskTitle(title, maxLength = 50) {
  if (!title) throw new Error('title ต้องไม่ว่าง');
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
}

// Test cases:
// formatTaskTitle('Build REST API', 20) → 'Build REST API'
// formatTaskTitle('Very long title...', 10) → 'Very long ...'
// formatTaskTitle('') → throws Error
```

:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

สร้าง `scoreService.js` ที่ใช้ DB และเขียน Test โดย Mock DB:

```js
// scoreService.js
const db = require('./db');
async function getTopCandidates(limit = 5) {
  const [rows] = await db.query(`SELECT ... LIMIT ?`, [limit]);
  return rows;
}
module.exports = { getTopCandidates };

// scoreService.test.js — Mock db.query
jest.mock('./db');
const db = require('./db');
const { getTopCandidates } = require('./scoreService');

it('คืน top candidates ตาม limit', async () => {
  db.query.mockResolvedValue([[
    { id: 1, name: 'Somchai', total_score: 285 },
    { id: 2, name: 'Ahmed',   total_score: 270 },
  ]]);

  const result = await getTopCandidates(2);
  expect(result).toHaveLength(2);
  expect(result[0].name).toBe('Somchai');
  expect(db.query).toHaveBeenCalledWith(expect.any(String), [2]);
});
```

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** `toBe()` ต่างจาก `toEqual()` อย่างไร?
**แนวคำตอบ:** `toBe()` ใช้ `===` เปรียบ reference เหมาะกับ primitive; `toEqual()` เปรียบ deep value เหมาะกับ Object/Array เช่น `expect({a:1}).toEqual({a:1})` ผ่าน แต่ `toBe` จะไม่ผ่านเพราะเป็น object ต่าง reference

**คำถาม 2:** `jest.fn()` ใช้ทำอะไร?
**แนวคำตอบ:** สร้าง Mock Function ที่บันทึกว่าถูกเรียกกี่ครั้ง ด้วย argument อะไร และสามารถกำหนด return value ได้ ใช้แทน dependency จริงเช่น DB หรือ Email service เพื่อ isolate test

**คำถาม 3:** `beforeEach` ต่างจาก `beforeAll` อย่างไร?
**แนวคำตอบ:** `beforeEach` รันก่อนทุก `it` ใน `describe`; `beforeAll` รันครั้งเดียวก่อน test แรก ใช้กับ setup ที่แพงเช่น DB connection

**คำถาม 4:** `--coverage` flag ทำอะไร?
**แนวคำตอบ:** สร้าง Coverage Report แสดงว่า Test ครอบคลุม code กี่% แยกตาม Statements/Branches/Functions/Lines สร้าง HTML report ใน `coverage/lcov-report/index.html`

:::

---

> 👉 **ไปต่อ: [13-02: API Testing with Supertest](/node/13-02-api-testing-supertest)**
