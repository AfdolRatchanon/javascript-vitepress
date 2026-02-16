# 06-2: DOM Events (การจัดการเหตุการณ์) 🎯

> **"Events are signals that something has happened. All DOM nodes generate such signals."**
> — *MDN Web Docs*

ถ้า DOM Basics สอนให้เรา **"อ่าน/แก้ไข"** หน้าเว็บ ตอนนี้เราจะเรียนการ **"ตอบสนอง"** ต่อผู้ใช้ครับ — คลิกปุ่ม พิมพ์ข้อความ เลื่อนเมาส์ ทุกอย่างคือ **Event**!

> **💡 Analogy (เปรียบเทียบ):**
> Events เหมือน **"กริ่งประตู"** ครับ 🔔:
> - กริ่ง = **Event** (มีคนกดกริ่ง = มีคนคลิกปุ่ม)
> - หูฟัง = **Event Listener** (เครื่องรับสัญญาณ)
> - การเปิดประตู = **Callback Function** (สิ่งที่ทำเมื่อได้ยินกริ่ง)
>
> ถ้าไม่ติดกริ่ง (ไม่ใส่ Listener) → คนกดยังไงก็ไม่มีอะไรเกิดขึ้น!

---

## 1. Event Listener (ตัวรับสัญญาณ) 👂

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener):

### `addEventListener()` — วิธีมาตรฐาน (⭐ ใช้วิธีนี้เสมอ!)

```javascript
// HTML: <button id="btn">Click Me!</button>

const btn = document.querySelector("#btn");

// addEventListener(eventType, callbackFunction)
btn.addEventListener("click", function() {
    console.log("Button was clicked!");
});

// ✅ ใช้ Arrow Function ก็ได้:
btn.addEventListener("click", () => {
    console.log("Button was clicked!");
});

// ✅ แยก Function ออกมา (อ่านง่ายกว่า):
function handleClick() {
    console.log("Button was clicked!");
}
btn.addEventListener("click", handleClick);
```

### ❌ วิธีเก่า (อย่าใช้!):

```javascript
// ❌ วิธีที่ 1: onclick attribute ใน HTML
// <button onclick="handleClick()">Click</button>  — ผสม HTML กับ JS!

// ❌ วิธีที่ 2: onclick property ใน JS
// btn.onclick = function() { ... };  — ใส่ได้แค่ 1 listener!

// ✅ addEventListener — ใส่ได้หลาย listeners!
btn.addEventListener("click", handleA);
btn.addEventListener("click", handleB);  // ทั้ง 2 ทำงาน!
```

### 📊 Why addEventListener is Better

| | `onclick` attribute | `onclick` property | `addEventListener` |
|:--|:-------------------|:-------------------|:-------------------|
| **หลาย handlers** | ❌ ได้ 1 | ❌ ได้ 1 | ✅ ได้หลาย! |
| **แยก HTML/JS** | ❌ ผสมกัน | ✅ แยก | ✅ แยก |
| **ลบ listener** | ❌ | ❌ | ✅ `removeEventListener` |
| **แนะนำ** | ❌ | ❌ | ⭐ **ใช้วิธีนี้!** |

---

## 2. Common Event Types (ชนิดของ Event) 📋

### 📊 Event Types Reference

| Category | Event | เกิดเมื่อ | ตัวอย่างใช้งาน |
|:---------|:------|:---------|:-------------|
| **Mouse** | `click` | คลิก | ปุ่ม, ลิงค์ |
| | `dblclick` | ดับเบิลคลิก | เปิดไฟล์ |
| | `mouseenter` | เมาส์เข้า | Hover effect |
| | `mouseleave` | เมาส์ออก | ซ่อน tooltip |
| | `mousemove` | เมาส์เลื่อน | วาดรูป, ลากของ |
| **Keyboard** | `keydown` | กดปุ่ม (ค้างได้) | Shortcut keys |
| | `keyup` | ปล่อยปุ่ม | หยุดเดินในเกม |
| **Form** | `submit` | ส่ง Form | Login, สมัครสมาชิก |
| | `input` | พิมพ์ข้อมูล (ทุกตัวอักษร) | Search ทันที |
| | `change` | เปลี่ยนค่า (ออกจาก field) | Dropdown, Checkbox |
| | `focus` | เข้า input | เปลี่ยนสี border |
| | `blur` | ออกจาก input | Validate ข้อมูล |
| **Window** | `load` | โหลดหน้าเสร็จ | เริ่มต้น App |
| | `resize` | เปลี่ยนขนาดหน้าต่าง | Responsive |
| | `scroll` | เลื่อนหน้า | Sticky header |

