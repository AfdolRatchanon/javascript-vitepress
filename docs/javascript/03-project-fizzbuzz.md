# 🐝 Project: The FizzBuzz Challenge (โจทย์สัมภาษณ์ในตำนาน)

> **"Programming isn't about what you know; it's about what you can figure out."**
> — *Chris Pine*

ยินดีต้อนรับสู่โจทย์คัดคนเข้าทำงานระดับโลก! (Google และ Microsoft ก็เคยใช้ข้อนี้) โจทย์ดูง่าย แต่มีกับดักซ่อนอยู่ครับลองทำดู!

> **💡 Analogy (เปรียบเทียบ):** 
> โจทย์นี้เหมือนการทำ **"เครื่องคัดแยกผลไม้"** ครับ สายพานลำเลียงผลไม้ (Loop) ส่งตัวเลขมาให้คุณทีละตัว คุณต้องสร้างตะแกรงร่อน (Conditions) เพื่อแยกประเภทผลไม้ (Fizz, Buzz, FizzBuzz) ให้ถูกต้องตามกฎที่กำหนดไว้!

## 🎯 เป้าหมาย (Goal)
เขียนโปรแกรมวนลูป (Loop) ตั้งแต่เลข **1 ถึง 100**
*   ถ้าหารด้วย 3 ลงตัว ให้พิมพ์คำว่า **"Fizz"**
*   ถ้าหารด้วย 5 ลงตัว ให้พิมพ์คำว่า **"Buzz"**
*   ถ้าหารด้วย 3 และ 5 ลงตัว (เช่น 15) ให้พิมพ์คำว่า **"FizzBuzz"**
*   นอกนั้นให้พิมพ์ **ตัวเลข (i)** ตามปกติ

**ตัวอย่างผลลัพธ์ (Expected Output):**
```
1
2
Fizz
4
Buzz
Fizz
...
14
FizzBuzz
16
```

## 🛠️ เริ่มลงมือ (Requirements)
สร้างไฟล์ `fizzbuzz.js` แล้วลุยเลย!

### 💡 Hint (ใบ้แล้วนะ)
*   **ลำดับสำคัญมาก!** ลองนึกดูว่าควรเช็คเงื่อนไขไหนก่อน?
    *   เช็ค `3` ก่อน?
    *   เช็ค `5` ก่อน?
    *   หรือเช็ค `3 และ 5` พร้อมกันก่อน?
*   ใช้เครื่องหมาย `%` (Modulo) เพื่อหาเศษเหลือ
    *   `i % 3 === 0` แปลว่าหาร 3 ลงตัว

::: details ✨ ดูเฉลย (Solution)
```javascript
// วนลูป 1 ถึง 100
for (let i = 1; i <= 100; i++) {

    // 1. เช็ค condition ที่ "ยากที่สุด" ก่อน (3 และ 5)
    if (i % 3 === 0 && i % 5 === 0) {
        console.log("FizzBuzz");
    }
    // 2. ถ้าไม่ใช่, เช็ค 3
    else if (i % 3 === 0) {
        console.log("Fizz");
    }
    // 3. ถ้าไม่ใช่, เช็ค 5
    else if (i % 5 === 0) {
        console.log("Buzz");
    }
    // 4. ถ้าไม่เข้าเงื่อนไขใดเลย ให้พิมพ์เลข
    else {
        console.log(i);
    }
}
```

> **Why check `both` first?**
> ถ้าเราเช็ค `% 3` ก่อน, เลข 15 จะโดนจับว่าเป็น "Fizz" แล้วจบเลย (เพราะ `else if` จะไม่ทำงานต่อ)
> ดังนั้นต้องดักเงื่อนไขที่เฉพาะเจาะจงที่สุดไว้บนสุดเสมอ!
:::

## ⚠️ Common Mistake: ลำดับเงื่อนไข

นี่คือตัวอย่าง **โค้ดที่ผิด** ที่มือใหม่ทำบ่อยมาก:

```javascript
// ❌ ผิด! เช็ค % 3 ก่อน
for (let i = 1; i <= 100; i++) {
    if (i % 3 === 0) {
        console.log("Fizz");       // เลข 15 จะมาติดที่นี่!
    } else if (i % 5 === 0) {
        console.log("Buzz");
    } else if (i % 3 === 0 && i % 5 === 0) {
        console.log("FizzBuzz");   // ❌ ไม่มีทางมาถึงบรรทัดนี้!
    } else {
        console.log(i);
    }
}
// เลข 15: หาร 3 ลงตัว → พิมพ์ "Fizz" แล้วจบ ไม่เคยเจอ "FizzBuzz" เลย!
```

