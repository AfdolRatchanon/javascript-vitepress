# ⚖️ Project: BMI Calculator (เครื่องคำนวณดัชนีมวลกาย)

> **"What gets measured gets managed."**
> — *Peter Drucker*

ยินดีต้อนรับสู่โปรเจกต์ประจำบทครับ! ในบทนี้เราจะเอาความรู้เรื่อง **Variables**, **Data Types** และ **Operators** มาใช้แก้ปัญหาชีวิตจริงกัน

> **💡 Analogy (เปรียบเทียบ):** 
> การเขียนโปรแกรมคำนวณ เหมือนการสร้าง **"เครื่องชั่งเซนเซอร์"** ครับ เครื่องนี้จะรับค่าดิบ (Raw Data) เช่น น้ำหนักและส่วนสูง จากนั้นจะส่งเข้าห้องเครื่องเพื่อประมวลผลตามสูตรทางคณิตศาสตร์ และแสดงผลลัพธ์ที่แปลงร่างแล้วออกมาให้เราดู!

## 🎯 เป้าหมาย (Goal)
เขียนโปรแกรมคำนวณค่า **BMI (Body Mass Index)** ซึ่งเป็นสูตรพื้นฐานที่ใช้ประเมินภาวะอ้วน/ผอม

**สูตร (Formula):**
$$ BMI = \frac{weight (kg)}{height (m)^2} $$

> **Note:** สังเกตว่าส่วนสูงต้องเป็นหน่วย **เมตร (m)** นะครับ แต่คนไทยมักบอกส่วนสูงเป็น **เซนติเมตร (cm)** เราต้องแปลงหน่วยด้วย!

> 💡 **เกร็ดน่ารู้:** BMI ถูกคิดค้นโดย **Adolphe Quetelet** นักคณิตศาสตร์ชาวเบลเยียมในปี 1832 และยังคงใช้กันทั่วโลกมาจนถึงวันนี้!

## 🛠️ โจทย์ (Requirements)
สร้างไฟล์ `bmi.js` และทำตามขั้นตอนดังนี้:
1.  ประกาศตัวแปร `weight` (น้ำหนัก kg)
2.  ประกาศตัวแปร `height` (ส่วนสูง cm)
3.  ประกาศตัวแปร `bmi` เพื่อเก็บผลลัพธ์จากการคำนวณ
4.  แสดงผลลัพธ์ออกมาในรูปแบบ: `"คุณมีค่า BMI เท่ากับ: [ค่า BMI]"`

## 💡 Hints (ใบ้)
*   **การแปลง cm -> m:** เอาค่า cm หารด้วย 100
*   **การยกกำลังสอง:** ใช้ `*` คูณกันเอง 2 ครั้ง หรือ `Math.pow()`

**Expected Output (ตัวอย่างผลลัพธ์):**
```
Weight: 70 kg
Height: 175 cm
-----------------
BMI: 22.857...
```

## 🏆 Challenges

### 🎯 Challenge 1: Formatting
ตอนนี้เลขทศนิยมมันยาวเหยียด (เช่น `22.857142...`) ลองหาวิธีทำให้เหลือแค่ **2 ตำแหน่ง** ดูสิ!
*   **Hint:** ลองค้นหาคำว่า "javascript number to fixed" ใน Google ดูครับ

::: details ✨ ดูเฉลย
```javascript
const formattedBMI = bmi.toFixed(2);
console.log("BMI: " + formattedBMI); // "BMI: 22.86"
```
:::

### 🎯 Challenge 2: BMI Category
เพิ่มระบบ **แปลผล BMI** ให้บอกว่าอยู่ในระดับไหน:

| ค่า BMI | ระดับ |
|:--------|:------|
| < 18.5 | น้ำหนักน้อยเกินไป (Underweight) |
| 18.5 - 24.9 | ปกติ (Normal) |
| 25.0 - 29.9 | น้ำหนักเกิน (Overweight) |
| ≥ 30.0 | อ้วน (Obese) |

*   **Hint:** ยังไม่ต้องใช้ `if/else` (เรียนใน Module 3) ลองใช้ **Ternary Operator** `? :` ที่เรียนมาแล้วในบท Operators!

::: details ✨ ดูเฉลย
```javascript
const bmi = weight / (heightM * heightM);
const formattedBMI = bmi.toFixed(2);

// ใช้ Ternary ซ้อนกัน (Nested Ternary)
const category =
    bmi < 18.5 ? "น้ำหนักน้อย (Underweight)" :
    bmi < 25   ? "ปกติ (Normal) ✅" :
    bmi < 30   ? "น้ำหนักเกิน (Overweight) ⚠️" :
                  "อ้วน (Obese) 🔴";

console.log("BMI: " + formattedBMI);
console.log("ระดับ: " + category);
```
:::

### 🎯 Challenge 3: Beautiful Output
ใช้ Template Literal สร้างผลลัพธ์สวยๆ แบบนี้:

```
╔══════════════════════════╗
║    ⚖️ BMI Calculator     ║
╠══════════════════════════╣
║ น้ำหนัก:    70 kg        ║
║ ส่วนสูง:    175 cm       ║
║ BMI:        22.86        ║
║ ระดับ:      ปกติ ✅       ║
╚══════════════════════════╝
```

::: details ✨ ดูเฉลย
```javascript
const weight = 70;
const heightCm = 175;
const heightM = heightCm / 100;
const bmi = (weight / (heightM * heightM)).toFixed(2);

console.log(`
╔══════════════════════════╗
║    ⚖️ BMI Calculator     ║
╠══════════════════════════╣
║ น้ำหนัก:    ${weight} kg        ║
║ ส่วนสูง:    ${heightCm} cm       ║
║ BMI:        ${bmi}        ║
╚══════════════════════════╝
`);
```
:::

---

::: details 🔑 ดูเฉลยฉบับเต็ม (Full Solution)
```javascript
// 1. Define Variables
const weight = 70; // kg
const heightCm = 175; // cm

// 2. Convert Height (cm -> m)
const heightM = heightCm / 100; // 1.75

// 3. Calculate BMI
// สูตร: น้ำหนัก / (ส่วนสูง * ส่วนสูง)
const bmi = weight / (heightM * heightM);

// 4. Formatting
const formattedBMI = bmi.toFixed(2);

// 5. Output
console.log("Weight: " + weight + " kg");
console.log("Height: " + heightCm + " cm");
console.log("-----------------");
console.log("BMI: " + formattedBMI);
```
:::

---

> **🏆 ความสำเร็จในบทนี้ (Success Criteria):**
> 1. [ ] เลือกใช้ `const` และ `let` ได้ถูกต้องตามความเหมาะสม
> 2. [ ] สามารถคำนวณเลขนัยสำคัญด้วย Arithmetic Operators (`/`, `*`) ได้
> 3. [ ] เข้าใจกระบวนการแปลงหน่วยข้อมูล (Unit Conversion) ในโค้ด
> 4. [ ] สามารถใช้ `.toFixed()` เพื่อจัดการทศนิยมให้สวยงาม

---
👉 **[จบ Module 2: พร้อมแล้วไปต่อที่ Control Flow](/03-01-conditionals)**
