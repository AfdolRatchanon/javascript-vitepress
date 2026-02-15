# 04-3: Scope & Closures (ขอบเขตและการจดจำ) 🔒

> **"Closures are nothing more than accessing a variable that is outside of the function scope."**
> — *Kyle Simpson (You Don't Know JS)*

เมื่อเราเขียนฟังก์ชันซ้อนฟังก์ชัน ตัวแปรที่ประกาศข้างในสามารถเข้าถึงตัวแปรข้างนอกได้ แต่กลับกันไม่ได้ เหมือนกับกระจกสองทาง (**One-way Glass**) ข้างในมองออกได้ แต่ข้างนอกมองเข้าไม่ได้

> **💡 Analogy (เปรียบเทียบ):**
> Scope เป็นเหมือน **"ชั้นของตึก"** ครับ:
> - **Global Scope** = ชั้น 1 (ล็อบบี้) — ทุกคนเข้าถึงได้
> - **Function Scope** = ห้องส่วนตัวในชั้นนั้นๆ — เข้าได้เฉพาะคนในห้อง
> - **Block Scope** = ลิ้นชักในห้อง — เฉพาะเจ้าของลิ้นชักเข้าถึงได้
>
> **Closure** เป็นเหมือน **"กุญแจสำรอง"** ที่คนที่ออกจากห้องไปแล้ว ยังถือกุญแจเข้าห้องเก่าอยู่ ทำให้สามารถกลับเข้าไปหยิบของที่อยู่ข้างในได้ตลอด!

## 1. Scope คืออะไร? (What is Scope?) 🌍

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Scope) **Scope** คือ "ขอบเขตที่ตัวแปรสามารถถูกเข้าถึงได้" ถ้าตัวแปรอยู่นอก Scope ที่คุณอยู่ คุณก็จะเข้าถึงมันไม่ได้

### A. Global Scope (ขอบเขตระดับโลก)

ตัวแปรที่ประกาศ **ข้างนอกฟังก์ชัน/บล็อกทั้งหมด** จะอยู่ใน Global Scope — เข้าถึงได้จากทุกที่ในโปรแกรม:

```javascript
// Global Scope — ทุกที่เข้าถึงได้
const appName = "MyApp";
let userCount = 0;

function showInfo() {
    // ✅ ฟังก์ชันเข้าถึง Global ได้
    console.log(appName);  // "MyApp"
    userCount++;
}

showInfo();
console.log(userCount); // 1

// ⚠️ Polluting Global Scope (มลพิษในขอบเขตระดับโลก)
// ตัวแปร Global มากเกินไป = Bug ง่ายมาก เพราะใครก็แก้ได้!
```

### B. Function Scope (ขอบเขตระดับฟังก์ชัน)

ตัวแปรที่ประกาศ **ข้างในฟังก์ชัน** จะเข้าถึงได้แค่ภายในฟังก์ชันนั้นเท่านั้น:

```javascript
function greet() {
    const message = "Hello!"; // Function Scope
    console.log(message);     // ✅ "Hello!"
}

greet();
// console.log(message); // ❌ ReferenceError: message is not defined
// ข้างนอกมองเข้าถึงข้างในไม่ได้!
```

### C. Block Scope (ขอบเขตระดับบล็อก — `let`/`const`)

ตัวแปรที่ประกาศด้วย `let` หรือ `const` ภายใน `{}` (Curly Braces) จะเข้าถึงได้แค่ในบล็อกนั้น:

```javascript
if (true) {
    const secret = "Block scoped!";
    let temp = 42;
    var leaked = "I escaped!"; // ⚠️ var ไม่ respect Block Scope!
    console.log(secret); // ✅ "Block scoped!"
}

// console.log(secret); // ❌ ReferenceError (const — Block scoped)
// console.log(temp);   // ❌ ReferenceError (let — Block scoped)
console.log(leaked);    // ✅ "I escaped!" (var — Function/Global scoped)
```

### 📊 Block Scope vs Function Scope

| คำสั่ง | Block Scope (`{}`) | Function Scope | Global Scope |
|:-------|:----------------:|:-------------:|:------------:|
| **`const`** | ✅ ถูกจำกัด | ✅ ถูกจำกัด | ✅ ทั่วโลก |
| **`let`** | ✅ ถูกจำกัด | ✅ ถูกจำกัด | ✅ ทั่วโลก |
| **`var`** | ❌ **รั่วออกมา!** | ✅ ถูกจำกัด | ✅ ทั่วโลก |

