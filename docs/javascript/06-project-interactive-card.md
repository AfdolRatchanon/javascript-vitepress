# 🎴 Project 7: Interactive Profile Card (โปรเจกต์ — การ์ดโปรไฟล์แบบ Interactive) 🎴

> **บทนี้จะ Combine ทุกอย่างที่เรียนใน Module 6:**
> DOM Basics + Events + Manipulation = **แอปจริงที่ใช้มือจับได้!**

---

## 🎯 Project Goal (เป้าหมาย)

สร้าง **Interactive Profile Card** ที่ผู้ใช้สามารถ:
1. **พิมพ์ชื่อ** → ชื่อบนการ์ดเปลี่ยนทันที (Live Update)
2. **เลือกสี Theme** → การ์ดเปลี่ยนสีพื้นหลัง
3. **คลิกปุ่ม "Add Skill"** → เพิ่ม Skill Tag ลงบนการ์ด
4. **คลิก Skill Tag** → ลบ Tag ออก
5. **ปุ่ม Dark/Light Mode** → สลับธีมของการ์ด

---

## 📐 HTML Structure (โครง HTML ที่ให้มา)

สร้างไฟล์ `profile-card.html`:

```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Profile Card</title>
    <link rel="stylesheet" href="profile-card.css">
</head>
<body>
    <div class="app">
        <h1>🎴 Profile Card Builder</h1>

        <!-- Controls -->
        <div class="controls">
            <input type="text" id="nameInput" placeholder="พิมพ์ชื่อของคุณ...">

            <div class="color-picker">
                <label>เลือกสี Theme:</label>
                <input type="color" id="colorPicker" value="#6c5ce7">
            </div>

            <div class="skill-input">
                <input type="text" id="skillInput" placeholder="เพิ่ม Skill...">
                <button id="addSkillBtn">+ Add Skill</button>
            </div>

            <button id="toggleThemeBtn">🌙 Dark Mode</button>
        </div>

        <!-- Profile Card (สร้างด้วย JS!) -->
        <div id="card" class="profile-card">
            <div class="card-header">
                <div class="avatar">👤</div>
                <h2 id="cardName">Your Name</h2>
                <p id="cardTitle">Web Developer</p>
            </div>
            <div class="card-body">
                <h3>Skills</h3>
                <div id="skillsList" class="skills-list">
                    <!-- Skills จะถูกเพิ่มด้วย JavaScript -->
                </div>
            </div>
            <div class="card-footer">
                <p id="skillCount">0 Skills</p>
            </div>
        </div>
    </div>

    <script src="profile-card.js"></script>
</body>
</html>
```

---

## 🎨 CSS (สร้าง `profile-card.css`)

```css
/* 
   ⭐ ให้สร้าง CSS เองก่อน! 
   ถ้าคิดไม่ออก ค่อยเปิดดูเฉลย 
*/
```

::: details ✨ ดู CSS ตัวอย่าง
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 40px 20px;
    background: #f0f0f0;
    transition: background 0.3s;
}

body.dark-mode {
    background: #1a1a2e;
    color: #eee;
}

.app {
    max-width: 500px;
    width: 100%;
}

h1 { text-align: center; margin-bottom: 24px; }

.controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.controls input[type="text"] {
    padding: 10px 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.color-picker {
    display: flex;
    align-items: center;
    gap: 10px;
}

.skill-input {
    display: flex;
    gap: 8px;
}

.skill-input input { flex: 1; }

button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    background: #6c5ce7;
    color: white;
    transition: transform 0.1s, opacity 0.2s;
}

button:hover { opacity: 0.9; }
button:active { transform: scale(0.97); }

.profile-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    transition: all 0.3s;
}

.card-header {
    padding: 30px;
    text-align: center;
    color: white;
    background: #6c5ce7;
}

.avatar {
    font-size: 4rem;
    margin-bottom: 10px;
}

.card-body {
    padding: 20px 30px;
    background: white;
}

body.dark-mode .card-body { background: #16213e; }

.card-body h3 { margin-bottom: 12px; }

.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 40px;
}

.skill-tag {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    cursor: pointer;
    background: #dfe6e9;
    transition: transform 0.2s, background 0.2s;
}

.skill-tag:hover {
    background: #ff7675;
    color: white;
    transform: scale(1.05);
}

