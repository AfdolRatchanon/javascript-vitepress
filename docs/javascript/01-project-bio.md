# 📜 Project 2: My Biography (ประวัติของฉัน)

> **"Identity is a prison you can never escape, but the way to redeem your past is not to run from it, but to try to understand it, and use it as a foundation to grow."**
> — *Jay-Z*

ในโปรเจกต์ที่สองนี้ เราจะมาสร้าง "นามบัตรดิจิทัล" (Digital Bio Card) ที่บอกเล่าเรื่องราวของคุณกันครับ

> **💡 Analogy (เปรียบเทียบ):** 
> โปรเจกต์นี้เหมือนการทำ **"สมุดพก"** (Journal) ครับ เราต้องวางโครงสร้างให้ดีว่าจะใส่ข้อมูลอะไรไว้ตรงไหน มีเส้นขีดคั่นหัวข้อ และจดบันทึก (Comments) ไว้เผื่อเรากลับมาอ่านเองในอนาคต!

## 🎯 เป้าหมาย (Goal)
สร้างไฟล์ `bio.js` ที่แสดงข้อมูลส่วนตัวของคุณออกมาในรูปแบบที่สวยงาม มีหัวข้อ มีเส้นแบ่ง และอ่านง่าย

## 📝 1. วางแผน (Planning)
ก่อนเขียนโค้ด เราควรวางแผนก่อนว่าจะให้หน้าตาออกมาเป็นยังไง ลองวาดในกระดาษ หรือพิมพ์ใส่ Notepad ดูก่อนครับ

**ตัวอย่างแผน (Blueprint):**
```
-------------------------
      MY BIOGRAPHY
-------------------------
Name:  [Your Name]
Age:   [Your Age]
From:  [Your City]
-------------------------
         Skills
-------------------------
- Coding
- Gaming
-------------------------
```

## 🛠️ 2. ลงมือโค้ด (Coding)
สร้างไฟล์ `bio.js` แล้วเริ่มพิมพ์โค้ดตามแผนที่วางไว้

> **💡 Tips:**
> *   ใช้ `console.log("----------------");` เพื่อสร้างเส้นแบ่ง
> *   ใช้ **Spacebar** เพื่อจัดกึ่งกลางข้อความ (Center Align)
> *   ใส่ **Comments** (`// Header Section`, `// Content Section`) เพื่อให้อ่านง่าย

```javascript
// Header Section
console.log("*****************************");
console.log("*                           *");
console.log("*      MY BIOGRAPHY         *");
console.log("*                           *");
console.log("*****************************");

// Personal Info
console.log("Name:  Dolar");
console.log("Age:   25");
console.log("Role:  Frontend Developer");

// Footer
console.log("*****************************");
```

## 📖 3. Escape Characters ที่ต้องรู้

ตอนสร้าง Bio คุณอาจอยากใส่ตัวอักษรพิเศษ เช่น Tab หรือเครื่องหมายคำพูด:

```javascript
// \n = ขึ้นบรรทัดใหม่
console.log("Name: Dolar\nAge: 25\nCity: Bangkok");
// Output:
// Name: Dolar
// Age: 25
// City: Bangkok

// \t = Tab (เว้นวรรคยาว)
console.log("Name:\tDolar");
console.log("Age:\t25");
console.log("City:\tBangkok");
// Output (จัดเป็นตารางสวยๆ):
// Name:   Dolar
// Age:    25
// City:   Bangkok

// \" = เครื่องหมายคำพูดใน String
console.log("Nickname: \"Dolar\"");
// Output: Nickname: "Dolar"

// \\ = Backslash ตัวเดียว
console.log("Path: C:\\Users\\Dolar");
// Output: Path: C:\Users\Dolar
```

### 📊 Escape Characters Quick Reference

| Escape | ผลลัพธ์ | ใช้เมื่อ |
|:-------|:--------|:--------|
| `\n` | ขึ้นบรรทัดใหม่ | แยกข้อมูลหลายบรรทัดใน log เดียว |
| `\t` | Tab | จัดข้อความให้ตรงกัน |
| `\"` | `"` | ใส่ " ใน String ที่ใช้ " ครอบ |
| `\\` | `\` | แสดง Backslash |

## 🔨 4. Upgrade: ใช้ Template Literals

ลองอัปเกรด Bio ด้วย **Template Literals** (backtick `` ` ``) ที่สามารถเขียนหลายบรรทัดได้ในที่เดียว:

