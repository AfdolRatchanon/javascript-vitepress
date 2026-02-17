# 7.1 API Integration

> *"Modern web apps are data-driven. Knowing how to fetch data is a superhero skill."*

## 📡 The Fetch API

ใน JavaScript สมัยใหม่ เราใช้ `fetch()` เพื่อดึงข้อมูลจาก Server ครับ
และใน React เราจะเรียกใช้มันใน **`useEffect`** (เพื่อให้ทำงานตอน render เสร็จแล้ว)

### Pattern มาตรฐาน
เราต้องจัดการ 3 สถานะเสมอ:
1.  **Loading**: กำลังโหลด... (แสดงหมุนๆ)
2.  **Success**: ข้อมูลมาแล้ว (แสดงข้อมูล)
3.  **Error**: พัง/เน็ตหลุด (แสดงข้อความ error)

---

## 🏗️ Implementation Steps

### 1. Setup State
เตรียมตัวแปรให้ครบ 3 สถานะ

```javascript
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
```

### 2. Async Function in useEffect
`useEffect` ไม่รับ async function โดยตรง! เราต้องสร้าง function ข้างในแล้วเรียกใช้

```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      // เริ่มโหลด
      setIsLoading(true);

      const response = await fetch('https://api.example.com/users');
      
      // เช็คว่า Server ตอบ 200 OK ไหม
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const result = await response.json();
      setData(result); // เก็บข้อมูล
    } catch (err) {
      setError(err.message); // เก็บ Error
    } finally {
      setIsLoading(false); // จบการโหลด (ไม่ว่าจะสำเร็จหรือล้มเหลว)
    }
  };

  fetchData(); // เรียกใช้ฟังก์ชันทันที
}, []); // Run ครั้งเดียว
```

---

## 🎨 Rendering UI based on State

การแสดงผลต้องเปลี่ยนไปตามสถานะ (Conditional Rendering)

```jsx
if (isLoading) return <p>⏳ Loading...</p>;
if (error) return <p style={{ color: 'red' }}>❌ Error: {error}</p>;

return (
  <ul>
    {data.map(item => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
);
```

---

## 🧩 Axios (Alternative)

นอกจาก `fetch` แล้ว หลายคนนิยมใช้ **Axios** เพราะใช้ง่ายกว่า (เช่น แปลง JSON ให้เอง)

```javascript
import axios from 'axios';

// ...
const result = await axios.get('https://api.example.com/users');
setData(result.data);
```

> แต่ในบทเรียนนี้เราจะใช้ `fetch` มาตรฐานเพื่อให้เข้าใจพื้นฐานครับ

---

## 🥊 Challenges

### Level 1: Fetch Random User
ใช้ API `https://randomuser.me/api/` เพื่อดึงข้อมูลผู้ใช้ 1 คน แล้วแสดงรูปและชื่อ

::: details ✨ เฉลย
```jsx
// ลองเขียนเองก่อนดูเฉลยนะ!
const [user, setUser] = useState(null);

useEffect(() => {
  fetch('https://randomuser.me/api/')
    .then(res => res.json())
    .then(data => setUser(data.results[0]));
}, []);

if (!user) return <p>Loading...</p>;
return <img src={user.picture.medium} alt={user.name.first} />;
```
:::

---

> 👉 **ไปต่อ: [Project 7: Crypto Price Tracker](/react/07-project-crypto-tracker)**
