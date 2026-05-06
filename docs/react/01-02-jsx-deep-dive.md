# 1.2 JSX Deep Dive — 5 กฎเหล็กที่ต้องรู้

> *"JSX is just syntactic sugar for React.createElement() calls."*
> — **React Documentation** (JSX ไม่ใช่ HTML — เป็น JavaScript ที่แต่งตัวเป็น HTML)

## เปรียบเทียบให้เห็นภาพ

📝 **ลองนึกภาพ JSX เหมือนการเขียนสูตรอาหาร** — เชฟสามารถเขียนสูตรด้วยสัญลักษณ์พิเศษที่อ่านง่ายกว่า แต่ก่อนจะทำอาหารจริง ต้องแปลสูตรนั้นเป็นขั้นตอนภาษาพ่อครัวก่อน JSX ก็เช่นกัน — เราเขียน UI ให้อ่านง่ายคล้าย HTML แต่ Babel แปลงมันเป็น `React.createElement()` ก่อนส่งให้เบราว์เซอร์รัน

## JSX คืออะไร?

**JSX** (JavaScript XML) คือ Syntax Extension ของ JavaScript ที่ช่วยให้เราเขียน "HTML" ภายใน JavaScript ได้โดยตรง JSX ไม่ใช่ HTML จริงๆ — มันคือ **JavaScript** ที่ถูก Transform โดย Babel ให้กลายเป็น JavaScript ล้วนๆ

> 📖 **อ่านเพิ่มเติม:** [React — Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx)

ดูว่า Babel แปลง JSX อย่างไร:

```jsx
// สิ่งที่เราเขียน (JSX) — อ่านง่าย เข้าใจง่าย
const element = <h1 className="title">สวัสดี React!</h1>

// สิ่งที่ Babel แปลงให้ (JavaScript จริงๆ)
const element = React.createElement(
  'h1',
  { className: 'title' },
  'สวัสดี React!'
)
```

ดังนั้น JSX แค่ทำให้โค้ดอ่านง่ายขึ้น โดยไม่เสีย Performance ใดๆ

## 5 กฎเหล็กของ JSX

> 📖 **อ่านเพิ่มเติม:** [React — JSX Rules](https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)

### กฎ 1: ต้อง Return Element เดียว (Single Root Element)

JSX ที่ Return จาก Component ต้องถูกครอบด้วย Element เดียวเสมอ เพราะ `React.createElement()` ต้องการ Parent เดียว

```jsx
// ❌ ผิด — มี 2 Root Elements ระดับเดียวกัน
function Wrong() {
  return (
    <h1>หัวข้อ</h1>
    <p>เนื้อหา</p>
  )
}

// ✅ ถูก — ครอบด้วย div
function WithDiv() {
  return (
    <div>
      <h1>หัวข้อ</h1>
      <p>เนื้อหา</p>
    </div>
  )
}

// ✅ ถูก (และดีกว่า) — ใช้ Fragment ไม่ต้องเพิ่ม div ใน DOM
function WithFragment() {
  return (
    <>
      <h1>หัวข้อ</h1>
      <p>เนื้อหา</p>
    </>
  )
}
```

### กฎ 2: ต้องปิด Tag ทุกตัว (Close All Tags)

ใน HTML บางแท็กไม่ต้องปิด (เช่น `<br>`, `<img>`, `<input>`) แต่ใน JSX ต้องปิดเสมอ:

```jsx
// ❌ ผิด — HTML style
function Wrong() {
  return (
    <div>
      <img src="photo.jpg">
      <input type="text">
      <br>
    </div>
  )
}

// ✅ ถูก — JSX style (Self-closing)
function Correct() {
  return (
    <div>
      <img src="photo.jpg" />
      <input type="text" />
      <br />
    </div>
  )
}
```

### กฎ 3: ใช้ camelCase สำหรับ Attributes

JSX อยู่ใน JavaScript ดังนั้น attribute ต้องเป็น camelCase ไม่ใช่ HTML attribute แบบเดิม:

```jsx
// ❌ ผิด — HTML style
<button onclick="handleClick()" class="btn" tabindex="1">คลิก</button>

// ✅ ถูก — camelCase
<button onClick={handleClick} className="btn" tabIndex={1}>คลิก</button>
```

ตารางเปรียบเทียบ attribute ที่เปลี่ยนชื่อ:

| HTML Attribute | JSX Attribute | เหตุผล |
|:---|:---|:---|
| `class` | `className` | `class` เป็น Reserved Word ใน JS |
| `for` (label) | `htmlFor` | `for` เป็น Reserved Word ใน JS |
| `onclick` | `onClick` | camelCase |
| `onchange` | `onChange` | camelCase |
| `tabindex` | `tabIndex` | camelCase |
| `style="color:red"` | ดูตัวอย่างด้านล่าง | ต้องเป็น Object (ครอบ 2 ชั้น) |

