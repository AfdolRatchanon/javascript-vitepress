# 📋 Project 5: Registration Form

ในบทนี้ เราจะสร้างแบบฟอร์มลงทะเบียนที่มีหลายช่อง (Inputs) และมีการตรวจสอบความถูกต้อง (Validation) พื้นฐาน

> **ความรู้ที่ใช้**: Object State, `onChange` (Dynamic Key), `onSubmit`, Conditional Rendering (Error Message)

---

## 🎯 เป้าหมาย (Goal)
สร้างฟอร์มสมัครสมาชิกที่รับข้อมูล:
1.  Username
2.  Email
3.  Password
4.  Confirm Password

และเมื่อกดปุ่ม Register ให้ตรวจสอบว่า:
- ข้อมูลครบทุกช่องหรือไม่
- Password กับ Confirm Password ตรงกันหรือไม่

ถ้าผ่าน ให้แสดงข้อความ "✅ Registration Successful!"

---

## 🚀 ลงมือทำ (Step-by-Step)

### Step 1: Setup Object State
เราจะเก็บข้อมูลทั้งหมดใน Object เดียว

```jsx
const [formData, setFormData] = useState({
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
});

const [error, setError] = useState(""); // เก็บข้อความ Error
const [success, setSuccess] = useState(false); // เก็บสถานะสำเร็จ
```

### Step 2: Handle Change (Reusable Function)
ฟังก์ชันเดียวใช้กับทุก input!

```jsx
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });
};
```

### Step 3: Handle Submit & Validation

```jsx
const handleSubmit = (e) => {
  e.preventDefault();
  
  // 1. Validate: ห้ามมีค่าว่าง
  if (!formData.username || !formData.email || !formData.password) {
    setError("Please fill in all fields.");
    return;
  }

  // 2. Validate: Password ตรงกันไหม
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match!");
    return;
  }

  // 3. Success!
  setError("");
  setSuccess(true);
  console.log("Registered:", formData);
};
```

### Step 4: UI Implementation

```jsx
return (
  <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
    <h2>Register</h2>
    
    {/* แสดง Error หรือ Success Message */}
    {error && <p style={{ color: "red" }}>❌ {error}</p>}
    {success && <p style={{ color: "green" }}>✅ Registration Successful!</p>}

    {!success && ( // ซ่อนฟอร์มเมื่อสมัครเสร็จแล้ว
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          value={formData.username} 
          onChange={handleChange} 
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
        />

        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={handleChange} 
        />

        <input 
          type="password" 
          name="confirmPassword" 
          placeholder="Confirm Password" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
        />

        <button type="submit">Register Account</button>
      </form>
    )}
  </div>
);
```

---

## 🧩 Challenge: Real-time Validation

ทำให้ช่อง Password เปลี่ยนกรอบเป็น **สีแดง** ทันทีที่พิมพ์ แล้วพบว่าความยาวน้อยกว่า 6 ตัวอักษร (โดยไม่ต้องรอกดปุ่ม Submit)

```jsx
const isPasswordShort = formData.password.length > 0 && formData.password.length < 6;

<input 
  style={{ borderColor: isPasswordShort ? "red" : "#ccc" }}
  ...
/>
{isPasswordShort && <small style={{color:'red'}}>Password must be at least 6 chars</small>}
```

---

> 👉 **ไปต่อ: [Module 6 - Effects & Lifecycle](/react/06-01-effects-lifecycle)** (Coming Soon!)
