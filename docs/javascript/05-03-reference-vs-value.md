# 05-3: Reference vs Value (ความลับของการคัดลอกข้อมูล) 🧬

> **"In programming, the hardest bugs come from not understanding who owns the data."**
> — *Unknown*

นี่คือหนึ่งในหัวข้อ **สำคัญที่สุด** ที่มือใหม่มักมองข้ามครับ! ถ้าไม่เข้าใจเรื่องนี้ คุณจะเจอ **Bug ลึกลับ** ที่หาสาเหตุไม่เจอ 🕵️

> **💡 Analogy (เปรียบเทียบ):**
> - **Pass by Value** = ถ่ายเอกสาร 📄 (คนละชุด แก้ไม่กระทบกัน)
> - **Pass by Reference** = ให้ที่อยู่บ้าน 🏠 (ชี้ไปที่เดียวกัน แก้คนหนึ่งอีกคนเห็น!)

---

## 1. Primitive = Copy by Value (ถ่ายเอกสาร) 📄

**Primitive Types:** `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`

เมื่อ Assign ค่า Primitive ให้ตัวแปรใหม่ → มันจะ **Copy ค่าจริงๆ** ไปเก็บแยกกัน:

```javascript
let a = 10;
let b = a;      // b ได้ "สำเนา" ของ 10 ไป (คนละตัว!)

b = 99;

console.log(a); // 10 (a ไม่โดนกระทบ! ✅)
console.log(b); // 99
```

### ภาพในหัว (Memory Model):

```
Stack Memory:
┌─────────┬───────┐
│  a      │  10   │  ← ค่าของตัวเอง
├─────────┼───────┤
│  b      │  99   │  ← ค่าของตัวเอง (แก้ b ไม่กระทบ a)
└─────────┴───────┘
```

```javascript
// ตัวอย่างเพิ่มเติม — ทุก Primitive Type เป็น Copy by Value
let name1 = "Hello";
let name2 = name1;
name2 = "World";
console.log(name1); // "Hello" (ไม่เปลี่ยน!)

let flag1 = true;
let flag2 = flag1;
flag2 = false;
console.log(flag1); // true (ไม่เปลี่ยน!)
```

---

## 2. Object/Array = Copy by Reference (ให้ที่อยู่) 🏠

**Reference Types:** `Object`, `Array`, `Function`, `Date`, `RegExp`, etc.

เมื่อ Assign Object/Array ให้ตัวแปรใหม่ → ไม่ได้ Copy ข้อมูล แต่ **Copy "ที่อยู่" (Reference)**:

```javascript
const original = { name: "Dolar", score: 100 };
const alias = original;  // ← copy "ที่อยู่" ไม่ใช่ copy ข้อมูล!

alias.score = 999;

console.log(original.score); // 999 😱 (original โดนแก้ด้วย!)
console.log(alias.score);    // 999
```

### ภาพในหัว (Memory Model):

```
Stack Memory:                    Heap Memory:
┌─────────┬────────┐           ┌──────────────────────┐
│ original│ ●──────│──────────▶│ { name: "Dolar",     │
├─────────┼────────┤           │   score: 999 }       │
│ alias   │ ●──────│──────────▶│                      │
└─────────┴────────┘           └──────────────────────┘
                               ↑ ทั้ง 2 ชี้ไปที่เดียวกัน!
```

### Array ก็เช่นกัน!

```javascript
const fruits = ["Apple", "Banana"];
const snacks = fruits;          // ไม่ได้ Copy! แค่ชี้ที่เดียวกัน
snacks.push("Cherry");

console.log(fruits); // ["Apple", "Banana", "Cherry"] 😱
console.log(snacks); // ["Apple", "Banana", "Cherry"]
// ↑ ทั้งสองตัวเป็นชื่อเล่นของ Array เดียวกัน!
```

### 🧠 Challenge: Predict the Bug
```javascript
const fruits = ["Apple", "Banana"];
const snacks = fruits;
snacks.push("Cherry");

console.log(fruits.length);  // ?
console.log(snacks.length);  // ?
```

::: details ✨ ดูเฉลย
ทั้งคู่ได้ **3** ครับ!
`snacks = fruits` ไม่ได้ copy Array ใหม่ แต่ **ชี้ไปที่เดิม** (Alias) ดังนั้น `push("Cherry")` ส่งผลทั้ง `fruits` และ `snacks`
:::

