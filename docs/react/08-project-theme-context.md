# 🌗 Project 8: Theme Switcher with Context

เราจะสร้างระบบเปลี่ยน Theme (Dark/Light) **แบบมือโปร** โดยใช้ Context API เพื่อให้ทุกหน้าและทุก Component ในแอปเปลี่ยนสีพร้อมกันโดยไม่ต้องส่ง Props

> **ความรู้ที่ใช้**: `createContext`, `useContext`, State Management

---

## 🎯 เป้าหมาย (Goal)
1.  สร้าง `ThemeContext`
2.  มีปุ่ม Toggle ที่ Navbar (ส่วนกลาง)
3.  เนื้อหาในหน้า Page (ส่วนลึก) ต้องเปลี่ยนสีพื้นหลังและตัวหนังสือตาม Theme ที่เลือก

---

## 🚀 ลงมือทำ (Step-by-Step)

### Step 1: Create Context & Provider
สร้างไฟล์แยก `ThemeContext.js` (หรือเขียนรวมก็ได้ แต่แยกดีกว่า)

```jsx
// ThemeContext.js
import { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // 'light' or 'dark'

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Step 2: Wrap App with Provider
ไปที่ตัว Top Level Component (เช่น `App` หรือ `index.js`)

```jsx
// App.js
import { ThemeProvider } from './ThemeContext';
import Content from './Content';

const App = () => {
  return (
    <ThemeProvider>
      <Content />
    </ThemeProvider>
  );
};
```

### Step 3: Consume in Child Component
สร้าง `Content.js` ที่จะเปลี่ยนสีตาม Theme

```jsx
// Content.js
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const Content = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  // กำหนด Style ตาม Theme
  const styles = {
    backgroundColor: theme === "light" ? "#ffffff" : "#333333",
    color: theme === "light" ? "#000000" : "#ffffff",
    height: "100vh",
    padding: "20px",
    transition: "0.3s"
  };

  return (
    <div style={styles}>
      <h1>Current Theme: {theme.toUpperCase()}</h1>
      <p>This component uses data from Context!</p>
      
      <button onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
    </div>
  );
};
```

---

## 🧩 Challenge: Multiple Contexts

ลองเพิ่ม `AuthContext` (เก็บ `user` = null หรือ object) เข้าไปซ้อนกับ `ThemeContext`
แล้วสร้างปุ่ม Login ที่เมื่อกดแล้ว จะแสดงชื่อ User พร้อมกับธีมปัจจุบัน

```jsx
<AuthProvider>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</AuthProvider>
```

> **Note**: การซ้อน Context หลายชั้นเป็นเรื่องปกติใน React Apps ขนาดใหญ่ครับ!

---

> 👉 **ไปต่อ: [Module 9 - React Router](/react/09-01-react-router)** (Coming Soon!)
