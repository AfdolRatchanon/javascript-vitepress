# 05-3: Objects (ออบเจกต์ — การจัดเก็บข้อมูลแบบคู่) 🔑

> **"The key to performance is elegance, not battalions of special cases."**
> — *Jon Bentley*

ถ้า Array เป็น **"ตู้ล็อกเกอร์"** ที่จัดเรียงด้วยหมายเลข (0, 1, 2...) แล้ว Object ก็เป็น **"สมุดรายชื่อ"** ที่จัดเรียงด้วย **ชื่อ (Key)** ครับ

> **💡 Analogy (เปรียบเทียบ):**
> Object เหมือน **"บัตรประชาชน"** ครับ:
> - **Key** = หัวข้อ (ชื่อ, นามสกุล, ที่อยู่)
> - **Value** = ข้อมูล ("สมชาย", "ใจดี", "กรุงเทพ")
> - ทุก Key มี Value คู่กัน — ถ้ารู้ Key ก็หา Value ได้ทันที!

## 1. การสร้าง Object (Creation) 🏗️

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object):

### วิธีที่ 1: Object Literal `{}` (ใช้บ่อยที่สุด!)

```javascript
const student = {
    name: "Dolar",          // Key: "name",  Value: "Dolar"
    age: 25,                // Key: "age",   Value: 25
    city: "Bangkok",        // Key: "city",  Value: "Bangkok"
    isStudent: true,        // Key: "isStudent", Value: true
    hobbies: ["Coding", "Gaming"],  // Value เป็น Array ก็ได้!
};
```

### วิธีที่ 2: `new Object()` (แทบไม่ใช้ในยุคปัจจุบัน)

```javascript
const student = new Object();
student.name = "Dolar";
student.age = 25;
// ❌ ไม่แนะนำ — ยาวกว่า และทำสิ่งเดียวกัน
```

### วิธีที่ 3: `Object.create()` (สำหรับ Prototype Chain)

```javascript
const personProto = {
    greet() { return `Hi, I'm ${this.name}`; }
};
const dolar = Object.create(personProto);
dolar.name = "Dolar";
console.log(dolar.greet()); // "Hi, I'm Dolar"
```

> **สรุป:** ใช้ **Object Literal `{}`** เป็นหลัก — สั้น กระชับ อ่านง่าย!



## 2. การเข้าถึง Property (Access) 🔍

มี 2 วิธี:

```javascript
const student = { name: "Dolar", age: 25, "fav food": "Pad Thai" };

// ✅ Dot Notation — ใช้บ่อย สั้น อ่านง่าย
console.log(student.name);    // "Dolar"
console.log(student.age);     // 25

// ✅ Bracket Notation — ใช้เมื่อ Key เป็นกรณีพิเศษ
console.log(student["name"]); // "Dolar"
console.log(student["fav food"]); // "Pad Thai" (Key มี Space!)
```

### 📊 Dot vs Bracket Notation

| | **Dot `.`** | **Bracket `[]`** |
|:--|:-----------|:-----------------|
| **Syntax** | `obj.key` | `obj["key"]` |
| **Key มี Space** | ❌ ไม่ได้ | ✅ ได้ |
| **Key เป็นตัวแปร** | ❌ ไม่ได้ | ✅ ได้ |
| **Key เริ่มด้วยตัวเลข** | ❌ ไม่ได้ | ✅ ได้ |
| **อ่านง่าย** | ⭐⭐⭐ | ⭐⭐ |
| **ใช้เมื่อ** | Key เป็นชื่อปกติ | Key เป็นกรณีพิเศษ |

### Dynamic Key (Key เป็นตัวแปร):

```javascript
const field = "age";
console.log(student[field]);   // 25 (เหมือน student["age"])
// console.log(student.field); // ❌ undefined! (JS มองหา Key ชื่อ "field" จริงๆ)

// ⭐ ใช้วนลูปด้วย Bracket:
const keys = ["name", "age", "city"];
keys.forEach(key => {
    console.log(`${key}: ${student[key]}`);
});
```

### Optional Chaining `?.` (ES2020):

```javascript
const user = { name: "Dolar", address: null };

// ❌ เดิม: ต้อง check ก่อนไม่งั้น Error
// if (user.address && user.address.city) { ... }

// ✅ ใช้ ?. — ถ้าเป็น null/undefined → return undefined (ไม่ Error!)
console.log(user.address?.city);      // undefined ✅
console.log(user.address?.city?.zip); // undefined ✅ (chain ได้หลาย .)
```



## 3. แก้ไข / เพิ่ม / ลบ Property (CRUD) ✏️

```javascript
const user = { name: "Dolar", level: 1 };

