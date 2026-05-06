# 💻 Project 2: WSA2026 File Manager

> **เป้าหมาย:** สร้าง CLI Tool สำหรับจัดการข้อมูลการแข่งขัน WSA2026 ครบวงจร
> อ่านข้อมูลผู้สมัคร (`candidates.json`), บันทึก submissions ใหม่, สร้าง backup อัตโนมัติ
> และจัดการโฟลเดอร์ทั้งหมดผ่าน Terminal

---

## 📖 ภาพรวม (Overview)

เราจะสร้าง **WSA2026 File Manager** ที่สั่งการได้ครบวงจรผ่าน Terminal:

```
  WSA2026 File Manager — Architecture
  =====================================

  Terminal (User)
       |
       | node manager.js <command> [args...]
       v
  +--------------------+
  |   manager.js       |   ← Entry point (switch/case)
  |   process.argv     |
  +--------+-----------+
           |
  +--------v-----------+      +-----------------------+
  |  Command Handler   |      |   File System         |
  |                    |      |                       |
  |  candidates  ------+----> | data/candidates.json  |
  |  submit      ------+----> | data/submissions.json |
  |  backup      ------+----> | data/backups/         |
  |  report      ------+----> | data/report.txt       |
  |  setup       ------+----> | data/ + logs/         |
  |  help               |      +-----------------------+
  +--------------------+
```

### คำสั่งที่รองรับ

| # | คำสั่ง | ตัวอย่าง | รายละเอียด |
|:-:|:---|:---|:---|
| 1 | `setup` | `node manager.js setup` | สร้างโครงสร้างโฟลเดอร์และไฟล์เริ่มต้น |
| 2 | `candidates` | `node manager.js candidates` | แสดงรายชื่อผู้สมัครทั้งหมด |
| 3 | `submit` | `node manager.js submit 101 1 https://...` | บันทึก submission ใหม่ |
| 4 | `score` | `node manager.js score 1 92` | ตั้งคะแนนให้ submission |
| 5 | `submissions` | `node manager.js submissions` | แสดง submissions ทั้งหมด |
| 6 | `backup` | `node manager.js backup` | สร้าง backup อัตโนมัติ |
| 7 | `report` | `node manager.js report` | สร้างไฟล์รายงาน |
| 8 | `help` | `node manager.js help` | แสดงวิธีใช้งาน |

---

## 🗂️ โครงสร้างไฟล์ (File Structure)

```
wsa2026-file-manager/
├── manager.js              ← ไฟล์หลัก (Entry point)
├── package.json
└── data/
    ├── candidates.json     ← ข้อมูลผู้สมัคร (สร้างตอน setup)
    ├── tasks.json          ← ข้อมูล tasks (สร้างตอน setup)
    ├── submissions.json    ← ข้อมูล submissions (สร้างตอน submit)
    ├── backups/            ← โฟลเดอร์เก็บ backup
    │   └── submissions-2026-05-07T10-30-00.json
    └── reports/
        └── report-2026-05-07.txt
```

---

## ⏱️ เวลา

- **ระยะเวลา:** 60–90 นาที
- **ระดับ:** ปานกลาง (ต้องเข้าใจ `fs/promises`, `process.argv`, `JSON.parse/stringify`)

---

## 📝 ขั้นตอน (Step-by-Step)

### Step 1: สร้างโปรเจกต์

```bash
mkdir wsa2026-file-manager
cd wsa2026-file-manager
npm init -y
```

### Step 2: โครงสร้างหลักและข้อมูลเริ่มต้น

