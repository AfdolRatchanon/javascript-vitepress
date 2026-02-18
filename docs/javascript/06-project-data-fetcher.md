# 🌤️ Project 6: Async Data Fetcher

> **"Waiting is painful. Forgetting is painful. But not knowing which to do is the worst kind of suffering."**
> — *Paulo Coelho (Probably talking about loading states)*

ใน Module 6 เราได้เรียนรู้เรื่อง Event Loop, Promise, และ Async/Await ไปแล้ว
โปรเจกต์นี้เราจะมาลองวิชาด้วยการสร้าง **"CLI Dashboard"** ที่ดึงข้อมูลจากโลกจริง (ผ่าน API) มาแสดงผลครับ

เราจะใช้ **JSONPlaceholder** (Fake API ยอดฮิต) เพื่อจำลองการดึงข้อมูล User, Post, และ Todo มาแสดงผลพร้อมกัน

---

## 🎯 Objective (เป้าหมาย)

เราจะสร้างไฟล์ `dashboard.js` ที่มีความสามารถ:
1.  **Fetch Data:** ดึงข้อมูลจาก URL
2.  **Handle Loading:** แสดงข้อความ "Loading..." ระหว่างรอ
3.  **Handle Error:** จัดการกรณีเน็ตหลุดหรือ URL ผิด (`try-catch`)
4.  **Parallel Requests:** ดึงข้อมูลหลายอย่างพร้อมกันด้วย `Promise.all` (เพื่อให้เร็วที่สุด)

---

## 🛠️ Step-by-Step Implementation

### Step 1: Basic Fetching (The Old Way) 🐢

เริ่มจากลองดึงข้อมูล User คนเดียวดูก่อน

```javascript
// dashboard.js

const API_URL = "https://jsonplaceholder.typicode.com";

function fetchUser(id) {
    console.log(`⏳ Fetching user ${id}...`);
    
    fetch(`${API_URL}/users/${id}`)
        .then(response => {
            if (!response.ok) throw new Error("User not found");
            return response.json();
        })
        .then(user => {
            console.log(`✅ User found: ${user.name}`);
        })
        .catch(error => {
            console.error(`❌ Error: ${error.message}`);
        });
}

fetchUser(1);
```

### Step 2: Modern Async/Await 🚀

เปลี่ยน code ข้างบนให้เป็น `async/await` เพื่อให้อ่านง่ายขึ้น

```javascript
async function getUser(id) {
    try {
        console.log(`⏳ Fetching user ${id}...`);
        const res = await fetch(`${API_URL}/users/${id}`);
        
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const user = await res.json();
        return user;
    } catch (error) {
        console.error("❌ Failed to fetch user:", error.message);
        return null; // คืนค่า null กรณี error
    }
}

// เรียกใช้ (ต้องอยู่ใน async function หรือ top-level await ใน Node 14.8+)
(async () => {
    const user = await getUser(1);
    if (user) console.log(`👤 Name: ${user.name} (${user.email})`);
})();
```

### Step 3: Fetching Multiple Resources (Sequential vs Parallel) �️

สมมติเราต้องการข้อมูล 3 อย่างเพื่อสร้าง Dashboard:
1.  ข้อมูล User
2.  Posts ของ User นั้น
3.  Todos ของ User นั้น

**แบบช้า (Sequential):** รอทีละอย่าง

```javascript
// ❌ Don't do this (เสียเวลา)
const user = await getUser(1);
const posts = await getPosts(1);
const todos = await getTodos(1);
// ถ้ารายการละ 1 วินาที -> รวม 3 วินาที!
```

**แบบเร็ว (Parallel):** ยิงพร้อมกัน!

```javascript
async function getDashboardData(userId) {
    console.log("🚀 Starting dashboard load...");
    const start = Date.now();

    // เตรียม Promise ไว้ (ยังไม่ await)
    const userPromise = fetch(`${API_URL}/users/${userId}`).then(r => r.json());
    const postsPromise = fetch(`${API_URL}/posts?userId=${userId}`).then(r => r.json());
    const todosPromise = fetch(`${API_URL}/todos?userId=${userId}`).then(r => r.json());

    try {
        // รอทุกอันเสร็จพร้อมกัน
        const [user, posts, todos] = await Promise.all([
            userPromise, 
            postsPromise, 
            todosPromise
        ]);

        const timeTaken = Date.now() - start;
        console.log(`✅ Data loaded in ${timeTaken}ms`);

        return { user, posts, todos };

    } catch (error) {
        console.error("❌ Dashboard load failed:", error);
    }
}
```

### Step 4: Displaying the Dashboard 📊

ประกอบร่างสุดท้าย

```javascript
async function main() {
    const data = await getDashboardData(1);

    if (!data) return;

    console.log("\n--- 👤 User Profile ---");
    console.log(`${data.user.name} | ${data.user.company.name}`);

    console.log(`\n--- � Recent Posts (${data.posts.length}) ---`);
    console.log(data.posts.slice(0, 3).map(p => `- ${p.title}`).join("\n"));

    console.log(`\n--- ✅ Pending Tasks ---`);
    const pendingTodos = data.todos.filter(t => !t.completed).slice(0, 3);
    console.log(pendingTodos.map(t => `[ ] ${t.title}`).join("\n"));
}

main();
```

---

## 🏆 Challenges

### 🎯 Challenge 1: The Race
**โจทย์:** ใช้ `Promise.race()` เพื่อจำลอง Timeout
ถ้า API ตอบกลับช้ากว่า 5 วินาที ให้ตัดจบแล้ว throw Error ว่า "Request Timeout"

### 🎯 Challenge 2: Retry Logic
**โจทย์:** สร้างฟังก์ชัน `fetchWithRetry(url, retries)`
ถ้า fetch ล้มเหลว ให้ลองใหม่จำนวน `retries` ครั้ง ก่อนจะยอมแพ้

### 🎯 Challenge 3: Sequential dependent calls
**โจทย์:** เปลี่ยนโจทย์เป็น "หา User ที่ชื่อ 'Leanne Graham' ให้เจอก่อน แล้วค่อยดึง Post ของเขา"
(อันนี้ต้องทำแบบ Sequential เพราะเราไม่รู้ ID ล่วงหน้า)

---

👉 **[ไปต่อ: Module 7 - ES6+ & Advanced Control](/javascript/07-01-destructuring)**
