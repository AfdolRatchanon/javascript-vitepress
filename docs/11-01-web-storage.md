# 11-1: Web Storage (เก็บข้อมูลในเบราว์เซอร์) 💾

> **"localStorage and sessionStorage let you save key/value data in the browser."**
> — *MDN Web Docs*

ก่อนหน้านี้ ทุกครั้งที่ Refresh หน้าเว็บ = **ข้อมูลหายหมด!** ตัวแปรถูก Reset, UI กลับเป็นค่าเริ่มต้น — เหมือนเล่นเกมแล้วไม่มี Save! Web Storage คือ **"ระบบ Save/Load"** ของเว็บไซต์ครับ

> **💡 Analogy (เปรียบเทียบ):**
> - **`localStorage`** เหมือน **"ตู้นิรภัยส่วนตัว"** 🗄️ → ข้อมูลอยู่ถาวรจนกว่าจะลบเอง — ใส่กุญแจล็อค ปิดธนาคาร กลับมาวันหลังก็ยังอยู่!
> - **`sessionStorage`** เหมือน **"กระดานไวท์บอร์ดห้องประชุม"** 📋 → ใช้ระหว่างประชุม (Session) พอเลิกประชุม → ลบทิ้งหมด!
> - ทั้งคู่เก็บข้อมูลแบบ **Key-Value** (เหมือนพจนานุกรม: คำ → ความหมาย)

---

## 1. localStorage — เก็บถาวร 🏦

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage): `localStorage` เก็บข้อมูลแบบ Key-Value **ที่ไม่มีวันหมดอายุ** — ข้อมูลอยู่ได้แม้ปิดเบราว์เซอร์ ปิดคอม เปิดมาใหม่ก็ยังอยู่!

### API Methods ที่ต้องรู้:

```javascript
// ✅ เก็บข้อมูล — setItem(key, value)
localStorage.setItem("username", "Dolar");
localStorage.setItem("theme", "dark");
localStorage.setItem("fontSize", "18");

// ✅ อ่านข้อมูล — getItem(key)
const name = localStorage.getItem("username"); // "Dolar"
const missing = localStorage.getItem("xxx");    // null (ถ้า key ไม่มี → return null!)

// ✅ ลบข้อมูลเฉพาะ Key — removeItem(key)
localStorage.removeItem("theme");
// ตอนนี้เหลือ "username" กับ "fontSize"

// ✅ ลบข้อมูลทั้งหมด — clear()
localStorage.clear();
// ตอนนี้ว่างเปล่า!

// ✅ ดูจำนวน Key — length
console.log(localStorage.length); // 0 (หลังจาก clear)
```

> ⚡ **สังเกต:** ทุก Method อ่านเขียนง่ายมาก — แค่ `getItem` กับ `setItem` เท่านั้น!

### ที่เก็บอยู่ที่ไหน?
ข้อมูลถูกเก็บในเบราว์เซอร์ **แยกตาม Domain** — `example.com` จะเห็นเฉพาะข้อมูลของตัวเอง ไม่เห็นของ `google.com`

คุณสามารถดูข้อมูลได้ใน **DevTools → Application → Local Storage**

---

## 2. ⚠️ เก็บได้เฉพาะ String! (สำคัญมาก!)

นี่คือ **หลุมพราง** ที่มือใหม่ติดบ่อยที่สุด:

```javascript
// ❌ ถ้าเก็บ Object/Array ตรงๆ → จะได้ "[object Object]"!
const user = { name: "Dolar", age: 25 };
localStorage.setItem("user", user);
console.log(localStorage.getItem("user")); // "[object Object]" — ข้อมูลหาย! 💀

// ❌ Array ก็โดนเหมือนกัน!
localStorage.setItem("scores", [95, 88, 77]);
console.log(localStorage.getItem("scores")); // "95,88,77" (แค่ String ไม่ใช่ Array จริง)
```

### วิธีแก้ — ใช้ JSON!

