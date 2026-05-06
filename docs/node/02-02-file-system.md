# Module 2.2: File System 📂

> 💡 **เป้าหมาย:** เข้าใจการทำงานของ `fs` module ใน Node.js สำหรับอ่าน เขียน และจัดการไฟล์ นำไปใช้กับระบบ WSA2026 Test Submission Management System เพื่อจัดการไฟล์ข้อมูลผู้สมัครและผลการส่งงาน

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### File System คืออะไร?

ใน Node.js, Module **`fs` (File System)** คือเครื่องมือหลักสำหรับจัดการไฟล์และโฟลเดอร์
ไม่ว่าจะอ่าน config, บันทึก log, หรือจัดการข้อมูลการแข่งขัน

> **💡 Analogy:**
> ถ้าตัวแปร (`const`) คือ **RAM** (ความจำสั้น) 🧠
> **File System** คือ **Harddisk** (ความจำยาว) 💾
> - เก็บข้อมูลถาวร ไม่หายเมื่อปิดโปรแกรม
> - เหมือนเรามีเลขา (Node.js) ที่สั่งให้เดินไปหยิบแฟ้ม (Read), เขียนเอกสารใหม่ (Write), หรือทำลายเอกสาร (Delete)

```
  WSA2026 System
  +-----------+       fs module        +------------------+
  |  Node.js  | ---[readFile]------->  | candidates.json  |
  |  Server   | <--[data]----------    | submissions.json |
  |           | ---[writeFile]------>  | backups/         |
  +-----------+                        +------------------+
       RAM (ชั่วคราว)                   Disk (ถาวร)
```

---

### Sync vs Async (เลือกแบบไหน?) ⚡

Module `fs` มี 2 รูปแบบหลัก:

1. **Synchronous (Blocking):** `readFileSync` — ทำเสร็จก่อนค่อยไปต่อ (ง่ายแต่บล็อกโปรแกรม)
2. **Asynchronous (Non-Blocking):** `readFile` / `fs/promises` — สั่งไว้แล้วไปทำอย่างอื่นก่อน (เร็วกว่า)

```
  Synchronous (Blocking):
  [Request 1] ---> [อ่านไฟล์... รอ... รอ...] ---> [ตอบ] ---> [Request 2 รอ...]

  Asynchronous (Non-Blocking):
  [Request 1] ---> [สั่งอ่านไฟล์] --> ไปทำอย่างอื่น
  [Request 2] ---> [ตอบได้เลย]
  [File Ready] --> [ตอบ Request 1]
```

> ⚠️ **ในคอร์สนี้เราใช้ `fs/promises`** (Async แบบ Modern) เป็นหลัก
> เพราะเขียนง่ายด้วย `await` และไม่บล็อกการทำงานของ Server

```javascript
// ✅ Import แบบ Modern (fs/promises)
const fs = require("fs").promises;

// หรือแบบ ES Module
import { promises as fs } from "fs";
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### 1. อ่านไฟล์ข้อมูลผู้สมัคร (`readFile`)

ต้องระบุ `encoding` ด้วย (`utf-8`) ไม่งั้นจะได้ **Buffer** (ตัวเลข)

::: code-group
```js [read-candidates.js]
const fs = require("fs").promises;
const path = require("path");

async function loadCandidates() {
  const filePath = path.join(__dirname, "data", "candidates.json");

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const candidates = JSON.parse(raw);

    console.log(`=== WSA2026: Candidates (${candidates.length}) ===`);
    candidates.forEach((c, i) => {
      console.log(`  ${i + 1}. [${c.id}] ${c.name} (${c.country}) - Role: ${c.role}`);
    });

    return candidates;
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("❌ ไม่พบไฟล์ candidates.json");
    } else {
      console.error("❌ อ่านไฟล์ไม่สำเร็จ:", err.message);
    }
    return [];
  }
}

loadCandidates();
```
:::

### 2. เขียน/อัปเดตไฟล์ submissions (`writeFile`)

- ถ้าไฟล์ยังไม่มี → สร้างใหม่
- ถ้ามีแล้ว → **เขียนทับ (Overwrite) ทั้งหมด!**

::: code-group
```js [write-submissions.js]
const fs = require("fs").promises;
const path = require("path");

