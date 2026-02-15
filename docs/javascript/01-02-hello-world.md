# 01-2: Hello World & Console Deep Dive (เจาะลึกคำสั่งแรก) 👋

> **"A journey of a thousand miles begins with a single step."**
> — *Lao Tzu*

ทุกภาษาโปรแกรมในโลก เริ่มต้นด้วย "Hello, World!" — ประโยคเดียวที่พิสูจน์ว่า **"มันใช้งานได้แล้ว!"** เรามาเริ่มการเดินทางของเรากันเลยครับ! 🚀

> **💡 Analogy (เปรียบเทียบ):**
> `console.log()` เหมือน **"ลำโพงประกาศ"** ของโปรแกรมครับ มันใส่ข้อความอะไรเข้าไป ก็จะ **ตะโกนออกมาที่หน้าจอ** ให้เราเห็น

## 1. The Tradition (ธรรมเนียม Hello World) 🕯️

สร้างไฟล์ `hello.js` และพิมพ์โค้ดอมตะนี้ลงไป:

```javascript
console.log("Hello, World!");
```

รันด้วยคำสั่ง:
```bash
node hello.js
```

ผลลัพธ์:
```
Hello, World!
```

> **🎉 แค่นี้แหละ! คุณเพิ่งรันโค้ด JavaScript สำเร็จแล้ว!**


---

## 2. ผ่าตัด console.log() 🔬

มาดูกันว่าแต่ละส่วนของโค้ดคืออะไร:

```javascript
console.log("Hello, World!");
//│       │   │              │
//│       │   └── Argument   │
//│       └── Method         │
//└── Object             Semicolon
```

| # | ส่วนประกอบ | คืออะไร | เปรียบเทียบ |
|:-:|:-----------|:--------|:-----------|
| 1 | `console` | **Object** — กล่องเครื่องมือ | ลำโพงตัวเครื่อง 📻 |
| 2 | `.` | **Dot** — เข้าถึงของในกล่อง | ปุ่มเปิด |
| 3 | `log` | **Method** — ฟังก์ชันในกล่อง | ปุ่ม "เล่นเสียง" 🔊 |
| 4 | `(...)` | **Parentheses** — สั่งทำงาน! | กดปุ่ม! |
| 5 | `"Hello"` | **String Argument** — ข้อมูลที่ส่งเข้าไป | เนื้อเพลงที่จะเปิด 🎵 |
| 6 | `;` | **Semicolon** — จบคำสั่ง | จบประโยค (เหมือน `.` ในภาษาไทย) |

---

## 3. Console Methods (ไม่ได้มีแค่ log!) 🎨

`console` มี Method มากกว่า `.log()` เยอะ! ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/console):

```javascript
// 1. console.log() — แสดงข้อมูลทั่วไป (ใช้บ่อยที่สุด!)
console.log("Normal message");

// 2. console.warn() — แสดงคำเตือน (สีเหลือง ⚠️)
console.warn("Warning! Something might be wrong.");

// 3. console.error() — แสดง Error (สีแดง ❌)
console.error("ERROR! Something broke!");

// 4. console.info() — แสดงข้อมูลเพิ่มเติม (สีน้ำเงิน ℹ️)
console.info("FYI: Server running on port 3000");

// 5. console.table() — แสดงข้อมูลเป็นตาราง! 📊
console.table([
    { name: "Dolar", age: 25 },
    { name: "Somchai", age: 30 },
]);
// ┌─────────┬──────────┬─────┐
// │ (index) │   name   │ age │
// ├─────────┼──────────┼─────┤
// │    0    │ "Dolar"  │ 25  │
// │    1    │ "Somchai"│ 30  │
// └─────────┴──────────┴─────┘

// 6. console.time() / timeEnd() — จับเวลา ⏱️
console.time("Loop Timer");
for (let i = 0; i < 1000000; i++) { /* ทำอะไรบางอย่าง */ }
console.timeEnd("Loop Timer"); // "Loop Timer: 2.54ms"

// 7. console.clear() — ล้างหน้าจอ
console.clear();

// 8. console.count() — นับจำนวนครั้งที่ถูกเรียก
console.count("click");  // "click: 1"
console.count("click");  // "click: 2"
console.count("click");  // "click: 3"

// 9. console.group() / groupEnd() — จัดกลุ่มข้อความ
console.group("User Info");
console.log("Name: Dolar");
console.log("Age: 25");
console.groupEnd();
```

### 📊 Console Methods Quick Reference

| Method | ใช้ทำอะไร | สี/ไอคอน |
|:-------|:---------|:---------|
| `log()` | แสดงข้อมูลทั่วไป | ปกติ |
| `warn()` | แสดงคำเตือน | ⚠️ เหลือง |
| `error()` | แสดง Error | ❌ แดง |
| `info()` | แสดงข้อมูลเพิ่มเติม | ℹ️ น้ำเงิน |
| `table()` | แสดงเป็นตาราง | 📊 |
| `time()`/`timeEnd()` | จับเวลา | ⏱️ |
| `clear()` | ล้างจอ Console | 🧹 |
| `count()` | นับจำนวนครั้ง | 🔢 |
| `group()`/`groupEnd()` | จัดกลุ่ม | 📁 |


