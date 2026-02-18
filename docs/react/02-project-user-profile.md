# 👤 Project 2: User Profile Card

ในบทนี้ เราจะฝึกสร้าง **Reusable Component** ที่รับข้อมูล (Props) ที่แตกต่างกัน เพื่อแสดงผลเป็นการ์ดข้อมูลผู้ใช้หลายๆ คนครับ

> **ความรู้ที่ใช้**: Components, Props Destructuring, Conditional Rendering


## 🎯 เป้าหมาย (Goal)
สร้าง Component `ProfileCard` ที่สามารถนำไปใช้ซ้ำเพื่อแสดงข้อมูลพนักงาน 3 คน โดยแต่ละคนมีข้อมูลและสถานะต่างกัน (Online/Offline)


## 📋 โจทย์ (Requirements)

1.  สร้าง Component ชื่อ `ProfileCard`
2.  รับ Props:
    - `name` (String): ชื่อ
    - `role` (String): ตำแหน่งงาน
    - `avatar` (String URL): รูปโปรไฟล์
    - `isOnline` (Boolean): สถานะออนไลน์
3.  แสดงวงกลมสีเชียว 🟢 ถ้า online และสีเทา 🔘 ถ้า offline
4.  เรียกใช้ `ProfileCard` 3 ครั้งด้วยข้อมูลที่ต่างกัน


## 🚀 ลงมือทำ (Step-by-Step)

### Step 1: สร้าง Component โครงร่าง
เริ่มจากสร้างฟังก์ชันเปล่าๆ และรับ props แบบ destructuring

```jsx
const ProfileCard = ({ name, role, avatar, isOnline }) => {
  return (
    <div className="card">
      <img src={avatar} alt={name} className="avatar" />
      <div className="info">
        <h3>{name}</h3>
        <p>{role}</p>
        
        {/* Challenge: แสดงสถานะ Online ตรงนี้ */}
      </div>
    </div>
  );
};
```

### Step 2: จัดการ Style
ใน React จริงๆ เรามักแยกไฟล์ CSS แต่ในที่นี้เราใช้ Object Style หรือ Inline เพื่อความง่ายครับ

```javascript
/* CSS Class (สมมติว่าเขียนใน CSS file) */
/* 
.card {
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    gap: 15px;
    align-items: center;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
}
.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
}
*/
```

### Step 3: Conditional Rendering สำหรับ Status
เราจะใช้ **Ternary Operator** มาช่วยเลือกสีปุ่มสถานะ

```jsx
const statusStyle = {
  color: isOnline ? "green" : "gray",
  fontWeight: "bold"
};

return (
  // ...
  <span style={statusStyle}>
    {isOnline ? "🟢 Online" : "🔘 Offline"}
  </span>
  // ...
);
```

### Step 4: นำมาประกอบกัน (App Component)

```jsx
const App = () => {
    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <ProfileCard 
                name="Elon Musk" 
                role="CEO" 
                avatar="https://placekitten.com/100/100" 
                isOnline={true} 
            />
            <ProfileCard 
                name="Mark Zuckerberg" 
                role="Developer" 
                avatar="https://placekitten.com/101/101" 
                isOnline={false} 
            />
            <ProfileCard 
                name="Jeff Bezos" 
                role="Manager" 
                avatar="https://placekitten.com/102/102" 
                isOnline={true} 
            />
        </div>
    );
}
```


## 🧩 Challenge: Add "Skills" Prop

ลองเพิ่ม prop ชื่อ `skills` ที่รับ Array ของ strings (เช่น `["React", "Node.js"]`)
แล้วใช้ `.map()` เพื่อแสดงเป็น Tags เล็กๆ ใต้ชื่อดูครับ

```jsx
// ตัวอย่างการเรียกใช้
<ProfileCard 
    name="Dev" 
    skills={["HTML", "CSS", "JS"]} 
/>

// ใน Component
<div className="skills">
    {skills.map(skill => <span className="tag">{skill}</span>)}
</div>
```


> 👉 **ไปต่อ: [Module 3 - State & Events](/react/03-01-state-events)** (Coming Soon!)
