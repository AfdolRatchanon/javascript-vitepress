# Node.js Architecture 🖥️

> 💡 **เป้าหมาย:** ทำความเข้าใจว่า Node.js คืออะไร — ตั้งแต่ V8 Engine, libuv, Event Loop ไปจนถึงวิธีที่ JavaScript ทำงานแบบ Non-blocking ใน Server สำหรับระบบ WSA2026 Test Submission Management System เราจำเป็นต้องเข้าใจสถาปัตยกรรม Node.js เพื่อออกแบบ API ที่รับ Submission พร้อมกันได้หลายร้อยคนโดยไม่ค้าง

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### JavaScript Runtime คืออะไร?

**Runtime** คือ **สภาพแวดล้อมที่ให้โค้ดทำงานได้** เหมือนเวทีที่นักแสดง (JavaScript) ขึ้นไปแสดง

ก่อนมี Node.js → JavaScript ทำงานได้แค่ใน Browser เท่านั้น
หลังมี Node.js → JavaScript ทำงานได้บน Server, Terminal, Desktop ทุกที่!

```
+---------------------------+       +---------------------------+
|        BROWSER            |       |         NODE.JS           |
|                           |       |                           |
|  JavaScript Code          |       |  JavaScript Code          |
|         |                 |       |         |                 |
|         v                 |       |         v                 |
|     V8 Engine             |       |     V8 Engine             |
|         |                 |       |         |                 |
|         v                 |       |         v                 |
|  Browser APIs             |       |  Node.js APIs             |
|  (DOM, window, fetch)     |       |  (fs, http, path, os)     |
|         |                 |       |         |                 |
|         v                 |       |         v                 |
|  Web Page UI              |       |  Server / CLI / API       |
+---------------------------+       +---------------------------+
```

### V8 Engine — หัวใจของ Node.js

**V8** คือ JavaScript Engine ที่ Google สร้างสำหรับ Chrome ทำหน้าที่แปลง JavaScript ให้เป็น Machine Code ที่ CPU เข้าใจได้

```
JavaScript Source Code
        |
        v
  +------------+
  |  Parsing   |  --> แปลง Code เป็น AST (Abstract Syntax Tree)
  +------------+
        |
        v
  +------------+
  | Ignition   |  --> Interpreter: แปลเป็น Bytecode ก่อน
  | (Bytecode) |
  +------------+
        |
        v
  +------------+
  | TurboFan   |  --> JIT Compiler: แปลเป็น Machine Code (เร็วมาก!)
  | (Machine   |
  |   Code)    |
  +------------+
        |
        v
     CPU ประมวลผล
```

**ทำไม V8 เร็ว?**
- ใช้ **JIT Compilation** (Just-In-Time) — แปลโค้ดขณะทำงาน ไม่ต้องรอแปลทั้งหมดก่อน
- **Hidden Classes** — เพิ่มประสิทธิภาพการเข้าถึง Object Property
- **Garbage Collection** — จัดการหน่วยความจำอัตโนมัติ
- เขียนด้วย **C++** — ประสิทธิภาพสูง

### libuv — ส่วนที่ทำให้ Node.js ไม่ blocking

**libuv** คือ Library ที่เขียนด้วย C ทำหน้าที่จัดการ **Asynchronous I/O** — นี่คือสิ่งที่ทำให้ Node.js แตกต่างจาก Runtime อื่น!

```
+--------------------------------------------------+
|                   NODE.JS                        |
|                                                  |
|  JavaScript Code (Single Thread)                 |
|         |                                        |
|         v                                        |
|  +------+------+                                 |
|  |  V8 Engine  |  <-- รัน JS Code                |
|  +------+------+                                 |
|         |                                        |
|         v                                        |
|  +------+------+     +--------------------+      |
|  | Node.js API |---->|      libuv         |      |
|  | (fs, http)  |     |                    |      |
|  +-------------+     |  Thread Pool (4)   |      |
|                       |  Event Loop        |      |
|                       |  OS Async I/O      |      |
|                       +--------------------+      |
+--------------------------------------------------+
```

libuv ทำงาน 2 ส่วนหลัก:
1. **Event Loop** — วนรับและส่ง callback งานที่เสร็จแล้ว
2. **Thread Pool** (4 threads default) — ทำงาน CPU-intensive หรือ File I/O ในเบื้องหลัง

### Event Loop — หัวใจการทำงาน Non-blocking

