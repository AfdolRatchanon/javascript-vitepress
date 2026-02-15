# 07-3: Async/Await & Fetch API (วิธีเขียน Async อย่างมืออาชีพ) 🚀

> **"Async/Await makes asynchronous code look and behave like synchronous code."**
> — *MDN Web Docs*

`async/await` เป็น **Syntax Sugar** ของ Promise ครับ — มันทำให้โค้ด Async **อ่านง่ายเหมือน Sync** โดยไม่ต้องใช้ `.then()` ซ้อนๆ

> **💡 Analogy (เปรียบเทียบ):**
> ถ้า Promise เหมือน **"ส่ง SMS แล้วรอตอบ"** 📱
> `async/await` เหมือน **"โทรคุยสด แต่ไม่ Block สาย"** 📞
> — เขียนได้เป็นธรรมชาติมากกว่า ไม่ต้องต่อ chain ยาวๆ

---

## 1. async/await Basics 🎯

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function):

### กฎพื้นฐาน:
- **`async`** วางหน้า Function → Function นั้น **return Promise อัตโนมัติ**
- **`await`** วางหน้า Promise → **"หยุดรอ"** จนกว่า Promise จะ settle
- **`await` ใช้ได้เฉพาะใน `async` Function เท่านั้น!**

```javascript
// ❌ เดิม: Promise + .then()
function getUser() {
    return fetch("/api/user")
        .then(res => res.json())
        .then(data => {
            console.log(data);
            return data;
        });
}

// ✅ ใหม่: async/await (อ่านเหมือน Sync!)
async function getUser() {
    const res = await fetch("/api/user");  // รอ fetch เสร็จ
    const data = await res.json();          // รอแปลง JSON เสร็จ
    console.log(data);
    return data;
}
```

### async Function Return:

```javascript
// async function return Promise อัตโนมัติ!
async function greet() {
    return "สวัสดี!"; // เหมือน Promise.resolve("สวัสดี!")
}

greet().then(msg => console.log(msg)); // "สวัสดี!"
```

---

## 2. Error Handling with try/catch ⚠️

```javascript
// ❌ .then/.catch
fetch("/api/data")
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));

// ✅ async/await + try/catch (อ่านง่ายกว่า!)
async function fetchData() {
    try {
        const res = await fetch("/api/data");

        // เช็ค HTTP status
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ ได้ข้อมูล:", data);
        return data;

    } catch (error) {
        console.error("❌ Error:", error.message);
        // แสดง UI แจ้งผู้ใช้
    } finally {
        console.log("🏁 เสร็จแล้ว");
        // ซ่อน Loading spinner
    }
}
```

### 📊 .then/.catch vs async/await

| | `.then()` / `.catch()` | `async/await` |
|:--|:----------------------|:-------------|
| **อ่านง่าย** | ⭐⭐ | ⭐⭐⭐ |
| **จับ Error** | `.catch()` | `try/catch` |
| **Debug** | ยากกว่า | ง่ายกว่า (Stack Trace ดี) |
| **Flow** | Chain based | Linear (เหมือน Sync!) |
| **แนะนำ** | ใช้ได้ | ⭐ **ใช้วิธีนี้!** |

---

## 3. Fetch API — ดึงข้อมูลจาก Server 🌐

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

`fetch()` เป็น Built-in Function สำหรับเรียก HTTP Request:

### GET Request (อ่านข้อมูล):

```javascript
async function getUsers() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const users = await res.json();
        console.log(users);
        return users;

    } catch (error) {
        console.error("Failed to fetch:", error.message);
    }
}

getUsers();
```

### POST Request (ส่งข้อมูล):

```javascript
async function createUser(name, email) {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const newUser = await res.json();
        console.log("✅ สร้างสำเร็จ:", newUser);
        return newUser;

    } catch (error) {
        console.error("❌ Failed:", error.message);
    }
}

createUser("Dolar", "dolar@example.com");
```

### 📊 HTTP Methods Reference

| Method | ใช้ทำอะไร | Body | ตัวอย่าง |
|:-------|:---------|:----:|:---------|
| `GET` | อ่านข้อมูล | ❌ | ดึงรายชื่อ users |
| `POST` | สร้างข้อมูลใหม่ | ✅ | สมัครสมาชิก |
| `PUT` | แก้ไขข้อมูลทั้งหมด | ✅ | อัปเดต profile |
| `PATCH` | แก้ไขบางส่วน | ✅ | แก้ชื่อ |
| `DELETE` | ลบข้อมูล | ❌ | ลบ user |

