# 01-1: Node.js คืออะไร? (แนะนำ Node.js) 🖥️

> **"Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine."**
> — *nodejs.org*

ถ้า JavaScript เป็นภาษา → **Node.js คือสถานที่ใหม่ที่ JavaScript สามารถอยู่ได้!** ก่อนหน้านี้ JavaScript ทำงานได้แค่ใน Browser แต่ Node.js ทำให้ JavaScript รันบน **Server, Desktop, Terminal** ได้ทุกที่!

> **💡 Analogy (เปรียบเทียบ):**
> ลองนึกภาพ JavaScript เป็น **"ปลา" 🐟**:
> - **Browser** = ตู้ปลา (ที่เดิมที่ปลาอยู่)
> - **Node.js** = มหาสมุทร! 🌊 (ปลาว่ายได้ทุกที่ — Server, CLI, IoT, Desktop App)
> - ปลาตัวเดิม (JavaScript) แต่ที่อยู่ใหม่ (Node.js) ทำให้ทำอะไรได้มากกว่าเดิมมาก!

---

## 1. JavaScript Runtime คืออะไร? ⚡

ตาม [Node.js Official Docs](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs): **Runtime** คือ **สภาพแวดล้อมที่ให้โค้ดทำงานได้** — เหมือน "เวที" ที่นักแสดง (JavaScript) ขึ้นไปแสดง

### Browser vs Node.js

ทั้งสองรัน JavaScript ได้ แต่ **สิ่งที่ทำได้ต่างกัน**:

| Feature | 🌐 Browser | 🖥️ Node.js |
|:--------|:----------|:----------|
| **JavaScript** | ✅ รันได้ | ✅ รันได้ |
| **DOM** (document, window) | ✅ มี | ❌ **ไม่มี!** |
| **File System** (อ่าน/เขียนไฟล์) | ❌ ไม่ได้ | ✅ **ได้!** |
| **HTTP Server** | ❌ ไม่ได้ | ✅ **สร้างได้!** |
| **Database** | ❌ ไม่ตรง | ✅ **เชื่อมต่อได้!** |
| **alert(), confirm()** | ✅ มี | ❌ ไม่มี |
| **console.log()** | ✅ มี | ✅ มี |
| **Modules (import/export)** | ✅ ESM | ✅ ESM + CommonJS |

> 💡 **Key Insight:** ใน Browser เราใช้ JS จัดการ **หน้าเว็บ** (DOM) แต่ใน Node.js เราใช้ JS จัดการ **Server, ไฟล์, Database** แทน!

---

## 2. V8 Engine — หัวใจของ Node.js 🏎️

**V8** คือ JavaScript Engine ที่ Google สร้างสำหรับ Chrome — เป็นตัวแปลง JavaScript ให้เป็น Machine Code (ภาษาที่คอมพิวเตอร์เข้าใจ)

```
JavaScript Code  →  V8 Engine  →  Machine Code  →  CPU จัดการ
   "1 + 1"          (แปล)         001010101        (คำนวณ)
```

**ทำไม V8 เร็ว?**
- ใช้ **JIT Compilation** (Just-In-Time) — แปลโค้ดขณะทำงานเลย ไม่ต้องแปลก่อนทั้งหมด
- เขียนด้วย **C++** — ประสิทธิภาพสูง
- **Ryan Dahl** (ผู้สร้าง Node.js) นำ V8 ออกจาก Chrome แล้วเพิ่มความสามารถ (File I/O, Network) → เกิดเป็น Node.js!

### ไทม์ไลน์ Node.js

| ปี | เหตุการณ์ |
|:---|:---------|
| 2008 | Google สร้าง V8 Engine สำหรับ Chrome |
| **2009** | **Ryan Dahl สร้าง Node.js** — เอา V8 มารันนอก Browser |
| 2010 | npm (Node Package Manager) เปิดตัว |
| 2015 | Node.js Foundation ก่อตั้ง, io.js รวมกลับ |
| 2023+ | Node.js v20+ LTS — ใช้กันทั่วโลก |

---

## 3. ติดตั้ง Node.js 📦

### ดาวน์โหลด