### กฎ 4: Expression ต้องอยู่ใน `{}`

ทุกอย่างใน JSX ที่ไม่ใช่ HTML/JSX literal ต้องอยู่ใน curly braces `{}`:

```jsx
const name = 'สมชาย'
const isLoggedIn = true
const score = 95

function Profile() {
  return (
    <div>
      {/* ตัวแปร */}
      <p>สวัสดี, {name}!</p>

      {/* การคำนวณ */}
      <p>คะแนนของคุณ: {score * 2} / 200</p>

      {/* เรียกใช้ Method */}
      <p>วันนี้: {new Date().toLocaleDateString('th-TH')}</p>

      {/* Ternary Expression */}
      <p>{isLoggedIn ? 'ยินดีต้อนรับ' : 'กรุณาเข้าสู่ระบบ'}</p>

      {/* เรียก Function */}
      <p>{name.toUpperCase()}</p>
    </div>
  )
}
```

> ⚠️ **ข้อควรระวัง:** ใน `{}` ใส่ได้แค่ **Expression** (สิ่งที่ได้ค่ากลับมา) เท่านั้น ใส่ **Statement** ไม่ได้ เช่น `if/else`, `for loop`, `let/const`

### กฎ 5: Conditional Rendering ต้องใช้ Expression เท่านั้น

เพราะใส่ Statement ใน JSX ไม่ได้ การทำ Condition จึงต้องใช้ Expression:

```jsx
const isAdmin = true
const score = 85
const items = ['แอปเปิ้ล', 'กล้วย', 'ส้ม']

function Dashboard() {
  return (
    <div>
      {/* วิธี 1: Ternary Operator (ถ้า-ไม่ก็) */}
      {isAdmin ? <AdminPanel /> : <UserPanel />}

      {/* วิธี 2: && (Short-circuit) — แสดงแค่ตอน true */}
      {score >= 80 && <Badge text="เกียรตินิยม" />}

      {/* วิธี 3: ประกาศตัวแปรนอก JSX ก็ได้ */}
      {items.length > 0 ? (
        <ul>
          {items.map(item => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p>ไม่มีสินค้า</p>
      )}
    </div>
  )
}
```

> ⚠️ **Gotcha ของ `&&`:** ถ้า Expression ซ้ายเป็น `0` หรือ `NaN` React จะแสดง `0` ออกมาบนหน้าจอ! ใช้ Boolean เสมอ:

```jsx
// ❌ Bug! ถ้า items.length เป็น 0 จะแสดง "0" บนหน้าจอ
{items.length && <List items={items} />}

// ✅ ถูก — แปลงเป็น Boolean ก่อน
{items.length > 0 && <List items={items} />}
// หรือ
{!!items.length && <List items={items} />}
```

## JSX Fragments คืออะไร?