```javascript
// ❌ แบบเดิม (ต้อง console.log ทุกบรรทัด)
console.log("*****************************");
console.log("*      MY BIOGRAPHY         *");
console.log("*****************************");

// ✅ Template Literal (เขียนทีเดียวจบ!)
console.log(`
╔═══════════════════════════╗
║       MY BIOGRAPHY        ║
╠═══════════════════════════╣
║ Name:  Dolar              ║
║ Age:   25                 ║
║ Role:  Frontend Developer ║
╠═══════════════════════════╣
║ Skills:                   ║
║ - JavaScript  ████░ 80%   ║
║ - HTML/CSS    █████ 100%  ║
║ - Gaming      █████ 100%  ║
╚═══════════════════════════╝
`);
```

> 💡 **Tip:** ตัวอักษรกรอบ ╔ ╗ ╚ ╝ ═ ║ เรียกว่า **Box Drawing Characters** — ใน Windows กด `Alt` + ตัวเลขบน Numpad หรือ copy จาก Google ได้เลย!

---

## 🏆 Challenges

### 🎯 Challenge 1: Improve It!
ปรับปรุง Bio ให้สวยขึ้น:
1.  เพิ่มหัวข้อ **"Favorite Foods"**
2.  ลองใช้สัญลักษณ์แปลกๆ เช่น `=`, `#`, `~` แทน `*` หรือ `-`
3.  ลองจัดย่อหน้าให้ตรงกันเป๊ะๆ (Alignment)

::: details ✨ ดูเฉลย
```javascript
console.log("=============================");
console.log("       MY BIOGRAPHY          ");
console.log("=============================");
console.log("Name:  Dolar");
console.log("Age:   25");
console.log("From:  Bangkok, Thailand");
console.log("-----------------------------");
console.log("Skills:");
console.log("- JavaScript  [#####]");
console.log("- Eating      [#####+]");
console.log("=============================");
```
:::

### 🎯 Challenge 2: Tab Master
ใช้ `\t` จัดข้อมูลเพื่อน 3 คนให้เป็นตารางสวยๆ (ชื่อ, อายุ, เมือง)

::: details ✨ ดูเฉลย
```javascript
console.log("Name\tAge\tCity");
console.log("----\t---\t------");
console.log("Dolar\t25\tBangkok");
console.log("Somchai\t30\tChiang Mai");
console.log("Malee\t22\tPhuket");
```
:::

### 🎯 Challenge 3: Ultimate Bio Card
ใช้ Template Literal สร้าง Bio Card ที่มีทั้ง Header, ข้อมูลส่วนตัว, Skills พร้อม Progress Bar, และ Footer ใน `console.log` เดียว

::: details ✨ ดูเฉลย
```javascript
console.log(`
┌─────────────────────────┐
│    ⭐ MY BIO CARD ⭐     │
├─────────────────────────┤
│ Name:  [Your Name]      │
│ Age:   [Your Age]       │
│ Hobby: [Your Hobby]     │
├─────────────────────────┤
│ Skills:                 │
│ JS   ████░░ 60%         │
│ CSS  ██████ 100%        │
├─────────────────────────┤
│ "Keep learning!"        │
└─────────────────────────┘
`);
```
:::

---

> **🏆 ความสำเร็จในบทนี้ (Success Criteria):**
> 1. [ ] สามารถวางแผนโครงสร้าง (Blueprint) ก่อนเริ่มเขียนโค้ดได้
> 2. [ ] ใช้ `console.log` ในการสร้าง UI จำลอง (เส้นแบ่ง, ขอบตาราง) ได้
> 3. [ ] มีการใช้ **Comments** เพื่ออธิบายส่วนต่างๆ ของโค้ด
> 4. [ ] ข้อมูลแสดงผลออกมาเป็นระเบียบ อ่านง่าย และมีความคิดสร้างสรรค์

---
👉 **[จบ Module 1: ไปต่อที่ Variables & Data Types](/02-01-variables)**