**`JSON.stringify()`** แปลง Object → String ก่อนเก็บ, **`JSON.parse()`** แปลง String → Object ตอนอ่าน:

```javascript
const user = { name: "Dolar", age: 25, scores: [95, 88, 77] };

// 💾 บันทึก: Object → JSON String → localStorage
localStorage.setItem("user", JSON.stringify(user));
// เก็บเป็น: '{"name":"Dolar","age":25,"scores":[95,88,77]}'

// 📖 อ่าน: localStorage → JSON String → Object
const saved = JSON.parse(localStorage.getItem("user"));
console.log(saved.name);     // "Dolar" ✅
console.log(saved.scores);   // [95, 88, 77] ✅
console.log(saved.scores[0]); // 95 ✅
```

> 💡 **จำให้ขึ้นใจ:** เก็บ = `JSON.stringify()`, อ่าน = `JSON.parse()` — คู่กันเสมอ!

### ⚠️ ระวัง: getItem return null!

```javascript
// ถ้า Key ไม่มี → JSON.parse(null) = null (ไม่ Error)
// แต่ถ้า Value ไม่ใช่ JSON → JSON.parse("bla") = ❌ SyntaxError!

const raw = localStorage.getItem("nonExistentKey");
console.log(raw); // null

// ✅ Safe Pattern: เช็คก่อน Parse
const safe = raw ? JSON.parse(raw) : null;
```

---

## 3. sessionStorage — เก็บชั่วคราว ⏱️

`sessionStorage` **ใช้ API เหมือน localStorage ทุกประการ** (setItem, getItem, removeItem, clear) แต่มีข้อแตกต่างสำคัญ:

```javascript
// ใช้ API เดียวกันเป๊ะ!
sessionStorage.setItem("token", "abc123");
const token = sessionStorage.getItem("token"); // "abc123"

// ⚠️ แต่! ปิดแท็บ → ข้อมูลหายทันที!
// เปิดแท็บใหม่ → getItem return null
```

### เมื่อไหร่ใช้ sessionStorage?

- **Token ชั่วคราว** — ล็อกอินแล้วเก็บ Token ไว้แค่ Session นี้
- **ข้อมูลฟอร์มชั่วคราว** — กรอกฟอร์มไปครึ่งทาง ถ้า Refresh ยังอยู่ (แต่ปิดแท็บหาย)
- **สถานะหน้าเว็บชั่วคราว** — Scroll Position, Tab ที่เปิดอยู่

---

## 4. 📊 localStorage vs sessionStorage

| คุณสมบัติ | `localStorage` | `sessionStorage` |
|:---------|:--------------|:----------------|
| **หมดอายุ** | ❌ ไม่หมด (อยู่ถาวร) | ✅ หมดเมื่อ**ปิดแท็บ** |
| **ขนาด** | ~5-10 MB | ~5-10 MB |
| **แชร์ข้าม Tab** | ✅ แชร์ได้ (Domain เดียวกัน) | ❌ แต่ละ Tab **แยกกัน** |
| **แชร์ข้าม Window** | ✅ | ❌ |
| **Refresh หน้า** | ✅ ยังอยู่ | ✅ ยังอยู่ |
| **ปิดแท็บ** | ✅ ยังอยู่ | ❌ หาย! |
| **ปิดเบราว์เซอร์** | ✅ ยังอยู่ | ❌ หาย! |
| **ใช้เมื่อ** | Settings, Theme, Cart, Save Progress | Form Temp Data, Auth Token, Wizard Steps |

> 💡 **Rule of Thumb:** ถ้าอยากให้ผู้ใช้กลับมาเจอข้อมูลเหมือนเดิม → **localStorage**, ถ้าแค่ใช้ชั่วคราวระหว่าง Session → **sessionStorage**

---

## 5. Storage Helper Functions 🛠️

ในโปรเจกต์จริง เราไม่ค่อยเรียก `localStorage` ตรงๆ — เราสร้าง **Helper Functions** ที่จัดการ JSON และ Error ให้อัตโนมัติ:

