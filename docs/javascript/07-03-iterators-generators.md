# 07-3: Iterators & Generators 🔄

> **"Generators are the function that you can pause and resume. It's like a function with a pause button."**
> — *JavaScript Concepts*

ปกติตอนเราเรียก Function มันจะรันยาวจนจบ (Run-to-completion) หยุดกลางคันไม่ได้
แต่ **Generators** เปลี่ยนกฎนั้นครับ! มันคือฟังก์ชันพิเศษที่ **"หยุดทำงานชั่วคราว" (Pause)** ได้ และ **"กลับมาทำต่อ" (Resume)** ได้

> **💡 Analogy (เปรียบเทียบ):**
> - **Function ปกติ:** เหมือน **"การยิงปืน"** 🔫 พอกดไก (Call) กระสุนก็พุ่งออกไปทันที หยุดไม่ได้จนกว่าจะชนเป้า
> - **Generator:** เหมือน **"การกินซูชิสายพาน"** 🍣
>   1. คุณกิน 1 จาน (`yield`)
>   2. แล้วก็นั่งเล่นมือถือ (Pause)
>   3. พออยากกินอีก ก็หยิบจานต่อไป (Resume)
>   4. ทำไปเรื่อยๆ จนกว่าจะอิ่ม (`done: true`)

---

