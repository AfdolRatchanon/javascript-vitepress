# 3.2 useState Hook — จัดการ State ใน Component

> *"State is the memory of a component."*
> — **React Documentation** (State คือความจำของ Component)

## เปรียบเทียบให้เห็นภาพ

🧠 **State เหมือนกับ "ความจำ" ของ Component** — ลองนึกภาพ Component คือ Barista ที่ชงกาแฟ ถ้าไม่มีความจำ (State) Barista จะจำไม่ได้ว่าลูกค้าขอกาแฟกี่แก้ว เพิ่มน้ำตาลหรือเปล่า ต้องการ Extra Shot ไหม State คือสิ่งที่ทำให้ Component "จำ" ข้อมูลระหว่าง Render และเมื่อ State เปลี่ยน Component ก็ Render ใหม่โดยอัตโนมัติ

## State vs Variable ธรรมดา

ก่อนเรียน useState ต้องเข้าใจก่อนว่าทำไมถึงไม่ใช้ตัวแปรธรรมดา:

```jsx
// ❌ ไม่ทำงาน — React ไม่รู้ว่า count เปลี่ยน → ไม่ Render ใหม่
function BrokenCounter() {
  let count = 0  // ตัวแปรธรรมดา — ถูก Reset เป็น 0 ทุกครั้งที่ Render

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => { count++ }}>+1</button>
      {/* คลิกแล้ว count++ แต่หน้าจอไม่เปลี่ยน! */}
    </div>
  )
}

// ✅ ทำงาน — React ติดตาม state → Render ใหม่เมื่อเปลี่ยน
import { useState } from 'react'

function WorkingCounter() {
  const [count, setCount] = useState(0)  // state ถูก "จำ" ระหว่าง Render

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

| | ตัวแปรธรรมดา | useState |
|:---|:---|:---|
| **จำระหว่าง Render** | ❌ Reset ทุกครั้ง | ✅ จำค่าเดิมไว้ |
| **Trigger Re-render** | ❌ ไม่ | ✅ ทำให้ Render ใหม่ |
| **ใช้ใน Component** | ได้ (สำหรับ Calculation ชั่วคราว) | ได้ (สำหรับข้อมูลที่ต้องแสดงผล) |

## useState พื้นฐาน

> 📖 **อ่านเพิ่มเติม:** [React — useState Reference](https://react.dev/reference/react/useState)

```jsx
import { useState } from 'react'

