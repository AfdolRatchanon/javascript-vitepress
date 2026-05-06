# 2.2 Props System — การส่งข้อมูลระหว่าง Component

> *"Props are to components what arguments are to functions."*
> — **Dan Abramov**, React Core Team (Props คืออาร์กิวเมนต์ของ Component)

## เปรียบเทียบให้เห็นภาพ

🏭 **ลองนึกภาพ Component เป็นเครื่องจักรในโรงงาน** — เครื่องทำขนม 1 เครื่อง สามารถผลิตได้ทั้งช็อกโกแลต, วนิลา, และสตรอว์เบอร์รี่ ขึ้นอยู่กับ "วัตถุดิบ" ที่ใส่เข้าไป Props คือวัตถุดิบนั้น — Component `<ProductCard>` เครื่องเดียว รับ Props ต่างกันก็แสดงสินค้าต่างกันได้ โดยไม่ต้องเขียน Component ใหม่

## Props คืออะไร?

> 📖 **อ่านเพิ่มเติม:** [React — Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)

**Props** (Properties) คือข้อมูลที่ Parent Component ส่งให้ Child Component โดยเขียนเหมือน HTML Attribute:

```jsx
// Parent ส่ง Props ให้ Child
function App() {
  return (
    <UserCard
      name="สมชาย ใจดี"
      age={25}
      isAdmin={true}
      skills={['React', 'Node.js', 'Python']}
    />
  )
}

// Child รับ Props ผ่าน Parameter แรก (object)
function UserCard(props) {
  console.log(props)
  // { name: 'สมชาย ใจดี', age: 25, isAdmin: true, skills: [...] }

  return (
    <div>
      <h2>{props.name}</h2>
      <p>อายุ {props.age} ปี</p>
      {props.isAdmin && <span>👑 Admin</span>}
    </div>
  )
}
```

### กฎที่สำคัญที่สุด: Props เป็น Read-Only!

Child ไม่มีสิทธิ์แก้ไข Props — ข้อมูลไหลทางเดียว (One-way Data Flow) จาก Parent → Child เสมอ:

```jsx
function Child(props) {
  // ❌ ห้าม! จะ Error
  props.name = 'ชื่อใหม่'

  // ✅ ถ้าอยากเปลี่ยน ต้องบอก Parent ผ่าน Callback
  return <button onClick={() => props.onNameChange('ชื่อใหม่')}>เปลี่ยนชื่อ</button>
}
```

> 💡 **ทำไม One-way Data Flow?** เพราะทำให้ Debug ง่าย — เราจะรู้เสมอว่าข้อมูลมาจากไหน และใครเปลี่ยนมัน

## Destructuring Props — วิธีที่นิยมใช้จริง

