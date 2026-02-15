# 07-2: Promises (สัญญา — แก้ปัญหา Callback Hell) 🤝

> **"A Promise represents a value which may be available now, or in the future, or never."**
> — *MDN Web Docs*

จากบทที่แล้ว เราเห็น **Callback Hell** แล้ว — โค้ดซ้อนลึกจนอ่านไม่ออก! **Promise** คือทางออกจากนรก Callback ครับ!

> **💡 Analogy (เปรียบเทียบ):**
> Promise เหมือน **"ใบรับพัสดุ"** ครับ 📦:
> - คุณสั่งของออนไลน์ → ได้ **ใบติดตามพัสดุ** (Promise)
> - สถานะ **"กำลังจัดส่ง"** → `pending` (รอ)
> - สถานะ **"จัดส่งสำเร็จ"** → `fulfilled` (สำเร็จ!)
> - สถานะ **"จัดส่งล้มเหลว"** → `rejected` (ล้มเหลว!)
>
> ไม่ว่าจะสำเร็จหรือล้มเหลว คุณจะได้รับรู้เสมอ!

---

## 1. Promise คืออะไร? 🤔

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise):

**Promise** = Object ที่แทน **"ค่าในอนาคต"** — อาจจะมีค่าหรือมี Error ก็ได้

### 3 สถานะของ Promise:

```
              ┌──── ✅ Fulfilled (สำเร็จ → .then())
              │
⏳ Pending ──┤
              │
              └──── ❌ Rejected (ล้มเหลว → .catch())

⚠️ เมื่อเปลี่ยนสถานะแล้ว จะเปลี่ยนกลับไม่ได้! (Immutable)
```

### สร้าง Promise:

```javascript
const myPromise = new Promise((resolve, reject) => {
    // ทำงาน Async บางอย่าง...
    const success = true;

    if (success) {
        resolve("✅ สำเร็จ! ได้ข้อมูลแล้ว"); // → fulfilled
    } else {
        reject("❌ ล้มเหลว! หาข้อมูลไม่เจอ");  // → rejected
    }
});

// ใช้งาน Promise:
myPromise
    .then((result) => {
        console.log(result); // "✅ สำเร็จ! ได้ข้อมูลแล้ว"
    })
    .catch((error) => {
        console.log(error);  // ถ้า reject จะเข้าที่นี่
    });
```

### 📊 Promise Vocabulary

| คำศัพท์ | ความหมาย | เมื่อไหร่ |
|:--------|:---------|:---------|
| `pending` | รอผล | ยังไม่เสร็จ |
| `fulfilled` | สำเร็จ | เรียก `resolve()` |
| `rejected` | ล้มเหลว | เรียก `reject()` |
| `settled` | จบแล้ว (สำเร็จหรือล้มเหลว) | ไม่ pending แล้ว |
| `.then()` | ทำเมื่อสำเร็จ | fulfilled |
| `.catch()` | ทำเมื่อล้มเหลว | rejected |
| `.finally()` | ทำเสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว | settled |

---

## 2. `.then()`, `.catch()`, `.finally()` 🔗

```javascript
function fetchUser(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (id > 0) {
                resolve({ id: id, name: "Dolar" });
            } else {
                reject(new Error("User ID ต้องมากกว่า 0!"));
            }
        }, 1000);
    });
}

// ✅ ใช้งาน:
fetchUser(1)
    .then((user) => {
        console.log("ได้ข้อมูล:", user);      // { id: 1, name: "Dolar" }
    })
    .catch((error) => {
        console.error("Error:", error.message); // ถ้า id <= 0
    })
    .finally(() => {
        console.log("🏁 ทำเสร็จแล้ว (ไม่ว่าสำเร็จหรือล้มเหลว)");
    });
```

---

## 3. Promise Chaining (ต่อโซ่ Promise) ⛓️

**ข้อดีที่สุดของ Promise** คือต่อโซ่ได้ — แก้ Callback Hell!

```javascript
// ❌ Callback Hell (ก่อนมี Promise):
getUser(1, function(user) {
    getOrders(user.id, function(orders) {
        getDetails(orders[0].id, function(details) {
            console.log(details); // 😱 ซ้อนลึก!
        });
    });
});

// ✅ Promise Chaining (แบน สวย อ่านง่าย!):
getUser(1)
    .then((user) => getOrders(user.id))
    .then((orders) => getDetails(orders[0].id))
    .then((details) => console.log(details))
    .catch((error) => console.error("Error:", error));
```

### ⭐ กฎของ Chaining:

```javascript
fetchData()
    .then((data) => {
        // ถ้า return ค่าธรรมดา → .then() ถัดไปจะได้ค่านั้น
        return data.name;
    })
    .then((name) => {
        // ถ้า return Promise → .then() ถัดไปจะรอ Promise นั้น
        return fetchMoreData(name);
    })
    .then((moreData) => {
        console.log(moreData);
    })
    .catch((error) => {
        // ⭐ catch จับ Error จากทุก .then() ข้างบน!
        console.error("Something went wrong:", error);
    });
```

> **`.catch()` ตัวเดียวจับ Error ได้ทุกชั้น!** — ไม่ต้อง try/catch ทุกจุด

---

## 4. Promise Static Methods 🧰

### `Promise.all()` — รอทุกอันเสร็จ:

