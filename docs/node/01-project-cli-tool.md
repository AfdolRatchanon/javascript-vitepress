# 💻 Project 1: WSA2026 CLI Info Tool

> **เป้าหมาย:** สร้าง CLI Tool ชื่อ `wsa-info.js` สำหรับแสดงข้อมูลระบบ WSA2026
> ผ่าน `process.argv` โดยไม่ต้องใช้ library ภายนอก

---

## 📖 ภาพรวม (Overview)

```
  WSA2026 CLI Tool — Architecture
  ====================================

  Terminal
     |
     | $ node wsa-info.js candidates
     | $ node wsa-info.js tasks
     | $ node wsa-info.js help
     v
  +--------------------------+
  |       wsa-info.js        |
  |                          |
  |  process.argv[2]         |
  |  = "candidates"          |
  +----------+---------------+
             |
    +--------v---------+
    |   switch(command)|
    +--+------+------+-+
       |      |      |
  [candidates] [tasks] [help]
       |         |       |
  show table  show table show help
```

### ตัวอย่างการใช้งาน

```bash
$ node wsa-info.js candidates
=== WSA2026: Candidates (5) ===
  1. [101] สมชาย ใจดี       (Thailand) — candidate
  2. [102] Hiroshi Tanaka   (Japan)    — candidate
  ...

$ node wsa-info.js tasks
=== WSA2026: Tasks (3) ===
  1. [T1] Build REST API     (180 min, max: 100 pts)
  2. [T2] Database Design    (120 min, max: 100 pts)
  ...

$ node wsa-info.js help
  ╔════════════════════════════════╗
  ║  WSA2026 CLI Info Tool v1.0   ║
  ╚════════════════════════════════╝
  Usage: node wsa-info.js <command>
  ...
```

---

## 🗂️ โครงสร้างไฟล์

```
wsa2026-cli/
├── wsa-info.js    ← ไฟล์เดียว ไม่มี dependency!
└── package.json
```

---

## ⏱️ เวลา

- **ระยะเวลา:** 30–45 นาที
- **ระดับ:** เริ่มต้น (เน้น `process.argv`, `switch/case`, `console.log`)

---

## 📝 ขั้นตอน (Step-by-Step)

### Step 1: สร้างโปรเจกต์

```bash
mkdir wsa2026-cli
cd wsa2026-cli
npm init -y
```

### Step 2: เข้าใจ process.argv

ก่อนเขียนโค้ดจริง ลองทดสอบ `process.argv` ดูก่อน:

::: code-group
```js [test-argv.js]
// ทดสอบก่อน: node test-argv.js candidates --json
console.log(process.argv);
```
:::

```bash
$ node test-argv.js candidates --json
[
  'C:\\Program Files\\nodejs\\node.exe',  ← argv[0] = path ของ node
  'C:\\wsa2026-cli\\test-argv.js',        ← argv[1] = path ของไฟล์
  'candidates',                           ← argv[2] = command ✅
  '--json'                                ← argv[3] = flag (ถ้ามี)
]
```

> 💡 **สังเกต:** `argv[2]` เป็น String เสมอ ต้องแปลงตัวเลขด้วย `parseInt()` หรือ `Number()`

### Step 3: สร้าง wsa-info.js ทั้งหมด

