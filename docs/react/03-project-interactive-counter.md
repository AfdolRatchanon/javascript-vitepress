# 🔢 Project 3: Interactive Counter System

> **โปรเจกต์นี้ฝึก:** useState, onClick, Conditional Rendering, Multiple State, Functional Update

## โจทย์

สร้าง **Interactive Counter System** ที่มี 3 ส่วนหลัก:

1. **Advanced Counter** — นับขึ้น/ลง พร้อม Step ที่ปรับได้, ตั้ง Max/Min
2. **Content Toggler** — ซ่อน/แสดงเนื้อหาหลายรายการ
3. **Multi-Counter** — จัดการ Counter หลายตัวพร้อมกัน

## Part 1: Advanced Counter

Counter ที่มีความสามารถ:
- ปุ่ม +Step และ -Step (Step เริ่มต้น = 1, ปรับได้)
- ตั้ง Min (default: 0) และ Max (default: 100)
- ปุ่มจะ disabled เมื่อถึงขีดจำกัด
- แสดง Progress Bar ตามเปอร์เซ็นต์ระหว่าง Min-Max
- ปุ่ม Reset

```jsx
// Hint: สิ่งที่ต้องมีเป็น State
// - count (number)
// - step (number)

// การคำนวณที่ควรทำใน Render (Derived):
// - percentage = ((count - min) / (max - min)) * 100
// - isAtMax = count >= max
// - isAtMin = count <= min
```

## Part 2: Content Toggler

แสดง Accordion ของ FAQ (อย่างน้อย 4 รายการ) โดย:
- เปิดได้ทีละรายการ (ปิดรายการอื่นเมื่อเปิดอันใหม่)
- มีปุ่ม "เปิดทั้งหมด" และ "ปิดทั้งหมด"
- Animation ลื่นไหลด้วย CSS Transition

## Part 3: Multi-Counter

จัดการ Counter หลายตัว:
- เพิ่ม Counter ใหม่ได้ (ตั้งชื่อเองได้)
- แต่ละ Counter มีปุ่ม +1, -1, Reset แยกกัน
- แสดง Total ของทุก Counter
- ลบ Counter ออกได้

## Starter Code

```jsx
// src/App.jsx
import { useState } from 'react'

// Part 1: Advanced Counter
function AdvancedCounter({ min = 0, max = 100 }) {
  const [count, setCount] = useState(min)
  const [step, setStep] = useState(1)

  // TODO: คำนวณ Derived Values

  return (
    <section>
      <h2>🔢 Advanced Counter</h2>
      {/* TODO: Progress Bar */}
      {/* TODO: Display count */}
      {/* TODO: Step selector */}
      {/* TODO: Increment/Decrement/Reset buttons */}
    </section>
  )
}

// Part 2: Content Toggler
const FAQ_ITEMS = [
  { id: 1, q: 'useState คืออะไร?', a: 'Hook ที่ให้ Functional Component มี State...' },
  { id: 2, q: 'ทำไม State ถึงไม่เปลี่ยนทันที?', a: 'เพราะ React Batch การ Render...' },
  { id: 3, q: 'Props กับ State ต่างกันอย่างไร?', a: 'Props มาจาก Parent, State เป็นของ Component เอง...' },
  { id: 4, q: 'Functional Update คืออะไร?', a: 'การใช้ setState(prev => ...) เมื่อ new state ขึ้นอยู่กับ old state...' },
]

function ContentToggler() {
  const [openId, setOpenId] = useState(null)

  // TODO: เพิ่ม openAll, closeAll logic

  return (
    <section>
      <h2>📋 FAQ Toggler</h2>
      {/* TODO: ปุ่ม Open All / Close All */}
      {/* TODO: map FAQ_ITEMS เป็น AccordionItem */}
    </section>
  )
}

// Part 3: Multi-Counter
function MultiCounter() {
  const [counters, setCounters] = useState([
    { id: 1, name: 'Counter 1', value: 0 },
  ])
  const [newName, setNewName] = useState('')

  // TODO: addCounter, removeCounter, updateCounter, resetCounter

  return (
    <section>
      <h2>📊 Multi-Counter</h2>
      {/* TODO: Add Counter form */}
      {/* TODO: Total display */}
      {/* TODO: map counters */}
    </section>
  )
}

export default function App() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>🎮 Interactive Counter System</h1>
      <AdvancedCounter min={-50} max={50} />
      <ContentToggler />
      <MultiCounter />
    </div>
  )
}
```