> 📖 **อ่านเพิ่มเติม:** [MDN — Destructuring Assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

แทนที่จะพิมพ์ `props.name`, `props.age` ทุกครั้ง ให้ใช้ ES6 Destructuring:

```jsx
// วิธีที่ 1: Destructure ใน Parameter
function UserCard({ name, age, isAdmin = false }) {
  // isAdmin มีค่า default เป็น false ถ้าไม่ส่งมา
  return (
    <div>
      <h2>{name}</h2>
      <p>{age} ปี</p>
      {isAdmin && <span>👑 Admin</span>}
    </div>
  )
}

// วิธีที่ 2: Destructure ใน Function Body
function UserCard(props) {
  const { name, age, isAdmin = false } = props
  return (...)
}

// วิธีที่ 3: Rest Pattern — รับ Props ที่เหลือทั้งหมด
function Button({ children, variant = 'primary', ...rest }) {
  return (
    <button
      className={`btn btn-${variant}`}
      {...rest}  // ส่ง Props ที่เหลือ (onClick, disabled, etc.) ลงไป
    >
      {children}
    </button>
  )
}
```

## ประเภทของข้อมูลที่ส่งผ่าน Props ได้

| ประเภท | ตัวอย่าง | วิธีส่ง |
|:-------|:---------|:--------|
| **String** | `name="สมชาย"` | ใส่ใน `""` โดยตรง |
| **Number** | `age={25}` | ใส่ใน `{}` |
| **Boolean** | `isAdmin={true}` หรือ `isAdmin` | `isAdmin` คือ `true` โดยปริยาย |
| **Array** | `items={['a', 'b']}` | ใส่ใน `{}` |
| **Object** | ดูตัวอย่างด้านล่าง | ใส่ใน `{}` ครอบ 2 ชั้น |
| **Function** | `onClick={handleClick}` | ใส่ใน `{}` |
| **JSX/Node** | ดูตัวอย่างด้านล่าง | ใส่ใน `{}` |
| **null/undefined** | `value={null}` | ใส่ใน `{}` |

```jsx
function DataDemo() {
  const user = { name: 'ต้น', age: 22 }
  const handleClick = () => alert('คลิกแล้ว!')

  return (
    <AllTypesCard
      text="ข้อความ"           // String
      count={42}               // Number
      isActive                 // Boolean true (shorthand)
      isVisible={false}        // Boolean false
      tags={['react', 'js']}   // Array
      profile={user}           // Object
      onAction={handleClick}   // Function
      icon={<span>⭐</span>}   // JSX Element
    />
  )
}
```

## Children Props — Props พิเศษสำหรับเนื้อหาภายใน

> 📖 **อ่านเพิ่มเติม:** [React — Passing JSX as Children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)

`children` คือ Props พิเศษที่รับเนื้อหาที่อยู่ระหว่าง Opening และ Closing Tag ของ Component:

```jsx
// Component ที่รับ children
function Card({ title, children }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {/* children คือทุกอย่างที่อยู่ระหว่าง <Card> ... </Card> */}
      {children}
    </div>
  )
}

// ใช้งาน — ใส่อะไรก็ได้ระหว่าง tag
function App() {
  return (
    <div>
      <Card title="โปรไฟล์">
        <p>ชื่อ: สมชาย</p>
        <p>อีเมล: somchai@example.com</p>
        <button>แก้ไข</button>
      </Card>

      <Card title="สถิติ">
        <ul>
          <li>โพสต์: 42</li>
          <li>ผู้ติดตาม: 1,234</li>
        </ul>
      </Card>
    </div>
  )
}
```

Pattern นี้เรียกว่า **Wrapper/Container Component** — สร้าง Layout หรือ Style ครั้งเดียว แล้วใส่เนื้อหาต่างๆ เข้าไปผ่าน `children`

## PropTypes — ตรวจสอบ Type โดยไม่ง้อ TypeScript

> 📖 **อ่านเพิ่มเติม:** [React — PropTypes](https://react.dev/reference/react/Component#static-proptypes)

**PropTypes** คือ Library ที่ช่วยตรวจสอบ Type ของ Props ในขณะ Development เพื่อ Catch Bug ก่อนที่จะขึ้น Production:

```bash
npm install prop-types
```

```jsx
import PropTypes from 'prop-types'

function UserCard({ name, age, isAdmin, skills, onEdit }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{age} ปี</p>
      {isAdmin && <span>👑 Admin</span>}
      <ul>{skills.map(s => <li key={s}>{s}</li>)}</ul>
      <button onClick={onEdit}>แก้ไข</button>
    </div>
  )
}

// ประกาศ PropTypes ไว้นอก Component
UserCard.propTypes = {
  name: PropTypes.string.isRequired,          // string, บังคับ
  age: PropTypes.number.isRequired,           // number, บังคับ
  isAdmin: PropTypes.bool,                    // bool, ไม่บังคับ
  skills: PropTypes.arrayOf(PropTypes.string), // array of strings
  onEdit: PropTypes.func,                     // function
}

// Default Props — ค่า default ถ้าไม่ส่ง Props มา
UserCard.defaultProps = {
  isAdmin: false,
  skills: [],
}
```

ถ้าส่ง Props ผิด Type จะเห็น Warning ใน Console:
```
Warning: Failed prop type: Invalid prop `age` of type `string` supplied
to `UserCard`, expected `number`.
```

### PropTypes ที่ใช้บ่อย

| PropTypes | ตรวจสอบว่า |
|:----------|:----------|
| `PropTypes.string` | เป็น string |
| `PropTypes.number` | เป็น number |
| `PropTypes.bool` | เป็น boolean |
| `PropTypes.func` | เป็น function |
| `PropTypes.array` | เป็น array |
| `PropTypes.object` | เป็น object |
| `PropTypes.node` | เป็นอะไรก็ได้ที่ Render ได้ (string, number, JSX) |
| `PropTypes.element` | เป็น React Element |
| `PropTypes.arrayOf(X)` | เป็น array ของ type X |
| `PropTypes.shape({...})` | เป็น object ที่มี shape ตามที่ระบุ |
| `PropTypes.oneOf(['a','b'])` | เป็นหนึ่งในค่าที่ระบุ |
| `.isRequired` | ต่อท้ายเพื่อทำให้บังคับส่งมา |

## Prop Drilling — ปัญหาที่ต้องรู้จัก

**Prop Drilling** คือเมื่อต้องส่ง Props ผ่านหลาย Layer ทั้งที่ Component กลางไม่ต้องการใช้:

```jsx
// ❌ Prop Drilling ปัญหา — user ต้องผ่าน B และ C ที่ไม่ได้ใช้
function A({ user }) {
  return <B user={user} />
}
function B({ user }) {
  return <C user={user} />  // B ไม่ได้ใช้ user เลย แค่ส่งผ่าน
}
function C({ user }) {
  return <p>{user.name}</p>  // C ต้องการ user จริงๆ
}
```

::: tip ⚡ แก้ไข Prop Drilling ในบท 12
เมื่อ Props ต้องส่งผ่านมากกว่า 2-3 Layer ให้ใช้ **Context API** (`useContext`) ซึ่งจะเรียนใน [Module 12: Global State](/react/12-01-context-api)
:::

## ตัวอย่าง Real-World: Design System Button

```jsx
import PropTypes from 'prop-types'

// Button Component ที่ Flexible และใช้ซ้ำได้ทั่วทั้งแอป
function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  ...rest
}) {
  const variantStyles = {
    primary: { backgroundColor: '#007bff', color: 'white', border: 'none' },
    secondary: { backgroundColor: '#6c757d', color: 'white', border: 'none' },
    outline: { backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff' },
    danger: { backgroundColor: '#dc3545', color: 'white', border: 'none' },
  }

  const sizeStyles = {
    sm: { padding: '4px 12px', fontSize: '0.85rem' },
    md: { padding: '8px 20px', fontSize: '1rem' },
    lg: { padding: '12px 28px', fontSize: '1.1rem' },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: 4,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'opacity 0.2s',
      }}
      {...rest}
    >
      {isLoading && <span>⏳</span>}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  onClick: PropTypes.func,
}

// ใช้งาน
function App() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button>ปุ่มธรรมดา</Button>
      <Button variant="danger" size="sm">ลบ</Button>
      <Button variant="outline" leftIcon="➕">เพิ่ม</Button>
      <Button isLoading>กำลังบันทึก</Button>
      <Button disabled>ปิดการใช้งาน</Button>
    </div>
  )
}
```

## Challenges

### Challenge 1: ส่ง Props ทุกประเภท
สร้าง `<ProductCard>` ที่รับ Props ต่อไปนี้ และแสดงข้อมูลให้ครบ:
- `name` (string)
- `price` (number)
- `rating` (number, 1-5)
- `inStock` (boolean)
- `tags` (array of strings)
- `onAddToCart` (function)

::: details ดูเฉลย
```jsx
function ProductCard({ name, price, rating, inStock, tags, onAddToCart }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, width: 250 }}>
      <h3>{name}</h3>
      <p style={{ fontSize: '1.5rem', color: '#e74c3c' }}>฿{price.toLocaleString()}</p>
      <p>{'⭐'.repeat(rating)} ({rating}/5)</p>
      <div>
        {tags.map(tag => (
          <span key={tag} style={{ backgroundColor: '#e9ecef', padding: '2px 8px', borderRadius: 12, marginRight: 4, fontSize: '0.8rem' }}>
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={onAddToCart}
        disabled={!inStock}
        style={{ marginTop: 12, width: '100%', padding: 8 }}
      >
        {inStock ? 'หยิบใส่ตะกร้า 🛒' : 'สินค้าหมด'}
      </button>
    </div>
  )
}
```
:::

### Challenge 2: Children Props
สร้าง `<Section>` Component ที่มี:
- `title` prop สำหรับหัวข้อ
- `icon` prop สำหรับ Emoji ด้านหน้า
- `children` สำหรับเนื้อหาภายใน
- `collapsible` boolean prop ที่ทำให้ซ่อน/แสดงเนื้อหาได้

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function Section({ title, icon, children, collapsible = false }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, marginBottom: 16 }}>
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', backgroundColor: '#f8f9fa',
          cursor: collapsible ? 'pointer' : 'default',
        }}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        <h3 style={{ margin: 0 }}>{icon} {title}</h3>
        {collapsible && <span>{isOpen ? '▲' : '▼'}</span>}
      </div>
      {isOpen && (
        <div style={{ padding: 16 }}>{children}</div>
      )}
    </div>
  )
}
```
:::

### Challenge 3: PropTypes
เพิ่ม PropTypes ให้ `<ProductCard>` จาก Challenge 1 โดย:
- ทุก Props เป็น required ยกเว้น `tags` (default เป็น `[]`)
- `rating` ต้องอยู่ระหว่าง 1-5 (ใช้ `PropTypes.number`)
- `onAddToCart` เป็น function

::: details ดูเฉลย
```jsx
import PropTypes from 'prop-types'