::: code-group
```js [wsa-info.js]
// =====================================================
// WSA2026 CLI Info Tool
// =====================================================
// Usage: node wsa-info.js <command>
//   candidates   — แสดงรายชื่อผู้สมัคร
//   tasks        — แสดงรายชื่อ tasks
//   submissions  — แสดง submissions (mock data)
//   stats        — แสดงสถิติ
//   help         — แสดงวิธีใช้
// =====================================================

// ===============================================
// 1. รับ Arguments
// ===============================================
const command = process.argv[2];        // เช่น "candidates"
const flag    = process.argv[3] || "";  // เช่น "--json" (optional)

// ===============================================
// 2. Mock Data (TP2026 Schema)
//    users(id, username, name, role, country)
//    tasks(id, title, time_limit_minutes, max_score)
//    submissions(id, candidate_id, task_id, submission_url, submitted_at, score, status)
// ===============================================
const candidates = [
  { id: 101, username: "somchai_th",  name: "สมชาย ใจดี",       role: "candidate", country: "Thailand"  },
  { id: 102, username: "tanaka_jp",   name: "Hiroshi Tanaka",   role: "candidate", country: "Japan"     },
  { id: 103, username: "lee_kr",      name: "Ji-ho Lee",        role: "candidate", country: "Korea"     },
  { id: 104, username: "nguyen_vn",   name: "Nguyen Van Minh",  role: "candidate", country: "Vietnam"   },
  { id: 105, username: "ali_my",      name: "Muhammad Ali",     role: "candidate", country: "Malaysia"  },
  { id: 201, username: "judge_sg",    name: "Ahmad Faris",      role: "judge",     country: "Singapore" },
  { id: 202, username: "manager_wsa", name: "Sarah Johnson",    role: "manager",   country: "Australia" }
];

const tasks = [
  { id: 1, title: "Build REST API",       time_limit_minutes: 180, max_score: 100 },
  { id: 2, title: "Database Design",      time_limit_minutes: 120, max_score: 100 },
  { id: 3, title: "Security Hardening",   time_limit_minutes: 90,  max_score: 100 }
];

const submissions = [
  { id: 1, candidate_id: 101, task_id: 1, submission_url: "https://github.com/wsa/th-t1",  submitted_at: "2026-05-07T08:00:00Z", score: 92, status: "scored"  },
  { id: 2, candidate_id: 102, task_id: 1, submission_url: "https://github.com/wsa/jp-t1",  submitted_at: "2026-05-07T08:15:00Z", score: 85, status: "scored"  },
  { id: 3, candidate_id: 103, task_id: 1, submission_url: "https://github.com/wsa/kr-t1",  submitted_at: "2026-05-07T08:30:00Z", score: null, status: "pending" },
  { id: 4, candidate_id: 104, task_id: 2, submission_url: "https://github.com/wsa/vn-t2",  submitted_at: "2026-05-07T09:00:00Z", score: 78, status: "scored"  },
  { id: 5, candidate_id: 105, task_id: 2, submission_url: "https://github.com/wsa/my-t2",  submitted_at: "2026-05-07T09:20:00Z", score: null, status: "pending" }
];

// ===============================================
// 3. แสดงผล Commands
// ===============================================

function showCandidates() {
  const list = candidates.filter(c => c.role === "candidate");
  const judges  = candidates.filter(c => c.role === "judge");
  const managers = candidates.filter(c => c.role === "manager");

  if (flag === "--json") {
    console.log(JSON.stringify(candidates, null, 2));
    return;
  }

  console.log(`\n=== WSA2026: Candidates (${list.length}) ===\n`);
  list.forEach((c, i) => {
    const num     = String(i + 1).padStart(2);
    const id      = String(c.id).padEnd(4);
    const name    = c.name.padEnd(20);
    const country = c.country.padEnd(10);
    console.log(`  ${num}. [${id}] ${name} (${country}) — ${c.role}`);
  });

  console.log(`\n  Judges   : ${judges.map(j => j.name).join(", ")}`);
  console.log(`  Managers : ${managers.map(m => m.name).join(", ")}`);
  console.log(`\n  Total: ${candidates.length} users`);
}

function showTasks() {
  if (flag === "--json") {
    console.log(JSON.stringify(tasks, null, 2));
    return;
  }

  console.log(`\n=== WSA2026: Tasks (${tasks.length}) ===\n`);
  tasks.forEach((t, i) => {
    const num   = String(i + 1).padStart(2);
    const id    = `T${t.id}`;
    const title = t.title.padEnd(25);
    const time  = String(t.time_limit_minutes).padStart(3);
    console.log(`  ${num}. [${id}] ${title} (${time} min, max: ${t.max_score} pts)`);
  });
}

function showSubmissions() {
  if (flag === "--json") {
    console.log(JSON.stringify(submissions, null, 2));
    return;
  }

  console.log(`\n=== WSA2026: Submissions (${submissions.length}) ===\n`);
  console.log("  ID   Candidate   Task   Score    Status");
  console.log("  " + "-".repeat(45));

  submissions.forEach(s => {
    const id       = String(s.id).padEnd(4);
    const cid      = String(s.candidate_id).padEnd(10);
    const tid      = String(s.task_id).padEnd(6);
    const score    = (s.score !== null ? String(s.score) : "N/A").padEnd(8);
    const status   = s.status.toUpperCase();
    const icon     = status === "SCORED" ? "✓" : "○";
    console.log(`  ${id} ${cid} ${tid} ${score} ${icon} ${status}`);
  });

  const scored  = submissions.filter(s => s.status === "scored").length;
  const pending = submissions.filter(s => s.status === "pending").length;
  console.log(`\n  Scored: ${scored} | Pending: ${pending}`);
}

function showStats() {
  const totalCandidates  = candidates.filter(c => c.role === "candidate").length;
  const scoredSubs       = submissions.filter(s => s.score !== null);
  const avgScore         = scoredSubs.length > 0
    ? (scoredSubs.reduce((sum, s) => sum + s.score, 0) / scoredSubs.length).toFixed(2)
    : "N/A";
  const topSubmission    = [...submissions]
    .filter(s => s.score !== null)
    .sort((a, b) => b.score - a.score)[0];
  const topCandidate     = topSubmission
    ? candidates.find(c => c.id === topSubmission.candidate_id)
    : null;

  console.log(`
