# 03-2: Path & Streams (จัดการ Path และข้อมูลขนาดใหญ่) 🛤️

> **"Absolute or Relative? The eternal question."**
> — *Developer's Dilemma*

ในบทนี้เราจะเจาะลึกเรื่องที่มักทำให้นักพัฒนาปวดหัว: **Path** (ที่อยู่ไฟล์) และ **Streams** (การจัดการข้อมูลมหาศาล)

---

## 1. Module `path` & ที่อยู่ของไฟล์ 🗺️

### 1.1 `__dirname` vs `process.cwd()`
ความสับสนอันดับ 1 ใน Node.js!

*   **`__dirname`**: ที่อยู่ของ **ไฟล์ปัจจุบัน** (Script นี้อยู่ที่ไหน?)
*   **`process.cwd()`**: ที่อยู่ของ **Terminal** (เราพิมพ์คำสั่ง `node` จากที่ไหน?)

> **💡 Analogy:**
> - `__dirname` = **"บ้านเกิด"** 🏠 (ไฟล์ถูกสร้างไว้ที่ไหน ก็อยู่ที่นั่นเสมอ)
> - `process.cwd()` = **"ที่ทำงาน"** 🏢 (เราเรียกใช้งานไฟล์จากที่ไหน)

```javascript
// ลองสร้างไฟล์ check-path.js แล้วรันจากคนละโฟลเดอร์ดู
console.log("📂 __dirname:", __dirname);
console.log("🏃 process.cwd():", process.cwd());
```

**⚠️ ข้อควรระวัง:** เวลาอ่านไฟล์ในโปรเจกต์ (เช่น config) **ให้ใช้ `path.join(__dirname, ...)` เสมอ** เพื่อให้หาไฟล์เจอไม่ว่าจะรันจากไหน!

### 1.2 `path.join()` vs `path.resolve()`

*   `path.join()`: เอาคำมาต่อกันเฉยๆ (ใส่ `/` ให้เอง)
*   `path.resolve()`: พยายามหา **Absolute Path** (Full Path จาก Root)

```javascript
const path = require("path");

path.join("a", "b", "c");        // "a/b/c"
path.resolve("a", "b", "c");     // "/Users/dolar/project/a/b/c"
```

---

## 2. Buffer — เจาะลึกข้อมูลดิบ 🔢

Buffer คือ Array ของตัวเลข (Byte) ที่ Node.js ใช้เก็บข้อมูล Binary

```javascript
// สร้าง Buffer 10 ช่อง (ว่างเปล่า)
const buf1 = Buffer.alloc(10); 

// สร้างจาก String (utf-8)
const buf2 = Buffer.from("Node.js");

console.log(buf2.toJSON()); 
// { type: 'Buffer', data: [ 78, 111, 100, 101, 46, 106, 115 ] }
```

**Memory Tip:** Buffer จอง RAM นอก V8 Heap (C++ managed) จึงทำงานเร็วมากสำหรับ I/O

---

## 3. Streams — จัดการข้อมูล Big Data 🌊

ถ้าต้องส่งวิดีโอ 10GB หรืออ่าน Logs 10 ล้านบรรทัด — **Stream คือทางรอดเดียว!**

### 3.1 `highWaterMark` (ขนาดถังตักน้ำ)
เรากำหนดขนาดของ "Chunk" ข้อมูลได้ (Default: 64KB)

```javascript
const fs = require("fs");

const readStream = fs.createReadStream("huge-file.txt", { 
    highWaterMark: 16 * 1024, // 16KB per chunk
    encoding: "utf-8" 
});
```

### 3.2 Stream Events (วงจรชีวิต) 🔄

| Event | เกิดขึ้นเมื่อ |
|:---|:---|
| `data` | มี Chunk ใหม่ส่งมาถึง |
| `end` | ส่งข้อมูลครบถ้วนแล้ว (จบ) |
| `error` | เกิดข้อผิดพลาด (เช่น ไฟล์หาย) |
| `finish` | (สำหรับ WriteStream) เขียนเสร็จหมดแล้ว |

```javascript
let count = 0;

readStream.on("data", (chunk) => {
    console.log(`📦 Chunk ${++count}: ${chunk.length} chars`);
});

readStream.on("end", () => {
    console.log(`✅ อ่านจบทั้งหมด ${count} chunks`);
});
```

### 3.3 Pipe Chain ⛓️