::: code-group
```js [manager.js — constants & setup]
// manager.js
const fs   = require("fs").promises;
const path = require("path");

// ===============================================
// Constants
// ===============================================
const DATA_DIR        = path.join(__dirname, "data");
const CANDIDATES_FILE = path.join(DATA_DIR, "candidates.json");
const TASKS_FILE      = path.join(DATA_DIR, "tasks.json");
const SUBMISSIONS_FILE= path.join(DATA_DIR, "submissions.json");
const BACKUP_DIR      = path.join(DATA_DIR, "backups");
const REPORT_DIR      = path.join(DATA_DIR, "reports");

// ข้อมูลเริ่มต้น WSA2026
const INITIAL_CANDIDATES = [
  { id: 101, username: "somchai_th", name: "สมชาย ใจดี",      role: "candidate", country: "Thailand"  },
  { id: 102, username: "tanaka_jp",  name: "Hiroshi Tanaka",  role: "candidate", country: "Japan"     },
  { id: 103, username: "lee_kr",     name: "Ji-ho Lee",       role: "candidate", country: "Korea"     },
  { id: 104, username: "nguyen_vn",  name: "Nguyen Van Minh", role: "candidate", country: "Vietnam"   },
  { id: 201, username: "judge_sg",   name: "Ahmad Faris",     role: "judge",     country: "Singapore" }
];

const INITIAL_TASKS = [
  { id: 1, title: "Build REST API",       time_limit_minutes: 180, max_score: 100 },
  { id: 2, title: "Database Design",      time_limit_minutes: 120, max_score: 100 },
  { id: 3, title: "Security Hardening",   time_limit_minutes: 90,  max_score: 100 }
];
```
:::

### Step 3: Helper Functions

::: code-group
```js [manager.js — helpers]
// ===============================================
// Helper: อ่าน JSON ไฟล์
// ===============================================
async function readJSON(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

// ===============================================
// Helper: เขียน JSON ไฟล์
// ===============================================
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ===============================================
// Helper: ตรวจสอบว่ามีไฟล์หรือไม่
// ===============================================
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
```
:::

### Step 4: คำสั่ง Setup และ Candidates

::: code-group
```js [manager.js — setup & candidates]
// ===============================================
// Command: setup — สร้างโครงสร้างเริ่มต้น
// ===============================================
async function cmdSetup() {
  console.log("=== WSA2026: Setting up File Manager ===\n");

  // สร้างโฟลเดอร์
  const dirs = [DATA_DIR, BACKUP_DIR, REPORT_DIR, path.join(__dirname, "logs")];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`  📁 Created: ${path.relative(__dirname, dir)}`);
  }

  // สร้างไฟล์ candidates.json (ถ้ายังไม่มี)
  if (!(await fileExists(CANDIDATES_FILE))) {
    await writeJSON(CANDIDATES_FILE, INITIAL_CANDIDATES);
    console.log("  📄 Created: data/candidates.json");
  } else {
    console.log("  ✓  Exists:  data/candidates.json");
  }

  // สร้างไฟล์ tasks.json
  if (!(await fileExists(TASKS_FILE))) {
    await writeJSON(TASKS_FILE, INITIAL_TASKS);
    console.log("  📄 Created: data/tasks.json");
  } else {
    console.log("  ✓  Exists:  data/tasks.json");
  }

  console.log("\n✅ Setup complete! Run: node manager.js help");
}

// ===============================================
// Command: candidates — แสดงรายชื่อผู้สมัคร
// ===============================================
async function cmdCandidates() {
  const candidates = await readJSON(CANDIDATES_FILE);
  if (!candidates) {
    console.log("❌ candidates.json not found. Run: node manager.js setup");
    return;
  }

  console.log("=== WSA2026: Candidates ===");
  console.log("+------+--------------------+---------------------+----------+-----------+");
  console.log("| ID   | Username           | Name                | Role     | Country   |");
  console.log("+------+--------------------+---------------------+----------+-----------+");

  for (const c of candidates) {
    const id       = String(c.id).padEnd(4);
    const username = c.username.padEnd(18);
    const name     = c.name.padEnd(19);
    const role     = c.role.padEnd(8);
    const country  = c.country.padEnd(9);
    console.log(`| ${id} | ${username} | ${name} | ${role} | ${country} |`);
  }
  console.log("+------+--------------------+---------------------+----------+-----------+");
  console.log(`Total: ${candidates.length} users`);
}
```
:::