> **กฎเหล็ก:** ใช้ `const` เป็นค่าเริ่มต้น ใช้ `let` เมื่อต้องเปลี่ยนค่า **อย่าใช้ `var` เด็ดขาด!**

### 🧠 Challenge: Scope Detective 🔍
โค้ดนี้จะ Error ที่บรรทัดไหน? ทำไม?
```javascript
function outer() {
    const a = 1;
    
    if (true) {
        const b = 2;
        var c = 3;
        console.log(a); // (1)
        console.log(b); // (2)
    }
    
    console.log(a); // (3)
    console.log(b); // (4)
    console.log(c); // (5)
}
outer();
```

::: details ✨ ดูเฉลย
1. ✅ `1` — `a` อยู่ใน Function Scope เดียวกัน เข้าถึงจาก Block ข้างในได้
2. ✅ `2` — `b` อยู่ใน Block เดียวกัน
3. ✅ `1` — `a` ยังอยู่ใน Function Scope
4. ❌ **ReferenceError!** — `b` เป็น `const` → Block Scope → ออกจาก `if {}` แล้วหมดอายุ
5. ✅ `3` — `c` เป็น `var` → **ไม่ respect Block Scope** → รั่วออกมาอยู่ใน Function Scope

**บทเรียน:** นี่คือเหตุผลที่ `var` อันตราย — มันรั่วออกจาก Block!
:::

---

## 2. Scope Chain (ห่วงโซ่ขอบเขต) ⛓️

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#function_scopes_and_closures) เมื่อ JS ต้องการค่าของตัวแปร มันจะ **ค้นหาจากข้างในออกข้างนอก** (Inner → Outer → Global) เรียกว่า **Scope Chain**:

```javascript
const color = "red";        // Global Scope

function outer() {
    const color = "blue";   // Outer Function Scope

    function inner() {
        const color = "green"; // Inner Function Scope
        console.log(color);    // "green" ← พบในตัวเอง หยุดค้นหา!
    }

    function innerNoColor() {
        console.log(color);    // "blue" ← ไม่มีในตัวเอง → ค้นหาข้างนอก!
    }

    inner();
    innerNoColor();
}

outer();
```

### 🔍 วิธีค้นหาแบบ Scope Chain (Visual):

```
inner()       → มี color ไหม?  → ✅ "green" → ใช้เลย!
innerNoColor()→ มี color ไหม?  → ❌ → ขึ้นไป outer()
              → outer() มี color ไหม? → ✅ "blue" → ใช้เลย!
              
// ถ้าไม่มีใน outer() ด้วย จะขึ้นไปหาใน Global
// ถ้า Global ก็ไม่มี → ReferenceError!
```

### Name Conflicts (ตัวแปรชื่อซ้ำ):

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#name_conflicts) ถ้ามีตัวแปรชื่อเดียวกันหลาย Scope ตัวที่อยู่ **ใกล้ที่สุด** (Innermost) จะชนะเสมอ — เรียกว่า **Variable Shadowing**:

```javascript
const num1 = 20;
const num2 = 3;

function multiply() {
    return num1 * num2; // ใช้ Global: 20 * 3
}

function getScore() {
    const num1 = 2;  // Shadow ตัว Global!
    const num2 = 3;

    function add() {
        return num1 + num2; // ใช้ตัวในฟังก์ชัน getScore: 2 + 3
    }

    return add();
}

console.log(multiply());  // 60 (20 * 3)
console.log(getScore());  // 5  (2 + 3) ← ไม่ใช่ 23!
```

### 🧠 Challenge: Scope Chain Trace
จงทำนาย Output ทุกบรรทัด:
```javascript
const x = "global";

function a() {
    const x = "a";
    
    function b() {
        console.log(x); // (1)
    }
    
    function c() {
        const x = "c";
        b();             // (2) b() ถูกเรียกจาก c() แต่ b() ถูก "สร้าง" ใน a()
    }
    
    b(); // (3)
    c(); // (4)
}
a();
```