---

## 3. `const` กับ Reference Types (กับดัก!) ⚠️

จำไว้ว่า `const` ห้ามแค่ **เปลี่ยน Reference (กล่อง)** แต่ **แก้ไส้ใน (Mutate) ได้!**

```javascript
const user = { name: "Dolar" };

// ✅ แก้ไส้ใน → ได้! (Mutation)
user.name = "Somchai";
user.age = 30;
console.log(user); // { name: "Somchai", age: 30 }

// ❌ เปลี่ยนกล่อง → Error! (Reassignment)
// user = { name: "Noi" }; // TypeError: Assignment to constant variable
```

### 📊 const Behavior Table

| Data Type | เปลี่ยนค่า (Reassign) | แก้ไส้ใน (Mutate) |
|:----------|:--------------------:|:-----------------:|
| **Primitive** (`const x = 5`) | ❌ ไม่ได้ | — (ไม่มีไส้ใน) |
| **Object** (`const obj = {}`) | ❌ ไม่ได้ | ✅ **ได้!** |
| **Array** (`const arr = []`) | ❌ ไม่ได้ | ✅ **ได้!** |

### 🧠 Challenge: Const Guardian
โค้ดไหนจะ **Error**?
```javascript
// A
const x = 10; x = 20;
// B
const arr = [1]; arr.push(2);
// C
const obj = {}; obj.name = "Dolar";
```

::: details ✨ ดูเฉลย
**A เท่านั้นที่ Error!** (เปลี่ยนค่า Primitive)
- B ✅ — push() แก้ไส้ใน Array ได้
- C ✅ — เพิ่ม Property ใน Object ได้
:::

---

## 4. Equality with Reference Types (เปรียบเทียบ) ⚖️

```javascript
// ⚠️ Object/Array เทียบ "ที่อยู่" ไม่ใช่ "เนื้อหา"!
console.log([1, 2] === [1, 2]);     // false 😱 (คนละกล่อง!)
console.log({} === {});             // false 😱
console.log({ a: 1 } === { a: 1 }); // false 😱

// ชี้ที่เดียวกันถึงจะ true:
const a = [1, 2];
const b = a;
console.log(a === b); // true ✅ (กล่องเดียวกัน!)
```

### 📊 Value vs Reference Equality

| | **Primitive** | **Object/Array** |
|:--|:------------|:----------------|
| `===` เปรียบเทียบ | **ค่า** (Value) | **ที่อยู่** (Reference) |
| `5 === 5` | `true` ✅ | — |
| `[1,2] === [1,2]` | — | `false` ❌ (คนละ ref!) |
| ต้อง deep compare? | ไม่ต้อง | ✅ ต้อง! |

### Deep Comparison (เทียบเนื้อหาจริง):
```javascript
// ✅ วิธี Quick & Dirty สำหรับ Simple Objects:
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };
console.log(JSON.stringify(obj1) === JSON.stringify(obj2)); // true

// ⚠️ JSON.stringify ไม่เหมาะกับ: functions, undefined, circular references
```

---

## 5. Shallow Copy (สำเนาตื้น) 📋

### วิธี Copy โดยไม่ชี้ที่เดียวกัน:

```javascript
// ✅ Array: Spread Operator
const original = [1, 2, 3];
const clone = [...original];           // สร้าง Array ใหม่!
clone.push(4);
console.log(original); // [1, 2, 3] (ไม่โดนกระทบ! ✅)

// ✅ Array: slice() (วิธีเก่า)
const clone2 = original.slice();

// ✅ Array: Array.from()
const clone3 = Array.from(original);

// ✅ Object: Spread Operator
const user = { name: "Dolar", age: 25 };
const userCopy = { ...user };
userCopy.name = "Somchai";
console.log(user.name); // "Dolar" (ปลอดภัย! ✅)

// ✅ Object: Object.assign()
const userCopy2 = Object.assign({}, user);
```

### 📊 Shallow Copy Methods

| ข้อมูล | Method 1 | Method 2 | Method 3 |
|:-------|:---------|:---------|:---------|
| **Array** | `[...arr]` ⭐ | `arr.slice()` | `Array.from(arr)` |
| **Object** | `{...obj}` ⭐ | `Object.assign({}, obj)` | — |