### Step 5: คำสั่ง Submit และ Score

::: code-group
```js [manager.js — submit & score]
// ===============================================
// Command: submit <candidateId> <taskId> <url>
// ===============================================
async function cmdSubmit(candidateId, taskId, submissionUrl) {
  if (!candidateId || !taskId || !submissionUrl) {
    console.log("❌ Usage: node manager.js submit <candidateId> <taskId> <url>");
    return;
  }

  let submissions = (await readJSON(SUBMISSIONS_FILE)) || [];

  const newSub = {
    id:             submissions.length + 1,
    candidate_id:   parseInt(candidateId),
    task_id:        parseInt(taskId),
    submission_url: submissionUrl,
    submitted_at:   new Date().toISOString(),
    score:          null,
    status:         "pending"
  };

  submissions.push(newSub);
  await writeJSON(SUBMISSIONS_FILE, submissions);

  console.log(`✅ Submission #${newSub.id} recorded!`);
  console.log(`   Candidate : #${newSub.candidate_id}`);
  console.log(`   Task      : #${newSub.task_id}`);
  console.log(`   URL       : ${newSub.submission_url}`);
  console.log(`   Status    : ${newSub.status}`);

  // บันทึก log
  const logLine = `[${new Date().toISOString()}] SUBMIT id=${newSub.id} candidate=${candidateId} task=${taskId}\n`;
  await fs.appendFile(path.join(__dirname, "logs", "events.log"), logLine, "utf-8");
}

// ===============================================
// Command: score <submissionId> <score>
// ===============================================
async function cmdScore(submissionId, score) {
  if (!submissionId || score === undefined) {
    console.log("❌ Usage: node manager.js score <submissionId> <score>");
    return;
  }

  const submissions = await readJSON(SUBMISSIONS_FILE);
  if (!submissions) {
    console.log("❌ submissions.json not found");
    return;
  }

  const sub = submissions.find(s => s.id === parseInt(submissionId));
  if (!sub) {
    console.log(`❌ Submission #${submissionId} not found`);
    return;
  }

  sub.score  = parseFloat(score);
  sub.status = "scored";
  await writeJSON(SUBMISSIONS_FILE, submissions);

  console.log(`✅ Submission #${sub.id} scored: ${sub.score}`);
  console.log(`   Candidate : #${sub.candidate_id} | Task: #${sub.task_id}`);

  const logLine = `[${new Date().toISOString()}] SCORE id=${sub.id} score=${sub.score}\n`;
  await fs.appendFile(path.join(__dirname, "logs", "events.log"), logLine, "utf-8");
}

