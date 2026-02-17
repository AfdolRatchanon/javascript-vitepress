# 📝 Project 4: Simple Todo List

โปรเจกต์คลาสสิกของชาว React! เราจะนำความรู้เรื่อง **State (Array)** และ **Lists & Keys** มาสร้างรายการสิ่งที่ต้องทำที่เพิ่มและลบได้

> **ความรู้ที่ใช้**: `useState` (Array), `.map()`, `.filter()`, Event Handling

---

## 🎯 เป้าหมาย (Goal)
สร้างแอป Todo List ที่:
1.  พิมพ์ข้อความและกดปุ่ม "Add" เพื่อเพิ่มรายการ
2.  แสดงรายการที่เพิ่มเข้ามาด้านล่าง
3.  กดที่แต่ละรายการเพื่อลบออก (Delete)

---

## 📋 โจทย์ (Requirements)

1.  **State**: เก็บข้อมูล Todos เป็น Array ของ Objects `{ id: number, text: string }`
2.  **Add Function**: รับค่าจาก Input, สร้าง object ใหม่ (ใช้ `Date.now()` เป็น ID), แล้วเพิ่มเข้า Array
3.  **Delete Function**: ส่ง ID ไปลบออกจาก Array (ใช้ `.filter()`)
4.  **Render**: ใช้ `.map()` แสดงรายการ โดยมีปุ่ม ❌ ลบอยู่ข้างหลัง

---

## 🚀 ลงมือทำ (Step-by-Step)

### Step 1: Setup State
เราต้องการ 2 states:
1. `todos`: เก็บรายการ (Array)
2. `input`: เก็บข้อความที่กำลังพิมพ์ (String)

```jsx
const [todos, setTodos] = useState([]);
const [input, setInput] = useState("");
```

### Step 2: Handle Add Todo
เมื่อกดปุ่ม Add เราจะสร้าง object ใหม่แล้วรวมกับ array เดิม
⚠️ **ห้ามใช้ `.push()`** นะครับ! เพราะ React ต้องการ Array ก้อนใหม่เสมอ (Immutability)

```jsx
const addTodo = () => {
  if (input.trim() === "") return; // กันค่าว่าง

  const newTodo = {
    id: Date.now(), // ใช้เวลาปัจจุบันเป็น ID ชั่วคราว (ไม่ซ้ำแน่นอน)
    text: input
  };

  setTodos([...todos, newTodo]); // Spread Operator (...) สร้าง array ใหม่
  setInput(""); // เคลียร์ช่อง input
};
```

### Step 3: Handle Delete
ลบรายการโดยการ "กรอง" (Filter) เอาเฉพาะตัวที่ **ID ไม่ตรงกับที่กดลบ** เก็บไว้

```jsx
const deleteTodo = (id) => {
  setTodos(todos.filter(todo => todo.id !== id));
};
```

### Step 4: UI & Rendering Keys

```jsx
return (
  <div style={{ padding: "20px", maxWidth: "400px" }}>
    <h2>📝 Start your day</h2>
    
    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new task..."
        style={{ flex: 1, padding: "8px" }}
      />
      <button onClick={addTodo}>Add</button>
    </div>

    <ul>
      {todos.map((todo) => (
        <li 
          key={todo.id} 
          style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}
        >
          {todo.text}
          <button 
            onClick={() => deleteTodo(todo.id)}
            style={{ marginLeft: "10px", background: "red", color: "white" }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
    
    {todos.length === 0 && <p style={{ color: "#888" }}>No tasks yet!</p>}
  </div>
);
```

---

## 🧩 Challenge: Enter Key to Add

ทำให้เมื่อพิมพ์เสร็จแล้วกดปุ่ม **Enter** ก็เพิ่มรายการได้เลย (ไม่ต้องกดปุ่ม Add)
(Hint: ใช้ Event `onKeyDown` หรือ `onSubmit` ของ form)

```jsx
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
};

<input onKeyDown={handleKeyDown} ... />
```

---

> 👉 **ไปต่อ: [Module 5 - Forms & Controlled Components](/react/05-01-forms)** (Coming Soon!)
