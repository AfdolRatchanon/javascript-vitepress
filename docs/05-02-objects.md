# 05-2: Objects (การจัดเก็บข้อมูลแบบคู่) 🔑

> **"The key to performance is elegance, not battalions of special cases."**
> — *Jon Bentley*

ถ้า Array เก็บข้อมูลเป็น **"รายการ" (List)** แล้ว Object คือการเก็บข้อมูลเป็น **"บัตรประจำตัว" (Profile)** ที่มีชื่อกำกับแต่ละค่า

ลองคิดดูว่า Array เก็บได้แค่ `["Dolar", 25, "Bangkok"]` — แต่เราไม่รู้เลยว่าตัวไหนคือชื่อ ตัวไหนคืออายุ!
**Object** แก้ปัญหานี้ด้วยการเก็บข้อมูลเป็นคู่ **Key-Value Pair** (กุญแจ-ค่า)

## 1. Object Literal (การสร้าง Object) 📦
เราสร้าง Object ด้วย **Curly Braces `{}`**:

```javascript
// Object ว่าง
const emptyBox = {};

// Object ที่มีข้อมูล (Properties)
const student = {
    name: "Dolar",       // Key: "name", Value: "Dolar"
    age: 25,             // Key: "age",  Value: 25
    city: "Bangkok",     // Key: "city", Value: "Bangkok"
    isStudent: true,     // Key: "isStudent", Value: true
};
```

> **คำศัพท์เทคนิค:**
> *   **Property** (คุณสมบัติ): ข้อมูลแต่ละคู่ใน Object (เช่น `name: "Dolar"`)
> *   **Key** (กุญแจ): ชื่อของ Property (เช่น `name`) — เป็น String เสมอ
> *   **Value** (ค่า): ข้อมูลที่เก็บไว้ (เช่น `"Dolar"`) — เป็นอะไรก็ได้!
> *   **Object Literal** (การสร้าง Object ด้วย `{}`): วิธีสร้าง Object ที่นิยมใช้มากที่สุด

## 2. Accessing Properties (การเข้าถึงข้อมูล) 🔍
มี 2 แบบ:

### A. Dot Notation (ใช้จุด) — **นิยมที่สุด** ✅
```javascript
console.log(student.name); // "Dolar"
console.log(student.age);  // 25
```

### B. Bracket Notation (ใช้วงเล็บเหลี่ยม) — **ยืดหยุ่นกว่า**
ใช้เมื่อ Key **มีช่องว่าง**, **เป็นตัวแปร**, หรือ **มีอักขระพิเศษ**

```javascript
// Key มีช่องว่าง
const car = { "brand name": "Toyota" };
console.log(car["brand name"]); // "Toyota"

// Key เป็นตัวแปร (Dynamic Key)
const field = "age";
console.log(student[field]); // 25 (เหมือนเขียน student["age"])
```

> **กฎง่ายๆ:** ใช้ **Dot** เป็นค่าเริ่มต้น ใช้ **Bracket** เมื่อจำเป็นเท่านั้น

### 🧠 Challenge: Dot or Bracket?
โค้ดไหนจะทำงานได้ โค้ดไหนจะ Error?
```javascript
const pet = { name: "Cat", "color type": "orange" };
const key = "name";
```
1. `pet.name`
2. `pet.color type`
3. `pet["color type"]`
4. `pet[key]`

::: details ✨ ดูเฉลย
1. ✅ `"Cat"` — Dot Notation ปกติ
2. ❌ **SyntaxError** — Key มีช่องว่าง ใช้ Dot ไม่ได้!
3. ✅ `"orange"` — Bracket Notation รองรับช่องว่าง
4. ✅ `"Cat"` — Bracket + Variable: `key` = `"name"` → `pet["name"]`
:::

## 3. Modifying Properties (การแก้ไข/เพิ่ม/ลบ) ✏️

```javascript
const user = { name: "Dolar", level: 1 };

// แก้ไขค่า (Update)
user.level = 10;

// เพิ่ม Property ใหม่ (Add)
user.score = 9999;

// ลบ Property (Delete)
delete user.score;

console.log(user); // { name: "Dolar", level: 10 }
```

> ⚠️ **ทำไม `const` แก้ไขได้?**
> เพราะ `const` ห้ามแค่ **เปลี่ยนกล่อง (Reference)** แต่ **แก้ไส้ในของกล่อง (Properties) ได้ตลอด!**
> (เดี๋ยวจะเจาะลึกเรื่องนี้ในบท 05-3)

## 4. Object Methods (ฟังก์ชันใน Object) 🏃

ถ้า Value ของ Property เป็น **Function** เราเรียกมันว่า **Method** (เมธอดดด):

