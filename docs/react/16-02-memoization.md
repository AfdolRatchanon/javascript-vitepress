# 16.2 — useMemo, useCallback & React.memo

> *"Premature optimization is the root of all evil."* — Donald Knuth

## Analogy: บอดี้การ์ดที่ฉลาด 🛡️

ลองนึกภาพว่าคุณมีบอดี้การ์ด 3 คน หน้าที่ของพวกเขาคือ "คำนวณผลลัพธ์" ให้คุณ

- **บอดี้การ์ดโง่** — ทุกครั้งที่มีอะไรเกิดขึ้นในบ้าน (re-render) เขาจะทำงานใหม่ตั้งแต่ต้น แม้ Input จะไม่เปลี่ยน
- **บอดี้การ์ดฉลาด (`useMemo`)** — จำผลลัพธ์เก่าไว้ ถ้า Input เดิม ส่งผลลัพธ์เดิมคืนโดยไม่ทำงานใหม่
- **บอดี้การ์ดที่ส่งคำสั่ง (`useCallback`)** — เก็บ "ชุดคำสั่ง" (function) ไว้ ถ้าไม่มีอะไรเปลี่ยน ส่งชุดคำสั่งเดิมคืน ไม่สร้างชุดใหม่

Memoization คือเทคนิคการ **จำผลลัพธ์เก่า** เพื่อหลีกเลี่ยงการคำนวณซ้ำโดยไม่จำเป็น

::: warning ⚠️ อ่านก่อนเรียน
Memoization เพิ่ม **Complexity** และใช้ **Memory** เพิ่มขึ้น สอนในบทนี้เพื่อให้รู้จักและเข้าใจว่า **ใช้เมื่อไหร่** — ไม่ใช่ "ใส่ทุกที่ดีที่สุด"
:::

## ปัญหาที่แก้: Re-render ที่ไม่จำเป็น

ก่อนเรียนทั้ง 3 เครื่องมือ ต้องเข้าใจปัญหาที่พวกมันแก้ก่อน

ใน React ทุกครั้งที่ Component re-render, สิ่งเหล่านี้จะเกิดขึ้น:
1. ฟังก์ชันทุกตัวใน Component ถูกสร้างใหม่ (new reference)
2. ค่าที่คำนวณจาก props/state ถูกคำนวณใหม่
3. Child Components ที่รับ props จะ re-render ด้วย (ถ้า props reference เปลี่ยน)

**ปัญหาเกิดเมื่อ:**
- การคำนวณนั้นหนักมาก (กรอง/เรียง array ขนาดใหญ่)
- Child Component re-render บ่อยมากโดยไม่จำเป็น (ทำให้ UI กระตุก)

> 💡 **ส่วนใหญ่ React เร็วพอแล้ว** — อย่า optimize ก่อนวัด performance จริง

## 1. `React.memo` — ป้องกัน Child Component Re-render

