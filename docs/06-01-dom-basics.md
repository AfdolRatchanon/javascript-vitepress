# 06-1: DOM Basics (พื้นฐาน DOM — เชื่อมต่อ JS กับหน้าเว็บ) 🌳

> **"The Document Object Model (DOM) is the data representation of the objects that comprise the structure and content of a document on the web."**
> — *MDN Web Docs*

ถึงเวลาแล้วครับ! ตลอด Module 1-5 เราเรียน JavaScript ใน Terminal (Node.js) ตอนนี้ถึงเวลาที่ JS จะ **"พูดคุยกับหน้าเว็บ"** ได้แล้ว!

> **💡 Analogy (เปรียบเทียบ):**
> DOM เหมือน **"รีโมท TV"** ครับ:
> - **HTML** = ทีวี (โครงสร้างหน้าจอ)
> - **CSS** = สี/ธีม ของทีวี (ความสวยงาม)
> - **JavaScript + DOM** = รีโมท 🎮 (ควบคุม เปลี่ยนช่อง เพิ่มเสียง!)
> 
> ไม่มี DOM → JS ทำอะไรกับหน้าเว็บไม่ได้เลย!

---

## 1. DOM คืออะไร? (What is the DOM?) 🤔

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction):

**DOM (Document Object Model)** คือ **"ตัวแทน" ของ HTML** ในรูปแบบ **Object Tree** ที่ JavaScript สามารถอ่านและแก้ไขได้

### HTML → DOM Tree:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1 id="title">Hello</h1>
    <p class="info">Welcome!</p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </body>
</html>
```

### DOM Tree (ที่ JS เห็น):

```
                    document
                       │
                      html
                    /      \
                head        body
                 │        /   |   \
               title    h1    p    ul
                 │       │    │   / \
             "My Page" "Hello" "Welcome!" li  li
                                          │    │
                                      "Item 1" "Item 2"
```

### 📊 Key Concepts

| คำศัพท์ | ความหมาย | ตัวอย่าง |
|:--------|:---------|:---------|
| **Document** | "เอกสาร" ทั้งหน้า (root ของ Tree) | `document` |
| **Element** | HTML Tag ที่กลายเป็น Object | `<h1>`, `<p>`, `<div>` |
| **Node** | ทุกจุดใน Tree (Element, Text, Comment) | `"Hello"` (Text Node) |
| **Parent** | โหนดแม่ (ชั้นบน) | `<body>` เป็น Parent ของ `<h1>` |
| **Child** | โหนดลูก (ชั้นล่าง) | `<h1>` เป็น Child ของ `<body>` |
| **Sibling** | โหนดพี่น้อง (ชั้นเดียวกัน) | `<h1>` กับ `<p>` เป็น Siblings |

### 🧠 Challenge: DOM Tree Drawing
จาก HTML นี้ ลองวาด DOM Tree ดูครับ:
```html
<div>
  <h2>Title</h2>
  <p>Paragraph</p>
</div>
```

::: details ✨ ดูเฉลย
```
    div
   /   \
  h2    p
  │     │
"Title" "Paragraph"
```
:::

---

## 2. Selecting Elements (หยิบ Element มาใช้) 🎯

ก่อนจะแก้ไขอะไรได้ ต้อง **"หยิบ" Element ขึ้นมาก่อน** — เหมือนต้องจับรีโมทก่อนถึงจะเปลี่ยนช่องได้!

### วิธีที่ 1: `getElementById()` — หาด้วย ID

```javascript
// HTML: <h1 id="title">Hello</h1>

const title = document.getElementById("title");
console.log(title);           // <h1 id="title">Hello</h1>
console.log(title.textContent); // "Hello"
```

### วิธีที่ 2: `querySelector()` — ⭐ หาด้วย CSS Selector (แนะนำ!)

```javascript
// ใช้ CSS Selector ได้เลย!
const title = document.querySelector("#title");       // ID (#)
const info = document.querySelector(".info");          // Class (.)
const firstLi = document.querySelector("li");          // Tag (ได้ตัวแรก)
const nested = document.querySelector("ul > li:first-child"); // Nested!

console.log(title.textContent);  // "Hello"
console.log(info.textContent);   // "Welcome!"
```

### วิธีที่ 3: `querySelectorAll()` — หาทุกตัวที่ match

```javascript
// ได้ NodeList (คล้าย Array แต่ไม่ใช่ Array ทุกประการ)
const allLi = document.querySelectorAll("li");
console.log(allLi.length); // 2