```javascript
const calculator = {
    brand: "Casio",

    // Method (Short Syntax — ES6)
    add(a, b) {
        return a + b;
    },

    // Method (Traditional Syntax)
    subtract: function(a, b) {
        return a - b;
    },
};

console.log(calculator.add(10, 5));      // 15
console.log(calculator.subtract(10, 5)); // 5
```

## 5. The `this` Keyword (คำสั่งมหัศจรรย์) 🪄

ภายใน Method เราสามารถใช้ `this` เพื่ออ้างอิงถึง **Object ตัวเอง** ได้:

```javascript
const player = {
    name: "Dolar",
    hp: 100,

    takeDamage(amount) {
        this.hp -= amount; // "this" = player (ตัวมันเอง)
        console.log(`${this.name} took ${amount} damage! HP: ${this.hp}`);
    },
};

player.takeDamage(30); // "Dolar took 30 damage! HP: 70"
player.takeDamage(50); // "Dolar took 50 damage! HP: 20"
```

> **คำศัพท์เทคนิค:**
> *   **Method** (เมธอด): ฟังก์ชันที่เป็น Property ของ Object
> *   **`this`** (ตัวอ้างอิงตัวเอง): Keyword ที่ชี้ไปยัง Object ที่เป็นเจ้าของ Method ในขณะนั้น
> *   **Short Method Syntax** (รูปแบบย่อ): `add(a, b) {}` แทน `add: function(a, b) {}`

### 🧠 Challenge: this Prediction
โค้ดนี้จะได้ผลลัพธ์อะไร?
```javascript
const hero = {
    name: "Batman",
    greet() {
        console.log("I am " + this.name);
    },
};

hero.greet();
hero.name = "Superman";
hero.greet();
```

::: details ✨ ดูเฉลย
1. `"I am Batman"` — `this.name` คือ `hero.name` = `"Batman"`
2. `"I am Superman"` — เราเปลี่ยน `hero.name` แล้ว `this` ก็ชี้ไปค่าตัวใหม่
:::

## 6. Iterating Over Objects (การวนลูปอ่าน Object) 🔄

ต่างจาก Array ที่ใช้ `for...of` ได้ตรงๆ — **Object ใช้ `for...in`** หรือ `Object.keys()`/`.values()`/`.entries()`:

### A. `for...in` Loop
```javascript
const profile = { name: "Dolar", age: 25, city: "BKK" };

for (const key in profile) {
    console.log(`${key}: ${profile[key]}`);
}
// name: Dolar
// age: 25
// city: BKK
```

### B. `Object.keys()` / `Object.values()` / `Object.entries()`
```javascript
console.log(Object.keys(profile));   // ["name", "age", "city"]
console.log(Object.values(profile)); // ["Dolar", 25, "BKK"]
console.log(Object.entries(profile));
// [ ["name","Dolar"], ["age",25], ["city","BKK"] ]

// ใช้คู่กับ for...of
for (const [key, value] of Object.entries(profile)) {
    console.log(`${key} = ${value}`);
}
```

> **📊 Comparison: Array vs Object Iteration**
>
> | ใช้กับ | **Array** | **Object** |
> | :--- | :--- | :--- |
> | วนลูป | `for...of` (ค่า) / `for` (index) | `for...in` (key) / `Object.entries()` |
> | เหมาะกับ | ข้อมูลเรียงลำดับ (Ordered) | ข้อมูลแบบ Key-Value (Unordered) |

---

## 7. Challenge: The Profile Maker 👤
จงสร้าง Object ชื่อ `myProfile` ที่มี:
1.  `name` — ชื่อจริงของคุณ
2.  `hobbies` — Array ของงานอดิเรกอย่างน้อย 3 อย่าง
3.  `introduce()` — Method ที่ return ข้อความ "Hi, I'm [name] and I love [hobby แรก]!"

::: details ✨ ดูเฉลย
```javascript
const myProfile = {
    name: "Dolar",
    hobbies: ["Coding", "Gaming", "Reading"],

    introduce() {
        return `Hi, I'm ${this.name} and I love ${this.hobbies[0]}!`;
    },
};

console.log(myProfile.introduce()); // "Hi, I'm Dolar and I love Coding!"
```
**จุดสังเกต:**
*   `this.hobbies[0]` — เข้าถึง Array ที่เป็น Property ของ Object โดยใช้ `this`
*   Template Literal `` ` `` ช่วยให้เขียน String ผสมตัวแปรได้ง่าย
:::

---
👉 **[ไปต่อ: 05-3 - Reference vs Value (Deep Dive)](/05-03-reference-vs-value)**
