# Module Systems 📦

> 💡 **เป้าหมาย:** เข้าใจระบบ Module ทั้ง CommonJS และ ESM รวมถึงการทำงานภายในของ `require()` และ `import` — นำไปใช้แยกโค้ดของ **WSA2026 Test Submission Management System** เป็น Helper Modules ที่ Reusable และดูแลรักษาง่าย

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

ในโปรเจกต์จริงอย่าง WSA2026 เราจะไม่เขียนโค้ดทุกอย่างไว้ในไฟล์เดียว เพราะระบบมีหลายส่วน เช่น การตรวจสอบ Submission, การคำนวณคะแนน, การจัดการข้อมูล Judge — แต่ละส่วนควรอยู่ใน Module แยก

### ทำไมต้องแยก Module?

```
❌ ไม่ดี — ไฟล์เดียวยาว 1,000 บรรทัด
─────────────────────────────────────────
app.js (1,000 lines)
├── ตรวจสอบ submission URL
├── ตรวจสอบ judge credentials
├── คำนวณคะแนน
├── บันทึกผลลงไฟล์
└── แสดงผลสรุป

✅ ดี — แยกเป็น Module ตามหน้าที่
─────────────────────────────────────────
app.js                  ← ไฟล์หลัก (เรียกใช้ทุกอย่าง)
├── submissionHelper.js ← ตรวจสอบ + จัดรูป submission
├── scoreHelper.js      ← คำนวณและตรวจสอบคะแนน
├── judgeHelper.js      ← จัดการข้อมูล judge
└── taskHelper.js       ← ข้อมูล task และ time limit
```

**ข้อดีของการแยก Module:**

| ข้อดี | อธิบาย |
|:------|:-------|
| **อ่านง่าย** | แต่ละไฟล์สั้น มีหน้าที่เดียว |
| **แก้ง่าย** | แก้ไฟล์เดียว ไม่กระทบทั้งโปรเจกต์ |
| **Reusable** | นำ Helper Module ไปใช้ใน Module อื่นได้ |
| **ทำงานเป็นทีม** | Judge UI และ Admin UI ใช้ Helper เดียวกัน |
| **Test ง่าย** | Test `scoreHelper.js` แยกออกมาได้ทันที |

---

### CommonJS (CJS) — ระบบดั้งเดิมของ Node.js

**CommonJS** คือระบบ Module **ดั้งเดิม** ที่ Node.js ใช้มาตั้งแต่แรก ใช้ `require()` และ `module.exports` เป็น Default ของ Node.js (ถ้าไม่ตั้งค่าอะไรเป็นพิเศษ)

**การทำงานภายในของ `require()`:**

```
require("./submissionHelper")
        │
        ▼
┌─────────────────────────────────────────────┐
│  Node.js Module Wrapper (เกิดอัตโนมัติ!)   │
│                                             │
│  (function(exports, require, module,        │
│            __filename, __dirname) {         │
│                                             │
│      // โค้ดทั้งหมดของไฟล์ submissionHelper  │
│      // ถูกห่อไว้ใน Function นี้            │
│                                             │
│  })                                         │
└─────────────────────────────────────────────┘
        │
        ▼
  ส่งคืน module.exports กลับมา
```

> 💡 **สิ่งที่ Node.js ทำอัตโนมัติ:** ทุกไฟล์ `.js` จะถูกห่อด้วย **Module Wrapper Function** ก่อนรัน — นั่นคือเหตุผลว่าทำไม `__dirname`, `__filename`, `require`, `module`, `exports` ถึงมีใช้ในทุกไฟล์โดยไม่ต้อง import

---

### ESM (ES Modules) — มาตรฐานสากล

**ESM** คือ Module System ที่เป็น **มาตรฐานของ JavaScript** ทั้ง Browser และ Node.js ใช้ `import` / `export` รองรับ Tree Shaking (ตัดโค้ดที่ไม่ใช้ออกเมื่อ Build)