> [React.memo — React Docs](https://react.dev/reference/react/memo)

`React.memo` เป็น Higher-Order Component ที่ wrap Child Component ไว้ ถ้า props ไม่เปลี่ยน React จะ **ข้าม re-render** ของ Child ทั้งหมด

### ปัญหา: Child re-render ทั้งที่ props ไม่เปลี่ยน

สถานการณ์ที่พบบ่อย: Parent มี state ที่ไม่เกี่ยวกับ Child เลย แต่ทุกครั้งที่ Parent re-render, Child ก็ re-render ตามไปด้วย

```jsx
// ❌ ปัญหา: ProductList re-render ทุกครั้งที่ counter เปลี่ยน
// แม้ว่า products จะไม่ได้เปลี่ยน

function ProductList({ products }) {
  console.log('ProductList rendered') // จะเห็น log นี้ทุกครั้ง

  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name} — ฿{p.price}</li>
      ))}
    </ul>
  )
}

function App() {
  const [counter, setCounter] = useState(0)
  const products = [
    { id: 1, name: 'หูฟัง', price: 1200 },
    { id: 2, name: 'คีย์บอร์ด', price: 2500 },
  ]

  return (
    <>
      <button onClick={() => setCounter(c => c + 1)}>Count: {counter}</button>
      <ProductList products={products} />  {/* re-render ทุกครั้งที่กดปุ่ม! */}
    </>
  )
}
```

### แก้ปัญหาด้วย `React.memo`

เมื่อ wrap ด้วย `React.memo` React จะเปรียบเทียบ props เก่าและใหม่แบบ **Shallow Comparison** ถ้าเหมือนกัน → ข้าม re-render

```jsx
// ✅ แก้ไข: React.memo ป้องกัน re-render ที่ไม่จำเป็น

import { memo } from 'react'

const ProductList = memo(function ProductList({ products }) {
  console.log('ProductList rendered') // จะเห็นแค่ตอน products เปลี่ยนจริงๆ

  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name} — ฿{p.price}</li>
      ))}
    </ul>
  )
})

// หรือจะ wrap ทีหลังก็ได้
// const MemoizedProductList = memo(ProductList)
```

### Shallow Comparison คืออะไร?

`React.memo` เปรียบเทียบ props ด้วย `Object.is()` (คล้าย `===`)

```jsx
// Primitive values — ใช้งานได้ดี
<Component value={42} />       // เปรียบเทียบ: 42 === 42 ✅

// Object/Array — เป็น Reference Comparison!
<Component data={{ a: 1 }} />  // ทุก render สร้าง Object ใหม่ → เปรียบเทียบ reference ต่างกัน ❌
```

::: warning ⚠️ กับดัก: Object/Array Props
ถ้าส่ง Object หรือ Array เป็น props โดยตรง `React.memo` จะ **ไม่ช่วย** เพราะทุก render สร้าง reference ใหม่เสมอ
ต้องใช้ร่วมกับ `useMemo` ด้านล่าง
:::

### Challenge 1

::: details ✨ ดูเฉลย
**โจทย์:** Component `ExpensiveChart` รับ props `data` (array) และ `title` (string) ทุกครั้งที่ Parent กดปุ่ม counter มันก็ re-render แม้ data และ title ไม่เปลี่ยน จะแก้อย่างไร?

**เฉลย:**
```jsx
import { memo, useState } from 'react'

// ✅ Wrap ด้วย memo
const ExpensiveChart = memo(function ExpensiveChart({ data, title }) {
  console.log('Chart rendered')
  return <div>{title}: {data.length} items</div>
})

function Dashboard() {
  const [count, setCount] = useState(0)
  // ✅ ต้องใช้ useMemo ด้วย ถ้า data เป็น Array ที่สร้างใน component
  const chartData = useMemo(() => [1, 2, 3, 4, 5], []) // deps ว่าง = คำนวณครั้งเดียว

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveChart data={chartData} title="Sales" />
    </>
  )
}
```
:::

## 2. `useMemo` — จำผลลัพธ์การคำนวณ

> [useMemo — React Docs](https://react.dev/reference/react/useMemo)

`useMemo` จำผลลัพธ์ของ **การคำนวณ** ถ้า dependencies ไม่เปลี่ยน จะคืนผลลัพธ์เดิมโดยไม่คำนวณใหม่

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
//                            ↑ ฟังก์ชันที่คำนวณ            ↑ dependencies
```

### เมื่อไหร่ควรใช้ `useMemo`

**ใช้เมื่อ:** การคำนวณนั้นหนักจริงๆ (filter/sort array ขนาดใหญ่มาก หรือ calculation ซับซ้อน)

```jsx
// ตัวอย่าง: กรองและเรียง products ขนาดใหญ่
function ProductPage({ products, searchTerm, sortBy }) {
  // ❌ ไม่ดี: คำนวณใหม่ทุก render แม้ products/searchTerm/sortBy ไม่เปลี่ยน
  const filtered = products
    .filter(p => p.name.includes(searchTerm))
    .sort((a, b) => a[sortBy] - b[sortBy])

  // ✅ ดีกว่า: คำนวณใหม่เฉพาะเมื่อ dependencies เปลี่ยน
  const filtered = useMemo(() => {
    console.log('Computing filtered products...')
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a[sortBy] - b[sortBy])
  }, [products, searchTerm, sortBy])

  return <ProductList products={filtered} />
}
```

### ใช้ `useMemo` เพื่อ Stabilize Object/Array Props

เมื่อต้องส่ง Object/Array เป็น props ให้ `React.memo` component:

```jsx
function ParentComponent({ userId }) {
  const [theme, setTheme] = useState('light')

  // ❌ ปัญหา: สร้าง config object ใหม่ทุก render
  // → UserCard (React.memo) ยังคง re-render อยู่ดี
  const userConfig = { id: userId, showAvatar: true }

  // ✅ แก้ไข: useMemo ทำให้ reference คงที่ถ้า userId ไม่เปลี่ยน
  const userConfig = useMemo(
    () => ({ id: userId, showAvatar: true }),
    [userId]
  )

  return (
    <>
      <ThemeToggle onChange={setTheme} />
      <UserCard config={userConfig} /> {/* ไม่ re-render เมื่อ theme เปลี่ยน */}
    </>
  )
}
```

### เมื่อไหร่ **ไม่ควร** ใช้ `useMemo`

```jsx
// ❌ Over-optimization: ไม่จำเป็นเลย — การคำนวณเร็วมาก
const sum = useMemo(() => a + b, [a, b])
// ✅ แค่นี้พอ:
const sum = a + b

// ❌ ใส่ทุกที่โดยไม่คิด — เพิ่ม complexity โดยไม่ได้ประโยชน์
const name = useMemo(() => user.firstName + ' ' + user.lastName, [user])
// ✅ แค่นี้พอ:
const name = `${user.firstName} ${user.lastName}`
```

### Challenge 2

::: details ✨ ดูเฉลย
**โจทย์:** มี array `students` 10,000 คน ต้องกรองตาม `grade` (A/B/C) และเรียงตาม `score` ควรใช้ `useMemo` ไหม? เขียนโค้ดให้ด้วย

**เฉลย:**
```jsx
function StudentReport({ students, grade, sortOrder }) {
  // ✅ ควรใช้: 10,000 items กรอง+เรียง = หนักพอ
  const filteredStudents = useMemo(() => {
    const filtered = students.filter(s => s.grade === grade)
    return filtered.sort((a, b) =>
      sortOrder === 'asc' ? a.score - b.score : b.score - a.score
    )
  }, [students, grade, sortOrder])

  return (
    <table>
      {filteredStudents.map(s => (
        <tr key={s.id}>
          <td>{s.name}</td>
          <td>{s.score}</td>
        </tr>
      ))}
    </table>
  )
}
```
:::

## 3. `useCallback` — จำ Function Reference

> [useCallback — React Docs](https://react.dev/reference/react/useCallback)

`useCallback` จำ **ตัว function** (ไม่ใช่ผลลัพธ์) ถ้า dependencies ไม่เปลี่ยน จะคืน function เดิม (same reference)

```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

### ทำไมต้อง Memoize Function?

ใน JavaScript ทุกครั้งที่ Component render ฟังก์ชันภายในจะถูกสร้างใหม่เสมอ:

```jsx
function Parent() {
  // ทุก render สร้าง handleClick ใหม่ → reference ต่างกัน
  const handleClick = () => console.log('clicked')

  return <MemoizedChild onClick={handleClick} />
  // MemoizedChild จะยัง re-render เพราะ onClick มี reference ใหม่ทุกครั้ง!
}
```

`React.memo` จะ **ไม่ช่วย** ถ้า prop เป็น function ที่ถูกสร้างใหม่ทุก render:

```jsx
function Parent() {
  const [count, setCount] = useState(0)

  // ✅ useCallback: คืน function เดิมถ้า dependencies ไม่เปลี่ยน
  const handleDelete = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, []) // [] = ไม่มี dependencies → function เดียวกันตลอด

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <MemoizedItemList onDelete={handleDelete} />
      {/* ✅ ItemList จะไม่ re-render เมื่อ count เปลี่ยน */}
    </>
  )
}
```

### Pattern: `useCallback` + `React.memo` คู่กัน

สองอันนี้มักใช้คู่กัน — `useCallback` ทำให้ function stable, `React.memo` ทำให้ child ไม่ re-render:

```jsx
// Child Component — wrap ด้วย memo
const SearchBox = memo(function SearchBox({ onSearch }) {
  console.log('SearchBox rendered')
  return (
    <input
      placeholder="ค้นหา..."
      onChange={(e) => onSearch(e.target.value)}
    />
  )
})

// Parent Component
function ProductPage() {
  const [theme, setTheme] = useState('light')
  const [results, setResults] = useState([])

  // ✅ useCallback: onSearch มี reference เดิมถ้า dependencies ไม่เปลี่ยน
  const handleSearch = useCallback(async (term) => {
    const data = await fetchProducts(term)
    setResults(data)
  }, []) // ไม่มี dependencies → stable function

  return (
    <div className={theme}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      {/* เมื่อกด Toggle Theme → theme เปลี่ยน → Parent re-render */}
      {/* แต่ SearchBox ไม่ re-render เพราะ onSearch reference เดิม */}
      <SearchBox onSearch={handleSearch} />
      <ResultList items={results} />
    </div>
  )
}
```

### Challenge 3

::: details ✨ ดูเฉลย
**โจทย์:** `TodoList` ใช้ `React.memo` แต่ยัง re-render ทุกครั้งที่ Parent state เปลี่ยน เพราะ `onToggle` function ถูกสร้างใหม่ทุกรอบ จะแก้อย่างไร?

```jsx
// Code ปัจจุบัน (มีปัญหา)
function App() {
  const [todos, setTodos] = useState([...])
  const [filter, setFilter] = useState('all')

  const handleToggle = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))
  }

  return <MemoizedTodoList todos={todos} onToggle={handleToggle} />
}
```

**เฉลย:**
```jsx
function App() {
  const [todos, setTodos] = useState([...])
  const [filter, setFilter] = useState('all')

  // ✅ useCallback: สร้าง function ใหม่ก็ต่อเมื่อ setTodos เปลี่ยน (ไม่เปลี่ยน)
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))
  }, []) // setTodos มี stable reference จาก React → ใส่ deps ว่างได้

  return <MemoizedTodoList todos={todos} onToggle={handleToggle} />
}
```
:::

## 📊 Comparison Table

| Hook | จำอะไร | ใช้เมื่อ | ไม่ควรใช้เมื่อ |
|:-----|:-------|:--------|:-------------|
| `React.memo` | Component ทั้งหมด | Child re-render บ่อยโดยไม่จำเป็น | Component re-render น้อยอยู่แล้ว |
| `useMemo` | ผลลัพธ์ของ calculation | Computation หนัก (filter/sort ข้อมูลใหญ่) | การคำนวณธรรมดาเร็วอยู่แล้ว |
| `useCallback` | Function reference | ส่ง function เป็น prop ให้ memo component | ไม่ได้ส่งให้ memo component |

## กฎ 3 ข้อก่อนใช้ Memoization

```
1. วัดก่อน — ใช้ React DevTools Profiler เพื่อหา bottleneck จริง
2. ถามว่า "ช้าจริงไหม?" — ถ้า UI ลื่นอยู่แล้ว ไม่ต้อง optimize
3. ต้นทุนของ Memoization — มี overhead จาก memo comparison ด้วย
   ถ้า component render เร็ว > cost of comparison → ไม่คุ้ม
```

## Real-World Use Case: ตาราง Data ขนาดใหญ่

สถานการณ์: หน้าจัดการออร์เดอร์ที่มี 1,000+ รายการ พร้อม search, sort, filter

```jsx
import { useState, useMemo, useCallback, memo } from 'react'

// ✅ Memoized Row Component — ไม่ต้อง re-render ถ้า order ไม่เปลี่ยน
const OrderRow = memo(function OrderRow({ order, onCancel }) {
  return (
    <tr>
      <td>{order.id}</td>
      <td>{order.customer}</td>
      <td>฿{order.total.toLocaleString()}</td>
      <td>
        <button onClick={() => onCancel(order.id)}>ยกเลิก</button>
      </td>
    </tr>
  )
})

function OrderManagement({ orders }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sortField, setSortField] = useState('date')

  // ✅ useMemo: Filter + Sort เป็นการคำนวณหนักสำหรับ 1,000+ items
  const filteredOrders = useMemo(() => {
    let result = orders

    if (status !== 'all') {
      result = result.filter(o => o.status === status)
    }

    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(o =>
        o.customer.toLowerCase().includes(lower) ||
        o.id.toString().includes(lower)
      )
    }

    return [...result].sort((a, b) => {
      if (sortField === 'total') return b.total - a.total
      return new Date(b.date) - new Date(a.date)
    })
  }, [orders, search, status, sortField])

  // ✅ useCallback: stable function สำหรับ OrderRow (memo component)
  const handleCancel = useCallback((id) => {
    // ส่ง mutation ไป server
    cancelOrder(id)
  }, [])

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..." />
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="all">ทั้งหมด</option>
        <option value="pending">รอดำเนินการ</option>
        <option value="completed">สำเร็จ</option>
      </select>

      <table>
        <tbody>
          {filteredOrders.map(order => (
            <OrderRow key={order.id} order={order} onCancel={handleCancel} />
          ))}
        </tbody>
      </table>

      <p>แสดง {filteredOrders.length} จาก {orders.length} รายการ</p>
    </div>
  )
}
```

## Profiler: วิธีวัด Performance ก่อน Optimize

ใช้ React DevTools Profiler extension เพื่อดูว่า component ไหนช้าจริง:

```jsx
// ใช้ Profiler API สำหรับ custom measurement
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} (${phase}): ${actualDuration.toFixed(2)}ms`)
}

