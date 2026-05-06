# 3.1 Event Handling — จัดการ Events ใน React

> *"Every interaction is an event waiting to be handled."*
> — **แนวคิด Reactive Programming** ที่ React ยึดถือ

## เปรียบเทียบให้เห็นภาพ

🎯 **ลองนึกภาพ Event Handler เหมือนพนักงานรับโทรศัพท์** — เมื่อลูกค้าโทรมา (Event เกิด) พนักงาน (Handler) รับสาย (ทำงาน) แล้วจัดการตามที่ลูกค้าต้องการ React ทำแบบเดียวกัน — เมื่อผู้ใช้คลิก, พิมพ์, หรือ scroll (Event) React เรียก Function ที่เราบอกไว้ (Handler) เพื่อจัดการ

## Synthetic Events คืออะไร?

> 📖 **อ่านเพิ่มเติม:** [React — Responding to Events](https://react.dev/learn/responding-to-events)

React ไม่ได้ใช้ Browser Event ตรงๆ แต่ครอบด้วย **Synthetic Event** — Wrapper ที่ทำให้ Event ทำงานเหมือนกันทุกเบราว์เซอร์ (Cross-browser compatibility):

```jsx
function Button() {
  // event คือ SyntheticEvent ของ React (ไม่ใช่ Native Event)
  function handleClick(event) {
    console.log(event.type)      // "click"
    console.log(event.target)    // DOM Element ที่ถูกคลิก
    console.log(event.clientX)   // ตำแหน่ง X ที่คลิก
    event.preventDefault()       // หยุด Default Behavior
    event.stopPropagation()      // หยุด Event Bubbling
  }

  return <button onClick={handleClick}>คลิกฉัน</button>
}
```

| | Native Event (JS ปกติ) | Synthetic Event (React) |
|:---|:---|:---|
| **Cross-browser** | ❌ ต้องจัดการเอง | ✅ React จัดการให้ |
| **API** | ต่างกันแต่ละ browser | เหมือนกันทุก browser |
| **Performance** | Direct | ผ่าน Event Delegation |
| **Cleanup** | ต้อง removeEventListener เอง | React ทำให้อัตโนมัติ |

## วิธีเพิ่ม Event Handler

> 📖 **อ่านเพิ่มเติม:** [React — Adding Event Handlers](https://react.dev/learn/responding-to-events#adding-event-handlers)

```jsx
// วิธีที่ 1: Arrow Function (Inline) — เขียนง่าย เหมาะกับ Logic สั้นๆ
function App() {
  return <button onClick={() => alert('คลิกแล้ว!')}>คลิก</button>
}

// วิธีที่ 2: Named Function — เขียนแยก เหมาะกับ Logic ยาวๆ
function App() {
  function handleClick() {
    alert('คลิกแล้ว!')
  }

  return <button onClick={handleClick}>คลิก</button>
  //                       ↑ ส่งแค่ Reference! ไม่ใส่ ()
  //                         onClick={handleClick}  ✅
  //                         onClick={handleClick()} ❌ เรียกทันทีตอน Render!
}

// วิธีที่ 3: Arrow Function ใน Class — นิยมใช้กับ Event ที่ต้องการ this
// (ไม่ค่อยจำเป็นใน Functional Components)
```

> ⚠️ **ข้อควรระวัง:** อย่าใส่ `()` ต่อท้าย Handler — `onClick={handleClick}` คือส่ง Function, `onClick={handleClick()}` คือ **เรียก Function ทันที** แล้วส่งผลลัพธ์ (ซึ่งมักเป็น `undefined`)

## Events ที่ใช้บ่อยที่สุด

| Event | Attribute | ใช้กับ |
|:------|:----------|:-------|
| คลิก | `onClick` | button, div, a, img |
| เปลี่ยนค่า | `onChange` | input, select, textarea |
| Submit Form | `onSubmit` | form |
| เอา Mouse วาง | `onMouseEnter` | ทุก Element |
| เอา Mouse ออก | `onMouseLeave` | ทุก Element |
| กด Keyboard | `onKeyDown` | input, textarea |
| Focus | `onFocus` | input, button |
| Blur (เสีย Focus) | `onBlur` | input, button |
| Scroll | `onScroll` | div, window |
| Double Click | `onDoubleClick` | ทุก Element |

## การส่ง Argument เข้า Handler

บางครั้งต้องการส่งข้อมูลเพิ่มเติมเข้าไปใน Handler:

```jsx
const products = [
  { id: 1, name: 'React Book', price: 350 },
  { id: 2, name: 'JS Course', price: 1500 },
]

function ProductList() {
  function handleAddToCart(productId, productName) {
    console.log(`เพิ่ม ${productName} (ID: ${productId}) ลงตะกร้า`)
  }

  function handleDelete(id, event) {
    event.stopPropagation()  // ป้องกัน event ไปถึง parent
    console.log(`ลบ item ${id}`)
  }

  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          <span>{product.name} — ฿{product.price}</span>

          {/* ✅ ใช้ Arrow Function เพื่อส่ง Argument */}
          <button onClick={() => handleAddToCart(product.id, product.name)}>
            หยิบใส่ตะกร้า
          </button>

          {/* ✅ ส่งทั้ง argument และ event object */}
          <button onClick={(e) => handleDelete(product.id, e)}>
            ลบ
          </button>
        </li>
      ))}
    </ul>
  )
}
```

## Event Object ที่ควรรู้จัก

```jsx
function EventDemo() {
  function handleInput(event) {
    console.log(event.target.value)    // ค่าที่พิมพ์ใน input
    console.log(event.target.name)     // attribute name ของ input
    console.log(event.target.checked)  // สำหรับ checkbox
  }

  function handleKeyDown(event) {
    console.log(event.key)    // 'Enter', 'Escape', 'a', 'A', ...
    console.log(event.code)   // 'KeyA', 'Enter', 'Space', ...
    console.log(event.ctrlKey)  // true ถ้ากด Ctrl ด้วย

    // ทำงานเฉพาะเมื่อกด Enter
    if (event.key === 'Enter') {
      console.log('กด Enter!')
    }
  }

  function handleMouseMove(event) {
    console.log(event.clientX, event.clientY)  // ตำแหน่งบนหน้าจอ
    console.log(event.pageX, event.pageY)      // ตำแหน่งบน Document
  }

  function handleSubmit(event) {
    event.preventDefault()  // ป้องกัน Form จาก Reload หน้า
    console.log('Form submitted!')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" onChange={handleInput} onKeyDown={handleKeyDown} />
      <div onMouseMove={handleMouseMove} style={{ width: 200, height: 100, backgroundColor: '#f0f0f0' }}>
        Move mouse here
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Event Bubbling และ stopPropagation

**Event Bubbling** คือเมื่อ Event เกิดที่ Child มันจะ "ฟอง" ขึ้นไปถึง Parent ด้วย:

```jsx
function BubblingExample() {
  return (
    <div onClick={() => console.log('DIV ถูก click')} style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
      <button onClick={() => console.log('BUTTON ถูก click')}>
        คลิกฉัน
      </button>
      {/* เมื่อคลิก button จะเห็น:
          BUTTON ถูก click
          DIV ถูก click   ← Bubbling! */}
    </div>
  )
}

// หยุด Bubbling ด้วย stopPropagation
function NoBubblingExample() {
  return (
    <div onClick={() => console.log('DIV click')} style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
      <button onClick={(e) => {
        e.stopPropagation()  // หยุดไม่ให้ขึ้นไป DIV
        console.log('BUTTON click only')
      }}>
        คลิกฉัน (ไม่ Bubble)
      </button>
    </div>
  )
}
```

## Hover Effects ด้วย onMouseEnter/Leave

```jsx
import { useState } from 'react'

function HoverButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '10px 24px',
        backgroundColor: isHovered ? '#0056b3' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s',
      }}
    >
      {isHovered ? '🎯 คลิกเลย!' : 'Hover ฉัน'}
    </button>
  )
}
```

## ตัวอย่าง Real-World: Dropdown Menu

```jsx
import { useState } from 'react'

