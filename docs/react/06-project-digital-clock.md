# ⏱️ Project 6: Digital Clock

ในบทนี้ เราจะฝึกใช้ **`useEffect`** และ **`setInterval`** เพื่อสร้างนาฬิกาดิจิทัลที่บอกเวลาได้แบบ Real-time และจะสอนเรื่อง **Cleanup** ที่สำคัญมาก!

> **ความรู้ที่ใช้**: `useState`, `useEffect` (Cleanup), `setInterval`, Date Object

---

## 🎯 เป้าหมาย (Goal)
สร้างนาฬิกาที่แสดงเวลาปัจจุบัน (ชั่วโมง:นาที:วินาที) และอัปเดตทุกๆ 1 วินาที
พร้อมปุ่ม "Toggle Clock" เพื่อทดสอบว่าเมื่อซ่อนนาฬิกา (Unmount) ตัวจับเวลา (Interval) ต้องหยุดทำงานด้วย

---

## 📋 โจทย์ (Requirements)

1.  **Clock Component**:
    - เก็บ State `time` เป็น object `new Date()`
    - ใช้ `useEffect` เพื่อตั้ง `setInterval` ให้ update time ทุก 1 วินาที
    - ต้องมี **Cleanup Function** (`clearInterval`)
    - แสดงผลในรูปแบบ `HH:MM:SS` (ใช้ `.toLocaleTimeString()`)
2.  **App Component**:
    - มีปุ่ม Toggle เพื่อ Show/Hide ตัว Clock Component
    - เพื่อพิสูจน์ว่า Cleanup ทำงานจริง (ถ้าไม่อย่างนั้น Error จะเกิดเมื่อ Clock หายไปแต่ Interval ยังรันอยู่)

---

## 🚀 ลงมือทำ (Step-by-Step)

### Step 1: Clock Component (State & Effect)

```jsx
import { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // 1. Setup Interval
    const timerID = setInterval(() => {
      console.log("Tick Tock..."); // ใส่ log เพื่อเช็คว่าทำงานไหม
      setTime(new Date());
    }, 1000);

    // 2. Cleanup Function (สำคัญมาก!)
    return () => {
      console.log("Clock Unmounted! Cleaning up...");
      clearInterval(timerID);
    };
  }, []); // Run ครั้งเดียวตอน Mount

  return (
    <div className="clock">
      <h2>{time.toLocaleTimeString()}</h2>
    </div>
  );
};
```

### Step 2: Main App (Toggle Logic)

```jsx
const App = () => {
  const [showClock, setShowClock] = useState(true);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>React Digital Clock</h1>
      
      {showClock && <Clock />}

      <button 
        onClick={() => setShowClock(!showClock)}
        style={{ marginTop: "20px" }}
      >
        {showClock ? "Hide Clock" : "Show Clock"}
      </button>
    </div>
  );
};
```

### Step 3: ทดลอง Run & Inspect Loop
ลองเปิด Console (F12) ดูนะครับ
1.  ตอนเปิดนาฬิกา จะเห็น "Tick Tock..." ขึ้นทุกวิ
2.  พอกด Hide Clock -> จะเห็น "Clock Unmounted! Cleaning up..." และ "Tick Tock..." **ต้องหยุดทันที**
3.  ถ้าไม่ได้ใส่ `clearInterval` ใน return... "Tick Tock" จะยังรันต่อไปเรื่อยๆ แม้นาฬิกาหายไปแล้ว! (นี่คือ Memory Leak)

---

## 🧩 Challenge: Hex Clock

ลองทำ "Hex Clock" ดูไหมครับ? (นาฬิกาเปลี่ยนสีได้)
แปลงเวลาเป็นรหัสสี Hex Code เช่น:
- เวลา `12:30:45` → สี `#123045`
- เอาสีนั้นไปเป็น `backgroundColor` ของหน้าจอ

```jsx
const hours = time.getHours().toString().padStart(2, '0');
const minutes = time.getMinutes().toString().padStart(2, '0');
const seconds = time.getSeconds().toString().padStart(2, '0');

const hexColor = `#${hours}${minutes}${seconds}`;

<div style={{ backgroundColor: hexColor }}>...</div>
```

---

> 👉 **ไปต่อ: [Module 7 - API Integration](/react/07-01-api-integration)** (Coming Soon!)
