# 6.1 Effects & Lifecycle (`useEffect`)

> *"Effects let you step outside of React rendering loop and sync with external systems."*

## 🎬 What are "Side Effects"?

**Side Effects** (ผลข้างเคียง) คือการกระทำที่ส่งผลต่อโลกภายนอก Component เช่น:
- 🌎 การดึงข้อมูลจาก API (Data Fetching)
- ⏲️ การตั้งเวลา (SetTimeout / SetInterval)
- 🖱️ การดักจับ Event ที่ Window (Window resize)
- 📜 การเปลี่ยน Title ของ Browser (`document.title`)

เราทำสิ่งเหล่านี้ใน `useEffect` ครับ ไม่ใช่ใน body ของ function!

---

## 🎣 The `useEffect` Hook

### Syntax

```javascript
useEffect(() => {
  // 1. Setup code (Run effect)

  return () => {
    // 2. Cleanup code (Optional)
    // ทำงานเมื่อ component ถูก destroy หรือก่อนรัน effect รอบถัดไป
  };
}, [dependencies]); // 3. Dependency Array
```

---

## 🔄 Dependency Array: ควบคุมการรัน

ตัวแปร array ตัวที่สอง `[]` สำคัญมาก! มันบอก React ว่า "จะให้รัน Effect นี้เมื่อไหร่?"

| Dependency | ความหมาย | รันตอนไหนบ้าง? |
|:----------:|:---------|:--------------|
| **(ไม่มี)** | `useEffect(() => ...)` | **ทุกครั้ง** ที่ Render (อันตราย! อาจ Infinite Loop) |
| **`[]`** | `useEffect(() => ..., [])` | **ครั้งเดียว** ตอน Mount (เหมือน `componentDidMount`) |
| **`[prop, state]`** | `useEffect(() => ..., [count])` | ตอน Mount **และ** เมื่อตัวแปรข้างใน **เปลี่ยนค่า** |

### ตัวอย่าง 1: Run Once (On Mount)
เช่น การดึงข้อมูล API ครั้งแรก

```jsx
useEffect(() => {
  console.log("Component Mounted!");
}, []); // Empty array = Run once
```

### ตัวอย่าง 2: Run on Update
เช่น เปลี่ยน Title ตามจำนวนคลิก

```jsx
const [count, setCount] = useState(0);

useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // รันใหม่ทุกครั้งที่ count เปลี่ยน
```

---

## 🧹 Cleanup Function

บาง Effect ต้องมีการ "เก็บกวาด" เมื่อเลิกใช้ (Unmount) เพื่อไม่ให้ Memory Leak
เช่น `setInterval` หรือ `addEventListener`

```jsx
useEffect(() => {
  const handleResize = () => {
    console.log(window.innerWidth);
  };

  // ✅ 1. Add Event Listener
  window.addEventListener('resize', handleResize);

  // ✅ 2. Cleanup Function (ห้ามลืม!)
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

ถ้าลืม remove listener ทุกครั้งที่ component ถูกสร้างใหม่ event จะซ้อนกันไปเรื่อยๆ จนเครื่องค้างได้!

---

## 🥊 Challenges

### Level 1: Auto Focus
สร้าง Component ที่พอ render ปุ๊บ ให้ cursor ไปโฟกัสที่ช่อง input ทันที (ใช้ `useRef` + `useEffect`)

::: details ✨ เฉลย
```jsx
const inputRef = useRef(null);

useEffect(() => {
  inputRef.current.focus();
}, []);

<input ref={inputRef} />
```
:::

### Level 2: Window Scroller
สร้าง Component ที่แสดงตำแหน่ง Scroll Y ปัจจุบันของหน้าจอ (update real-time)

::: details ✨ เฉลย
```jsx
const [scrollY, setScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => setScrollY(window.scrollY);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

<p>Scroll Y: {scrollY}</p>
```
:::

---

> 👉 **ไปต่อ: [Project 6: Digital Clock](/react/06-project-digital-clock)**