```javascript
// ========== storage-helper.js ==========

// ✅ บันทึก — รองรับ Object/Array อัตโนมัติ!
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        // Storage เต็ม! (มีขนาดจำกัด ~5-10MB)
        console.error("❌ Storage full!", error.message);
        return false;
    }
}

// ✅ อ่าน — พร้อม Default Value ถ้ายังไม่มี!
function loadData(key, defaultValue = null) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
        // JSON.parse ล้มเหลว (ข้อมูลเสีย)
        console.warn("⚠️ Invalid data, using default");
        return defaultValue;
    }
}

// ✅ ลบ
function removeData(key) {
    localStorage.removeItem(key);
}

// ✅ ลบทั้งหมด
function clearAllData() {
    localStorage.clear();
}
```

### ตัวอย่างการใช้งาน:

```javascript
// บันทึก Settings
saveData("settings", {
    theme: "dark",
    fontSize: 18,
    language: "th",
    notifications: true,
});

// อ่าน Settings (ถ้ายังไม่มี → ใช้ค่า Default!)
const settings = loadData("settings", {
    theme: "light",
    fontSize: 16,
    language: "en",
    notifications: false,
});

console.log(settings.theme);    // "dark" (ถ้าเคยบันทึก)
console.log(settings.fontSize); // 18
```

> 💡 **ทำไมต้อง try/catch?** เพราะ localStorage อาจ **เต็มได้** (QuotaExceededError) หรือถูก **ปิดใช้งาน** ใน Private/Incognito Mode ในบางเบราว์เซอร์

---

## 6. Real-World Use Cases 🌍

### Dark Mode Persistence:

```javascript
// ตอนโหลดหน้า — อ่าน Theme ที่บันทึกไว้
const savedTheme = loadData("theme", "light");
document.documentElement.setAttribute("data-theme", savedTheme);

// ตอนคลิกปุ่มสลับ Theme
function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    saveData("theme", next); // 💾 บันทึกเพื่อให้ Refresh แล้วยังอยู่!
}
```

### Shopping Cart:

```javascript
// เพิ่มสินค้าลง Cart
function addToCart(product) {
    const cart = loadData("cart", []);
    cart.push(product);
    saveData("cart", cart);
}

// ดู Cart
function getCart() {
    return loadData("cart", []);
}

// ล้าง Cart
function clearCart() {
    removeData("cart");
}

// ใช้งาน:
addToCart({ id: 1, name: "iPhone", price: 45000 });
addToCart({ id: 2, name: "AirPods", price: 7990 });
console.log(getCart()); // [{id:1,...}, {id:2,...}]
```

### Form Auto-Save (Draft):

```javascript
const form = document.querySelector("#myForm");
const input = document.querySelector("#message");

// ตอนพิมพ์ → Auto-Save ทุกครั้ง
input.addEventListener("input", () => {
    saveData("formDraft", { message: input.value, savedAt: new Date().toISOString() });
});

// ตอนโหลดหน้า → Restore Draft
const draft = loadData("formDraft");
if (draft) {
    input.value = draft.message;
    console.log(`📝 Draft restored from ${draft.savedAt}`);
}

// ตอน Submit → ลบ Draft
form.addEventListener("submit", () => removeData("formDraft"));
```

---

## 7. Storage Event (ฟังการเปลี่ยนแปลงข้าม Tab!) 📡

เมื่อ **Tab อื่น** แก้ไข localStorage → Tab ปัจจุบันจะได้รับ Event:

```javascript
// ⭐ ใช้งานได้เฉพาะ localStorage เท่านั้น (ไม่ใช่ sessionStorage)
window.addEventListener("storage", (event) => {
    console.log("Key:", event.key);       // key ที่เปลี่ยน
    console.log("Old:", event.oldValue);  // ค่าเดิม
    console.log("New:", event.newValue);  // ค่าใหม่
    console.log("URL:", event.url);       // URL ของ Tab ที่แก้

    // ตัวอย่าง: ถ้า Theme เปลี่ยน → อัปเดต UI ทันที
    if (event.key === "theme") {
        document.documentElement.setAttribute("data-theme", event.newValue);
    }
});
```

