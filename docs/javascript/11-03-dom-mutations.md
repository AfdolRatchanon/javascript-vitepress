# 11-3: DOM Mutations (สร้าง/ลบ/ย้าย Elements) 🏗️

> **"Don't just read the web — build it."**
> — *Unknown*

ตอนนี้เรารู้วิธี **หยิบ Element** (06-1) และ **ฟัง Event** (06-2) แล้ว ขั้นสุดท้ายคือ **สร้าง/ลบ/ย้าย Elements** ให้หน้าเว็บมีชีวิต!

> **💡 Analogy (เปรียบเทียบ):**
> DOM Manipulation เหมือน **"ต่อเลโก้บนหน้าจอ"** ครับ 🧱:
> - `createElement()` = สร้างชิ้นส่วนเลโก้ใหม่
> - `appendChild()` = ต่อชิ้นส่วนเข้ากับโครงสร้าง
> - `removeChild()` = ถอดชิ้นส่วนออก
> - `insertBefore()` = แทรกชิ้นส่วนตรงกลาง



## 1. Creating Elements (สร้าง Element ใหม่) 🆕

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement):

### ขั้นตอน: สร้าง → ตกแต่ง → ใส่

```javascript
// ขั้น 1: สร้าง Element
const card = document.createElement("div");

// ขั้น 2: ตกแต่ง (ใส่เนื้อหา, Class, Attributes)
card.textContent = "Hello, I'm a new card!";
card.classList.add("card", "shadow");
card.id = "my-card";
card.setAttribute("data-theme", "dark");
card.style.padding = "20px";
card.style.borderRadius = "8px";

// ขั้น 3: ใส่เข้าไปใน DOM
document.body.appendChild(card);

// ⭐ ถ้ายังไม่ appendChild → Element จะอยู่ใน "อากาศ" (Memory)
// ไม่แสดงบนหน้าจอ จนกว่าจะ append!
```

### สร้าง Element ที่ซับซ้อน:

```javascript
// สร้าง Card พร้อม Children
function createUserCard(name, role) {
    const card = document.createElement("div");
    card.classList.add("user-card");

    const title = document.createElement("h3");
    title.textContent = name;

    const subtitle = document.createElement("p");
    subtitle.textContent = role;
    subtitle.classList.add("text-muted");

    const btn = document.createElement("button");
    btn.textContent = "View Profile";
    btn.classList.add("btn", "btn-primary");

    // ต่อชิ้นส่วนเข้าด้วยกัน
    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(btn);

    return card;
}

// ใช้งาน:
const container = document.querySelector("#container");
container.appendChild(createUserCard("Dolar", "Developer"));
container.appendChild(createUserCard("Somchai", "Designer"));
```



## 2. Inserting Elements (ใส่ Element ตำแหน่งต่างๆ) 📍

### appendChild() — ใส่ท้ายสุด

```javascript
const list = document.querySelector("#list");
const newItem = document.createElement("li");
newItem.textContent = "New Item";

list.appendChild(newItem);  // ใส่ท้ายสุดของ list
```

### prepend() — ใส่หน้าสุด (ES6+)

```javascript
list.prepend(newItem);  // ใส่หน้าสุด!
```

### insertBefore() — แทรกก่อน Element ที่ระบุ

```javascript
const referenceItem = list.children[1]; // ตัวที่ 2
list.insertBefore(newItem, referenceItem); // แทรกก่อนตัวที่ 2
```

### ⭐ insertAdjacentHTML() — ใส่ HTML String ตรงตำแหน่ง

```javascript
const container = document.querySelector("#container");

// 4 ตำแหน่ง:
container.insertAdjacentHTML("beforebegin", "<p>ก่อน container</p>");
container.insertAdjacentHTML("afterbegin", "<p>ต้น container</p>");
container.insertAdjacentHTML("beforeend", "<p>ท้าย container</p>");
container.insertAdjacentHTML("afterend", "<p>หลัง container</p>");
```

### ภาพ 4 ตำแหน่ง:

```
<!-- beforebegin -->
<div id="container">
    <!-- afterbegin -->
    <p>existing content</p>
    <!-- beforeend -->
</div>
<!-- afterend -->
```

### 📊 Insert Methods Comparison

| Method | ตำแหน่ง | รับอะไร | ใช้บ่อย |
|:-------|:-------|:-------|:--------|
| `appendChild(el)` | ท้าย Child | Element | ⭐⭐⭐ |
| `prepend(el)` | หน้า Child | Element/Text | ⭐⭐ |
| `append(el)` | ท้าย Child | Element/Text | ⭐⭐ |
| `insertBefore(el, ref)` | ก่อน ref | Element | ⭐⭐ |
| `insertAdjacentHTML(pos, html)` | 4 ตำแหน่ง | HTML String | ⭐⭐ |
| `after(el)` / `before(el)` | หลัง/ก่อน Element | Element/Text | ⭐ |



## 3. Removing Elements (ลบ Element) 🗑️