---

## 6. ⚠️ Shallow Copy Trap (กับดักสำเนาตื้น!)

Shallow Copy ก็อปปี้แค่ **ชั้นแรก** — ถ้ามี Object/Array ซ้อนข้างใน มันยัง **ชี้ที่เดียวกัน!**

```javascript
const config = {
    theme: "dark",           // Primitive → Copy ค่าจริง ✅
    settings: {              // Object → Copy แค่ที่อยู่! ⚠️
        fontSize: 14,
        language: "th",
    },
};

const backup = { ...config }; // Shallow Copy

backup.theme = "light";           // ✅ ไม่กระทบ config
backup.settings.fontSize = 20;    // ❌ กระทบ config ด้วย!

console.log(config.theme);           // "dark" ✅ (Primitive → Copy ค่า)
console.log(config.settings.fontSize); // 20 😱 (Object → ชี้ที่เดียวกัน!)
```

### ภาพ Shallow Copy:

```
Shallow Copy with Spread {...config}:

Stack                          Heap
┌─────────┬────────┐
│ config  │ ●──────│──────────▶ { theme: "dark",     │
│         │        │              settings: ●────────│──▶ { fontSize: 20,
├─────────┼────────┤                                 │      language: "th" }
│ backup  │ ●──────│──────────▶ { theme: "light",    │         ↑
│         │        │              settings: ●────────│─────────┘
└─────────┴────────┘            ↑ Object ใหม่!       ↑ ชี้ที่เดียวกัน!
```

---

## 7. Deep Copy (สำเนาลึก) 🏊

สำหรับ Object ที่มีหลายชั้น ต้องใช้ **Deep Copy**:

### วิธีที่ 1: `structuredClone()` (⭐ ดีที่สุด! — Modern JS)

```javascript
const team = {
    name: "Avengers",
    members: ["Iron Man", "Thor"],
    meta: { founded: 2012 },
};

const deepCopy = structuredClone(team);
deepCopy.members.push("Hulk");
deepCopy.meta.founded = 2024;

console.log(team.members);      // ["Iron Man", "Thor"] ✅ (ไม่กระทบ!)
console.log(team.meta.founded);  // 2012 ✅
console.log(deepCopy.members);   // ["Iron Man", "Thor", "Hulk"]
console.log(deepCopy.meta.founded); // 2024
```

### วิธีที่ 2: `JSON.parse(JSON.stringify())` (วิธีเก่า)

```javascript
const deepCopy2 = JSON.parse(JSON.stringify(team));
// ⚠️ ข้อจำกัด: ใช้ไม่ได้กับ Functions, undefined, Date, RegExp, Map, Set
```

### 📊 Copy Methods Comparison

| Method | ระดับ | ใช้กับ Function ได้? | Performance | แนะนำ |
|:-------|:-----|:--------------------|:-----------|:------|
| `{...obj}` | Shallow | — | ⚡ เร็ว | ✅ Object ชั้นเดียว |
| `[...arr]` | Shallow | — | ⚡ เร็ว | ✅ Array ชั้นเดียว |
| `structuredClone()` | **Deep** | ❌ | 🐢 ช้ากว่า | ⭐ **Object ซ้อน** |
| `JSON.parse(stringify())` | Deep | ❌ | 🐢 ช้า | ⚠️ Backup เท่านั้น |

---

## 8. Function Arguments — Value vs Reference 📨

เรื่อง Reference ส่งผลถึง **Function Arguments** ด้วย:

```javascript
// Primitive → Copy by Value (ไม่กระทบตัวเดิม)
function doubleNumber(n) {
    n = n * 2;
    console.log("Inside:", n);
}

let myNum = 5;
doubleNumber(myNum);
console.log("Outside:", myNum);  // 5 ✅ (ไม่เปลี่ยน!)

// Object → Copy by Reference (กระทบตัวเดิม!)
function addSkill(user, skill) {
    user.skills.push(skill);  // ⚠️ แก้ของเดิม!
}

const dev = { name: "Dolar", skills: ["JS"] };
addSkill(dev, "React");
console.log(dev.skills);  // ["JS", "React"] 😱 (โดนแก้!)
```

