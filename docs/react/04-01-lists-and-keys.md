# 4.1 - Lists and Keys: การแสดงรายการข้อมูลใน React

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand."
> — Martin Fowler

## อุปมาอุปมัย: React เหมือนพนักงานคลังสินค้า 📦

ลองนึกภาพพนักงานคลังสินค้าที่ต้องจัดเรียงกล่องสินค้าบนชั้นวาง เมื่อมีสินค้าใหม่เข้ามาหรือสินค้าเก่าถูกนำออก พนักงานที่ดีจะไม่เรียงสินค้าใหม่ทั้งหมดตั้งแต่ต้น แต่จะดูที่ **ป้ายชื่อ (key)** ของแต่ละกล่องเพื่อรู้ว่ากล่องไหนเปลี่ยนไป กล่องไหนยังเหมือนเดิม และกล่องไหนที่ต้องเพิ่มหรือลบออก

React ทำงานในลักษณะเดียวกัน — `key` prop คือป้ายชื่อที่ช่วยให้ React รู้ว่า element ไหนในรายการที่เปลี่ยนแปลงไป โดยไม่ต้อง render ทุก element ใหม่ทั้งหมด

## ทำไมต้องใช้ `.map()` แทน for loop ใน JSX

ใน JSX เราเขียนโค้ดที่ดูเหมือน HTML แต่จริงๆ แล้วมันคือ JavaScript expression ทุกอย่างใน JSX ต้องเป็น **expression** (สิ่งที่มีค่า ส่งค่ากลับได้) ไม่ใช่ **statement** (คำสั่งทั่วไป)

`for` loop เป็น statement — มันไม่ส่งค่ากลับ จึงใช้โดยตรงใน JSX ไม่ได้

`.map()` เป็น expression — มันส่งค่ากลับเป็น array ใหม่ จึงใช้ใน JSX ได้