---

## 3. The Event Object (ข้อมูลเกี่ยวกับ Event) 📦

ทุกครั้งที่ Event เกิด JS จะส่ง **Event Object** มาให้ใน Callback:

```javascript
const btn = document.querySelector("#btn");

btn.addEventListener("click", function(event) {
    // event (หรือ e) คือ Object ที่มีข้อมูลเกี่ยวกับ Event
    console.log(event.type);      // "click"
    console.log(event.target);    // <button id="btn">... (Element ที่ถูกคลิก)
    console.log(event.clientX);   // 150 (ตำแหน่ง X ของเมาส์)
    console.log(event.clientY);   // 200 (ตำแหน่ง Y ของเมาส์)
    console.log(event.timeStamp); // 12345.67 (เวลาที่เกิด Event)
});

// ⭐ ย่อ event เป็น e ก็ได้ (Convention):
btn.addEventListener("click", (e) => {
    console.log(e.target);
});
```

### Event Object Properties ที่ใช้บ่อย:

| Property | ทำอะไร | ตัวอย่าง |
|:---------|:-------|:---------|
| `e.type` | ชนิดของ Event | `"click"`, `"keydown"` |
| `e.target` | Element ที่ **"จริงๆ"** ถูกกดกด | `<button>` |
| `e.currentTarget` | Element ที่ **ติด listener** | `<div>` (ถ้า listen บน div) |
| `e.clientX` / `e.clientY` | ตำแหน่งเมาส์ (จอ) | `150`, `200` |
| `e.key` | ปุ่มที่กด (Keyboard) | `"Enter"`, `"a"`, `"Escape"` |
| `e.preventDefault()` | หยุดพฤติกรรมปกติ | ป้องกัน Form submit |
| `e.stopPropagation()` | หยุด Event bubbling | ไม่ให้ส่งต่อขึ้น Parent |

---

## 4. Keyboard Events (เหตุการณ์คีย์บอร์ด) ⌨️

```javascript
// ตรวจจับการกดปุ่ม
document.addEventListener("keydown", (e) => {
    console.log(`Key: "${e.key}" | Code: "${e.code}"`);
});

// ตัวอย่าง Outputs:
// กดปุ่ม A → Key: "a" | Code: "KeyA"
// กด Enter → Key: "Enter" | Code: "Enter"
// กด Space → Key: " " | Code: "Space"
// กด Arrow Up → Key: "ArrowUp" | Code: "ArrowUp"
// กด Escape → Key: "Escape" | Code: "Escape"
```

### Practical Example: Keyboard Shortcuts

```javascript
document.addEventListener("keydown", (e) => {
    // Ctrl + S (Save shortcut)
    if (e.ctrlKey && e.key === "s") {
        e.preventDefault(); // ป้องกัน Browser save dialog!
        console.log("💾 Custom save triggered!");
    }

    // Escape (ปิด Modal)
    if (e.key === "Escape") {
        console.log("❌ Close modal!");
    }
});
```

### 📊 `e.key` vs `e.code`

| | `e.key` | `e.code` |
|:--|:--------|:---------|
| **ค่า** | ตัวอักษรที่พิมพ์ | ตำแหน่งบนคีย์บอร์ด |
| **เปลี่ยนตาม Layout** | ✅ ใช่ | ❌ ไม่ |
| **ใช้เมื่อ** | ตรวจจับ "ตัวอักษร" | ตรวจจับ "ปุ่ม" (Game WASD) |
| **ตัวอย่าง** | `"a"`, `"Enter"` | `"KeyA"`, `"Enter"` |

---

## 5. Form Events (เหตุการณ์ฟอร์ม) 📝

```html
<form id="loginForm">
    <input type="text" id="username" placeholder="Username">
    <input type="password" id="password" placeholder="Password">
    <button type="submit">Login</button>
</form>
```

```javascript
const form = document.querySelector("#loginForm");

// ⭐ submit Event — ดักจับการส่ง Form
form.addEventListener("submit", (e) => {
    e.preventDefault(); // ← สำคัญ! ป้องกันหน้ารีโหลด!

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    console.log("Username:", username);
    console.log("Password:", password);

    // ส่งข้อมูลด้วย fetch() แทนการรีโหลดหน้า
});

// ⭐ input Event — ทำงานทุกตัวอักษร (Live Search!)
const usernameInput = document.querySelector("#username");
usernameInput.addEventListener("input", (e) => {
    console.log("กำลังพิมพ์:", e.target.value);
});

// ⭐ focus / blur — เข้า/ออกจาก Input
usernameInput.addEventListener("focus", () => {
    console.log("📝 เริ่มพิมพ์ username");
});
usernameInput.addEventListener("blur", () => {
    console.log("✅ ออกจาก username แล้ว");
});
```

