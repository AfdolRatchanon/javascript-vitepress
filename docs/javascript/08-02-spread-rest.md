# 08-2: Spread & Rest Operators (กระจาย & รวบ) 🌊

> **"Spread syntax allows an iterable to be expanded, while Rest syntax collects multiple elements into an array."**
> — *MDN Web Docs*

`...` (จุดสามจุด) ใน JavaScript มี **2 หน้าที่ตรงข้าม** กัน ขึ้นอยู่กับว่าอยู่ตรงไหน!

> **💡 Analogy (เปรียบเทียบ):**
> - **Spread** `...` เหมือน **"เทไพ่ออกจากสำรับ"** 🃏 → กระจายออก
> - **Rest** `...` เหมือน **"รวมไพ่กลับเข้าสำรับ"** 🃏 → รวบเข้ามา

---

## 1. Spread Operator — กระจาย 🌊

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax):

### Spread Array:

```javascript
const fruits = ["🍎", "🍌", "🍇"];
const moreFruits = ["🍊", ...fruits, "🍓"];

console.log(moreFruits);
// ["🍊", "🍎", "🍌", "🍇", "🍓"]

// ⭐ Copy Array (Shallow Clone):
const fruitsCopy = [...fruits];
fruitsCopy.push("🥝");

console.log(fruits);     // ["🍎", "🍌", "🍇"] (ไม่โดนกระทบ!)
console.log(fruitsCopy); // ["🍎", "🍌", "🍇", "🥝"]
```

### Spread Object:

```javascript
const defaults = { theme: "light", lang: "th", fontSize: 16 };
const userPrefs = { theme: "dark", fontSize: 20 };

// ⭐ Merge Objects (ตัวหลังทับตัวก่อน!)
const settings = { ...defaults, ...userPrefs };

console.log(settings);
// { theme: "dark", lang: "th", fontSize: 20 }
// theme และ fontSize ถูกทับด้วย userPrefs!
```

### Spread in Function Calls:

```javascript
const numbers = [5, 3, 8, 1, 9];

// ❌ แบบเดิม:
Math.max(5, 3, 8, 1, 9);

// ✅ Spread:
Math.max(...numbers); // 9
Math.min(...numbers); // 1

// ⭐ รวม Array:
const all = [...[1, 2], ...[3, 4], ...[5, 6]];
console.log(all); // [1, 2, 3, 4, 5, 6]
```

---

## 2. Rest Operator — รวบ 🧲

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters):

### Rest ใน Function Parameters:

```javascript
// ⭐ Rest Parameter = รวบ Arguments ที่เหลือเป็น Array
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(10, 20, 30, 40)); // 100

// ⭐ ผสมกับ Parameter ปกติ:
function greet(greeting, ...names) {
    return names.map(name => `${greeting}, ${name}!`);
}

console.log(greet("สวัสดี", "Dolar", "Somchai", "Malee"));
// ["สวัสดี, Dolar!", "สวัสดี, Somchai!", "สวัสดี, Malee!"]
```

### Rest ใน Destructuring:

```javascript
// Array Rest:
const [first, second, ...remaining] = [1, 2, 3, 4, 5];
console.log(first);     // 1
console.log(second);    // 2
console.log(remaining); // [3, 4, 5]

// Object Rest:
const { name, age, ...otherInfo } = {
    name: "Dolar",
    age: 25,
    city: "BKK",
    role: "Dev",
    hobby: "gaming"
};

console.log(name);      // "Dolar"
console.log(age);       // 25
console.log(otherInfo); // { city: "BKK", role: "Dev", hobby: "gaming" }
```

---

## 3. 📊 Spread vs Rest