<Profiler id="OrderManagement" onRender={onRenderCallback}>
  <OrderManagement orders={orders} />
</Profiler>
```

::: tip 💡 ลำดับการ Optimize ที่ถูกต้อง
1. วัดด้วย React DevTools Profiler
2. ถ้าเจอ component ที่ render >16ms (กระตุกที่ 60fps) → ค่อย optimize
3. ลอง `React.memo` ก่อน (ง่ายสุด)
4. ถ้า props เป็น function → เพิ่ม `useCallback`
5. ถ้า props เป็น object/array หรือมี computation หนัก → เพิ่ม `useMemo`
:::

### Challenge 4

::: details ✨ ดูเฉลย
**โจทย์:** Code ด้านล่างมีปัญหา optimization อะไรบ้าง? แก้ไขให้ถูกต้อง

```jsx
function Dashboard({ data, userId }) {
  const stats = useMemo(() => data.length * 2, [data])  // (1)

  const userInfo = { id: userId, role: 'admin' }  // (2)

  const handleClick = () => alert('clicked')  // (3)

  return <StatsCard stats={stats} user={userInfo} onClick={handleClick} />
}
```

**เฉลย:**

(1) ❌ `useMemo(() => data.length * 2, [data])` — การคำนวณเบามาก (`* 2`) ไม่คุ้มกับ overhead ของ useMemo
✅ แค่ `const stats = data.length * 2`

(2) ❌ `userInfo` สร้าง object ใหม่ทุก render → ถ้า StatsCard ใช้ React.memo จะ re-render อยู่ดี
✅ `const userInfo = useMemo(() => ({ id: userId, role: 'admin' }), [userId])`

(3) ❌ `handleClick` เป็น function ที่ไม่มี dependencies → ถ้าส่งให้ memo component จะ re-render
✅ `const handleClick = useCallback(() => alert('clicked'), [])`

แต่ถ้า `StatsCard` **ไม่ใช่** React.memo → ข้อ 2 และ 3 ก็ไม่จำเป็น
:::

## Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Memoization** | เทคนิคจำผลลัพธ์เก่า เพื่อหลีกเลี่ยงการคำนวณซ้ำ |
| **Re-render** | การที่ React วาด Component ใหม่บน Virtual DOM |
| **Reference Equality** | การเปรียบเทียบว่า 2 ค่าชี้ไปที่ Object เดียวกันในหน่วยความจำ |
| **Higher-Order Component (HOC)** | Function ที่รับ Component เป็น argument และคืน Component ใหม่ |
| **Shallow Comparison** | เปรียบเทียบแค่ระดับบนสุด ไม่ลึกลงไปใน nested properties |
| **Stable Reference** | Object/Function ที่มี reference เดิมระหว่าง renders |
| **Dependencies Array** | Array ที่บอก Hook ว่าต้อง recalculate เมื่อค่าใดเปลี่ยน |
| **Profiler** | เครื่องมือวัด performance ของ React component |
| **Overhead** | ค่าใช้จ่ายเพิ่มเติม (เวลา/หน่วยความจำ) จากการใช้เทคนิค optimization |
| **Bottleneck** | จุดที่ทำให้โปรแกรมช้า |
| **Stale Closure** | ปัญหาที่ฟังก์ชันใน Hook จำค่าเก่าแทนค่าปัจจุบัน |
| **Reconciliation** | กระบวนการที่ React เปรียบเทียบ Virtual DOM เก่าและใหม่ |

## สรุป: เมื่อไหร่ใช้อะไร

```
ถาม 3 คำถาม:
1. Component นี้ render บ่อยไหม? (>60fps หรือ user รู้สึกกระตุก?)
   → ไม่ → ไม่ต้อง optimize
   → ใช่ → ไปข้อ 2

2. props ของมันเปลี่ยนบ่อยไหม?
   → ไม่ → ลอง React.memo
   → ใช่ → ดูข้อ 3

3. props ที่เปลี่ยนมาจากไหน?
   → Computation หนัก → useMemo
   → Function ที่ส่งลงไป → useCallback + React.memo
```

👉 ไปต่อ: [🎯 Project - Optimization Lab](/react/16-project-optimization-lab)
