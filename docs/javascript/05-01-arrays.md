# 05-1: Arrays (อาร์เรย์ — รายการข้อมูล) 📋

> **"Arrays are the most common data structure in nearly all programming languages."**
> — *MDN Web Docs*

ถ้าตัวแปรเก็บได้ค่าเดียว Array ก็เหมือน **"ตู้ล็อกเกอร์"** ที่เก็บค่าหลายค่าเรียงต่อกันในที่เดียว แต่ละช่องมี **"หมายเลข" (Index)** กำกับ

> **💡 Analogy (เปรียบเทียบ):**
> Array เหมือน **"รถไฟ"** ครับ:
> - แต่ละ **ตู้โดยสาร** = สมาชิก (Element) ในอาร์เรย์
> - **หมายเลขตู้** = Index (เริ่มจาก 0 ไม่ใช่ 1!)
> - คุณสามารถ **เพิ่มตู้ท้าย** (push), **ถอดตู้ท้าย** (pop), **เพิ่มตู้หน้า** (unshift) ได้เลย

## 1. Creating Arrays (การสร้าง Array) 🛠️

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) มีหลายวิธีสร้าง Array:

```javascript
// 1. Array Literal (แนะนำ! — ใช้บ่อยที่สุด)
const fruits = ["🍎 Apple", "🍌 Banana", "🍊 Orange"];
const numbers = [1, 2, 3, 4, 5];
const mixed = ["hello", 42, true, null, { name: "Dolar" }]; // ผสมชนิดข้อมูลได้!
const empty = []; // Array ว่าง

// 2. Array Constructor (ไม่ค่อยนิยม)
const arr = new Array(3);         // สร้าง Array ขนาด 3 (มีแต่ช่องว่าง)
const arr2 = new Array(1, 2, 3);  // [1, 2, 3]

// 3. Array.from() — แปลง "สิ่งคล้าย Array" เป็น Array
const chars = Array.from("Hello"); // ["H", "e", "l", "l", "o"]
const nums = Array.from({ length: 5 }, (_, i) => i + 1); // [1, 2, 3, 4, 5]

// 4. Spread Operator (ES6)
const original = [1, 2, 3];
const copy = [...original];       // [1, 2, 3] — Copy ใหม่ทั้ง Array!
const merged = [...original, 4, 5]; // [1, 2, 3, 4, 5]
```



## 2. Accessing Elements (การเข้าถึงสมาชิก) 🔍

### Index เริ่มจาก 0 (Zero-Based Indexing)!

```javascript
const colors = ["Red", "Green", "Blue", "Yellow"];
//    Index:      0       1        2        3

console.log(colors[0]);     // "Red" ← ตัวแรก!
console.log(colors[2]);     // "Blue"
console.log(colors[3]);     // "Yellow" ← ตัวสุดท้าย

// ⚠️ ถ้า Index เกิน → ไม่ Error แต่ได้ undefined!
console.log(colors[10]);    // undefined

// .length — จำนวนสมาชิก
console.log(colors.length); // 4

// ตัวสุดท้าย — ใช้ length - 1
console.log(colors[colors.length - 1]); // "Yellow"

// ES2022: .at() — รองรับ Negative Index!
console.log(colors.at(0));   // "Red"
console.log(colors.at(-1));  // "Yellow" ← ตัวสุดท้าย!
console.log(colors.at(-2));  // "Blue" ← ตัวรองสุดท้าย
```

### 📊 Index Visual

```
Array:  ["Red",  "Green", "Blue",  "Yellow"]
Index:     0        1        2         3
Neg:      -4       -3       -2        -1
Length: 4
```



## 3. Mutating Methods (Methods ที่เปลี่ยนแปลง Array เดิม) 🔧

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#instance_methods) Methods เหล่านี้ **แก้ไข Array ตัวเดิม**:

### A. เพิ่ม/ลบสมาชิก:

```javascript
const fruits = ["🍎", "🍌"];

// push() — เพิ่มท้าย → Return ความยาวใหม่
const newLength = fruits.push("🍊");
console.log(fruits);     // ["🍎", "🍌", "🍊"]
console.log(newLength);  // 3

// pop() — ลบท้าย → Return สมาชิกที่ถูกลบ
const removed = fruits.pop();
console.log(fruits);     // ["🍎", "🍌"]
console.log(removed);    // "🍊"

// unshift() — เพิ่มหน้า
fruits.unshift("🍇");
console.log(fruits);     // ["🍇", "🍎", "🍌"]

// shift() — ลบหน้า → Return สมาชิกที่ถูกลบ
const first = fruits.shift();
console.log(fruits);     // ["🍎", "🍌"]
console.log(first);      // "🍇"
```

### 📊 Push/Pop/Shift/Unshift Cheatsheet