## Solution

::: details ดูเฉลยฉบับสมบูรณ์

```jsx
import { useState } from 'react'

// ─── Part 1: Advanced Counter ───────────────────────────
function AdvancedCounter({ min = 0, max = 100 }) {
  const [count, setCount] = useState(min)
  const [step, setStep] = useState(1)

  const percentage = Math.round(((count - min) / (max - min)) * 100)
  const isAtMax = count >= max
  const isAtMin = count <= min
  const progressColor = percentage > 80 ? '#e74c3c' : percentage > 50 ? '#f39c12' : '#27ae60'

  return (
    <section style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <h2>🔢 Advanced Counter</h2>

      {/* Progress Bar */}
      <div style={{ backgroundColor: '#e2e8f0', borderRadius: 999, height: 12, marginBottom: 16 }}>
        <div style={{
          width: `${percentage}%`,
          backgroundColor: progressColor,
          height: '100%',
          borderRadius: 999,
          transition: 'width 0.3s, background-color 0.3s',
        }} />
      </div>

      {/* Count Display */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: '4rem', fontWeight: 'bold' }}>{count}</span>
        <p style={{ color: 'gray', margin: 0 }}>{percentage}% (Min: {min} | Max: {max})</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => setCount(prev => Math.max(min, prev - step))}
          disabled={isAtMin}
          style={{ padding: '8px 20px', fontSize: '1.2rem', cursor: isAtMin ? 'not-allowed' : 'pointer', opacity: isAtMin ? 0.5 : 1 }}
        >
          -{step}
        </button>
        <button
          onClick={() => setCount(min)}
          style={{ padding: '8px 16px' }}
        >
          Reset
        </button>
        <button
          onClick={() => setCount(prev => Math.min(max, prev + step))}
          disabled={isAtMax}
          style={{ padding: '8px 20px', fontSize: '1.2rem', cursor: isAtMax ? 'not-allowed' : 'pointer', opacity: isAtMax ? 0.5 : 1 }}
        >
          +{step}
        </button>
      </div>

      {/* Step Selector */}
      <div style={{ textAlign: 'center' }}>
        <label>Step: </label>
        {[1, 5, 10, 25].map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            style={{
              margin: '0 4px',
              padding: '4px 12px',
              backgroundColor: step === s ? '#007bff' : '#e2e8f0',
              color: step === s ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  )
}

// ─── Part 2: Content Toggler ────────────────────────────
const FAQ_ITEMS = [
  { id: 1, q: 'useState คืออะไร?', a: 'Hook ที่ให้ Functional Component มี State ซึ่งทำให้ React Render ใหม่เมื่อค่าเปลี่ยน' },
  { id: 2, q: 'ทำไม State ถึงไม่เปลี่ยนทันทีหลัง setState?', a: 'เพราะ React Batch การ Render ไว้ทำทีหลัง State จะเปลี่ยนใน Render รอบถัดไป' },
  { id: 3, q: 'Props กับ State ต่างกันอย่างไร?', a: 'Props คือข้อมูลจาก Parent (Read-only), State คือข้อมูลที่ Component จัดการเอง (เปลี่ยนได้)' },
  { id: 4, q: 'Functional Update คืออะไร?', a: 'setState(prev => newValue) ใช้เมื่อค่าใหม่ต้องใช้ค่าเก่าในการคำนวณ ป้องกัน Stale State' },
]

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          padding: '14px 0', border: 'none', background: 'none',
          cursor: 'pointer', fontSize: '1rem', fontWeight: isOpen ? 'bold' : 'normal',
          color: isOpen ? '#007bff' : '#333',
        }}
      >
        <span>{item.q}</span>
        <span style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      <div style={{
        overflow: 'hidden',
        maxHeight: isOpen ? 200 : 0,
        transition: 'max-height 0.3s ease',
      }}>
        <p style={{ color: '#4a5568', paddingBottom: 16, margin: 0 }}>{item.a}</p>
      </div>
    </div>
  )
}

function ContentToggler() {
  const [openId, setOpenId] = useState(null)
  const [allOpen, setAllOpen] = useState(false)
  const [openIds, setOpenIds] = useState(new Set())

  const isMultiMode = allOpen

  function handleToggle(id) {
    if (isMultiMode) {
      setOpenIds(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
    } else {
      setOpenId(prev => prev === id ? null : id)
    }
  }

  function openAll() {
    setAllOpen(true)
    setOpenIds(new Set(FAQ_ITEMS.map(f => f.id)))
  }

  function closeAll() {
    setAllOpen(false)
    setOpenId(null)
    setOpenIds(new Set())
  }

  function isOpen(id) {
    return isMultiMode ? openIds.has(id) : openId === id
  }

  return (
    <section style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>📋 FAQ Toggler</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={openAll} style={{ padding: '4px 12px', fontSize: '0.85rem' }}>เปิดทั้งหมด</button>
          <button onClick={closeAll} style={{ padding: '4px 12px', fontSize: '0.85rem' }}>ปิดทั้งหมด</button>
        </div>
      </div>
      {FAQ_ITEMS.map(item => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={isOpen(item.id)}
          onToggle={() => handleToggle(item.id)}
        />
      ))}
    </section>
  )
}

// ─── Part 3: Multi-Counter ──────────────────────────────
let nextId = 2

function CounterItem({ counter, onUpdate, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 16px', backgroundColor: '#f8f9fa',
      borderRadius: 8, marginBottom: 8,
    }}>
      <strong style={{ minWidth: 100 }}>{counter.name}</strong>
      <button onClick={() => onUpdate(counter.id, -1)} style={{ width: 32, height: 32 }}>-</button>
      <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
        {counter.value}
      </span>
      <button onClick={() => onUpdate(counter.id, 1)} style={{ width: 32, height: 32 }}>+</button>
      <button onClick={() => onUpdate(counter.id, -counter.value)} style={{ padding: '2px 8px', fontSize: '0.8rem' }}>Reset</button>
      <button onClick={() => onRemove(counter.id)} style={{ marginLeft: 'auto', color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
    </div>
  )
}

function MultiCounter() {
  const [counters, setCounters] = useState([{ id: 1, name: 'Counter 1', value: 0 }])
  const [newName, setNewName] = useState('')

  const total = counters.reduce((sum, c) => sum + c.value, 0)

  function addCounter() {
    const name = newName.trim() || `Counter ${nextId}`
    setCounters(prev => [...prev, { id: nextId++, name, value: 0 }])
    setNewName('')
  }

  function updateCounter(id, delta) {
    setCounters(prev => prev.map(c => c.id === id ? { ...c, value: c.value + delta } : c))
  }

  function removeCounter(id) {
    setCounters(prev => prev.filter(c => c.id !== id))
  }

  return (
    <section style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>📊 Multi-Counter</h2>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          Total: <span style={{ color: total >= 0 ? '#27ae60' : '#e74c3c' }}>{total}</span>
        </div>
      </div>

      {counters.map(counter => (
        <CounterItem
          key={counter.id}
          counter={counter}
          onUpdate={updateCounter}
          onRemove={removeCounter}
        />
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCounter()}
          placeholder="ชื่อ Counter ใหม่..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
        />
        <button onClick={addCounter} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          + เพิ่ม
        </button>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>🎮 Interactive Counter System</h1>
      <AdvancedCounter min={-50} max={50} />
      <ContentToggler />
      <MultiCounter />
    </div>
  )
}
```
:::

## เกณฑ์การประเมิน

| เกณฑ์ | คะแนน |
|:------|:------:|
| Advanced Counter: Progress Bar และ Step ทำงานถูกต้อง | 25 |
| Advanced Counter: disabled เมื่อถึง Min/Max | 15 |
| Content Toggler: เปิด/ปิดถูกต้อง (ทีละรายการ) | 20 |
| Content Toggler: Open All / Close All ทำงาน | 10 |
| Multi-Counter: เพิ่ม, อัปเดต, ลบ Counter ถูกต้อง | 20 |
| Multi-Counter: แสดง Total ถูกต้อง | 10 |
| **รวม** | **100** |

## Bonus Challenge

เพิ่ม **History Log** ใน Advanced Counter ที่แสดงประวัติการเปลี่ยนค่า 5 ครั้งล่าสุด เช่น `+5 → 15`, `-1 → 14`

👉 ไปต่อ: [Module 4: Rendering Lists & Complex State](/react/04-01-lists-and-keys)