เราต่อท่อได้หลายชั้น เช่น **อ่านไฟล์ → บีบอัดไฟล์ (Gzip) → เขียนไฟล์**

```javascript
const zlib = require("zlib");
const fs = require("fs");

const gzip = zlib.createGzip(); // ตัวแปลง (Transform Stream)
const source = fs.createReadStream("input.txt");
const destination = fs.createWriteStream("input.txt.gz");

// ต่อท่อ: Source → Gzip → Dest
source.pipe(gzip).pipe(destination);

console.log("📦 กำลังบีบอัดไฟล์...");
```

---

## 4. Challenges 🏆

### 🎯 Challenge 1: Path Master (หัวข้อ 1)
เขียนโปรแกรมที่:
1. บอก `__dirname` และ `process.cwd()`
2. สร้าง Path ไปยังไฟล์ `../images/logo.png` โดยใช้ `path.join` และเริ่มจาก `__dirname`
3. พิสูจน์ว่า Path นี้ถูกต้อง (แม้ว่าจะไม่มีไฟล์จริง)

::: details ✨ ดูเฉลย
```javascript
const path = require("path");

console.log("Home:", __dirname);
console.log("Work:", process.cwd());

// ย้อนกลับ 1 ขั้น (..) แล้วเข้า images
const logoPath = path.join(__dirname, "..", "images", "logo.png");
console.log("Path:", logoPath);
```
:::

### 🎯 Challenge 2: Streaming Copy with Progress (หัวข้อ 3)
เขียนโปรแกรม Copy ไฟล์ขนาดใหญ่ (สมมติ `source.txt` 10MB) ไปยัง `dest.txt` โดย:
1. แสดง **Progress %** บนหน้าจอ (คำนวณจาก `totalSize` และ `currentSize`)
2. ใช้ `fs.stat` หาขนาดไฟล์ก่อน

::: details ✨ ดูเฉลย
```javascript
const fs = require("fs");

async function copyWithProgress() {
    // สร้างไฟล์จำลอง 10MB
    if (!fs.existsSync("big.file")) {
        fs.writeFileSync("big.file", Buffer.alloc(10 * 1024 * 1024));
    }

    const stat = fs.statSync("big.file");
    const totalSize = stat.size;
    let copied = 0;

    const reader = fs.createReadStream("big.file");
    const writer = fs.createWriteStream("copy.file");

    reader.on("data", (chunk) => {
        copied += chunk.length;
        const percent = ((copied / totalSize) * 100).toFixed(2);
        process.stdout.write(`\r🚀 Copying... ${percent}%`);
    });

    reader.pipe(writer);
}

copyWithProgress();
```
:::

### 🎯 Challenge 3: File Transformer (ระดับยาก)
ใช้ `Transform Stream` (หรืออ่าน data แล้ว write เองก็ได้) เพื่อ:
1. อ่านไฟล์ `lower.txt` (ที่มีข้อความตัวเล็กหมด)
2. แปลงเป็น **UPPERCASE** (ตัวใหญ่หมด)
3. เขียนลง `upper.txt`

::: details ✨ ดูเฉลย
```javascript
const fs = require("fs");

const reader = fs.createReadStream("lower.txt", { encoding: "utf-8" });
const writer = fs.createWriteStream("upper.txt");

reader.on("data", (chunk) => {
    // แปลงข้อมูลก่อนเขียน
    const upperChunk = chunk.toUpperCase();
    writer.write(upperChunk);
});

reader.on("end", () => {
    console.log("✅ Converted to Uppercase!");
});
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **`__dirname`:** ตัวแปร Global เก็บ Absolute Path ของโฟลเดอร์ไฟล์ปัจจุบัน
> *   **`process.cwd()`:** (Current Working Directory) โฟลเดอร์ที่เราสั่งรันคำสั่ง node
> *   **Absolute Path:** Path เต็มที่เริ่มจาก Root (เช่น `C:\Users\...` หรือ `/usr/local/...`)
> *   **Relative Path:** Path สัมพัทธ์ (เช่น `./file.txt` หรือ `../folder`)
> *   **Transform Stream:** Stream ที่แปลงข้อมูลระหว่างทาง (เช่น Zip, Video Encode)
> *   **Gzip:** รูปแบบการบีบอัดไฟล์ยอดนิยมใน Unix/Node.js

---

👉 **[ไปทำโปรเจกต์: Project — File Manager CLI](/node/03-project-file-manager)**