async function saveSubmissions(submissions) {
  const filePath = path.join(__dirname, "data", "submissions.json");

  try {
    // แปลง Object เป็น JSON String ให้สวยงาม (indent 2)
    const content = JSON.stringify(submissions, null, 2);
    await fs.writeFile(filePath, content, "utf-8");
    console.log(`✅ บันทึก ${submissions.length} submissions สำเร็จ`);
  } catch (err) {
    console.error("❌ บันทึกไม่สำเร็จ:", err.message);
  }
}

// ตัวอย่างข้อมูล TP2026 submissions
const submissionsData = [
  {
    id: 1,
    candidate_id: 101,
    task_id: 1,
    submission_url: "https://github.com/wsa/submission/team-th-01",
    submitted_at: new Date().toISOString(),
    score: null,
    status: "pending"
  },
  {
    id: 2,
    candidate_id: 102,
    task_id: 1,
    submission_url: "https://github.com/wsa/submission/team-jp-01",
    submitted_at: new Date().toISOString(),
    score: 85,
    status: "scored"
  }
];

saveSubmissions(submissionsData);
```
:::

### 3. ต่อท้ายไฟล์ log (`appendFile`)

ใช้สำหรับ Logs หรือข้อมูลที่ต้องการเก็บประวัติ

::: code-group
```js [append-log.js]
const fs = require("fs").promises;
const path = require("path");

async function logSubmissionEvent(candidateId, taskId, action) {
  const logPath = path.join(__dirname, "logs", "submission-events.log");
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] candidate_id=${candidateId} task_id=${taskId} action=${action}\n`;

  try {
    await fs.appendFile(logPath, logEntry, "utf-8");
    console.log(`📝 Logged: ${action} for candidate #${candidateId}`);
  } catch (err) {
    console.error("❌ Log failed:", err.message);
  }
}

// เรียกใช้: บันทึกเหตุการณ์การส่งงาน
logSubmissionEvent(101, 1, "SUBMITTED");
logSubmissionEvent(102, 1, "SCORED");
```
:::

### 4. จัดการโฟลเดอร์ (Directories) 📁

::: code-group
```js [manage-dirs.js]
const fs = require("fs").promises;

async function setupCompetitionDirectories() {
  const dirs = [
    "data",
    "data/backups",
    "logs",
    "uploads/screenshots"
  ];

  console.log("=== WSA2026: Setting up directories ===");

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`  ✅ Created: ${dir}`);
    } catch (err) {
      console.error(`  ❌ Failed ${dir}:`, err.message);
    }
  }

  // แสดงรายชื่อไฟล์ในโฟลเดอร์ data
  try {
    const files = await fs.readdir("data");
    console.log("\n📂 Files in ./data:", files);
  } catch {
    console.log("📂 ./data is empty");
  }
}

setupCompetitionDirectories();
```
:::

### 5. ตรวจสอบและ Backup ไฟล์ข้อมูล 🛡️

::: code-group
```js [backup-data.js]
const fs = require("fs").promises;
const path = require("path");

async function backupSubmissions() {
  const srcFile = path.join(__dirname, "data", "submissions.json");
  const backupDir = path.join(__dirname, "data", "backups");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `submissions-${timestamp}.json`);

  try {
    // ตรวจสอบว่ามีไฟล์ต้นทางไหม
    await fs.access(srcFile);

    // เช็คขนาดไฟล์
    const stats = await fs.stat(srcFile);
    console.log(`📦 Source size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📅 Last modified: ${stats.mtime.toLocaleString("th-TH")}`);

    // สร้าง backup directory (ถ้ายังไม่มี)
    await fs.mkdir(backupDir, { recursive: true });

    // Copy ไฟล์
    await fs.copyFile(srcFile, backupFile);
    console.log(`✅ Backup saved: ${path.basename(backupFile)}`);

  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("⚠️  submissions.json not found — nothing to backup");
    } else {
      console.error("❌ Backup failed:", err.message);
    }
  }
}

backupSubmissions();
```
:::

### 6. Workshop: ระบบจัดการข้อมูลการแข่งขัน WSA2026

มาสร้าง Script ที่:
1. สร้างโครงสร้างโฟลเดอร์ทั้งหมด
2. สร้างไฟล์ข้อมูลเริ่มต้น (`candidates.json`, `tasks.json`)
3. เพิ่ม submission ใหม่
4. Backup อัตโนมัติ

::: code-group
```js [wsa2026-data-manager.js]
const fs = require("fs").promises;
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const CANDIDATES_FILE = path.join(DATA_DIR, "candidates.json");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

