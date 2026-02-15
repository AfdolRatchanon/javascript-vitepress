# 09-2: Inheritance (การสืบทอด — ต่อยอดจาก Class เดิม) 🧬

> **"Don't repeat yourself. Inheritance lets child classes reuse parent functionality."**
> — *Clean Code Principle*

Inheritance ช่วยให้เรา **ต่อยอด** จาก Class ที่มีอยู่ โดยไม่ต้องเขียนใหม่ทั้งหมด!

> **💡 Analogy (เปรียบเทียบ):**
> - **Parent Class (Animal)** = สัตว์ทั่วไป → มีชื่อ, กิน, นอน
> - **Child Class (Dog)** = หมา → **สืบทอด**ทุกอย่างจาก Animal + เพิ่ม "เห่า"
> - **Child Class (Cat)** = แมว → **สืบทอด**ทุกอย่างจาก Animal + เพิ่ม "ร้องเหมียว"

---

## 1. extends — สืบทอด Class 🔗

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends):

```javascript
// Parent Class (Base Class)
class Animal {
    constructor(name, sound) {
        this.name = name;
        this.sound = sound;
    }

    speak() {
        return `${this.name} says "${this.sound}"!`;
    }

    eat(food) {
        return `${this.name} is eating ${food}`;
    }
}

// Child Class — สืบทอดจาก Animal
class Dog extends Animal {
    constructor(name) {
        super(name, "Woof!"); // ⭐ เรียก Parent Constructor!
    }

    // เพิ่ม Method เฉพาะ Dog
    fetch(item) {
        return `${this.name} fetches the ${item}! 🎾`;
    }
}

class Cat extends Animal {
    constructor(name) {
        super(name, "Meow!");
    }

    purr() {
        return `${this.name} purrs... 😺`;
    }
}

const dog = new Dog("Buddy");
const cat = new Cat("Whiskers");

console.log(dog.speak());       // "Buddy says 'Woof!'!" (สืบทอดจาก Animal!)
console.log(dog.eat("bones"));  // "Buddy is eating bones" (สืบทอด!)
console.log(dog.fetch("ball")); // "Buddy fetches the ball! 🎾" (ของ Dog เอง)

console.log(cat.speak());       // "Whiskers says 'Meow!'!"
console.log(cat.purr());        // "Whiskers purrs... 😺"
```

---

## 2. super — เรียก Parent 📞

```javascript
class Character {
    constructor(name, hp) {
        this.name = name;
        this.hp = hp;
    }

    attack(target) {
        return `${this.name} attacks ${target.name}!`;
    }

    toString() {
        return `${this.name} (HP: ${this.hp})`;
    }
}

class Warrior extends Character {
    constructor(name, hp, weapon) {
        super(name, hp);          // ⭐ เรียก Parent Constructor ก่อน!
        this.weapon = weapon;     // แล้วค่อยเพิ่มของตัวเอง
    }

    // Override — เขียนทับ Method ของ Parent
    attack(target) {
        const baseAttack = super.attack(target); // เรียก Method ของ Parent!
        return `${baseAttack} Using ${this.weapon}! ⚔️`;
    }
}

class Mage extends Character {
    constructor(name, hp, mana) {
        super(name, hp);
        this.mana = mana;
    }

    castSpell(spellName, target) {
        if (this.mana < 10) return "Not enough mana!";
        this.mana -= 10;
        return `${this.name} casts ${spellName} on ${target.name}! 🔮`;
    }
}

const warrior = new Warrior("Arthus", 100, "Sword");
const mage = new Mage("Gandalf", 80, 50);

console.log(warrior.attack(mage));
// "Arthus attacks Gandalf! Using Sword! ⚔️"

console.log(mage.castSpell("Fireball", warrior));
// "Gandalf casts Fireball on Arthus! 🔮"
```

### ⚠️ กฎของ super:
1. **ต้อง**เรียก `super()` ใน Constructor ของ Child **ก่อนใช้ `this`**
2. `super.method()` เรียก Method เดิมของ Parent ได้

---

## 3. Method Overriding (เขียนทับ) ✏️

