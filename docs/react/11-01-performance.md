# 11.1 Performance Optimization

> *"Premature optimization is the root of all evil." — Donald Knuth*
> (แต่เมื่อเว็บอืดจริงๆ ก็ต้องทำนะ!)

## 🚀 Code Splitting (`React.lazy`)

ปกติแล้ว React จะรวมทุกหน้าเป็นไฟล์เดียวกัน (Bundle) ทำให้โหลดครั้งแรกช้า
เราควร "แยกไฟล์" (Split) ให้ **โหลดเฉพาะหน้าที่ใช้**

วิธีทำ: ใช้ `React.lazy` คู่กับ `Suspense`

```jsx
import React, { Suspense } from 'react';

// โหลดแบบ Lazy (ยังไม่โหลด JS จนกว่าจะถูกเรียกใช้)
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

const App = () => {
  return (
    <div>
      <h1>My App</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
};
```

---

## 🧠 Memoization (`useMemo`)

ใช้เมื่อมีการ **คำนวณหนักๆ** (Expensive Calculation) ที่ไม่อยากให้ทำใหม่ทุกครั้งที่ render
React จะจำค่าเดิมไว้ ตราบใดที่ dependency ไม่เปลี่ยน

```jsx
import { useMemo } from 'react';

const expensiveCalculation = (num) => {
  console.log("Computing...");
  for (let i = 0; i < 1000000000; i++) {} // หนักมาก
  return num * 2;
};

const MyComponent = ({ num }) => {
  // ✅ คำนวณใหม่เฉพาะเมื่อ num เปลี่ยน
  const result = useMemo(() => expensiveCalculation(num), [num]);

  return <p>Result: {result}</p>;
};
```

---

## 📞 Callback Memoization (`useCallback`)

ใช้เมื่อเราส่ง function เป็น props ไปให้ child component เพื่อป้องกันไม่ให้ function ถูกสร้างใหม่ทุกครั้ง (ซึ่งจะทำให้ child re-render โดยไม่จำเป็น)

```jsx
import { useCallback } from 'react';

const Parent = () => {
  // ✅ จำ function นี้ไว้ ไม่สร้างใหม่ทุก render
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <ChildButton onClick={handleClick} />;
};
```

---

## 🧱 PureComponent (`React.memo`)

ใช้ห่อ Child Component เพื่อบอกว่า "ถ้า Props ไม่เปลี่ยน ไม่ต้อง Render ใหม่นะ"

```jsx
import React from 'react';

const Child = React.memo(({ name }) => {
  console.log("Child Rendered");
  return <p>{name}</p>;
});
```

---

## 🥊 Challenge: Optimize List Filtering

ลองสร้าง List ที่มีของ 10,000 ชิ้น แล้วทำช่อง Search
- เปรียบเทียบ performance ระหว่างใช้ `useMemo` กับไม่ใช้ (ดูความลื่นไหลตอนพิมพ์)

---

> 👉 **ไปต่อ: [Project 11: Optimization Challenge](/react/11-project-optimization)**
