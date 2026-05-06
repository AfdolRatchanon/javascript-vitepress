# 🎨 Project 1: JSX Art Gallery

> **โปรเจกต์นี้ฝึก:** JSX Expressions, Conditional Rendering, Dynamic Styles, Fragment, และ camelCase Attributes

## โจทย์

สร้างหน้า **Art Gallery** ที่แสดงผลงานศิลปะดิจิทัลทำจาก JSX ล้วนๆ (ไม่ใช้รูปภาพ) โดยประกอบด้วย:

1. **Header** — ชื่อแกลเลอรีและชื่อศิลปิน (คุณเอง)
2. **Artwork Grid** — แสดง Artwork อย่างน้อย 3 ชิ้น
3. **Theme Toggle** — ปุ่มสลับ Light/Dark Mode (ใช้ CSS variable ง่ายๆ)
4. **Stats Bar** — แสดงจำนวนผลงานทั้งหมดและ "Featured" ที่เลือก

## Artwork ที่ต้องสร้าง (อย่างน้อย 3 ชิ้น)

| ชิ้นที่ | ชื่อ | เทคนิค JSX ที่ใช้ |
|:------:|:----|:----------------|
| 1 | Sunset | Inline Style + Gradient + ตัวเลขคำนวณ |
| 2 | Grid Pattern | `.map()` + `key` + Dynamic Color |
| 3 | Typography Art | Expression + Conditional Style |

## Starter Code

สร้างไฟล์ `src/App.jsx` ใหม่และใส่โค้ดนี้เป็นจุดเริ่มต้น:

```jsx
// src/App.jsx
import { useState } from 'react'

// ข้อมูล Artworks — เพิ่มชิ้นงานของคุณเองที่นี่!
const artworks = [
  {
    id: 1,
    title: 'Sunset Gradient',
    artist: 'React Artist',
    year: 2025,
    featured: true,
  },
  {
    id: 2,
    title: 'Grid Symphony',
    artist: 'React Artist',
    year: 2025,
    featured: false,
  },
  {
    id: 3,
    title: 'Typography Wave',
    artist: 'React Artist',
    year: 2025,
    featured: true,
  },
]

export default function App() {
  const [isDark, setIsDark] = useState(false)

  const featuredCount = artworks.filter(art => art.featured).length

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa',
      color: isDark ? '#eee' : '#333',
      padding: 24,
      fontFamily: 'sans-serif',
      transition: 'all 0.3s',
    }}>

      {/* TODO: สร้าง Header Component */}
      {/* TODO: สร้าง StatsBar */}
      {/* TODO: สร้าง Theme Toggle Button */}
      {/* TODO: วน loop แสดง ArtCard ทุกชิ้น */}

    </div>
  )
}
```

## งานที่ต้องทำ

### Task 1: สร้าง Header

สร้าง Component `GalleryHeader` ที่รับ props `title` และ `artistName` แล้วแสดง:
- ชื่อแกลเลอรีขนาดใหญ่ พร้อม Emoji 🖼️
- ชื่อศิลปิน (ชื่อคุณ)
- Tagline สั้นๆ

### Task 2: สร้าง ArtCard Components

สร้างอย่างน้อย 3 Component:

**`<SunsetCard />`** — ใช้ Inline Style สร้าง Gradient:
```jsx
// Hint: ใช้ background: 'linear-gradient(...)'
// และคำนวณ opacity จาก artwork.id
```

**`<GridCard />`** — ใช้ `.map()` สร้าง Grid ของ Square เล็กๆ:
```jsx
// Hint: สร้าง Array ขนาด 9 แล้ว .map() ออกมาเป็น div
// เปลี่ยนสีตาม index: index % 2 === 0 ? 'blue' : 'orange'
const squares = Array.from({ length: 9 }, (_, i) => i)
```

**`<TypographyCard />`** — แสดง Text ขนาดต่างๆ:
```jsx
// Hint: ใช้ fontSize ที่คำนวณจาก index
// ['React', 'is', 'Cool!'].map((word, i) => ...)
```

### Task 3: StatsBar และ Toggle

แสดงจำนวนผลงานทั้งหมดและจำนวน "Featured" พร้อมปุ่ม Dark Mode Toggle

## ตัวอย่าง Solution

::: details ดูเฉลยฉบับสมบูรณ์