```javascript
class Shape {
    area() {
        return 0;
    }

    toString() {
        return `Shape: area = ${this.area()}`;
    }
}

class Circle extends Shape {
    constructor(radius) {
        super();
        this.radius = radius;
    }

    // Override area()!
    area() {
        return Math.PI * this.radius ** 2;
    }

    toString() {
        return `Circle (r=${this.radius}): area = ${this.area().toFixed(2)}`;
    }
}

class Rectangle extends Shape {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }

    area() {
        return this.width * this.height;
    }

    toString() {
        return `Rectangle (${this.width}×${this.height}): area = ${this.area()}`;
    }
}

const shapes = [new Circle(5), new Rectangle(4, 6), new Circle(3)];

shapes.forEach(shape => console.log(shape.toString()));
// Circle (r=5): area = 78.54
// Rectangle (4×6): area = 24
// Circle (r=3): area = 28.27
```

---

## 4. instanceof — ตรวจสอบชนิด 🔍

```javascript
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true (สืบทอดมา!)
console.log(dog instanceof Cat);    // false

console.log(cat instanceof Cat);    // true
console.log(cat instanceof Animal); // true
```

---

## 5. 📊 Inheritance Vocabulary

| คำศัพท์ | ความหมาย | ตัวอย่าง |
|:--------|:---------|:--------|
| **Parent/Base Class** | Class ต้นแบบ | `Animal` |
| **Child/Sub Class** | Class ที่สืบทอด | `Dog extends Animal` |
| **`extends`** | คำสั่งสืบทอด | `class Dog extends Animal` |
| **`super()`** | เรียก Constructor ของ Parent | `super(name, hp)` |
| **`super.method()`** | เรียก Method ของ Parent | `super.attack(target)` |
| **Override** | เขียนทับ Method ของ Parent | `attack()` ใน `Warrior` |
| **`instanceof`** | ตรวจว่าเป็น Instance ของ Class ไหม | `dog instanceof Animal` |

---

## 6. Challenges 🏆

### 🎯 Challenge 1: Vehicle Hierarchy
สร้าง Class Hierarchy:
- `Vehicle` (name, speed) → `move()`
- `Car extends Vehicle` (+ seats) → `honk()`
- `Truck extends Vehicle` (+ cargo) → `loadCargo()`

::: details ✨ ดูเฉลย
```javascript
class Vehicle {
    constructor(name, speed) {
        this.name = name;
        this.speed = speed;
    }
    move() { return `${this.name} moves at ${this.speed} km/h`; }
}

class Car extends Vehicle {
    constructor(name, speed, seats) {
        super(name, speed);
        this.seats = seats;
    }
    honk() { return `${this.name}: Beep beep! 🚗`; }
}

class Truck extends Vehicle {
    constructor(name, speed, cargo) {
        super(name, speed);
        this.cargo = cargo;
    }
    loadCargo(item) {
        this.cargo.push(item);
        return `Loaded ${item} onto ${this.name} 🚛`;
    }
}

const car = new Car("Toyota", 120, 5);
const truck = new Truck("Hino", 80, []);

console.log(car.move());         // "Toyota moves at 120 km/h"
console.log(car.honk());         // "Toyota: Beep beep! 🚗"
console.log(truck.loadCargo("Box")); // "Loaded Box onto Hino 🚛"
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Inheritance:** การสืบทอดคุณสมบัติจาก Parent Class สู่ Child Class
> *   **`extends`:** Keyword ที่ใช้สร้าง Child Class จาก Parent
> *   **`super()`:** เรียก Constructor ของ Parent Class
> *   **Override:** การเขียนทับ Method ของ Parent ใน Child
> *   **Polymorphism:** Object ต่าง Class ตอบสนอง Method เดียวกันต่างกัน
> *   **`instanceof`:** ตรวจสอบว่า Object เป็น Instance ของ Class ใด
> *   **IS-A Relationship:** Dog IS-A Animal (หมาเป็นสัตว์)
> *   **Method Resolution:** JavaScript หา Method จาก Instance ก่อน → ลำดับ Parent

---
👉 **[ไปต่อ: 09-3 - Prototypes (ต้นกำเนิด OOP)](/09-03-prototypes)**