body.dark-mode .skill-tag { background: #2d3436; color: #dfe6e9; }

.card-footer {
    padding: 15px 30px;
    text-align: center;
    background: #f8f9fa;
    font-size: 0.9rem;
    color: #636e72;
}

body.dark-mode .card-footer { background: #0f3460; color: #bbb; }
```
:::

---

## ⚙️ JavaScript Requirements (สิ่งที่ต้องทำ)

สร้าง `profile-card.js` แล้ว Implement ฟีเจอร์เหล่านี้:

### Feature 1: Live Name Update 📝
- ฟัง Event `input` บน `#nameInput`
- เมื่อพิมพ์ → เปลี่ยนข้อความใน `#cardName` ทันที
- ถ้า input ว่าง → แสดง "Your Name"

### Feature 2: Theme Color Picker 🎨
- ฟัง Event `input` บน `#colorPicker`
- เปลี่ยน `background-color` ของ `.card-header` ตามสีที่เลือก
- เปลี่ยนสี `background` ของปุ่มทุกตัวตามด้วย

### Feature 3: Add Skill Tag ➕
- ฟัง Event `click` บน `#addSkillBtn`
- อ่านค่าจาก `#skillInput` แล้วสร้าง `<span class="skill-tag">`
- ใส่เข้าไปใน `#skillsList`
- เคลียร์ input หลังเพิ่ม
- อัปเดตจำนวน Skills ใน `#skillCount`
- ⭐ **Bonus:** กด Enter ใน input แล้วเพิ่ม Skill ได้ด้วย!

### Feature 4: Remove Skill Tag ❌
- ใช้ **Event Delegation** — ติด Listener ที่ `#skillsList` ตัวเดียว
- เมื่อคลิก `.skill-tag` → ลบ Tag นั้นออก
- อัปเดตจำนวน Skills

### Feature 5: Dark/Light Mode Toggle 🌙
- ฟัง Event `click` บน `#toggleThemeBtn`
- Toggle Class `"dark-mode"` บน `<body>`
- เปลี่ยนข้อความปุ่ม: "🌙 Dark Mode" ↔ "☀️ Light Mode"

---

## 🧩 Hints (คำใบ้)

<details>
<summary>💡 คำใบ้ Feature 1: Live Name</summary>

```javascript
nameInput.addEventListener("input", (e) => {
    cardName.textContent = e.target.value || "Your Name";
});
```
</details>

<details>
<summary>💡 คำใบ้ Feature 3: Add Skill</summary>

```javascript
const tag = document.createElement("span");
tag.classList.add("skill-tag");
tag.textContent = skillInput.value;
skillsList.appendChild(tag);
```
</details>

<details>
<summary>💡 คำใบ้ Feature 4: Event Delegation</summary>

```javascript
skillsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("skill-tag")) {
        e.target.remove();
        updateSkillCount();
    }
});
```
</details>

---

## ✅ Full Solution (เฉลยเต็ม)

::: details ✨ ดูเฉลย JavaScript (`profile-card.js`)
```javascript
// ========== DOM Elements ==========
const nameInput = document.querySelector("#nameInput");
const colorPicker = document.querySelector("#colorPicker");
const skillInput = document.querySelector("#skillInput");
const addSkillBtn = document.querySelector("#addSkillBtn");
const toggleThemeBtn = document.querySelector("#toggleThemeBtn");

const cardName = document.querySelector("#cardName");
const cardHeader = document.querySelector(".card-header");
const skillsList = document.querySelector("#skillsList");
const skillCount = document.querySelector("#skillCount");

// ========== Feature 1: Live Name Update ==========
nameInput.addEventListener("input", (e) => {
    const name = e.target.value.trim();
    cardName.textContent = name || "Your Name";
});

// ========== Feature 2: Theme Color Picker ==========
colorPicker.addEventListener("input", (e) => {
    const color = e.target.value;
    cardHeader.style.backgroundColor = color;

    // เปลี่ยนสีปุ่มทุกตัวด้วย
    document.querySelectorAll("button").forEach(btn => {
        btn.style.backgroundColor = color;
    });
});

// ========== Feature 3: Add Skill Tag ==========
function addSkill() {
    const skill = skillInput.value.trim();
    if (!skill) return; // ห้ามว่าง!

    const tag = document.createElement("span");
    tag.classList.add("skill-tag");
    tag.textContent = skill;

    skillsList.appendChild(tag);
    skillInput.value = "";
    skillInput.focus();
    updateSkillCount();
}

addSkillBtn.addEventListener("click", addSkill);

// Bonus: กด Enter เพื่อเพิ่ม Skill
skillInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addSkill();
    }
});

// ========== Feature 4: Remove Skill (Event Delegation) ==========
skillsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("skill-tag")) {
        e.target.remove();
        updateSkillCount();
    }
});

// ========== Feature 5: Dark/Light Mode Toggle ==========
toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");
    toggleThemeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// ========== Helper Functions ==========
function updateSkillCount() {
    const count = skillsList.children.length;
    skillCount.textContent = `${count} Skill${count !== 1 ? "s" : ""}`;
}
```
:::

---

## 🌟 Extra Challenges (ของแถม!)

1. **Drag & Drop Skills** — ลาก Skill Tag เพื่อเปลี่ยนลำดับ
2. **LocalStorage** — บันทึกข้อมูลการ์ดใน `localStorage` เพื่อกลับมาดูได้ทีหลัง
3. **Export Card** — สร้างปุ่มที่ Export การ์ดเป็นรูปภาพ (ใช้ `html2canvas`)
4. **Animation** — เพิ่ม Animation เมื่อเพิ่ม/ลบ Skill Tag

---

## 📋 Skills Used in This Project

| Skill | ใช้ตรงไหน |
|:------|:---------|
| `querySelector` | หยิบทุก Element |
| `addEventListener` | ฟังทุก Event |
| `createElement` | สร้าง Skill Tag |
| `appendChild` | ใส่ Tag ลงใน List |
| `remove()` | ลบ Tag |
| `classList.toggle` | Dark/Light Mode |
| `style.*` | เปลี่ยนสี Theme |
| `textContent` | อัปเดตชื่อ + Counter |
| **Event Delegation** | ลบ Skill Tag |
| `e.preventDefault()` | ป้องกัน Enter submit |