> 💡 **Use Case จริง:** ผู้ใช้เปิด 2 Tab — เปลี่ยน Theme ใน Tab 1 → Tab 2 **อัปเดตตามทันที** โดยไม่ต้อง Refresh!

---

## 8. Challenges 🏆

### 🎯 Challenge 1: Visit Counter
สร้างระบบนับจำนวนครั้งที่เข้าเว็บ พร้อมแสดงทั้งครั้งปัจจุบันและครั้งล่าสุด:

::: details ✨ ดูเฉลย
```javascript
let visits = parseInt(localStorage.getItem("visits") || "0");
visits++;
localStorage.setItem("visits", visits.toString());
localStorage.setItem("lastVisit", new Date().toISOString());

const lastVisit = localStorage.getItem("lastVisit");
console.log(`🎉 คุณเข้าเว็บครั้งที่ ${visits}`);
console.log(`📅 เข้าล่าสุด: ${lastVisit ? new Date(lastVisit).toLocaleString("th-TH") : "ครั้งแรก!"}`);
```
:::

### 🎯 Challenge 2: Theme Persistence
สร้างปุ่มสลับ Dark/Light mode ที่จำ Theme ได้:

::: details ✨ ดูเฉลย
```javascript
// ตอนโหลดหน้า
const savedTheme = localStorage.getItem("theme") || "light";
document.body.classList.add(savedTheme);

function toggleTheme() {
    const current = document.body.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";

    document.body.classList.remove(current);
    document.body.classList.add(next);
    localStorage.setItem("theme", next);

    console.log(`🎨 Theme: ${next}`);
}
```
:::

### 🎯 Challenge 3: High Score Tracker
สร้างระบบเก็บ Top 5 คะแนน:

::: details ✨ ดูเฉลย
```javascript
function addScore(name, score) {
    const scores = JSON.parse(localStorage.getItem("highScores") || "[]");
    scores.push({ name, score, date: new Date().toISOString() });
    scores.sort((a, b) => b.score - a.score); // เรียงจากมากไปน้อย
    const top5 = scores.slice(0, 5); // เก็บแค่ Top 5
    localStorage.setItem("highScores", JSON.stringify(top5));
    return top5;
}

function getHighScores() {
    return JSON.parse(localStorage.getItem("highScores") || "[]");
}

addScore("Dolar", 950);
addScore("Somchai", 870);
addScore("Malee", 1020);
console.table(getHighScores());
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **`localStorage`:** เก็บข้อมูลถาวรในเบราว์เซอร์ (ไม่มีวันหมดอายุ)
> *   **`sessionStorage`:** เก็บข้อมูลชั่วคราว (หมดเมื่อปิดแท็บ)
> *   **`setItem(key, value)`:** บันทึกข้อมูลลง Storage
> *   **`getItem(key)`:** อ่านข้อมูลจาก Storage (return `null` ถ้าไม่มี)
> *   **`removeItem(key)`:** ลบข้อมูลเฉพาะ Key
> *   **`clear()`:** ลบข้อมูลทั้งหมดใน Storage
> *   **`JSON.stringify()`:** แปลง Object/Array → JSON String (สำหรับเก็บ)
> *   **`JSON.parse()`:** แปลง JSON String → Object/Array (สำหรับอ่าน)
> *   **QuotaExceededError:** Error ที่เกิดเมื่อ Storage เต็ม (~5-10 MB)
> *   **Storage Event:** Event ที่เกิดเมื่อ Tab อื่นแก้ไข localStorage
> *   **Key-Value Store:** โครงสร้างที่เก็บข้อมูลเป็นคู่ Key → Value

---
👉 **[ไปต่อ: 11-2 - Browser APIs](/11-02-browser-apis)**
