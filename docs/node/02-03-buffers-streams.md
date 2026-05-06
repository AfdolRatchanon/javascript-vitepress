# Module 2.3: Buffers & Streams 🌊

> 💡 **เป้าหมาย:** เข้าใจหลักการทำงานของ Buffer และ Stream ใน Node.js รู้จักวิธีจัดการข้อมูลขนาดใหญ่โดยไม่กิน RAM และนำไปใช้กับระบบ WSA2026 เพื่อ stream ไฟล์ log ขนาดใหญ่ของ submissions ทั้งหมดออกมาได้อย่างมีประสิทธิภาพ

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Buffer คืออะไร?

**Buffer** คือพื้นที่ RAM ชั่วคราวที่ Node.js จัดสรรไว้เก็บข้อมูล Binary (ไม่ใช่ String)
มันอยู่นอก V8 JavaScript Engine (ดูแลโดย C++ โดยตรง) ทำให้เร็วและประหยัดหน่วยความจำ

> **💡 Analogy:**
> Buffer เปรียบเหมือน **"ถาดรับอาหาร"** ในโรงอาหาร
> - รับอาหาร (ข้อมูล binary) มาวางพักก่อน
> - แล้วค่อยส่งต่อไปยังโต๊ะ (โปรแกรม)
> - ถ้าไม่มีถาด — ก็จะถือแค่มือเดียว ช้ามาก!

```
  ข้อมูล Binary ใน Memory:
  +----+----+----+----+----+----+----+
  | 48 | 65 | 6C | 6C | 6F | 21 | 0A |
  +----+----+----+----+----+----+----+
     H    e    l    l    o    !   \n

  Buffer.from("Hello!\n", "utf-8") → <Buffer 48 65 6c 6c 6f 21 0a>
```

### Stream คืออะไร?

**Stream** คือการส่งข้อมูลเป็น "ท่อ" แบ่งออกเป็น chunk เล็กๆ
แทนที่จะโหลดทั้งไฟล์เข้า RAM ทีเดียว

```
  ❌ แบบเดิม (readFile ทั้งก้อน):
  [File 500MB] ----[โหลดทั้งหมด]----> [RAM: 500MB !!] --> Process

  ✅ แบบ Stream (chunk by chunk):
  [File 500MB]
      |
      |--chunk 1 (64KB)--> [RAM: 64KB] --> Process
      |--chunk 2 (64KB)--> [RAM: 64KB] --> Process
      |--chunk 3 (64KB)--> [RAM: 64KB] --> Process
      ...
  RAM ใช้แค่ 64KB ตลอดเวลา!
```

### ประเภทของ Stream

| ประเภท | คืออะไร | ตัวอย่าง |
|:---|:---|:---|
| **Readable** | อ่านข้อมูล (ต้นทาง) | `fs.createReadStream()`, `req` |
| **Writable** | เขียนข้อมูล (ปลายทาง) | `fs.createWriteStream()`, `res` |
| **Duplex** | อ่านและเขียนได้ | `net.Socket` |
| **Transform** | แปลงข้อมูลระหว่างทาง | `zlib.createGzip()` |

```
  Stream Pipeline (ท่อต่อกัน):
  [Readable] --pipe--> [Transform] --pipe--> [Writable]

  ตัวอย่าง WSA2026: stream log file
  [submissions.log] --pipe--> [uppercase transform] --pipe--> [report.txt]
       Readable                  Transform                   Writable
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### 1. Buffer พื้นฐาน

::: code-group
```js [buffer-basics.js]
// === Buffer.alloc() — จองพื้นที่เปล่า ===
const emptyBuf = Buffer.alloc(10);
console.log("alloc(10):", emptyBuf);
// <Buffer 00 00 00 00 00 00 00 00 00 00>

// === Buffer.from() — สร้างจาก String ===
const textBuf = Buffer.from("WSA2026", "utf-8");
console.log("from('WSA2026'):", textBuf);
// <Buffer 57 53 41 32 30 32 36>

// === toString() — แปลงกลับเป็น String ===
console.log("toString():", textBuf.toString("utf-8"));   // WSA2026
console.log("toString hex:", textBuf.toString("hex"));  // 57534131...
console.log("toString b64:", textBuf.toString("base64")); // V1NBMjAyNg==

// === ขนาด Buffer ===
console.log("byteLength:", Buffer.byteLength("WSA2026", "utf-8")); // 7
console.log("buf.length:", textBuf.length); // 7

// === เปรียบเทียบ Buffer ===
const buf1 = Buffer.from("abc");
const buf2 = Buffer.from("abc");
const buf3 = Buffer.from("xyz");
console.log("buf1 === buf2:", buf1.equals(buf2)); // true
console.log("buf1 === buf3:", buf1.equals(buf3)); // false
```
:::

### 2. Buffer กับข้อมูล WSA2026

::: code-group
```js [buffer-wsa2026.js]
// สร้าง Buffer จากข้อมูล submission
const submission = {
  id: 1,
  candidate_id: 101,
  task_id: 1,
  score: 92,
  status: "scored"
};