**การทำงานของ ESM (Static Analysis):**

```
import { validateSubmission } from "./submissionHelper.mjs"
         │
         ▼
┌────────────────────────────────────────────┐
│  Static Analysis Phase (ก่อนรันโค้ด!)     │
│                                            │
│  1. อ่าน import/export ทั้งหมด            │
│  2. สร้าง Dependency Graph                 │
│  3. โหลด Module แบบ Async พร้อมกัน        │
│  4. Link (ผูก) ค่าของ export เข้ากับ      │
│     ตัวแปร import (Live Binding!)          │
└────────────────────────────────────────────┘
         │
         ▼
  สามารถใช้ Tree Shaking ได้!
  (เพราะรู้ว่าใช้อะไรก่อนรัน)
```

---

### Module Resolution — Node.js หา Module อย่างไร?

```
require("xxx") หรือ import "xxx"
         │
         ▼
┌────────────────────────────────────────────┐
│  ขั้นที่ 1: Built-in Module?               │
│  require("fs") → ✅ หยุดค้นหา             │
└────────────────────────────────────────────┘
         │ ไม่ใช่
         ▼
┌────────────────────────────────────────────┐
│  ขั้นที่ 2: ขึ้นต้นด้วย "./" หรือ "../"? │
│  require("./scoreHelper")                  │
│    → ลอง ./scoreHelper.js                  │
│    → ลอง ./scoreHelper.json                │
│    → ลอง ./scoreHelper/index.js            │
└────────────────────────────────────────────┘
         │ ไม่ใช่
         ▼
┌────────────────────────────────────────────┐
│  ขั้นที่ 3: npm Package?                   │
│  require("express")                        │
│    → ./node_modules/express/               │
│    → ../node_modules/express/              │
│    → ../../node_modules/express/ ...       │
│    (ขึ้นไปเรื่อยๆ จนถึง root)             │
└────────────────────────────────────────────┘
```

---

### CJS vs ESM — เปรียบเทียบ

| Feature | **CommonJS (CJS)** | **ESM** |
|:--------|:-------------------|:--------|
| **Syntax** | `require()` / `module.exports` | `import` / `export` |
| **Loading** | **Synchronous** (โหลดทีละตัว บล็อกรอ) | **Asynchronous** (โหลดพร้อมกัน) |
| **Default ใน Node.js** | ✅ ไฟล์ `.js` ธรรมดา | ❌ ต้องตั้ง `"type": "module"` หรือใช้ `.mjs` |
| **Browser Support** | ❌ ไม่รองรับ | ✅ รองรับ (`<script type="module">`) |
| **`__dirname`** | ✅ มีให้ใช้ | ❌ ไม่มี (ใช้ `import.meta.url` แทน) |
| **Top-level await** | ❌ ไม่ได้ | ✅ ได้ |
| **Tree Shaking** | ❌ ไม่ได้ | ✅ ได้ (Bundler ตัดโค้ดที่ไม่ใช้) |
| **Live Binding** | ❌ Copy ค่ามา | ✅ Reference จริง (ค่าอัปเดตตาม) |
| **Dynamic Import** | ✅ `require()` ทุกที่ | ✅ `import()` แบบ dynamic ได้ |

### ข้อควรระวัง (Mixed Usage Pitfalls)