function Counter() {
  // Syntax: const [stateValue, setterFunction] = useState(initialValue)
  const [count, setCount] = useState(0)
  //     ↑ ค่า state   ↑ function สำหรับเปลี่ยน state   ↑ ค่าเริ่มต้น

  return (
    <div>
      <h2>นับ: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}
```

**กฎสำคัญของ useState:**
1. ต้อง `import { useState } from 'react'` ก่อน
2. เรียกใช้ที่ **Top Level** ของ Component เท่านั้น (ไม่อยู่ใน if/for/nested function)
3. ชื่อ setter มักตั้งว่า `set` + ชื่อ state เช่น `setCount`, `setName`, `setIsOpen`
4. **อย่าแก้ state ตรงๆ** — ต้องใช้ setter เสมอ

## State ทุกประเภท

useState ใส่ได้ทุก JavaScript Type:

```jsx
function AllTypesState() {
  const [name, setName] = useState('')                          // String
  const [age, setAge] = useState(0)                            // Number
  const [isVisible, setIsVisible] = useState(false)           // Boolean
  const [items, setItems] = useState([])                       // Array
  const [user, setUser] = useState(null)                       // null/Object
  const [status, setStatus] = useState('idle')                 // String Enum

  return (
    <div>
      {/* Toggle Boolean */}
      <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'ซ่อน' : 'แสดง'}
      </button>

      {/* Update String */}
      <input value={name} onChange={e => setName(e.target.value)} />

      {/* Update Number */}
      <button onClick={() => setAge(age + 1)}>อายุ {age}</button>
    </div>
  )
}
```

## Functional Update — กรณีพิเศษที่ต้องรู้

เมื่อ State ใหม่ขึ้นอยู่กับ State เก่า ให้ใช้ **Functional Form** เพื่อความปลอดภัย:

```jsx
function SafeCounter() {
  const [count, setCount] = useState(0)

  // ❌ อาจผิดพลาดถ้า React batching หลาย update พร้อมกัน
  function addThreeWrong() {
    setCount(count + 1)  // count = 0, set เป็น 1
    setCount(count + 1)  // count ยังเป็น 0! set เป็น 1 (ไม่ใช่ 2)
    setCount(count + 1)  // count ยังเป็น 0! set เป็น 1 (ไม่ใช่ 3)
    // ผลลัพธ์: count = 1 (ไม่ใช่ 3 ที่อยากได้)
  }

  // ✅ ถูกต้อง — ใช้ prev (ค่าล่าสุด)
  function addThreeCorrect() {
    setCount(prev => prev + 1)  // prev = 0, ได้ 1
    setCount(prev => prev + 1)  // prev = 1, ได้ 2
    setCount(prev => prev + 1)  // prev = 2, ได้ 3
    // ผลลัพธ์: count = 3 ✅
  }

  return (
    <div>
      <p>{count}</p>
      <button onClick={addThreeWrong}>+3 (แบบผิด)</button>
      <button onClick={addThreeCorrect}>+3 (แบบถูก)</button>
    </div>
  )
}
```

**กฎ:** เมื่อ new state ขึ้นอยู่กับ old state เสมอ → ใช้ Functional Form `setState(prev => ...)`

## State Batching — React อัปเดตพร้อมกัน

React ใน Version 18+ จะ **Batch** การอัปเดต State หลายๆ ครั้งในกิจกรรมเดียวให้เป็น Render เดียว เพื่อประสิทธิภาพ:

```jsx
function BatchExample() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  function handleClick() {
    setCount(count + 1)   // ไม่ Render ทันที
    setText('อัปเดต')    // ไม่ Render ทันที
    // React รวมทั้งสองและ Render แค่ครั้งเดียว! → ประหยัด
  }

  return (
    <div>
      <p>{count} — {text}</p>
      <button onClick={handleClick}>อัปเดตพร้อมกัน</button>
    </div>
  )
}
```

> 💡 **ทำไม State ไม่เปลี่ยนทันทีหลัง `setState`?** เพราะ React Batch การ Render ไว้ทีหลัง ถ้าต้องการค่าล่าสุดให้ใช้ Functional Update หรือ `useEffect`

## หลาย State ใน Component เดียว

```jsx
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')  // clear error
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (email === 'admin@test.com' && password === '1234') {
        alert('เข้าสู่ระบบสำเร็จ!')
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, padding: 24 }}>
      <h2>เข้าสู่ระบบ</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: 12 }}>
        <label>อีเมล</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>รหัสผ่าน</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button type="submit" disabled={isLoading} style={{ width: '100%', padding: 10 }}>
        {isLoading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  )
}
```

## Props vs State — ต่างกันอย่างไร?

| | Props | State |
|:---|:---|:---|
| **มาจาก** | Parent Component | Component ตัวเอง |
| **เปลี่ยนได้ไหม?** | ❌ Read-only | ✅ เปลี่ยนด้วย setter |
| **ทำให้ Render ใหม่** | ✅ เมื่อ Parent ส่งค่าใหม่ | ✅ เมื่อเรียก setter |
| **ใครควบคุม** | Parent | Component ตัวเอง |
| **ตัวอย่าง** | `name`, `onClick`, `price` | `isOpen`, `count`, `inputValue` |

**กฎง่ายๆ สำหรับเลือก:** ถ้าข้อมูลนี้ถูกส่งมาจาก Parent → Props, ถ้า Component ตัดสินใจเอง → State

## ตัวอย่าง Real-World: Accordion FAQ

```jsx
import { useState } from 'react'

const faqs = [
  { id: 1, question: 'React คืออะไร?', answer: 'JavaScript Library สำหรับสร้าง UI...' },
  { id: 2, question: 'Hooks คืออะไร?', answer: 'Functions ที่ให้ Functional Component มี State และ Lifecycle...' },
  { id: 3, question: 'Virtual DOM ดียังไง?', answer: 'ทำให้ React อัปเดต DOM น้อยที่สุด ทำให้เร็วขึ้น...' },
]