```
                    unshift()        push()
                    ← เพิ่มหน้า      เพิ่มท้าย →
                         │                │
Array:    [  "🍎",  "🍌",  "🍊",  "🍇"  ]
                         │                │
                    ← shift()         pop() →
                    ลบหน้า           ลบท้าย
```

### B. splice() — ตัด/แทรก ณ ตำแหน่งใดก็ได้ (Swiss Army Knife!):

```javascript
const colors = ["Red", "Green", "Blue", "Yellow", "Purple"];

// ลบ 2 ตัว เริ่มจาก Index 1
const removed = colors.splice(1, 2);
console.log(colors);   // ["Red", "Yellow", "Purple"]
console.log(removed);  // ["Green", "Blue"]

// แทรก ณ Index 1 (ลบ 0 ตัว แทรก 2 ตัว)
colors.splice(1, 0, "Pink", "Cyan");
console.log(colors);   // ["Red", "Pink", "Cyan", "Yellow", "Purple"]

// แทนที่ 1 ตัว ณ Index 0
colors.splice(0, 1, "Crimson");
console.log(colors);   // ["Crimson", "Pink", "Cyan", "Yellow", "Purple"]
```

### C. sort() และ reverse():

```javascript
// sort() — เรียงลำดับ (⚠️ เรียงเป็น String โดยปริยาย!)
const nums = [40, 100, 1, 5, 25, 10];
nums.sort();
console.log(nums); // [1, 10, 100, 25, 40, 5] ← ❌ ผิด! เพราะเรียงเป็น String

// ✅ ต้องใส่ Compare Function สำหรับ Number
nums.sort((a, b) => a - b);
console.log(nums); // [1, 5, 10, 25, 40, 100] ← ✅ ถูก!

// reverse() — กลับลำดับ
nums.reverse();
console.log(nums); // [100, 40, 25, 10, 5, 1]
```



## 4. Non-Mutating Methods (Methods ที่ Return ค่าใหม่ ไม่แก้ตัวเดิม) 🌱

### A. Searching — ค้นหา:

```javascript
const fruits = ["Apple", "Banana", "Cherry", "Apple", "Date"];

console.log(fruits.indexOf("Cherry"));     // 2 (Index แรกที่เจอ)
console.log(fruits.indexOf("Grape"));      // -1 (ไม่เจอ)
console.log(fruits.lastIndexOf("Apple"));  // 3 (Index สุดท้ายที่เจอ)

console.log(fruits.includes("Banana"));    // true
console.log(fruits.includes("Grape"));     // false

// find() — หาสมาชิกตัวแรกที่ตรงเงื่อนไข
const nums = [10, 25, 30, 45, 50];
const found = nums.find(n => n > 20);
console.log(found); // 25 (ตัวแรกที่ > 20)

// findIndex() — หา Index ตัวแรกที่ตรงเงื่อนไข
const idx = nums.findIndex(n => n > 20);
console.log(idx); // 1
```

### B. Transformation — แปลงข้อมูล:

```javascript
const numbers = [1, 2, 3, 4, 5];

// slice() — ตัดชิ้นส่วน (ไม่แก้ตัวเดิม!)
const sliced = numbers.slice(1, 4);
console.log(sliced);   // [2, 3, 4]
console.log(numbers);  // [1, 2, 3, 4, 5] ← ยังเหมือนเดิม!

// concat() — ต่อ Array
const more = numbers.concat([6, 7], [8, 9]);
console.log(more); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// join() — รวมเป็น String
console.log(numbers.join(", ")); // "1, 2, 3, 4, 5"
console.log(numbers.join("-"));  // "1-2-3-4-5"

// flat() — ลด Level ของ Array ซ้อน Array
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat());   // [1, 2, 3, 4, [5, 6]]
console.log(nested.flat(2));  // [1, 2, 3, 4, 5, 6] (Flat 2 ระดับ)
```



## 5. Iterating Arrays (การวนลูป Array) 🔄

### A. `for` Loop (คลาสสิก):

```javascript
const fruits = ["Apple", "Banana", "Cherry"];

for (let i = 0; i < fruits.length; i++) {
    console.log(`${i}: ${fruits[i]}`);
}
// 0: Apple
// 1: Banana
// 2: Cherry
```

### B. `for...of` Loop (ES6 — แนะนำ!):

```javascript
for (const fruit of fruits) {
    console.log(fruit);
}
// Apple
// Banana
// Cherry

// ถ้าต้องการ Index ด้วย:
for (const [index, fruit] of fruits.entries()) {
    console.log(`${index}: ${fruit}`);
}
```