// ข้อมูลเริ่มต้น
const INITIAL_CANDIDATES = [
  { id: 101, username: "somchai_th", name: "สมชาย ใจดี",     role: "candidate", country: "Thailand" },
  { id: 102, username: "tanaka_jp",  name: "Hiroshi Tanaka", role: "candidate", country: "Japan"    },
  { id: 103, username: "kim_kr",     name: "Ji-ho Kim",      role: "judge",     country: "Korea"    }
];

const INITIAL_TASKS = [
  { id: 1, title: "Build REST API",     time_limit_minutes: 180, max_score: 100 },
  { id: 2, title: "Database Design",    time_limit_minutes: 120, max_score: 100 },
  { id: 3, title: "Security Hardening", time_limit_minutes: 90,  max_score: 100 }
];

async function setup() {
  console.log("=== WSA2026: Initializing Data Manager ===\n");

  // 1. สร้างโฟลเดอร์
  await fs.mkdir(DATA_DIR,   { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  console.log("📁 Directories ready");

  // 2. สร้างไฟล์เริ่มต้น (ถ้ายังไม่มี)
  try {
    await fs.access(CANDIDATES_FILE);
    console.log("📄 candidates.json already exists");
  } catch {
    await fs.writeFile(CANDIDATES_FILE, JSON.stringify(INITIAL_CANDIDATES, null, 2));
    console.log("📄 Created candidates.json");
  }

  try {
    await fs.access(path.join(DATA_DIR, "tasks.json"));
  } catch {
    await fs.writeFile(
      path.join(DATA_DIR, "tasks.json"),
      JSON.stringify(INITIAL_TASKS, null, 2)
    );
    console.log("📄 Created tasks.json");
  }

  // 3. อ่านข้อมูลปัจจุบัน
  const raw = await fs.readFile(CANDIDATES_FILE, "utf-8");
  const candidates = JSON.parse(raw);
  console.log(`\n👥 Candidates loaded: ${candidates.length}`);
  candidates.forEach(c => {
    console.log(`   [${c.id}] ${c.name} (${c.country})`);
  });
}

async function addSubmission(candidateId, taskId, submissionUrl) {
  let submissions = [];

  // อ่าน submissions ที่มีอยู่
  try {
    const raw = await fs.readFile(SUBMISSIONS_FILE, "utf-8");
    submissions = JSON.parse(raw);
  } catch {
    // ไฟล์ยังไม่มี — เริ่มด้วย array ว่าง
  }

  // เพิ่ม submission ใหม่
  const newSubmission = {
    id: submissions.length + 1,
    candidate_id: candidateId,
    task_id: taskId,
    submission_url: submissionUrl,
    submitted_at: new Date().toISOString(),
    score: null,
    status: "pending"
  };

  submissions.push(newSubmission);
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));

  console.log(`\n✅ Submission #${newSubmission.id} added:`);
  console.log(`   Candidate: #${candidateId} | Task: #${taskId}`);
  console.log(`   Status: ${newSubmission.status}`);
}

async function createBackup() {
  try {
    await fs.access(SUBMISSIONS_FILE);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = path.join(BACKUP_DIR, `submissions-${ts}.json`);
    await fs.copyFile(SUBMISSIONS_FILE, dest);
    console.log(`\n💾 Backup created: ${path.basename(dest)}`);
  } catch {
    console.log("\n⚠️  No submissions to backup yet");
  }
}

// รันทั้งหมด
async function main() {
  await setup();
  await addSubmission(101, 1, "https://github.com/wsa2026/team-th/submission-t1");
  await addSubmission(102, 1, "https://github.com/wsa2026/team-jp/submission-t1");
  await createBackup();
  console.log("\n🏆 WSA2026 Data Manager ready!");
}

main().catch(console.error);
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เขียนฟังก์ชัน `updateScore(submissionId, score)` ที่:
  1. อ่านไฟล์ `submissions.json`
  2. ค้นหา submission ที่มี `id` ตรงกัน
  3. อัปเดต `score` และเปลี่ยน `status` เป็น `"scored"`
  4. เขียนกลับลงไฟล์

::: details 💡 คำใบ้ (Hint)
- ใช้ `JSON.parse()` หลังอ่านไฟล์
- ใช้ `submissions.find(s => s.id === submissionId)` ค้นหา
- อย่าลืม `JSON.stringify(data, null, 2)` ก่อน `writeFile`
- ตรวจสอบว่าเจอ submission จริงก่อนอัปเดต (ถ้าไม่เจอให้ throw Error)

