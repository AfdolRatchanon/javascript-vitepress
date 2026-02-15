# 11-1: Web Storage (เก็บข้อมูลในเบราว์เซอร์) 💾

> **"localStorage and sessionStorage let you save key/value data in the browser."**
> — *MDN Web Docs*

ก่อนหน้านี้ เมื่อ Refresh = **ข้อมูลหายหมด!** Web Storage ช่วยให้ข้อมูลอยู่ได้แม้ปิดเบราว์เซอร์!

> **💡 Analogy (เปรียบเทียบ):**
> - **`localStorage`** เหมือน **"โต๊ะทำงาน"** → ข้อมูลอยู่ถาวรจนกว่าจะลบ 🗄️
> - **`sessionStorage`** เหมือน **"กระดานไวท์บอร์ด"** → ลบเมื่อปิดแท็บ 📋

---

## 1. localStorage — เก็บถาวร 🏦

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage):

```javascript
// ✅ เก็บข้อมูล
localStorage.setItem("username", "Dolar");
localStorage.setItem("theme", "dark");

// ✅ อ่านข้อมูล
const name = localStorage.getItem("username"); // "Dolar"
const missing = localStorage.getItem("xxx");    // null (ไม่มี)

// ✅ ลบข้อมูล
localStorage.removeItem("theme");

// ✅ ลบทั้งหมด
localStorage.clear();

// ✅ จำนวน Key
console.log(localStorage.length); // 1
```

### ⚠️ เก็บได้เฉพาะ String!

```javascript
// ❌ ถ้าเก็บ Object/Array ตรงๆ — จะได้ "[object Object]"!
localStorage.setItem("user", { name: "A" }); // ❌

// ✅ แปลงเป็น JSON ก่อน!
const user = { name: "Dolar", age: 25, scores: [95, 88] };

// บันทึก: Object → JSON String
localStorage.setItem("user", JSON.stringify(user));

// อ่าน: JSON String → Object
const saved = JSON.parse(localStorage.getItem("user"));
console.log(saved.name);   // "Dolar"
console.log(saved.scores); // [95, 88]
```

---

## 2. sessionStorage — เก็บชั่วคราว ⏱️

**ใช้งานเหมือน localStorage ทุกประการ** แต่ข้อมูล**หายเมื่อปิดแท็บ:**

```javascript
sessionStorage.setItem("token", "abc123");
const token = sessionStorage.getItem("token"); // "abc123"

// ⚠️ ปิดแท็บ → หายเลย!
```

### 📊 localStorage vs sessionStorage

| | `localStorage` | `sessionStorage` |
|:--|:--------------|:----------------|
| **หมดอายุ** | ❌ ไม่หมด (อยู่ถาวร) | ✅ หมดเมื่อปิดแท็บ |
| **ขนาด** | ~5-10 MB | ~5-10 MB |
| **แชร์ข้าม Tab** | ✅ แชร์ได้ (Domain เดียวกัน) | ❌ แต่ละ Tab แยกกัน |
| **ใช้เมื่อ** | Settings, Theme, Cart | Form Temp Data, Token |

---

## 3. Storage Helper Functions 🛠️

```javascript
// ========== storage-helper.js ==========

// ✅ บันทึก (รองรับ Object!)
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Storage full!", error);
    }
}

// ✅ อ่าน (พร้อม Default Value!)
function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch {
        return defaultValue;
    }
}

// ✅ ลบ
function removeData(key) {
    localStorage.removeItem(key);
}

// ใช้งาน:
saveData("settings", { theme: "dark", fontSize: 18 });

const settings = loadData("settings", { theme: "light", fontSize: 16 });
console.log(settings.theme); // "dark"
```

---

## 4. Challenges 🏆

### 🎯 Challenge 1: Visit Counter
สร้างระบบนับจำนวนครั้งที่เข้าเว็บ (เก็บใน localStorage):

::: details ✨ ดูเฉลย
```javascript
let visits = parseInt(localStorage.getItem("visits") || "0");
visits++;
localStorage.setItem("visits", visits);
console.log(`คุณเข้าเว็บครั้งที่ ${visits}`);
```
:::

### 🎯 Challenge 2: Theme Persistence
บันทึก Dark/Light mode ใน localStorage:

::: details ✨ ดูเฉลย
```javascript
const saved = localStorage.getItem("theme") || "light";
document.body.classList.add(saved);

function toggleTheme() {
    const current = document.body.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.body.classList.replace(current, next);
    localStorage.setItem("theme", next);
}
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **`localStorage`:** เก็บข้อมูลถาวรในเบราว์เซอร์ (ไม่หมดอายุ)
> *   **`sessionStorage`:** เก็บข้อมูลชั่วคราว (หมดเมื่อปิดแท็บ)
> *   **`setItem(key, value)`:** บันทึกข้อมูล
> *   **`getItem(key)`:** อ่านข้อมูล (return `null` ถ้าไม่มี)
> *   **`removeItem(key)`:** ลบข้อมูลเฉพาะ Key
> *   **`clear()`:** ลบข้อมูลทั้งหมด
> *   **`JSON.stringify()`:** Object → JSON String
> *   **`JSON.parse()`:** JSON String → Object

---
👉 **[ไปต่อ: 11-2 - Browser APIs](/11-02-browser-apis)**