// วน Loop ได้!
allLi.forEach((li, index) => {
    console.log(`Item ${index}: ${li.textContent}`);
});
// Item 0: Item 1
// Item 1: Item 2
```

### 📊 Selection Methods Comparison

| Method | Syntax | ได้ | หาด้วย | ใช้บ่อย |
|:-------|:-------|:----|:-------|:--------|
| `getElementById()` | `document.getElementById("id")` | **1 Element** | ID | ⭐⭐ |
| `querySelector()` | `document.querySelector(".class")` | **1 Element** (ตัวแรก) | CSS Selector | ⭐⭐⭐ |
| `querySelectorAll()` | `document.querySelectorAll("li")` | **NodeList** (ทุกตัว) | CSS Selector | ⭐⭐⭐ |
| `getElementsByClassName()` | `document.getElementsByClassName("info")` | **HTMLCollection** | Class | ⭐ |
| `getElementsByTagName()` | `document.getElementsByTagName("li")` | **HTMLCollection** | Tag | ⭐ |

> **⭐ Best Practice:** ใช้ `querySelector()` / `querySelectorAll()` เป็นหลัก — ยืดหยุ่นที่สุดเพราะรับ CSS Selector ได้!

### 🧠 Challenge: Select the Element
HTML:
```html
<div class="card">
  <h2 id="card-title">Profile</h2>
  <p class="card-text">Hello World</p>
</div>
```

จงเขียน JS เพื่อหยิบ `<p class="card-text">` ขึ้นมา (ใช้ได้ 2 วิธี):

::: details ✨ ดูเฉลย
```javascript
// วิธี 1: querySelector with class
const text = document.querySelector(".card-text");

// วิธี 2: querySelector with nested selector
const text2 = document.querySelector(".card > .card-text");

console.log(text.textContent);  // "Hello World"
```
:::

---

## 3. Reading & Changing Content (อ่าน/เปลี่ยนเนื้อหา) ✏️

### textContent vs innerHTML vs innerText:

```javascript
// HTML: <p id="demo">Hello <strong>World</strong></p>

const demo = document.querySelector("#demo");

// textContent — ได้ข้อความ "ดิบๆ" ทั้งหมด (เร็ว ปลอดภัย!)
console.log(demo.textContent);  // "Hello World"

// innerText — ได้ข้อความที่ "มองเห็น" บนจอ (ช้ากว่า)
console.log(demo.innerText);    // "Hello World"

// innerHTML — ได้ HTML ทั้งก้อน (⚠️ ระวัง XSS!)
console.log(demo.innerHTML);    // "Hello <strong>World</strong>"
```

### 📊 textContent vs innerHTML vs innerText

| Property | ได้อะไร | มี HTML Tags | ปลอดภัย | ความเร็ว |
|:---------|:-------|:-----------|:--------|:---------|
| `textContent` | ข้อความทั้งหมด | ❌ ตัด tags ออก | ✅ ปลอดภัย | ⚡ เร็ว |
| `innerText` | ข้อความที่มองเห็น | ❌ ตัด tags ออก | ✅ ปลอดภัย | 🐢 ช้ากว่า |
| `innerHTML` | HTML ทั้งก้อน | ✅ รักษา tags | ⚠️ **XSS Risk!** | ⚡ เร็ว |

### เปลี่ยนเนื้อหา:

```javascript
const title = document.querySelector("#title");

// เปลี่ยนข้อความ
title.textContent = "สวัสดี JavaScript!";

// เปลี่ยน HTML (⚠️ ระวัง!)
title.innerHTML = "สวัสดี <em>JavaScript</em>!";

// ⚠️ อันตราย! ห้ามใส่ข้อมูลจากผู้ใช้ลง innerHTML!
// title.innerHTML = userInput; // ❌ XSS Attack!
// title.textContent = userInput; // ✅ ปลอดภัย!
```

---

## 4. Attributes & Properties (คุณสมบัติของ Element) 🏷️

### อ่านและแก้ไข Attributes:

```javascript
// HTML: <img id="avatar" src="photo.jpg" alt="My Photo" width="100">
const img = document.querySelector("#avatar");

// ✅ getAttribute() / setAttribute()
console.log(img.getAttribute("src"));    // "photo.jpg"
img.setAttribute("src", "new-photo.jpg"); // เปลี่ยนรูป!
img.setAttribute("alt", "New Photo");