### C. Array Methods (Functional Style — แนะนำมาก!):

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// forEach() — ทำอะไรบางอย่างกับทุกสมาชิก (ไม่ Return ค่า)
numbers.forEach(n => console.log(n * 2));

// map() — แปลงทุกสมาชิก → Return Array ใหม่
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// filter() — กรองเฉพาะที่ตรงเงื่อนไข → Return Array ใหม่
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

// reduce() — รวมทุกค่าเป็นค่าเดียว
const sum = numbers.reduce((total, n) => total + n, 0);
console.log(sum); // 55

// every() — ทุกตัวตรงเงื่อนไขไหม? → Boolean
console.log(numbers.every(n => n > 0));  // true
console.log(numbers.every(n => n > 5));  // false

// some() — มีตัวไหนตรงเงื่อนไขไหม? → Boolean
console.log(numbers.some(n => n > 9));   // true
console.log(numbers.some(n => n > 100)); // false
```

### 📊 Array Methods Quick Reference

| Method | Return | ทำอะไร | ตัวอย่าง |
|:-------|:-------|:------|:---------|
| `forEach()` | `undefined` | วนลูป (ไม่ return) | `arr.forEach(x => console.log(x))` |
| `map()` | ✅ Array ใหม่ | แปลงทุกตัว | `arr.map(x => x * 2)` |
| `filter()` | ✅ Array ใหม่ | กรอง | `arr.filter(x => x > 5)` |
| `reduce()` | ✅ ค่าเดียว | รวมค่า | `arr.reduce((s, x) => s + x, 0)` |
| `find()` | ✅ สมาชิก | หาตัวแรก | `arr.find(x => x > 5)` |
| `findIndex()` | ✅ Index | หา Index แรก | `arr.findIndex(x => x > 5)` |
| `every()` | ✅ Boolean | ทุกตัวผ่าน? | `arr.every(x => x > 0)` |
| `some()` | ✅ Boolean | มีตัวไหนผ่าน? | `arr.some(x => x > 100)` |



## 6. Method Chaining (ต่อท่อ Method) 🔗

เมื่อ Method return Array ใหม่ เราสามารถ "ต่อท่อ" ได้:

```javascript
const students = [
    { name: "Dolar", score: 85 },
    { name: "Somchai", score: 42 },
    { name: "Somsak", score: 91 },
    { name: "Noi", score: 67 },
    { name: "Lek", score: 55 },
];

// หา "ชื่อ" ของนักเรียนที่ "สอบผ่าน" (score >= 60) แล้ว "เรียงตามคะแนน"
const passedNames = students
    .filter(s => s.score >= 60)       // กรองเฉพาะคนที่ผ่าน
    .sort((a, b) => b.score - a.score) // เรียงจากมากไปน้อย
    .map(s => `${s.name} (${s.score})`); // แปลงเป็น String

console.log(passedNames);
// ["Somsak (91)", "Dolar (85)", "Noi (67)"]
```



## 7. Destructuring & Spread (ES6) 📦

```javascript
// Destructuring — แกะ Array ใส่ตัวแปร
const rgb = [255, 128, 0];
const [red, green, blue] = rgb;
console.log(red, green, blue); // 255, 128, 0

// ข้ามสมาชิก
const [first, , third] = [10, 20, 30];
console.log(first, third); // 10, 30

// ใช้กับ Rest
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]

// Spread — กระจาย Array
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2];       // [1, 2, 3, 4, 5, 6]
const withExtra = [0, ...arr1, 99];      // [0, 1, 2, 3, 99]
const copy = [...arr1];                   // [1, 2, 3] (Shallow Copy)
```

## Real-World Use Case: Todo List ด้วย Array Methods 🌐

```javascript
let todos = [
    { id: 1, text: "เรียน JavaScript", done: true },
    { id: 2, text: "ทำโปรเจกต์", done: false },
    { id: 3, text: "สมัครงาน", done: false },
];

// เพิ่ม Todo
todos = [...todos, { id: 4, text: "สัมภาษณ์งาน", done: false }];

// นับที่ยังไม่เสร็จ
const pending = todos.filter(t => !t.done).length;
console.log("เหลืออีก " + pending + " งาน"); // "เหลืออีก 3 งาน"