## 📚 MDN Reference
- [Iterators and Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
- [function*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
- [yield](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)

---

## 1. The Iterator Protocol (Protocol นักวนลูป) 📜

ก่อนจะไป Generator ต้องเข้าใจ **Iterator** ก่อน
Iterator คือ Object อะไรก็ได้ที่มี method `next()` ซึ่งคืนค่า object หน้าตาแบบนี้:
`{ value: ข้อมูล, done: จบหรือยัง? }`

```javascript
// สร้าง Iterator เองแบบ Manual (ไม่ต้องจำ! แค่ให้เข้าใจหลักการ)
function makeRangeIterator(start, end) {
    let nextIndex = start;
    return {
        next: function() {
            if (nextIndex <= end) {
                return { value: nextIndex++, done: false };
            }
            return { value: undefined, done: true };
        }
    };
}

const it = makeRangeIterator(1, 3);
console.log(it.next()); // { value: 1, done: false }
console.log(it.next()); // { value: 2, done: false }
console.log(it.next()); // { value: 3, done: false }
console.log(it.next()); // { value: undefined, done: true } (จบข่าว)
```

---

## 2. Generator Functions (`function*`) ⚡

การเขียน Iterator เองข้างบนมันยุ่งยาก JS เลยสร้าง **Generator** มาให้ใช้ง่ายๆ
 syntax คือ `function*` (มีดอกจัน) และใช้ `yield` เพื่อส่งค่าออกมา

```javascript
function* numberGen() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = numberGen(); // ได้ Generator Object (ยังไม่ทำงานนะ!)

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

### การทำงาน:
1. เรียก `numberGen()` มันจะยังไม่รันโค้ดข้างใน แต่คืนค่า **Generator Object** กลับมา
2. เรียก `gen.next()` ครั้งแรก → รันโค้ดจนเจอ `yield` ตัวแรก → ส่งค่า `1` ออกมา → **หยุดรอ (Pause)**
3. เรียก `gen.next()` ครั้งสอง → **ตื่น (Resume)** ทำต่อจากบรรทัดเดิม → เจอ `yield 2` → ส่งค่า `2` → หยุดรอ
4. ทำไปเรื่อยๆ จนจบฟังก์ชัน (หรือเจอ `return`) จะได้ `done: true`

---

## 3. ใช้กับ `for...of` ได้เลย! 🎁

เนื่องจาก Generator เป็น **Iterable** (ของที่วนลูปได้) เราเลยใช้ `for...of` หรือ Spread Operator (`...`) ได้เลย ไม่ต้องมานั่ง `next()` เอง

```javascript
function* colors() {
    yield "Red";
    yield "Green";
    yield "Blue";
}

// วิธี 1: for...of
for (const color of colors()) {
    console.log(color);
}
// Output: Red, Green, Blue

// วิธี 2: Spread
const colorArray = [...colors()]; 
console.log(colorArray); // ["Red", "Green", "Blue"]
```

---

## 4. Real-World Use Cases 🌍

### 4.1 Infinite IDs (ไอดีไม่มีวันหมด)
สร้าง ID รันไปเรื่อยๆ โดยไม่ต้องเปลือง Memory เก็บ Array ขนาดใหญ่ เพราะเรา "สร้างเมื่อใช้" (Lazy Evaluation)

```javascript
function* idGenerator() {
    let id = 1;
    while (true) { // Loop infinite ได้! เพราะมันหยุดรอที่ yield
        yield id++;
    }
}

const ids = idGenerator();

console.log(ids.next().value); // 1
console.log(ids.next().value); // 2
console.log(ids.next().value); // 3
// ... เรียกเมื่อไหร่ก็ได้เลขใหม่
```

### 4.2 Async Flow Control (ก่อนจะมี async/await)
ในอดีต (เช่น ยุค `co` library หรือ Redux-Saga) เราใช้ Generator จัดการ Async Code เพราะมัน "หยุดรอ" ผลลัพธ์ได้

```javascript
// (โค้ดนี้เป็น Concept)
function* fetchUserFlow() {
    const user = yield fetch('/api/user'); // หยุดรอตรงนี้
    const posts = yield fetch(`/api/posts/${user.id}`); // หยุดรอตรงนี้
    console.log(posts);
}
```
*ปัจจุบันเราใช้ `async/await` แทนท่านี้แล้ว แต่มันทำงานคล้ายกันมาก!*

---

## 5. Challenges 🏆

### 🎯 Challenge 1: The Fibonacci Generator
**โจทย์:** สร้าง Generator Function `fibonacci()` ที่คืนค่าลำดับ Fibonacci ไปเรื่อยๆ (1, 1, 2, 3, 5, 8, ...)
::: details ✨ ดูเฉลย
```javascript
function* fibonacci() {
    let [prev, curr] = [0, 1];
    while (true) {
        yield curr;
        [prev, curr] = [curr, prev + curr];
    }
}

const fib = fibonacci();
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
```
:::

### 🎯 Challenge 2: Range Generator
**โจทย์:** สร้าง `range(start, end, step)` ที่ทำงานเหมือน Python range
เช่น `range(1, 10, 2)` จะได้ 1, 3, 5, 7, 9
::: details ✨ ดูเฉลย
```javascript
function* range(start, end, step = 1) {
    for (let i = start; i <= end; i += step) {
        yield i;
    }
}

console.log([...range(1, 10, 2)]); // [1, 3, 5, 7, 9]
```
:::

### 🎯 Challenge 3: Deck of Cards
**โจทย์:** สร้าง Generator ที่แจกไพ่ 1 ใบจากสำรับ (random) และถ้าไพ่หมดให้บอกว่าหมดแล้ว
*(ไม่ต้องซีเรียสเรื่องสับไพ่ เอาแค่สุ่มจาก Array มา yield ก็พอ)*
::: details ✨ ดูเฉลย
```javascript
function* cardDealer(deck) {
    const cards = [...deck]; // Copy
    while (cards.length > 0) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        const card = cards.splice(randomIndex, 1)[0]; // หยิบออก
        yield card;
    }
}

const myDeck = ["A♠️", "K♥️", "Q♣️", "J♦️"];
const dealer = cardDealer(myDeck);

console.log(dealer.next().value); // (สุ่มไพ่ 1 ใบ)
```
:::

---

## 📖 Glossary (คำศัพท์เทคนิค)

| คำศัพท์ | ความหมาย |
|:-------|:---------|
| **Iterator** | Object ที่มี method `next()` ไว้ดึงข้อมูลทีละตัว |
| **Generator** | Function พิเศษ (`function*`) ที่สร้าง Iterator ได้ง่ายๆ และหยุดทำงานได้ (`yield`) |
| **Yield** | คำสั่ง "ส่งค่าออกไป" และ "หยุดทำงานชั่วคราว" |
| **Lazy Evaluation** | การประมวลผลเมื่อ "ถูกเรียกขอ" เท่านั้น (ไม่ทำรวดเดียว) ช่วยประหยัด Memory |
| **Iterable** | Object ที่เอาไปวนลูปได้ (Array, String, Map, Set, และ Generator) |

---

👉 **[ไปต่อ: Project 7 - Data Transformer](/javascript/07-project-data-transformer)**