// ✅ Direct Property Access (บาง Attributes)
console.log(img.src);     // "http://localhost/new-photo.jpg" (Full URL!)
console.log(img.alt);     // "New Photo"
img.width = 200;          // เปลี่ยนขนาด

// ✅ Check if attribute exists
console.log(img.hasAttribute("alt"));  // true

// ✅ Remove attribute
img.removeAttribute("width");
```

### Data Attributes (Custom Data — `data-*`):

```javascript
// HTML: <div id="user" data-user-id="123" data-role="admin">
const userDiv = document.querySelector("#user");

// ⭐ dataset — เข้าถึง data-* attributes ง่ายๆ!
console.log(userDiv.dataset.userId);  // "123" (data-user-id → userId)
console.log(userDiv.dataset.role);    // "admin"

// แก้ไขได้!
userDiv.dataset.role = "moderator";
// → HTML จะกลายเป็น: data-role="moderator"
```

> **`data-*` Attributes** ใช้เก็บข้อมูลเพิ่มเติมใน HTML — สะดวกมากสำหรับส่งข้อมูลจาก HTML ไปให้ JS!

---

## 5. Styling with JavaScript (แต่ง CSS ด้วย JS) 🎨

### วิธีที่ 1: `.style` Property — เปลี่ยนทีละอัน (Inline Style)

```javascript
const box = document.querySelector("#box");

// camelCase! (ไม่ใช่ kebab-case เหมือน CSS)
box.style.backgroundColor = "navy";     // background-color → backgroundColor
box.style.color = "white";
box.style.padding = "20px";
box.style.borderRadius = "10px";        // border-radius → borderRadius
box.style.fontSize = "1.5rem";          // font-size → fontSize
```

### 📊 CSS Property → JS style Property

| CSS | JavaScript `.style` |
|:----|:-------------------|
| `background-color` | `backgroundColor` |
| `font-size` | `fontSize` |
| `border-radius` | `borderRadius` |
| `z-index` | `zIndex` |
| `margin-top` | `marginTop` |
| `text-align` | `textAlign` |

> **กฎ:** CSS ใช้ `kebab-case` → JS ใช้ `camelCase`

### วิธีที่ 2: `.classList` — ⭐ เพิ่ม/ลบ CSS Class (แนะนำ!)

```javascript
const card = document.querySelector(".card");

// เพิ่ม Class
card.classList.add("active");
card.classList.add("shadow", "rounded");  // เพิ่มหลาย Class ได้!

// ลบ Class
card.classList.remove("active");

// สลับ (Toggle) — มีก็ลบ ไม่มีก็เพิ่ม
card.classList.toggle("dark-mode");

// เช็คว่ามี Class ไหม
console.log(card.classList.contains("shadow")); // true

// ดูทุก Class
console.log(card.classList); // DOMTokenList ["card", "shadow", "rounded"]
```

### 📊 classList Methods

| Method | ใช้ทำอะไร | ตัวอย่าง |
|:-------|:---------|:---------|
| `add()` | เพิ่ม Class | `el.classList.add("active")` |
| `remove()` | ลบ Class | `el.classList.remove("active")` |
| `toggle()` | สลับ (มี→ลบ, ไม่มี→เพิ่ม) | `el.classList.toggle("dark")` |
| `contains()` | เช็คว่ามี Class ไหม | `el.classList.contains("active")` |
| `replace()` | เปลี่ยน Class | `el.classList.replace("old", "new")` |

> **⭐ Best Practice:** ใช้ `classList` แทน `.style` เมื่อทำได้ — เพราะแยก Logic (JS) ออกจาก Presentation (CSS) ได้สะอาดกว่า!

### 🧠 Challenge: Dark Mode Toggle
เขียน JS เพื่อสลับ Class `"dark-mode"` บน `<body>`:

::: details ✨ ดูเฉลย
```javascript
document.body.classList.toggle("dark-mode");
// กดครั้งแรก → เพิ่ม dark-mode
// กดครั้งที่สอง → ลบ dark-mode
```
:::

---

## 6. Traversing the DOM (เดินบน Tree) 🚶

หลังจากหยิบ Element ขึ้นมาแล้ว เรายังเดินไปหา **พ่อแม่, ลูก, พี่น้อง** ได้:

```javascript
// HTML:
// <ul id="menu">
//   <li>Home</li>
//   <li class="active">About</li>
//   <li>Contact</li>
// </ul>

const menu = document.querySelector("#menu");

// ⬆️ Parent
console.log(menu.parentElement);          // <body>...</body>

