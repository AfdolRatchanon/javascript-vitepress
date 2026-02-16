# 08-1: Destructuring (แกะค่าออกมาใช้) 📦

> **"Destructuring allows you to extract values from arrays or properties from objects into distinct variables."**
> — *MDN Web Docs*

Destructuring คือ Syntax ที่ช่วยให้เรา **"แกะ" ค่าจาก Array หรือ Object** ออกมาเป็นตัวแปร โดยไม่ต้องเขียน `obj.property` ทีละตัว!

> **💡 Analogy (เปรียบเทียบ):**
> Destructuring เหมือน **"แกะของขวัญ"** 🎁:
> - ก่อน: ต้องเปิดกล่อง → หยิบของ → ตั้งชื่อ → ทำทีละชิ้น
> - หลัง: บอกชื่อของที่อยากได้ → ระบบแกะให้อัตโนมัติ!

---

## 1. Object Destructuring 🔑

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):

### พื้นฐาน:

```javascript
const user = {
    name: "Dolar",
    age: 25,
    city: "Bangkok",
    role: "Developer"
};

// ❌ แบบเดิม (ยาว!):
const name = user.name;
const age = user.age;
const city = user.city;

// ✅ Destructuring (บรรทัดเดียว!):
const { name, age, city } = user;

console.log(name); // "Dolar"
console.log(age);  // 25
console.log(city); // "Bangkok"
```

### เปลี่ยนชื่อตัวแปร (Rename):

```javascript
const { name: userName, age: userAge } = user;

console.log(userName); // "Dolar"
console.log(userAge);  // 25
// console.log(name);  // ❌ ReferenceError — ใช้ชื่อเดิมไม่ได้!
```

### ค่า Default:

```javascript
const { name, country = "Thailand" } = user;

console.log(name);    // "Dolar"
console.log(country); // "Thailand" (ใช้ Default เพราะ user ไม่มี country)
```

### Nested Destructuring (ซ้อนลึก):

```javascript
const student = {
    name: "Somchai",
    scores: {
        math: 95,
        english: 88,
    },
    hobbies: ["coding", "gaming"]
};

const { name, scores: { math, english }, hobbies: [firstHobby] } = student;

console.log(name);       // "Somchai"
console.log(math);       // 95
console.log(english);    // 88
console.log(firstHobby); // "coding"
```

---

## 2. Array Destructuring 📋

```javascript
const colors = ["red", "green", "blue"];

// ❌ แบบเดิม:
const first = colors[0];
const second = colors[1];

// ✅ Destructuring:
const [first, second, third] = colors;

console.log(first);  // "red"
console.log(second); // "green"
console.log(third);  // "blue"
```

### ข้าม Element:

```javascript
const [, , third] = ["red", "green", "blue"];
console.log(third); // "blue" (ข้ามตัวที่ 1 และ 2!)
```

### Swap ตัวแปร (สลับค่า):

```javascript
let a = 1;
let b = 2;

// ❌ แบบเดิม (ต้องใช้ temp):
// let temp = a; a = b; b = temp;

// ✅ Destructuring (บรรทัดเดียว!):
[a, b] = [b, a];

console.log(a); // 2
console.log(b); // 1
```

### ค่า Default:

```javascript
const [x = 10, y = 20, z = 30] = [1, 2];

console.log(x); // 1  (มีค่า → ใช้ค่าจริง)
console.log(y); // 2  (มีค่า → ใช้ค่าจริง)
console.log(z); // 30 (ไม่มีค่า → ใช้ Default!)
```

---

## 3. Destructuring in Functions 🎯

### Function Parameters:

```javascript
// ❌ แบบเดิม:
function displayUser(user) {
    console.log(user.name);
    console.log(user.age);
}

// ✅ Destructuring ใน Parameter!
function displayUser({ name, age, role = "Unknown" }) {
    console.log(`${name}, อายุ ${age}, ตำแหน่ง ${role}`);
}

displayUser({ name: "Dolar", age: 25, city: "BKK" });
// "Dolar, อายุ 25, ตำแหน่ง Unknown"
```

### Return Multiple Values:

```javascript
function getMinMax(numbers) {
    return {
        min: Math.min(...numbers),
        max: Math.max(...numbers),
    };
}

const { min, max } = getMinMax([5, 3, 8, 1, 9]);
console.log(min); // 1
console.log(max); // 9
```

---

## 4. 📊 Object vs Array Destructuring

| | **Object** `{ }` | **Array** `[ ]` |
|:--|:-----------------|:----------------|
| **จับคู่ด้วย** | ชื่อ Property | ตำแหน่ง (Index) |
| **เปลี่ยนชื่อ** | `{ name: alias }` | อิสระ (ตั้งชื่ออะไรก็ได้) |
| **ข้ามได้** | ✅ เลือกเฉพาะที่ต้องการ | ✅ ใช้ `, ,` ข้าม |
| **Default** | `{ x = 10 }` | `[x = 10]` |
| **ใช้เมื่อ** | ข้อมูลมีชื่อ (key-value) | ข้อมูลเรียงลำดับ |