=== WSA2026: Competition Statistics ===

  Participants
    Candidates  : ${totalCandidates}
    Judges      : ${candidates.filter(c => c.role === "judge").length}

  Tasks
    Total Tasks : ${tasks.length}
    Total Time  : ${tasks.reduce((s, t) => s + t.time_limit_minutes, 0)} min

  Submissions
    Total       : ${submissions.length}
    Scored      : ${scoredSubs.length}
    Pending     : ${submissions.length - scoredSubs.length}
    Avg Score   : ${avgScore}

  Current Leader
    ${topCandidate ? `${topCandidate.name} (${topCandidate.country}) — ${topSubmission.score} pts` : "No scored submissions yet"}
  `);
}

function showHelp() {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   WSA2026 CLI Info Tool  v1.0         ║
  ║   WorldSkills Asia 2026 — Test System ║
  ╚════════════════════════════════════════╝

  Usage: node wsa-info.js <command> [--json]

  Commands:
    candidates    แสดงรายชื่อผู้สมัครและกรรมการ
    tasks         แสดงรายการโจทย์การแข่งขัน
    submissions   แสดงประวัติการส่งงาน
    stats         แสดงสถิติการแข่งขัน
    help          แสดงข้อความนี้

  Flags:
    --json        แสดงผลในรูปแบบ JSON (สำหรับ candidates/tasks/submissions)

  Examples:
    node wsa-info.js candidates
    node wsa-info.js tasks --json
    node wsa-info.js submissions
    node wsa-info.js stats
  `);
}

// ===============================================
// 4. Main: เลือก Command
// ===============================================
if (!command || command === "help") {
  showHelp();
  process.exit(0);
}

switch (command) {
  case "candidates":   showCandidates();   break;
  case "tasks":        showTasks();        break;
  case "submissions":  showSubmissions();  break;
  case "stats":        showStats();        break;
  default:
    console.error(`\n❌ Unknown command: "${command}"`);
    console.error(`   Try: node wsa-info.js help\n`);
    process.exit(1);
}
```
:::

### Step 4: ทดสอบทุกคำสั่ง

```bash
# ทดสอบทุก command
node wsa-info.js help
node wsa-info.js candidates
node wsa-info.js tasks
node wsa-info.js submissions
node wsa-info.js stats

# ทดสอบ --json flag
node wsa-info.js candidates --json
node wsa-info.js tasks --json