// ✏️ Update — แก้ไขค่า
user.level = 10;                       // level: 1 → 10
user["name"] = "Dolar Pro";           // name: "Dolar" → "Dolar Pro"

// ➕ Add — เพิ่ม Property ใหม่
user.score = 9999;
user.skills = ["JavaScript", "React"];

// 🗑️ Delete — ลบ Property
delete user.score;

console.log(user);
// { name: "Dolar Pro", level: 10, skills: ["JavaScript", "React"] }
```

### ⚠️ ทำไม `const` แก้ไขข้างในได้?

```
const = ห้ามเปลี่ยน "กล่อง" (Reference) ❌
        แต่แก้ "ของในกล่อง" (Properties) ได้ ✅

const user = { name: "Dolar" };  // สร้างกล่อง

user.name = "Somchai";           // ✅ แก้ของในกล่อง → ได้!
user = { name: "Noi" };         // ❌ TypeError! เปลี่ยนกล่อง → ไม่ได้!
```

### Object.freeze() — แช่แข็งห้ามแก้!

```javascript
const config = Object.freeze({
    API_URL: "https://api.example.com",
    MAX_RETRIES: 3,
});

config.API_URL = "https://evil.com"; // ❌ ไม่มีผล! (Silently fails)
console.log(config.API_URL); // "https://api.example.com" (ค่าเดิม)
```



## 4. Methods — ฟังก์ชันใน Object 🎮

ถ้า Value ของ Property เป็น **Function** เราเรียกมันว่า **Method**:

```javascript
const player = {
    name: "Dolar",
    hp: 100,
    maxHp: 100,

    // ❌ วิธีเดิม (verbose)
    attack: function() {
        console.log(`${this.name} attacks!`);
    },

    // ✅ วิธีลัด (ES6 — ใช้แบบนี้!)
    takeDamage(amount) {
        this.hp -= amount;
        console.log(`${this.name} took ${amount} damage! HP: ${this.hp}`);
    },

    // ✅ Method ที่ return ค่า
    getHealthBar() {
        const pct = Math.round((this.hp / this.maxHp) * 100);
        return `HP: [${"█".repeat(pct / 10)}${"░".repeat(10 - pct / 10)}] ${pct}%`;
    },
};

player.takeDamage(30); // "Dolar took 30 damage! HP: 70"
console.log(player.getHealthBar()); // "HP: [███████░░░] 70%"
```

### ⚠️ `this` กับ Arrow Function — กับดัก!

```javascript
const hero = {
    name: "Batman",

    // ✅ Regular method — this = hero
    greet() {
        console.log(`I'm ${this.name}`);
    },

    // ❌ Arrow function — this ≠ hero! (ไม่ bind this ของตัวเอง)
    greetArrow: () => {
        console.log(`I'm ${this.name}`); // this = window/global ❌
    },
};

hero.greet();      // "I'm Batman" ✅
hero.greetArrow(); // "I'm undefined" ❌
```

> **กฎ:** ใช้ **Regular Function** สำหรับ Object Methods ที่ต้องใช้ `this` เสมอ!



## 5. Checking Properties (ตรวจสอบ Key) 🔎

```javascript
const user = { name: "Dolar", age: 25, score: 0 };

// ✅ วิธีที่ 1: "in" operator
console.log("name" in user);    // true
console.log("email" in user);   // false

// ✅ วิธีที่ 2: hasOwnProperty()
console.log(user.hasOwnProperty("age"));   // true
console.log(user.hasOwnProperty("email")); // false

// ⚠️ วิธีที่ 3: !== undefined (ระวัง!)
console.log(user.score !== undefined); // true (แม้ score = 0)
console.log(user.email !== undefined); // false
```



## 6. Object Iteration (วนลูป) 🔄

### A. `for...in` Loop:
```javascript
const profile = { name: "Dolar", age: 25, city: "BKK" };

for (const key in profile) {
    console.log(`${key}: ${profile[key]}`);
}
// name: Dolar
// age: 25
// city: BKK
```

### B. `Object.keys()` / `Object.values()` / `Object.entries()`:

```javascript
const profile = { name: "Dolar", age: 25, city: "BKK" };

// 🔑 Object.keys() — ได้ Array ของ Key ทั้งหมด
console.log(Object.keys(profile));   // ["name", "age", "city"]