> **`e.preventDefault()`** สำคัญมาก! — ป้องกัน Browser ทำ Default Action (เช่น Form submit = รีโหลดหน้า, Link click = เปลี่ยนหน้า)

---

## 6. Event Bubbling & Delegation 🫧

### Event Bubbling — Event ลอยขึ้น!

เมื่อคลิก Child → Event จะ **"ลอย" (Bubble) ขึ้นไปหา Parent** ทุกชั้น:

```html
<div id="grandparent">
    <div id="parent">
        <button id="child">Click Me</button>
    </div>
</div>
```

```javascript
document.querySelector("#grandparent").addEventListener("click", () => {
    console.log("3. Grandparent caught it! 👴");
});
document.querySelector("#parent").addEventListener("click", () => {
    console.log("2. Parent caught it! 👨");
});
document.querySelector("#child").addEventListener("click", () => {
    console.log("1. Child was clicked! 👶");
});

// คลิกที่ปุ่ม → Output:
// 1. Child was clicked! 👶
// 2. Parent caught it! 👨
// 3. Grandparent caught it! 👴
// ↑ Event ลอยขึ้นทุกชั้น!
```

```
Bubbling Direction:
                    
   #grandparent ← 3. 👴 ได้ยิน!
       │
   #parent      ← 2. 👨 ได้ยิน!
       │
   button        ← 1. 👶 ถูกคลิก! (เริ่มต้น)
```

### ⭐ Event Delegation — ฟังจากที่เดียว ครอบจักรวาล!

แทนที่จะติด listener ทุก `<li>` → ติดแค่ที่ `<ul>` ตัวเดียว!

```html
<ul id="todo-list">
    <li>Buy milk</li>
    <li>Learn JavaScript</li>
    <li>Build a project</li>
</ul>
```

```javascript
// ❌ BAD: ติด listener ทุก <li> (ถ้ามี 1000 ตัว = 1000 listeners!)
// document.querySelectorAll("li").forEach(li => {
//     li.addEventListener("click", () => { ... });
// });

// ✅ GOOD: Event Delegation — ติดแค่ที่ <ul> ตัวเดียว!
const todoList = document.querySelector("#todo-list");

todoList.addEventListener("click", (e) => {
    // เช็คว่า Element ที่ถูกคลิกจริงๆ เป็น <li> ไหม
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("done");
        console.log("Toggled:", e.target.textContent);
    }
});

// ⭐ ข้อดี: แม้เพิ่ม <li> ใหม่ทีหลัง ก็ทำงานได้ทันที! (ไม่ต้องติด listener ใหม่)
```

### 📊 Direct vs Delegation

| | **Direct** (ติดทุกตัว) | **Delegation** (ติดที่ Parent) |
|:--|:----------------------|:-------------------------------|
| **Listeners** | 1 ต่อ Element | 1 ตัวเดียว! |
| **Performance** | 🐢 ช้า (1000 Elements = 1000 Listeners) | ⚡ เร็ว |
| **Dynamic Elements** | ❌ ต้องติดใหม่ | ✅ ทำงานอัตโนมัติ |
| **แนะนำ** | รายการน้อยมากๆ | ⭐ รายการเยอะ / Dynamic |

---

## 7. Removing Event Listeners 🧹

```javascript
function handleClick() {
    console.log("Clicked!");
}

const btn = document.querySelector("#btn");

// เพิ่ม listener
btn.addEventListener("click", handleClick);

// ลบ listener (ต้องใช้ Function เดียวกัน!)
btn.removeEventListener("click", handleClick);

// ⚠️ ใช้ Anonymous Function ลบไม่ได้!
// btn.addEventListener("click", () => { ... });
// btn.removeEventListener("click", () => { ... }); // ❌ คนละ Function!

// ✅ ใช้ { once: true } — ทำแค่ครั้งเดียวแล้วลบอัตโนมัติ!
btn.addEventListener("click", handleClick, { once: true });
```

## Real-World Use Case: Live Search Filter 🌐

```javascript
const searchInput = document.querySelector("#search");
const productList = document.querySelector("#products");

// ใช้ Event Delegation + Input Event
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const items = productList.querySelectorAll(".product");

    items.forEach(item => {
        const name = item.textContent.toLowerCase();
        item.style.display = name.includes(query) ? "" : "none";
    });
});
```

> 💡 ใช้ `input` event แทน `keyup` เพราะจับได้ทั้งพิมพ์, วาง (paste), และ autocomplete!