// ⬇️ Children
console.log(menu.children);              // HTMLCollection [li, li, li]
console.log(menu.children.length);       // 3
console.log(menu.firstElementChild);     // <li>Home</li>
console.log(menu.lastElementChild);      // <li>Contact</li>

// ↔️ Siblings
const active = document.querySelector(".active");
console.log(active.previousElementSibling); // <li>Home</li>
console.log(active.nextElementSibling);     // <li>Contact</li>
```

### 📊 Traversal Properties

| Direction | Property | ข้าม Text Nodes | ตัวอย่าง |
|:----------|:---------|:----------------|:---------|
| ⬆️ Parent | `parentElement` | ✅ | `el.parentElement` |
| ⬇️ First Child | `firstElementChild` | ✅ | `el.firstElementChild` |
| ⬇️ Last Child | `lastElementChild` | ✅ | `el.lastElementChild` |
| ⬇️ All Children | `children` | ✅ | `el.children` |
| ↔️ Previous | `previousElementSibling` | ✅ | `el.previousElementSibling` |
| ↔️ Next | `nextElementSibling` | ✅ | `el.nextElementSibling` |

> ⚠️ มี `parentNode`, `firstChild`, `nextSibling` ด้วย — แต่มันได้ Text Nodes ด้วย (ช่องว่าง, newline) ซึ่งมักไม่ต้องการ ใช้ `*Element*` versions แทน!

---

## 7. Challenges 🏆

### 🎯 Challenge 1: DOM Detective
ให้ HTML:
```html
<main>
  <section id="hero">
    <h1>Welcome</h1>
    <p>Read more below</p>
  </section>
</main>
```

เขียน JS เพื่อ:
1. เปลี่ยนข้อความ `<h1>` เป็น `"Hello, World!"`
2. เปลี่ยนสีพื้นหลังของ `<section>` เป็น `"#f0f0f0"`
3. เพิ่ม Class `"highlighted"` ให้ `<p>`

::: details ✨ ดูเฉลย
```javascript
// 1. เปลี่ยนข้อความ
document.querySelector("#hero h1").textContent = "Hello, World!";

// 2. เปลี่ยนสีพื้นหลัง
document.querySelector("#hero").style.backgroundColor = "#f0f0f0";

// 3. เพิ่ม Class
document.querySelector("#hero p").classList.add("highlighted");
```
:::

### 🎯 Challenge 2: Attribute Master
```html
<a id="link" href="https://google.com" target="_blank">Google</a>
```

เขียน JS เพื่อ:
1. อ่านค่า `href` ของลิงค์
2. เปลี่ยน `href` เป็น `"https://mdn.dev"`
3. เปลี่ยนข้อความจาก "Google" เป็น "MDN"

::: details ✨ ดูเฉลย
```javascript
const link = document.querySelector("#link");

// 1. อ่าน href
console.log(link.getAttribute("href")); // "https://google.com"

// 2. เปลี่ยน href
link.setAttribute("href", "https://mdn.dev");

// 3. เปลี่ยนข้อความ
link.textContent = "MDN";
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **DOM (Document Object Model):** ตัวแทนของ HTML ในรูปแบบ Object Tree ที่ JS อ่าน/แก้ไขได้
> *   **Document:** Object หลักที่เป็น Entry Point ของ DOM (`document`)
> *   **Element:** HTML Tag ที่ถูกแปลงเป็น Object ใน DOM
> *   **Node:** หน่วยย่อยใน DOM Tree (Element, Text, Comment ล้วนเป็น Node)
> *   **querySelector():** Method ที่ค้นหา Element ด้วย CSS Selector (ได้ตัวแรก)
> *   **querySelectorAll():** Method ที่ค้นหาทุก Element ที่ match CSS Selector
> *   **NodeList:** รายการของ Nodes ที่ได้จาก `querySelectorAll()` (วน forEach ได้)
> *   **textContent:** Property สำหรับอ่าน/แก้ข้อความใน Element (ปลอดภัย)
> *   **innerHTML:** Property สำหรับอ่าน/แก้ HTML ภายใน Element (⚠️ XSS Risk)
> *   **classList:** Property สำหรับจัดการ CSS Classes (add, remove, toggle)
> *   **dataset:** Property สำหรับเข้าถึง `data-*` Attributes
> *   **Traversal:** การเดินบน DOM Tree เพื่อหา Parent, Child, Sibling

---
👉 **[ไปต่อ: 06-2 - DOM Events (การจัดการเหตุการณ์)](/06-02-dom-events)**