ProductCard.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  rating: PropTypes.number.isRequired,
  inStock: PropTypes.bool.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  onAddToCart: PropTypes.func.isRequired,
}

ProductCard.defaultProps = {
  tags: [],
}
```
:::

### Challenge 4: Spread Props
สร้าง `<Input>` Component ที่ครอบ `<input>` ธรรมดา โดยรับ `label` เพิ่มเติม และส่ง props ที่เหลือทั้งหมดลงไปที่ `<input>` ด้วย Spread Operator:

```jsx
// ควรใช้แบบนี้ได้:
<Input label="อีเมล" type="email" placeholder="your@email.com" required onChange={handleChange} />
```

::: details ดูเฉลย
```jsx
function Input({ label, id, ...inputProps }) {
  const inputId = id || label

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label htmlFor={inputId} style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', boxSizing: 'border-box' }}
        {...inputProps}  // ส่ง type, placeholder, required, onChange ฯลฯ ทั้งหมด
      />
    </div>
  )
}
```
:::

### Challenge 5: One-way Data Flow
อธิบายว่าทำไม Props ถึงเป็น Read-only และถ้าต้องการให้ Child แจ้ง Parent ว่ามีอะไรเปลี่ยนแปลง จะทำอย่างไร?

::: details ดูเฉลย
**ทำไม Read-only:** Props เป็น Read-only เพื่อรักษา "One-way Data Flow" — ข้อมูลไหลจาก Parent → Child เท่านั้น ถ้า Child แก้ไข Props ได้ จะเกิด "Two-way Data Flow" ที่ Debug ยากมาก

**วิธีให้ Child แจ้ง Parent:** ส่ง Callback Function ลงไปเป็น Prop แล้วให้ Child เรียกมัน:

```jsx
function Parent() {
  const [count, setCount] = useState(0)

  return <Counter value={count} onChange={setCount} />
}