```
⚠️ ปัญหาที่พบบ่อย:

1. ใช้ require() ใน .mjs ไฟล์
   ❌ // taskHelper.mjs
      const fs = require("fs")  // SyntaxError!
   ✅ // taskHelper.mjs
      import fs from "fs"       // ถูกต้อง

2. ใช้ import ใน .js โดยไม่ตั้ง type:module
   ❌ // scoreHelper.js (ไม่มี type:module)
      import { add } from "./math.js"  // SyntaxError!
   ✅ แก้ได้ด้วย: เพิ่ม "type":"module" ใน package.json
      หรือเปลี่ยนนามสกุลเป็น .mjs

3. ลืมใส่นามสกุลไฟล์ใน ESM
   ❌ import { fn } from "./helper"     // Error ใน Node.js ESM!
   ✅ import { fn } from "./helper.mjs" // ต้องใส่ .mjs เสมอ

4. __dirname ใน ESM
   ❌ console.log(__dirname)  // ReferenceError!
   ✅ import { fileURLToPath } from "url"
      import { dirname } from "path"
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = dirname(__filename)
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

สร้าง Helper Module สำหรับระบบ WSA2026 — ทั้งแบบ CommonJS และ ESM

::: code-group
```js [submissionHelper.js (CommonJS)]
// ============================================================
// submissionHelper.js — CommonJS Module
// WSA2026: ตรวจสอบและจัดรูปข้อมูล Submission ของ Candidate
// ============================================================

/**
 * ตรวจสอบว่า submission URL ถูกต้องหรือไม่
 * @param {string} submissionUrl - URL ที่ candidate ส่งมา
 * @returns {{ valid: boolean, message: string }}
 */
function validateSubmissionUrl(submissionUrl) {
  if (!submissionUrl || typeof submissionUrl !== "string") {
    return { valid: false, message: "submissionUrl ต้องเป็น String" };
  }

  const urlPattern = /^https?:\/\/.+\..+/;
  if (!urlPattern.test(submissionUrl)) {
    return { valid: false, message: `URL ไม่ถูกต้อง: ${submissionUrl}` };
  }

  return { valid: true, message: "URL ถูกต้อง" };
}

/**
 * สร้าง Submission Record สำหรับบันทึกลงระบบ
 * @param {string} candidateId  - รหัส candidate
 * @param {string} submissionUrl - URL ที่ส่งมา
 * @param {string} taskTitle    - ชื่อ task ที่ submit
 * @returns {object} Submission record พร้อม timestamp
 */
function createSubmissionRecord(candidateId, submissionUrl, taskTitle) {
  const validation = validateSubmissionUrl(submissionUrl);

  if (!validation.valid) {
    throw new Error(`ไม่สามารถสร้าง Submission: ${validation.message}`);
  }

  return {
    id: `SUB-${Date.now()}`,
    candidateId,
    submissionUrl,
    taskTitle,
    submittedAt: new Date().toISOString(),
    status: "pending", // pending | scored | rejected
  };
}

/**
 * กรอง Submission ตาม candidateId
 * @param {Array} submissions - รายการ submission ทั้งหมด
 * @param {string} candidateId - รหัส candidate ที่ต้องการ
 * @returns {Array} รายการ submission ของ candidate นั้น
 */
function getSubmissionsByCandidate(submissions, candidateId) {
  return submissions.filter((sub) => sub.candidateId === candidateId);
}

/**
 * แสดงสรุป Submission ในรูปแบบอ่านง่าย
 * @param {object} record - Submission record
 * @returns {string} ข้อความสรุป
 */
function formatSubmissionSummary(record) {
  return (
    `[${record.status.toUpperCase()}] ` +
    `Candidate: ${record.candidateId} | ` +
    `Task: ${record.taskTitle} | ` +
    `URL: ${record.submissionUrl}`
  );
}

// ✅ Export ทุกฟังก์ชัน (CommonJS style)
module.exports = {
  validateSubmissionUrl,
  createSubmissionRecord,
  getSubmissionsByCandidate,
  formatSubmissionSummary,
};

