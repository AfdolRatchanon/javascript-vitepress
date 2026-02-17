# 2.1 Components & Props

> *"Components let you split the UI into independent, reusable pieces, and think about each piece in isolation."*

## 🧩 Analogy: The Burger Shop (ร้านเบอร์เกอร์) 🍔

ลองนึกภาพร้านเบอร์เกอร์ครับ
- **Component**: คือ "สูตรการทำเบอร์เกอร์" (แป้ง + เนื้อ + ผัก)
- **Props**: คือ "คำสั่งพิเศษ" จากลูกค้า (ไม่เอาแตงกวา, เพิ่มชีส, ซอสเผ็ด)
- **Instance**: คือ "เบอร์เกอร์ที่เสร็จแล้ว" แต่ละชิ้นที่ส่งให้ลูกค้า

เรามี "สูตรเดียว" (Component) แต่สร้างเบอร์เกอร์ได้ "หลายรูปแบบ" (Instances) ตาม "คำสั่ง" (Props) ที่ได้รับ

---

## 🏗️ Creating Components

ใน React สมัยใหม่ เราใช้ **Functional Component** เป็นหลักครับ (เขียนเหมือนฟังก์ชัน JavaScript ธรรมดาเลย!)

### 1. Functional Component (Standard) ✅
```jsx
// ชื่อ Component ตัวแรกต้องเป็น "ตัวพิมพ์ใหญ่" เสมอ!
function Welcome() {
  return <h1>Hello, React!</h1>;
}
```

### 2. Arrow Function (Modern) ✨
```jsx
const Welcome = () => {
  return <h1>Hello, React!</h1>;
};
```

> ⚠️ **กฎเหล็ก**: ชื่อ Component ต้องขึ้นต้นด้วย **Capital Letter** (เช่น `MyButton` ไม่ใช่ `myButton`) เพื่อให้ React แยกออกว่าเป็น Component หรือ HTML Tag ปกติ

---

## 📦 What are Props?

**Props** (ย่อมาจาก Properties) คือข้อมูลที่เราส่งส่งเข้าไปใน Component ครับ เหมือนกับ **Argument** ของฟังก์ชัน

### การส่ง Props (Parent)
```jsx
// ส่ง prop ชื่อ 'name' ค่าเป็น "John"
<Welcome name="John" />
```

### การรับ Props (Child)
React จะรวบรวม attributes ทั้งหมดเป็น Object ชื่อ `props`

```jsx
function Welcome(props) {
  // props = { name: "John" }
  return <h1>Hello, {props.name}</h1>;
}
```

---

## ✂️ Destructuring Props (นิยมใช้มากที่สุด)

แทนที่จะเขียน `props.name`, `props.age` ตลอดเวลา เรามักจะ "แตกตัวแปร" (Destructure) ออกมาเลยตั้งแต่ในวงเล็บฟังก์ชัน

```jsx
// ✅ รับตัวแปร name และ role โดยตรง
function UserCard({ name, role }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Position: {role}</p>
    </div>
  );
}

// การเรียกใช้
<UserCard name="Alice" role="Developer" />
<UserCard name="Bob" role="Designer" />
```

---

## 👶 Children Props

บางครั้งเราอยากสอดไส้เนื้อหาลงไป "ตรงกลาง" Component (เหมือน `<div>...เนื้อหา...</div>`)
เราใช้ `children` prop ครับ

```jsx
function Button({ children }) {
  return <button className="btn-style">{children}</button>;
}

// การเรียกใช้
<Button>Click Me</Button>  // children = "Click Me"
<Button>Submit</Button>    // children = "Submit"
<Button>
    <img src="icon.png" /> // children = JSX Element
    Save
</Button>
```

---

## 🛠️ Comparison: HTML Attributes vs React Props

| HTML Attribute | JSX Prop | หมายเหตุ |
|:---------------|:---------|:---------|
| `class` | `className` | ป้องกันซ้ำกับ keyword class ใน JS |
| `onclick` | `onClick` | ใช้ CamelCase |
| `tabindex` | `tabIndex` | ใช้ CamelCase |
| `for` | `htmlFor` | สำหรับ label (กันซ้อน for loop) |

---

## 🥊 Challenges

### Level 1: Greeting Component
สร้าง Component `Greeting` ที่รับ prop `name` แล้วแสดงข้อความ "Sawasdee, [name]!"

::: details ✨ เฉลย
```jsx
const Greeting = ({ name }) => <h1>Sawasdee, {name}!</h1>;

// Usage: <Greeting name="Jame" />
```
:::

### Level 2: Product Card
สร้าง Component `Product` ที่รับ `name`, `price`, และ `onSale` (boolean)
- ถ้า `onSale` เป็น true ให้แสดงป้าย "🔥 Sale!"
- แสดงราคาพร้อมหน่วยบาท

::: details ✨ เฉลย
```jsx
const Product = ({ name, price, onSale }) => (
  <div className="product">
    <h3>{name} {onSale && <span>🔥 Sale!</span>}</h3>
    <p>Price: {price.toLocaleString()} THB</p>
  </div>
);
```
:::

---

> 👉 **ไปต่อ: [Project 2: User Profile Card](/react/02-project-user-profile)**