function Counter({ value, onChange }) {
  return (
    <div>
      <span>{value}</span>
      {/* เรียก onChange (ซึ่งคือ setCount ของ Parent) */}
      <button onClick={() => onChange(value + 1)}>+1</button>
    </div>
  )
}
```
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Props** | Properties — ข้อมูลที่ Parent ส่งให้ Child Component |
| **Destructuring** | การแตก Object/Array ออกเป็นตัวแปรแยกๆ |
| **Default Props** | ค่า Default ของ Props ที่ไม่ได้ส่งมา |
| **Children Prop** | `children` — Props พิเศษสำหรับ JSX ที่อยู่ระหว่าง Tag |
| **PropTypes** | Library ตรวจสอบ Type ของ Props ใน Development |
| **One-way Data Flow** | ข้อมูลไหลจาก Parent → Child ทิศทางเดียว |
| **Prop Drilling** | การส่ง Props ผ่าน Component หลาย Layer ที่ไม่ต้องการใช้ |
| **Spread Operator** | `{...props}` — ขยาย Object ออกเป็น Key-Value |
| **Rest Pattern** | `{specific, ...rest}` — รับ Props ที่เหลือเป็น Object |
| **Wrapper Component** | Component ที่ใช้ `children` เพื่อครอบ Content อื่นๆ |
| **Callback Prop** | Function ที่ส่งผ่าน Props เพื่อให้ Child แจ้ง Parent |

👉 ไปต่อ: [👤 Project 2: User Profile Card](/react/02-project-user-profile)