// แปลง Object เป็น JSON แล้วเป็น Buffer
const jsonString = JSON.stringify(submission);
const buf = Buffer.from(jsonString, "utf-8");

console.log("=== WSA2026 Submission Buffer ===");
console.log("Original JSON :", jsonString);
console.log("Buffer length :", buf.length, "bytes");
console.log("Base64 encoded:", buf.toString("base64"));

// แปลงกลับจาก Base64
const decoded = Buffer.from(buf.toString("base64"), "base64");
const restored = JSON.parse(decoded.toString("utf-8"));
console.log("\nDecoded back  :", restored);
console.log("Score         :", restored.score); // 92
```
:::

### 3. ReadStream — อ่านไฟล์ log แบบ Streaming

::: code-group
```js [read-stream.js]
const fs   = require("fs");
const path = require("path");

// สมมติมีไฟล์ submissions-all.log ขนาดใหญ่
// เราจะ stream อ่านทีละ chunk โดยไม่กิน RAM

const logFile = path.join(__dirname, "data", "submissions-all.log");

const readStream = fs.createReadStream(logFile, {
  highWaterMark: 16 * 1024, // chunk size = 16KB
  encoding: "utf-8"
});

let chunkCount = 0;
let totalBytes = 0;
let lineCount  = 0;

readStream.on("data", (chunk) => {
  chunkCount++;
  totalBytes += Buffer.byteLength(chunk);
  // นับจำนวนบรรทัด submission records
  lineCount += (chunk.match(/\n/g) || []).length;

  process.stdout.write(`\r📦 Chunks: ${chunkCount} | Lines: ${lineCount} | Total: ${(totalBytes / 1024).toFixed(1)} KB`);
});

readStream.on("end", () => {
  console.log("\n✅ Stream complete!");
  console.log(`   Total chunks : ${chunkCount}`);
  console.log(`   Total lines  : ${lineCount}`);
  console.log(`   Total size   : ${(totalBytes / 1024).toFixed(2)} KB`);
});

readStream.on("error", (err) => {
  console.error("\n❌ Stream error:", err.message);
});
```
:::

### 4. WriteStream — เขียนรายงานแบบ Streaming

::: code-group
```js [write-stream.js]
const fs   = require("fs");
const path = require("path");

const reportFile = path.join(__dirname, "data", "submission-report.txt");

const writeStream = fs.createWriteStream(reportFile, {
  flags: "w",      // 'w' = เขียนใหม่, 'a' = ต่อท้าย
  encoding: "utf-8"
});

// Mock submissions data
const submissions = [
  { id: 1, candidate_id: 101, task_id: 1, score: 92, status: "scored"  },
  { id: 2, candidate_id: 102, task_id: 1, score: 85, status: "scored"  },
  { id: 3, candidate_id: 103, task_id: 2, score: null, status: "pending" },
  { id: 4, candidate_id: 101, task_id: 2, score: 78, status: "scored"  }
];

// เขียน header
writeStream.write("=== WSA2026 SUBMISSION REPORT ===\n");
writeStream.write(`Generated: ${new Date().toISOString()}\n`);
writeStream.write("=".repeat(40) + "\n\n");

// เขียนทีละแถว (เหมือนส่ง chunk)
for (const sub of submissions) {
  const line = `[#${sub.id}] Candidate:${sub.candidate_id} | Task:${sub.task_id} | Score:${sub.score ?? "N/A"} | ${sub.status.toUpperCase()}\n`;
  writeStream.write(line);
}

// สรุป
const scored  = submissions.filter(s => s.status === "scored").length;
const pending = submissions.filter(s => s.status === "pending").length;
writeStream.write(`\nTotal Scored: ${scored} | Pending: ${pending}\n`);

// ปิด Stream
writeStream.end(() => {
  console.log(`✅ Report written to ${path.basename(reportFile)}`);
});

writeStream.on("error", (err) => {
  console.error("❌ Write error:", err.message);
});
```
:::

### 5. pipe() — ต่อท่อ Readable → Writable

::: code-group
```js [pipe-demo.js]
const fs   = require("fs");
const path = require("path");

// คัดลอกไฟล์ log ขนาดใหญ่ด้วย pipe
const src  = path.join(__dirname, "data", "submissions-all.log");
const dest = path.join(__dirname, "data", "submissions-copy.log");

const reader = fs.createReadStream(src);
const writer = fs.createWriteStream(dest);

console.log("📋 Copying submissions log...");

// pipe จัดการ backpressure ให้อัตโนมัติ
reader.pipe(writer);