ไปที่ [nodejs.org](https://nodejs.org/) แล้วดาวน์โหลด **LTS** (Long Term Support):

> ⚠️ **เลือก LTS เสมอ!** อย่าเลือก Current — LTS เสถียรกว่า, บริษัทใช้ LTS กัน

### ตรวจสอบว่าติดตั้งสำเร็จ

เปิด Terminal (Command Prompt, PowerShell, หรือ VS Code Terminal) แล้วพิมพ์:

```bash
# เช็ค Node.js version
node -v
# ตัวอย่าง output: v20.11.0

# เช็ค npm version (มาพร้อม Node.js)
npm -v
# ตัวอย่าง output: 10.2.4
```

ถ้าเห็นเลข version = **ติดตั้งสำเร็จ!** 🎉

---

## 4. ทดลองรัน JavaScript ในNode.js 🧪

### วิธี 1: REPL (Read-Eval-Print Loop)

**REPL** คือ "Interactive Mode" — พิมพ์โค้ดแล้วเห็นผลทันที! เหมือน Console ใน Browser DevTools:

```bash
# เปิด REPL
node

# พิมพ์โค้ด JavaScript ได้เลย!
> 1 + 1
2
> "Hello" + " Node!"
'Hello Node!'
> Math.random()
0.7235891726381
> const name = "Dolar"
> `สวัสดี ${name}!`
'สวัสดี Dolar!'

# ออกจาก REPL
> .exit
```

> 💡 **REPL ดีสำหรับ:** ทดลองโค้ดเร็วๆ, เช็ค syntax, คำนวณง่ายๆ — **ไม่เหมาะสำหรับ** เขียนโปรแกรมจริง

### วิธี 2: รันไฟล์ (แนะนำ!)

สร้างไฟล์ `hello.js`:

```javascript
// hello.js
const message = "🖥️ สวัสดีจาก Node.js!";
console.log(message);

// ⭐ สิ่งที่ Browser ไม่มี → Node.js มี!
console.log("Node version:", process.version);   // เวอร์ชัน Node.js
console.log("Platform:", process.platform);      // win32 / darwin / linux
console.log("Current directory:", process.cwd()); // โฟลเดอร์ปัจจุบัน
```

รันในTerminal:

```bash
node hello.js
```

Output:
```
🖥️ สวัสดีจาก Node.js!
Node version: v20.11.0
Platform: win32
Current directory: C:\Users\dolar\projects
```

> 💡 **`process`** คือ Global Object พิเศษของ Node.js (เหมือน `window` ใน Browser) — ให้ข้อมูลเกี่ยวกับ Process ปัจจุบัน

---

## 5. Global Objects ใน Node.js 🌍

ใน Browser มี `window`, `document` แต่ใน Node.js มี **Global Objects ชุดใหม่**:

```javascript
// 🌐 Browser Globals (ใน Node.js → ไม่มี!)
// window     → ❌
// document   → ❌
// alert()    → ❌

// 🖥️ Node.js Globals (ใน Browser → ไม่มี!)
console.log(__dirname);   // โฟลเดอร์ของไฟล์นี้
console.log(__filename);  // Path เต็มของไฟล์นี้
console.log(process.env); // Environment Variables ทั้งหมด
```

### 📊 สรุป Global Objects

| Node.js Global | คืออะไร | เทียบเท่า Browser |
|:---------------|:--------|:-----------------|
| `global` | Global scope | `window` |
| `process` | ข้อมูล Process ปัจจุบัน | `navigator` (คล้ายๆ) |
| `__dirname` | โฟลเดอร์ของไฟล์ | ❌ ไม่มี |
| `__filename` | Path เต็มของไฟล์ | ❌ ไม่มี |
| `require()` | Import Module (CommonJS) | `import` (ESM) |
| `module` | ข้อมูล Module ปัจจุบัน | ❌ ไม่มี |
| `Buffer` | ข้อมูล Binary (รูป, ไฟล์) | `Blob` / `ArrayBuffer` |
| `setTimeout()` | ⏰ Timer | ✅ เหมือนกัน |

---

## 6. ทำไมต้อง Node.js? 🤔

### ข้อดี

| ข้อดี | อธิบาย |
|:------|:------|
| **ภาษาเดียว Full-Stack** | ใช้ JavaScript ทั้ง Frontend + Backend |
| **npm = โลกของ Packages** | 2.1+ ล้าน Packages ใน npm Registry |
| **Non-blocking I/O** | จัดการ Concurrent Requests ได้ดี |
| **เร็ว (V8)** | JIT Compilation ประสิทธิภาพสูง |
| **Community ใหญ่** | StackOverflow, GitHub, Tutorial มากมาย |

### ข้อจำกัด

| ข้อจำกัด | อธิบาย |
|:---------|:------|
| **Single Thread** | ไม่เหมาะกับงาน CPU-intensive (เช่น Video Encoding) |
| **Callback Hell** | (แก้ได้ด้วย Async/Await ที่เรียนมาแล้ว!) |
| **ไม่เหมาะกับ** | Machine Learning, Game Engine, System Programming |

### ใครใช้ Node.js?

| บริษัท | ใช้ทำอะไร |
|:-------|:---------|
| **Netflix** | API Server, Microservices |
| **LinkedIn** | Mobile Backend |
| **Uber** | Real-time Matching |
| **PayPal** | Payment API |
| **NASA** | Data Access Application |

---

## 7. Challenges 🏆

### 🎯 Challenge 1: Node.js Info Script
สร้างไฟล์ `info.js` ที่แสดงข้อมูล: Node version, Platform, Current Time:

::: details ✨ ดูเฉลย
```javascript
// info.js
console.log("=== Node.js Info ===");
console.log("Version:", process.version);
console.log("Platform:", process.platform);
console.log("Architecture:", process.arch);
console.log("Current Time:", new Date().toLocaleString("th-TH"));
console.log("Uptime:", process.uptime().toFixed(2), "seconds");
```
```bash
node info.js
```
:::

### 🎯 Challenge 2: Arguments Reader
สร้างไฟล์ `greet.js` ที่รับชื่อจาก Command Line: `node greet.js Dolar` → แสดง `สวัสดี Dolar!`:

::: details ✨ ดูเฉลย
```javascript
// greet.js
const name = process.argv[2]; // argv[0]=node, argv[1]=greet.js, argv[2]=ชื่อ

if (name) {
    console.log(`สวัสดี ${name}! 🎉`);
} else {
    console.log("กรุณาใส่ชื่อ: node greet.js <ชื่อ>");
}
```
```bash
node greet.js Dolar    # → สวัสดี Dolar! 🎉
node greet.js Somchai  # → สวัสดี Somchai! 🎉
node greet.js          # → กรุณาใส่ชื่อ: node greet.js <ชื่อ>
```
:::

### 🎯 Challenge 3: Environment Detective
สร้างไฟล์ `detective.js` ที่ตรวจสอบ Environment แล้วแสดงผลเป็นตาราง:

::: details ✨ ดูเฉลย
```javascript
// detective.js
const info = {
    "Node Version": process.version,
    "Platform": process.platform,
    "Architecture": process.arch,
    "CPU Cores": require("os").cpus().length,
    "Total Memory": (require("os").totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
    "Home Directory": require("os").homedir(),
    "Current Directory": process.cwd(),
};

console.log("🔍 Environment Detective Report:");
console.table(info);
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Node.js:** JavaScript Runtime ที่ทำงานนอก Browser (บน Server, Terminal)
> *   **V8 Engine:** JavaScript Engine ของ Google Chrome ที่แปล JS เป็น Machine Code
> *   **Runtime:** สภาพแวดล้อมที่ให้โค้ดทำงานได้
> *   **REPL:** Read-Eval-Print Loop — Interactive Mode สำหรับทดลองโค้ด
> *   **npm:** Node Package Manager — ตัวจัดการ Library/Package
> *   **LTS:** Long Term Support — เวอร์ชันเสถียรที่ได้รับการดูแลระยะยาว
> *   **`process`:** Global Object ใน Node.js ที่ให้ข้อมูลเกี่ยวกับ Process ปัจจุบัน
> *   **`process.argv`:** Array ที่เก็บ Arguments จาก Command Line
> *   **`__dirname`:** Path ของโฟลเดอร์ที่ไฟล์ปัจจุบันอยู่
> *   **JIT Compilation:** แปลโค้ดขณะทำงาน (Just-In-Time) — เร็วกว่าแปลทั้งหมดก่อน
> *   **Non-blocking I/O:** ไม่ต้องรอ I/O เสร็จก่อน → ทำงานอื่นได้พร้อมกัน

---
👉 **[ไปต่อ: 1.2 - npm & package.json](/node/01-02-npm-basics)**