---

## 5. Real-World Use Cases 🛠️

### API Response:

```javascript
// Fetch API แล้ว Destructure
const res = await fetch("/api/user/1");
const { id, name, email } = await res.json();
console.log(`User ${id}: ${name} (${email})`);
```

### React-Style (ตัวอย่าง Pattern):

```javascript
// คล้าย useState ใน React
function useState(initialValue) {
    let state = initialValue;
    const getState = () => state;
    const setState = (newValue) => { state = newValue; };
    return [getState, setState];
}

const [getCount, setCount] = useState(0);
console.log(getCount()); // 0
setCount(5);
console.log(getCount()); // 5
```

### Loop Destructuring:

```javascript
const users = [
    { name: "Dolar", age: 25 },
    { name: "Somchai", age: 30 },
];

// Destructure ใน for...of
for (const { name, age } of users) {
    console.log(`${name} อายุ ${age}`);
}

// Destructure ใน .map()
const names = users.map(({ name }) => name);
console.log(names); // ["Dolar", "Somchai"]
```

---

## 6. Challenges 🏆


ทดสอบความเข้าใจกับโจทย์ 5 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: Unbox the Object
**หัวข้อ:** 1. Object Destructuring

**โจทย์:** มี Object `const hero = { name: "Batman", power: "Rich" }` จงแกะ `name` และ `power` ออกมาเป็นตัวแปร
::: details ✨ ดูเฉลย
```javascript
const { name, power } = hero;
console.log(name, power);
```
:::

### 🎯 Challenge 2: Color Picker
**หัวข้อ:** 2. Array Destructuring

**โจทย์:** จาก `const colors = ["Red", "Green", "Blue"]` จงแกะเอาเฉพาะ "Red" และ "Blue" ออกมา (ข้าม Green)
::: details ✨ ดูเฉลย
```javascript
const [red, , blue] = colors;
```
:::

### 🎯 Challenge 3: configFunc
**หัวข้อ:** 3. Function Destructuring

**โจทย์:** สร้าง Function `connect({ host, port })` ที่รับ Object แล้วพิมพ์ "Connecting to host:port" ถ้าไม่ส่ง port มาให้ใช้ default คือ 80
::: details ✨ ดูเฉลย
```javascript
function connect({ host, port = 80 }) {
    console.log(`Connecting to ${host}:${port}`);
}
```
:::

### 🎯 Challenge 4: Syntax Check
**หัวข้อ:** 4. Object vs Array

**โจทย์:** ถ้าข้อมูลเป็น `{ x: 10, y: 20 }` เราสามารถใช้ Array Destructuring `const [x, y] = point` ได้หรือไม่? เพราะอะไร?
::: details ✨ ดูเฉลย
**ไม่ได้ครับ** เพราะ Object ไม่มีการเรียงลำดับ (Not Iterable) ต้องใช้ `{ }` ในการแกะเท่านั้น
:::

### 🎯 Challenge 5: API Extractor
**หัวข้อ:** 5. Real-World Use Case

**โจทย์:** สมมติ `fetch` ได้ข้อมูล `{ data: { user: { id: 1, name: "A" } } }` จงแกะเอา `name` ออกมาในบรรทัดเดียว
::: details ✨ ดูเฉลย
```javascript
const { data: { user: { name } } } = response;
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Destructuring:** Syntax ที่แกะค่าจาก Array/Object ออกมาเป็นตัวแปร
> *   **Object Destructuring:** แกะด้วย `{ }` จับคู่ตามชื่อ Property
> *   **Array Destructuring:** แกะด้วย `[ ]` จับคู่ตามตำแหน่ง
> *   **Rename (Alias):** เปลี่ยนชื่อตัวแปร `{ name: alias }`
> *   **Default Value:** ค่าเริ่มต้นถ้า Property ไม่มี `{ x = 10 }`
> *   **Nested Destructuring:** แกะลึกหลายชั้น `{ a: { b } }`
> *   **Rest Element:** เก็บส่วนที่เหลือ `{ a, ...rest }` (เรียนในบทถัดไป!)
> *   **Swap:** สลับค่าตัวแปร `[a, b] = [b, a]`
> *   **Parameter Destructuring:** แกะค่าใน Function Parameter
> *   **Computed Property:** ใช้ตัวแปรเป็นชื่อ Key `{ [key]: value }`

---
👉 **[ไปต่อ: 08-2 - Spread & Rest Operators](/08-02-spread-rest)**