### ⭐ Best Practice: ไม่แก้ Object ต้นฉบับใน Function

```javascript
// ✅ GOOD: Return Object ใหม่แทน (Immutable Pattern)
function addSkillSafe(user, skill) {
    return {
        ...user,
        skills: [...user.skills, skill],  // สร้าง Array ใหม่
    };
}

const dev = { name: "Dolar", skills: ["JS"] };
const updatedDev = addSkillSafe(dev, "React");
console.log(dev.skills);        // ["JS"] ✅ (ไม่เปลี่ยน!)
console.log(updatedDev.skills);  // ["JS", "React"]
```

---

## 9. Challenges 🏆

### 🎯 Challenge 1: Reference or Value?
```javascript
let x = "hello";
let y = x;
y = "world";
console.log(x);  // (1)?

const a = { val: 1 };
const b = a;
b.val = 99;
console.log(a.val);  // (2)?
```

::: details ✨ ดูเฉลย
1. `"hello"` — String เป็น Primitive → Copy by Value ✅
2. `99` — Object เป็น Reference Type → ชี้ที่เดียวกัน! ⚠️
:::

### 🎯 Challenge 2: The Shallow Trap
```javascript
const config = {
    theme: "dark",
    settings: { fontSize: 14 },
};
const backup = { ...config };
backup.theme = "light";
backup.settings.fontSize = 20;

console.log(config.theme);             // (1)?
console.log(config.settings.fontSize);  // (2)?
```

::: details ✨ ดูเฉลย
1. `"dark"` — `theme` เป็น String (Primitive) → Spread Copy ค่าไปจริงๆ ✅
2. `20` 😱 — `settings` เป็น Object (Reference) → Spread Copy แค่ "ที่อยู่" → ทั้งสองยังชี้ `settings` ตัวเดิม!

**วิธีแก้:** ใช้ `structuredClone(config)` แทน `{ ...config }` ถ้ามี Object ซ้อน Object
:::

### 🎯 Challenge 3: Safe Copy
จงเขียนโค้ด Copy `team` Object ให้ปลอดภัย (Deep Copy):
```javascript
const team = { name: "Dev", members: ["A", "B"] };
```

::: details ✨ ดูเฉลย
```javascript
// ⭐ Best: structuredClone (Modern JS)
const teamCopy = structuredClone(team);

// หรือ
const teamCopy2 = {
    ...team,
    members: [...team.members],  // Copy Array ข้างในด้วย!
};

teamCopy.members.push("C");
console.log(team.members);     // ["A", "B"] ✅ (ไม่กระทบ!)
console.log(teamCopy.members); // ["A", "B", "C"]
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Primitive:** ข้อมูลพื้นฐาน 7 ชนิด (string, number, boolean, null, undefined, bigint, symbol)
> *   **Reference Type:** ข้อมูลที่เก็บเป็น "ที่อยู่" (Object, Array, Function)
> *   **Pass by Value:** การส่งค่าแบบ Copy (เปลี่ยนตัวหนึ่งไม่กระทบอีกตัว)
> *   **Pass by Reference:** การส่ง "ที่อยู่" (เปลี่ยนตัวหนึ่งกระทบอีกตัว!)
> *   **Shallow Copy:** สำเนาชั้นเดียว (Object/Array ซ้อนยังชี้ที่เดิม)
> *   **Deep Copy:** สำเนาทุกชั้น (ทุกอย่างเป็นอิสระจากกัน)
> *   **Mutate (กลายพันธุ์):** การเปลี่ยนแปลงข้อมูลข้างในโดยไม่สร้างตัวใหม่
> *   **Immutable:** แนวคิดที่ไม่แก้ไขข้อมูลต้นฉบับ แต่สร้างใหม่แทน
> *   **`structuredClone()`:** Built-in function สำหรับ Deep Copy (Modern JS)
> *   **Spread Operator (`...`):** Syntax สำหรับ Shallow Copy ข้อมูล
> *   **Alias:** ชื่อเล่นที่ชี้ไปที่ Object/Array เดียวกัน
> *   **Stack / Heap:** ส่วนของหน่วยความจำ — Stack เก็บ Primitive, Heap เก็บ Object

---
👉 **[เริ่มทำโปรเจกต์: Project - The Console Todo List](/05-project-todo)**