### Response Methods:

```javascript
const res = await fetch(url);

// แปลงเป็น JSON (ใช้บ่อยสุด!)
const data = await res.json();

// แปลงเป็น Text
const text = await res.text();

// แปลงเป็น Blob (รูปภาพ, ไฟล์)
const blob = await res.blob();

// ข้อมูลของ Response:
console.log(res.status);     // 200
console.log(res.ok);         // true (status 200-299)
console.log(res.statusText); // "OK"
console.log(res.headers);    // Headers object
```

---

## 4. Parallel vs Sequential Await ⚡

### ❌ Sequential (ช้า — รอทีละอัน):

```javascript
async function getAll() {
    const users = await fetch("/api/users");     // รอ 1 วิ
    const posts = await fetch("/api/posts");     // รอ 1 วิ อีก
    const comments = await fetch("/api/comments"); // รอ 1 วิ อีก
    // รวม: ~3 วินาที! 🐢
}
```

### ✅ Parallel (เร็ว — เริ่มพร้อมกัน!):

```javascript
async function getAll() {
    // เริ่มทุกอันพร้อมกัน!
    const [users, posts, comments] = await Promise.all([
        fetch("/api/users").then(r => r.json()),
        fetch("/api/posts").then(r => r.json()),
        fetch("/api/comments").then(r => r.json()),
    ]);
    // รวม: ~1 วินาที! ⚡ (เร็ว 3 เท่า)
    
    console.log(users, posts, comments);
}
```

### 📊 Sequential vs Parallel

| | Sequential | Parallel (`Promise.all`) |
|:--|:----------|:------------------------|
| **เวลา** | ⏳ ผลรวมของทุกงาน | ⚡ ตามงานที่ช้าที่สุด |
| **3 งานใช้ 1 วิ** | ~3 วินาที | ~1 วินาที |
| **ใช้เมื่อ** | งานต้องต่อกัน (B ต้องใช้ผล A) | งานเป็นอิสระจากกัน |

---

## 5. Real-World Patterns 🛠️

### Loading State Pattern:

```javascript
async function loadUserProfile(userId) {
    const loader = document.querySelector("#loader");
    const content = document.querySelector("#content");
    const errorMsg = document.querySelector("#error");

    // แสดง Loading
    loader.style.display = "block";
    content.style.display = "none";
    errorMsg.style.display = "none";

    try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) throw new Error("User not found");

        const user = await res.json();

        // แสดงข้อมูล
        content.innerHTML = `
            <h2>${user.name}</h2>
            <p>${user.email}</p>
        `;
        content.style.display = "block";

    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";

    } finally {
        loader.style.display = "none"; // ซ่อน Loading เสมอ
    }
}
```