Node.js ใช้ **Single Thread** แต่ทำงานพร้อมกันได้เพราะ **Event Loop**

```
                    +------------------+
                    |  JavaScript Code |
                    |  (Call Stack)    |
                    +--------+---------+
                             |
            +----------------v-----------------+
            |           EVENT LOOP             |
            |                                  |
            |  Phase 1: timers                 |
            |  --> setTimeout, setInterval     |
            |                                  |
            |  Phase 2: pending callbacks      |
            |  --> I/O errors                  |
            |                                  |
            |  Phase 3: idle, prepare          |
            |  --> internal use                |
            |                                  |
            |  Phase 4: poll                   |
            |  --> รับ I/O events ใหม่ (**หลัก**) |
            |                                  |
            |  Phase 5: check                  |
            |  --> setImmediate callbacks      |
            |                                  |
            |  Phase 6: close callbacks        |
            |  --> socket.on('close', ...)     |
            +------------------+---------------+
                               |
               +---------------v--------------+
               |  Microtask Queue             |
               |  --> Promise.then()          |
               |  --> process.nextTick()      |
               |  (รันก่อน Phase ถัดไปเสมอ!) |
               +------------------------------+
```

### Call Stack, Callback Queue, Microtask Queue

**ลำดับการทำงาน:**

```
[1] Call Stack ทำงานก่อน (Synchronous Code)
       |
       v
[2] Microtask Queue (process.nextTick, Promise.then)
       |
       v
[3] Callback Queue / Event Loop Phases (setTimeout, I/O)
```

**ตัวอย่างลำดับการทำงาน:**

```
console.log("A");                    // [1] Call Stack --> พิมพ์ A

setTimeout(() => {
  console.log("B");                  // [3] Timer Queue --> พิมพ์ B ทีหลัง
}, 0);

Promise.resolve().then(() => {
  console.log("C");                  // [2] Microtask Queue --> พิมพ์ C ก่อน B
});

console.log("D");                    // [1] Call Stack --> พิมพ์ D

// Output: A, D, C, B
```

### Browser vs Node.js

ทั้งสองรัน JavaScript ได้ แต่ **สิ่งที่ทำได้ต่างกันมาก**:

| Feature | Browser | Node.js |
|:--------|:--------|:--------|
| JavaScript Engine | V8 (Chrome), SpiderMonkey (Firefox) | V8 |
| DOM (document, window) | มี | ไม่มี |
| File System (fs) | ไม่ได้ | ได้ |
| HTTP Server | ไม่ได้ | ได้ |
| Database | ต้องผ่าน API | เชื่อมตรงได้ |
| alert(), confirm() | มี | ไม่มี |
| process.env | ไม่มี | มี |
| require() / CommonJS | ไม่รองรับ | รองรับ |
| import / ESM | รองรับ | รองรับ |
| \_\_dirname, \_\_filename | ไม่มี | มี |

### Node.js REPL — วิธีใช้

**REPL** ย่อมาจาก **Read-Eval-Print Loop** คือ Interactive Mode สำหรับทดลองโค้ดทันที เหมือน Console ใน Browser DevTools

```bash
# เปิด REPL
node

# ตัวอย่างการใช้งาน
> 1 + 1
2
> "Hello WSA" + "2026"
'Hello WSA2026'
> [1, 2, 3].map(x => x * 2)
[ 2, 4, 6 ]
> .help          # ดูคำสั่ง REPL
> .exit          # ออกจาก REPL
```

คำสั่ง REPL พิเศษ:
- `.help` — แสดงคำสั่งทั้งหมด
- `.exit` — ออกจาก REPL
- `.break` — ยกเลิก Multi-line input
- `.load <file>` — โหลดไฟล์เข้า REPL
- `Ctrl+C` — ยกเลิก / ออก

### ไฟล์แรก: node hello.js

สร้างไฟล์ `hello.js`:

```javascript
// hello.js
const message = "สวัสดีจาก Node.js!";
console.log(message);

// สิ่งที่ Browser ไม่มี แต่ Node.js มี
console.log("Node version:", process.version);
console.log("Platform:", process.platform);
console.log("Current directory:", process.cwd());
```

รันในTerminal:
```bash
node hello.js
```

Output:
```
สวัสดีจาก Node.js!
Node version: v20.11.0
Platform: win32
Current directory: C:\projects\wsa2026
```

### Global Objects ใน Node.js