---

## 4. Where Does JS Run? (JS รันตรงไหน?) 🏠

JavaScript ไม่ได้ทำงานลอยๆ — มันต้องอยู่ใน **"บ้าน" (Host Environment)** เสมอ:

### A. Browser (เบราว์เซอร์) — บ้านดั้งเดิม

```javascript
// สิ่งที่ Browser มีให้:
// - window (หน้าต่าง Browser)
// - document (HTML ทั้งหน้า)
// - console (เครื่องมือ Developer)
// - alert, confirm, prompt (Pop-up Box)
// - fetch (เรียก API)

// ตัวอย่าง:
// alert("Hello from Browser!");          // Pop-up!
// document.title = "My Page";           // เปลี่ยนชื่อ Tab
// document.getElementById("myButton");   // หาปุ่มใน HTML
```

### B. Node.js — บ้านหลังใหม่ (Server-side)

```javascript
// สิ่งที่ Node.js มีให้:
// - process (ข้อมูลเกี่ยวกับการทำงาน)
// - fs (จัดการไฟล์)
// - http (สร้าง Web Server)
// - console (เครื่องมือ Debug)

// ตัวอย่าง:
console.log(process.version);           // "v20.11.0" (Node เวอร์ชัน)
console.log(process.platform);          // "win32" หรือ "darwin"
// const fs = require('fs');             // อ่าน/เขียนไฟล์
```

### 📊 Browser vs Node.js

| | **Browser** 🌐 | **Node.js** 🟢 |
|:--|:--------------|:--------------|
| **ใช้ทำอะไร** | เว็บ Frontend | Backend / CLI Tools |
| **DOM** | ✅ มี (`document`) | ❌ ไม่มี |
| **File System** | ❌ ไม่มี | ✅ มี (`fs`) |
| **console** | ✅ มี | ✅ มี |
| **Global Object** | `window` | `global` / `globalThis` |
| **ติดตั้ง** | มาพร้อม Browser | ต้องติดตั้งแยก |

### Understanding Host Objects vs Native Objects:

```javascript
// Native Objects — สิ่งที่ JS มีมาให้ทุก Environment
// Date, Math, String, Array, Object, Function, RegExp, JSON

console.log(Math.random());    // ✅ ใช้ได้ทั้ง Browser และ Node.js
console.log(Date.now());       // ✅ ใช้ได้ทั้ง Browser และ Node.js

// Host Objects — สิ่งที่ "เจ้าบ้าน" เตรียมให้
// Browser: window, document, alert, fetch
// Node.js: process, fs, http, Buffer
```


---

## 5. String Basics (พื้นฐาน String) 🔤

ก่อนจะไปต่อ ต้องเข้าใจเรื่อง **String (ข้อความ)** เบื้องตันก่อน:

### 3 วิธีเขียน String:

```javascript
// 1. Single Quotes — ง่าย สั้น
console.log('Hello!');

// 2. Double Quotes — เหมือน Single Quotes
console.log("Hello!");

// 3. Backticks (Template Literals) — ⭐ ใส่ตัวแปรได้!
const name = "Dolar";
console.log(`Hello, ${name}!`);  // "Hello, Dolar!"
//           │      └──────┘ │
//           │   Expression  │
//           └── Backtick ───┘
```

### 📊 Quote Comparison

| Quote | Syntax | ใส่ตัวแปรได้ | ขึ้นบรรทัดใหม่ได้ | ใช้เมื่อ |
|:------|:-------|:-----------|:----------------|:--------|
| Single `'...'` | `'Hello'` | ❌ ต้อง `+` ต่อ | ❌ ต้อง `\n` | String สั้นๆ |
| Double `"..."` | `"Hello"` | ❌ ต้อง `+` ต่อ | ❌ ต้อง `\n` | String สั้นๆ |
| Backtick `` `...` `` | `` `Hello` `` | ✅ ใช้ `${}` | ✅ ได้เลย! | ⭐ แนะนำทุกกรณี |


---

## 6. Semicolons & ASI (อัฒภาค) 🔵

JavaScript มี **ASI (Automatic Semicolon Insertion)** — ระบบเติม `;` ให้อัตโนมัติ:

```javascript
// ทั้ง 2 แบบนี้ทำงานเหมือนกัน:
console.log("Hello")      // ✅ JS เติม ; ให้อัตโนมัติ
console.log("Hello");     // ✅ เราเติมเอง

// ⚠️ แต่บางกรณี ASI ทำให้เกิด Bug!:
function getObject() {
    return        // ← ASI เติม ; ตรงนี้! → return;
    { name: "Dolar" }  // ← บรรทัดนี้ไม่ถูกรัน!
}
console.log(getObject()); // undefined 😱

// ✅ แก้ไข: ใส่ { ไว้บรรทัดเดียวกับ return
function getObjectFixed() {
    return {
        name: "Dolar"
    };
}
console.log(getObjectFixed()); // { name: "Dolar" } ✅
```