// หา Todo ตาม ID
const found = todos.find(t => t.id === 2);
console.log(found.text); // "ทำโปรเจกต์"
```



## 8. Challenges 🏆

ทดสอบความเข้าใจกับโจทย์ 7 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: The Creator
**หัวข้อ:** 1. Creating Arrays

**โจทย์:** สร้าง Array `playlist` ที่มีเพลงโปรด 3 เพลง แล้วใช้ `push` เพิ่มเพลงที่ 4 เข้าไป
::: details ✨ ดูเฉลย
```javascript
const playlist = ["Song A", "Song B", "Song C"];
playlist.push("Song D");
```
:::

### 🎯 Challenge 2: Access & Update
**หัวข้อ:** 2. Accessing Elements

**โจทย์:** เปลี่ยนสมาชิก "ตัวสุดท้าย" ของ Array นี้ให้เป็น `"Updated"` (โดยไม่ใช้ Index ตัวเลขตรงๆ)
```javascript
const data = [10, 20, 30, 40];
```
::: details ✨ ดูเฉลย
```javascript
data[data.length - 1] = "Updated";
// หรือ data.at(-1) = "Updated"; (แต่วิธีนี้อาจยังไม่รองรับการ assign ในทุก browser)
// ใช้ data[data.length - 1] ชัวร์ที่สุดครับสำหรับการ assign
```
:::

### 🎯 Challenge 3: Queue Manager
**หัวข้อ:** 3. Mutating Methods

**โจทย์:** มีคิว `["A", "B"]`
1. เพิ่ม "C" เข้าท้าย
2. นำ "A" ออกจากหัว
3. แทรก "VIP" ไปที่หัวแถว
::: details ✨ ดูเฉลย
```javascript
const queue = ["A", "B"];
queue.push("C");    // ["A", "B", "C"]
queue.shift();      // ["B", "C"]
queue.unshift("VIP"); // ["VIP", "B", "C"]
```
:::

### 🎯 Challenge 4: Search Engine
**หัวข้อ:** 4. Non-Mutating Methods

**โจทย์:** หา "ตำแหน่ง" (Index) ของสินค้า `"Phone"` ใน Array และตรวจสอบว่ามี `"Tablet"` หรือไม่?
```javascript
const items = ["Laptop", "Mouse", "Phone", "Keyboard"];
```
::: details ✨ ดูเฉลย
```javascript
const phoneIdx = items.indexOf("Phone"); // 2
const hasTablet = items.includes("Tablet"); // false
```
:::

### 🎯 Challenge 5: Loop the Loop
**หัวข้อ:** 5. Iterating Arrays

**โจทย์:** ใช้ `for...of` เพื่อหาผลรวมของคะแนนใน Array `scores`
```javascript
const scores = [10, 20, 30];
```
::: details ✨ ดูเฉลย
```javascript
let total = 0;
for (const score of scores) {
    total += score;
}
console.log(total); // 60
```
:::

### 🎯 Challenge 6: Chain Reaction
**หัวข้อ:** 6. Method Chaining

**โจทย์:** มี Array ตัวเลข `[1, -2, 3, -4, 5]` จงเขียน Chain เดียวเพื่อ:
1. กรองเอาเฉพาะเลขบวก (`filter`)
2. คูณ 2 ทุกตัว (`map`)
::: details ✨ ดูเฉลย
```javascript
const result = [1, -2, 3, -4, 5]
    .filter(n => n > 0)
    .map(n => n * 2);
console.log(result); // [2, 6, 10]
```
:::

### 🎯 Challenge 7: Destructuring Swap
**หัวข้อ:** 7. Destructuring & Spread

**โจทย์:** สลับค่าตัวแปร `a` และ `b` โดยใช้ Array Destructuring (ห้ามใช้ตัวแปรพัก)
```javascript
let a = 1, b = 2;
```
::: details ✨ ดูเฉลย
```javascript
[a, b] = [b, a];
```
:::



> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Array:** โครงสร้างข้อมูลที่เก็บค่าหลายค่าเรียงลำดับ เข้าถึงด้วย Index
> *   **Index:** ตำแหน่งของสมาชิกใน Array (เริ่มจาก 0)
> *   **Element:** สมาชิกแต่ละตัวใน Array
> *   **Mutating Method:** Method ที่เปลี่ยนแปลง Array ตัวเดิม (push, pop, splice, sort)
> *   **Non-mutating Method:** Method ที่ Return ค่าใหม่โดยไม่แก้ตัวเดิม (slice, map, filter)
> *   **Callback Function:** ฟังก์ชันที่ส่งเป็น Argument ให้ Method (เช่น ฟังก์ชันใน `.map()`)
> *   **Method Chaining:** การต่อ Method หลายตัวติดกัน เช่น `.filter().map().reduce()`
> *   **Destructuring:** การแยกค่าจาก Array ใส่ตัวแปร เช่น `const [a, b] = [1, 2]`
> *   **Spread Operator (`...`):** กระจายสมาชิก Array ออกมา เช่น `[...arr1, ...arr2]`
> *   **Shallow Copy:** การ Copy ที่สร้าง Array ใหม่แต่ถ้ามี Object ข้างในจะยังชี้ Reference เดิม


👉 **[ไปต่อ: 05-3 - Objects (ออบเจกต์)](/javascript/05-03-objects)**