---

## 8. Challenges 🏆

ทดสอบความเข้าใจกับโจทย์ 7 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: The Listener
**หัวข้อ:** 1. Event Listener

**โจทย์:** เขียนโค้ดเมื่อคลิกปุ่ม `<button id="save">` ให้พิมพ์คำว่า "Saved!" (ใช้ `addEventListener`)
::: details ✨ ดูเฉลย
```javascript
const btn = document.querySelector("#save");
btn.addEventListener("click", () => {
    console.log("Saved!");
});
```
:::

### 🎯 Challenge 2: Double Trouble
**หัวข้อ:** 2. Event Types

**โจทย์:** เปลี่ยนจาก "Click" เป็นรับเหตุการณ์ "Double Click" (`dblclick`) แทน
::: details ✨ ดูเฉลย
```javascript
btn.addEventListener("dblclick", () => {
    console.log("Saved (Double Clicked)!");
});
```
:::

### 🎯 Challenge 3: Target Practice
**หัวข้อ:** 3. Event Object

**โจทย์:** เมื่อคลิกปุ่ม ให้พิมพ์ ID ของปุ่มที่ถูกคลิกออกมา (ใช้ `e.target.id`)
::: details ✨ ดูเฉลย
```javascript
btn.addEventListener("click", (e) => {
    console.log(e.target.id);
});
```
:::

### 🎯 Challenge 4: Secret Key
**หัวข้อ:** 4. Keyboard Events

**โจทย์:** ตรวจจับการกดปุ่มบนคีย์บอร์ด ถ้ากดปุ่ม "Enter" ให้พิมพ์ว่า "Submitted!"
::: details ✨ ดูเฉลย
```javascript
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        console.log("Submitted!");
    }
});
```
:::

### 🎯 Challenge 5: No Reload
**หัวข้อ:** 5. Form Events

**โจทย์:** ป้องกันไม่ให้ Form ID `#myForm` รีโหลดหน้าเมื่อกด Submit (ใช้คำสั่งอะไร?)
::: details ✨ ดูเฉลย
```javascript
form.addEventListener("submit", (e) => {
    e.preventDefault(); // คำสั่งนี้ครับ!
});
```
:::

### 🎯 Challenge 6: Parent Power
**หัวข้อ:** 6. Bubbling & Delegation

**โจทย์:** ถ้ามีปุ่มอยู่ใน `<div>` และเราติด Listener ที่ทั้งคู่ เมื่อคลิกปุ่ม Event จะเกิดที่ใครก่อน? (Child หรือ Parent)
::: details ✨ ดูเฉลย
เกิดที่ **Child (ปุ่ม)** ก่อนครับ แล้วค่อย Bubble ลอยขึ้นไปหา Parent (`<div>`)
:::

### 🎯 Challenge 7: Clean Up
**หัวข้อ:** 7. Removing Listeners

**โจทย์:** ถ้าต้องการให้ปุ่มคลิกได้ **แค่ครั้งเดียว** (แล้วเลิกทำงานเลย) ต้องเพิ่ม Option อะไรใน `addEventListener`?
::: details ✨ ดูเฉลย
```javascript
btn.addEventListener("click", handler, { once: true });
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Event:** สัญญาณว่ามีเหตุการณ์เกิดขึ้น (click, keydown, submit)
> *   **Event Listener:** ตัวรับสัญญาณ Event (ติดตั้งด้วย `addEventListener`)
> *   **Callback Function:** ฟังก์ชันที่ถูกเรียกเมื่อ Event เกิดขึ้น
> *   **Event Object (e):** Object ที่มีข้อมูลเกี่ยวกับ Event (type, target, key)
> *   **`e.target`:** Element ที่ "จริงๆ" ถูก trigger Event
> *   **`e.preventDefault()`:** หยุดพฤติกรรมเดิมของ Browser (เช่น submit → reload)
> *   **Event Bubbling:** พฤติกรรมที่ Event ลอยขึ้นจาก Child → Parent → Grandparent
> *   **Event Delegation:** เทคนิคติด Listener ที่ Parent แทนที่จะติดทุก Child
> *   **`e.stopPropagation()`:** หยุดไม่ให้ Event ลอยขึ้น (Bubble) ต่อ
> *   **`once: true`:** Option ที่ทำให้ Listener ทำงานครั้งเดียวแล้วลบตัวเองอัตโนมัติ

---
👉 **[ไปต่อ: 06-3 - DOM Manipulation (สร้าง/ลบ/ย้าย Elements)](/06-03-dom-manipulation)**