> **Best Practice:** เติม `;` เองทุกบรรทัด — อย่าพึ่ง ASI ครับ!

---

## 7. Challenges 🏆

ทดสอบความเข้าใจกับโจทย์ 6 ข้อที่ออกแบบมาเพื่อแต่ละหัวข้อโดยเฉพาะ:

### 🎯 Challenge 1: The First Step
**หัวข้อ:** 1. The Tradition

**โจทย์:** สร้างไฟล์ `my-first.js` และเขียนโค้ดเพื่อพิมพ์คำว่า `"JavaScript is fun!"` ออกทางหน้าจอ จากนั้นรันด้วยคำสั่ง `node my-first.js`
::: details ✨ ดูเฉลย
**ไฟล์ my-first.js:**
```javascript
console.log("JavaScript is fun!");
```
**คำสั่งรัน:**
```bash
node my-first.js
```
:::

### 🎯 Challenge 2: Anatomy Check
**หัวข้อ:** 2. ผ่าตัด console.log()

**โจทย์:** ในคำสั่ง `console.warn("Be careful!");`
- **Object** คือคำว่าอะไร?
- **Method** คือคำว่าอะไร?
::: details ✨ ดูเฉลย
- **Object:** `console`
- **Method:** `warn`
:::

### 🎯 Challenge 3: Console Methods
**หัวข้อ:** 3. Console Methods

**โจทย์:** จงเขียนโค้ดเพื่อแสดงผล 3 บรรทัดนี้โดยใช้ Method ที่ถูกต้อง:
1. ข้อความปกติว่า "Start system..."
2. ข้อความเตือน (สีเหลือง) ว่า "Low memory"
3. ข้อความ Error (สีแดง) ว่า "System crash!"
::: details ✨ ดูเฉลย
```javascript
console.log("Start system...");
console.warn("Low memory");
console.error("System crash!");
```
:::

### 🎯 Challenge 4: Where am I?
**หัวข้อ:** 4. Where Does JS Run?

**โจทย์:** ถ้าคุณต้องการเขียนโค้ดเพื่อ "อ่านไฟล์จากเครื่อง" (File System Access) คุณต้องรัน JavaScript บน Environment ไหน? (Browser หรือ Node.js) เพราะเหตุใด?
::: details ✨ ดูเฉลย
ต้องรันบน **Node.js** ครับ เพราะ Browser ไม่มีสิทธิ์เข้าถึงไฟล์ในเครื่องผู้ใช้โดยตรง (เพื่อความปลอดภัย) แต่ Node.js มี module `fs` ให้ใช้งาน
:::

### 🎯 Challenge 5: String Master
**หัวข้อ:** 5. String Basics

**โจทย์:** จงใช้ **Backticks** (Template Literals) เพื่อประกาศตัวแปร `food` เก็บชื่ออาหาร แล้วแสดงผลว่า `"I love to eat [food]"`
::: details ✨ ดูเฉลย
```javascript
const food = "Pizza";
console.log(`I love to eat ${food}`);
```
:::

### 🎯 Challenge 6: The ASI Trap
**หัวข้อ:** 6. Semicolons & ASI

**โจทย์:** ทำไมโค้ดนี้ถึง Return `undefined`? และจะแก้ยังไง?
```javascript
function getValue() {
    return
    { value: 10 }
}
```
::: details ✨ ดูเฉลย
**สาเหตุ:** เพราะ ASI (Automatic Semicolon Insertion) แอบเติม `;` หลังคำว่า `return` ทำให้ฟังก์ชันจบการทำงานทันที
**วิธีแก้:** ย้าย `{` ขึ้นมาอยู่บรรทัดเดียวกับ `return`:
```javascript
return {
    value: 10
};
```
:::





---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **console:** Object ที่ Host Environment มอบให้ สำหรับแสดงผลข้อมูลบนหน้าจอ
> *   **Method:** ฟังก์ชันที่อยู่ภายใน Object (เช่น `console.log()` → `log()` คือ Method)
> *   **Argument:** ข้อมูลที่ส่งเข้าไปในฟังก์ชัน (เช่น `"Hello"` ใน `console.log("Hello")`)
> *   **String:** ข้อมูลประเภทข้อความ ใช้ Quotes ครอบ (`'...'`, `"..."`, `` `...` ``)
> *   **Template Literal:** String ที่ใช้ Backtick `` ` `` สามารถใส่ Expression ด้วย `${}`
> *   **Host Environment:** "บ้าน" ที่ JS อาศัยอยู่ (Browser หรือ Node.js)
> *   **Native Object:** สิ่งที่ JS มีมาให้ทุก Environment (Math, Date, Array)
> *   **Host Object:** สิ่งที่ Environment มอบให้ (window, document, process, fs)
> *   **ASI:** Automatic Semicolon Insertion — ระบบเติม `;` ให้อัตโนมัติ
> *   **Case-Sensitive:** ตัวเล็ก/ใหญ่ต่างกัน (console ≠ Console)

---
👉 **[ไปต่อ: 01-3 - Syntax Basics & Statements](/01-03-syntax-basics)**