// ✅ Demo: รันตรงเพื่อทดสอบ (ไม่ทำงานตอนถูก require)
if (require.main === module) {
  console.log("=== Testing submissionHelper.js ===\n");

  // ทดสอบ validateSubmissionUrl
  console.log(validateSubmissionUrl("https://myproject.netlify.app"));
  // { valid: true, message: 'URL ถูกต้อง' }

  console.log(validateSubmissionUrl("not-a-url"));
  // { valid: false, message: 'URL ไม่ถูกต้อง: not-a-url' }

  // ทดสอบ createSubmissionRecord
  const record = createSubmissionRecord(
    "C001",
    "https://myproject.netlify.app",
    "Front-End Development"
  );
  console.log("\nSubmission Record:");
  console.log(record);

  // ทดสอบ formatSubmissionSummary
  console.log("\nFormatted:");
  console.log(formatSubmissionSummary(record));
}
```

```js [taskHelper.mjs (ESM)]
// ============================================================
// taskHelper.mjs — ES Module
// WSA2026: จัดการข้อมูล Task สำหรับการแข่งขัน
// ============================================================

// ข้อมูล Task ของการแข่งขัน WSA2026
// รูปแบบ: { id, title, time_limit_minutes, max_score }
const TASKS = [
  {
    id: "T01",
    title: "Front-End Development",
    time_limit_minutes: 360,
    max_score: 100,
  },
  {
    id: "T02",
    title: "Back-End Development",
    time_limit_minutes: 300,
    max_score: 100,
  },
  {
    id: "T03",
    title: "Responsive Design",
    time_limit_minutes: 180,
    max_score: 50,
  },
];

/**
 * ค้นหา Task ด้วย id
 * @param {string} taskId - รหัส task
 * @returns {object|null} Task object หรือ null ถ้าไม่เจอ
 */
export function findTaskById(taskId) {
  return TASKS.find((task) => task.id === taskId) || null;
}

/**
 * ดึงรายการ Task ทั้งหมด
 * @returns {Array} รายการ task ทั้งหมด
 */
export function getAllTasks() {
  return [...TASKS]; // Return copy เพื่อป้องกันการแก้ไขข้อมูลต้นฉบับ
}

/**
 * ตรวจสอบว่าคะแนนที่ judge ให้อยู่ในขอบเขตที่ถูกต้องหรือไม่
 * @param {string} taskId - รหัส task
 * @param {number} score  - คะแนนที่ต้องการตรวจสอบ
 * @returns {{ valid: boolean, message: string }}
 */
export function validateScore(taskId, score) {
  const task = findTaskById(taskId);

  if (!task) {
    return { valid: false, message: `ไม่พบ Task ID: ${taskId}` };
  }

  if (typeof score !== "number" || isNaN(score)) {
    return { valid: false, message: "score ต้องเป็นตัวเลข" };
  }

  if (score < 0 || score > task.max_score) {
    return {
      valid: false,
      message: `score ต้องอยู่ระหว่าง 0 - ${task.max_score} สำหรับ Task: ${task.title}`,
    };
  }

  return { valid: true, message: "คะแนนถูกต้อง" };
}

/**
 * คำนวณเปอร์เซ็นต์คะแนน
 * @param {string} taskId - รหัส task
 * @param {number} score  - คะแนนที่ได้
 * @returns {number} เปอร์เซ็นต์ (0-100)
 */
export function calcScorePercent(taskId, score) {
  const task = findTaskById(taskId);
  if (!task) return 0;
  return Math.round((score / task.max_score) * 100);
}

/**
 * Default export — สรุปข้อมูลการแข่งขัน
 */
export default {
  totalTasks: TASKS.length,
  totalMaxScore: TASKS.reduce((sum, t) => sum + t.max_score, 0),
  tasks: TASKS,
};
```

```js [app.js (ใช้งาน CJS)]
// ============================================================
// app.js — ใช้ submissionHelper.js แบบ CommonJS
// WSA2026: Demo การทำงานร่วมกันของ Module
// ============================================================

const {
  validateSubmissionUrl,
  createSubmissionRecord,
  getSubmissionsByCandidate,
  formatSubmissionSummary,
} = require("./submissionHelper");

