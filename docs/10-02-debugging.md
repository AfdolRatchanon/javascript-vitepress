# 10-2: Debugging (เทคนิคหาบัค — เครื่องมือนักสืบ) 🔍

> **"Debugging is twice as hard as writing the code in the first place."**
> — *Brian Kernighan*

การเขียนโค้ดให้ถูกเป็นเรื่องหนึ่ง แต่เมื่อมีบัค → ต้อง **หาให้เจอ** และ **แก้ให้ตรงจุด**! บทนี้จะสอนเครื่องมือและเทคนิคที่มืออาชีพใช้จริง

---

## 1. console Methods (ไม่ใช่แค่ .log!) 📝

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/console):

```javascript
// 1. console.log() — พิมพ์ข้อมูลทั่วไป
console.log("Hello");
console.log("User:", { name: "Dolar", age: 25 });

// 2. console.error() — ข้อความ Error (สีแดง!)
console.error("❌ Something went wrong!");

// 3. console.warn() — ข้อความเตือน (สีเหลือง!)
console.warn("⚠️ This function is deprecated!");

// 4. console.table() — แสดงเป็นตาราง! 📊
const users = [
    { name: "Dolar", age: 25 },
    { name: "Somchai", age: 30 },
];
console.table(users);

// 5. console.group() / groupEnd() — จัดกลุ่ม
console.group("User Details");
    console.log("Name: Dolar");
    console.log("Age: 25");
console.groupEnd();

// 6. console.time() / timeEnd() — จับเวลา!
console.time("Loop");
for (let i = 0; i < 1000000; i++) { /* ... */ }
console.timeEnd("Loop"); // "Loop: 12.5ms"

// 7. console.count() — นับจำนวนครั้ง
function handleClick() {
    console.count("clicked");
}
handleClick(); // "clicked: 1"
handleClick(); // "clicked: 2"

// 8. console.assert() — พิมพ์เฉพาะเมื่อ false
console.assert(1 === 1, "This won't show");
console.assert(1 === 2, "❌ This will show!");

// 9. console.dir() — แสดง Object แบบ Interactive
console.dir(document.body);

// 10. console.clear() — ล้างหน้าจอ Console
console.clear();
```

### 📊 Console Methods Quick Reference

| Method | ใช้ทำอะไร | เมื่อไหร่ |
|:-------|:---------|:---------|
| `.log()` | พิมพ์ทั่วไป | ตรวจค่าตัวแปร |
| `.error()` | แสดง Error (สีแดง) | เมื่อเกิด Error |
| `.warn()` | เตือน (สีเหลือง) | Deprecated, risky code |
| `.table()` | ตาราง | Array/Object ที่มีโครงสร้าง |
| `.time()` | จับเวลา | วัด Performance |
| `.count()` | นับครั้ง | นับว่าฟังก์ชันถูกเรียกกี่ครั้ง |
| `.assert()` | เช็คเงื่อนไข | ตรวจสอบว่าค่าถูกต้อง |
| `.group()` | จัดกลุ่ม | จัด Log ให้อ่านง่าย |

---

## 2. Chrome DevTools — Debugger 🛠️

### เปิด DevTools:
- **Windows:** `F12` หรือ `Ctrl + Shift + I`
- **Mac:** `Cmd + Option + I`

### Breakpoints (จุดหยุด):

```javascript
function calculateTotal(items) {
    let total = 0;
    
    debugger; // ⭐ Breakpoint ในโค้ด! — DevTools จะหยุดตรงนี้
    
    for (const item of items) {
        total += item.price * item.quantity;
    }
    
    return total;
}
```

### DevTools Panels:

| Panel | ใช้ทำอะไร |
|:------|:---------|
| **Elements** | ดู/แก้ HTML + CSS |
| **Console** | รันโค้ด JavaScript |
| **Sources** | ดูโค้ด + ตั้ง Breakpoints |
| **Network** | ดู HTTP Requests (Fetch, API) |
| **Application** | ดู localStorage, cookies |
| **Performance** | วัดความเร็ว |

### Breakpoint Controls:

| ปุ่ม | ชื่อ | ทำอะไร |
|:-----|:-----|:------|
| ▶️ | Resume | ทำงานต่อจนเจอ Breakpoint ถัดไป |
| ⏭️ | Step Over | ข้ามไปบรรทัดถัดไป |
| ⬇️ | Step Into | เข้าไปใน Function |
| ⬆️ | Step Out | ออกจาก Function ปัจจุบัน |