::: details ✨ ดูเฉลย
- (1) `"a"` — `b()` ไม่มี `x` ของตัวเอง → ค้นหาใน Scope ที่ `b` ถูก **สร้าง** (ไม่ใช่ถูกเรียก!) → พบใน `a()` → `"a"`
- (3) `"a"` — เหมือนข้อ 1
- (2) & (4) `"a"` — แม้ `b()` จะถูกเรียกจากภายใน `c()` แต่ Scope Chain ของ `b()` ขึ้นอยู่กับ **ตำแหน่งที่มันถูกสร้าง** (Lexical Scope) ไม่ใช่ตำแหน่งที่มันถูกเรียก!

**บทเรียนสำคัญ:** JavaScript ใช้ **Lexical Scope** — Scope Chain ถูกกำหนดโดย **ตำแหน่งในโค้ด** ไม่ใช่ลำดับการเรียก
:::

---

## 3. The `var` Problem (ทำไมห้ามใช้ var?) 🚫

`var` มีพฤติกรรมที่ **อันตราย** หลายอย่างที่ `let`/`const` ไม่มี:

### ปัญหาที่ 1: var ไม่ respect Block Scope

```javascript
// ❌ var: รั่วออกจาก Block
for (var i = 0; i < 3; i++) {
    // ...
}
console.log(i); // 3 ← var รั่วออกมา!

// ✅ let: อยู่ใน Block อย่างถูกต้อง
for (let j = 0; j < 3; j++) {
    // ...
}
// console.log(j); // ❌ ReferenceError (let อยู่ใน Block)
```

### ปัญหาที่ 2: var ใน Loop + Async (Classic Bug!)

```javascript
// ❌ var: ทุก setTimeout เห็น i ตัวเดียวกัน (สุดท้ายคือ 3)
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 ← ไม่ใช่ 0, 1, 2!

// ✅ let: แต่ละ iteration มี i ของตัวเอง
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2 ✅
```

### ปัญหาที่ 3: var สามารถประกาศซ้ำได้

```javascript
// ❌ var: ประกาศชื่อซ้ำไม่ Error! (Bug แอบแฝง)
var user = "Dolar";
var user = "Somchai"; // ไม่ Error! ค่าเดิมถูกทับ!
console.log(user); // "Somchai"

// ✅ const/let: ประกาศซ้ำ Error ทันที!
const user2 = "Dolar";
// const user2 = "Somchai"; // ❌ SyntaxError: Identifier 'user2' has already been declared
```

### 📊 `var` vs `let` vs `const` — สรุปครบ

| คุณสมบัติ | `var` ❌ | `let` ✅ | `const` ✅ |
|:----------|:--------|:--------|:----------|
| **Scope** | Function | Block | Block |
| **Hoisting** | ✅ (เป็น `undefined`) | ✅ (เป็น TDZ) | ✅ (เป็น TDZ) |
| **ประกาศซ้ำ** | ✅ ได้ (อันตราย!) | ❌ Error | ❌ Error |
| **เปลี่ยนค่า** | ✅ ได้ | ✅ ได้ | ❌ ไม่ได้ |
| **ใช้ก่อนประกาศ** | ได้ (`undefined`) | ❌ ReferenceError | ❌ ReferenceError |

---

## 4. Closures (ฟังก์ชันที่จำ Scope ได้) 🧠

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#closures) **Closure** คือฟังก์ชันที่ **"จดจำ"** ตัวแปรจาก Scope ที่มันถูกสร้าง แม้ว่า Scope นั้นจะ **หมดอายุ** ไปแล้ว:

### ทำความเข้าใจ Closure ทีละขั้น:

```javascript
// ขั้นที่ 1: ฟังก์ชันปกติ — ตัวแปรตายเมื่อฟังก์ชันจบ
function normalGreet() {
    const name = "Dolar"; // ← เกิดตอนเรียก normalGreet()
    console.log(`Hi, ${name}!`);
    // ← เมื่อฟังก์ชันจบ ตัวแปร name ถูกทำลาย (Garbage Collected)
}
normalGreet();

// ขั้นที่ 2: Closure — ตัวแปรรอดชีวิตเพราะมีฟังก์ชันข้างในจำมันไว้!
function createGreeter(name) {
    // name ถูก "จดจำ" โดย inner function
    return function() {
        console.log(`Hi, ${name}!`); // ← ยังเข้าถึง name ได้!
    };
}

const greetDolar = createGreeter("Dolar");
const greetSomchai = createGreeter("Somchai");

// createGreeter() จบไปแล้ว แต่...
greetDolar();   // "Hi, Dolar!"   ← ยังจำ "Dolar" ได้!
greetSomchai(); // "Hi, Somchai!" ← ยังจำ "Somchai" ได้!
```

