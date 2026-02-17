# 8.1 Context API

> *"Context provides a way to pass data through the component tree without having to pass props down manually at every level."*

## 😫 The Problem: Prop Drilling

สมมติเรามี Theme (Dark/Light) ที่ Root Component แต่อยากให้ปุ่ม `Button` ที่อยู่ลึกมากๆ เปลี่ยนสีตาม

`App` ➡️ `Toolbar` ➡️ `Navbar` ➡️ `Menu` ➡️ `Button`

ถ้าใช้ Props เราต้องส่งผ่านทุกชั้น (Drilling) ทั้งที่ตัวกลางไม่ได้ใช้เลย! นี่คือปัญหาที่ Context เกิดมาเพื่อแก้ครับ

---

## 🏗️ Context API Steps

### Step 1: Create Context
สร้างกล่องเก็บข้อมูลส่วนกลาง

```javascript
import { createContext } from 'react';

// สร้าง Context (ค่า default คือ "light")
export const ThemeContext = createContext("light");
```

### Step 2: Provide Context
ห่อหุ้ม Component ที่ต้องการให้เข้าถึงข้อมูล ด้วย `<Context.Provider>`

```jsx
import { ThemeContext } from './ThemeContext';

const App = () => {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
};
```

### Step 3: Consume Context (`useContext`)
Component ลูก (ไม่ว่าจะลึกแค่ไหน) สามารถดึงค่าออกมาใช้ได้เลย

```jsx
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const Button = () => {
  const theme = useContext(ThemeContext); // theme = "dark"

  return <button className={theme}>I am {theme}!</button>;
};
```

---

## 👑 When to use Context?

ใช้เมื่อข้อมูลนั้นเป็น "Global" หรือใช้ร่วมกันหลายๆ ที่ เช่น:
- 🎨 **Theme** (Dark/Light mode)
- 👤 **User Auth** (Login status, profile)
- 🌐 **Language** (TH/EN localization)
- 🛒 **Shopping Cart** (สินค้าในตะกร้า)

ถ้าเป็นข้อมูลที่ใช้แค่ Parent-Child ทั่วไป **ใช้ Props เหมือนเดิมดีที่สุด** ครับ เพราะ Context ทำให้ component นำไป reuse ยากขึ้น (ต้องพึ่งพา Context ตลอด)

---

## 🥊 Challenges

### Level 1: User Context
สร้าง `UserContext` ที่เก็บชื่อ user แล้วให้ Component ลูกแสดงชื่อนั้นออกมา

::: details ✨ เฉลย
```jsx
const UserContext = createContext();

// Parent
<UserContext.Provider value="Alice">
  <UserProfile />
</UserContext.Provider>

// Child
const name = useContext(UserContext);
return <h1>Hello, {name}</h1>;
```
:::

---

> 👉 **ไปต่อ: [Project 8: Theme Switcher](/react/08-project-theme-context)**