// 📦 Object.values() — ได้ Array ของ Value ทั้งหมด
console.log(Object.values(profile)); // ["Dolar", 25, "BKK"]

// 🔗 Object.entries() — ได้ Array ของ [Key, Value] pairs
console.log(Object.entries(profile));
// [["name", "Dolar"], ["age", 25], ["city", "BKK"]]

// ⭐ Object.entries() + Destructuring = อ่านง่ายสุด!
for (const [key, value] of Object.entries(profile)) {
    console.log(`${key}: ${value}`);
}
```

### 📊 Object Iteration Methods

| Method | ได้อะไร | ตัวอย่าง |
|:-------|:-------|:---------|
| `for...in` | Key (String) | `"name"`, `"age"` |
| `Object.keys(obj)` | Array ของ Key | `["name", "age"]` |
| `Object.values(obj)` | Array ของ Value | `["Dolar", 25]` |
| `Object.entries(obj)` | Array ของ `[key, value]` | `[["name", "Dolar"]]` |



## 7. Destructuring & Spread (ES6) 💎

### Destructuring — แกะค่าออกจาก Object:

```javascript
const user = { name: "Dolar", age: 25, city: "Bangkok" };

// ❌ เดิม: ต้องเข้าถึงทีละตัว
// const name = user.name;
// const age = user.age;

// ✅ Destructuring — แกะหลายค่าในบรรทัดเดียว!
const { name, age, city } = user;
console.log(name); // "Dolar"
console.log(age);  // 25

// ⭐ Rename (เปลี่ยนชื่อตัวแปร)
const { name: userName, age: userAge } = user;
console.log(userName); // "Dolar"

// ⭐ Default Value (ค่าเริ่มต้นถ้าไม่มี Key)
const { name: n, email = "N/A" } = user;
console.log(email); // "N/A" (ไม่มี email ใน user)
```

### Spread `...` — คัดลอก/รวม Object:

```javascript
// Copy Object
const original = { name: "Dolar", age: 25 };
const copy = { ...original };
copy.name = "Somchai";
console.log(original.name); // "Dolar" (ไม่โดนกระทบ!)

// Merge Objects (รวม Object)
const defaults = { theme: "light", lang: "th" };
const userPrefs = { theme: "dark" };
const settings = { ...defaults, ...userPrefs };
console.log(settings); // { theme: "dark", lang: "th" }
// ⭐ ค่าที่ซ้ำกัน → ตัวหลังจะ overwrite ตัวแรก

// ⭐ เพิ่ม Property ใหม่ตอน Copy
const updatedUser = { ...original, level: 10, score: 999 };
console.log(updatedUser);
// { name: "Dolar", age: 25, level: 10, score: 999 }
```



## 8. Nested Objects (Object ซ้อน Object) 🪆

```javascript
const company = {
    name: "TechCorp",
    address: {
        city: "Bangkok",
        zip: "10100",
        coords: {
            lat: 13.756,
            lng: 100.502,
        },
    },
    employees: [
        { name: "Dolar", role: "Developer" },
        { name: "Somchai", role: "Designer" },
    ],
};

// เข้าถึงข้อมูลซ้อนๆ
console.log(company.address.city);          // "Bangkok"
console.log(company.address.coords.lat);    // 13.756
console.log(company.employees[0].name);     // "Dolar"

// ⭐ Optional Chaining สำหรับ Nested
console.log(company.address?.country?.code); // undefined (ไม่ Error!)
```

## Real-World Use Case: User Profile System 🌐

```javascript
const user = {
    id: 42,
    name: "Dolar",
    email: "dolar@example.com",
    settings: {
        theme: "dark",
        language: "th",
        notifications: { email: true, push: false }
    },

    getDisplayName() {
        return this.name + " (#" + this.id + ")";
    },

    toggleTheme() {
        this.settings.theme = this.settings.theme === "dark" ? "light" : "dark";
    }
};

