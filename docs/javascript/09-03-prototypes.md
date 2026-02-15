# 09-3: Prototypes (ต้นกำเนิดของ OOP ใน JavaScript) 🧬

> **"JavaScript is fundamentally a prototype-based language, not a class-based one."**
> — *Kyle Simpson*

ในบทที่แล้วเราเรียน **Class** — แต่รู้หรือไม่ว่า Class ใน JavaScript เป็นแค่ **Syntax Sugar!** เบื้องหลังจริงๆ คือ **Prototype** ซึ่งเป็นแก่นแท้ของ OOP ใน JavaScript ทุก Object ล้วนมี **Prototype Chain** ที่ JavaScript ใช้ค้นหา Method และ Property

> **💡 Analogy (เปรียบเทียบ):**
> Prototype เหมือน **"สายเลือด / พันธุกรรม"** 🧬:
> - ถ้าลูก (Object) ไม่มีความสามารถบางอย่าง → ไปดูที่ **พ่อ** (Prototype)
> - ถ้าพ่อก็ไม่มี → ไปดูที่ **ปู่** → **ทวด** → ไล่ไปเรื่อยๆ จน **null** (ต้นตระกูล)
> - เหมือนถ่ายทอดพันธุกรรม — ลูกสืบทอดคุณสมบัติจากบรรพบุรุษ!

---

## 1. Prototype Chain คืออะไร? ⛓️

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain): ทุก Object ใน JavaScript มี **Internal Link** ชี้ไปยัง Object อื่น (เรียกว่า Prototype) เมื่อเรียก Property/Method ที่ Object ไม่มี → JavaScript จะ **ไล่หาตาม Chain** ไปเรื่อยๆ

### ทดลองดู Chain จริง:

```javascript
const obj = { name: "Dolar" };

// obj → Object.prototype → null
console.log(obj.toString());  // "[object Object]"
// ⭐ obj ไม่มี toString() เลย! แต่ Object.prototype มี!
// JavaScript ไล่หาตาม Chain → เจอใน Object.prototype → เรียกใช้!

// ✅ ดู Prototype:
console.log(obj.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__);          // null (จุดสิ้นสุดของ Chain!)
```

> ⚠️ `__proto__` ใช้ดูได้ แต่**ไม่ควรใช้ตรงๆ** ในโค้ดจริง → ใช้ `Object.getPrototypeOf()` แทน

### ภาพ Prototype Chain:

```
myDog → Dog.prototype → Animal.prototype → Object.prototype → null
  ↑         ↑                 ↑                  ↑
  name    speak()           eat()           toString()
```

เมื่อเรียก `myDog.toString()` ← JavaScript ทำงานอย่างไร?

| ขั้นตอน | ค้นหาที่ | ผลลัพธ์ |
|:--------|:---------|:--------|
| 1 | `myDog` | ❌ ไม่มี `toString` |
| 2 | `Dog.prototype` | ❌ ไม่มี |
| 3 | `Animal.prototype` | ❌ ไม่มี |
| 4 | `Object.prototype` | ✅ **เจอ!** → เรียกใช้! |

> 💡 **ถ้าไล่จนถึง `null` แล้วยังไม่เจอ** → return `undefined` (ถ้าเป็น Property) หรือ `TypeError` (ถ้าพยายามเรียกเป็นฟังก์ชัน)

---

## 2. Class = Prototype Sugar 🍬

คำว่า **"Syntax Sugar"** หมายถึง ไวยากรณ์ที่ทำให้เขียนง่ายขึ้น แต่เบื้องหลังทำงานเหมือนเดิม — เหมือน "น้ำตาลเคลือบ" ที่ทำให้กินง่ายขึ้น!

```javascript
// ============================================
// ✅ แบบ Class (ES6) — ที่เราเรียนใน 09-1
// ============================================
class User {
    constructor(name) {
        this.name = name;
    }
    greet() {
        return `Hi, ${this.name}`;
    }
}

// ============================================
// ✅ แบบ Prototype (ก่อน ES6) — เบื้องหลัง Class!
// ============================================
function UserOld(name) {
    this.name = name;
}
UserOld.prototype.greet = function() {
    return `Hi, ${this.name}`;
};

// ⭐ ทั้งสองแบบ ทำงานเหมือนกันทุกประการ!
const u1 = new User("Dolar");
const u2 = new UserOld("Dolar");
console.log(u1.greet()); // "Hi, Dolar"
console.log(u2.greet()); // "Hi, Dolar"
```

### ทำไม Method อยู่ใน Prototype ไม่ใช่ใน Instance?

**เพื่อประหยัดหน่วยความจำ!** ถ้า Method อยู่ใน Instance → สร้าง 1,000 Users = สำเนา `greet()` 1,000 ชุด! แต่ถ้าอยู่ใน Prototype → มีแค่ **ชุดเดียว** ทุก Instance **แชร์กัน** ผ่าน Prototype Chain

```javascript
const a = new User("A");
const b = new User("B");

// ⭐ ทั้งคู่ใช้ greet() ชุดเดียวกัน!
console.log(a.greet === b.greet); // true (reference เดียวกัน!)
```