::: tip เอกสารอ้างอิง
- [React Docs: Rendering Lists](https://react.dev/learn/rendering-lists)
- [MDN: Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Array.prototype.map)
:::

### ตัวอย่าง: for loop vs .map()

ก่อนจะดูวิธีที่ถูกต้อง เรามาดูก่อนว่าทำไม `for` loop จึงใช้ใน JSX โดยตรงไม่ได้ และวิธีที่ถูกต้องคือการใช้ `.map()` ซึ่งส่งค่ากลับเป็น array ของ JSX elements

```jsx
// ❌ ผิด: for loop ใช้ใน JSX โดยตรงไม่ได้
function BadList() {
  const fruits = ['Apple', 'Banana', 'Cherry'];
  return (
    <ul>
      {/* SyntaxError! for loop ไม่ใช่ expression */}
      {for (let fruit of fruits) {
        <li>{fruit}</li>
      }}
    </ul>
  );
}

// ✅ ถูก: ใช้ .map() เพราะมันส่งค่ากลับเป็น array
function GoodList() {
  const fruits = ['Apple', 'Banana', 'Cherry'];
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>  // key จำเป็นต้องมี!
      ))}
    </ul>
  );
}
// Output: <ul><li>Apple</li><li>Banana</li><li>Cherry</li></ul>
```

::: warning ข้อควรระวัง
ถ้าต้องการใช้ `for` loop จริงๆ ให้สร้าง array ไว้ก่อนแล้วค่อย return JSX จาก array นั้น แต่ `.map()` เป็นวิธีที่ clean กว่าและเป็น convention ของ React community
:::

### Challenge 4.1.1

จงแปลง array ของตัวเลข `[1, 2, 3, 4, 5]` ให้กลายเป็นรายการ `<li>` โดยแต่ละ item แสดงเลขยกกำลังสอง (เช่น "1² = 1", "2² = 4")

::: details ✨ ดูเฉลย
```jsx
function SquaredList() {
  const numbers = [1, 2, 3, 4, 5];
  return (
    <ul>
      {numbers.map((num) => (
        <li key={num}>
          {num}² = {num * num}
        </li>
      ))}
    </ul>
  );
}
// Output:
// • 1² = 1
// • 2² = 4
// • 3² = 9
// • 4² = 16
// • 5² = 25
```
:::

## The `key` Prop: ทำไม React ต้องการมัน

`key` prop เป็นกลไกพิเศษที่ React ใช้ในกระบวนการที่เรียกว่า **Reconciliation** — กระบวนการเปรียบเทียบ Virtual DOM เก่ากับใหม่เพื่อหาว่าส่วนไหนของ real DOM ที่ต้องอัปเดต

::: tip เอกสารอ้างอิง
- [React Docs: Why does React need keys?](https://react.dev/learn/rendering-lists#why-does-react-need-keys)
- [React Docs: Reconciliation](https://legacy.reactjs.org/docs/reconciliation.html)
:::

เมื่อไม่มี `key` React จะไม่รู้ว่า item ไหนเปลี่ยนไป item ไหนแค่เลื่อนตำแหน่ง มันจึงต้อง re-render ทุก item ใหม่ทั้งหมด ซึ่งช้ากว่า และทำให้เกิด bug กับ stateful components

เมื่อมี `key` ที่ไม่ซ้ำกัน React จะจับคู่ item เก่าและใหม่ได้ถูกต้อง อัปเดตเฉพาะสิ่งที่เปลี่ยน และรักษา state ของ component ที่ไม่เปลี่ยนไว้

```jsx
// สมมติว่ามีรายการ items
// ก่อน: [A, B, C]
// หลัง: [A, X, B, C]  (เพิ่ม X เข้าตรงกลาง)

// ❌ ไม่มี key: React คิดว่า B เปลี่ยนเป็น X, C เปลี่ยนเป็น B, มี C ใหม่
// ผล: re-render 3 items โดยไม่จำเป็น

// ✅ มี key: React รู้ว่า A, B, C ยังเหมือนเดิม มีแค่ X ที่ใหม่
// ผล: render แค่ X เดียว
```

### Challenge 4.1.2

อธิบายว่าถ้า React ไม่มี key prop เลย จะเกิดอะไรขึ้นเมื่อเราลบ item ตรงกลางของรายการ?

::: details ✨ ดูเฉลย
เมื่อลบ item ตรงกลาง เช่น ลบ item ที่ index 1 จาก [A, B, C] เหลือ [A, C]:

- React จะเปรียบเทียบตามตำแหน่ง: ตำแหน่ง 0 (A=A ไม่เปลี่ยน), ตำแหน่ง 1 (B→C ต้องอัปเดต), ตำแหน่ง 2 (C ถูกลบ)
- React จะอัปเดต item ที่ตำแหน่ง 1 จาก B เป็น C แทนที่จะลบ B และคง C
- ถ้า item มี internal state เช่น input ที่กำลังพิมพ์อยู่ state นั้นจะ "เลื่อน" ไปยัง item ที่อยู่ตำแหน่งนั้นแทน

ผลลัพธ์คือ UI แสดงผลไม่ถูกต้องและ state กระจัดกระจาย
:::

## ❌ Anti-Pattern: การใช้ Index เป็น Key

การใช้ index ของ array เป็น key เป็นสิ่งที่หลายคนทำเมื่อ React แสดง warning ให้ใส่ key แต่มันแก้ปัญหาได้แค่ผิวเผิน ในหลายกรณีมันสร้างปัญหาที่ซับซ้อนกว่า

ปัญหาของการใช้ index คือ index เปลี่ยนแปลงได้เมื่อรายการถูก sort, filter, หรือมีการเพิ่ม/ลบ item ทำให้ React จับคู่ item ผิดตัว

::: tip เอกสารอ้างอิง
- [React Docs: Index as key is an anti-pattern](https://react.dev/learn/rendering-lists#rules-of-keys)
- [Robin Pokorny: Index as key is an anti-pattern](https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318)
:::

ตัวอย่างต่อไปนี้แสดงให้เห็นว่าการใช้ index เป็น key ทำให้ React สับสนเมื่อรายการมีการเปลี่ยนแปลงลำดับ ส่งผลให้ input state ผิดตัว

```jsx
// ❌ การใช้ Index เป็น key — แสดง bug ที่เกิดขึ้น
function BadTodoList() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Buy milk' },
    { id: 2, text: 'Go running' },
    { id: 3, text: 'Read book' },
  ]);

  const deleteFirst = () => {
    // ลบ item แรก
    setTodos(todos.slice(1));
  };

  return (
    <div>
      <button onClick={deleteFirst}>Delete First Item</button>
      <ul>
        {todos.map((todo, index) => (
          // ❌ ใช้ index เป็น key
          <li key={index}>
            {todo.text}
            {/* Input นี้มี state ของตัวเอง */}
            <input placeholder="Add note..." />
          </li>
        ))}
      </ul>
    </div>
  );
}

// เกิด Bug:
// 1. User พิมพ์ "Important!" ใน input ของ "Buy milk"
// 2. กดปุ่ม Delete First Item
// 3. React เห็นว่า key=0 ยังอยู่ (ตอนนี้คือ "Go running")
// 4. React คิดว่า input ที่ key=0 ยังเป็นตัวเดิม
// 5. Bug! text ว่า "Go running" แต่ input ยังแสดง "Important!"
// State ของ input "หนีไป" อยู่กับ item ผิดตัว!
```

### Challenge 4.1.3

ลองสร้าง component ที่แสดง list ของชื่อนักเรียน และมีปุ่ม "Shuffle" สลับลำดับ ทดสอบด้วย index key vs id key แล้วสังเกตว่า input ข้างแต่ละชื่อมีพฤติกรรมต่างกันอย่างไร

::: details ✨ ดูเฉลย
```jsx
function StudentList() {
  const [students, setStudents] = React.useState([
    { id: 'stu-1', name: 'Alice' },
    { id: 'stu-2', name: 'Bob' },
    { id: 'stu-3', name: 'Charlie' },
  ]);

  const shuffle = () => {
    setStudents([...students].sort(() => Math.random() - 0.5));
  };

  return (
    <div>
      <button onClick={shuffle}>Shuffle</button>
      <ul>
        {students.map((student, index) => (
          // ลองเปลี่ยน key={student.id} เป็น key={index} เพื่อดู bug
          <li key={student.id}>
            {student.name}
            <input placeholder="Note..." />
          </li>
        ))}
      </ul>
    </div>
  );
}
// เมื่อใช้ key={student.id}: input ติดตาม student ไปถูกต้อง
// เมื่อใช้ key={index}: input อยู่กับตำแหน่ง ไม่ใช่ student
```
:::

## ✅ Correct Approach: การใช้ Stable ID เป็น Key

วิธีที่ถูกต้องคือใช้ค่าที่ **ไม่ซ้ำ** และ **ไม่เปลี่ยนแปลง** เป็น key ซึ่งโดยทั่วไปคือ ID ที่มาจาก database หรือที่สร้างขึ้นมาเอง

key ที่ดีต้องมีคุณสมบัติ 3 ข้อ: ไม่ซ้ำกันใน list เดียวกัน, ไม่เปลี่ยนแปลงตลอดอายุของ item, และ React ใช้เพื่อ reconciliation เท่านั้น (ไม่ส่งผ่านเป็น prop ไปยัง child)

```jsx
// ✅ ใช้ ID จาก database
function ProductList({ products }) {
  return (
    <ul>
      {products.map((product) => (
        // key ใช้ id ที่ไม่ซ้ำกันและไม่เปลี่ยน
        <li key={product.id}>
          {product.name} - ฿{product.price}
        </li>
      ))}
    </ul>
  );
}

// ✅ สร้าง ID เองด้วย crypto.randomUUID() เมื่อสร้าง item
function addTodo(text) {
  return {
    id: crypto.randomUUID(), // สร้าง UUID ที่ไม่ซ้ำกัน
    text: text,
    completed: false,
  };
}
// id จะเป็นอะไรทำนอง "550e8400-e29b-41d4-a716-446655440000"

// ❌ อย่าสร้าง key ใหม่ทุกครั้งที่ render
// key={Math.random()} ทำให้ React ถือว่า item เป็นตัวใหม่ทุก render
```

### Challenge 4.1.4

เมื่อไหรที่การใช้ index เป็น key ยอมรับได้? ให้ยกตัวอย่าง 2 กรณี

::: details ✨ ดูเฉลย
การใช้ index เป็น key ยอมรับได้เมื่อ:

1. **รายการที่ไม่เปลี่ยนแปลงลำดับ** — เช่น รายการเมนูนำทางที่ static ไม่มีการ sort หรือ filter
```jsx
const navItems = ['Home', 'About', 'Contact'];
navItems.map((item, index) => <NavLink key={index} to={item} />)
// ✅ OK เพราะรายการไม่เปลี่ยนลำดับ
```

2. **รายการที่ไม่มี internal state** — เช่น list ที่แสดงข้อความล้วนๆ ไม่มี input หรือ controlled elements
```jsx
const breadcrumbs = ['Home', 'Products', 'Electronics'];
breadcrumbs.map((crumb, index) => <span key={index}>{crumb}</span>)
// ✅ OK เพราะ span ไม่มี internal state
```

แต่ถ้ามีข้อสงสัย ใช้ unique ID ดีกว่าเสมอ
:::

## การ Render Component ที่ซับซ้อนใน `.map()`

ในโปรเจกต์จริง แต่ละ item ในรายการมักเป็น component ที่มีความซับซ้อน ไม่ใช่แค่ `<li>` เดียวๆ วิธีที่ดีคือแยก component ออกมาแล้วส่ง `key` ที่ component นั้นโดยตรง ไม่ใช่ที่ element ภายใน

การแยก component ออกมาช่วยให้โค้ดอ่านง่ายขึ้น, testable มากขึ้น, และ React ยังคงใช้ key เพื่อ reconciliation ได้อย่างถูกต้อง

```jsx
// แยก component ออกมา
function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>฿{product.price.toLocaleString()}</p>
      <button>เพิ่มลงตะกร้า</button>
    </div>
  );
}

// ✅ ส่ง key ที่ ProductCard โดยตรง (ไม่ใช่ที่ <div> ภายใน)
function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}    // key อยู่ที่นี่
          product={product}   // ส่ง data ทั้งหมดเป็น prop
        />
      ))}
    </div>
  );
}

// ❌ ผิด: ใส่ key ใน div ข้างใน ProductCard แทนที่จะใส่ที่ ProductCard
function WrongProductGrid({ products }) {
  return (
    <div>
      {products.map((product) => (
        <ProductCard product={product} /> // ❌ ไม่มี key!
      ))}
    </div>
  );
}
```

### Challenge 4.1.5

สร้าง `CommentCard` component และ `CommentList` component ที่ render list ของ comment แต่ละ comment มี `id`, `author`, `text`, `likes`

::: details ✨ ดูเฉลย
```jsx
// CommentCard component
function CommentCard({ comment }) {
  const [liked, setLiked] = React.useState(false);

  return (
    <div className="comment-card">
      <strong>{comment.author}</strong>
      <p>{comment.text}</p>
      <button onClick={() => setLiked(!liked)}>
        {liked ? '❤️' : '🤍'} {comment.likes + (liked ? 1 : 0)}
      </button>
    </div>
  );
}

// CommentList component
function CommentList({ comments }) {
  if (comments.length === 0) {
    return <p>ยังไม่มีความคิดเห็น</p>;
  }

  return (
    <div className="comment-list">
      <h3>ความคิดเห็น ({comments.length})</h3>
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

// ตัวอย่างการใช้งาน
const comments = [
  { id: 'c1', author: 'Alice', text: 'Great post!', likes: 5 },
  { id: 'c2', author: 'Bob', text: 'Very helpful', likes: 3 },
];
// <CommentList comments={comments} />
```
:::

## การ Filter และ Sort ก่อน Render

ในโลกจริง เราแทบไม่แสดงข้อมูลทุกอย่างตรงๆ เสมอ เรามักต้องการกรองข้อมูล (filter) หรือเรียงลำดับ (sort) ก่อน การทำ filter/sort ควรทำ **ก่อน** การ render ไม่ใช่ภายใน `.map()` เพื่อให้โค้ดสะอาด

::: tip เอกสารอ้างอิง
- [MDN: Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN: Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
:::

การ chain `.filter().sort().map()` เป็น pattern ที่ React developers ใช้กันมาก เพราะอ่านง่ายและทำงานได้ถูกต้อง ข้อสำคัญคือ `.sort()` mutate array ต้นฉบับ ต้องทำ copy ก่อนด้วย spread operator

```jsx
function FilteredProductList({ products, category, sortBy }) {
  // Step 1: Filter ก่อน
  const filtered = products.filter(
    (p) => category === 'all' || p.category === category
  );

  // Step 2: Sort (ต้อง copy ก่อนเพราะ .sort() mutate array ต้นฉบับ)
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // default: ไม่เรียง
  });

  // Step 3: Map เพื่อ render
  return (
    <div>
      <p>แสดง {sorted.length} จาก {products.length} สินค้า</p>
      {sorted.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
// เรียกใช้:
// <FilteredProductList products={allProducts} category="electronics" sortBy="price-asc" />
```

### Challenge 4.1.6

จาก array ของนักเรียนที่มี `id`, `name`, `grade` (A/B/C/D/F) ให้แสดงเฉพาะนักเรียนที่ได้เกรด A หรือ B เรียงตามชื่อ

::: details ✨ ดูเฉลย
```jsx
function HonorRollList({ students }) {
  const honorStudents = students
    .filter((s) => s.grade === 'A' || s.grade === 'B')
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h2>Honor Roll</h2>
      {honorStudents.length === 0 ? (
        <p>ไม่มีนักเรียนในรายการ</p>
      ) : (
        <ul>
          {honorStudents.map((student) => (
            <li key={student.id}>
              {student.name} — เกรด {student.grade}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ตัวอย่างข้อมูล:
const students = [
  { id: 1, name: 'Charlie', grade: 'B' },
  { id: 2, name: 'Alice', grade: 'A' },
  { id: 3, name: 'Bob', grade: 'C' },
  { id: 4, name: 'Diana', grade: 'A' },
];
// Output: Alice (A), Charlie (B), Diana (A)  [เรียงตามชื่อ]
```
:::

## ตาราง Comparison: Index Key vs ID Key vs Random Key

| เกณฑ์ | `key={index}` | `key={item.id}` | `key={Math.random()}` |
|---|---|---|---|
| ป้องกัน Warning | ✅ | ✅ | ✅ |
| Reconciliation ถูกต้อง | ⚠️ เฉพาะ static list | ✅ | ❌ |
| Performance | ⚠️ Re-render ทั้งหมดเมื่อเรียง | ✅ Re-render เฉพาะที่เปลี่ยน | ❌ Re-render ทุก item ทุกครั้ง |
| State ของ input ถูกต้อง | ❌ เมื่อมีการ reorder | ✅ | ❌ |
| เหมาะกับ list ที่มีการเพิ่ม/ลบ | ❌ | ✅ | ❌ |
| เหมาะกับ static list | ✅ | ✅ | ❌ |
| ใช้ในโปรเจกต์จริง | ⚠️ เฉพาะกรณีพิเศษ | ✅ แนะนำ | ❌ ไม่ควรใช้เลย |

## Real-World Use Case: Product List จาก API

ในแอพ e-commerce จริง เราต้องดึงข้อมูลสินค้าจาก API แล้วแสดงเป็นรายการ ต่อไปนี้เป็นตัวอย่างที่รวมทุกอย่างที่เรียนมา

สถานการณ์: หน้าสินค้าของร้าน MBK Center ออนไลน์ที่แสดงสินค้า, ให้กรองตามหมวด, เรียงตามราคา, และค้นหาตามชื่อ

```jsx
import React, { useState } from 'react';

// Component สำหรับแสดงสินค้าแต่ละชิ้น
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="category">{product.category}</p>
        <p className="price">฿{product.price.toLocaleString()}</p>
        {product.stock > 0 ? (
          <button onClick={() => onAddToCart(product)}>
            เพิ่มลงตะกร้า
          </button>
        ) : (
          <button disabled>สินค้าหมด</button>
        )}
      </div>
    </div>
  );
}

// Component หลักที่จัดการ filter และ sort
function ProductCatalog() {
  const [products] = useState([
    { id: 'p001', name: 'iPhone 15 Pro', category: 'มือถือ', price: 44900, stock: 5, imageUrl: '/iphone.jpg' },
    { id: 'p002', name: 'Samsung Galaxy S24', category: 'มือถือ', price: 35900, stock: 0, imageUrl: '/samsung.jpg' },
    { id: 'p003', name: 'MacBook Air M3', category: 'คอมพิวเตอร์', price: 42900, stock: 3, imageUrl: '/macbook.jpg' },
    { id: 'p004', name: 'AirPods Pro', category: 'อุปกรณ์เสริม', price: 9900, stock: 10, imageUrl: '/airpods.jpg' },
  ]);

  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState([]);

  // ดึงหมวดหมู่ที่ไม่ซ้ำกัน
  const categories = ['all', ...new Set(products.map((p) => p.category))];

  // กรองและเรียงสินค้า
  const displayedProducts = products
    .filter((p) => category === 'all' || p.category === category)
    .filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
    alert(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว!`);
  };

  return (
    <div className="catalog">
      <h1>สินค้าทั้งหมด</h1>

      {/* Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'ทุกหมวด' : cat}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="default">เรียงตามปกติ</option>
          <option value="price-asc">ราคา: น้อย→มาก</option>
          <option value="price-desc">ราคา: มาก→น้อย</option>
        </select>
      </div>

      {/* แสดงจำนวนสินค้า */}
      <p>แสดง {displayedProducts.length} จาก {products.length} สินค้า | ตะกร้า: {cart.length} ชิ้น</p>

      {/* Product Grid */}
      {displayedProducts.length === 0 ? (
        <p>ไม่พบสินค้าที่ค้นหา</p>
      ) : (
        <div className="product-grid">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}          // ✅ ใช้ ID ที่ไม่ซ้ำ
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
```

### Challenge 4.1.7 (โจทย์ท้าทาย)

เพิ่มฟีเจอร์ "แสดงเฉพาะสินค้าที่มีในสต็อก" ให้กับ `ProductCatalog` โดยเพิ่ม checkbox และ filter logic

::: details ✨ ดูเฉลย
```jsx
// เพิ่ม state
const [inStockOnly, setInStockOnly] = useState(false);

// เพิ่มใน filter chain
const displayedProducts = products
  .filter((p) => category === 'all' || p.category === category)
  .filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()))
  .filter((p) => !inStockOnly || p.stock > 0)  // เพิ่มบรรทัดนี้
  .sort((a, b) => { /* ... */ });

// เพิ่มใน JSX controls
<label>
  <input
    type="checkbox"
    checked={inStockOnly}
    onChange={(e) => setInStockOnly(e.target.checked)}
  />
  แสดงเฉพาะสินค้าที่มีในสต็อก
</label>
```
:::

## Glossary: คำศัพท์สำคัญ

| คำศัพท์ | ความหมาย |
|---|---|
| **Reconciliation** | กระบวนการที่ React เปรียบเทียบ Virtual DOM เก่าและใหม่เพื่อหาว่าส่วนไหนที่ต้องอัปเดตใน real DOM |
| **Virtual DOM** | สำเนาของ DOM ที่ React เก็บไว้ใน memory เพื่อเปรียบเทียบและลดการ render จริง |
| **key prop** | attribute พิเศษที่ React ใช้ระบุตัวตนของ element ในรายการเพื่อ reconciliation |
| **Expression** | โค้ด JavaScript ที่ประเมินค่าได้ (มีค่า return) ใช้ใน JSX ได้ เช่น `1+1`, `arr.map()` |
| **Statement** | คำสั่ง JavaScript ที่ทำงานแต่ไม่ส่งค่ากลับ เช่น `for`, `if` ใช้โดยตรงใน JSX ไม่ได้ |
| **Anti-pattern** | วิธีเขียนโค้ดที่ดูเหมือนแก้ปัญหาได้แต่ทำให้เกิดปัญหาอื่นในระยะยาว |
| **Stable ID** | ID ที่ไม่เปลี่ยนแปลงตลอดอายุของ item เหมาะใช้เป็น key prop |
| **Mutate** | การเปลี่ยนแปลงค่าของตัวแปรโดยตรง ซึ่ง React ตรวจจับไม่ได้หากทำกับ state โดยตรง |
| **filter()** | method ของ Array ที่ส่งค่ากลับเป็น array ใหม่ที่มีเฉพาะ item ที่ผ่านเงื่อนไข |
| **sort()** | method ของ Array ที่เรียงลำดับ item (mutate array ต้นฉบับ ควร copy ก่อน) |
| **UUID** | Universally Unique Identifier รหัสที่ไม่ซ้ำกันทั่วโลก สร้างได้ด้วย `crypto.randomUUID()` |
| **Re-render** | กระบวนการที่ React เรียก function component อีกครั้งเพื่ออัปเดต UI |

## สรุป

การ render รายการใน React มีหลักการสำคัญ 4 ข้อ:

1. ใช้ `.map()` ไม่ใช่ `for` loop ใน JSX เพราะ `.map()` เป็น expression
2. ใส่ `key` prop ที่ **ไม่ซ้ำ** และ **ไม่เปลี่ยนแปลง** ที่ component ที่อยู่ใน `.map()` โดยตรง
3. หลีกเลี่ยงการใช้ `index` เป็น key ยกเว้น list ที่ static และไม่มี internal state
4. ทำ filter/sort **ก่อน** `.map()` เพื่อโค้ดที่สะอาดและอ่านง่าย

👉 ไปต่อ: [4.2 - Complex State](/react/04-02-complex-state)