function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '14px 16px', border: 'none',
          backgroundColor: isOpen ? '#EBF8FF' : 'white', cursor: 'pointer',
          fontWeight: isOpen ? 'bold' : 'normal', fontSize: '1rem',
          borderRadius: isOpen ? '6px 6px 0 0' : 6,
        }}
      >
        <span>{question}</span>
        <span style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '12px 16px', backgroundColor: 'white', color: '#4A5568' }}>
          {answer}
        </div>
      )}
    </div>
  )
}

function FAQ() {
  const [openId, setOpenId] = useState(null)  // เก็บ id ที่กำลัง open

  function handleToggle(id) {
    // ถ้ากดตัวที่ open อยู่แล้ว → ปิด, ถ้ากดตัวอื่น → เปลี่ยน
    setOpenId(openId === id ? null : id)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>❓ คำถามที่พบบ่อย</h2>
      {faqs.map(faq => (
        <AccordionItem
          key={faq.id}
          question={faq.question}
          answer={faq.answer}
          isOpen={openId === faq.id}
          onToggle={() => handleToggle(faq.id)}
        />
      ))}
    </div>
  )
}
```

## Challenges

### Challenge 1: Toggle State
สร้าง `<LightSwitch>` ที่:
- เริ่มต้น OFF
- คลิกเพื่อสลับ ON/OFF
- เปลี่ยนสีพื้นหลังของหน้าตามสถานะ (เหลืองเมื่อ ON, เทาเมื่อ OFF)

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function LightSwitch() {
  const [isOn, setIsOn] = useState(false)

  return (
    <div style={{
      minHeight: '200px',
      backgroundColor: isOn ? '#fef9c3' : '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.3s',
    }}>
      <button
        onClick={() => setIsOn(!isOn)}
        style={{
          fontSize: '3rem',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
      >
        {isOn ? '💡' : '🔦'}
      </button>
      <p>{isOn ? 'เปิดไฟ' : 'ปิดไฟ'}</p>
    </div>
  )
}
```
:::

### Challenge 2: Multiple State
สร้าง `<TemperatureConverter>` ที่:
- มี 2 input: Celsius และ Fahrenheit
- เมื่อแก้ไขอันใดอันหนึ่ง อีกอันจะคำนวณและแสดงโดยอัตโนมัติ

สูตร: `F = C × 9/5 + 32`

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function TemperatureConverter() {
  const [celsius, setCelsius] = useState('')
  const [fahrenheit, setFahrenheit] = useState('')

  function handleCelsiusChange(e) {
    const c = e.target.value
    setCelsius(c)
    setFahrenheit(c === '' ? '' : ((parseFloat(c) * 9/5 + 32).toFixed(1)))
  }

  function handleFahrenheitChange(e) {
    const f = e.target.value
    setFahrenheit(f)
    setCelsius(f === '' ? '' : (((parseFloat(f) - 32) * 5/9).toFixed(1)))
  }

  return (
    <div>
      <label>Celsius: <input type="number" value={celsius} onChange={handleCelsiusChange} /></label>
      <label>Fahrenheit: <input type="number" value={fahrenheit} onChange={handleFahrenheitChange} /></label>
    </div>
  )
}
```
:::

### Challenge 3: Functional Update
สร้าง Clicker Game ที่:
- มีปุ่ม "+1", "+5", "+10"
- มีปุ่ม "Double!" ที่เพิ่มเป็น 2 เท่าของค่าปัจจุบัน
- ทุกปุ่มต้องใช้ Functional Update form

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function ClickerGame() {
  const [score, setScore] = useState(0)

  return (
    <div>
      <h2>คะแนน: {score.toLocaleString()}</h2>
      <button onClick={() => setScore(prev => prev + 1)}>+1</button>
      <button onClick={() => setScore(prev => prev + 5)}>+5</button>
      <button onClick={() => setScore(prev => prev + 10)}>+10</button>
      <button onClick={() => setScore(prev => prev * 2)}>Double! 🔥</button>
      <button onClick={() => setScore(0)}>Reset</button>
    </div>
  )
}
```
:::

