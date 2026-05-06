# 2.1 Thinking in React — Component Mental Model

> *"The secret to building large apps is never build large apps. Break your applications into small pieces."*
> — **Justin Meyer** (แนวคิดที่ React ใช้เป็นหัวใจหลัก)

## เปรียบเทียบให้เห็นภาพ

🧩 **นึกภาพ Figma Design ของเว็บ** — นักออกแบบที่ดีจะแบ่งหน้าเว็บออกเป็น "กล่อง" ย่อยๆ ก่อน เช่น Header กล่องหนึ่ง, Sidebar กล่องหนึ่ง, ProductCard กล่องหนึ่ง การแบ่ง Component ใน React ก็คือการทำแบบเดียวกันนั้น — วาดกล่องรอบส่วน UI ที่มีหน้าที่เดียว แล้วแต่ละกล่องก็คือ 1 Component

## Functional Components คืออะไร?

> 📖 **อ่านเพิ่มเติม:** [React — Your First Component](https://react.dev/learn/your-first-component)

**Component** คือ JavaScript Function ที่ Return JSX กลับมา ในปัจจุบัน React ใช้ **Functional Components** เป็นมาตรฐาน (Class Components ยังรองรับแต่ไม่นิยมแล้ว)

กฎสำคัญ 3 ข้อ:

```jsx
// ✅ ชื่อ Component ต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่ (PascalCase)
function WelcomeMessage() {
  // ✅ ทำอะไรก็ได้ที่นี่ — JavaScript ล้วนๆ
  const greeting = 'สวัสดี'
  const now = new Date().getHours()
  const timeOfDay = now < 12 ? 'เช้า' : now < 18 ? 'บ่าย' : 'เย็น'

  // ✅ ต้อง Return JSX เสมอ
  return (
    <div>
      <h1>{greeting} ตอน{timeOfDay}!</h1>
      <p>ยินดีต้อนรับสู่ React</p>
    </div>
  )
}
```

### Functional vs Class Components

| | Functional Component | Class Component |
|:---|:---|:---|
| **Syntax** | Function ธรรมดา | `class X extends React.Component` |
| **Hooks** | ✅ ใช้ได้ทุก Hook | ❌ ใช้ไม่ได้ (ใช้ Lifecycle Methods แทน) |
| **โค้ด** | สั้นและอ่านง่าย | ยาวกว่า มี boilerplate มาก |
| **Status 2025** | ✅ มาตรฐาน | ⚠️ Legacy — อย่าเขียนใหม่ |
| **Performance** | เท่ากัน | เท่ากัน |

**สรุป: เขียน Functional Component เสมอ ไม่มีเหตุผลใดที่จะเขียน Class Component อีกต่อไป**

## วิธีคิดแบบ React (Thinking in React)

> 📖 **อ่านเพิ่มเติม:** [React — Thinking in React](https://react.dev/learn/thinking-in-react)

Facebook มีบทความคลาสสิก "Thinking in React" ที่อธิบายกระบวนการสร้าง UI ด้วย React เป็น 5 ขั้นตอน:

**ขั้นที่ 1: แบ่ง UI เป็น Component Hierarchy**

ดูที่ Mockup/Design แล้วลากกล่องรอบส่วนต่างๆ ที่มีหน้าที่เดียว กฎง่ายๆ:
- ถ้าส่วนนี้ "อธิบายได้ในประโยคเดียว" → น่าจะเป็น Component เดียว
- ถ้ามันซับซ้อนเกิน → แยกเป็น Component ย่อยลงไปอีก

**ขั้นที่ 2: สร้าง Static Version ก่อน**

เขียน Component ที่ Render ข้อมูลได้ โดยยังไม่ต้อง Interactive (ไม่มี State)

**ขั้นที่ 3: หา State ที่จำเป็น**

ถามตัวเองว่าข้อมูลส่วนไหนที่ "เปลี่ยนได้" และทำให้ UI เปลี่ยนตาม — นั่นคือ State

**ขั้นที่ 4: หาว่า State ควรอยู่ที่ Component ไหน**

State ควรอยู่ที่ "Parent ที่ใกล้ที่สุด" ที่ทุก Child ที่ต้องการข้อมูลนั้นแชร์กัน

**ขั้นที่ 5: เพิ่ม Data Flow (Props)**

ส่งข้อมูลจาก Parent ลง Child ผ่าน Props

## Single Responsibility Principle

หลักการสำคัญในการแบ่ง Component คือ **Single Responsibility** — แต่ละ Component ควรทำหน้าที่เดียว:

```jsx
// ❌ ไม่ดี — Component ทำหลายอย่างเกินไป
function ProductPage() {
  return (
    <div>
      {/* Header ทั้งหมด */}
      <header>
        <nav>...</nav>
        <div className="search">...</div>
        <div className="cart">...</div>
      </header>

      {/* Product List */}
      <main>
        {products.map(p => (
          <div key={p.id}>
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p>{p.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer>...</footer>
    </div>
  )
}

// ✅ ดี — แยกเป็น Component ย่อยที่มีหน้าที่ชัดเจน
function Header() { return <header>...</header> }
function SearchBar() { return <div className="search">...</div> }
function CartIcon() { return <div className="cart">...</div> }
function ProductCard({ product }) { return <div>...</div> }
function ProductList({ products }) {
  return <main>{products.map(p => <ProductCard key={p.id} product={p} />)}</main>
}
function Footer() { return <footer>...</footer> }

function ProductPage() {
  return (
    <div>
      <Header />
      <ProductList products={products} />
      <Footer />
    </div>
  )
}
```

## Component Composition — ประกอบ Component

**Composition** คือการนำ Component มาประกอบกัน เหมือนต่อ Lego — จุดแข็งที่สุดของ React:

```jsx
// Component เล็กๆ ที่ใช้ซ้ำได้
function Avatar({ src, size = 40, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
      }}
    />
  )
}

function Badge({ color, children }) {
  return (
    <span style={{
      backgroundColor: color,
      color: 'white',
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: '0.75rem',
    }}>
      {children}
    </span>
  )
}

// ประกอบรวมกันเป็น UserCard
function UserCard({ user }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16 }}>
      {/* ใช้ Component Avatar ที่สร้างไว้ */}
      <Avatar src={user.avatar} size={50} alt={user.name} />

      <div>
        <h3 style={{ margin: 0 }}>{user.name}</h3>
        <p style={{ margin: '4px 0', color: 'gray' }}>{user.email}</p>
        {/* ใช้ Component Badge */}
        <Badge color={user.role === 'admin' ? '#e74c3c' : '#27ae60'}>
          {user.role}
        </Badge>
      </div>
    </div>
  )
}

// ใช้ UserCard ซ้ำกับข้อมูลต่างๆ
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

## Naming Convention สำหรับ Component

| Pattern | ใช้กับ | ตัวอย่าง |
|:--------|:-------|:---------|
| **PascalCase** | ชื่อ Component | `UserCard`, `NavBar`, `ProductList` |
| **camelCase** | ชื่อ Props, Variables, Functions | `userName`, `onClick`, `handleSubmit` |
| **UPPER_SNAKE_CASE** | Constants | `MAX_ITEMS`, `API_URL` |
| **ลงท้ายด้วย Page** | Page-level Component | `HomePage`, `LoginPage` |
| **ขึ้นต้นด้วย use** | Custom Hook | `useFetch`, `useAuth` |

## ตัวอย่าง Real-World: แบ่ง Component จาก Figma Design

สมมติว่า Designer ส่ง Mockup ของหน้า Dashboard มา ขั้นตอนการแบ่ง Component:

```
หน้า Dashboard
├── <Navbar>
│   ├── <Logo>
│   ├── <NavLinks>
│   └── <UserMenu>
│       ├── <Avatar>
│       └── <DropdownMenu>
├── <Sidebar>
│   └── <SidebarItem> × N
├── <MainContent>
│   ├── <StatsGrid>
│   │   └── <StatCard> × 4
│   ├── <RecentOrders>
│   │   ├── <Table>
│   │   └── <TableRow> × N
│   └── <QuickActions>
│       └── <ActionButton> × N
└── <Footer>
```

แต่ละกล่องในภาพ = 1 Component ที่ทำหน้าที่เดียว!

```jsx
// ตัวอย่างส่วน StatsGrid
function StatCard({ title, value, change, icon }) {
  const isPositive = change >= 0
  return (
    <div style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <span style={{ color: isPositive ? 'green' : 'red', fontSize: '0.85rem' }}>
          {isPositive ? '▲' : '▼'} {Math.abs(change)}%
        </span>
      </div>
      <p style={{ color: 'gray', margin: '8px 0 4px', fontSize: '0.9rem' }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{value}</h2>
    </div>
  )
}

function StatsGrid() {
  const stats = [
    { title: 'ยอดขายวันนี้', value: '฿12,500', change: 5.2, icon: '💰' },
    { title: 'ออเดอร์ใหม่', value: '48', change: -2.1, icon: '📦' },
    { title: 'ลูกค้าใหม่', value: '12', change: 8.5, icon: '👥' },
    { title: 'สินค้าหมด', value: '3', change: -1, icon: '⚠️' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {stats.map(stat => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
```

## Challenges

### Challenge 1: ระบุ Component Hierarchy
จากหน้าเว็บ Twitter/X ลองระบุว่าแบ่ง Component ได้อย่างน้อย 8 Component อะไรบ้าง?

::: details ดูเฉลย
```
<TwitterApp>
├── <Sidebar>
│   ├── <TwitterLogo>
│   ├── <NavMenu>
│   │   └── <NavItem> (Home, Search, Notifications...)
│   ├── <TweetButton>
│   └── <UserProfile>
├── <Timeline>
│   ├── <TweetComposer>
│   └── <TweetFeed>
│       └── <TweetCard> × N
│           ├── <Avatar>
│           ├── <TweetContent>
│           └── <TweetActions> (Like, Retweet, Reply)
└── <TrendingPanel>
    └── <TrendItem> × N
```
:::

### Challenge 2: แก้ Single Responsibility
Component นี้ทำหน้าที่มากเกินไป ช่วยแยกเป็น Component ย่อยๆ:

```jsx
function BlogPost() {
  return (
    <article>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <img src="/avatar.jpg" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <div>
          <strong>สมชาย</strong>
          <p style={{ color: 'gray', fontSize: '0.8rem' }}>2 ชั่วโมงที่แล้ว</p>
        </div>
      </div>
      <h2>React เปลี่ยนชีวิตฉัน</h2>
      <p>เนื้อหาบทความ...</p>
      <div>
        <button>❤️ 42</button>
        <button>💬 8</button>
        <button>🔗 แชร์</button>
      </div>
    </article>
  )
}
```

::: details ดูเฉลย
```jsx
function AuthorInfo({ name, timeAgo, avatarUrl }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <img src={avatarUrl} style={{ width: 40, height: 40, borderRadius: '50%' }} alt={name} />
      <div>
        <strong>{name}</strong>
        <p style={{ color: 'gray', fontSize: '0.8rem' }}>{timeAgo}</p>
      </div>
    </div>
  )
}

function PostActions({ likes, comments }) {
  return (
    <div>
      <button>❤️ {likes}</button>
      <button>💬 {comments}</button>
      <button>🔗 แชร์</button>
    </div>
  )
}

function BlogPost({ post }) {
  return (
    <article>
      <AuthorInfo name={post.authorName} timeAgo={post.timeAgo} avatarUrl={post.avatarUrl} />
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <PostActions likes={post.likes} comments={post.comments} />
    </article>
  )
}
```
:::

### Challenge 3: สร้าง Component Hierarchy

ออกแบบ Component Hierarchy สำหรับหน้า "Shopping Cart" ที่มี:
- รายการสินค้าในตะกร้า (แต่ละชิ้นมีรูป, ชื่อ, ราคา, จำนวน)
- ปุ่มเพิ่ม/ลดจำนวน
- สรุปราคา (Subtotal, Shipping, Total)
- ปุ่ม Checkout

::: details ดูเฉลย
```
<CartPage>
├── <CartHeader> (ชื่อหน้า + จำนวนสินค้า)
├── <CartItemList>
│   └── <CartItem> × N
│       ├── <ProductImage>
│       ├── <ProductInfo> (ชื่อ, ราคาต่อชิ้น)
│       └── <QuantityControl> (ปุ่ม -/+ และจำนวน)
└── <OrderSummary>
    ├── <PriceRow label="Subtotal" amount={...} />
    ├── <PriceRow label="Shipping" amount={...} />
    ├── <PriceRow label="Total" amount={...} isBold />
    └── <CheckoutButton>
```
:::

### Challenge 4: Composition
สร้าง `<Alert>` Component ที่ Flexible โดยรองรับ 3 แบบ (success, warning, error) และให้ children เป็นเนื้อหาได้:

```jsx
<Alert type="success">บันทึกสำเร็จ!</Alert>
<Alert type="warning">กรุณาตรวจสอบข้อมูล</Alert>
<Alert type="error">เกิดข้อผิดพลาด</Alert>
```

::: details ดูเฉลย
```jsx
function Alert({ type = 'success', children }) {
  const styles = {
    success: { backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' },
    warning: { backgroundColor: '#fff3cd', color: '#856404', borderColor: '#ffeeba' },
    error: { backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' },
  }

  const icons = { success: '✅', warning: '⚠️', error: '❌' }

  return (
    <div style={{
      ...styles[type],
      padding: '12px 16px',
      borderRadius: 4,
      border: `1px solid ${styles[type].borderColor}`,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
    }}>
      <span>{icons[type]}</span>
      <span>{children}</span>
    </div>
  )
}
```
:::

### Challenge 5: ตั้งชื่อ Component
ตั้งชื่อ Component ให้เหมาะสมตาม Convention สำหรับสิ่งต่อไปนี้:
- กล่องแสดงสถิติ (ตัวเลขใหญ่ + label)
- หน้าโปรไฟล์ผู้ใช้
- ไอคอน Loading แบบหมุน
- Hook สำหรับดึงข้อมูล User
- Constant สำหรับจำนวนสินค้าสูงสุดต่อหน้า

::: details ดูเฉลย
- `StatCard` หรือ `MetricCard`
- `ProfilePage`
- `LoadingSpinner`
- `useUser` (ต้องขึ้นต้นด้วย `use`)
- `MAX_ITEMS_PER_PAGE` (UPPER_SNAKE_CASE)
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Functional Component** | Function ที่ Return JSX — มาตรฐาน React ปัจจุบัน |
| **Class Component** | Component แบบเก่าใช้ `class ... extends React.Component` |
| **PascalCase** | ขึ้นต้นทุกคำด้วยอักษรใหญ่ เช่น `UserCard` |
| **Composition** | การนำ Component มาประกอบกันเป็น UI ที่ซับซ้อน |
| **Single Responsibility** | หลักการที่ Component ควรทำหน้าที่เดียวเท่านั้น |
| **Reusable** | ใช้ซ้ำได้ในหลายที่ โดยส่งข้อมูลต่างๆ ผ่าน Props |
| **Hierarchy** | ลำดับชั้น Parent → Child ของ Components |
| **Props** | ข้อมูลที่ Parent ส่งให้ Child — จะเรียนรายละเอียดในบทถัดไป |
| **State** | ข้อมูลที่เปลี่ยนได้และทำให้ UI Re-render — จะเรียนใน Module 3 |
| **Leaf Component** | Component ที่ไม่มี Child Component อื่น เช่น `<Button>`, `<Avatar>` |

👉 ไปต่อ: [2.2 Props System — การส่งข้อมูลระหว่าง Component](/react/02-02-props-system)
