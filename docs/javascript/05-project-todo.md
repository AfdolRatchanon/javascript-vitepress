# Project 6: The Console Todo List ✅

> **"The secret of getting ahead is getting started."**
> — *Mark Twain*

ถึงเวลาเอาทุกอย่างที่เรียนมา (Array, Object, Function, Loop, Conditionals) มารวมกัน!
เราจะสร้างระบบ **"จัดการรายการสิ่งที่ต้องทำ" (Todo List)** ที่ทำงานบน Console

## 🎯 สิ่งที่จะได้เรียนรู้
*   ใช้ **Array of Objects** เก็บข้อมูลหลายรายการ
*   ใช้ **Functions** จัดการ Logic (Add, Show, Delete, Toggle)
*   ใช้ **Loops** แสดงผลรายการ
*   เข้าใจ **Reference** ผ่านการจัดการข้อมูลจริง

## 📋 โครงสร้างข้อมูล (Data Structure)
แต่ละ Todo จะเป็น Object ที่มีโครงสร้างแบบนี้:

```javascript
{
    id: 1,
    text: "Buy groceries",
    done: false,
}
```

เก็บรวมกันเป็น **Array of Objects:**
```javascript
const todos = [
    { id: 1, text: "Buy groceries", done: false },
    { id: 2, text: "Study JavaScript", done: true },
    { id: 3, text: "Go to gym", done: false },
];
```

## 🛠️ Step 1: Show All Todos (แสดงรายการ)
สร้างฟังก์ชัน `showTodos()` ที่แสดงรายการทั้งหมดในรูปแบบสวยงาม:

```
📋 Your Todo List:
  1. [ ] Buy groceries
  2. [x] Study JavaScript
  3. [ ] Go to gym
```

**คำใบ้:**
*   ใช้ `for` loop หรือ `for...of` วนแสดงผล
*   ใช้ **Ternary Operator** ตรวจว่า `done` เป็น true หรือ false → แสดง `[x]` หรือ `[ ]`

::: details ✨ ดูเฉลย
```javascript
function showTodos() {
    console.log("\n📋 Your Todo List:");
    if (todos.length === 0) {
        console.log("  (No todos yet!)");
        return;
    }
    for (let i = 0; i < todos.length; i++) {
        const status = todos[i].done ? "[x]" : "[ ]";
        console.log(`  ${i + 1}. ${status} ${todos[i].text}`);
    }
    console.log(""); // เว้นบรรทัด
}
```
:::

## 🛠️ Step 2: Add a Todo (เพิ่มรายการ)
สร้างฟังก์ชัน `addTodo(text)` ที่:
1.  สร้าง Object ใหม่โดย `id` จะเพิ่มขึ้นอัตโนมัติ
2.  เริ่มต้น `done` เป็น `false`
3.  `push` เข้า Array `todos`

**คำใบ้:**
*   หา id ใหม่จาก `todos.length + 1` (แบบง่ายๆ) หรือหา id สูงสุดแล้ว +1 (แบบ Pro)

::: details ✨ ดูเฉลย
```javascript
function addTodo(text) {
    const newId = todos.length > 0
        ? todos[todos.length - 1].id + 1
        : 1;

    const newTodo = {
        id: newId,
        text: text,
        done: false,
    };

    todos.push(newTodo);
    console.log(`✅ Added: "${text}"`);
}
```
:::

## 🛠️ Step 3: Toggle Done (สลับสถานะ)
สร้างฟังก์ชัน `toggleTodo(index)` ที่สลับค่า `done` จาก `true` ↔ `false`:

**คำใบ้:**
*   ใช้ `!` (NOT operator) เพื่อสลับค่า: `todos[i].done = !todos[i].done`