### Challenge 4: Derive State
สร้าง Character Counter สำหรับ Tweet/Post:
- Textarea สำหรับพิมพ์
- แสดง "X/280 ตัวอักษร"
- สีเปลี่ยนตามจำนวน: เขียว (<200), เหลือง (200-260), แดง (>260)
- ปุ่ม Post จะ disabled เมื่อ >280 หรือ ว่าง

หมายเหตุ: ไม่ต้องสร้าง State สำหรับ count — คำนวณจาก text.length ได้เลย

::: details ดูเฉลย
```jsx
import { useState } from 'react'

function TweetComposer() {
  const [text, setText] = useState('')
  const MAX = 280
  const count = text.length  // Derived — ไม่ต้องมี State แยก
  const remaining = MAX - count
  const color = count > 260 ? 'red' : count > 200 ? 'orange' : 'green'

  return (
    <div style={{ maxWidth: 500, padding: 16 }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        style={{ width: '100%', padding: 8, fontSize: '1rem' }}
        placeholder="เกิดอะไรขึ้น?"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color, fontWeight: 'bold' }}>
          {remaining >= 0 ? `${remaining} ตัวอักษรเหลือ` : `เกิน ${Math.abs(remaining)} ตัว!`}
        </span>
        <button disabled={count === 0 || count > MAX}>
          โพสต์
        </button>
      </div>
    </div>
  )
}
```
:::

### Challenge 5: State ไหนเป็น State?
จากรายการด้านล่าง อะไรควรเป็น State อะไรไม่ควร?

```
1. รายชื่อ items ที่ดึงจาก API
2. ผลรวมของราคาสินค้า (คำนวณจาก items)
3. ว่า Modal เปิดหรือปิดอยู่
4. ชื่อผู้ใช้ที่ส่งมาเป็น Prop
5. ค่าที่พิมพ์ใน Search Input
6. วันที่ปัจจุบัน (ใช้ new Date())
```

::: details ดูเฉลย
| ข้อ | เป็น State? | เหตุผล |
|:----|:------------|:--------|
| 1. items จาก API | ✅ | เปลี่ยนได้ (refetch) ต้องทำให้ Render ใหม่ |
| 2. ผลรวมราคา | ❌ | คำนวณจาก items ได้เลย (Derived) |
| 3. Modal เปิด/ปิด | ✅ | เปลี่ยนได้เมื่อผู้ใช้คลิก |
| 4. ชื่อจาก Prop | ❌ | มาจาก Parent — เป็น Prop ไม่ใช่ State |
| 5. ค่าใน Search Input | ✅ | เปลี่ยนทุกครั้งที่พิมพ์ ต้อง Re-render |
| 6. วันที่ปัจจุบัน | ❌ | คำนวณได้ตอน Render ไม่ต้องเก็บ |
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **State** | ข้อมูลที่ Component "จำ" และทำให้ Render ใหม่เมื่อเปลี่ยน |
| **useState** | Hook สำหรับสร้างและจัดการ State ใน Functional Component |
| **Hook** | Function พิเศษของ React ที่ชื่อขึ้นต้นด้วย `use` |
| **Setter Function** | Function จาก `useState` สำหรับเปลี่ยนค่า State |
| **Re-render** | React Render Component ใหม่เมื่อ State หรือ Props เปลี่ยน |
| **Batching** | React รวมการ setState หลายครั้งให้เป็น Render ครั้งเดียว |
| **Functional Update** | `setState(prev => ...)` — ใช้ค่า State เก่าในการคำนวณ |
| **Initial State** | ค่าเริ่มต้นที่ส่งให้ `useState()` |
| **Derived State** | ค่าที่คำนวณจาก State อื่น ไม่ต้องเก็บเป็น State แยก |
| **Immutable** | ไม่แก้ค่าตรงๆ — ต้องสร้างค่าใหม่แทน |

👉 ไปต่อ: [🔢 Project 3: Interactive Counter](/react/03-project-interactive-counter)
