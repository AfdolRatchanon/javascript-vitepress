# 🎯 Project: File Manager CLI (โปรแกรมจัดการไฟล์ขั้นเทพ) 🖥️

> เลื่อนขั้นจาก "ผู้ใช้" เป็น "ผู้สร้าง"! มาสร้าง Windows Explorer ของตัวเองผ่าน Terminal กันเถอะ

---

## 🎯 เป้าหมาย

สร้าง CLI Tool ชื่อ **"FileManager"** ที่สั่งการได้ครบวงจร ไม่ใช่แค่อ่านเขียน แต่ต้อง **ย้าย (Move)**, **เปลี่ยนชื่อ (Rename)**, **สร้างโฟลเดอร์ (Mkdir)** และ **เช็คข้อมูลไฟล์ (Info)** ได้!

ตัวอย่างการใช้งาน:
```bash
node manager.js info message.txt
node manager.js copy old.txt new.txt
node manager.js mkdir user/docs
```

---

## 📋 ข้อกำหนด (Requirements)

ต้องรองรับคำสั่งต่อไปนี้ (ใช้ `fs/promises` ห้ามใช้ Sync!):

| # | Feature | คำสั่ง (Command) | รายละเอียด |
|:-:|:---|:---|:---|
| 1 | **Create File** | `write <file> <content>` | สร้างไฟล์ใหม่พร้อมเนื้อหา |
| 2 | **Read File** | `read <file>` | อ่านไฟล์และแสดงเนื้อหา |
| 3 | **Delete** | `delete <file>` | ลบไฟล์ (Handle Error หากไม่มีไฟล์) |
| 4 | **Rename/Move** | `rename <old> <new>` | เปลี่ยนชื่อไฟล์ หรือย้ายที่อยู่ |
| 5 | **Copy File** | `copy <src> <dest>` | ทำสำเนาไฟล์ |
| 6 | **Make Dir** | `mkdir <folder>` | สร้างโฟลเดอร์ (รองรับ recursive เช่น `a/b`) |
| 7 | **Delete Dir** | `rmdir <folder>` | ลบโฟลเดอร์ (ลบ recursive) |
| 8 | **File Info** | `info <file>` | แสดงขนาด (Size) และวันที่สร้าง (Created) |
| 9 | **List Files** | `list <folder>` | แสดงไฟล์ทั้งหมดในโฟลเดอร์ |
| 10 | **Help** | `help` | แสดงคู่มือการใช้งาน |

---

## 🪜 Step-by-Step Guide

### Step 1: โครงสร้างหลัก (Main Switch)

```javascript
// manager.js
const fs = require("fs").promises;
const path = require("path");

const command = process.argv[2]; 
const arg1 = process.argv[3];    
const arg2 = process.argv[4];    

async function main() {
    try {
        switch (command) {
            case "write":  await writeFile(arg1, arg2); break;
            case "read":   await readFile(arg1); break;
            case "delete": await deleteFile(arg1); break;
            case "rename": await renameFile(arg1, arg2); break;
            // ... เพิ่ม case อื่นๆ
            case "help":
            default:       showHelp();
        }
    } catch (err) {
        console.error("❌ Operation failed:", err.message);
    }
}
main();
```

### Step 2: จัดการไฟล์พื้นฐาน (Read/Write/Delete)

(จากบทเรียนเก่า แต่อัพเกรดให้ดีขึ้น)

```javascript
async function writeFile(file, content) {
    await fs.writeFile(file, content || "");
    console.log(`✅ เขียนไฟล์ '${file}' สำเร็จ!`);
}

async function readFile(file) {
    const data = await fs.readFile(file, "utf-8");
    console.log("📖 Content:\n", data);
}
```

### Step 3: จัดการขั้นสูง (Rename / Copy / Mkdir) 🔥

ใช้ฟังก์ชันใหม่ที่เพิ่งเรียนมา!

```javascript
// เปลี่ยนชื่อ หรือ ย้ายไฟล์
async function renameFile(oldPath, newPath) {
    await fs.rename(oldPath, newPath);
    console.log(`♻️ เปลี่ยนชื่อ/ย้าย: ${oldPath} -> ${newPath}`);
}

// Copy ไฟล์
async function copyFile(src, dest) {
    await fs.copyFile(src, dest);
    console.log(`👯 Copy: ${src} -> ${dest}`);
}

// สร้างโฟลเดอร์ (ต้องรองรับ Recursive)
async function makeDir(dirName) {
    await fs.mkdir(dirName, { recursive: true });
    console.log(`📂 สร้างโฟลเดอร์: ${dirName}`);
}
```

### Step 4: ดูข้อมูลไฟล์ (File Info - stat) 📊

แสดงข้อมูล Metadata ของไฟล์

```javascript
async function getInfo(file) {
    const stats = await fs.stat(file);
    
    console.log("=== 📄 File Info ===");
    console.log(`Name:    ${file}`);
    console.log(`Size:    ${stats.size} bytes`);
    console.log(`Created: ${stats.birthtime.toLocaleString()}`);
    console.log(`Is Folder?: ${stats.isDirectory() ? "Yes" : "No"}`);
}
```

### Step 5: ลบโฟลเดอร์ (rm -rf) 🧨

ระวังการใช้คำสั่งนี้! มันจะลบทุกอย่างในนั้น

```javascript
async function removeDir(dirName) {
    await fs.rm(dirName, { recursive: true, force: true });
    console.log(`🗑️ ลบโฟลเดอร์ '${dirName}' และทุกอย่างข้างในแล้ว!`);
}
```

---

## 🧪 Testing Checklist

ลองรันทีละคำสั่งเพื่อเช็คว่าโค้ดทำงานถูกต้อง:

1.  **สร้างโฟลเดอร์ซ้อน:** `node manager.js mkdir project/src`
2.  **เขียนไฟล์ข้างใน:** `node manager.js write project/src/index.js "console.log('Hi')"`
3.  **เช็คข้อมูล:** `node manager.js info project/src/index.js`
4.  **Copy ไฟล์:** `node manager.js copy project/src/index.js backup.js`
5.  **ลบโฟลเดอร์:** `node manager.js rmdir project` (ไฟล์ข้างในต้องหายหมด)

---

## 🏆 Extra Challenges (ท้าทาย)

1.  **Format Size:** เปลี่ยนหน่วย byte เป็น KB, MB อัตโนมัติในคำสั่ง `info` (เช่น `1024 bytes` -> `1 KB`)
2.  **Backup Command:** สร้างคำสั่ง `backup <file>` ที่จะ copy ไฟล์นั้น แล้วเติมวันที่ต่อท้ายชื่อ (เช่น `data.json` -> `data-2024-01-01.json`)
3.  **Search:** สร้างคำสั่ง `search <keyword>` เพื่อค้นหาไฟล์ที่มีชื่อตรงกับ keyword ในโฟลเดอร์ปัจจุบัน

---

👉 **[กลับหน้าสารบัญ](/node/)**
