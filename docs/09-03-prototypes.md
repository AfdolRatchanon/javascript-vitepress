# 09-3: Prototypes (ต้นกำเนิดของ OOP ใน JavaScript) 🧬

> **"JavaScript is fundamentally a prototype-based language, not a class-based one."**
> — *Kyle Simpson*

Class ใน JavaScript เป็น **Syntax Sugar** ของ Prototype ครับ! ทุก Object มี **Prototype Chain** ที่ JavaScript ใช้หา Method/Property

> **💡 Analogy (เปรียบเทียบ):**
> Prototype เหมือน **"สายเลือด / พันธุกรรม"** 🧬:
> - ถ้า Object ไม่มี Method ที่เรียก → ไปหาใน "พ่อ" (Prototype)
> - ถ้าพ่อก็ไม่มี → ไปหาใน "ปู่" → ไปเรื่อยๆ → จน `null`

---

## 1. Prototype Chain ⛓️

```javascript
const obj = { name: "Dolar" };

// obj → Object.prototype → null
console.log(obj.toString());  // "[object Object]"
// ⭐ obj ไม่มี toString() แต่ Object.prototype มี!

console.log(obj.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__);          // null (จุดสิ้นสุด!)
```

### ภาพ Prototype Chain:

```
myDog → Dog.prototype → Animal.prototype → Object.prototype → null
  ↑         ↑                 ↑                  ↑
  name    speak()           eat()           toString()
  
เมื่อเรียก myDog.toString():
1. หาใน myDog → ❌ ไม่มี
2. หาใน Dog.prototype → ❌ ไม่มี
3. หาใน Animal.prototype → ❌ ไม่มี
4. หาใน Object.prototype → ✅ เจอ!
```

---

## 2. Class = Prototype Sugar 🍬

```javascript
// ✅ Class Syntax (ES6)
class User {
    constructor(name) {
        this.name = name;
    }
    greet() {
        return `Hi, ${this.name}`;
    }
}

// ✅ เบื้องหลัง — เทียบเท่ากับ:
function User(name) {
    this.name = name;
}
User.prototype.greet = function() {
    return `Hi, ${this.name}`;
};

// ทั้งสองแบบ ทำงานเหมือนกันทุกประการ!
const u = new User("Dolar");
console.log(u.greet()); // "Hi, Dolar"
```

### ตรวจสอบ Prototype:

```javascript
console.log(typeof User);               // "function" (Class = Function!)
console.log(u.__proto__ === User.prototype); // true
console.log(Object.getPrototypeOf(u) === User.prototype); // true ✅
```

---

## 3. Object.create() — สร้าง Object จาก Prototype ตรงๆ

```javascript
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

console.log(dog.speak());      // "Buddy says 'Woof!'"
console.log(dog.eat("bone"));  // "Buddy eats bone"

// ตรวจสอบ:
console.log(Object.getPrototypeOf(dog) === animalProto); // true
console.log(dog.hasOwnProperty("name"));   // true (ของตัวเอง)
console.log(dog.hasOwnProperty("speak"));  // false (มาจาก Prototype!)
```

---

## 4. hasOwnProperty vs in 🔍

```javascript
const user = { name: "Dolar", age: 25 };

// hasOwnProperty — เช็คเฉพาะของตัวเอง
console.log(user.hasOwnProperty("name"));     // true
console.log(user.hasOwnProperty("toString")); // false (มาจาก Prototype)

// in — เช็ครวม Prototype Chain
console.log("name" in user);      // true
console.log("toString" in user);  // true (มาจาก Prototype!)
```

### 📊 Comparison

| Method | เช็คอะไร | ตัวอย่าง |
|:-------|:--------|:--------|
| `hasOwnProperty()` | เฉพาะของตัวเอง | `"name"` → true, `"toString"` → false |
| `in` | รวม Prototype Chain | `"name"` → true, `"toString"` → true |
| `Object.keys()` | key ของตัวเองที่ enumerable | `["name", "age"]` |

---

## 5. Prototype Pitfalls ⚠️

```javascript
// ❌ อย่าแก้ Built-in Prototype!
Array.prototype.last = function() {
    return this[this.length - 1];
};
// ใช้ได้ แต่อันตราย! อาจชนกับ Library อื่น!

// ✅ ใช้ Utility Function แทน
function last(arr) {
    return arr[arr.length - 1];
}
```

---

## 6. Challenges 🏆

### 🎯 Challenge 1: Prototype Chain
```javascript
class A { foo() { return "A"; } }
class B extends A { foo() { return "B"; } }
class C extends B { }

const c = new C();
```
`c.foo()` return อะไร? อธิบาย Chain:

::: details ✨ ดูเฉลย
`c.foo()` return `"B"`

Chain: `c` → `C.prototype` (ไม่มี foo) → `B.prototype` (มี foo → return "B"!)
ไม่ไปถึง `A.prototype.foo` เพราะเจอใน `B` ก่อน
:::

### 🎯 Challenge 2: Own vs Inherited
```javascript
class Person {
    constructor(name) { this.name = name; }
    greet() { return "Hi!"; }
}
const p = new Person("Dolar");
```
`p.hasOwnProperty("name")` = ? `p.hasOwnProperty("greet")` = ?

::: details ✨ ดูเฉลย
```javascript
p.hasOwnProperty("name");  // true  (ตั้งใน constructor → ของ Instance)
p.hasOwnProperty("greet"); // false (อยู่ใน Person.prototype → ไม่ใช่ own!)
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Prototype:** Object ต้นแบบที่ Object อื่นสืบทอดมา
> *   **Prototype Chain:** โซ่ลำดับที่ JavaScript ค้นหา Method/Property
> *   **`__proto__`:** Property ที่ชี้ไปยัง Prototype (ไม่ควรใช้ตรง)
> *   **`Object.getPrototypeOf()`:** วิธีที่ถูกต้องในการดู Prototype
> *   **`Object.create()`:** สร้าง Object ที่มี Prototype ที่กำหนด
> *   **`hasOwnProperty()`:** เช็คว่า Property เป็นของ Object เองหรือมาจาก Prototype
> *   **Syntax Sugar:** ไวยากรณ์ที่ทำให้เขียนง่ายขึ้น แต่เบื้องหลังทำงานเหมือนเดิม
> *   **Constructor Function:** ฟังก์ชันที่ใช้กับ `new` เพื่อสร้าง Object (ก่อนมี Class)

---
👉 **[ไปทำโปรเจกต์: Project — RPG Game](/09-project-rpg-game)**
