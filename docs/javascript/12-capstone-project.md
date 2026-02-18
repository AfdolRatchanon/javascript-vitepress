# 🏆 Project 13: Capstone Project — Task Manager App 🏆

> **"ถ้าทำได้ถึงจุดนี้ — คุณเข้าใจ JavaScript แล้ว!"**



## 🎯 Capstone Goal

สร้าง **Task Manager App** แบบเต็มรูปแบบ ที่รวบรวม **ทุก Concept** ตั้งแต่ Module 1-11:

### Features:
1. ✅ **CRUD Tasks** — สร้าง, อ่าน, แก้ไข, ลบ
2. 📁 **Categories** — แบ่ง Task เป็นหมวดหมู่
3. 🔍 **Search & Filter** — ค้นหา + กรองตาม Status/Category
4. 💾 **LocalStorage** — เก็บข้อมูลถาวร
5. ⏰ **Due Date** — กำหนดวันส่ง
6. 📊 **Dashboard** — สรุปจำนวน Task (Completed, Pending, Overdue)
7. 🎨 **Responsive UI** — ใช้ได้ทั้ง Desktop และ Mobile



## 🧩 Skills Map — ทุก Module ที่ใช้

| Module | Concept | ใช้ตรงไหน |
|:------:|:--------|:---------|
| 1 | Variables, Types | ข้อมูล Task, State Management |
| 2 | Operators | เปรียบเทียบวันที่, คำนวณสถิติ |
| 3 | Control Flow | if/else สถานะ, for loop render |
| 4 | Functions | Helper Functions, Event Handlers |
| 5 | Arrays & Objects | Task Data, Category Data |
| 6 | DOM Manipulation | สร้าง/แก้/ลบ Elements |
| 7 | Async/Await | (Optional) Fetch Categories from API |
| 8 | ES6+ | Destructuring, Spread, Modules |
| 9 | OOP | Task Class, Category Class |
| 10 | Error Handling | Validation, try/catch |
| 11 | Web Storage | localStorage Persistence |



## 📐 Project Structure

```
task-manager/
├── index.html           # Main HTML
├── style.css            # Styling
├── js/
│   ├── app.js           # Entry point
│   ├── Task.js          # Task Class
│   ├── TaskManager.js   # CRUD + Filter Logic
│   ├── ui.js            # DOM Rendering
│   ├── storage.js       # localStorage Helpers
│   └── utils.js         # Date formatting, ID generation
```



## 📋 Task Data Structure

```javascript
class Task {
    constructor({ title, description = "", category = "General", dueDate = null, priority = "medium" }) {
        this.id = Date.now() + Math.random();
        this.title = title;
        this.description = description;
        this.category = category;
        this.dueDate = dueDate;
        this.priority = priority;      // "low" | "medium" | "high"
        this.completed = false;
        this.createdAt = new Date().toISOString();
    }

    get isOverdue() {
        if (!this.dueDate || this.completed) return false;
        return new Date(this.dueDate) < new Date();
    }

    toggleComplete() {
        this.completed = !this.completed;
        return this;
    }
}
```



## 💡 Implementation Hints

### Hint 1: TaskManager Class

```javascript
class TaskManager {
    #tasks = [];

    constructor() {
        this.#tasks = loadFromStorage("tasks") || [];
    }

    add(taskData) {
        const task = new Task(taskData);
        this.#tasks.unshift(task);
        this.#save();
        return task;
    }

    remove(id) { /* filter */ }
    update(id, updates) { /* map + spread */ }
    toggle(id) { /* find + toggleComplete */ }

    getFiltered({ search, status, category }) {
        return this.#tasks.filter(task => {
            const matchSearch = !search || task.title.toLowerCase().includes(search.toLowerCase());
            const matchStatus = !status || (status === "completed" ? task.completed : !task.completed);
            const matchCategory = !category || task.category === category;
            return matchSearch && matchStatus && matchCategory;
        });
    }

    getStats() {
        return {
            total: this.#tasks.length,
            completed: this.#tasks.filter(t => t.completed).length,
            pending: this.#tasks.filter(t => !t.completed).length,
            overdue: this.#tasks.filter(t => t.isOverdue).length,
        };
    }

    #save() { saveToStorage("tasks", this.#tasks); }
}
```

### Hint 2: Dashboard Stats

```javascript
function renderStats(stats) {
    const { total, completed, pending, overdue } = stats;
    statsContainer.innerHTML = `
        <div class="stat-card">📋 ทั้งหมด: ${total}</div>
        <div class="stat-card done">✅ เสร็จ: ${completed}</div>
        <div class="stat-card pending">⏳ รอทำ: ${pending}</div>
        <div class="stat-card overdue">⚠️ เลยกำหนด: ${overdue}</div>
    `;
}
```

### Hint 3: Priority Colors

```javascript
function getPriorityColor(priority) {
    const colors = { low: "#27ae60", medium: "#f39c12", high: "#e74c3c" };
    return colors[priority] || "#999";
}
```



## 🌟 Extra Challenges (ท้าทายเพิ่ม!)

1. **Drag & Drop** — ลาก Task เพื่อเปลี่ยนลำดับ
2. **Export/Import** — ส่งออก/นำเข้า Notes เป็น JSON
3. **Dark Mode** — สลับ Theme + บันทึกใน localStorage
4. **Keyboard Shortcuts** — `Ctrl+N` สร้าง Task ใหม่
5. **Undo Delete** — แสดง Toast "Undo" หลังลบ Task



## 🎓 ยินดีด้วย! คุณเรียนจบ JavaScript Zero to Hero แล้ว! 🎉

> ถ้าทำ Capstone Project นี้ได้ — คุณมีพื้นฐานที่แข็งแกร่งพร้อมต่อยอดไป:
>
> - **React / Vue / Svelte** → Frontend Frameworks
> - **Node.js / Express** → Backend Development
> - **TypeScript** → Type-Safe JavaScript
> - **Testing** → Jest, Vitest, Cypress
>
> **Keep coding, keep learning! 🚀**
