# 09-1: Classes (คลาส — พิมพ์เขียวของ Object) 🏭

> **"Classes are a template for creating objects."**
> — *MDN Web Docs*

ก่อนหน้านี้เราสร้าง Object ด้วย `{ }` ซึ่งเหมาะกับ Object ไม่กี่ตัว แต่ถ้าต้องสร้างเป็น **ร้อยๆ ตัว** ที่มีโครงสร้างเหมือนกัน → ใช้ **Class** ครับ!

> **💡 Analogy (เปรียบเทียบ):**
> Class เหมือน **"พิมพ์เขียวบ้าน"** 🏠:
> - **Class** = แบบพิมพ์เขียว (ยังไม่มีบ้านจริง)
> - **Instance** = บ้านจริงที่สร้างจากแบบ (มีได้หลายหลัง)
> - **Constructor** = ช่างก่อสร้าง (ทำงานตอนสร้างบ้าน)
> - **Methods** = สิ่งที่บ้านทำได้ (เปิดไฟ, ล็อคประตู)

---

## 1. Class Basics 🏗️

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes): Class คือ **โครงสร้างสำหรับสร้าง Object** ที่มีลักษณะคล้ายๆ กันหลายตัว

### ทำไมต้องใช้ Class?

สมมติต้องสร้าง User 100 คน — ถ้าใช้ Object Literal `{ }` จะต้องเขียน 100 ครั้ง แถมถ้าอยากเพิ่ม Method ต้องเพิ่มทุกตัว! Class ช่วย **เขียนครั้งเดียว ใช้ซ้ำได้เรื่อยๆ**

### โครงสร้าง Class:

```
class ชื่อ {
    constructor(พารามิเตอร์) { ... }  // ตอนสร้าง Instance
    method() { ... }                  // สิ่งที่ Instance ทำได้
}
```

### ตัวอย่างจริง:

```javascript
class User {
    // Constructor — ทำงานเมื่อสร้าง Instance ด้วย new
    constructor(name, age) {
        this.name = name;   // Instance Property
        this.age = age;
    }

    // Method — ฟังก์ชันของ Instance
    greet() {
        return `สวัสดี! ผม ${this.name} อายุ ${this.age}`;
    }

    // Method อีกตัว
    isAdult() {
        return this.age >= 18;
    }
}

// สร้าง Instance ด้วย new
const dolar = new User("Dolar", 25);
const somchai = new User("Somchai", 16);

console.log(dolar.greet());     // "สวัสดี! ผม Dolar อายุ 25"
console.log(dolar.isAdult());   // true
console.log(somchai.isAdult()); // false

// ⭐ แต่ละ Instance เป็นอิสระจากกัน!
console.log(dolar.name);    // "Dolar"
console.log(somchai.name);  // "Somchai"
```

---

## 2. Getters & Setters 🔐

ปกติเราเข้าถึง Property ตรงๆ ได้ (`user.name`) แต่บางทีเราอยาก **ควบคุมการอ่าน/เขียน** — เช่น:
- **อ่าน:** แสดงราคาพร้อมสัญลักษณ์ ฿ อัตโนมัติ
- **เขียน:** ตรวจว่าราคาไม่ติดลบก่อนบันทึก

`get` และ `set` ทำให้เรา **เรียกเหมือน Property แต่ทำงานเหมือน Method!**

```javascript
class Product {
    constructor(name, price) {
        this.name = name;
        this._price = price; // ใช้ _ เป็น Convention ว่า "อย่าแตะตรง"
    }

    // Getter — อ่านค่า (เรียกเหมือน Property!)
    get price() {
        return `฿${this._price.toLocaleString()}`;
    }

    // Setter — กำหนดค่า (พร้อม Validation!)
    set price(value) {
        if (value < 0) {
            throw new Error("ราคาต้องไม่ติดลบ!");
        }
        this._price = value;
    }

    get info() {
        return `${this.name} — ${this.price}`;
    }
}

const phone = new Product("iPhone", 45000);

console.log(phone.price);  // "฿45,000" (เรียก Getter!)
phone.price = 42000;       // ใช้ Setter!
console.log(phone.info);   // "iPhone — ฿42,000"

// phone.price = -100; // ❌ Error: ราคาต้องไม่ติดลบ!
```

