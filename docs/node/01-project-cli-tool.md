# 🎯 Project: CLI Tool App (เครื่องมือ Command Line ตัวแรก!)

> สร้าง CLI Tool ที่ทำงานใน Terminal — ใช้ความรู้จาก Module 1 ทั้งหมด!


## 🎯 เป้าหมาย

สร้าง **"QuickCalc"** — เครื่องคิดเลขง่ายๆ ที่ใช้ใน Terminal:

```bash
node calc.js add 10 5      # → 10 + 5 = 15
node calc.js subtract 20 8 # → 20 - 8 = 12
node calc.js multiply 3 7  # → 3 × 7 = 21
node calc.js divide 100 4  # → 100 ÷ 4 = 25
node calc.js help           # → แสดงวิธีใช้
```


## 📋 ข้อกำหนด (Requirements)

| # | Feature | รายละเอียด |
|:-:|:--------|:----------|
| 1 | **รับ Arguments** | ใช้ `process.argv` รับ operation และตัวเลข |
| 2 | **4 Operations** | add, subtract, multiply, divide |
| 3 | **Error Handling** | แสดง Error ถ้า Input ไม่ถูก (ไม่ใช่ตัวเลข, หารด้วย 0) |
| 4 | **Help** | `node calc.js help` แสดงวิธีใช้ |
| 5 | **สีสวย (Bonus)** | ใช้ ANSI Colors ทำให้ Output มีสี |


## 🪜 Step-by-Step Guide

### Step 1: สร้างโปรเจกต์

```bash
mkdir quickcalc
cd quickcalc
npm init -y
```

### Step 2: เข้าใจ process.argv

```javascript
// test-argv.js — ลองรันดูก่อน!
console.log(process.argv);
```

```bash
node test-argv.js add 10 5
# Output:
# [
#   'C:\\Program Files\\nodejs\\node.exe',  ← argv[0] = path ของ node
#   'C:\\projects\\test-argv.js',           ← argv[1] = path ของไฟล์
#   'add',                                  ← argv[2] = operation ✅
#   '10',                                   ← argv[3] = num1 ✅
#   '5'                                     ← argv[4] = num2 ✅
# ]
```

> 💡 **สังเกต:** `argv[2]` เป็น String เสมอ! ต้องแปลงเป็น Number ด้วย `Number()` หรือ `parseFloat()`

### Step 3: สร้าง Calculator

สร้างไฟล์ `calc.js`:

```javascript
// calc.js — QuickCalc CLI Tool

// ==========================================
// 1. รับ Arguments
// ==========================================
const operation = process.argv[2];
const num1 = parseFloat(process.argv[3]);
const num2 = parseFloat(process.argv[4]);

// ==========================================
// 2. Help Message
// ==========================================
function showHelp() {
    console.log(`
📟 QuickCalc — เครื่องคิดเลัข CLI

Usage: node calc.js <operation> <num1> <num2>

Operations:
  add        บวก
  subtract   ลบ
  multiply   คูณ
  divide     หาร

Examples:
  node calc.js add 10 5
  node calc.js divide 100 4
  node calc.js help
    `);
}

// ==========================================
// 3. ตรวจสอบ Input
// ==========================================
if (!operation || operation === "help") {
    showHelp();
    process.exit(0);
}

if (isNaN(num1) || isNaN(num2)) {
    console.error("❌ Error: กรุณาใส่ตัวเลข 2 ตัว!");
    console.error("   ตัวอย่าง: node calc.js add 10 5");
    process.exit(1); // Exit Code 1 = Error
}

// ==========================================
// 4. คำนวณ
// ==========================================
let result;
let symbol;

switch (operation) {
    case "add":
        result = num1 + num2;
        symbol = "+";
        break;
    case "subtract":
        result = num1 - num2;
        symbol = "-";
        break;
    case "multiply":
        result = num1 * num2;
        symbol = "×";
        break;
    case "divide":
        if (num2 === 0) {
            console.error("❌ Error: หารด้วย 0 ไม่ได้!");
            process.exit(1);
        }
        result = num1 / num2;
        symbol = "÷";
        break;
    default:
        console.error(`❌ Error: ไม่รู้จัก operation "${operation}"`);
        console.error("   ลอง: add, subtract, multiply, divide");
        process.exit(1);
}

// ==========================================
// 5. แสดงผล
// ==========================================
console.log(`✅ ${num1} ${symbol} ${num2} = ${result}`);
```

### Step 4: ทดสอบ

```bash
node calc.js add 10 5        # ✅ 10 + 5 = 15
node calc.js subtract 20 8   # ✅ 20 - 8 = 12
node calc.js multiply 3 7    # ✅ 3 × 7 = 21
node calc.js divide 100 4    # ✅ 100 ÷ 4 = 25
node calc.js divide 10 0     # ❌ Error: หารด้วย 0 ไม่ได้!
node calc.js add hello 5     # ❌ Error: กรุณาใส่ตัวเลข 2 ตัว!
node calc.js modulo 10 3     # ❌ Error: ไม่รู้จัก operation "modulo"
node calc.js help            # 📟 แสดงวิธีใช้
```

### Step 5: เพิ่ม npm Script

ใน `package.json`:

```json
{
    "scripts": {
        "calc": "node calc.js"
    }
}
```

> ⚠️ แต่ `npm run calc add 10 5` จะไม่ส่ง arguments ไป! ต้องใช้ `--`:
> ```bash
> npm run calc -- add 10 5
> ```


## 🌟 Bonus: เพิ่มสีสัน (ANSI Colors)

ไม่ต้องติดตั้ง Package! ใช้ ANSI Escape Codes ได้เลย:

```javascript
// colors.js — Helper สำหรับสี
const colors = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

// ใช้แทน console.log ปกติ:
console.log(colors.green(`✅ ${num1} ${symbol} ${num2} = ${result}`));
console.error(colors.red("❌ Error: ..."));
```


## 📊 สิ่งที่เรียนรู้จากโปรเจกต์นี้

| Concept | ใช้ตรงไหน |
|:--------|:---------|
| `process.argv` | รับ Arguments จาก Command Line |
| `process.exit()` | ปิดโปรแกรม (Exit Code 0 = OK, 1 = Error) |
| `parseFloat()` | แปลง String → Number |
| `isNaN()` | เช็คว่าเป็นตัวเลขหรือไม่ |
| `switch/case` | เลือก Operation ตาม Input |
| `npm init -y` | สร้าง package.json |
| `npm scripts` | ตั้งคำสั่งสำเร็จรูป |


## 🏆 Extra Challenges (ถ้าอยากท้าทาย!)

1. **เพิ่ม Operations:** `power` (ยกกำลัง), `modulo` (เศษ), `sqrt` (รากที่ 2)
2. **History:** บันทึกประวัติการคำนวณลงไฟล์ `history.txt`
3. **Interactive Mode:** ถ้าไม่ใส่ Arguments → เข้าสู่โหมด Interactive ถามคำถาม

👉 **[ไปต่อ: Module 2 — Modules System](/node/02-01-commonjs-esm)** *(Coming Soon)*
