# 02-4: Type Conversion & Coercion (การแปลงชนิดข้อมูล) 🔄

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

## Real-World Use Case: แปลงข้อมูลจาก HTML Form 🌐

ข้อมูลจาก `<input>` ใน HTML เป็น **String เสมอ** ถ้าไม่แปลงก่อนคำนวณจะเกิดบัค:

```javascript
// ❌ ไม่แปลง — ได้ผลลัพธ์ผิด!
const priceInput = "100";    // จาก <input type="text">
const qtyInput = "3";
console.log(priceInput * qtyInput);  // 300 (บังเอิญถูก เพราะ * แปลงให้)
console.log(priceInput + qtyInput);  // "1003" 😱 (+ ต่อ String!)

// ✅ แปลงก่อน — ปลอดภัย
const price = Number(priceInput);
const qty = parseInt(qtyInput);
console.log(price + qty); // 103 ✅
```



## 7. Challenges 🏆

ทดสอบความเข้าใจเรื่องการแปลงชนิดข้อมูลครับ:

### 🎯 Challenge 1: The Explicit Way
**หัวข้อ:** 1. Explicit Conversion

**โจทย์:** จงแปลงค่าเหล่านี้ให้เป็น **Number** อย่างถูกต้อง:
1. `"042"` (String)
2. `"3.14"` (String)
3. `"Hello"` (String)
::: details ✨ ดูเฉลย
```javascript
Number("042");   // 42
Number("3.14");  // 3.14
Number("Hello"); // NaN
```
:::

### 🎯 Challenge 2: The 8 Falsy Values
**หัวข้อ:** 2. Falsy Values

**โจทย์:** ใน JavaScript มีค่า **Falsy** อยู่ 8 ค่า จงบอกมาให้ได้อย่างน้อย 5 ค่า!
::: details ✨ ดูเฉลย
1. `false`
2. `0`
3. `-0`
4. `0n` (BigInt zero)
5. `""` (Empty string)
6. `null`
7. `undefined`
8. `NaN`
:::

### 🎯 Challenge 3: Coercion Detective
**หัวข้อ:** 3. Implicit Coercion

**โจทย์:** ทำนายผลลัพธ์ของ `1 + "2" + 3` และ `1 + 2 + "3"`
::: details ✨ ดูเฉลย
- `1 + "2" + 3` = **`"123"`** (เจอ String ตัวแรก → เป็น String หมด)
- `1 + 2 + "3"` = **`"33"`** (1+2=3 ก่อน แล้วค่อยต่อกับ "3")
:::

### 🎯 Challenge 4: Safe Conversion
**หัวข้อ:** 4. Best Practices

**โจทย์:** โค้ดนี้ปลอดภัยหรือไม่? `const age = userInput + 0;` (สมมติ userInput เป็น String)
::: details ✨ ดูเฉลย
**ไม่ปลอดภัยครับ** เพราะ `+ 0` อาจทำให้เกิด String Concatenation ได้ (เช่น "10" + 0 = "100"!)
วิธีที่ถูกคือใช้ `Number(userInput)` ครับ
:::



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


👉 **[ไปต่อ: 02-4 - Operators (ตัวดำเนินการ)](/javascript/02-03-operators)**