# ทดสอบ error case
node wsa-info.js unknown-command    # ❌ Unknown command: "unknown-command"
node wsa-info.js                    # แสดง help
```

### Step 5: เพิ่ม npm Script

ใน `package.json`:

```json
{
  "scripts": {
    "info": "node wsa-info.js"
  }
}
```

```bash
# ใช้ -- เพื่อส่ง arguments ผ่าน npm
npm run info -- candidates
npm run info -- tasks --json
```

---

## ✅ Expected Output

```
$ node wsa-info.js candidates

=== WSA2026: Candidates (5) ===

   1. [101 ] สมชาย ใจดี          (Thailand  ) — candidate
   2. [102 ] Hiroshi Tanaka      (Japan     ) — candidate
   3. [103 ] Ji-ho Lee           (Korea     ) — candidate
   4. [104 ] Nguyen Van Minh     (Vietnam   ) — candidate
   5. [105 ] Muhammad Ali        (Malaysia  ) — candidate

  Judges   : Ahmad Faris
  Managers : Sarah Johnson

  Total: 7 users


$ node wsa-info.js stats

=== WSA2026: Competition Statistics ===

  Participants
    Candidates  : 5
    Judges      : 1

  Tasks
    Total Tasks : 3
    Total Time  : 390 min

  Submissions
    Total       : 5
    Scored      : 3
    Pending     : 2
    Avg Score   : 85.00

  Current Leader
    สมชาย ใจดี (Thailand) — 92 pts
```

---

## 🔥 Challenge

### Challenge 1: เพิ่ม ANSI Color Output

ทำให้ output มีสีสันโดยไม่ใช้ package ภายนอก ใช้ ANSI Escape Codes:

```javascript
// colors.js — helper ไม่ต้องติดตั้งอะไร!
const c = {
  green:  (t) => `\x1b[32m${t}\x1b[0m`,
  red:    (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan:   (t) => `\x1b[36m${t}\x1b[0m`,
  bold:   (t) => `\x1b[1m${t}\x1b[0m`,
  dim:    (t) => `\x1b[2m${t}\x1b[0m`
};

// ตัวอย่างการใช้:
// console.log(c.green("✅ Scored") + " " + c.bold("92 pts"));
// console.log(c.yellow("○ Pending"));
// console.log(c.cyan("=== WSA2026 ==="));
```

นำไปใช้ใน `showSubmissions()`:
- ✅ SCORED → สีเขียว
- ○ PENDING → สีเหลือง
- Header → สีฟ้า Bold

### Challenge 2: เพิ่มคำสั่ง `leaderboard`

สร้าง command `node wsa-info.js leaderboard` ที่แสดง:
- จัดอันดับผู้สมัครตามคะแนนรวม (ทุก task)
- แสดงอันดับ 1-5 พร้อม trophy emoji (🥇🥈🥉)
- คำนวณ total score รวมจากทุก task

### Challenge 3: ค้นหาผู้สมัคร

สร้าง command `node wsa-info.js search <keyword>` ที่ค้นหาผู้สมัครจาก:
- ชื่อ (name)
- ประเทศ (country)
- รหัส (id)

---

## 📊 สิ่งที่เรียนรู้จากโปรเจกต์นี้

| Concept | ใช้ตรงไหน |
|:---|:---|
| `process.argv` | รับ command และ flag จาก Terminal |
| `process.exit()` | จบโปรแกรมพร้อม exit code (0=OK, 1=Error) |
| `switch/case` | เลือก command ตาม argv[2] |
| `Array.filter()` | กรองข้อมูล เช่น candidates เฉพาะ role |
| `Array.sort()` | เรียงลำดับ submissions ตาม score |
| `String.padEnd()` | จัด column ให้ตรงในตาราง terminal |
| ANSI Escape | ใส่สีใน terminal โดยไม่ต้องลง package |

---

> 👉 **[ไปต่อ: Module 2 — File System](/node/02-02-file-system)**