| | **Spread** `...` | **Rest** `...` |
|:--|:----------------|:---------------|
| **ทำอะไร** | **กระจาย** ออก | **รวบ** เข้ามา |
| **ใช้ตรงไหน** | ตอนเรียก / สร้าง | ตอนรับ / Destructure |
| **ผลลัพธ์** | แยก Array ออกเป็นตัวๆ | รวม Elements เป็น Array |
| **ตัวอย่าง** | `[...arr]`, `{...obj}` | `function(...args)` |
| **ตำแหน่ง** | อยู่ได้ทุกที่ | ต้องอยู่ **ตัวสุดท้าย** เสมอ! |

---

## 4. Practical Patterns 🛠️

### Immutable Update (ไม่แตะต้อง Original):

```javascript
const todos = [
    { id: 1, text: "Learn JS", done: false },
    { id: 2, text: "Build App", done: false },
];

// เพิ่ม Todo ใหม่ (ไม่แก้ Array เดิม!)
const addTodo = (list, newTodo) => [...list, newTodo];

// อัปเดต Todo (ไม่แก้ Object เดิม!)
const toggleTodo = (list, id) =>
    list.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
    );

// ลบ Todo:
const removeTodo = (list, id) => list.filter(todo => todo.id !== id);
```

### Omit Properties (ลบ Property ที่ไม่ต้องการ):

```javascript
const user = { name: "Dolar", password: "secret123", age: 25 };

// ลบ password ออก!
const { password, ...safeUser } = user;

console.log(safeUser); // { name: "Dolar", age: 25 } ✅
// password ไม่ถูกส่งไปที่ไหน
```

### Conditional Spread:

```javascript
const isAdmin = true;

const user = {
    name: "Dolar",
    ...(isAdmin && { role: "admin", permissions: ["read", "write", "delete"] }),
};

console.log(user);
// { name: "Dolar", role: "admin", permissions: [...] }
```

---

## 5. Challenges 🏆

### 🎯 Challenge 1: Merge & Override
```javascript
const base = { color: "red", size: "M", brand: "Nike" };
const custom = { color: "blue", price: 599 };
```
สร้าง `merged` ที่รวม 2 objects (custom ทับ base):

::: details ✨ ดูเฉลย
```javascript
const merged = { ...base, ...custom };
console.log(merged);
// { color: "blue", size: "M", brand: "Nike", price: 599 }
```
:::

### 🎯 Challenge 2: First & Rest
สร้าง Function `head(arr)` ที่ return ตัวแรก + ตัวที่เหลือ:

::: details ✨ ดูเฉลย
```javascript
function head(arr) {
    const [first, ...rest] = arr;
    return { first, rest };
}

console.log(head([1, 2, 3, 4]));
// { first: 1, rest: [2, 3, 4] }
```
:::

### 🎯 Challenge 3: Clean User
สร้าง Function ที่ลบ `password` และ `__v` ออกจาก User object:

::: details ✨ ดูเฉลย
```javascript
function cleanUser(user) {
    const { password, __v, ...clean } = user;
    return clean;
}

const user = { name: "A", email: "a@b.c", password: "xxx", __v: 0 };
console.log(cleanUser(user));
// { name: "A", email: "a@b.c" }
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Spread Syntax (`...`):** กระจาย Array/Object ออกเป็นตัวๆ
> *   **Rest Syntax (`...`):** รวบ Elements ที่เหลือเป็น Array/Object
> *   **Shallow Copy:** คัดลอกชั้นเดียว (Nested ยังอ้างอิงตัวเดิม)
> *   **Merge:** รวม Object หลายตัวเข้าด้วยกัน (ตัวหลังทับ)
> *   **Immutable Update:** อัปเดตโดยไม่แก้ข้อมูลเดิม (สร้าง Copy ใหม่)
> *   **Omit:** ลบ Property ออกจาก Object ด้วย Rest Destructuring
> *   **Conditional Spread:** ใส่ Properties แบบมีเงื่อนไข
> *   **Rest Parameters:** Parameter ที่รวบ Arguments ที่เหลือเป็น Array

---
👉 **[ไปต่อ: 08-3 - Modules (import/export)](/08-03-modules)**
