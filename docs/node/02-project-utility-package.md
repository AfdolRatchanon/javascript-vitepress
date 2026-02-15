# 📦 Project: Utility Package (สร้าง Package สำเร็จรูปของตัวเอง!)

> สร้าง Utility Library ที่รวม Helper Functions ไว้ใช้ซ้ำ — ใช้ความรู้ Module System ทั้งหมด!

---

## 🎯 เป้าหมาย

สร้าง **"tiny-utils"** — Package ที่มี 4 กลุ่มฟังก์ชัน:

```bash
node demo.js
# ✅ String Utils: capitalize, slugify, truncate
# ✅ Number Utils: clamp, random, format
# ✅ Array Utils: chunk, unique, shuffle
# ✅ Date Utils: format, timeAgo, isWeekend
```

---

## 📋 ข้อกำหนด (Requirements)

| # | Feature | รายละเอียด |
|:-:|:--------|:----------|
| 1 | **แยก Module** | แต่ละกลุ่มเป็นไฟล์แยก (`string.js`, `number.js`, `array.js`, `date.js`) |
| 2 | **Entry Point** | `index.js` รวม Export ทั้งหมด |
| 3 | **CommonJS** | ใช้ `require()` / `module.exports` |
| 4 | **Demo File** | `demo.js` แสดงตัวอย่างการใช้ทุกฟังก์ชัน |
| 5 | **Error Handling** | ตรวจสอบ Input (TypeError ถ้า Input ผิด) |

---

## 🪜 Step-by-Step Guide

### Step 1: สร้างโครงสร้างโปรเจกต์

```bash
mkdir tiny-utils
cd tiny-utils
npm init -y
```

```
tiny-utils/
├── lib/               ← ไฟล์ Module ทั้งหมด
│   ├── string.js
│   ├── number.js
│   ├── array.js
│   └── date.js
├── index.js           ← Entry Point (รวม Export)
├── demo.js            ← ตัวอย่างการใช้
└── package.json
```

### Step 2: สร้าง String Utils

```javascript
// lib/string.js

/**
 * แปลงตัวอักษรตัวแรกเป็นตัวใหญ่
 * capitalize("hello world") → "Hello world"
 */
function capitalize(str) {
    if (typeof str !== "string") throw new TypeError("Expected a string");
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * แปลงเป็น URL-friendly slug
 * slugify("Hello World!") → "hello-world"
 */
function slugify(str) {
    if (typeof str !== "string") throw new TypeError("Expected a string");
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s]+/g, "-");
}

/**
 * ตัดข้อความให้สั้นลง
 * truncate("Hello World", 5) → "Hello..."
 */
function truncate(str, maxLength = 30) {
    if (typeof str !== "string") throw new TypeError("Expected a string");
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
}

module.exports = { capitalize, slugify, truncate };
```

### Step 3: สร้าง Number Utils

```javascript
// lib/number.js

/**
 * จำกัดตัวเลขให้อยู่ในช่วง
 * clamp(15, 0, 10) → 10
 */
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * สุ่มตัวเลขในช่วง (integer)
 * random(1, 10) → 7
 */
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format ตัวเลขด้วย comma
 * formatNumber(1234567) → "1,234,567"
 */
function formatNumber(num) {
    return num.toLocaleString();
}

module.exports = { clamp, random, formatNumber };
```

### Step 4: สร้าง Array Utils

```javascript
// lib/array.js

/**
 * แบ่ง Array เป็นกลุ่มย่อย
 * chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
 */
function chunk(arr, size) {
    if (!Array.isArray(arr)) throw new TypeError("Expected an array");
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

/**
 * ลบค่าซ้ำ
 * unique([1,2,2,3,3,3]) → [1,2,3]
 */
function unique(arr) {
    return [...new Set(arr)];
}

/**
 * สับ Array แบบสุ่ม (Fisher-Yates)
 * shuffle([1,2,3,4,5]) → [3,1,5,2,4]
 */
function shuffle(arr) {
    const result = [...arr]; // ไม่แก้ Array ต้นฉบับ!
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

module.exports = { chunk, unique, shuffle };
```