---

## 3. Static Methods & Properties ⚡

**Static** = ของที่ติดกับ **Class** ไม่ใช่ Instance — คือ Method/Property ที่ **ไม่ต้องสร้าง Instance** ก็เรียกได้!

**เมื่อไหร่ใช้ Static?**
- **Utility Functions:** คำนวณที่ไม่ขึ้นกับ Instance (เช่น `Math.random()`, `Math.max()`)
- **Factory Methods:** สร้าง Instance แบบพิเศษ (เช่น `Color.red()`)
- **Constants:** ค่าคงที่ที่ใช้ร่วมกัน (เช่น `MathHelper.PI`)

> 💡 **สังเกต:** `Math.random()`, `Date.now()` ที่เราเคยใช้ — ก็คือ **Static Methods** ของ Class `Math` และ `Date` นั่นเอง!

```javascript
class MathHelper {
    static PI = 3.14159;

    static add(a, b) {
        return a + b;
    }

    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// ⭐ เรียกจาก Class ตรงๆ (ไม่ต้อง new!)
console.log(MathHelper.PI);           // 3.14159
console.log(MathHelper.add(2, 3));    // 5
console.log(MathHelper.random(1, 10)); // e.g. 7

// ❌ เรียกจาก Instance ไม่ได้!
// const m = new MathHelper();
// m.add(2, 3); // ❌ TypeError
```

### 📊 Instance vs Static

| | **Instance** | **Static** |
|:--|:------------|:-----------|
| **สร้าง** | ต้อง `new` | ไม่ต้อง `new` |
| **เรียก** | `instance.method()` | `Class.method()` |
| **`this`** | ชี้ไปยัง Instance | ชี้ไปยัง Class |
| **ใช้เมื่อ** | ข้อมูลของแต่ละตัว | Utility, Factory, Config |

---

## 4. Private Fields (#) 🔒

Private Fields ใช้ `#` นำหน้า — **เข้าถึงได้เฉพาะภายใน Class เท่านั้น!** ข้างนอกแตะไม่ได้เลย

**ทำไมต้อง Private?** เหมือนบัญชีธนาคาร — ลูกค้าดูยอดเงินได้ (Getter) แต่ **ไม่ควรแก้ยอดเงินตรงๆ** ต้องผ่าน Method ฝาก/ถอนที่มีการตรวจสอบ:

```javascript
class BankAccount {
    #balance; // Private! — เข้าถึงจากนอก Class ไม่ได้

    constructor(owner, initial = 0) {
        this.owner = owner;
        this.#balance = initial;
    }

    deposit(amount) {
        if (amount <= 0) throw new Error("ต้องมากกว่า 0!");
        this.#balance += amount;
        return this;
    }

    withdraw(amount) {
        if (amount > this.#balance) throw new Error("เงินไม่พอ!");
        this.#balance -= amount;
        return this;
    }

    get balance() {
        return this.#balance;
    }
}

const account = new BankAccount("Dolar", 1000);
account.deposit(500).withdraw(200); // Method Chaining!

console.log(account.balance);  // 1300
// console.log(account.#balance); // ❌ SyntaxError: Private!
```

> 💡 **Method Chaining** (`return this`) ทำให้เรียก Method ต่อกันได้เป็น Chain — เขียนสั้นสะอาด!

---

## 5. 📊 Class vs Object Literal

