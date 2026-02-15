# 10-1: Error Handling (จัดการข้อผิดพลาดอย่างมืออาชีพ) 🛡️

> **"Errors should never pass silently."**
> — *The Zen of Python (but applies to JS too!)*

โปรแกรมจริงต้อง **คาดการณ์** สิ่งที่ผิดพลาดได้ เช่น User พิมพ์ข้อมูลผิด, API ตอบช้า, ไฟล์ไม่พบ — Error Handling ช่วยให้แอปไม่พัง!

> **💡 Analogy (เปรียบเทียบ):**
> Error Handling เหมือน **"เข็มขัดนิรภัย"** 🚗:
> - ไม่ได้ป้องกันอุบัติเหตุ
> - แต่ทำให้เมื่อเกิดขึ้น → **ไม่ตาย** (แอปไม่พัง!)

---

## 1. try/catch/finally 🎯

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch): `try/catch` คือวิธี **"ดัก Error ไว้"** ไม่ให้แอปพัง — โค้ดที่อาจพังให้ใส่ใน `try` ถ้าพังจะไปทำต่อใน `catch` แทน ส่วน `finally` ทำเสมอไม่ว่าจะ Error หรือไม่! (เหมาะสำหรับปิด Connection, คืนทรัพยากร)

### โครงสร้าง:

```
try { ... }      ← โค้ดที่อาจพัง
catch (error) { ... }  ← ถ้าพัง → ทำตรงนี้
finally { ... }  ← ทำเสมอ (เลือกใส่ได้)
```

```javascript
try {
    // โค้ดที่อาจเกิด Error
    const data = JSON.parse('invalid json');

} catch (error) {
    // ถ้า Error → ทำตรงนี้ (แอปไม่พัง!)
    console.error("❌ Error:", error.message);

} finally {
    // ทำเสมอ — ไม่ว่าจะ Error หรือไม่!
    console.log("🏁 จบแล้ว");
}
```

### Error Object Properties:

```javascript
try {
    undefinedFunction();
} catch (error) {
    console.log(error.name);    // "ReferenceError"
    console.log(error.message); // "undefinedFunction is not defined"
    console.log(error.stack);   // Stack Trace (บอกว่า Error อยู่ไฟล์/บรรทัดไหน)
}
```

---

## 2. Error Types ❌

JavaScript มี Error หลายประเภท แต่ละ **ทำงานคล้ายกัน** — แค่มีชื่อและสาเหตุต่างกัน การรู้จักประเภท Error ช่วยให้ **Debug ได้เร็วขึ้น:**

```javascript
// 🔴 ReferenceError — ใช้ตัวแปรที่ไม่มีอยู่
console.log(x); // ReferenceError: x is not defined

// 🔴 TypeError — ใช้ค่าผิดประเภท
null.toString();        // TypeError: Cannot read properties of null
const num = 42;
num.toUpperCase();      // TypeError: num.toUpperCase is not a function

// 🔴 SyntaxError — เขียน Syntax ผิด
// JSON.parse("{invalid}"); // SyntaxError

// 🔴 RangeError — ค่าเกินขอบเขต
new Array(-1); // RangeError: Invalid array length
```

### 📊 Error Types Reference

| Error Type | เกิดเมื่อ | ตัวอย่าง |
|:-----------|:---------|:--------|
| `ReferenceError` | ใช้ตัวแปรที่ไม่มี | `console.log(x)` |
| `TypeError` | ใช้ค่าผิดประเภท | `null.foo()` |
| `SyntaxError` | Syntax ไม่ถูก | `JSON.parse("{bad}")` |
| `RangeError` | ค่าเกินขอบเขต | `new Array(-1)` |
| `URIError` | URI ไม่ถูก | `decodeURI("%")` |

---

## 3. throw — โยน Error เอง 🏐

นอกจาก Error ที่เกิดเอง (เช่น `ReferenceError`) เรายังสามารถ **สร้าง Error ขึ้นมาเองได้!** ใช้ `throw` เพื่อบอกว่า **"สถานการณ์นี้ไม่ถูกต้อง!"** เช่น หารด้วย 0, Input ไม่ถูกต้อง, ไม่พบข้อมูล:

```javascript
function divide(a, b) {
    if (b === 0) {
        throw new Error("หารด้วย 0 ไม่ได้! 🚫");
    }
    return a / b;
}

try {
    console.log(divide(10, 0));
} catch (error) {
    console.error(error.message); // "หารด้วย 0 ไม่ได้! 🚫"
}
```

### Custom Error Class:

**ทำไมต้อง Custom Error?** เพราะ `Error` ธรรมดาทั่วไปเกินไป — เราอยากแยก Error ประเภทต่างๆ เช่น `ValidationError` vs `NotFoundError` เพื่อจัดการแต่ละประเภทต่างกัน:

```javascript
class ValidationError extends Error {
    constructor(field, message) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

class NotFoundError extends Error {
    constructor(resource) {
        super(`${resource} not found`);
        this.name = "NotFoundError";
    }
}

// ใช้งาน:
function validateAge(age) {
    if (typeof age !== "number") {
        throw new ValidationError("age", "ต้องเป็นตัวเลข!");
    }
    if (age < 0 || age > 150) {
        throw new ValidationError("age", "อายุต้องอยู่ระหว่าง 0-150!");
    }
    return true;
}

try {
    validateAge("abc");
} catch (error) {
    if (error instanceof ValidationError) {
        console.log(`Field: ${error.field}, Error: ${error.message}`);
    } else {
        throw error; // โยนต่อถ้าไม่ใช่ Error ที่เราคาดไว้!
    }
}
```

