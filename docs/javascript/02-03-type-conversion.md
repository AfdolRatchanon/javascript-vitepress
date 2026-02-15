# 02-3: Type Conversion & Coercion (การแปลงชนิดข้อมูล) 🔄

> **"JavaScript's type coercion is one of the most misunderstood features of the language."**
> — *Kyle Simpson (You Don't Know JS)*

JavaScript ยอมให้เราเขียน `"5" + 3` ได้โดยไม่ Error — แต่ผลลัพธ์อาจไม่ใช่สิ่งที่คุณคิด! การเข้าใจ **Type Conversion** คือกุญแจสู่การเขียน JavaScript ที่ปลอดภัยครับ

> **💡 Analogy (เปรียบเทียบ):**
> Type Conversion เหมือน **"การแปลภาษา"** ครับ:
> - **Explicit Conversion** = คุณ **จ้างล่ามมืออาชีพ** มาแปล → ผลลัพธ์ชัดเจน แม่นยำ
> - **Implicit Coercion** = คุณ **ป้อนข้อความเข้า Google Translate แล้วหวังว่ามันจะถูก** → บางทีแปลถูก บางทีแปลผิดแบบฮาๆ

## 1. Explicit Conversion (แปลงแบบชัดเจน) 🎯

เราเป็นคน **สั่งแปลง** เอง — ผลลัพธ์ Predictable:

### A. แปลงเป็น Number:

```javascript
// Number() — ฟังก์ชันหลัก
console.log(Number("42"));       // 42 ✅
console.log(Number("3.14"));     // 3.14
console.log(Number(""));         // 0 ← String ว่าง = 0
console.log(Number("  "));       // 0 ← Whitespace = 0
console.log(Number("hello"));    // NaN ← แปลงไม่ได้!
console.log(Number(true));       // 1
console.log(Number(false));      // 0
console.log(Number(null));       // 0
console.log(Number(undefined));  // NaN ← ⚠️ ไม่เหมือน null!

// parseInt() — แปลงเป็นจำนวนเต็ม (ตัดทศนิยม, อ่านจนกว่าจะเจอตัวอักษร)
console.log(parseInt("42px"));     // 42 ← ตัด "px" ออก!
console.log(parseInt("3.99"));     // 3  ← ตัดทศนิยม
console.log(parseInt("abc"));      // NaN
console.log(parseInt("0xFF"));     // 255 ← เข้าใจ Hexadecimal!
console.log(parseInt("10", 2));    // 2  ← เลขฐาน 2 (Binary)

// parseFloat() — แปลงเป็นทศนิยม
console.log(parseFloat("3.14px")); // 3.14
console.log(parseFloat(".5"));     // 0.5

// Unary + (ลัดสุด)
console.log(+"42");    // 42
console.log(+true);    // 1
console.log(+"");      // 0
console.log(+"hello"); // NaN
```

### 📊 Number Conversion Quick Reference

| Input | `Number()` | `parseInt()` | `parseFloat()` | `+` (Unary) |
|:------|:-----------|:------------|:---------------|:------------|
| `"42"` | `42` | `42` | `42` | `42` |
| `"3.14"` | `3.14` | `3` | `3.14` | `3.14` |
| `"42px"` | **`NaN`** | `42` | `42` | **`NaN`** |
| `""` | `0` | **`NaN`** | **`NaN`** | `0` |
| `true` | `1` | **`NaN`** | **`NaN`** | `1` |
| `null` | `0` | **`NaN`** | **`NaN`** | `0` |
| `undefined` | **`NaN`** | **`NaN`** | **`NaN`** | **`NaN`** |

### B. แปลงเป็น String:

```javascript
// String() — ฟังก์ชันหลัก
console.log(String(42));        // "42"
console.log(String(3.14));      // "3.14"
console.log(String(true));      // "true"
console.log(String(false));     // "false"
console.log(String(null));      // "null"
console.log(String(undefined)); // "undefined"
console.log(String(NaN));       // "NaN"

// .toString() — Method ของ Value (null/undefined ใช้ไม่ได้!)
console.log((42).toString());   // "42"
console.log(true.toString());   // "true"
// null.toString();              // ❌ TypeError!

// Template Literal — วิธีที่นิยมที่สุด
const num = 42;
console.log(`${num}`);          // "42"
console.log(`Value: ${null}`);  // "Value: null"
```

### C. แปลงเป็น Boolean:

```javascript
// Boolean() — ฟังก์ชันหลัก
console.log(Boolean(1));         // true
console.log(Boolean(0));         // false
console.log(Boolean("hello"));  // true
console.log(Boolean(""));       // false
console.log(Boolean(null));      // false
console.log(Boolean(undefined)); // false
console.log(Boolean(NaN));       // false
console.log(Boolean([]));        // true ← ⚠️ Array ว่างก็เป็น true!
console.log(Boolean({}));        // true ← ⚠️ Object ว่างก็เป็น true!

// !! (Double NOT) — วิธีลัด
console.log(!!"hello"); // true
console.log(!!"");       // false
console.log(!!0);        // false
console.log(!!42);       // true
```

---

## 2. Falsy vs Truthy Values (ค่าเท็จ vs ค่าจริง) 🎭

ทุกค่าใน JavaScript ถูกแบ่งเป็น 2 กลุ่ม:

### Falsy Values (มีแค่ 8 ค่า — จำได้!)

```javascript
// ❌ ค่าเหล่านี้ = false เมื่ออยู่ใน Boolean Context
Boolean(false);      // false
Boolean(0);          // false
Boolean(-0);         // false
Boolean(0n);         // false (BigInt zero)
Boolean("");         // false (Empty string)
Boolean(null);       // false
Boolean(undefined);  // false
Boolean(NaN);        // false
```

### Truthy Values (ทุกอย่างที่ไม่ใช่ Falsy)

```javascript
// ✅ ทุกค่านอกจาก 8 ค่าข้างบน = true!
Boolean(1);          // true
Boolean(-1);         // true ← เลขติดลบก็ Truthy!
Boolean("0");        // true ← String "0" ≠ Number 0!
Boolean("false");    // true ← String "false" ≠ Boolean false!
Boolean([]);         // true ← ⚠️ Array ว่าง = Truthy!
Boolean({});         // true ← ⚠️ Object ว่าง = Truthy!
Boolean(" ");        // true ← Space = Truthy!
```

### 📊 Falsy Values Complete Table

| Falsy Value | `typeof` | หมายเหตุ |
|:------------|:---------|:---------|
| `false` | `"boolean"` | ค่า Boolean false ปกติ |
| `0` | `"number"` | เลขศูนย์ |
| `-0` | `"number"` | ลบศูนย์ (มีอยู่จริง!) |
| `0n` | `"bigint"` | BigInt ศูนย์ |
| `""` | `"string"` | String ว่าง |
| `null` | `"object"` | ค่าว่างที่ตั้งใจ |
| `undefined` | `"undefined"` | ยังไม่มีค่า |
| `NaN` | `"number"` | Not a Number |

### 🧠 Challenge: Truthy or Falsy?
```javascript
Boolean("0")      // (1)?
Boolean([])       // (2)?
Boolean(null)     // (3)?
Boolean(" ")      // (4)?
Boolean(0)        // (5)?
Boolean("false")  // (6)?
```

::: details ✨ ดูเฉลย
1. **`true`** — String `"0"` ไม่ใช่ String ว่าง → Truthy!
2. **`true`** — Array ว่าง `[]` เป็น Object → Truthy! (กับดักคลาสสิก!)
3. **`false`** — `null` เป็น Falsy
4. **`true`** — `" "` (Space) ไม่ใช่ String ว่าง → Truthy!
5. **`false`** — `0` เป็น Falsy
6. **`true`** — String `"false"` ไม่ใช่ String ว่าง → Truthy! (ชื่อ "false" แต่ค่าเป็น true!)
:::

---

## 3. Implicit Coercion (แปลงอัตโนมัติ — อันตราย!) ⚡

JavaScript จะ **แอบแปลงชนิดข้อมูล** ให้อัตโนมัติเมื่อเจอ Operator ที่ต้องการชนิดข้อมูลต่าง:

### A. `+` Operator — String vs Number

```javascript
// กฎ: ถ้ามี String อยู่ฝั่งใดฝั่งหนึ่ง → + จะเป็น "ต่อ String"
console.log("5" + 3);      // "53" ← String + Number = String! 😱
console.log(5 + "3");      // "53"
console.log("5" + "3");    // "53"
console.log("hello" + 5);  // "hello5"

// ถ้าไม่มี String → + เป็น "บวกเลข"
console.log(5 + 3);        // 8 ← Number + Number = Number ✅
console.log(true + 1);     // 2 ← true → 1 → 1 + 1
console.log(false + 5);    // 5 ← false → 0 → 0 + 5
console.log(null + 5);     // 5 ← null → 0 → 0 + 5
```

### B. `-`, `*`, `/` Operators — เป็นเลขเสมอ

```javascript
// กฎ: เครื่องหมาย -, *, / จะแปลงเป็น Number เสมอ
console.log("10" - 5);     // 5 ← "10" → 10 → 10 - 5
console.log("10" * 2);     // 20
console.log("10" / 2);     // 5
console.log("hello" - 5);  // NaN ← "hello" → NaN → NaN - 5
```

### C. Comparison Operators

```javascript
// == (Loose Equality) — แปลงชนิดข้อมูลก่อนเปรียบเทียบ
console.log(5 == "5");      // true ← "5" ถูกแปลงเป็น 5
console.log(0 == false);    // true ← false ถูกแปลงเป็น 0
console.log(0 == "");       // true ← "" ถูกแปลงเป็น 0
console.log(null == undefined); // true ← กรณีพิเศษ!
console.log(null == 0);     // false ← null ไม่ถูกแปลงเป็น 0 ในกรณีนี้!

// === (Strict Equality) — ไม่แปลง เปรียบเทียบทั้งค่าและชนิด
console.log(5 === "5");     // false ← ต่าง type!
console.log(0 === false);   // false
console.log(null === undefined); // false
```

### 📊 `==` vs `===` Quick Reference

| Expression | `==` (Loose) | `===` (Strict) |
|:-----------|:------------|:---------------|
| `5 == "5"` | ✅ `true` | ❌ `false` |
| `0 == false` | ✅ `true` | ❌ `false` |
| `0 == ""` | ✅ `true` | ❌ `false` |
| `null == undefined` | ✅ `true` | ❌ `false` |
| `false == ""` | ✅ `true` | ❌ `false` |
| `1 == true` | ✅ `true` | ❌ `false` |
| `NaN == NaN` | ❌ `false` | ❌ `false` |
| `null == 0` | ❌ `false` | ❌ `false` |

> **กฎเหล็ก:** ใช้ `===` เสมอ! `==` มีกฎ Coercion ที่ซับซ้อนและ Unpredictable

### D. The Infamous Coercion Examples:

```javascript
// 🤯 ผลลัพธ์สุด WTF ของ JavaScript
console.log([] + []);         // "" (Empty String)
console.log([] + {});         // "[object Object]"
console.log({} + []);         // "[object Object]" หรือ 0 (ขึ้นกับ Context!)
console.log(true + true);     // 2
console.log(true + "1");      // "true1"
console.log("5" - - "3");     // 8 ← "5" - (-"3") = 5 - (-3) = 8
console.log("" + 0);          // "0"
console.log([] == false);     // true ← [] → "" → 0, false → 0, 0 == 0
```

---

## 4. Best Practices (แนวทางปฏิบัติที่ดี) ✅

```javascript
// ✅ DO: แปลงชนิดข้อมูลอย่างชัดเจน (Explicit)
const userInput = "42";
const price = Number(userInput);      // ชัดเจน: แปลงเป็น Number
const isValid = Boolean(userInput);   // ชัดเจน: แปลงเป็น Boolean

// ✅ DO: ใช้ === เสมอ
if (price === 42) { /* ... */ }

// ❌ DON'T: ปล่อยให้ JS แปลงเอง (Implicit)
const total = userInput + 10;         // "4210" 😱 (String concatenation!)
if (price == "42") { /* ... */ }      // ⚠️ Loose equality

// ✅ DO: ตรวจสอบ Input ก่อนใช้
function processAge(input) {
    const age = Number(input);
    if (Number.isNaN(age)) {
        return "Invalid input!";
    }
    if (age < 0 || age > 150) {
        return "Age out of range!";
    }
    return `Age: ${age}`;
}

console.log(processAge("25"));    // "Age: 25"
console.log(processAge("hello")); // "Invalid input!"
console.log(processAge("-5"));    // "Age out of range!"
```

---

## 5. Final Challenge: The Coercion Lab 🧪

### 🎯 Challenge 1: Predict Every Output
```javascript
console.log(1 + "2" + 3);        // (1)?
console.log(1 + 2 + "3");        // (2)?
console.log("5" - 3);            // (3)?
console.log("5" + 3);            // (4)?
console.log(true + false + "1"); // (5)?
console.log("" == false);        // (6)?
console.log(" " == false);       // (7)?
```

::: details ✨ ดูเฉลย
1. **`"123"`** — `1 + "2"` → `"12"` → `"12" + 3` → `"123"` (ซ้ายไปขวา !)
2. **`"33"`** — `1 + 2` → `3` → `3 + "3"` → `"33"`
3. **`2`** — `-` แปลงเป็น Number: `"5"` → `5` → `5 - 3` → `2`
4. **`"53"`** — `+` กับ String: ต่อเป็น String → `"53"`
5. **`"11"`** — `true + false` = `1 + 0` = `1` → `1 + "1"` → `"11"`
6. **`true`** — `""` → `0`, `false` → `0`, `0 == 0` → `true`
7. **`true`** — `" "` → `0` (whitespace ถูก trim), `false` → `0`, `0 == 0` → `true`
:::

### 🎯 Challenge 2: Safe Input Converter
เขียนฟังก์ชัน `safeNumber(input)` ที่:
- แปลง Input เป็น Number
- ถ้าแปลงไม่ได้ (NaN) → return `0` แทน
- ถ้าเป็น Infinity → return `0`

```javascript
console.log(safeNumber("42"));      // 42
console.log(safeNumber("hello"));   // 0
console.log(safeNumber(true));      // 1
console.log(safeNumber(null));      // 0
console.log(safeNumber("1/0"));     // 0
```

::: details ✨ ดูเฉลย
```javascript
function safeNumber(input) {
    const num = Number(input);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
        return 0;
    }
    return num;
}

console.log(safeNumber("42"));      // 42 ✅
console.log(safeNumber("hello"));   // 0 (NaN → 0)
console.log(safeNumber(true));      // 1
console.log(safeNumber(null));      // 0
console.log(safeNumber(Infinity));  // 0 (Infinity → 0)
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Type Conversion:** การเปลี่ยนชนิดข้อมูลจากชนิดหนึ่งไปเป็นอีกชนิดหนึ่ง
> *   **Explicit Conversion (Type Casting):** การแปลงชนิดข้อมูลที่ Programmer สั่งเอง เช่น `Number("42")`
> *   **Implicit Coercion:** การแปลงชนิดข้อมูลที่ JS ทำอัตโนมัติเมื่อเจอ Operator
> *   **Truthy:** ค่าที่ถือว่าเป็น `true` ใน Boolean Context (ทุกอย่างที่ไม่ใช่ Falsy)
> *   **Falsy:** ค่าที่ถือว่าเป็น `false` ใน Boolean Context (มี 8 ค่า: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`)
> *   **Loose Equality (`==`):** เปรียบเทียบค่าหลัง Coercion — Type ต่างกันก็ `true` ได้
> *   **Strict Equality (`===`):** เปรียบเทียบทั้งค่าและ Type — ต้องเหมือนกันทั้งสองอย่าง
> *   **NaN (Not a Number):** ผลลัพธ์จากการคำนวณที่ไม่สามารถให้ผลเป็นตัวเลขได้
> *   **parseInt():** ฟังก์ชันแปลง String เป็น Integer (ตัดทศนิยม, หยุดที่ตัวอักษรแรกที่ไม่ใช่เลข)
> *   **parseFloat():** ฟังก์ชันแปลง String เป็น Floating-Point Number
> *   **Unary Plus (`+`):** Operator ที่แปลง Operand เป็น Number (shorthand ของ `Number()`)
> *   **Template Literal:** String ที่ใช้ Backtick `` ` `` ที่แปลง Expression เป็น String อัตโนมัติ

---
👉 **[ไปต่อ: 02-4 - Operators (ตัวดำเนินการ)](/02-04-operators)**