console.log(user.getDisplayName()); // "Dolar (#42)"
user.toggleTheme();
console.log(user.settings.theme);   // "light"
```



## 9. Challenges 🏆

ทดสอบความเข้าใจกับโจทย์ 8 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: Object Creator
**หัวข้อ:** 1. Creation

**โจทย์:** สร้าง Object `pet` ที่มี `name`, `type` (เช่น "Dog"), และ `age`
::: details ✨ ดูเฉลย
```javascript
const pet = {
    name: "Buddy",
    type: "Dog",
    age: 3
};
```
:::

### 🎯 Challenge 2: Accessor
**หัวข้อ:** 2. Access

**โจทย์:** จาก `pet` ในข้อ 1 ให้ `console.log` ชื่อสัตว์เลี้ยงโดยใช้ Dot Notation และ อายุโดยใช้ Bracket Notation
::: details ✨ ดูเฉลย
```javascript
console.log(pet.name);
console.log(pet["age"]);
```
:::

### 🎯 Challenge 3: Update & Delete
**หัวข้อ:** 3. CRUD

**โจทย์:** เปลี่ยน `age` ของ `pet` เป็น 4 และเพิ่ม Property `isVaccinated = true` จากนั้นลบ `type` ออก
::: details ✨ ดูเฉลย
```javascript
pet.age = 4;
pet.isVaccinated = true;
delete pet.type;
```
:::

### 🎯 Challenge 4: Bark Method
**หัวข้อ:** 4. Methods

**โจทย์:** เพิ่ม Method `bark()` ให้ `pet` โดยเมื่อเรียก `pet.bark()` ให้พิมพ์ว่า "[Name] says Woof!" (ใช้ `this`)
::: details ✨ ดูเฉลย
```javascript
pet.bark = function() { // หรือเขียนใน Object ตั้งแต่ต้น
    console.log(`${this.name} says Woof!`);
};
// หรือแบบ ES6 shortcut ถ้าประกาศใหม่
// bark() { console.log(`${this.name} says Woof!`); }
```
:::

### 🎯 Challenge 5: Key Checker
**หัวข้อ:** 5. Checking Properties

**โจทย์:** เขียนโค้ดตรวจสอบว่า `pet` มี Property ชื่อ `"weight"` หรือไม่? (ถ้าไม่มีให้พิมพ์ "No weight data")
::: details ✨ ดูเฉลย
```javascript
if (!("weight" in pet)) {
    console.log("No weight data");
}
// หรือใช้ pet.hasOwnProperty("weight")
```
:::

### 🎯 Challenge 6: Key Hunter
**หัวข้อ:** 6. Object Iteration

**โจทย์:** ใช้ `Object.keys()` เพื่อหาจำนวน Property ทั้งหมดใน Object `pet`
::: details ✨ ดูเฉลย
```javascript
console.log(Object.keys(pet).length);
```
:::

### 🎯 Challenge 7: Profile Unpacker
**หัวข้อ:** 7. Destructuring

**โจทย์:** มี `const user = { id: 101, email: "test@test.com" }` จงใช้ Destructuring ดึง `email` ออกมาเก็บในตัวแปรชื่อ `userEmail`
::: details ✨ ดูเฉลย
```javascript
const { email: userEmail } = user;
```
:::

### 🎯 Challenge 8: Nested Explorer
**หัวข้อ:** 8. Nested Objects

**โจทย์:** เข้าถึงค่า `lat` จาก Object นี้:
```javascript
const map = { location: { coords: { lat: 13.5, lng: 100.2 } } };
```
::: details ✨ ดูเฉลย
```javascript
console.log(map.location.coords.lat);
```
:::



> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Object:** โครงสร้างข้อมูลที่เก็บข้อมูลเป็นคู่ Key-Value
> *   **Property:** ข้อมูลแต่ละคู่ Key:Value ใน Object (เช่น `name: "Dolar"`)
> *   **Key (Property Name):** ชื่อที่ใช้เข้าถึง Value ใน Object
> *   **Value:** ข้อมูลที่จับคู่กับ Key
> *   **Method:** ฟังก์ชันที่เป็น Property ของ Object
> *   **`this`:** Keyword ที่อ้างถึง Object ที่กำลังเรียกใช้ Method อยู่
> *   **Dot Notation:** การเข้าถึง Property ด้วยจุด (`obj.key`)
> *   **Bracket Notation:** การเข้าถึง Property ด้วยวงเล็บใหญ่ (`obj["key"]`)
> *   **Destructuring:** Syntax ที่แกะค่าจาก Object/Array ออกมาเป็นตัวแปร
> *   **Spread (`...`):** Syntax ที่กระจาย Property ทั้งหมดออกจาก Object
> *   **Optional Chaining (`?.`):** เข้าถึง Property โดยไม่ Error ถ้าค่าเป็น null/undefined
> *   **Object.freeze():** Method ที่ทำให้ Object ไม่สามารถแก้ไขได้อีก


👉 **[ไปต่อ: 05-3 - Reference vs Value (Deep Dive)](/javascript/05-03-reference-vs-value)**
