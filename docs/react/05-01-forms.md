# 5.1 Forms & Controlled Components

> *"Handling forms is how your users interact with your application."*

## 🕹️ Controlled Components

ใน HTML ปกติ, Form elements (เช่น `<input>`, `<textarea>`, `<select>`) จะเก็บ state ของตัวเอง
แต่ใน React, เราต้องการให้ **State เป็นแหล่งข้อมูลเดียว** (Single Source of Truth)

เราจึงผูกค่าของ input ไว้กับ state:
1.  `value={state}`: ให้ input แสดงค่าตาม state
2.  `onChange={...}`: เมื่อพิมพ์ ให้ดึงค่ามาอัปเดต state

```jsx
const [email, setEmail] = useState("");

<input 
  type="email" 
  value={email} // ควบคุมโดย React
  onChange={(e) => setEmail(e.target.value)} // อัปเดต React
/>
```


## 📝 Handling Multiple Inputs

ถ้าฟอร์มมี 10 ช่อง เราไม่ต้องสร้าง 10 states! เราสามารถใช้ **Object State** เดียวเก็บทุกค่าได้

```jsx
const [formData, setFormData] = useState({
  username: "",
  email: "",
  password: ""
});

const handleChange = (e) => {
  const { name, value } = e.target;
  
  setFormData(prev => ({
    ...prev,          // Copy ค่าเก่าทั้งหมดมาก่อน (Spread Operator)
    [name]: value     // อัปเดตเฉพาะ field ที่ชื่อตรงกับ input name (Dynamic Key)
  }));
};

return (
  <form>
    <input 
      name="username" 
      value={formData.username} 
      onChange={handleChange} 
    />
    <input 
      name="email"    
      value={formData.email}    
      onChange={handleChange} 
    />
  </form>
);
```

> ⚠️ **ระวัง!** อย่าลืม `...prev` (Spread Operator) ไม่งั้นค่าเก่าจะหายหมด เหลือแค่ค่าใหม่ที่พิมพ์!


## 💾 Submitting Forms

ใช้ `onSubmit` ที่ tag `<form>` และอย่าลืม `e.preventDefault()` เพื่อป้องกันไม่ให้หน้าเว็บ Refresh

```jsx
const handleSubmit = (e) => {
  e.preventDefault(); // หยุดการ refresh หน้าจอ
  
  console.log("Sending data:", formData);
  // ส่งข้อมูลไป Backend API ตรงนี้...
};

<form onSubmit={handleSubmit}>
  {/* inputs... */}
  <button type="submit">Register</button>
</form>
```


## 🧱 Other Inputs

### Textarea
ใน React ใช้ `value` attribute แทนที่จะใส่ text ตรงกลาง

```jsx
<textarea value={bio} onChange={...} />
```

### Select (Dropdown)
ใช้ `value` ที่ tag `<select>` เพื่อกำหนดตัวเลือกที่ถูกเลือก

```jsx
<select value={role} onChange={...}>
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>
```

### Checkbox
ใช้ `checked` แทน `value`

```jsx
<input 
  type="checkbox" 
  checked={isAgreed} 
  onChange={(e) => setIsAgreed(e.target.checked)} 
/>
```


## 🥊 Challenges

### Level 1: Mirror Input
สร้าง Input ที่เมื่อพิมพ์อะไรลงไป ให้แสดงข้อความนั้นกลับด้าน (Reverse) อยู่ข้างล่างทันที

::: details ✨ เฉลย
```jsx
const [text, setText] = useState("");

// JSX
<input value={text} onChange={e => setText(e.target.value)} />
<p>{text.split("").reverse().join("")}</p>
```
:::

### Level 2: Color Picker
สร้าง Input type="color" เมื่อเลือกสี ให้เปลี่ยนสีพื้นหลังของ `div` กล่องสี่เหลี่ยม

::: details ✨ เฉลย
```jsx
const [color, setColor] = useState("#000000");

// JSX
<input type="color" value={color} onChange={e => setColor(e.target.value)} />
<div style={{ width: 100, height: 100, backgroundColor: color }}></div>
```
:::


> 👉 **ไปต่อ: [Project 5: Registration Form](/react/05-project-registration-form)**