| Global | คืออะไร | เทียบ Browser |
|:-------|:--------|:-------------|
| `global` | Global scope | `window` |
| `process` | ข้อมูล Process ปัจจุบัน | `navigator` (คล้ายๆ) |
| `__dirname` | โฟลเดอร์ของไฟล์ | ไม่มี |
| `__filename` | Path เต็มของไฟล์ | ไม่มี |
| `require()` | Import Module (CommonJS) | `import` (ESM) |
| `Buffer` | ข้อมูล Binary | `Blob` / `ArrayBuffer` |
| `setTimeout()` | Timer | เหมือนกัน |
| `setImmediate()` | รันหลัง I/O events | ไม่มีใน Browser |
| `process.nextTick()` | รันก่อน Microtask อื่น | ไม่มีใน Browser |

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

สร้าง CLI Script ที่แสดงข้อมูล Candidate ของระบบ WSA2026 จาก command-line arguments

::: code-group
```js [candidate-info.js]
// candidate-info.js
// WSA2026 Test Submission Management System
// ใช้: node candidate-info.js <candidateId> <name> <country>

// ==========================================
// 1. รับ Arguments จาก Command Line
// ==========================================
const args = process.argv.slice(2); // ตัด argv[0] (node) และ argv[1] (ไฟล์) ออก

const candidateId = args[0];
const name        = args[1];
const country     = args[2];
const role        = args[3] || "candidate"; // default role

// ==========================================
// 2. แสดงข้อมูล System Environment
// ==========================================
function showSystemInfo() {
  console.log("===========================================");
  console.log("  WSA2026 Test Submission Management System");
  console.log("===========================================");
  console.log(`  Node.js Version : ${process.version}`);
  console.log(`  Platform        : ${process.platform}`);
  console.log(`  Architecture    : ${process.arch}`);
  console.log(`  Working Dir     : ${process.cwd()}`);
  console.log("===========================================");
}

// ==========================================
// 3. แสดงข้อมูล Candidate
// ==========================================
function showCandidateInfo(id, candidateName, candidateCountry, candidateRole) {
  const validRoles = ["candidate", "judge", "manager"];

  if (!validRoles.includes(candidateRole)) {
    console.error(`ERROR: role "${candidateRole}" ไม่ถูกต้อง`);
    console.error(`       ต้องเป็น: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  console.log("\n--- Candidate Information ---");
  console.log(`  ID      : ${id}`);
  console.log(`  Name    : ${candidateName}`);
  console.log(`  Country : ${candidateCountry}`);
  console.log(`  Role    : ${candidateRole.toUpperCase()}`);

  // แสดงข้อมูลต่างกันตาม Role
  if (candidateRole === "candidate") {
    console.log(`  Access  : Submit tasks, View own scores`);
  } else if (candidateRole === "judge") {
    console.log(`  Access  : Score submissions, View all candidates`);
  } else if (candidateRole === "manager") {
    console.log(`  Access  : Full system access, Manage competition`);
  }

  console.log("----------------------------\n");
}

// ==========================================
// 4. แสดง Usage ถ้าไม่ใส่ Arguments
// ==========================================
function showUsage() {
  console.log("Usage:");
  console.log("  node candidate-info.js <id> <name> <country> [role]");
  console.log("");
  console.log("Arguments:");
  console.log("  id       - Candidate ID (เช่น C001)");
  console.log("  name     - ชื่อ Candidate");
  console.log("  country  - ประเทศ (เช่น Thailand)");
  console.log("  role     - บทบาท: candidate | judge | manager (default: candidate)");
  console.log("");
  console.log("Examples:");
  console.log("  node candidate-info.js C001 Somchai Thailand candidate");
  console.log("  node candidate-info.js J001 Tanaka Japan judge");
  console.log("  node candidate-info.js M001 Chen China manager");
}

// ==========================================
// 5. Main Logic
// ==========================================
showSystemInfo();

if (!candidateId || !name || !country) {
  console.error("ERROR: กรุณาใส่ข้อมูลให้ครบ");
  console.log("");
  showUsage();
  process.exit(1); // Exit Code 1 = Error
}

showCandidateInfo(candidateId, name, country, role);

// แสดง process uptime (บอกว่า script ทำงานมานานแค่ไหน)
console.log(`Script ran in ${process.uptime().toFixed(3)} seconds`);
process.exit(0); // Exit Code 0 = Success
```
:::

ทดสอบรัน:
```bash
# รันปกติ
node candidate-info.js C001 Somchai Thailand candidate