::: details ✨ ดูเฉลย
```javascript
function toggleTodo(index) {
    if (index < 0 || index >= todos.length) {
        console.log("❌ Invalid index!");
        return;
    }
    todos[index].done = !todos[index].done;
    const status = todos[index].done ? "completed" : "uncompleted";
    console.log(`🔄 "${todos[index].text}" marked as ${status}`);
}
```
:::

## 🛠️ Step 4: Delete a Todo (ลบรายการ)
สร้างฟังก์ชัน `deleteTodo(index)` ที่ลบรายการออกจาก Array:

**คำใบ้:**
*   ใช้ **`splice(index, 1)`** — Method ที่ลบ Element ออกจาก Array ตามตำแหน่ง
*   `splice(start, deleteCount)` → ลบ `deleteCount` ตัว เริ่มจาก `start`

::: details ✨ ดูเฉลย
```javascript
function deleteTodo(index) {
    if (index < 0 || index >= todos.length) {
        console.log("❌ Invalid index!");
        return;
    }
    const removed = todos.splice(index, 1); // ลบ 1 ตัวตรงตำแหน่ง index
    console.log(`🗑️ Deleted: "${removed[0].text}"`);
}
```
:::

## 🏁 Step 5: Put It All Together! (รวมร่าง!)

```javascript
// ===== ทดสอบระบบ =====
addTodo("Buy milk");
addTodo("Learn Arrays");
addTodo("Build a project");
showTodos();

toggleTodo(1); // Mark "Learn Arrays" as done
showTodos();

deleteTodo(0); // Delete "Buy milk"
showTodos();
```

**ผลลัพธ์ที่ควรได้:**
```
✅ Added: "Buy milk"
✅ Added: "Learn Arrays"
✅ Added: "Build a project"

📋 Your Todo List:
  1. [ ] Buy milk
  2. [ ] Learn Arrays
  3. [ ] Build a project

🔄 "Learn Arrays" marked as completed

📋 Your Todo List:
  1. [ ] Buy milk
  2. [x] Learn Arrays
  3. [ ] Build a project

🗑️ Deleted: "Buy milk"

📋 Your Todo List:
  1. [x] Learn Arrays
  2. [ ] Build a project
```

## 🌟 Bonus Challenge: Level Up! 🚀
ลองเพิ่มฟีเจอร์เหล่านี้ด้วยตัวเอง:

1.  **`showStats()`** — แสดงจำนวน Todo ที่เสร็จแล้ว / ทั้งหมด (เช่น "Done: 2/5")
2.  **`clearCompleted()`** — ลบรายการที่ `done === true` ออกทั้งหมด
3.  **`findTodo(keyword)`** — ค้นหา Todo ที่มีคำที่ต้องการ (ใช้ `.includes()`)

::: details ✨ ดูเฉลย (Bonus)
```javascript
// 1. Show Stats
function showStats() {
    const completed = todos.filter(t => t.done).length;
    console.log(`📊 Done: ${completed}/${todos.length}`);
}

// 2. Clear Completed
function clearCompleted() {
    const before = todos.length;
    // สร้าง Array ใหม่ที่มีแต่ตัวที่ยังไม่เสร็จ
    const remaining = todos.filter(t => !t.done);
    todos.length = 0; // ล้าง Array เดิม
    todos.push(...remaining); // ใส่กลับ
    console.log(`🧹 Cleared ${before - todos.length} completed todos`);
}

// 3. Find Todo
function findTodo(keyword) {
    const results = todos.filter(t =>
        t.text.toLowerCase().includes(keyword.toLowerCase())
    );
    if (results.length === 0) {
        console.log(`🔍 No todos found with "${keyword}"`);
    } else {
        console.log(`🔍 Found ${results.length} result(s):`);
        results.forEach(t => console.log(`  - ${t.text}`));
    }
}
```
:::


**🎉 ยินดีด้วย! คุณเรียนจบ Module 5 แล้วครับ!**
ตอนนี้คุณรู้จัก Array, Object, Reference vs Value และสร้างโปรเจกต์จริงได้แล้ว!