```javascript
const item = document.querySelector("#old-item");

// ✅ วิธีใหม่ (Modern — ง่ายสุด!)
item.remove();

// ✅ วิธีเก่า (ต้องใช้ Parent)
item.parentElement.removeChild(item);
```

### ลบทุก Children:

```javascript
const container = document.querySelector("#container");

// วิธี 1: วน Loop ลบทีละตัว
while (container.firstChild) {
    container.removeChild(container.firstChild);
}

// วิธี 2: เคลียร์ innerHTML (เร็ว แต่ลบ listeners ด้วย!)
container.innerHTML = "";

// วิธี 3: replaceChildren() — ⭐ Modern & Clean
container.replaceChildren();
```



## 4. Cloning & Replacing Elements 🐑

### cloneNode() — Copy Element:

```javascript
const original = document.querySelector(".card");

// Shallow Clone (ไม่ copy children)
const shallowCopy = original.cloneNode(false);

// Deep Clone (copy ทุก children!)
const deepCopy = original.cloneNode(true);

// ⭐ เปลี่ยน ID เพื่อไม่ให้ซ้ำ!
deepCopy.id = "card-copy";

document.body.appendChild(deepCopy);
```

### replaceWith() — แทนที่ Element:

```javascript
const oldParagraph = document.querySelector("#old");
const newParagraph = document.createElement("p");
newParagraph.textContent = "I'm the replacement!";

oldParagraph.replaceWith(newParagraph);
```



## 5. DocumentFragment (ประกอบก่อนค่อยใส่ — เร็วกว่า!) ⚡

เมื่อต้องเพิ่ม Element จำนวนมาก → ใช้ `DocumentFragment` เพื่อ **ลด Reflow/Repaint**:

```javascript
const list = document.querySelector("#list");
const items = ["Apple", "Banana", "Cherry", "Durian", "Elderberry"];

// ❌ SLOW: append ทีละตัว → Browser render ใหม่ทุกรอบ (5 ครั้ง!)
items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li); // → Reflow ทุกครั้ง!
});

// ✅ FAST: รวบไว้ก่อน แล้ว append ทีเดียว (1 ครั้ง!)
const fragment = document.createDocumentFragment();

items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    fragment.appendChild(li); // ใส่ใน Fragment (ยังไม่ render)
});

list.appendChild(fragment); // → Render ครั้งเดียว! ⚡
```

### 📊 Direct vs Fragment

| | **Direct appendChild** | **DocumentFragment** |
|:--|:----------------------|:---------------------|
| **Reflows** | N ครั้ง (ทุก append) | **1 ครั้ง** |
| **Performance** | 🐢 ช้า (ถ้า N มาก) | ⚡ เร็ว |
| **ใช้เมื่อ** | Element น้อย (1-3) | Element เยอะ (10+) |



## 6. innerHTML vs createElement — When to Use? 🤔

```javascript
// ✅ innerHTML — เร็ว ง่าย เหมาะกับ Static Content
container.innerHTML = `
    <div class="card">
        <h3>${userName}</h3>
        <p>${userBio}</p>
    </div>
`;
// ⚠️ ข้อ注意: ลบ Event Listeners เดิมทั้งหมด!
// ⚠️ XSS Risk ถ้าใส่ข้อมูลจากผู้ใช้!

// ✅ createElement — ปลอดภัย เหมาะกับ Dynamic Content
const card = document.createElement("div");
card.classList.add("card");
card.textContent = userInput; // ปลอดภัยจาก XSS!
container.appendChild(card);
```

### 📊 innerHTML vs createElement

| | `innerHTML` | `createElement` |
|:--|:-----------|:----------------|
| **ง่ายไหม** | ⭐⭐⭐ เขียนง่าย | ⭐⭐ ยาวกว่า |
| **XSS Safe** | ❌ ถ้ามี User Input | ✅ ปลอดภัย |
| **Event Listeners** | ❌ ถูกลบ! | ✅ ไม่กระทบ |
| **Performance** | ⚡ เร็ว (น้อยๆ) | ⚡ เร็ว (เยอะๆ) |
| **ใช้เมื่อ** | HTML ง่ายๆ ไม่มี User Input | ข้อมูลจาก User / Dynamic |



## 7. Practical Examples 🎮

### Example 1: Dynamic Todo List

```javascript
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return; // ห้ามว่าง!

    // สร้าง todo item
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.addEventListener("click", () => li.remove());

    li.appendChild(span);
    li.appendChild(deleteBtn);

    // คลิก item → ขีดฆ่า
    span.addEventListener("click", () => {
        span.classList.toggle("done");
    });

    list.appendChild(li);
    input.value = ""; // เคลียร์ input
    input.focus();    // กลับไปที่ input
});
```

### Example 2: Dynamic Table Builder