> **ทำไม Closure มีประโยชน์?** เพราะมันสร้าง **"ตัวแปรส่วนตัว" (Private Variables)** ที่โค้ดภายนอกเข้าถึงโดยตรงไม่ได้ ป้องกันการแก้ไขโดยไม่ตั้งใจ!

### Use Case 1: Private Counter (ตัวนับส่วนตัว)

```javascript
function createCounter() {
    let count = 0; // ← ตัวแปรส่วนตัว ไม่มีใครเข้าถึงจากข้างนอกได้!

    return {
        increment() {
            count++;
            console.log(`Count: ${count}`);
        },
        decrement() {
            count--;
            console.log(`Count: ${count}`);
        },
        getCount() {
            return count;
        },
    };
}

const counter = createCounter();
counter.increment(); // Count: 1
counter.increment(); // Count: 2
counter.increment(); // Count: 3
counter.decrement(); // Count: 2

console.log(counter.getCount()); // 2

// ❌ ไม่สามารถเข้าถึง count โดยตรงได้!
// console.log(counter.count); // undefined
// counter.count = 999;        // สร้าง Property ใหม่ ไม่ใช่ตัวเดิม

// แต่ละ Counter มี count ของตัวเอง!
const counter2 = createCounter();
counter2.increment(); // Count: 1 ← เริ่มนับใหม่จาก 0!
```

### Use Case 2: Data Encapsulation (ซ่อนข้อมูลสำคัญ)

ตาม MDN Closures สามารถสร้างระบบที่ใกล้เคียงกับ **Private Fields** ในภาษา OOP:

```javascript
function createBankAccount(initialBalance) {
    let balance = initialBalance; // Private!
    const transactions = [];      // Private!

    return {
        deposit(amount) {
            if (amount <= 0) return "Invalid amount";
            balance += amount;
            transactions.push({ type: "deposit", amount, date: new Date() });
            return `Deposited: ${amount} | Balance: ${balance}`;
        },
        withdraw(amount) {
            if (amount <= 0) return "Invalid amount";
            if (amount > balance) return "Insufficient funds!";
            balance -= amount;
            transactions.push({ type: "withdraw", amount, date: new Date() });
            return `Withdrawn: ${amount} | Balance: ${balance}`;
        },
        getBalance() {
            return balance;
        },
        getTransactions() {
            return [...transactions]; // Return copy (ป้องกัน mutation!)
        },
    };
}

const account = createBankAccount(1000);
console.log(account.deposit(500));   // "Deposited: 500 | Balance: 1500"
console.log(account.withdraw(200));  // "Withdrawn: 200 | Balance: 1300"
console.log(account.getBalance());   // 1300

// ❌ ข้อมูลถูกปกป้อง:
// account.balance = 999999; // ไม่มีผล! เพราะนี่ไม่ใช่ balance ตัวเดิม
console.log(account.getBalance());   // 1300 ← ยังเป็นค่าเดิม!
```

### Use Case 3: Function Factory (โรงงานผลิตฟังก์ชัน)

```javascript
// สร้างฟังก์ชันคำนวณภาษีสำหรับแต่ละประเทศ
function createTaxCalculator(countryName, taxRate) {
    return function(price) {
        const tax = price * taxRate;
        const total = price + tax;
        return `${countryName}: ${price} + tax(${(taxRate * 100)}%) = ${total}`;
    };
}

const thaiTax = createTaxCalculator("Thailand", 0.07);
const usTax = createTaxCalculator("USA", 0.0825);
const jpTax = createTaxCalculator("Japan", 0.10);

console.log(thaiTax(1000)); // "Thailand: 1000 + tax(7%) = 1070"
console.log(usTax(1000));   // "USA: 1000 + tax(8.25%) = 1082.5"
console.log(jpTax(1000));   // "Japan: 1000 + tax(10%) = 1100"
```