---

## 4. Error Handling Patterns 🛠️

นักพัฒนามืออาชีพใช้ Pattern เหล่านี้เป็นประจำ — รู้ไว้จะช่วยให้โค้ดทนทานและอ่านง่าย!

### Guard Clause (ตรวจก่อนทำ):

**หลักการ:** ตรวจเงื่อนไขเบื้องต้นก่อน → `throw` ทันที → โค้ดหลักไม่ต้องซ้อน if ลึกๆ:

```javascript
function processUser(user) {
    // ตรวจก่อน → return เลยถ้าไม่ผ่าน
    if (!user) throw new Error("User is required");
    if (!user.name) throw new Error("Name is required");
    if (!user.email) throw new Error("Email is required");

    // ทำงานจริง (ถ้าผ่านทุก Guard)
    return `Processing ${user.name}...`;
}
```

### Graceful Degradation:

**หลักการ:** ถ้าเกิด Error → **ใช้ค่า Default แทน** แทนที่จะพัง เหมาะกับกรณีที่แอปยังทำงานได้แม้ Settings หาย:

```javascript
function getSettings() {
    try {
        const saved = localStorage.getItem("settings");
        return JSON.parse(saved);
    } catch {
        // ถ้า Parse ไม่ได้ → ใช้ค่า Default แทน (ไม่พัง!)
        console.warn("Using default settings");
        return { theme: "light", lang: "th" };
    }
}
```

### Error Boundary (Async):

**หลักการ:** ห่อ Function ด้วย try/catch แล้ว **return `{ data, error }`** — คนเรียกใช้ไม่ต้องจัดการ Error เอง, แค่เช็ค `error` ที่ return มา :

```javascript
async function safeFetch(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { data: await res.json(), error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
}

// ใช้งาน:
const { data, error } = await safeFetch("/api/users");
if (error) {
    showError(error);
} else {
    displayUsers(data);
}
```

---

## 5. Challenges 🏆

### 🎯 Challenge 1: Safe JSON Parse
สร้าง `safeJSONParse(str)` ที่ return `{ data, error }`:

::: details ✨ ดูเฉลย
```javascript
function safeJSONParse(str) {
    try {
        return { data: JSON.parse(str), error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
}

console.log(safeJSONParse('{"name":"A"}'));  // { data: {name:"A"}, error: null }
console.log(safeJSONParse('broken'));        // { data: null, error: "..." }
```
:::

### 🎯 Challenge 2: Custom Error
สร้าง `InsufficientFundsError` สำหรับระบบธนาคาร:

::: details ✨ ดูเฉลย
```javascript
class InsufficientFundsError extends Error {
    constructor(balance, amount) {
        super(`Cannot withdraw ฿${amount}. Balance: ฿${balance}`);
        this.name = "InsufficientFundsError";
        this.balance = balance;
        this.amount = amount;
    }
}

function withdraw(balance, amount) {
    if (amount > balance) throw new InsufficientFundsError(balance, amount);
    return balance - amount;
}

try {
    withdraw(100, 500);
} catch (e) {
    if (e instanceof InsufficientFundsError) {
        console.log(e.message); // "Cannot withdraw ฿500. Balance: ฿100"
    }
}
```
:::

### 🎯 Challenge 3: Retry Function
สร้าง `retry(fn, times)` ที่พยายามเรียก Function ใหม่ถ้า Error — เหมาะกับ Fetch API ที่อาจล้มเหลว:

::: details ✨ ดูเฉลย
```javascript
async function retry(fn, times = 3) {
    for (let i = 1; i <= times; i++) {
        try {
            return await fn(); // สำเร็จ → return เลย!
        } catch (error) {
            console.warn(`ครั้งที่ ${i} ล้มเหลว: ${error.message}`);
            if (i === times) throw error; // ครบแล้ว → โยน Error ออก!
        }
    }
}

// ใช้งาน:
try {
    const data = await retry(() => fetch("/api/data").then(r => r.json()), 3);
    console.log(data);
} catch (e) {
    console.error("ล้มเหลว 3 ครั้ง:", e.message);
}
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **`try`:** Block ที่ใส่โค้ดที่อาจเกิด Error
> *   **`catch`:** Block ที่จัดการ Error (แอปไม่พัง)
> *   **`finally`:** Block ที่ทำเสมอไม่ว่า Error หรือไม่
> *   **`throw`:** โยน Error เอง
> *   **Error Object:** Object ที่มี `name`, `message`, `stack`
> *   **Custom Error:** Error Class ที่สร้างเองด้วย `extends Error`
> *   **Guard Clause:** ตรวจเงื่อนไขเบื้องต้นก่อนทำงาน
> *   **Graceful Degradation:** ทำงานต่อได้แม้เกิด Error (ใช้ค่า Default)
> *   **Stack Trace:** ข้อมูลที่บอกว่า Error เกิดที่ไหนในโค้ด

---
👉 **[ไปต่อ: 10-2 - Debugging (เทคนิคหาบัค)](/10-02-debugging)**