| คุณสมบัติ | **Object Literal** `{ }` | **Class** |
|:---------|:----------------------|:---------|
| **สร้างกี่ตัว** | เหมาะกับ 1-2 ตัว | เหมาะกับหลายๆ ตัว |
| **มี Constructor** | ❌ | ✅ |
| **มี Private** | ❌ | ✅ (`#`) |
| **Method แชร์** | ❌ (แยกกัน) | ✅ (ผ่าน Prototype) |
| **Inheritance** | ❌ | ✅ (`extends`) |
| **ใช้เมื่อ** | Config, Options, ข้อมูลชั่วคราว | User, Product, Game Character |

---

## 6. Challenges 🏆

### 🎯 Challenge 1: Counter Class
สร้าง Class `Counter` ที่มี:
- `increment()`, `decrement()`, `reset()`
- Getter `value` ที่ return ค่าปัจจุบัน

::: details ✨ ดูเฉลย
```javascript
class Counter {
    #count = 0;

    increment() { this.#count++; return this; }
    decrement() { this.#count--; return this; }
    reset() { this.#count = 0; return this; }

    get value() { return this.#count; }
}

const c = new Counter();
c.increment().increment().increment().decrement();
console.log(c.value); // 2
```
:::

### 🎯 Challenge 2: Static Factory
สร้าง Class `Color` ที่มี Static Methods:
- `Color.red()`, `Color.green()`, `Color.blue()` ที่สร้าง Color instance

::: details ✨ ดูเฉลย
```javascript
class Color {
    constructor(r, g, b) {
        this.r = r; this.g = g; this.b = b;
    }

    static red()   { return new Color(255, 0, 0); }
    static green() { return new Color(0, 255, 0); }
    static blue()  { return new Color(0, 0, 255); }

    toString() { return `rgb(${this.r}, ${this.g}, ${this.b})`; }
}

console.log(Color.red().toString());  // "rgb(255, 0, 0)"
```
:::

### 🎯 Challenge 3: Todo List Class
สร้าง Class `TodoList` ที่มี:
- `add(task)` — เพิ่ม Task ใหม่
- `complete(index)` — ทำเครื่องหมายว่าเสร็จ
- `get pending` — Getter ที่ return จำนวน Task ที่ยังไม่เสร็จ
- `toString()` — แสดงรายการ Task (✅ / ❌)

::: details ✨ ดูเฉลย
```javascript
class TodoList {
    #todos = [];

    add(task) {
        this.#todos.push({ task, done: false });
        return this;
    }

    complete(index) {
        if (index >= 0 && index < this.#todos.length) {
            this.#todos[index].done = true;
        }
        return this;
    }

    get pending() {
        return this.#todos.filter(t => !t.done).length;
    }

    toString() {
        return this.#todos
            .map((t, i) => `${i + 1}. ${t.done ? "✅" : "❌"} ${t.task}`)
            .join("\n");
    }
}

const list = new TodoList();
list.add("Learn Classes").add("Build Project").add("Review Code");
list.complete(0);
console.log(list.toString());
// 1. ✅ Learn Classes
// 2. ❌ Build Project
// 3. ❌ Review Code
console.log("Pending:", list.pending); // 2
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Class:** พิมพ์เขียวสำหรับสร้าง Object ที่มีโครงสร้างเดียวกัน
> *   **Instance:** Object ที่สร้างจาก Class ด้วย `new`
> *   **Constructor:** Method พิเศษที่ทำงานเมื่อสร้าง Instance
> *   **`this`:** อ้างถึง Instance ปัจจุบัน
> *   **Method:** ฟังก์ชันที่อยู่ใน Class
> *   **Getter:** Method ที่อ่านค่าเหมือน Property (`get x()`)
> *   **Setter:** Method ที่กำหนดค่าเหมือน Property (`set x(v)`)
> *   **Static:** ของที่ติดกับ Class ไม่ใช่ Instance
> *   **Private Field (`#`):** Property ที่เข้าถึงได้เฉพาะภายใน Class
> *   **Method Chaining:** เรียก Method ต่อกัน (`a.b().c().d()`)

---
👉 **[ไปต่อ: 09-2 - Inheritance (การสืบทอด)](/09-02-inheritance)**