### 🧠 Challenge: The Secret Keeper 🤫
จงสร้างฟังก์ชัน `createSecret(password)` ที่:
1. เก็บ `password` เป็น Private (ข้างนอกเข้าถึงไม่ได้)
2. Return Object ที่มี Method:
   - `check(attempt)` → return `true` ถ้า `attempt === password`
   - `hint()` → return ตัวอักษรตัวแรกของ password ตามด้วย `"***"`

```javascript
const mySecret = createSecret("JavaScript123");

console.log(mySecret.check("wrong"));       // false
console.log(mySecret.check("JavaScript123")); // true
console.log(mySecret.hint());               // "J***"
// console.log(mySecret.password);           // undefined (ซ่อนอยู่)
```

::: details ✨ ดูเฉลย
```javascript
function createSecret(password) {
    // password ถูก Closure จดจำ แต่ข้างนอกเข้าถึงโดยตรงไม่ได้!
    return {
        check(attempt) {
            return attempt === password;
        },
        hint() {
            return password[0] + "***";
        },
    };
}

const mySecret = createSecret("JavaScript123");

console.log(mySecret.check("wrong"));         // false
console.log(mySecret.check("JavaScript123")); // true
console.log(mySecret.hint());                 // "J***"
console.log(mySecret.password);               // undefined ← ซ่อนอยู่!
```
**หลักการ:** `password` ถูก "ขัง" อยู่ใน Closure ของ `createSecret` — เข้าถึงได้เฉพาะผ่าน Methods ที่เราอนุญาตเท่านั้น
:::

---

## 5. Closures + Loops (กับดักที่พบบ่อย!) ⚠️

นี่คือ **Bug ที่พบบ่อยที่สุด** เมื่อใช้ Closure กับ Loop:

```javascript
// ❌ Bug: ใช้ var ใน Loop
function createButtons() {
    const buttons = [];

    for (var i = 0; i < 3; i++) {
        buttons.push(function() {
            console.log(`Button ${i} clicked`);
        });
    }

    return buttons;
}

const btns = createButtons();
btns[0](); // "Button 3 clicked" ← ไม่ใช่ 0!
btns[1](); // "Button 3 clicked" ← ไม่ใช่ 1!
btns[2](); // "Button 3 clicked" ← ไม่ใช่ 2!
// ทุกตัวเป็น 3! เพราะ var สร้าง i ตัวเดียวร่วมกัน
```

```javascript
// ✅ Fix: ใช้ let แทน var
function createButtons() {
    const buttons = [];

    for (let i = 0; i < 3; i++) { // ← let สร้าง i ใหม่ทุก iteration
        buttons.push(function() {
            console.log(`Button ${i} clicked`);
        });
    }

    return buttons;
}

const btns = createButtons();
btns[0](); // "Button 0 clicked" ✅
btns[1](); // "Button 1 clicked" ✅
btns[2](); // "Button 2 clicked" ✅
```

> **เหตุผล:** `var` สร้างตัวแปร `i` เพียงตัวเดียวในทั้ง Loop (Function Scope) แต่ `let` สร้าง `i` **ตัวใหม่ทุก Iteration** (Block Scope) ดังนั้น Closure ของแต่ละปุ่มจึงจดจำ `i` คนละค่ากัน

---

## 6. Real-World Pattern: Module Pattern 📦

Closure เป็นรากฐานของ **Module Pattern** — วิธีจัดระเบียบโค้ดโดยไม่ให้ตัวแปรรั่วไหลสู่ Global:

```javascript
const UserModule = (function() {
    // Private Variables (ซ่อนไว้ใน Closure)
    const users = [];
    let nextId = 1;

    // Private Function
    function generateId() {
        return nextId++;
    }

    // Public API (เปิดให้ใช้จากข้างนอก)
    return {
        add(name) {
            const user = { id: generateId(), name };
            users.push(user);
            return user;
        },
        getAll() {
            return [...users]; // Return copy
        },
        count() {
            return users.length;
        },
    };
})(); // IIFE — รันทันที!

// ใช้งาน:
UserModule.add("Dolar");   // { id: 1, name: "Dolar" }
UserModule.add("Somchai"); // { id: 2, name: "Somchai" }
console.log(UserModule.getAll()); // [{ id: 1, ... }, { id: 2, ... }]
console.log(UserModule.count());  // 2

// ❌ ข้อมูลถูกปกป้อง:
// console.log(UserModule.users);  // undefined
// console.log(UserModule.nextId); // undefined
```