---

## 3. Debugging Strategies 🧠

### Strategy 1: Binary Search Debugging

```javascript
// บัค: Function return ค่าผิด
function processData(data) {
    const step1 = filterData(data);
    console.log("Step 1:", step1); // ✅ ถูก? → บัคอยู่ข้างล่าง

    const step2 = transformData(step1);
    console.log("Step 2:", step2); // ❌ ผิด! → บัคอยู่ใน transformData!

    const step3 = formatData(step2);
    return step3;
}
// เทคนิค: ใส่ log ครึ่งทาง → หาว่าบัคอยู่ครึ่งบนหรือครึ่งล่าง
```

### Strategy 2: Rubber Duck Debugging 🦆

> อธิบายโค้ดทีละบรรทัดให้ **เป็ดยาง** ฟัง (หรือใครก็ได้!) — มักจะเจอบัคระหว่างอธิบาย!

### Strategy 3: Comment Out

```javascript
function buggyFunction() {
    // ปิดทีละส่วน จนเจอว่าส่วนไหนทำให้พัง
    doA();
    doB();
    // doC(); // ← ลอง Comment → ถ้าไม่พัง = บัคอยู่ใน doC!
    doD();
}
```

---

## 4. Common Bugs & Fixes 🐛

```javascript
// 🐛 Bug 1: Off-by-one Error
for (let i = 0; i <= arr.length; i++) { } // ❌ <= ทำให้เกินอีก 1
for (let i = 0; i < arr.length; i++) { }  // ✅ <

// 🐛 Bug 2: == vs ===
if (input == 0)  { } // ❌ "" == 0 is true!
if (input === 0) { } // ✅ Strict comparison

// 🐛 Bug 3: Missing return
function add(a, b) {
    a + b; // ❌ ลืม return!
}
function add(a, b) {
    return a + b; // ✅
}

// 🐛 Bug 4: Async/Await
async function getData() {
    const data = fetch("/api"); // ❌ ลืม await!
    const data2 = await fetch("/api"); // ✅
}

// 🐛 Bug 5: Mutation
const original = [1, 2, 3];
const copy = original; // ❌ ไม่ได้ Copy! (Reference เดียวกัน)
const copy2 = [...original]; // ✅ Spread = Copy จริง!
```

---

## 5. Challenges 🏆

### 🎯 Challenge 1: Find the Bug
```javascript
function getAverage(numbers) {
    let sum = 0;
    for (let i = 1; i <= numbers.length; i++) {
        sum += numbers[i];
    }
    return sum / numbers.length;
}
console.log(getAverage([10, 20, 30])); // NaN — ทำไม?
```

::: details ✨ ดูเฉลย
```javascript
// Bug 1: i เริ่มจาก 1 → ข้ามตัวแรก
// Bug 2: i <= length → เกินอีก 1 (undefined)
function getAverage(numbers) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) { // ✅ แก้: 0 และ <
        sum += numbers[i];
    }
    return sum / numbers.length;
}
```
:::

### 🎯 Challenge 2: Debug Async
```javascript
async function loadUser() {
    const res = fetch("/api/user/1");
    const user = res.json();
    return user;
}
```
ทำไมได้ Promise แทน Object จริง?

::: details ✨ ดูเฉลย
```javascript
async function loadUser() {
    const res = await fetch("/api/user/1");  // ✅ เพิ่ม await
    const user = await res.json();            // ✅ เพิ่ม await
    return user;
}
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Bug:** ข้อผิดพลาดในโค้ดที่ทำให้ทำงานไม่ถูกต้อง
> *   **Debugging:** กระบวนการค้นหาและแก้ไข Bug
> *   **Breakpoint:** จุดหยุดที่ทำให้โค้ดหยุดทำงานเพื่อตรวจสอบ
> *   **`debugger`:** คำสั่งที่ทำให้ DevTools หยุดที่บรรทัดนั้น
> *   **Stack Trace:** ข้อมูลลำดับการเรียก Function ที่นำไปสู่ Error
> *   **DevTools:** เครื่องมือสำหรับ Developer ที่มาพร้อม Browser
> *   **Console Panel:** แท็บสำหรับรันและดู Output ของ JavaScript
> *   **Network Panel:** แท็บสำหรับดู HTTP Requests ทั้งหมด
> *   **Off-by-one:** Bug ที่เกิดจากการนับผิดไป 1

---
👉 **[ไปทำโปรเจกต์: Project — Form Validator](/10-project-form-validator)**