// ข้อมูล Candidate ในรูปแบบ { id, username, name, role, country }
const candidates = [
  { id: "C001", username: "somchai_th", name: "สมชาย ใจดี", role: "candidate", country: "Thailand" },
  { id: "C002", username: "juan_ph",   name: "Juan Dela Cruz", role: "candidate", country: "Philippines" },
];

// สร้าง submission จำลอง
const allSubmissions = [];

console.log("=== WSA2026 Submission System ===\n");

// Candidate C001 ส่งงาน
try {
  const sub1 = createSubmissionRecord(
    "C001",
    "https://somchai-wsa2026.netlify.app",
    "Front-End Development"
  );
  allSubmissions.push(sub1);
  console.log("✅ Submission 1:", formatSubmissionSummary(sub1));
} catch (err) {
  console.error("❌", err.message);
}

// Candidate C002 ส่งงาน
try {
  const sub2 = createSubmissionRecord(
    "C002",
    "https://juan-wsa2026.vercel.app",
    "Front-End Development"
  );
  allSubmissions.push(sub2);
  console.log("✅ Submission 2:", formatSubmissionSummary(sub2));
} catch (err) {
  console.error("❌", err.message);
}

// ทดสอบ URL ไม่ถูกต้อง
try {
  const sub3 = createSubmissionRecord("C003", "localhost:3000", "Back-End Development");
  allSubmissions.push(sub3);
} catch (err) {
  console.error("❌ ส่งงานล้มเหลว:", err.message);
}

// กรองหา submission ของ C001
const c001Submissions = getSubmissionsByCandidate(allSubmissions, "C001");
console.log(`\nC001 มี ${c001Submissions.length} submission(s)`);
```

```js [app.mjs (ใช้งาน ESM)]
// ============================================================
// app.mjs — ใช้ taskHelper.mjs แบบ ES Module
// WSA2026: Demo Named + Default Import
// ============================================================

import taskSummary, { findTaskById, validateScore, calcScorePercent, getAllTasks } from "./taskHelper.mjs";

// Judge ข้อมูล { id, username, name, role, country }
const judge = {
  id: "J001",
  username: "judge_wsa",
  name: "Mr. Expert Judge",
  role: "judge",
  country: "Singapore",
};

console.log("=== WSA2026 Task & Scoring System ===\n");
console.log("Competition Summary:", taskSummary);

// แสดง Task ทั้งหมด
console.log("\n--- All Tasks ---");
getAllTasks().forEach((task) => {
  console.log(
    `[${task.id}] ${task.title} | ` +
      `Time: ${task.time_limit_minutes} min | ` +
      `Max Score: ${task.max_score}`
  );
});

// Judge ให้คะแนน
const judgeId = judge.id;
const taskTitle = "Front-End Development";
const score = 87;

const taskFound = getAllTasks().find((t) => t.title === taskTitle);

if (taskFound) {
  const check = validateScore(taskFound.id, score);
  if (check.valid) {
    const percent = calcScorePercent(taskFound.id, score);
    console.log(`\n✅ Judge ${judgeId} ให้คะแนน: ${score}/${taskFound.max_score} (${percent}%)`);
    console.log(`   Task: ${taskTitle}`);
  } else {
    console.error("❌ คะแนนไม่ถูกต้อง:", check.message);
  }
}
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** สร้างไฟล์ `judgeHelper.js` แบบ CommonJS ที่ export ฟังก์ชันต่อไปนี้:
1. `isValidJudge(user)` — รับ object `{ id, username, name, role, country }` แล้วเช็คว่า `role === "judge"` หรือไม่ ส่งคืน `true/false`
2. `formatJudgeName(user)` — คืนชื่อในรูปแบบ `"Mr/Ms. Name (Country)"` เช่น `"Mr. Expert Judge (Singapore)"`

จากนั้นทดสอบใน `testJudge.js` โดย require มาใช้และแสดงผล