```javascript
const p1 = fetch("/api/user");
const p2 = fetch("/api/posts");
const p3 = fetch("/api/comments");

// รอ 3 อันเสร็จพร้อมกัน → ได้ Array ของผลลัพธ์
Promise.all([p1, p2, p3])
    .then(([user, posts, comments]) => {
        console.log("ทุกอันเสร็จ!", user, posts, comments);
    })
    .catch((error) => {
        console.error("❌ อันใดอันหนึ่งล้มเหลว:", error);
        // ⚠️ ถ้า fail 1 อัน → fail ทั้งหมด!
    });
```

### `Promise.allSettled()` — รอทุกอัน ไม่สนว่าสำเร็จหรือล้มเหลว:

```javascript
Promise.allSettled([p1, p2, p3])
    .then((results) => {
        results.forEach((result) => {
            if (result.status === "fulfilled") {
                console.log("✅", result.value);
            } else {
                console.log("❌", result.reason);
            }
        });
    });
```

### `Promise.race()` — เอาตัวที่เสร็จก่อน:

```javascript
const fast = new Promise(resolve => setTimeout(() => resolve("🐇 Fast!"), 100));
const slow = new Promise(resolve => setTimeout(() => resolve("🐢 Slow!"), 3000));

Promise.race([fast, slow])
    .then((winner) => console.log(winner)); // "🐇 Fast!"
```

### 📊 Promise Static Methods

| Method | ทำอะไร | Fail เมื่อ |
|:-------|:-------|:----------|
| `Promise.all([])` | รอ **ทุก** อันเสร็จ | **อันเดียว** fail → fail ทั้งหมด |
| `Promise.allSettled([])` | รอ **ทุก** อัน (ไม่สน fail) | ไม่ fail เลย |
| `Promise.race([])` | เอาตัว **แรก** ที่เสร็จ | ตัวแรกที่เสร็จ fail |
| `Promise.any([])` | เอาตัว **แรกที่สำเร็จ** | ทุกตัว fail |

---

## 5. Error Handling Best Practices ⚠️

```javascript
// ✅ GOOD: จับ Error ที่ปลาย Chain
fetchUser(1)
    .then(user => fetchOrders(user.id))
    .then(orders => processOrders(orders))
    .catch(error => {
        // จับ Error จากทุก .then() ข้างบน
        console.error("Something failed:", error.message);
        // แสดง UI บอก User
    })
    .finally(() => {
        // ซ่อน Loading spinner
        hideLoader();
    });

// ⚠️ Creating Errors:
const myPromise = new Promise((resolve, reject) => {
    // ใช้ Error object — ไม่ใช่ String!
    reject(new Error("Something went wrong")); // ✅ ได้ Stack Trace
    // reject("Something went wrong");         // ❌ ไม่ได้ Stack Trace
});
```

---

## 6. Challenges 🏆

### 🎯 Challenge 1: Build Your Own Promise
สร้าง Function `wait(ms)` ที่ return Promise ที่ resolve หลังจาก ms มิลลิวินาที:

```javascript
wait(2000).then(() => console.log("2 วินาทีผ่านไปแล้ว!"));
```

::: details ✨ ดูเฉลย
```javascript
function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

wait(2000).then(() => console.log("2 วินาทีผ่านไปแล้ว!"));
```
:::

### 🎯 Challenge 2: Promise Chain
สร้าง Chain ที่:
1. `wait(1000)` → พิมพ์ "Step 1"
2. `wait(1000)` → พิมพ์ "Step 2"
3. `wait(1000)` → พิมพ์ "Done!"

::: details ✨ ดูเฉลย
```javascript
wait(1000)
    .then(() => { console.log("Step 1"); return wait(1000); })
    .then(() => { console.log("Step 2"); return wait(1000); })
    .then(() => console.log("Done! 🎉"));
```
:::

### 🎯 Challenge 3: Race Condition
ใช้ `Promise.race()` เพื่อสร้าง Timeout สำหรับ Fetch:

::: details ✨ ดูเฉลย
```javascript
function fetchWithTimeout(url, timeout = 5000) {
    const fetchPromise = fetch(url);
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("⏰ Timeout!")), timeout);
    });

    return Promise.race([fetchPromise, timeoutPromise]);
}

fetchWithTimeout("https://api.example.com/data", 3000)
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err.message));
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Promise:** Object ที่แทนค่าในอนาคต (สำเร็จหรือล้มเหลว)
> *   **Pending:** สถานะเริ่มต้น — ยังไม่รู้ผล
> *   **Fulfilled:** สำเร็จ — เรียก `resolve(value)`
> *   **Rejected:** ล้มเหลว — เรียก `reject(error)`
> *   **Settled:** จบแล้ว (fulfilled หรือ rejected)
> *   **`.then()`:** Method ที่ทำงานเมื่อ Promise สำเร็จ
> *   **`.catch()`:** Method ที่จับ Error จาก Promise
> *   **`.finally()`:** Method ที่ทำงานเสมอไม่ว่าจะสำเร็จหรือล้มเหลว
> *   **Promise Chaining:** การต่อ `.then()` หลายๆ ชั้นแทน Callback ซ้อน
> *   **`Promise.all()`:** รอ Promise ทุกตัวเสร็จ (fail เดียว = fail หมด)
> *   **`Promise.race()`:** เอาผลจาก Promise ตัวแรกที่เสร็จ
> *   **`Promise.allSettled()`:** รอทุกตัวเสร็จ ไม่สนว่า succeed หรือ fail

---
👉 **[ไปต่อ: 07-3 - Async/Await & Fetch API](/07-03-async-await)**