// ===============================================
// Command: submissions — แสดง submissions ทั้งหมด
// ===============================================
async function cmdSubmissions() {
  const submissions = (await readJSON(SUBMISSIONS_FILE)) || [];
  if (submissions.length === 0) {
    console.log("📭 No submissions yet. Run: node manager.js submit ...");
    return;
  }

  console.log("=== WSA2026: Submissions ===");
  submissions.forEach(s => {
    const scoreStr = s.score !== null ? String(s.score).padStart(6) : "   N/A";
    console.log(`  [#${s.id}] Candidate:${s.candidate_id} | Task:${s.task_id} | Score:${scoreStr} | ${s.status.toUpperCase()}`);
  });

  const scored  = submissions.filter(s => s.status === "scored").length;
  const pending = submissions.filter(s => s.status === "pending").length;
  const avg     = submissions
    .filter(s => s.score !== null)
    .reduce((sum, s, _, arr) => sum + s.score / arr.length, 0);

  console.log(`\nTotal: ${submissions.length} | Scored: ${scored} | Pending: ${pending}`);
  if (scored > 0) console.log(`Average Score: ${avg.toFixed(2)}`);
}
```
:::

### Step 6: คำสั่ง Backup และ Report

::: code-group
```js [manager.js — backup, report & main]
// ===============================================
// Command: backup
// ===============================================
async function cmdBackup() {
  if (!(await fileExists(SUBMISSIONS_FILE))) {
    console.log("⚠️  No submissions.json to backup");
    return;
  }

  const ts      = new Date().toISOString().replace(/[:.]/g, "-");
  const dest    = path.join(BACKUP_DIR, `submissions-${ts}.json`);
  const stats   = await fs.stat(SUBMISSIONS_FILE);

  await fs.copyFile(SUBMISSIONS_FILE, dest);

  console.log(`✅ Backup created: backups/${path.basename(dest)}`);
  console.log(`   Source size  : ${(stats.size / 1024).toFixed(2)} KB`);

  // ล้าง backup เก่า — เก็บแค่ 5 ไฟล์ล่าสุด
  const backups = (await fs.readdir(BACKUP_DIR))
    .filter(f => f.startsWith("submissions-"))
    .sort();

  if (backups.length > 5) {
    const toDelete = backups.slice(0, backups.length - 5);
    for (const f of toDelete) {
      await fs.rm(path.join(BACKUP_DIR, f));
      console.log(`  🗑️  Removed old backup: ${f}`);
    }
  }
}

