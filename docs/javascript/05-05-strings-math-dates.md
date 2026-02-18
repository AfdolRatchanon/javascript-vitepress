# 05-05 Strings, Math & Dates 📅

> **"Dates in JavaScript are broken. Math is weird. But Strings are surprisingly powerful."**
> — *Senior JavaScript Developer*

ในบทนี้เราจะมาดู **Built-in Objects** 3 ตัวที่ใช้บ่อยที่สุดในชีวิตจริงครับ:
1.  **String:** จัดการข้อความ (ตัด, ต่อ, ค้นหา, แทนที่)
2.  **Math:** คำนวณตัวเลข (สุ่ม, ปัดเศษ, หาค่าสูงสุด)
3.  **Date:** จัดการวันเวลา (เรื่องที่ปวดหัวที่สุดใน JS!)

และพระเอกลับขี่ม้าขาวของเรา: **`Intl` API** ที่ช่วยจัดการ Format ตัวเลขและวันเวลาให้เป็นสากล (รองรับภาษาไทย) โดยไม่ต้องพึ่ง Library!

---

## 📚 MDN Reference
- [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
- [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)

---

## 1. String Methods 🧵

String ใน JS เป็น **Immutable** (แก้ค่าไม่ได้, แก้แล้วจะได้ตัวใหม่เสมอ)

### 1.1 Manipulation (จัดการคำ)
```javascript
const text = "  Hello JavaScript!  ";

// ตัดช่องว่างหน้าหลัง
console.log(text.trim()); // "Hello JavaScript!"

// ตัดคำ (Slice)
console.log(text.slice(2, 7)); // "Hello" (เริ่ม index 2 ถึงก่อน 7)

// แทนที่คำ (Replace)
console.log(text.replace("JavaScript", "World")); // "  Hello World!  "
// แทนที่ทั้งหมด (Replace All)
console.log("Banananana".replaceAll("na", "ki")); // "Bakikiki"
```

### 1.2 Inspection (ตรวจสอบ)
```javascript
const email = "admin@example.com";

console.log(email.includes("@"));      // true
console.log(email.startsWith("admin"));// true
console.log(email.endsWith(".com"));   // true
console.log(email.indexOf("@"));       // 5 (ถ้าไม่เจอคืน -1)
```

### 1.3 Splitting & Joining (แยกและรวม)
```javascript
const csv = "Apple,Banana,Orange";

// แยก String เป็น Array
const fruits = csv.split(","); // ["Apple", "Banana", "Orange"]

// รวม Array กลับเป็น String
const newCsv = fruits.join(" | "); // "Apple | Banana | Orange"
```

---

## 2. Math Object 🧮

`Math` เป็น Object ที่เก็บค่าคงที่และฟังก์ชันทางคณิตศาสตร์ (ไม่ต้อง `new`)

### 2.1 Rounding (การปัดเศษ)
```javascript
const pi = 3.14159;

console.log(Math.round(pi)); // 3 (ปัดตามหลักคณิตศาสตร์)
console.log(Math.ceil(pi));  // 4 (ปัดขึ้นเสมอ - Ceiling)
console.log(Math.floor(pi)); // 3 (ปัดลงเสมอ - Floor)
console.log(Math.trunc(pi)); // 3 (ตัดเศษทิ้งดื้อๆ)
```

### 2.2 Random (การสุ่ม)
`Math.random()` คืนค่า 0.0 ถึง 0.999... (ไม่ถึง 1)

```javascript
// สุ่มเลข 0 - 1
console.log(Math.random()); 

// สูตรสุ่ม Integer: min ถึง max (รวม max)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log(getRandomInt(1, 10)); // เลขระหว่าง 1-10
```

### 2.3 Other Utilities
```javascript
console.log(Math.max(10, 50, 5)); // 50
console.log(Math.min(10, 50, 5)); // 5
console.log(Math.abs(-100));      // 100 (ค่าสัมบูรณ์)
console.log(Math.pow(2, 3));      // 8 (2 ยกกำลัง 3) หรือใช้ 2 ** 3
```

> **⚠️ The 0.1 + 0.2 Problem:**
> `console.log(0.1 + 0.2 === 0.3); // false!` (ได้ 0.30000000000000004)
> นี่เป็นข้อจำกัดของ Floating Point Binary ให้ระวังเมื่อคำนวณเงิน! (ควรคูณ 100 ให้เป็นจำนวนเต็มก่อนคำนวณ)

---

## 3. Date Object 🕰️

Date ใน JS เก็บเวลาเป็น **Milliseconds** นับจาก 1 ม.ค. 1970 (Epoch Time)

### 3.1 Creating Dates (การสร้าง)
```javascript
const now = new Date(); // เวลาปัจจุบัน
const custom = new Date("2025-12-25"); // จาก String (YYYY-MM-DD)
const epoch = new Date(0); // 1 Jan 1970
```

### 3.2 Getting & Setting (ดึงและตั้งค่า)
```javascript
const date = new Date("2025-04-13T10:30:00"); // วันสงกรานต์

console.log(date.getFullYear()); // 2025
console.log(date.getMonth());    // 3 (⚠️ เดือนเริ่มที่ 0! เมษา = 3)
console.log(date.getDate());     // 13 (วันที่)
console.log(date.getDay());      // 0 (วันอาทิตย์, 0-6)
console.log(date.getTime());     // 1744515000000 (Timestamp)
```

### 3.3 Date Manipulation Logic
บวกวันทำยังไง? ไม่มี method `.addDays()` นะ! ต้องทำเอง:

```javascript
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1); // บวกไป 1 วัน
```

> **💡 Recommendation:** ถ้าต้องจัดการวันเวลาหนักๆ แนะนำให้ใช้ Library เช่น **date-fns** หรือ **Day.js** เพราะ Date ของ JS มีลูกเล่น (Bug?) เยอะมาก

---

## 4. Intl API (Internationalization) 🌏

เลิกเขียนฟังก์ชันใส่ลูกน้ำ (Comma) หรือแปลงวันที่เองได้แล้ว! จงใช้ `Intl`

### 4.1 Number Formatting (สกุลเงิน/ตัวเลข)
```javascript
const salary = 50000.5;

// รูปแบบไทย (มีบาท)
const thMoney = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
}).format(salary);

console.log(thMoney); // "฿50,000.50"

// รูปแบบมาตรฐาน (ใส่ลูกน้ำ)
const niceNumber = new Intl.NumberFormat().format(1000000); 
console.log(niceNumber); // "1,000,000"
```

### 4.2 Date Formatting (วันที่สวยๆ)
```javascript
const date = new Date();

const niceDate = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'full',   // full, long, medium, short
    timeStyle: 'medium',
    calendar: 'buddhist' // พ.ศ. !!
}).format(date);

console.log(niceDate); 
// "วันพุธที่ 18 กุมภาพันธ์ พุทธศักราช 2569 14:30:00" (ตัวอย่าง)
```

---

## 5. Challenges 🏆

### 🎯 Challenge 1: The Slug Generator
**หัวข้อ:** String
**โจทย์:** เปลี่ยนชื่อบทความ "Hello World JavaScript 2025" ให้เป็น URL Slug "hello-world-javascript-2025" (ตัวเล็กทั้งหมด, แทนช่องว่างด้วยขีด)
::: details ✨ ดูเฉลย
```javascript
const title = "Hello World JavaScript 2025";
const slug = title.toLowerCase().split(" ").join("-");
// หรือ title.toLowerCase().replaceAll(" ", "-");
console.log(slug);
```
:::

### 🎯 Challenge 2: Random Dice
**หัวข้อ:** Math
**โจทย์:** สร้างฟังก์ชัน `rollDice()` ที่คืนค่าเลขสุ่ม 1-6
::: details ✨ ดูเฉลย
```javascript
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}
```
:::

### 🎯 Challenge 3: Days Until New Year
**หัวข้อ:** Date
**โจทย์:** คำนวณว่าอีกกี่วันจะถึงวันปีใหม่ (1 มกราคม ของปีถัดไป)?
*(ใบ้: เอา Timestamp มาลบกัน แล้วหารด้วยจำนวน milliseconds ใน 1 วัน)*
::: details ✨ ดูเฉลย
```javascript
const now = new Date();
const nextYear = new Date(now.getFullYear() + 1, 0, 1); // ปีหน้า, เดือน 0, วันที่ 1
const diffMs = nextYear - now; // ผลต่างเป็น milliseconds
const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

console.log(`อีก ${diffDays} วันจะถึงปีใหม่`);
```
:::

### 🎯 Challenge 4: Currency Formatter
**หัวข้อ:** Intl
**โจทย์:** จัด Format ตัวเลข `123456.789` ให้เป็นสกุลเงิน **USD** ($)
::: details ✨ ดูเฉลย
```javascript
const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
}).format(123456.789);
console.log(usd); // "$123,456.79" (ปัดเศษให้อัตโนมัติด้วย)
```
:::

---

## 📖 Glossary (คำศัพท์เทคนิค)

| คำศัพท์ | ความหมาย |
|:-------|:---------|
| **Immutable** | ไม่สามารถเปลี่ยนแปลงค่าเดิมได้ (String ทุกตัวเป็นแบบนี้) |
| **Epoch Time** | เวลาเริ่มต้นของคอมพิวเตอร์ (1 มกราคม 1970 00:00:00 UTC) |
| **Timestamp** | จำนวน Milliseconds ที่ผ่านมาจาก Epoch Time |
| **Intl** | Namespace สำหรับจัดการรูปแบบภาษาและภูมิภาค (Internationalization) |
| **Floating Point** | ระบบเลขทศนิยมในคอมพิวเตอร์ (ซึ่งอาจมีความคลาดเคลื่อนเล็กน้อย) |
| **NaN** | Not-a-Number (ค่าพิเศษที่ได้เมื่อคำนวณเลขผิดพลาด เช่น `"abc" * 2`) |
| **Template Literal** | การใช้ Backticks (`` ` ``) เพื่อแทรกตัวแปรใน String |

---

👉 **[ไปต่อ: 5.6 - Regular Expressions (Regex)](/javascript/05-06-regex)**