::: details 💡 คำใบ้ (Hint)
- ใช้ `module.exports = { isValidJudge, formatJudgeName }` เพื่อ export
- ใช้ `const { isValidJudge, formatJudgeName } = require("./judgeHelper")` เพื่อ import
- ตรวจ role ด้วย `user.role === "judge"`
- ใช้ Template Literal สร้าง String: `` `${user.name} (${user.country})` ``
- อย่าลืม `if (require.main === module)` เพื่อ demo เมื่อรันตรง
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

**โจทย์:** สร้าง `scoreHelper.mjs` แบบ ESM ที่มีฟังก์ชัน:
1. `createScoreRecord(judgeId, candidateId, taskTitle, score)` — สร้าง object `{ id, judgeId, candidateId, taskTitle, score, scoredAt }`
2. `calcGrade(score, maxScore)` — คำนวณเกรด: 90%+ = "Gold", 75%+ = "Silver", 60%+ = "Bronze", ต่ำกว่า = "No Medal"
3. Export ทั้งสองฟังก์ชันแบบ Named Export

จากนั้นสร้าง `main.mjs` ที่ import มาใช้ — ให้ Judge J001 ให้คะแนน Candidate C001 และ C002 แล้วแสดง Grade ของแต่ละคน

::: details 💡 คำใบ้ (Hint)
- ใช้ `export function createScoreRecord(...)` และ `export function calcGrade(...)`
- คำนวณ percent ด้วย `(score / maxScore) * 100`
- ใช้ `if-else if` chain ตรวจ percent เพื่อ return เกรด
- ใน `main.mjs` ใช้ `import { createScoreRecord, calcGrade } from "./scoreHelper.mjs"`
- ลอง Top-level await ใน .mjs: `const result = await Promise.resolve(createScoreRecord(...))`
:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ถ้าเขียน `module.exports = { fn1, fn2 }` ใน `helper.js` และในไฟล์อื่นเขียน `const helper = require("./helper")` — ถ้าอยากเรียก `fn1` ต้องเขียนอย่างไร? มีวิธีที่ง่ายกว่านั้นไหม?

**แนวคำตอบ:** เรียกได้ทั้ง `helper.fn1()` หรือใช้ Destructuring ที่ง่ายกว่าคือ `const { fn1, fn2 } = require("./helper")` แล้วเรียก `fn1()` ตรงๆ

**คำถาม 2:** ในระบบ WSA2026 ถ้า `submissionHelper.js` ใช้ CommonJS และ `taskHelper.mjs` ใช้ ESM — สามารถ `require("./taskHelper.mjs")` ได้ไหม? และ `import` จาก CommonJS module ได้ไหม?

**แนวคำตอบ:** `require()` จาก CommonJS ไม่สามารถ require `.mjs` ไฟล์ได้โดยตรง (จะ Error) แต่สามารถใช้ Dynamic Import แทน: `const mod = await import("./taskHelper.mjs")` ส่วน ESM สามารถ `import` จาก CommonJS module ได้ (Node.js จะแปลง `module.exports` เป็น default export)

**คำถาม 3:** `exports.fn = ...` กับ `module.exports.fn = ...` ต่างกันอย่างไร? และทำไม `exports = { fn }` ถึงไม่ทำงาน?

**แนวคำตอบ:** `exports` เป็นแค่ Reference ที่ชี้ไปที่ `module.exports` — การเพิ่ม property เช่น `exports.fn = ...` ทำได้ปกติเพราะแก้ที่ object ตัวเดิม แต่ `exports = { fn }` คือการเปลี่ยน Reference ให้ชี้ไปที่ object ใหม่ ทำให้ `module.exports` ยังคงเป็น empty object เดิม Node.js จะส่ง `module.exports` กลับไป (ไม่ใช่ `exports` ใหม่) ดังนั้นจึงควรใช้ `module.exports = { fn }` เสมอเมื่อต้องการ replace ทั้งหมด
:::

---

👉 **[ไปต่อ: 2.2 - File System](/node/02-02-file-system)**