// ===============================================
// Command: report
// ===============================================
async function cmdReport() {
  const submissions = (await readJSON(SUBMISSIONS_FILE)) || [];
  const candidates  = (await readJSON(CANDIDATES_FILE)) || [];
  const tasks       = (await readJSON(TASKS_FILE)) || [];

  const today      = new Date().toISOString().split("T")[0];
  const reportPath = path.join(REPORT_DIR, `report-${today}.txt`);

  const lines = [
    "=".repeat(50),
    " WSA2026 TEST SUBMISSION MANAGEMENT SYSTEM",
    " Competition Report",
    `" Generated: ${new Date().toLocaleString("th-TH")}`,
    "=".repeat(50),
    "",
    `Total Candidates  : ${candidates.filter(c => c.role === "candidate").length}`,
    `Total Judges      : ${candidates.filter(c => c.role === "judge").length}`,
    `Total Tasks       : ${tasks.length}`,
    `Total Submissions : ${submissions.length}`,
    "",
    "--- Submissions by Task ---"
  ];

  for (const task of tasks) {
    const taskSubs = submissions.filter(s => s.task_id === task.id);
    const scored   = taskSubs.filter(s => s.score !== null);
    const avgScore = scored.length > 0
      ? (scored.reduce((sum, s) => sum + s.score, 0) / scored.length).toFixed(2)
      : "N/A";

    lines.push(`  Task ${task.id}: ${task.title}`);
    lines.push(`    Submissions: ${taskSubs.length} | Scored: ${scored.length} | Avg: ${avgScore}`);
  }

  lines.push("", "--- Leaderboard (Top 5) ---");
  const scored = submissions
    .filter(s => s.score !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  scored.forEach((s, i) => {
    const c = candidates.find(c => c.id === s.candidate_id);
    lines.push(`  ${i + 1}. ${c ? c.name : `Candidate #${s.candidate_id}`} — Score: ${s.score} (Task ${s.task_id})`);
  });

  lines.push("", "=".repeat(50));

  await fs.writeFile(reportPath, lines.join("\n"), "utf-8");
  console.log(`✅ Report saved: reports/report-${today}.txt`);
  console.log(lines.join("\n"));
}

// ===============================================
// Command: help
// ===============================================
function showHelp() {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   WSA2026 File Manager — Command Reference  ║
  ╚══════════════════════════════════════════════╝

  Usage: node manager.js <command> [arguments]

  Commands:
    setup                          สร้างโครงสร้างโฟลเดอร์และไฟล์เริ่มต้น
    candidates                     แสดงรายชื่อผู้สมัครทั้งหมด
    submit <cid> <tid> <url>       บันทึก submission ใหม่
    score <sid> <score>            ตั้งคะแนนให้ submission
    submissions                    แสดง submissions ทั้งหมด
    backup                         สร้าง backup ของ submissions.json
    report                         สร้างรายงานสรุป

  Examples:
    node manager.js setup
    node manager.js candidates
    node manager.js submit 101 1 https://github.com/wsa/th-submission
    node manager.js score 1 92
    node manager.js backup
  `);
}

// ===============================================
// Main
// ===============================================
async function main() {
  const [,, command, arg1, arg2, arg3] = process.argv;

  try {
    switch (command) {
      case "setup":        await cmdSetup();                     break;
      case "candidates":   await cmdCandidates();               break;
      case "submit":       await cmdSubmit(arg1, arg2, arg3);   break;
      case "score":        await cmdScore(arg1, arg2);          break;
      case "submissions":  await cmdSubmissions();              break;
      case "backup":       await cmdBackup();                   break;
      case "report":       await cmdReport();                   break;
      case "help":
      default:             showHelp();
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
```
:::

---

## ✅ Expected Output

```bash
# 1. ตั้งค่าเริ่มต้น
$ node manager.js setup
=== WSA2026: Setting up File Manager ===
  📁 Created: data
  📁 Created: data/backups
  📁 Created: data/reports
  📁 Created: logs
  📄 Created: data/candidates.json
  📄 Created: data/tasks.json
✅ Setup complete!

# 2. ดูรายชื่อผู้สมัคร
$ node manager.js candidates
=== WSA2026: Candidates ===
+------+--------------------+---------------------+----------+-----------+
| ID   | Username           | Name                | Role     | Country   |
+------+--------------------+---------------------+----------+-----------+
| 101  | somchai_th         | สมชาย ใจดี          | candidate | Thailand  |
| 102  | tanaka_jp          | Hiroshi Tanaka      | candidate | Japan     |
...

# 3. บันทึก submission
$ node manager.js submit 101 1 https://github.com/wsa/th-team
✅ Submission #1 recorded!
   Candidate : #101
   Task      : #1
   Status    : pending

# 4. ตั้งคะแนน
$ node manager.js score 1 92
✅ Submission #1 scored: 92

# 5. ดู submissions
$ node manager.js submissions
=== WSA2026: Submissions ===
  [#1] Candidate:101 | Task:1 | Score:    92 | SCORED
Total: 1 | Scored: 1 | Pending: 0
Average Score: 92.00

# 6. Backup
$ node manager.js backup
✅ Backup created: backups/submissions-2026-05-07T10-30-00-000Z.json
   Source size  : 0.45 KB
```

---

## 🔥 Challenge

### Challenge 1: เพิ่มคำสั่ง `import`

สร้างคำสั่ง `node manager.js import <csv-file>` ที่:
1. อ่านไฟล์ CSV (`id,username,name,role,country`)
2. Parse ข้อมูลแต่ละแถว
3. Merge เข้ากับ `candidates.json` ที่มีอยู่ (ไม่ให้ซ้ำกัน)
4. แสดงสรุป: "Imported N new, skipped N duplicates"

### Challenge 2: Auto-Backup on Submit

แก้ฟังก์ชัน `cmdSubmit()` ให้ทำ backup อัตโนมัติทุกครั้งที่มี submission ใหม่ครบ 10 รายการ

### Challenge 3: ลบ old backups อัตโนมัติ

เพิ่ม argument `--keep=N` ให้คำสั่ง `backup` เพื่อกำหนดจำนวน backup ที่ต้องการเก็บไว้
เช่น `node manager.js backup --keep=3` เก็บแค่ 3 ไฟล์ล่าสุด

---

> 👉 **[กลับหน้าสารบัญ](/node/)**