### ตรวจสอบ Prototype:

```javascript
console.log(typeof User);               // "function" (Class = Function เบื้องหลัง!)
console.log(u1.__proto__ === User.prototype); // true

// ✅ วิธีที่ถูกต้อง (ไม่ใช้ __proto__):
console.log(Object.getPrototypeOf(u1) === User.prototype); // true ✅
```

---

## 3. Object.create() — สร้าง Object จาก Prototype ตรงๆ

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create): `Object.create(proto)` สร้าง Object ใหม่ที่มี `proto` เป็น Prototype — ไม่ต้องใช้ `class` หรือ `new`!

```javascript
// สร้าง Prototype Object
const animalProto = {
    speak() {
        return `${this.name} says "${this.sound}"`;
    },
    eat(food) {
        return `${this.name} eats ${food}`;
    },
};

// สร้าง Object ที่มี animalProto เป็น Prototype
const dog = Object.create(animalProto);
dog.name = "Buddy";
dog.sound = "Woof!";

console.log(dog.speak());      // "Buddy says "Woof!""
console.log(dog.eat("bone"));  // "Buddy eats bone"

// ⭐ speak() และ eat() มาจาก animalProto!
console.log(dog.hasOwnProperty("name"));   // true  (ของ dog เอง)
console.log(dog.hasOwnProperty("speak"));  // false (มาจาก Prototype!)
```

### เมื่อไหร่ใช้ Object.create()?

- เมื่อต้องการ **Prototype แบบง่ายๆ** ไม่ซับซ้อนขนาด Class
- เมื่อต้องการ **สร้าง Object ที่ไม่มี Prototype เลย** (Clean Object):

```javascript
// Object ที่ไม่มี Prototype → ไม่มี toString(), hasOwnProperty() ฯลฯ!
const cleanObj = Object.create(null);
cleanObj.key = "value";
console.log(cleanObj.toString); // undefined! ❌ ไม่มี!
// ⭐ ใช้เป็น "Pure Dictionary" — ปลอดภัยเป็น Key-Value Store
```

---

## 4. hasOwnProperty vs in 🔍

การเช็คว่า Object มี Property อะไรบ้าง มี 2 วิธีที่ทำงาน**ต่างกัน**:

```javascript
const user = { name: "Dolar", age: 25 };

// hasOwnProperty — เช็คเฉพาะ Property ของตัวเอง (ไม่ดู Prototype)
console.log(user.hasOwnProperty("name"));     // true ✅ (ของตัวเอง)
console.log(user.hasOwnProperty("toString")); // false ❌ (มาจาก Object.prototype)

// in — เช็ครวม Prototype Chain ทั้งหมด
console.log("name" in user);      // true ✅
console.log("toString" in user);  // true ✅ (มาจาก Prototype → แต่ in บอกว่ามี!)
```

### 📊 Comparison

| Method | เช็คอะไร | ตัวอย่าง (กับ `{ name: "A", age: 25 }`) |
|:-------|:--------|:--------|
| `hasOwnProperty()` | เฉพาะ Property ของ Object เอง | `"name"` → true, `"toString"` → **false** |
| `in` | รวม Prototype Chain ทั้งหมด | `"name"` → true, `"toString"` → **true** |
| `Object.keys()` | Key ของตัวเองที่ enumerable | return `["name", "age"]` |
| `Object.getOwnPropertyNames()` | Key ของตัวเองทั้งหมด | return `["name", "age"]` |

> 💡 **Use Case:** ในโค้ดจริง `hasOwnProperty()` ใช้บ่อยเวลา Loop ด้วย `for...in` เพราะ `for...in` ดู Prototype ด้วย → อาจได้ Property ที่ไม่ต้องการ!

```javascript
for (const key in user) {
    if (user.hasOwnProperty(key)) {
        console.log(key, "→", user[key]); // เฉพาะของตัวเอง!
    }
}
// ✅ หรือใช้ Object.keys() แทน (สะดวกกว่า):
Object.keys(user).forEach(key => console.log(key, "→", user[key]));
```

---

## 5. Prototype Pitfalls ⚠️

### ❌ อย่าแก้ Built-in Prototype!

```javascript
// ❌ อันตราย! อย่าทำ!
Array.prototype.last = function() {
    return this[this.length - 1];
};

// ใช้ได้ก็จริง:
console.log([1, 2, 3].last()); // 3

// แต่อันตราย! เพราะ:
// 1. อาจชนกับ Library อื่นที่เพิ่ม .last() เหมือนกัน!
// 2. อาจชนกับ JavaScript version ใหม่ที่เพิ่ม .last() อย่างเป็นทางการ!
// 3. ทำให้ for...in loop ได้ค่าที่ไม่ต้องการ!
```

### ✅ ทำแบบนี้แทน:

```javascript
// ✅ ใช้ Utility Function
function last(arr) {
    return arr[arr.length - 1];
}
console.log(last([1, 2, 3])); // 3

// ✅ หรือใช้ .at() ที่มี built-in แล้ว (ES2022)
console.log([1, 2, 3].at(-1)); // 3 ✅
```

