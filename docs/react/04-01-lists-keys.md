# 4.1 Lists & Keys

> *"Rendering lists is one of the most common pattern in UI development."*

## 📋 Rendering Multiple Components

ใน React เราไม่ใช้ `for` loop ใน JSX โดยตรงครับ แต่เรานิยมใช้ JavaScript Array Method ที่ชื่อว่า `.map()` เพื่อแปลงข้อมูล (Data) ให้กลายเป็น Component (UI)

### Basic Example

```jsx
const numbers = [1, 2, 3, 4, 5];

const listItems = numbers.map((number) =>
  <li>{number}</li>
);

return <ul>{listItems}</ul>;
```

หรือเขียนแบบ Inline ใน JSX เลย (นิยมกว่า):

```jsx
<ul>
  {numbers.map((number) => (
    <li>{number}</li>
  ))}
</ul>
```


## 🔑 The Importance of "Keys"

เมื่อเรา render list, React จะฟ้อง warning ถ้าเราไม่ใส่ prop ที่ชื่อว่า `key`
> *"Warning: Each child in a list should have a unique 'key' prop."*

### ทำไมต้องมี Key?
React ใช้ key เพื่อระบุว่า item ไหน **เปลี่ยนไป**, **ถูกเพิ่ม**, หรือ **ถูกลบ**
ถ้าไม่มี key React จะต้องเดาเอง ซึ่งอาจทำให้เกิดบั๊ก (เช่น input ผิดช่อง, animation กระตุก) หรือประสิทธิภาพแย่ลง

### กฎของ Key
1.  **ต้องไม่ซ้ำกัน** ใน list เดียวกัน (Unique amongst siblings)
2.  **ห้ามใช้ index** (`map((item, index) => ...`) ถ้า list มีการเพิ่ม/ลบ/สลับลำดับ! (เพราะ index จะเปลี่ยนเมื่อลำดับเปลี่ยน)
3.  **ควรใช้ ID** จากฐานข้อมูล (เช่น `user.id`, `product.id`)

### ✅ Correct Usage

```jsx
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

return (
  <ul>
    {users.map((user) => (
      <li key={user.id}>
        {user.name}
      </li>
    ))}
  </ul>
);
```


## 🗑️ Filter & Map

ถ้าอยากแสดงแค่บางส่วน (เช่น เฉพาะสินค้าที่มีขาย) ให้ใช้ `.filter()` ก่อน แล้วค่อย `.map()`

```jsx
const products = [
  { id: 1, name: 'Apple', inStock: true },
  { id: 2, name: 'Banana', inStock: false },
  { id: 3, name: 'Cherry', inStock: true }
];

return (
  <ul>
    {products
      .filter(product => product.inStock) // กรองเอาแต่ที่มีของ
      .map(product => (
        <li key={product.id}>
          {product.name}
        </li>
      ))
    }
  </ul>
);
```


## 🥊 Challenges

### Level 1: Fruit List
สร้าง Array ชื่อผลไม้ 5 ชนิด แล้ว render ออกมาเป็น `<ul>` list
::: details ✨ เฉลย
```jsx
const fruits = ["Apple", "Banana", "Orange", "Mango", "Grape"];

// ใช้ index เป็น key ได้อนุโลมเพราะ list นี้ static (ไม่มีการเพิ่มลบ)
{fruits.map((fruit, index) => <li key={index}>{fruit}</li>)}
```
:::

### Level 2: User Cards
มี Array object `[{id:1, name:"A", role:"Admin"}, ...]`
ให้ render เป็นการ์ด โดยถ้า role เป็น "Admin" ให้ตัวหนังสือสีแดง

::: details ✨ เฉลย
```jsx
const users = [
  { id: 1, name: "Admin User", role: "Admin" },
  { id: 2, name: "Guest User", role: "User" }
];

{users.map(user => (
  <div key={user.id} style={{ color: user.role === "Admin" ? "red" : "black" }}>
    <h3>{user.name}</h3>
    <p>{user.role}</p>
  </div>
))}
```
:::


> 👉 **ไปต่อ: [Project 4: Simple Todo List](/react/04-project-simple-todo)**