```jsx
// src/App.jsx
import { useState } from 'react'

const artworks = [
  { id: 1, title: 'Sunset Gradient', artist: 'React Artist', year: 2025, featured: true },
  { id: 2, title: 'Grid Symphony', artist: 'React Artist', year: 2025, featured: false },
  { id: 3, title: 'Typography Wave', artist: 'React Artist', year: 2025, featured: true },
]

// Component: Header
function GalleryHeader({ title, artistName }) {
  return (
    <header style={{ textAlign: 'center', marginBottom: 32 }}>
      <h1 style={{ fontSize: '2.5rem', margin: 0 }}>🖼️ {title}</h1>
      <p style={{ color: 'gray', margin: '8px 0' }}>โดย {artistName}</p>
      <p style={{ fontStyle: 'italic' }}>ผลงานศิลปะดิจิทัลจาก JSX ล้วนๆ</p>
    </header>
  )
}

// Component: Stats
function StatsBar({ total, featured, isDark, onToggle }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderRadius: 8,
      backgroundColor: isDark ? '#16213e' : '#e9ecef',
      marginBottom: 24,
    }}>
      <span>ผลงานทั้งหมด: <strong>{total}</strong> ชิ้น</span>
      <span>⭐ Featured: <strong>{featured}</strong> ชิ้น</span>
      <button
        onClick={onToggle}
        style={{
          padding: '6px 16px',
          borderRadius: 20,
          border: 'none',
          cursor: 'pointer',
          backgroundColor: isDark ? '#61DAFB' : '#333',
          color: isDark ? '#333' : '#fff',
        }}
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  )
}

// Artwork 1: Sunset Gradient
function SunsetCard({ artwork, isDark }) {
  return (
    <article style={{
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: 24,
    }}>
      {/* ตัว Artwork */}
      <div style={{
        height: 200,
        background: `linear-gradient(
          135deg,
          #ff6b6b ${artwork.id * 10}%,
          #ffa94d 40%,
          #ffd43b 60%,
          #ff6b6b 100%
        )`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
      }}>
        🌅
      </div>
      <div style={{ padding: '12px 16px' }}>
        <h3 style={{ margin: '0 0 4px' }}>
          {artwork.title}
          {artwork.featured && <span style={{ color: 'gold', marginLeft: 8 }}>⭐</span>}
        </h3>
        <p style={{ color: 'gray', margin: 0, fontSize: '0.85rem' }}>
          {artwork.artist} · {artwork.year}
        </p>
      </div>
    </article>
  )
}

// Artwork 2: Grid Pattern
function GridCard({ artwork, isDark }) {
  const squares = Array.from({ length: 9 }, (_, i) => i)
  const colors = ['#74c0fc', '#f783ac', '#69db7c', '#ffa94d', '#da77f2']

  return (
    <article style={{
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: 24,
    }}>
      <div style={{
        height: 200,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
        padding: 4,
        backgroundColor: isDark ? '#222' : '#fff',
      }}>
        {squares.map(i => (
          <div
            key={i}
            style={{
              backgroundColor: colors[i % colors.length],
              borderRadius: 4,
              opacity: 0.6 + (i * 0.04),
              transition: 'opacity 0.2s',
            }}
          />
        ))}
      </div>
      <div style={{ padding: '12px 16px' }}>
        <h3 style={{ margin: '0 0 4px' }}>
          {artwork.title}
          {artwork.featured && <span style={{ color: 'gold', marginLeft: 8 }}>⭐</span>}
        </h3>
        <p style={{ color: 'gray', margin: 0, fontSize: '0.85rem' }}>
          {artwork.artist} · {artwork.year}
        </p>
      </div>
    </article>
  )
}

// Artwork 3: Typography
function TypographyCard({ artwork, isDark }) {
  const words = ['React', 'is', 'Amazing!']
  const sizes = [48, 24, 36]
  const colors = ['#61DAFB', '#aaa', '#ff6b6b']

  return (
    <article style={{
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: 24,
    }}>
      <div style={{
        height: 200,
        backgroundColor: isDark ? '#0d1117' : '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        {words.map((word, i) => (
          <span
            key={word}
            style={{
              fontSize: sizes[i],
              color: colors[i],
              fontWeight: 'bold',
              letterSpacing: i === 0 ? '0.2em' : 'normal',
              fontFamily: 'monospace',
            }}
          >
            {word}
          </span>
        ))}
      </div>
      <div style={{ padding: '12px 16px' }}>
        <h3 style={{ margin: '0 0 4px' }}>
          {artwork.title}
          {artwork.featured && <span style={{ color: 'gold', marginLeft: 8 }}>⭐</span>}
        </h3>
        <p style={{ color: 'gray', margin: 0, fontSize: '0.85rem' }}>
          {artwork.artist} · {artwork.year}
        </p>
      </div>
    </article>
  )
}

// Components array สำหรับ map
const ArtComponents = [SunsetCard, GridCard, TypographyCard]

export default function App() {
  const [isDark, setIsDark] = useState(false)
  const featuredCount = artworks.filter(art => art.featured).length

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa',
      color: isDark ? '#eee' : '#333',
      padding: 24,
      fontFamily: 'sans-serif',
      transition: 'all 0.3s',
      maxWidth: 600,
      margin: '0 auto',
    }}>
      <GalleryHeader title="JSX Art Gallery" artistName="React Artist" />

      <StatsBar
        total={artworks.length}
        featured={featuredCount}
        isDark={isDark}
        onToggle={() => setIsDark(!isDark)}
      />

      {artworks.map((artwork, index) => {
        const ArtComponent = ArtComponents[index % ArtComponents.length]
        return <ArtComponent key={artwork.id} artwork={artwork} isDark={isDark} />
      })}
    </div>
  )
}
```
:::

## เกณฑ์การประเมิน

| เกณฑ์ | คะแนน |
|:------|:------:|
| สร้างได้อย่างน้อย 3 Artwork Component | 30 |
| ใช้ JSX Expression (`{}`) อย่างน้อย 5 จุด | 20 |
| ใช้ Conditional Rendering อย่างน้อย 2 แบบ | 20 |
| Dark/Light Toggle ทำงานได้ | 20 |
| ไม่มี JSX Error (ปิด Tag ครบ, camelCase) | 10 |
| **รวม** | **100** |

## Bonus Challenge

เพิ่ม Artwork ชิ้นที่ 4 ของคุณเอง ซึ่งต้องมี:
- ใช้ `Array.from()` หรือ `Array.fill()` สร้างรูปแบบซ้ำๆ
- มี Animation ด้วย CSS Transition (Inline Style)
- รับ prop `animationSpeed` ที่ควบคุมความเร็ว

👉 ไปต่อ: [Module 2: Components & Props](/react/02-01-thinking-in-react)