writer.on("finish", () => {
  console.log("✅ File copied successfully via pipe!");
});

reader.on("error", err => console.error("❌ Read error:", err.message));
writer.on("error", err => console.error("❌ Write error:", err.message));
```
:::

### 6. Transform Stream — แปลงข้อมูลระหว่างทาง

::: code-group
```js [transform-stream.js]
const fs        = require("fs");
const { Transform } = require("stream");
const path      = require("path");

// สร้าง Transform Stream สำหรับ filter submissions ที่ scored แล้ว
class ScoredFilter extends Transform {
  constructor(options) {
    super({ ...options, readableObjectMode: false, writableObjectMode: false });
    this._buffer = "";
  }

  _transform(chunk, encoding, callback) {
    this._buffer += chunk.toString();
    const lines = this._buffer.split("\n");
    this._buffer = lines.pop(); // เก็บบรรทัดที่ยังไม่สมบูรณ์ไว้

    for (const line of lines) {
      // กรองเฉพาะบรรทัดที่มี "SCORED"
      if (line.includes("SCORED")) {
        this.push(line + "\n");
      }
    }
    callback();
  }

  _flush(callback) {
    // จัดการบรรทัดสุดท้ายที่ค้างอยู่
    if (this._buffer && this._buffer.includes("SCORED")) {
      this.push(this._buffer + "\n");
    }
    callback();
  }
}

// ตัวอย่างข้อมูล log
const logContent = [
  "[2026-05-01] id=1 candidate=101 task=1 status=SCORED score=92",
  "[2026-05-01] id=2 candidate=102 task=1 status=PENDING",
  "[2026-05-01] id=3 candidate=103 task=2 status=SCORED score=88",
  "[2026-05-01] id=4 candidate=101 task=2 status=PENDING",
  "[2026-05-01] id=5 candidate=102 task=2 status=SCORED score=75"
].join("\n");

const { Readable } = require("stream");

// สร้าง Readable จาก string (จำลองไฟล์ขนาดใหญ่)
const readable = Readable.from(logContent);
const filter   = new ScoredFilter();
const writable = fs.createWriteStream(
  path.join(__dirname, "data", "scored-only.log")
);

console.log("🔍 Filtering scored submissions...");

readable
  .pipe(filter)
  .pipe(writable);

writable.on("finish", () => {
  console.log("✅ Scored-only log written to scored-only.log");
});
```
:::

### 7. Gzip Compression — บีบอัดไฟล์ด้วย Transform Stream

::: code-group
```js [compress-log.js]
const fs   = require("fs");
const zlib = require("zlib");
const path = require("path");

const src  = path.join(__dirname, "data", "submissions-all.log");
const dest = path.join(__dirname, "data", "submissions-all.log.gz");

const reader   = fs.createReadStream(src);
const gzip     = zlib.createGzip();       // Transform Stream: บีบอัด
const writer   = fs.createWriteStream(dest);

console.log("🗜️  Compressing WSA2026 log file...");

// Pipeline: อ่าน → Gzip → เขียน
reader.pipe(gzip).pipe(writer);

writer.on("finish", async () => {
  const { size: origSize } = fs.statSync(src);
  const { size: gzipSize  } = fs.statSync(dest);
  const ratio = ((1 - gzipSize / origSize) * 100).toFixed(1);

  console.log(`✅ Compression complete!`);
  console.log(`   Original : ${(origSize  / 1024).toFixed(2)} KB`);
  console.log(`   Compressed: ${(gzipSize  / 1024).toFixed(2)} KB`);
  console.log(`   Saved     : ${ratio}%`);
});
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เขียน Transform Stream ชื่อ `ScoreAnonymizer` ที่รับ log line ของ submission แล้ว:
  1. แทนที่ `candidate_id` ด้วย `***` เพื่อปกปิดข้อมูลส่วนตัว
  2. คงส่วน score และ status ไว้
  3. pipe ผลลัพธ์ไปเขียนเป็นไฟล์ `anonymous-report.log`

::: details 💡 คำใบ้ (Hint)
- สร้าง class ที่ extends `Transform`
- ใน `_transform()` ใช้ `chunk.toString().replace(/candidate_id=\d+/g, "candidate_id=***")`
- อย่าลืมเรียก `callback()` หลังจาก `this.push(transformed)`