function Dropdown({ trigger, items }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleItemClick(item) {
    item.onClick?.()   // เรียก onClick ของ item (ถ้ามี)
    setIsOpen(false)   // ปิด Dropdown
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        {trigger} {isOpen ? '▲' : '▼'}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop — คลิกนอก Menu เพื่อปิด */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10,
            }}
          />
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '4px 0',
            margin: 0,
            listStyle: 'none',
            zIndex: 20,
            minWidth: 150,
          }}>
            {items.map((item, index) => (
              <li
                key={index}
                onClick={() => handleItemClick(item)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  color: item.danger ? '#dc3545' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ใช้งาน
function App() {
  return (
    <Dropdown
      trigger="⚙️ การตั้งค่า"
      items={[
        { label: 'โปรไฟล์', icon: '👤', onClick: () => alert('โปรไฟล์') },
        { label: 'แจ้งเตือน', icon: '🔔', onClick: () => alert('แจ้งเตือน') },
        { label: 'ออกจากระบบ', icon: '🚪', danger: true, onClick: () => alert('logout') },
      ]}
    />
  )
}
```

## Challenges

### Challenge 1: onClick กับ Argument
สร้าง Voting Component ที่มีปุ่ม "👍 ถูกใจ" และ "👎 ไม่ถูกใจ" ซึ่งเรียก Handler เดียวกันแต่ส่ง type ต่างกัน:

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function VotingCard() {
  const [votes, setVotes] = useState({ up: 0, down: 0 })

  function handleVote(type) {
    setVotes(prev => ({ ...prev, [type]: prev[type] + 1 }))
  }

  return (
    <div>
      <button onClick={() => handleVote('up')}>👍 {votes.up}</button>
      <button onClick={() => handleVote('down')}>👎 {votes.down}</button>
    </div>
  )
}
```
:::

### Challenge 2: onKeyDown
สร้าง Search Box ที่ทำงานเมื่อกด Enter (ไม่ใช้ปุ่ม Submit):

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function SearchBox({ onSearch }) {
  const [query, setQuery] = useState('')

  function handleKeyDown(event) {
    if (event.key === 'Enter' && query.trim()) {
      onSearch(query)
    }
    if (event.key === 'Escape') {
      setQuery('')
    }
  }

  return (
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="ค้นหา... (Enter เพื่อค้น, Esc เพื่อล้าง)"
      style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', width: 300 }}
    />
  )
}
```
:::

### Challenge 3: stopPropagation
สร้าง Card ที่ทั้งใบคลิกได้ (navigate) แต่ปุ่ม "ลบ" ภายในไม่ให้ trigger navigation:

::: details ดูเฉลย
```jsx
function ArticleCard({ article, onNavigate, onDelete }) {
  return (
    <div
      onClick={() => onNavigate(article.id)}
      style={{ border: '1px solid #ddd', padding: 16, cursor: 'pointer' }}
    >
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <button
        onClick={(e) => {
          e.stopPropagation()  // ป้องกัน Bubble ไปที่ div
          onDelete(article.id)
        }}
        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 4 }}
      >
        ลบ
      </button>
    </div>
  )
}
```
:::

### Challenge 4: Form onSubmit
สร้าง Comment Form ที่:
- ป้องกัน Default Form Submit ด้วย `preventDefault()`
- Log ค่า comment เมื่อ Submit
- Clear form หลัง Submit

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function CommentForm() {
  const [comment, setComment] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!comment.trim()) return
    console.log('Comment:', comment)
    setComment('')  // Clear
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="เขียน Comment..."
        rows={3}
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />
      <button type="submit">ส่ง Comment</button>
    </form>
  )
}
```
:::

### Challenge 5: onMouseEnter/Leave
สร้าง Tooltip Component ที่แสดง Tooltip เมื่อ Hover บน element:

```jsx
<Tooltip text="คำอธิบายเพิ่มเติม">
  <button>Hover ฉัน</button>
</Tooltip>
```

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          zIndex: 100,
          marginBottom: 4,
        }}>
          {text}
        </div>
      )}
    </div>
  )
}
```
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Synthetic Event** | Wrapper ของ React บน Native Event เพื่อ Cross-browser compat |
| **Event Handler** | Function ที่ถูกเรียกเมื่อ Event เกิดขึ้น |
| **Event Delegation** | React รับ Event ที่ Root แล้วส่งต่อ แทนที่จะ Attach ทุก Element |
| **Event Bubbling** | Event ที่เกิดที่ Child จะ "ฟอง" ขึ้นไปถึง Parent |
| **stopPropagation** | หยุด Event ไม่ให้ Bubble ขึ้นไป Parent |
| **preventDefault** | หยุด Default Behavior ของ Browser (เช่น Form Submit → Reload) |
| **onClick** | Event เมื่อคลิก |
| **onChange** | Event เมื่อค่าใน Input เปลี่ยน |
| **onSubmit** | Event เมื่อ Form ถูก Submit |
| **onKeyDown** | Event เมื่อกดปุ่ม Keyboard |
| **event.target** | DOM Element ที่ trigger Event |
| **event.currentTarget** | DOM Element ที่ผูก Handler ไว้ |

👉 ไปต่อ: [3.2 useState Hook — จัดการ State ใน Component](/react/03-02-usestate-basics)