> 💡 **กฎทอง:** เรียง `if/else if` จาก **เงื่อนไขเฉพาะเจาะจงที่สุด → กว้างที่สุด** เสมอ!



## Challenges 🏆

ทดสอบทักษะที่ได้เรียนมาใน Module 3 ผ่านโปรเจกต์ FizzBuzz:

### 🎯 Challenge 1: FizzBuzz แบบไม่ใช้ `else if`
**หัวข้อ:** Control Flow & Loop

**โจทย์:** ลองเขียน FizzBuzz โดยใช้วิธี **สร้าง String ทีละส่วน** แทน `if/else if`:

*   **Hint:** สร้างตัวแปร `output = ""` → ถ้าหาร 3 ลงตัวให้ `output += "Fizz"` → ถ้าหาร 5 ลงตัวให้ `output += "Buzz"`

::: details ✨ ดูเฉลย
```javascript
for (let i = 1; i <= 100; i++) {
    let output = "";
    if (i % 3 === 0) output += "Fizz";
    if (i % 5 === 0) output += "Buzz";
    console.log(output || i);  // ถ้า output ว่าง ("") จะพิมพ์ตัวเลขแทน
}
```
> วิธีนี้เจ๋งตรงที่ **ไม่ต้องเช็ค `% 15` แยก** เลย! เพราะถ้าหาร 3 และ 5 ลงตัว output จะเป็น "Fizz" + "Buzz" = "FizzBuzz" อัตโนมัติ
:::

### 🎯 Challenge 2: Custom FizzBuzz
**หัวข้อ:** Functions & Parameters

**โจทย์:** แก้โจทย์ให้รับ **ตัวเลข 2 ตัว** และ **คำ 2 คำ** แทนที่จะฝัง 3/5/Fizz/Buzz ตายตัว:

```javascript
// ตัวอย่าง: ใช้ 4 กับ 7 แทน 3 กับ 5
customFizzBuzz(1, 30, 4, "Foo", 7, "Bar");
// Output: 1, 2, 3, Foo, 5, 6, Bar, Foo, 9, ...
```

::: details ✨ ดูเฉลย
```javascript
function customFizzBuzz(start, end, num1, word1, num2, word2) {
    for (let i = start; i <= end; i++) {
        let output = "";
        if (i % num1 === 0) output += word1;
        if (i % num2 === 0) output += word2;
        console.log(output || i);
    }
}

customFizzBuzz(1, 30, 4, "Foo", 7, "Bar");
```
:::

### 🎯 Challenge 3: FizzBuzz Summary
**หัวข้อ:** Loop & Counter Variables

**โจทย์:** หลังจากวนลูปเสร็จ ให้แสดงสรุป: มี Fizz กี่ครั้ง, Buzz กี่ครั้ง, FizzBuzz กี่ครั้ง

::: details ✨ ดูเฉลย
```javascript
let fizzCount = 0, buzzCount = 0, fizzBuzzCount = 0;

for (let i = 1; i <= 100; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
        fizzBuzzCount++;
    } else if (i % 3 === 0) {
        fizzCount++;
    } else if (i % 5 === 0) {
        buzzCount++;
    }
}

console.log("--- Summary ---");
console.log("Fizz: " + fizzCount);       // 27
console.log("Buzz: " + buzzCount);       // 14
console.log("FizzBuzz: " + fizzBuzzCount); // 6
```
:::



> **🏆 ความสำเร็จในบทนี้ (Success Criteria):**
> 1. [ ] สามารถเขียน `for` loop เพื่อวนรอบข้อมูลตามจำนวนที่กำหนดได้
> 2. [ ] ใช้ Operator `%` (Modulo) เพื่อตรวจสอบการหารลงตัวได้แม่นยำ
> 3. [ ] เข้าใจความสำคัญของ "ลำดับเงื่อนไข" (Order of Conditions)
> 4. [ ] สามารถใช้ `if / else if / else` เพื่อแยกแยะกรณีต่างๆ ได้ครบถ้วน


👉 **[จบ Module 3: พักผ่อนก่อนขึ้น Module 4](/javascript/index)**
