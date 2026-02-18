# 🧹 Project 6: Data Cleanser CLI

> **"Garbage In, Garbage Out. Your code is only as good as the data you feed it."**
> — *Computer Science Axiom*

ยินดีต้อนรับสู่โปรเจกต์แรกของ Module 5 ครับ! ในบทนี้เราจะเอาความรู้ทั้งหมดที่เรียนมา (Array Methods, Strings, Regex, JSON, Set) มาสร้าง **"เครื่องล้างข้อมูล" (Data Cleanser)**

โจทย์คือเราได้รับไฟล์ JSON มั่วๆ จากระบบเก่า (Legacy System) ที่มีทั้งข้อมูลซ้ำ, อีเมลผิด, และชื่อที่เขียนตัวเล็กตัวใหญ่ผสมกัน หน้าที่ของคุณคือเขียน Script เพื่อ "คลีน" มันให้สวยงามพร้อมใช้งาน!

---

## 🎯 Objective (เป้าหมาย)

เราจะสร้างฟังก์ชัน `cleanUserLog(rawData)` ที่ทำหน้าที่:
1.  **Parse JSON:** แปลง String เป็น Object (และกันแครชด้วย `try-catch`)
2.  **Filter Invalid:** ตัด User ที่ไม่มี ID หรือ Email ผิดรูปแบบทิ้ง
3.  **Normalize:** จัดชื่อให้สวยงาม (Name Formatting) และทำ Email ให้เป็นตัวเล็ก
4.  **Deduplicate:** ลบ User ที่ ID ซ้ำกัน (เก็บคนล่าสุดไว้)
5.  **Group Role:** สรุปยอดว่ามี Admin กี่คน, User กี่คน

---

## 🛠️ dirty-data.js (ข้อมูลดิบ)

สร้างไฟล์ `dirty-data.js` เพื่อจำลองข้อมูลเน่าๆ:

```javascript
// สังเกตความมั่ว:
// - JSON เป็น String ก้อนเดียว
// - มี ID ซ้ำ (1)
// - มี Email ผิด (user3@)
// - ชื่อตัวเล็กบ้างใหญ่บ้าง (aLice)
// - มีข้อมูลขยะ (id: null)

export const rawLog = `
[
    { "id": 1, "name": "aLice", "email": "ALICE@Example.com", "role": "admin" },
    { "id": 2, "name": "bob", "email": "bob@example.com", "role": "user" },
    { "id": 1, "name": "Alice (Updated)", "email": "alice@example.com", "role": "admin" },
    { "id": 3, "name": "Charlie", "email": "user3@", "role": "user" },
    { "id": null, "name": "Unknown", "email": "no-id@test.com", "role": "guest" }
]
`;
```

---

## 🚀 Step-by-Step Implementation

สร้างไฟล์ `cleanser.js` ครับ

### Step 1: Parse & Error Handling 🛡️

ขั้นแรกต้องเปลี่ยน String ให้เป็น Object ก่อน และถ้า JSON พัง ต้องแจ้งเตือน

```javascript
// cleanser.js
import { rawLog } from './dirty-data.js';

function parseData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        console.log(`✅ Parsed ${data.length} records.`);
        return data;
    } catch (error) {
        console.error("❌ Invalid JSON format!", error.message);
        return [];
    }
}
```

### Step 2: Validate & Normalize Strings 🧹

ใช้ `map` เพื่อจัด Format และ `filter` เพื่อตัดของเสีย
(ต้องใช้ Regex ตรวจ email!)

```javascript
function normalizeData(users) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic Regex

    return users
        .filter(user => {
            // กฎ: ต้องมี ID และ Email ต้องถูกต้อง
            return user.id && emailRegex.test(user.email);
        })
        .map(user => {
            // จัดชื่อ: อักษรแรกใหญ่ ที่เหลือเล็ก (Capitalize)
            const name = user.name.charAt(0).toUpperCase() + 
                         user.name.slice(1).toLowerCase();
            
            return {
                id: user.id,
                name: name,
                email: user.email.toLowerCase(), // Email ตัวเล็กเสมอ
                role: user.role.toLowerCase()
            };
        });
}
```

### Step 3: Remove Duplicates (The Map Trick) 👯‍♂️

เราจะใช้ `Map` เพื่อเก็บ User ทีละคน โดยใช้ `id` เป็น Key
ถ้าเจอ ID ซ้ำ ข้อมูลใหม่จะทับข้อมูลเก่า (ซึ่งตรงตามโจทย์คือเอาล่าสุด)

```javascript
function removeDuplicates(users) {
    const uniqueMap = new Map();

    users.forEach(user => {
        uniqueMap.set(user.id, user); // ID ซ้ำ = ทับ
    });

    return Array.from(uniqueMap.values()); // แปลงกลับเป็น Array
}
```

### Step 4: Aggregation (สรุปยอด) �

ใช้ `reduce` เพื่อนับจำนวนคนในแต่ละ Role

```javascript
function generateReport(users) {
    return users.reduce((report, user) => {
        // ถ้ายังไม่มี property นี้ให้เริ่มที่ 0
        report[user.role] = (report[user.role] || 0) + 1;
        return report;
    }, {});
}
```

---

## 🏁 Final Code: Putting It All Together

```javascript
// Main Execution
const parsed = parseData(rawLog);
const normalized = normalizeData(parsed);
const unique = removeDuplicates(normalized);
const report = generateReport(unique);

console.log("\n--- ✨ Cleaned Data ---");
console.table(unique); // console.table แสดง Array สวยมาก!

console.log("\n--- 📊 Report ---");
console.log(JSON.stringify(report, null, 2));
```

### ผลลัพธ์ที่ควรได้:

1.  **Parsed:** 5 records
2.  **Filter:** user3@ (ผิด email) และ null id หายไป
3.  **Deduplicate:** ID 1 เหลืออันเดียว (Alice Updated)
4.  **Format:** ชื่อเป็น "Alice", "Bob" สวยงาม

---

## 🏆 Challenges

### 🎯 Challenge 1: Log Rejected Data
**โจทย์:** แก้ไขฟังก์ชัน `normalizeData` ให้เก็บ "รายชื่อคนที่ถูกตัดออก" (Rejected) ไว้ใน Array แยก แล้วปริ้นท์ออกมาดูตอนจบว่าใครโดนตัดบ้างเพราะอะไร

### 🎯 Challenge 2: Mask Sensitive Data
**โจทย์:** ถ้า User มี field `password` หรือ `creditCard` ติดมา ให้ใช้ `map` เปลี่ยนค่านั้นเป็น `****` หรือลบทิ้งไปเลยก่อนแสดงผล

### 🎯 Challenge 3: Sort by Name
**โจทย์:** เรียงลำดับผลลัพธ์สุดท้ายตามตัวอักษรชื่อ (`A-Z`) โดยใช้ `.sort()` และ `localeCompare`

---

👉 **[ไปต่อ: Project 7 - Typing Practice Logic](/javascript/05-project-typing-logic)**