```javascript
function createTable(data) {
    const table = document.createElement("table");
    table.classList.add("data-table");

    // Header Row
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = Object.keys(data[0]);

    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body Rows
    const tbody = document.createElement("tbody");
    data.forEach(item => {
        const row = document.createElement("tr");
        headers.forEach(header => {
            const td = document.createElement("td");
            td.textContent = item[header];
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
}

// ใช้งาน:
const users = [
    { name: "Dolar", age: 25, role: "Developer" },
    { name: "Somchai", age: 30, role: "Designer" },
];
document.body.appendChild(createTable(users));
```

## Real-World Use Case: Dynamic Comment Section 🌐

```javascript
function addComment(username, text) {
    const commentSection = document.querySelector("#comments");
    const comment = document.createElement("div");
    comment.className = "comment";
    comment.innerHTML = `
        <strong>${username}</strong>
        <p>${text}</p>
        <small>${new Date().toLocaleString("th-TH")}</small>
        <button class="delete-btn">ลบ</button>
    `;

    // Event Delegation สำหรับปุ่มลบ
    comment.querySelector(".delete-btn").addEventListener("click", () => {
        comment.remove();
    });

    commentSection.prepend(comment); // แสดง Comment ใหม่ด้านบน
}
```



## 8. Challenges 🏆


ทดสอบความเข้าใจกับโจทย์ 6 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: The Builder
**หัวข้อ:** 1. Creating Elements

**โจทย์:** สร้าง Element `<h4>` ใหม่ที่มีข้อความ "Hello DOM" และเพิ่ม Class "title" (ยังไม่ต้องใส่ในหน้าเว็บ)
::: details ✨ ดูเฉลย
```javascript
const h4 = document.createElement("h4");
h4.textContent = "Hello DOM";
h4.classList.add("title");
```
:::

### 🎯 Challenge 2: The Appender
**หัวข้อ:** 2. Inserting Elements

**โจทย์:** จาก `h4` ในข้อ 1 ให้ใส่เข้าไปใน `<body>` เป็น **ตัวแรกสุด** (บนสุด)
::: details ✨ ดูเฉลย
```javascript
document.body.prepend(h4);
```
:::

### 🎯 Challenge 3: The Cleaner
**หัวข้อ:** 3. Removing Elements

**โจทย์:** ลบ Element ที่มี ID `#ad-banner` ออกจากหน้าเว็บ
::: details ✨ ดูเฉลย
```javascript
document.querySelector("#ad-banner").remove();
```
:::

### 🎯 Challenge 4: Cloning Lab
**หัวข้อ:** 4. Cloning

**โจทย์:** Clone ปุ่ม `#submit-btn` และนำไปใส่ไว้ต่อจากปุ่มเดิม (Duplicate ปุ่ม)
::: details ✨ ดูเฉลย
```javascript
const original = document.querySelector("#submit-btn");
const clone = original.cloneNode(true);
original.after(clone); // หรือ parent.appendChild(clone)
```
:::

### 🎯 Challenge 5: Performance Boost
**หัวข้อ:** 5. DocumentFragment

**โจทย์:** ถ้าจะสร้าง `<li>` 100 ตัวใส่ใน `<ul>` ควรทำอย่างไรให้เร็วที่สุด? (บอกชื่อเทคนิค)
::: details ✨ ดูเฉลย
ใช้ **`DocumentFragment`** ครับ ใส่ `<li>` ทั้งหมดลงใน Fragment ก่อน แล้วค่อยเอา Fragment ไป append ใส่ `<ul>` ทีเดียว
:::

### 🎯 Challenge 6: The Architect
**หัวข้อ:** 6. createElement vs innerHTML

**โจทย์:** ถ้ามีข้อมูลชื่อ user จาก Input (ที่ user พิมพ์เอง) เราควรใช้ `innerHTML` หรือ `createElement` หรือ `textContent` ในการแสดงผล? เพราะอะไร?
::: details ✨ ดูเฉลย
ควรใช้ **`textContent`** หรือ **`createElement`** ครับ เพื่อป้องกัน **XSS Attack** (ถ้าใช้ `innerHTML` อาจโดนฝัง Script ได้)
:::



> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **`createElement()`:** สร้าง Element ใหม่ใน Memory (ยังไม่แสดงบนจอ)
> *   **`appendChild()`:** เพิ่ม Child Element ไว้ท้ายสุด
> *   **`prepend()`:** เพิ่ม Child Element ไว้หน้าสุด
> *   **`remove()`:** ลบ Element ออกจาก DOM
> *   **`cloneNode()`:** Copy Element (shallow/deep)
> *   **`replaceWith()`:** แทนที่ Element ด้วยตัวใหม่
> *   **`insertAdjacentHTML()`:** แทรก HTML String ใน 4 ตำแหน่ง
> *   **DocumentFragment:** Container ชั่วคราวที่ไม่อยู่ใน DOM — ช่วยเรื่อง Performance
> *   **Reflow:** กระบวนการที่ Browser คำนวณ Layout ใหม่ (ช้า!)
> *   **Repaint:** กระบวนการที่ Browser วาดหน้าจอใหม่


👉 **[ไปทำโปรเจกต์: Project 11 - Interactive Profile Card](/javascript/11-project-interactive-ui)**