### Retry Pattern (ลองใหม่ถ้า Fail):

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();

        } catch (error) {
            console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);

            if (attempt === maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts`);
            }

            // รอก่อนลองใหม่ (Exponential Backoff)
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
}
```

---

## 6. Async Arrow Functions & IIFE 🏹

```javascript
// ✅ Async Arrow Function
const getUser = async (id) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
};

// ✅ Async IIFE (เรียกทันที — ใช้ใน Script ระดับบนสุด)
(async () => {
    const data = await fetch("/api/data").then(r => r.json());
    console.log(data);
})();

// ✅ Top-Level Await (ES2022 — ใน Module เท่านั้น!)
// const data = await fetch("/api/data").then(r => r.json());
```

---

## 7. Common Mistakes ❌

```javascript
// ❌ ลืม await → ได้ Promise object แทนค่า!
async function bad() {
    const data = fetch("/api/data"); // ไม่มี await!
    console.log(data); // Promise { <pending> } 😱
}

// ✅ แก้: ใส่ await
async function good() {
    const data = await fetch("/api/data");
    console.log(data); // Response object ✅
}

// ❌ ใช้ await นอก async function
// const data = await fetch("/api"); // SyntaxError!

// ❌ ลืม try/catch → Error ไม่ถูกจับ
async function risky() {
    const data = await fetch("/api/broken-url"); // อาจ Error!
    // ถ้า Error → Unhandled Promise Rejection
}

// ✅ แก้:
async function safe() {
    try {
        const data = await fetch("/api/broken-url");
    } catch (error) {
        console.error("Caught:", error);
    }
}
```

---

## 8. Challenges 🏆

## 8. Challenges 🏆

ทดสอบความเข้าใจกับโจทย์ 7 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: Async Conversion
**หัวข้อ:** 1. async/await Basics

**โจทย์:** เปลี่ยน function นี้เป็น `async/await`:
```javascript
function getNum() {
	return Promise.resolve(10);
}
getNum().then(n => console.log(n));
```
::: details ✨ ดูเฉลย
```javascript
async function getNum() {
	return 10;
}
const n = await getNum();
console.log(n);
```
:::

### 🎯 Challenge 2: Safe Fetch
**หัวข้อ:** 2. Error Handling

**โจทย์:** เขียนโครงสร้าง `async function` ที่มีการดักจับ Error ด้วย `try/catch` และมีการทำงานเสมอด้วย `finally`
::: details ✨ ดูเฉลย
```javascript
async function task() {
    try {
        // await ...
    } catch (err) {
        // handle error
    } finally {
        // cleanup (run always)
    }
}
```
:::

### 🎯 Challenge 3: API Call
**หัวข้อ:** 3. Fetch API

**โจทย์:** ใช้ `fetch` ดึงข้อมูลจาก `"https://api.example.com/data"` แล้วแปลงเป็น JSON (เขียนแค่บรรทัดที่ดึงและแปลง)
::: details ✨ ดูเฉลย
```javascript
const res = await fetch("https://api.example.com/data");
const data = await res.json();
```
:::

### 🎯 Challenge 4: Race for Speed
**หัวข้อ:** 4. Parallel Await

**โจทย์:** ถ้ามีฟังก์ชัน `taskA()` และ `taskB()` ที่ใช้เวลา 1 วินาทีเท่ากัน ทำอย่างไรให้ทั้งคู่เสร็จพร้อมกันใน 1 วินาที?
::: details ✨ ดูเฉลย
ใช้ `Promise.all([taskA(), taskB()])` ครับ
:::

### 🎯 Challenge 5: Pattern Recognition
**หัวข้อ:** 5. Practical Patterns

**โจทย์:** Pattern ไหนที่ใช้ลองเรียก API ซ้ำเมื่อเกิด Error? (Retry หรือ Loading State)
::: details ✨ ดูเฉลย
**Retry Pattern** ครับ
:::

### 🎯 Challenge 6: IIFE Magic
**หัวข้อ:** 6. Async Arrow & IIFE

**โจทย์:** เขียน Async IIFE ที่พิมพ์ "Start" ทันที
::: details ✨ ดูเฉลย
```javascript
(async () => {
    console.log("Start");
})();
```
:::

### 🎯 Challenge 7: Bug Spotter
**หัวข้อ:** 7. Common Mistakes

**โจทย์:** โค้ดนี้ผิดตรงไหน? `const data = fetch("/api"); console.log(data);`
::: details ✨ ดูเฉลย
ผิดที่ **ลืม `await`** ครับ! `data` จะเป็น Promise Object ที่ติดสถานะ Pending ไม่ใช่ข้อมูลจริง
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **`async`:** Keyword ที่ทำให้ Function return Promise อัตโนมัติ
> *   **`await`:** Keyword ที่ "หยุดรอ" Promise ให้ settle ก่อนไปต่อ
> *   **Fetch API:** Built-in Function สำหรับเรียก HTTP Request
> *   **`res.json()`:** Method ที่แปลง Response body เป็น JavaScript Object
> *   **`res.ok`:** Boolean ที่บอกว่า HTTP status อยู่ในช่วง 200-299
> *   **HTTP Methods:** วิธีการสื่อสารกับ Server (GET, POST, PUT, DELETE)
> *   **Request Body:** ข้อมูลที่ส่งไปกับ POST/PUT Request (มักเป็น JSON)
> *   **`Content-Type`:** Header ที่บอก Server ว่าข้อมูลที่ส่งเป็นรูปแบบไหน
> *   **Sequential Await:** รอ Promise ทีละตัว (ช้า แต่ต้องใช้เมื่อ B ขึ้นกับ A)
> *   **Parallel Await:** เริ่ม Promise หลายตัวพร้อมกัน ด้วย `Promise.all()` (เร็ว!)
> *   **Retry Pattern:** เทคนิคลองเรียกซ้ำเมื่อ Request ล้มเหลว
> *   **IIFE:** Immediately Invoked Function Expression — เรียกทันที

---
👉 **[ไปทำโปรเจกต์: Project — Weather App](/07-project-weather-app)**