```javascript
class ScoreAnonymizer extends Transform {
  _transform(chunk, encoding, callback) {
    const anonymized = chunk
      .toString()
      .replace(/candidate=\d+/g, "candidate=***");
    this.push(anonymized);
    callback();
  }
}
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

### Challenge: WSA2026 Live Log Streamer

สร้างโปรแกรม `live-log-streamer.js` ที่:

1. **สร้าง log ขนาดใหญ่ก่อน:** เขียน 10,000 submission records ลงไฟล์ `big-submissions.log` (ใช้ WriteStream)
2. **Stream อ่าน** ไฟล์นั้นกลับมา พร้อมแสดง progress bar แบบ real-time:
   ```
   ████████░░░░░░░░░░░░ 42% (4,200 / 10,000 lines)
   ```
3. **วิเคราะห์ระหว่างอ่าน:** นับ scored vs pending แบบไม่โหลดทั้งหมดเข้า RAM
4. **สรุปผล** เมื่อ stream จบ: ค่าเฉลี่ย score ของ submissions ที่ scored แล้ว

**Bonus:** เพิ่ม `--filter=scored` argument ใน CLI เพื่อ filter เฉพาะ scored submissions

::: details 💡 คำใบ้ (Hint)
```javascript
// สร้างข้อมูลจำลอง
for (let i = 1; i <= 10000; i++) {
  const status = Math.random() > 0.3 ? "SCORED" : "PENDING";
  const score  = status === "SCORED" ? Math.floor(Math.random() * 40) + 60 : "";
  writeStream.write(`id=${i} candidate=${100+i} task=${(i%3)+1} status=${status} score=${score}\n`);
}

// Progress bar
const percent = Math.floor((processed / totalLines) * 100);
const filled  = Math.floor(percent / 5);
const bar     = "█".repeat(filled) + "░".repeat(20 - filled);
process.stdout.write(`\r${bar} ${percent}%`);
```
:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** Buffer กับ String ต่างกันอย่างไร? เมื่อไหรควรใช้ Buffer?
**แนวคำตอบ:** String ใน JavaScript เก็บใน V8 Heap เป็น UTF-16 ส่วน Buffer เก็บใน C++ นอก V8 Heap เป็น raw bytes ควรใช้ Buffer เมื่อทำงานกับข้อมูล binary เช่น ไฟล์รูปภาพ, ไฟล์ binary, network protocol หรือข้อมูลที่ต้องการ encoding/decoding

**คำถาม 2:** Backpressure ใน Stream คืออะไร? `.pipe()` แก้ปัญหานี้ยังไง?
**แนวคำตอบ:** Backpressure คือสถานการณ์ที่ Readable ส่งข้อมูลเร็วกว่า Writable จะรับได้ ทำให้ข้อมูลค้างใน RAM `.pipe()` จัดการปัญหานี้โดยอัตโนมัติ — เมื่อ Writable เต็ม จะหยุด Readable ไว้ก่อน (pause) แล้วค่อย resume เมื่อพร้อม

**คำถาม 3:** Transform Stream ต่างจาก Duplex Stream อย่างไร?
**แนวคำตอบ:** Duplex Stream อ่านและเขียนอิสระจากกัน (เช่น TCP socket) ส่วน Transform Stream มีความสัมพันธ์กัน — ข้อมูลที่เขียนเข้าไปจะถูกแปลงแล้วออกมาจากฝั่ง readable (เช่น Gzip: รับข้อมูลปกติ → ส่งออกข้อมูลบีบอัด)

**คำถาม 4:** `highWaterMark` ใน Stream หมายความว่าอะไร? ตั้งค่าสูงหรือต่ำดีกว่า?
**แนวคำตอบ:** `highWaterMark` กำหนดขนาด chunk (buffer) ที่ stream จะสะสมไว้ก่อนหยุด ค่าสูง = ส่งข้อมูลน้อยครั้งแต่ RAM ใช้มาก, ค่าต่ำ = ส่งบ่อยครั้งแต่ RAM ใช้น้อย ปรับตามลักษณะงาน เช่น ไฟล์ใหญ่บน RAM น้อยควรตั้งค่าต่ำ

:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> - **Buffer:** พื้นที่ RAM นอก V8 สำหรับเก็บข้อมูล binary โดยตรง
> - **Stream:** การส่งข้อมูลเป็น chunk ต่อเนื่อง ไม่โหลดทีเดียว
> - **Readable Stream:** Stream สำหรับอ่านข้อมูล (เช่น `createReadStream`)
> - **Writable Stream:** Stream สำหรับเขียนข้อมูล (เช่น `createWriteStream`)
> - **Transform Stream:** Stream ที่แปลงข้อมูลระหว่างทาง (เช่น Gzip)
> - **pipe():** วิธีต่อ Stream หลายตัวเข้าด้วยกัน พร้อมจัดการ backpressure อัตโนมัติ
> - **Backpressure:** ปัญหาที่ผู้ส่งเร็วกว่าผู้รับ ทำให้ข้อมูลค้างใน buffer
> - **highWaterMark:** ขนาด chunk สูงสุดที่ stream จะรอสะสมก่อนส่ง
> - **Gzip:** รูปแบบการบีบอัดไฟล์ยอดนิยมใน Unix/Node.js

👉 **[ไปทำโปรเจกต์: Project — File Manager](/node/02-project-file-manager)**