```javascript
async function updateScore(submissionId, score) {
  const raw = await fs.readFile(SUBMISSIONS_FILE, "utf-8");
  const submissions = JSON.parse(raw);

  const submission = submissions.find(s => s.id === submissionId);
  if (!submission) throw new Error(`Submission #${submissionId} not found`);

  submission.score = score;
  submission.status = "scored";

  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
  console.log(`✅ Submission #${submissionId} scored: ${score}`);
}
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

### Challenge: WSA2026 Auto-Archiver

สร้างโปรแกรม `archiver.js` ที่:

1. อ่าน `submissions.json`
2. แยก submissions ที่ `status === "scored"` ออกมา
3. สร้างไฟล์ `data/archived/scored-YYYY-MM-DD.json` เก็บ submissions ที่ scored แล้ว
4. ลบ submissions ที่ archived ออกจากไฟล์หลัก (เหลือแต่ `pending`)
5. แสดงสรุป: "Archived N submissions, N pending remain"

**Bonus:** ถ้า archived ไฟล์นั้นมีอยู่แล้ว ให้ **merge** แทนที่จะเขียนทับ

::: details 💡 คำใบ้ (Hint)
```javascript
const today = new Date().toISOString().split("T")[0]; // "2026-05-07"
const archiveFile = path.join("data", "archived", `scored-${today}.json`);

// อ่านข้อมูลที่ archived ไว้ก่อน (ถ้ามี)
let existingArchive = [];
try {
  const raw = await fs.readFile(archiveFile, "utf-8");
  existingArchive = JSON.parse(raw);
} catch { /* ไม่มีไฟล์เก่า */ }
```
:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** `fs.writeFile()` และ `fs.appendFile()` ต่างกันอย่างไร?
**แนวคำตอบ:** `writeFile` เขียนทับไฟล์ทั้งหมด (overwrite) ถ้าไฟล์มีอยู่แล้ว ส่วน `appendFile` ต่อข้อมูลท้ายไฟล์โดยไม่ลบของเดิม เหมาะสำหรับ log file

**คำถาม 2:** ทำไมต้องใช้ `{ recursive: true }` เวลาเรียก `fs.mkdir()`?
**แนวคำตอบ:** เพราะถ้าไม่ใส่ และโฟลเดอร์แม่ยังไม่มีอยู่ จะเกิด Error เช่น `mkdir("a/b/c")` โดยไม่มีโฟลเดอร์ `a` จะล้มเหลว แต่ถ้าใส่ `recursive: true` จะสร้างทุกชั้นให้อัตโนมัติ

**คำถาม 3:** ใช้ `fs.access()` เพื่ออะไร? แตกต่างจากการใช้ `try/catch` ในการอ่านไฟล์ตรงๆ อย่างไร?
**แนวคำตอบ:** `fs.access()` ตรวจสอบว่าไฟล์มีอยู่จริงและมีสิทธิ์เข้าถึงได้ โดยไม่ต้องอ่านเนื้อหาจริง (เบากว่า) เหมาะใช้ตรวจก่อน copy หรือ backup เพื่อป้องกัน Error ที่ไม่คาดคิด

**คำถาม 4:** ทำไมการ parse JSON ควรอยู่ใน try/catch เสมอ?
**แนวคำตอบ:** เพราะถ้าไฟล์ JSON ถูกเขียนผิดรูปแบบ (เช่น มี trailing comma, ถูก truncate กลางคัน) `JSON.parse()` จะ throw SyntaxError และทำให้โปรแกรมพัง การใส่ try/catch จะทำให้จัดการ error ได้อย่างสง่างาม

:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> - **File System (fs):** Module จัดการไฟล์ของ Node.js
> - **Blocking (Sync):** การทำงานที่หยุดรอจนกว่าจะเสร็จ (เช่น `readFileSync`)
> - **Non-Blocking (Async):** การทำงานที่ไม่หยุดรอ (เช่น `readFile`)
> - **`mkdir -p` (Recursive):** การสร้างโฟลเดอร์ซ้อนกันหลายชั้นในรวดเดียว
> - **Metadata:** ข้อมูลเกี่ยวกับไฟล์ (เช่น ขนาด, วันที่สร้าง) หาได้จาก `fs.stat`
> - **ENOENT:** Error code ที่แปลว่า "No such file or directory"
> - **Buffer:** รูปแบบข้อมูลดิบ (Binary) เวลาอ่านไฟล์โดยไม่ระบุ encoding

👉 **[ไปต่อ: 2.3 - Buffers & Streams](/node/02-03-buffers-streams)**