---

## 7. Final Challenge: Scope & Closure Lab 🧪

### 🎯 Challenge: The Timer Factory
สร้าง `createTimer(name)` ที่:
1. มี Private `seconds` เริ่มที่ 0
2. `tick()` — เพิ่ม seconds ทีละ 1 แล้วแสดงผล
3. `reset()` — รีเซ็ตเป็น 0
4. `getTime()` — return ค่า seconds ปัจจุบัน

```javascript
const timer1 = createTimer("Cooking");
const timer2 = createTimer("Studying");

timer1.tick(); // "Cooking: 1s"
timer1.tick(); // "Cooking: 2s"
timer1.tick(); // "Cooking: 3s"

timer2.tick(); // "Studying: 1s" ← timer คนละตัว!

timer1.reset();
timer1.tick(); // "Cooking: 1s" ← กลับมาเริ่มใหม่!
```

::: details ✨ ดูเฉลย
```javascript
function createTimer(name) {
    let seconds = 0; // Closure: ซ่อนไว้ข้างใน

    return {
        tick() {
            seconds++;
            console.log(`${name}: ${seconds}s`);
        },
        reset() {
            seconds = 0;
            console.log(`${name}: Reset!`);
        },
        getTime() {
            return seconds;
        },
    };
}

const timer1 = createTimer("Cooking");
const timer2 = createTimer("Studying");

timer1.tick();  // "Cooking: 1s"
timer1.tick();  // "Cooking: 2s"
timer1.tick();  // "Cooking: 3s"
timer2.tick();  // "Studying: 1s"
timer1.reset(); // "Cooking: Reset!"
timer1.tick();  // "Cooking: 1s"

console.log(timer1.getTime()); // 1
console.log(timer2.getTime()); // 1
```

**สิ่งที่ได้ฝึก:**
- **Closure** เก็บ `seconds` และ `name` เป็น Private
- แต่ละ Timer มี **State เป็นของตัวเอง**
- **Module Pattern** ในรูปแบบ Factory Function
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Scope:** ขอบเขตที่ตัวแปรสามารถถูกเข้าถึงได้ในโค้ด
> *   **Global Scope:** ขอบเขตระดับบนสุด ทุกที่ในโปรแกรมเข้าถึงได้
> *   **Function Scope:** ขอบเขตภายในฟังก์ชัน ตัวแปรภายในเข้าถึงจากภายนอกไม่ได้
> *   **Block Scope:** ขอบเขตภายใน `{}` ที่ `let`/`const` เคารพ (แต่ `var` ไม่)
> *   **Scope Chain:** ลำดับการค้นหาตัวแปจาก Scope ข้างในออกข้างนอก
> *   **Lexical Scope (Static Scope):** Scope ที่ถูกกำหนดโดยตำแหน่งในโค้ด ไม่ใช่ลำดับการเรียก
> *   **Variable Shadowing:** การที่ตัวแปรใน Scope ข้างในบังตัวแปรชื่อเดียวกันข้างนอก
> *   **Closure:** ฟังก์ชันที่ "จดจำ" ตัวแปรจาก Scope ที่มันถูกสร้าง แม้ Scope นั้นจะหมดอายุแล้ว
> *   **Private Variable:** ตัวแปรที่ซ่อนอยู่ใน Closure ข้างนอกเข้าถึงโดยตรงไม่ได้
> *   **Module Pattern:** Pattern การจัดระเบียบโค้ดด้วย IIFE + Closure เพื่อสร้าง Private Scope
> *   **Encapsulation:** การซ่อนรายละเอียดภายใน เปิดให้ใช้แค่สิ่งที่จำเป็น (Public API)
> *   **Garbage Collection:** กระบวนการที่ JS Engine ลบตัวแปรที่ไม่ถูกใช้งานออกจาก Memory อัตโนมัติ

---
👉 **[ไปต่อ: Project 4 - The Modular Calculator](/04-project-calculator)**