### ⚠️ Shallow Copy ของ Prototype Properties:

```javascript
const proto = { settings: { theme: "dark" } };
const a = Object.create(proto);
const b = Object.create(proto);

// ⚠️ ทั้งคู่แชร์ settings ตัวเดียวกัน!
a.settings.theme = "light";
console.log(b.settings.theme); // "light" — b โดนเปลี่ยนด้วย! 😱

// ✅ แก้: ให้แต่ละ Instance มี settings ของตัวเอง
// a.settings = { ...proto.settings }; // Shallow Copy
```

---

## 6. 📊 Prototype Summary

| Concept | อธิบาย | ตัวอย่าง |
|:--------|:-------|:--------|
| **Prototype Chain** | โซ่ลำดับที่ JS ค้นหา Property | `obj → Proto → Object.prototype → null` |
| **`__proto__`** | ดู Prototype (ไม่ควรใช้ตรง) | `obj.__proto__` |
| **`Object.getPrototypeOf()`** | ดู Prototype (วิธีที่ถูกต้อง) | `Object.getPrototypeOf(obj)` |
| **`Object.create(proto)`** | สร้าง Object จาก Prototype | `Object.create(animalProto)` |
| **`hasOwnProperty()`** | เช็ค Property ของตัวเอง | `obj.hasOwnProperty("name")` |
| **Class = Sugar** | Class เป็นแค่ Syntax Sugar | `class X {}` ≡ `function X() {}` |

---

## 7. Challenges 🏆

## 7. Challenges 🏆

ทดสอบความเข้าใจกับโจทย์ 5 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: The Chain
**หัวข้อ:** 1. Prototype Chain

**โจทย์:** ถ้า `dog` ไม่มี method `toString()` JS จะไปหาที่ไหนต่อเป็นที่แรก?
::: details ✨ ดูเฉลย
ที่ **`Dog.prototype`** ครับ (ถ้าไม่มีค่อยไป Animal.prototype → Object.prototype)
:::

### 🎯 Challenge 2: Sugar Free
**หัวข้อ:** 2. Class Sugar

**โจทย์:** `class A {}` เบื้องหลังคืออะไรใน ES5? (Function หรือ Object)
::: details ✨ ดูเฉลย
**Function** ครับ (`function A() {}`)
:::

### 🎯 Challenge 3: Pure Object
**หัวข้อ:** 3. Object.create

**โจทย์:** สร้าง Object ที่ "ไม่มี Prototype" เลย (Clean Object) ต้องเขียนอย่างไร?
::: details ✨ ดูเฉลย
```javascript
const obj = Object.create(null);
```
:::

### 🎯 Challenge 4: Property Check
**หัวข้อ:** 4. hasOwnProperty

**โจทย์:** `key in obj` ต่างกับ `obj.hasOwnProperty(key)` อย่างไร?
::: details ✨ ดูเฉลย
`in` เช็คทั้ง Chain (รวม Prototype) แต่ `hasOwnProperty` เช็คแค่ในตัว Object เอง
:::

### 🎯 Challenge 5: Safety First
**หัวข้อ:** 5. Pitfalls

**โจทย์:** ทำไมเราไม่ควรไปแก้ `Array.prototype` โดยตรง?
::: details ✨ ดูเฉลย
เพราะอาจจะ **ชนกับ Library อื่น** หรือ **มาตรฐานใหม่ของ JS** ในอนาคต ทำให้โค้ดพังได้ครับ
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Prototype:** Object ต้นแบบที่ Object อื่นสืบทอด Method/Property มา
> *   **Prototype Chain:** โซ่ลำดับที่ JavaScript ไล่ค้นหา Method/Property ขึ้นไปเรื่อยๆ
> *   **`__proto__`:** Property ที่ชี้ไปยัง Prototype ของ Object (ไม่ควรใช้ตรงๆ)
> *   **`Object.getPrototypeOf()`:** วิธีที่ถูกต้องในการดู Prototype ของ Object
> *   **`Object.create(proto)`:** สร้าง Object ใหม่ที่มี `proto` เป็น Prototype
> *   **`hasOwnProperty()`:** เช็คว่า Property เป็นของ Object เองหรือมาจาก Prototype
> *   **Syntax Sugar:** ไวยากรณ์ที่ทำให้เขียนง่ายขึ้น เบื้องหลังทำงานเหมือนเดิม
> *   **Constructor Function:** ฟังก์ชันที่ใช้กับ `new` เพื่อสร้าง Object (ก่อนมี Class)
> *   **Property Shadowing:** เมื่อ Instance มี Property ชื่อเดียวกับ Prototype → ใช้ของ Instance (บัง Prototype)
> *   **Clean Object:** Object ที่ไม่มี Prototype (`Object.create(null)`) — ใช้เป็น Pure Dictionary

---
👉 **[ไปทำโปรเจกต์: Project — RPG Game](/09-project-rpg-game)**
