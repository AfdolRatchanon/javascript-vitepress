# 🔢 Project 3: Counter & Toggler

ในบทนี้ เราจะรวมพลังของ **Event Handling** และ **useState** เพื่อสร้างแอปพลิเคชันที่มีการโต้ตอบ (Interactive) อย่างแท้จริงครับ

> **ความรู้ที่ใช้**: `useState`, `onClick`, Conditional Rendering

---

## 🎯 เป้าหมาย (Goal)
สร้าง "แผงควบคุม" (Control Panel) เล็กๆ ที่มี 2 ส่วน:
1.  **Counter**: ตัวนับเลขที่เพิ่ม/ลด/รีเซ็ตได้
2.  **Theme Toggler**: ปุ่มสลับโหมด Dark/Light ซึ่งจะเปลี่ยนสีพื้นหลังของแผงควบคุม

---

## 📋 โจทย์ (Requirements)

1.  **Counter Section**:
    - แสดงตัวเลขปัจจุบัน (เริ่มที่ 0)
    - ปุ่ม **+** (เพิ่ม 1)
    - ปุ่ม **-** (ลด 1) (ห้ามติดลบ! ถ้าเป็น 0 กดลบไม่ได้)
    - ปุ่ม **Reset** (กลับไป 0)

2.  **Theme Section**:
    - ปุ่ม "Switch to Dark/Light Mode"
    - เมื่อกด พื้นที่สี่เหลี่ยมของ App ต้องเปลี่ยนสีพื้นหลัง (ขาว ↔ ดำ) และสีตัวหนังสือ (ดำ ↔ ขาว)

---

## 🚀 ลงมือทำ (Step-by-Step)

### Step 1: Counter Logic
สร้าง State สำหรับเก็บตัวนับ และฟังก์ชันจัดการ

```jsx
const [count, setCount] = useState(0);

const handleIncrement = () => setCount(count + 1);
const handleDecrement = () => {
  if (count > 0) {
    setCount(count - 1);
  }
};
const handleReset = () => setCount(0);
```

### Step 2: Theme Logic
สร้าง State boolean สำหรับเช็คว่าเป็น Dark Mode หรือไม่

```jsx
const [isDarkMode, setIsDarkMode] = useState(false);

const toggleTheme = () => {
  setIsDarkMode(!isDarkMode); // สลับค่า true <-> false
};
```

### Step 3: Dynamic Styles
สร้าง Object style ที่เปลี่ยนค่าตาม `isDarkMode`

```javascript
const containerStyle = {
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  textAlign: "center",
  // ถ้า dark: สีพื้นเทาเข้ม, ตัวหนังสือขาว
  backgroundColor: isDarkMode ? "#333" : "#fff",
  color: isDarkMode ? "#fff" : "#333",
  transition: "0.3s" // เอฟเฟกต์เปลี่ยนสีนุ่มๆ
};
```

### Step 4: ประกอบร่าง (Full Component)

```jsx
import { useState } from 'react';

const ControlPanel = () => {
  // State
  const [count, setCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Styles
  const containerStyle = {
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    backgroundColor: isDarkMode ? "#222" : "#fff",
    color: isDarkMode ? "#fff" : "#222",
    maxWidth: "400px",
    margin: "20px auto",
    transition: "all 0.3s ease"
  };

  return (
    <div style={containerStyle}>
      <h2>🔢 Control Panel</h2>
      
      {/* Counter Section */}
      <div style={{ marginBottom: "20px" }}>
        <h1>{count}</h1>
        <button onClick={() => setCount(count - 1)} disabled={count === 0}>-</button>
        <button onClick={() => setCount(0)} style={{ margin: "0 10px" }}>Reset</button>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>

      <hr style={{ borderColor: isDarkMode ? "#555" : "#ddd" }} />

      {/* Theme Section */}
      <div style={{ marginTop: "20px" }}>
        <p>Current Mode: <strong>{isDarkMode ? "🌙 Dark" : "☀️ Light"}</strong></p>
        <button onClick={() => setIsDarkMode(!isDarkMode)}>
          Toggle Theme
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
```

---

## 🧩 Challenge: Step Specifier

ลองเพิ่ม Input (`type="number"`) ให้ผู้ใช้กำหนดได้ว่า เวลากดปุ่ม +/- จะให้เพิ่มลดทีละเท่าไหร่ (เช่น ทีละ 5, ทีละ 10)

```jsx
const [step, setStep] = useState(1);

// <input type="number" value={step} onChange={...} />
// setCount(count + step)
```

::: warning ⚠️ ระวัง Type!
ค่าที่ได้จาก `e.target.value` เป็น String เสมอ! อย่าลืมแปลงเป็นตัวเลขด้วย `Number(e.target.value)` หรือ `parseInt(...)` ไม่งั้น `5 + "5" = "55"` นะครับ!
:::

---

> 👉 **ไปต่อ: [Module 4 - Lists & Keys](/react/04-01-lists-keys)** (Coming Soon!)