### Step 5: สร้าง Date Utils

```javascript
// lib/date.js

/**
 * Format วันที่
 * formatDate(new Date()) → "16/02/2026"
 */
function formatDate(date, locale = "th-TH") {
    return new Date(date).toLocaleDateString(locale);
}

/**
 * แสดงเวลาที่ผ่านมา
 * timeAgo(new Date(Date.now() - 60000)) → "1 นาทีที่แล้ว"
 */
function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

    if (seconds < 60) return `${seconds} วินาทีที่แล้ว`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
}

/**
 * เช็คว่าเป็นวันหยุดสุดสัปดาห์ไหม
 * isWeekend(new Date("2026-02-14")) → true (Saturday)
 */
function isWeekend(date) {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // 0=Sunday, 6=Saturday
}

module.exports = { formatDate, timeAgo, isWeekend };
```

### Step 6: สร้าง Entry Point

```javascript
// index.js — รวม Export ทั้งหมด!
const string = require("./lib/string");
const number = require("./lib/number");
const array = require("./lib/array");
const date = require("./lib/date");

module.exports = {
    ...string,
    ...number,
    ...array,
    ...date,
};
```

### Step 7: สร้าง Demo

```javascript
// demo.js
const utils = require("./index");

console.log("=== 📝 String Utils ===");
console.log(utils.capitalize("hello world"));       // "Hello world"
console.log(utils.slugify("Hello World! 123"));      // "hello-world-123"
console.log(utils.truncate("สวัสดีครับ ยินดีต้อนรับ", 10)); // "สวัสดีครับ ยิ..."

console.log("\n=== 🔢 Number Utils ===");
console.log(utils.clamp(15, 0, 10));          // 10
console.log(utils.random(1, 100));            // (สุ่ม 1-100)
console.log(utils.formatNumber(1234567.89));  // "1,234,567.89"

console.log("\n=== 📚 Array Utils ===");
console.log(utils.chunk([1, 2, 3, 4, 5], 2));   // [[1,2],[3,4],[5]]
console.log(utils.unique([1, 2, 2, 3, 3, 3]));  // [1, 2, 3]
console.log(utils.shuffle([1, 2, 3, 4, 5]));    // (สุ่ม)

console.log("\n=== 📅 Date Utils ===");
console.log(utils.formatDate(new Date()));
console.log(utils.timeAgo(Date.now() - 3600000));   // "1 ชั่วโมงที่แล้ว"
console.log(utils.isWeekend(new Date()));
```

### Step 8: ทดสอบ

```bash
node demo.js
```

---

## 📊 สิ่งที่เรียนรู้จากโปรเจกต์นี้

| Concept | ใช้ตรงไหน |
|:--------|:---------|
| `module.exports` | Export ฟังก์ชันจากแต่ละไฟล์ |
| `require()` | Import Module ที่สร้างเอง |
| Spread `...` | รวม Export จากหลายไฟล์ใน index.js |
| Folder Structure | แยก `lib/` สำหรับ Module |
| Entry Point | `index.js` เป็นจุดเข้าหลัก |
| Error Handling | `throw new TypeError()` ตรวจ Input |
| JSDoc Comments | `/** */` อธิบายฟังก์ชัน |

---

## 🏆 Extra Challenges (ถ้าอยากท้าทาย!)

1. **เพิ่ม Validation Module:** `isEmail()`, `isURL()`, `isPhoneNumber()`
2. **เพิ่ม Color Module:** `hexToRgb()`, `rgbToHex()`, `randomColor()`
3. **เขียน Tests:** ใช้ `console.assert()` ทดสอบทุกฟังก์ชัน
4. **ESM Version:** แปลงทั้งโปรเจกต์ให้ใช้ `import/export`

---
👉 **[ไปต่อ: Module 3 — File System & Path](/node/03-01-filesystem)** *(Coming Soon)*
