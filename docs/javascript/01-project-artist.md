# 🎨 Project 1: The Console Artist (ศิลปินน้อย)

> **"Creativity is intelligence having fun."**
> — *Albert Einstein*

ในโปรเจกต์นี้ คุณจะได้รับบทเป็น **"ศิลปินดิจิทัล"** ผู้สร้างสรรค์ผลงานศิลปะด้วยตัวอักษร (ASCII Art) โดยใช้เพียงแค่คำสั่ง `console.log` เท่านั้น

> **💡 Analogy (เปรียบเทียบ):** 
> การวาดรูปใน Console เหมือนการใช้ **"เครื่องพิมพ์ดีด"** (Typewriter) สมัยก่อนครับ เราไม่มีพู่กัน ไม่มีเมาส์ลากเส้น เรามีแค่การกดปุ่มตัวอักษรทีละตัวและปัดขึ้นบรรทัดใหม่ เพื่อประกอบกันเป็นภาพที่สวยงาม!

## 🎯 เป้าหมาย (Goal)
สร้างไฟล์ `artist.js` ที่เมื่อรันแล้ว จะแสดงรูปภาพสวยงามบนหน้าจอ Terminal

## 🛠️ เริ่มต้น (Setup)
1.  สร้างไฟล์ใหม่ชื่อ `artist.js`
2.  เตรียม Terminal ให้พร้อม

## Phase 1: Basic Shapes (รูปร่างพื้นฐาน)
ลองวาดรูปสี่เหลี่ยมง่ายๆ ก่อนครับ:

```javascript
console.log("-------");
console.log("|     |");
console.log("|     |");
console.log("-------");
```
*   **Task:** พิมพ์ตาม แล้วสั่งรัน `node artist.js` ดูผลลัพธ์

## Phase 2: The Face (ใบหน้า) 😐
ทีนี้ลองวาดหน้าคนดูบ้าง:

```javascript
console.log("  _____  ");
console.log(" /     \\ "); // สังเกตตรงนี้!
console.log("|  o o  |");
console.log("|   ^   |");
console.log("|  ___  |");
console.log(" \\_____/ "); // และตรงนี้!
```

> **🚨 Stop & Debug (จุดระวัง)**
> สังเกตบรรทัดที่ 2 (`/     \\`) ไหมครับ?
> ทำไมเราต้องพิมพ์ `\` (Backslash) ถึง 2 ตัว?
> *   เพราะ `\` เป็นตัวพิเศษ (Escape Character) ใน String
> *   ถ้าพิมพ์ตัวเดียว คอมพิวเตอร์จะงง เราเลยต้องพิมพ์ `\\` เพื่อบอกว่า "ฉันหมายถึงตัวอักษร \ นะ"

## Phase 3: Styled Console (ใส่สีสันให้ Console) 🌈

รู้หรือไม่ว่า `console.log` ใส่ **สี** ได้ด้วย! ใน Browser Console เราใช้ CSS ได้เลย:

```javascript
// 🎨 ใส่สีด้วย %c
console.log("%c Hello Console Artist!", "color: red; font-size: 24px;");

console.log(
    "%c JavaScript %c Zero to Hero",
    "color: white; background: #F0DB4F; padding: 4px 8px; font-weight: bold;",
    "color: white; background: #323330; padding: 4px 8px;"
);

// 🌈 หลายสีใน Log เดียว
console.log(
    "%cR%cA%cI%cN%cB%cO%cW",
    "color: red; font-size: 30px;",
    "color: orange; font-size: 30px;",
    "color: yellow; font-size: 30px;",
    "color: green; font-size: 30px;",
    "color: blue; font-size: 30px;",
    "color: indigo; font-size: 30px;",
    "color: violet; font-size: 30px;"
);
```

> 💡 **Tip:** เทคนิค `%c` ใช้ได้เฉพาะใน **Browser Console** (Chrome/Firefox) เท่านั้น ไม่ทำงานใน Node.js Terminal ครับ

## Phase 4: Template Literals (วาดแบบหลายบรรทัด) 📝

ถ้าต้อง `console.log` ทีละบรรทัดหลายๆ ที มันเหนื่อย! ใช้ **Template Literals** (backtick `` ` ``) วาดทีเดียวจบ:

```javascript
// ❌ แบบเดิม (เหนื่อย!)
console.log("  /\\_/\\  ");
console.log(" ( o.o ) ");
console.log("  > ^ <  ");

// ✅ Template Literal (สะดวก!)
console.log(`
  /\\_/\\
 ( o.o )
  > ^ <
 Meow~!
`);
```

> 💡 **เกร็ดเพิ่มเติม:** Template Literals จะเรียนลึกในบท 2 แต่ตอนนี้รู้แค่ว่า backtick `` ` `` สามารถเขียนหลายบรรทัดได้โดยไม่ต้อง `\n`



## Challenges 🏆

ทดสอบทักษะการวาดรูปจาก Phase ต่างๆ ที่เรียนมาในบทนี้:

### 🎯 Challenge 1: Be Creative!
**หัวข้อ:** Phase 1-2: Basic Shapes & The Face

**โจทย์:** จงวาดรูปอะไรก็ได้ที่คุณชอบ 1 รูป ลงในไฟล์ `my-art.js`
*   **Ideas:** ต้นคริสต์มาส 🎄, แมว 🐱, บ้าน 🏠, หรือชื่อเล่นตัวเอง
*   **Rule:** ต้องมีอย่างน้อย 5 บรรทัด

::: details ✨ ดูเฉลย
```javascript
console.log("    *    ");
console.log("   ***   ");
console.log("  *****  ");
console.log(" ******* ");
console.log("    |    ");
```
:::

### 🎯 Challenge 2: Styled Name Card
**หัวข้อ:** Phase 3: Styled Console

**โจทย์:** ลองใช้ `%c` สร้าง "นามบัตร" สวยๆ ใน Browser Console ที่มีชื่อคุณ + สีพื้นหลัง + font ใหญ่

::: details ✨ ดูเฉลย
```javascript
console.log(
    "%c 🎓 Dolar — JavaScript Student ",
    "color: white; background: #2196F3; font-size: 18px; padding: 8px 16px; border-radius: 4px;"
);
```
:::

### 🎯 Challenge 3: Template Art
**หัวข้อ:** Phase 4: Template Literals

**โจทย์:** ใช้ Template Literals (backtick) วาดรูป **บ้าน** ให้มีหลังคา กำแพง ประตู และหน้าต่าง ใน `console.log` เดียว

::: details ✨ ดูเฉลย
```javascript
console.log(`
    /\\
   /  \\
  /    \\
 /______\\
 |  __  |
 | |  | |
 | |__| |
 |______|
`);
```
:::



> **🏆 ความสำเร็จในบทนี้ (Success Criteria):**
> 1. [ ] สามารถสร้างไฟล์ `.js` และรันด้วย `node` ได้สำเร็จ
> 2. [ ] เข้าใจการใช้ `console.log` เพื่อแสดงผลข้อมูล
> 3. [ ] รู้วิธีการใช้ `\\` (Escape Character) เพื่อแสดงผลตัวอักษรพิเศษ
> 4. [ ] สามารถออกแบบและวาดรูปของตัวเองได้อย่างน้อย 5 บรรทัด


👉 **[ไปต่อ: Project 2 - My Biography](/javascript/01-project-bio)**