> 📖 **อ่านเพิ่มเติม:** [React — Fragment](https://react.dev/reference/react/Fragment)

**Fragment** (`<>...</>`) คือ Component พิเศษของ React ที่ใช้ครอบ Elements หลายตัวโดยไม่เพิ่ม DOM Node จริงๆ ใช้เมื่อต้องการ Single Root Element แต่ไม่อยากเพิ่ม `<div>` ที่ไม่จำเป็น:

```jsx
// ❌ เพิ่ม <div> ที่ไม่จำเป็น — กระทบ Style อาจเสีย Layout
function TableRow() {
  return (
    <div>
      <td>ชื่อ</td>
      <td>นามสกุล</td>
    </div>
  )
}

// ✅ ใช้ Fragment — ไม่มี DOM Node เพิ่ม
function TableRow() {
  return (
    <>
      <td>ชื่อ</td>
      <td>นามสกุล</td>
    </>
  )
}

// กรณีที่ต้องใส่ key (ใน list) ต้องใช้ <Fragment> แบบเต็ม
import { Fragment } from 'react'

function List({ items }) {
  return items.map(item => (
    <Fragment key={item.id}>
      <dt>{item.term}</dt>
      <dd>{item.description}</dd>
    </Fragment>
  ))
}
```

## Style ใน JSX

JSX ใช้ Inline Style เป็น JavaScript Object โดย property ต้องเป็น camelCase และค่าตัวเลขเป็น `number` (ไม่ต้องใส่ px):

```jsx
// Style เป็น Object — สังเกตว่ามี {{ }} สองชั้น
// ชั้นแรก = JSX Expression  {}
// ชั้นสอง = JavaScript Object {}
function StyledCard() {
  const cardStyle = {
    backgroundColor: '#f0f0f0',  // ไม่ใช่ background-color
    borderRadius: '8px',
    padding: 16,                  // 16px — ตัวเลขไม่ต้องใส่ px
    fontSize: '1rem',
    color: '#333',
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ color: 'blue', fontWeight: 'bold' }}>การ์ด</h2>
      <p>เนื้อหาการ์ด</p>
    </div>
  )
}
```

> 💡 **ในโปรเจกต์จริงแนะนำให้ใช้ CSS Modules หรือ Tailwind CSS แทน Inline Style** เพราะจัดการได้ง่ายกว่า (จะเรียนใน Module 8)

## Comments ใน JSX

การเขียน Comment ใน JSX แตกต่างจาก HTML:

```jsx
function Example() {
  return (
    <div>
      {/* นี่คือ Comment ใน JSX — ต้องอยู่ใน {} */}
      <p>เนื้อหา</p>

      {/* ❌ อย่าใช้แบบ HTML */}
      {/* <!-- นี่จะกลายเป็น Text ที่แสดงบนหน้าจอ --> */}

      {/* ✅ แบบนี้ถูกต้อง */}
      {/* TODO: เพิ่ม Loading State ที่นี่ */}
    </div>
  )
}
```

## ตัวอย่าง Real-World: Product Card Component

ดูการนำกฎทั้ง 5 ข้อไปใช้ร่วมกันในสถานการณ์จริง:

```jsx
// Component แสดงการ์ดสินค้า
function ProductCard({ name, price, imageUrl, isAvailable, discount }) {
  const discountedPrice = price - (price * discount / 100)

  return (
    // กฎ 1: Single Root (ใช้ Fragment)
    <>
      <article style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>

        {/* กฎ 2: ปิด Tag ด้วย / */}
        <img src={imageUrl} alt={name} />

        <h3>{name}</h3>  {/* กฎ 4: ใช้ {} สำหรับ Expression */}

        {/* กฎ 5: Conditional — แสดงราคาแบบมี/ไม่มี Discount */}
        {discount > 0 ? (
          <p>
            <s style={{ color: 'gray' }}>฿{price}</s>
            {' '}
            <strong style={{ color: 'red' }}>฿{discountedPrice.toFixed(0)}</strong>
            {' '}
            <span>(-{discount}%)</span>
          </p>
        ) : (
          <p>฿{price}</p>
        )}

        {/* && Short-circuit */}
        {isAvailable && (
          <button>หยิบใส่ตะกร้า</button>
        )}

        {!isAvailable && (
          <p style={{ color: 'gray' }}>สินค้าหมด</p>
        )}

      </article>
    </>
  )
}

// ใช้งาน
function App() {
  return (
    <ProductCard
      name="หูฟัง Sony"
      price={3500}
      imageUrl="/headphones.jpg"
      isAvailable={true}
      discount={20}
    />
  )
}
```

## Challenges

### Challenge 1: แก้ Bug JSX
โค้ดด้านล่างมีข้อผิดพลาดกี่จุด? ช่วยหาและแก้ไข:

```jsx
function BuggyComponent() {
  return (
    <div>
      <img src="photo.jpg">
      <label for="email">อีเมล</label>
      <input type="email" class="form-input" id="email">
      <button onclick="submit()">ส่ง</button>
    </div>
    <p>ขอบคุณ!</p>
  )
}
```

::: details ดูเฉลย
ข้อผิดพลาด 6 จุด:

1. **2 Root Elements** — `<div>` และ `<p>` ต้องครอบด้วย Fragment หรือ div
2. `<img src="photo.jpg">` → `<img src="photo.jpg" />`  (ต้องปิด tag)
3. `for="email"` → `htmlFor="email"` (camelCase)
4. `type="email"` ไม่มี error แต่ `<input>` ต้องปิด → `<input type="email" ... />`
5. `class="form-input"` → `className="form-input"`
6. `onclick="submit()"` → `onClick={submit}`

```jsx
function FixedComponent() {
  return (
    <>
      <div>
        <img src="photo.jpg" />
        <label htmlFor="email">อีเมล</label>
        <input type="email" className="form-input" id="email" />
        <button onClick={submit}>ส่ง</button>
      </div>
      <p>ขอบคุณ!</p>
    </>
  )
}
```
:::

### Challenge 2: JSX Expression
เขียน JSX ที่แสดง:
- ชื่อผู้ใช้จากตัวแปร `user = { name: 'สมหญิง', level: 5 }`
- ถ้า level >= 5 ให้แสดง Badge "⭐ VIP"
- แสดงวันที่ปัจจุบันแบบไทย

::: details ดูเฉลย
```jsx
const user = { name: 'สมหญิง', level: 5 }

function UserInfo() {
  return (
    <div>
      <h2>สวัสดี, {user.name}!</h2>
      {user.level >= 5 && <span>⭐ VIP</span>}
      <p>วันนี้: {new Date().toLocaleDateString('th-TH')}</p>
    </div>
  )
}
```
:::

### Challenge 3: Conditional Rendering
สร้าง Component `<WeatherCard>` ที่รับ prop `temperature` แล้ว:
- ถ้า >= 35°C → แสดง "🔥 ร้อนมาก" พื้นหลังสีส้ม
- ถ้า 25-34°C → แสดง "☀️ อากาศดี" พื้นหลังสีเหลือง
- ถ้า < 25°C → แสดง "❄️ เย็นสบาย" พื้นหลังสีฟ้า

::: details ดูเฉลย
```jsx
function WeatherCard({ temperature }) {
  let icon, message, bgColor

  if (temperature >= 35) {
    icon = '🔥'
    message = 'ร้อนมาก'
    bgColor = 'orange'
  } else if (temperature >= 25) {
    icon = '☀️'
    message = 'อากาศดี'
    bgColor = 'yellow'
  } else {
    icon = '❄️'
    message = 'เย็นสบาย'
    bgColor = 'lightblue'
  }

  return (
    <div style={{ backgroundColor: bgColor, padding: 16, borderRadius: 8 }}>
      <h2>{icon} {message}</h2>
      <p>{temperature}°C</p>
    </div>
  )
}
```

หมายเหตุ: สามารถประกาศตัวแปร/ใช้ `if/else` นอก JSX ได้ เพียงแค่ใน `return (...)` ต้องเป็น Expression เท่านั้น
:::

### Challenge 4: Fragment และ List
เขียน Component ที่แสดงรายการคำถาม-คำตอบ (FAQ) โดยแต่ละคู่ต้องอยู่ใน `<dt>` และ `<dd>` ภายใน `<dl>` (Definition List) โดยใช้ Fragment:

::: details ดูเฉลย
```jsx
import { Fragment } from 'react'

const faqs = [
  { id: 1, question: 'React คืออะไร?', answer: 'JavaScript Library สำหรับสร้าง UI' },
  { id: 2, question: 'JSX คืออะไร?', answer: 'Syntax Extension ของ JavaScript' },
]

function FAQ() {
  return (
    <dl>
      {faqs.map(faq => (
        <Fragment key={faq.id}>
          <dt><strong>{faq.question}</strong></dt>
          <dd>{faq.answer}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
```
:::

### Challenge 5: && Gotcha
โค้ดด้านล่างมี Bug อะไร? และแก้ไขอย่างไร?

```jsx
function Cart({ items }) {
  return (
    <div>
      {items.length && <p>มีสินค้า {items.length} ชิ้น</p>}
    </div>
  )
}
```

::: details ดูเฉลย
**Bug:** ถ้า `items` เป็น Array ว่าง (`[]`) → `items.length` จะเป็น `0` → React จะ Render `0` ออกมาบนหน้าจอ (ไม่ใช่ไม่แสดงอะไร)

**แก้ไข:**
```jsx
function Cart({ items }) {
  return (
    <div>
      {/* แปลงเป็น Boolean ก่อน */}
      {items.length > 0 && <p>มีสินค้า {items.length} ชิ้น</p>}
    </div>
  )
}
```
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **JSX** | JavaScript XML — Syntax Extension ที่ช่วยเขียน UI ใน JavaScript |
| **Babel** | Tool ที่แปลง JSX และ ES6+ เป็น JavaScript ที่เบราว์เซอร์เข้าใจ |
| **Transpile** | กระบวนการแปลง Source Code จากรูปแบบหนึ่งเป็นอีกรูปแบบ |
| **Fragment** | `<>...</>` — Container ที่ไม่สร้าง DOM Node จริง |
| **Self-closing Tag** | Tag ที่ปิดตัวเอง เช่น `<img />`, `<br />`, `<input />` |
| **camelCase** | รูปแบบตั้งชื่อที่ขึ้นต้นอักษรเล็ก คำต่อไปขึ้นต้นอักษรใหญ่ เช่น `onClick` |
| **Expression** | โค้ด JS ที่ได้ค่ากลับมา เช่น `1+1`, `user.name`, `isActive ? 'Yes' : 'No'` |
| **Statement** | คำสั่ง JS ที่ไม่ได้ค่ากลับ เช่น `if`, `for`, `let` |
| **Ternary Operator** | `condition ? valueIfTrue : valueIfFalse` |
| **Short-circuit** | `A && B` — ถ้า A เป็น falsy จะหยุดและไม่ Evaluate B |
| **Inline Style** | Style ที่เขียนตรงใน JSX เป็น JavaScript Object |
| **className** | Attribute แทน `class` ใน JSX |

👉 ไปต่อ: [🎨 Project 1: JSX Art Gallery](/react/01-project-jsx-art)