# รัน judge
node candidate-info.js J001 Tanaka Japan judge

# ไม่ใส่ Arguments
node candidate-info.js
```

ตัวอย่าง Output:
```
===========================================
  WSA2026 Test Submission Management System
===========================================
  Node.js Version : v20.11.0
  Platform        : win32
  Architecture    : x64
  Working Dir     : C:\projects\wsa2026
===========================================

--- Candidate Information ---
  ID      : C001
  Name    : Somchai
  Country : Thailand
  Role    : CANDIDATE
  Access  : Submit tasks, View own scores
----------------------------

Script ran in 0.012 seconds
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สร้างไฟล์ `task-info.js` ที่รับ task ID และ time limit (นาที) จาก `process.argv` แล้วแสดงข้อมูล Task ของ WSA2026 พร้อม validation ว่า time limit ต้องเป็นตัวเลขบวก ถ้า time limit เกิน 120 นาที ให้แสดง warning และถ้าไม่ใส่ Arguments ให้แสดง usage แล้วจบด้วย `process.exit(1)`

::: details 💡 คำใบ้ (Hint)
- ใช้ `process.argv.slice(2)` เพื่อรับเฉพาะ arguments ที่ต้องการ
- ใช้ `Number()` หรือ `parseInt()` แปลง String เป็น Number และ `isNaN()` เช็คว่าเป็นตัวเลขหรือไม่
- ใช้ `process.exit(0)` เมื่อสำเร็จ และ `process.exit(1)` เมื่อมี Error — สำคัญมากสำหรับ automation scripts
:::

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้างไฟล์ `submission-status.js` ที่จำลอง Event Loop ของ WSA2026 — เมื่อรัน ให้แสดงข้อความ "Checking submission..." ทันที จากนั้นใช้ `setTimeout` จำลองการ delay 2 วินาที (เหมือน query database) แล้วแสดงผล "Submission found: score = 85, status = approved" และใช้ `Promise.resolve().then()` แทรกข้อความ "Validating token..." ระหว่างกลาง เพื่อสาธิตลำดับ Call Stack → Microtask → Timer

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** Node.js ประกอบด้วย Component หลักอะไรบ้าง และแต่ละ Component ทำหน้าที่อะไร?

**แนวคำตอบ:** Node.js ประกอบด้วย 3 ส่วนหลัก: (1) **V8 Engine** — แปลง JavaScript เป็น Machine Code โดยใช้ JIT Compilation (2) **libuv** — Library C ที่จัดการ Event Loop และ Asynchronous I/O รวมถึง Thread Pool สำหรับงาน blocking (3) **Node.js Core APIs** — เช่น `fs`, `http`, `path` ที่เพิ่มความสามารถให้ JavaScript ทำงานนอก Browser ได้

**คำถาม 2:** Event Loop ทำงานอย่างไร และทำไมถึงทำให้ Node.js จัดการ Concurrent Requests ได้ดีทั้งที่เป็น Single Thread?

**แนวคำตอบ:** Event Loop วนตรวจ Queue หลายระดับ — เมื่อ JavaScript ส่งคำขอ I/O (เช่น query database) libuv จะรับไปทำในเบื้องหลังโดย Node.js ไม่ต้องรอ Call Stack ว่างก็รับคำขอใหม่ได้ต่อเนื่อง เมื่องานเสร็จ Callback จะถูกใส่เข้า Queue แล้ว Event Loop นำไปรัน ทำให้ Node.js รับ Request ได้พร้อมกันหลายพันคำขอโดยไม่ block

**คำถาม 3:** `process.argv` คืออะไร และทำไม arguments จริงถึงเริ่มที่ index 2 ไม่ใช่ index 0?

**แนวคำตอบ:** `process.argv` เป็น Array ที่เก็บ command-line arguments ทั้งหมด โดย `argv[0]` = path ของ Node.js executable, `argv[1]` = path ของ script ที่รัน, และ `argv[2]` เป็นต้นไปคือ arguments ที่ผู้ใช้พิมพ์จริง — ดังนั้นต้องใช้ `process.argv.slice(2)` หรือเริ่มที่ index 2 เสมอ

:::

👉 **[ไปต่อ: 1.2 - npm & Packages](/node/01-02-npm-and-packages)**
