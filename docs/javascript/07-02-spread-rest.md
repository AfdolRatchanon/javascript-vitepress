# 07-2: Spread & Rest Operators (กระจาย & รวบ) 🌊

> **"Spread syntax allows an iterable to be expanded, while Rest syntax collects multiple elements into an array."**
> — *MDN Web Docs*

`...` (จุดสามจุด) ใน JavaScript มี **2 หน้าที่ตรงข้าม** กัน ขึ้นอยู่กับว่าอยู่ตรงไหน!

> **💡 Analogy (เปรียบเทียบ):**
> - **Spread** `...` เหมือน **"เทไพ่ออกจากสำรับ"** 🃏 → กระจายออก
> - **Rest** `...` เหมือน **"รวมไพ่กลับเข้าสำรับ"** 🃏 → รวบเข้ามา



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



## 3. 📊 Spread vs Rest

| | **Spread** `...` | **Rest** `...` |
|:--|:----------------|:---------------|
| **ทำอะไร** | **กระจาย** ออก | **รวบ** เข้ามา |
| **ใช้ตรงไหน** | ตอนเรียก / สร้าง | ตอนรับ / Destructure |
| **ผลลัพธ์** | แยก Array ออกเป็นตัวๆ | รวม Elements เป็น Array |
| **ตัวอย่าง** | `[...arr]`, `{...obj}` | `function(...args)` |
| **ตำแหน่ง** | อยู่ได้ทุกที่ | ต้องอยู่ **ตัวสุดท้าย** เสมอ! |



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



## 5. Common Mistakes & Gotchas ⚠️

### ❌ Rest ต้องอยู่ตัวสุดท้ายเสมอ:

```javascript
// ❌ SyntaxError!
const { ...rest, name } = { name: "Dolar", age: 25 };

// ✅ ถูกต้อง:
const { name, ...rest } = { name: "Dolar", age: 25 };
```

### ❌ Spread ทำ Shallow Copy เท่านั้น:

```javascript
const original = {
    name: "Dolar",
    address: { city: "BKK", zip: "10110" }  // ← Nested Object!
};

const copy = { ...original };
copy.address.city = "CNX";

console.log(original.address.city); // "CNX" 😱 Nested ยังชี้ที่เดียวกัน!

// ✅ Deep Copy ต้องใช้ structuredClone():
const deepCopy = structuredClone(original);
```

### ❌ Spread ใน Object ใช้กับ null/undefined ได้ แต่ Array ไม่ได้:

```javascript
// ✅ Object Spread กับ null — ได้ (ไม่มีผลอะไร)
const obj = { ...null, ...undefined, name: "Dolar" };
console.log(obj); // { name: "Dolar" }

// ❌ Array Spread กับ null — TypeError!
// const arr = [...null]; // TypeError: null is not iterable
```

### 📊 Spread Gotchas Summary

| สถานการณ์ | ผลลัพธ์ | วิธีแก้ |
|:----------|:--------|:-------|
| Spread Nested Object | Shallow Copy (ชี้ที่เดียวกัน) | `structuredClone()` |
| Rest ไม่อยู่ตัวสุดท้าย | SyntaxError | ย้ายไปท้ายสุดเสมอ |
| Spread `null` ใน Array | TypeError | ตรวจก่อน: `...(arr ?? [])` |
| Spread Object ซ้ำ key | ตัวหลังทับ | ระวังลำดับ `{...a, ...b}` |



## 6. Real-World Use Case: API Response Handling 🌐

สถานการณ์จริงที่ใช้ Spread/Rest บ่อยมากคือ **จัดการข้อมูลจาก API**:

```javascript
// ข้อมูลจาก API
const apiResponse = {
    id: 42,
    username: "dolar_dev",
    email: "dolar@example.com",
    password_hash: "abc123...",   // ❌ ห้ามส่งไป Frontend!
    created_at: "2025-01-01",
    __v: 0                        // ❌ MongoDB internal field
};

// ✅ ใช้ Rest ลบ fields ที่ไม่ต้องการ
const { password_hash, __v, ...publicProfile } = apiResponse;
console.log(publicProfile);
// { id: 42, username: "dolar_dev", email: "dolar@example.com", created_at: "2025-01-01" }

// ✅ ใช้ Spread เพิ่ม fields ก่อนส่งกลับ
const enrichedProfile = {
    ...publicProfile,
    avatar: `https://api.example.com/avatar/${publicProfile.id}`,
    isOnline: true
};
```



## 7. Challenges 🏆

ทดสอบความเข้าใจกับโจทย์ 4 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: Copy Cat
**หัวข้อ:** 1. Spread Operator

**โจทย์:** มี Array `const a = [1, 2]` จงสร้าง Array `b` ที่มีค่าเหมือน `a` ทุกประการ แต่ถ้าแก้ `b` แล้ว `a` ต้องไม่เปลี่ยน
::: details ✨ ดูเฉลย
```javascript
const b = [...a];
```
:::

### 🎯 Challenge 2: Unlimited Sum
**หัวข้อ:** 2. Rest Operator

**โจทย์:** สร้าง Function `sum(...nums)` ที่รับตัวเลขกี่ตัวก็ได้ แล้ว Return ผลรวม (ใช้ `reduce`)
::: details ✨ ดูเฉลย
```javascript
function sum(...nums) {
    return nums.reduce((total, n) => total + n, 0);
}
```
:::

### 🎯 Challenge 3: Position Check
**หัวข้อ:** 3. Spread vs Rest

**โจทย์:** ในโค้ด `function test(...args) {}` และ `const arr = [...args]` อันไหนคือ Spread อันไหนคือ Rest?
::: details ✨ ดูเฉลย
- `test(...args)` คือ **Rest** (รวบค่าเข้า)
- `[...args]` คือ **Spread** (กระจายค่าออก)
:::

### 🎯 Challenge 4: Secure User
**หัวข้อ:** 4. Practical Patterns

**โจทย์:** มี `user = { id: 1, name: "A", password: "123" }` จงสร้างตัวแปร `publicUser` ที่ไม่มี `password` (ใช้ Rest Destructuring)
::: details ✨ ดูเฉลย
```javascript
const { password, ...publicUser } = user;
```
:::



> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Spread Syntax (`...`):** กระจาย Array/Object ออกเป็นตัวๆ
> *   **Rest Syntax (`...`):** รวบ Elements ที่เหลือเป็น Array/Object
> *   **Shallow Copy:** คัดลอกชั้นเดียว (Nested ยังอ้างอิงตัวเดิม)
> *   **Merge:** รวม Object หลายตัวเข้าด้วยกัน (ตัวหลังทับ)
> *   **Immutable Update:** อัปเดตโดยไม่แก้ข้อมูลเดิม (สร้าง Copy ใหม่)
> *   **Omit:** ลบ Property ออกจาก Object ด้วย Rest Destructuring
> *   **Conditional Spread:** ใส่ Properties แบบมีเงื่อนไข
> *   **Rest Parameters:** Parameter ที่รวบ Arguments ที่เหลือเป็น Array


👉 **[ไปต่อ: 07-3 - Iterators & Generators](/javascript/07-03-iterators-generators)**
