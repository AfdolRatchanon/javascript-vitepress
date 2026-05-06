# 👤 Project 2: User Profile Card

> **โปรเจกต์นี้ฝึก:** Props ทุกประเภท, Destructuring, Children Props, PropTypes, Composition, Default Props

## โจทย์

สร้างระบบ **User Profile Card** สำหรับแพลตฟอร์ม Developer Community ที่มี:

1. **ProfileCard** — แสดงข้อมูลผู้ใช้หลัก (avatar, ชื่อ, bio, stats)
2. **SkillBadge** — Badge แสดง Skill แต่ละอัน (มีสีตาม Category)
3. **StatBox** — กล่องแสดงตัวเลขสถิติ (โพสต์, ผู้ติดตาม, กำลังติดตาม)
4. **ProfileGrid** — แสดงหลาย ProfileCard พร้อมกันในรูป Grid

## Data Structure

```javascript
// ข้อมูลผู้ใช้ที่จะส่งผ่าน Props
const users = [
  {
    id: 1,
    name: 'สมชาย พัฒนาโค้ด',
    username: '@somchai_dev',
    bio: 'Full-stack Developer ชอบ React และ Node.js เรียนรู้ไม่หยุด!',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=somchai',
    isOnline: true,
    isPro: true,
    joinYear: 2021,
    stats: { posts: 142, followers: 3420, following: 89 },
    skills: [
      { name: 'React', category: 'frontend' },
      { name: 'Node.js', category: 'backend' },
      { name: 'TypeScript', category: 'language' },
    ],
  },
  {
    id: 2,
    name: 'มาลี สร้างเว็บ',
    username: '@malee_web',
    bio: 'UI/UX Designer ที่หัดเขียน Code เชื่อว่าดีไซน์ดี + โค้ดดี = แอปสวย',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=malee',
    isOnline: false,
    isPro: false,
    joinYear: 2023,
    stats: { posts: 28, followers: 156, following: 312 },
    skills: [
      { name: 'Figma', category: 'design' },
      { name: 'CSS', category: 'frontend' },
      { name: 'Vue.js', category: 'frontend' },
    ],
  },
  {
    id: 3,
    name: 'ธนพล แบ็กเอนด์',
    username: '@thanapol_be',
    bio: 'Backend Engineer ชอบ Database Optimization และ System Design',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thanapol',
    isOnline: true,
    isPro: true,
    joinYear: 2020,
    stats: { posts: 89, followers: 1205, following: 44 },
    skills: [
      { name: 'Python', category: 'language' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Docker', category: 'devops' },
    ],
  },
]
```

## งานที่ต้องทำ

### Task 1: SkillBadge Component

สร้าง `<SkillBadge>` รับ props `name` และ `category` แล้วแสดงเป็น Badge ที่มีสีตาม Category:

| Category | สี |
|:---------|:---|
| `frontend` | น้ำเงิน (#61DAFB) |
| `backend` | เขียว (#68D391) |
| `language` | ส้ม (#F6AD55) |
| `database` | ม่วง (#9F7AEA) |
| `design` | ชมพู (#F687B3) |
| `devops` | เทา (#718096) |

### Task 2: StatBox Component

สร้าง `<StatBox>` รับ `label` (string) และ `value` (number) พร้อมแสดงตัวเลขในรูปแบบ:
- ถ้า >= 1000 แสดงเป็น `1.2K` แทน `1200`

### Task 3: ProfileCard Component

สร้าง `<ProfileCard>` รับ `user` object ทั้งก้อน แล้วแสดง:
- Avatar (รูป + Online/Offline indicator)
- ชื่อ + username + Badge "PRO" (ถ้า isPro)
- Bio
- StatBox สำหรับ posts, followers, following
- SkillBadge ทุก Skill

### Task 4: ProfileGrid + PropTypes

- สร้าง `<ProfileGrid>` ที่รับ `users` array และ map เป็น `<ProfileCard>`
- เพิ่ม PropTypes ให้ทุก Component

## ตัวอย่าง Solution

::: details ดูเฉลยฉบับสมบูรณ์

```jsx
// src/App.jsx
import PropTypes from 'prop-types'

const users = [/* ข้อมูลด้านบน */]

// Helper: แปลงตัวเลขให้อ่านง่าย
function formatNumber(num) {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Component: SkillBadge
const categoryColors = {
  frontend: { bg: '#EBF8FF', text: '#2B6CB0', border: '#BEE3F8' },
  backend: { bg: '#F0FFF4', text: '#276749', border: '#9AE6B4' },
  language: { bg: '#FFFAF0', text: '#7B341E', border: '#FBD38D' },
  database: { bg: '#FAF5FF', text: '#553C9A', border: '#D6BCFA' },
  design: { bg: '#FFF5F7', text: '#97266D', border: '#FED7E2' },
  devops: { bg: '#F7FAFC', text: '#2D3748', border: '#E2E8F0' },
}

function SkillBadge({ name, category }) {
  const colors = categoryColors[category] || categoryColors.devops

  return (
    <span style={{
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: '0.78rem',
      fontWeight: 500,
    }}>
      {name}
    </span>
  )
}

SkillBadge.propTypes = {
  name: PropTypes.string.isRequired,
  category: PropTypes.oneOf(['frontend', 'backend', 'language', 'database', 'design', 'devops']).isRequired,
}

// Component: StatBox
function StatBox({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{formatNumber(value)}</div>
      <div style={{ fontSize: '0.75rem', color: '#718096' }}>{label}</div>
    </div>
  )
}

StatBox.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
}

// Component: ProfileCard
function ProfileCard({ user }) {
  const { name, username, bio, avatarUrl, isOnline, isPro, joinYear, stats, skills } = user

  return (
    <article style={{
      backgroundColor: 'white',
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 320,
    }}>
      {/* Avatar Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={avatarUrl}
            alt={name}
            style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #E2E8F0' }}
          />
          {/* Online Indicator */}
          <span style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: isOnline ? '#48BB78' : '#A0AEC0',
            border: '2px solid white',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{name}</h3>
            {isPro && (
              <span style={{
                backgroundColor: '#553C9A',
                color: 'white',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: '0.65rem',
                fontWeight: 'bold',
              }}>PRO</span>
            )}
          </div>
          <p style={{ margin: '2px 0', color: '#718096', fontSize: '0.85rem' }}>{username}</p>
          <p style={{ margin: 0, color: '#A0AEC0', fontSize: '0.75rem' }}>
            เป็นสมาชิกตั้งแต่ปี {joinYear}
          </p>
        </div>
      </div>

      {/* Bio */}
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#4A5568', lineHeight: 1.5 }}>
        {bio}
      </p>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        borderTop: '1px solid #EDF2F7',
        borderBottom: '1px solid #EDF2F7',
      }}>
        <StatBox label="โพสต์" value={stats.posts} />
        <StatBox label="ผู้ติดตาม" value={stats.followers} />
        <StatBox label="ติดตาม" value={stats.following} />
      </div>

      {/* Skills */}
      <div>
        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>
          SKILLS
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {skills.map(skill => (
            <SkillBadge key={skill.name} name={skill.name} category={skill.category} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
          backgroundColor: '#4299E1', color: 'white', cursor: 'pointer', fontWeight: 500,
        }}>
          ติดตาม
        </button>
        <button style={{
          padding: '8px 12px', borderRadius: 6,
          border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer',
        }}>
          💬
        </button>
      </div>
    </article>
  )
}

ProfileCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    bio: PropTypes.string,
    avatarUrl: PropTypes.string,
    isOnline: PropTypes.bool,
    isPro: PropTypes.bool,
    joinYear: PropTypes.number,
    stats: PropTypes.shape({
      posts: PropTypes.number,
      followers: PropTypes.number,
      following: PropTypes.number,
    }),
    skills: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      category: PropTypes.string,
    })),
  }).isRequired,
}

// Component: ProfileGrid
function ProfileGrid({ users, title }) {
  return (
    <section>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{title}</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 24,
        justifyItems: 'center',
      }}>
        {users.map(user => (
          <ProfileCard key={user.id} user={user} />
        ))}
      </div>
    </section>
  )
}

ProfileGrid.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string,
}

ProfileGrid.defaultProps = {
  title: 'Developer Community',
}

// App
export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F7FAFC',
      padding: 32,
      fontFamily: 'sans-serif',
    }}>
      <ProfileGrid users={users} title="👨‍💻 Developer Community" />
    </div>
  )
}
```
:::

## เกณฑ์การประเมิน

| เกณฑ์ | คะแนน |
|:------|:------:|
| SkillBadge แสดงสีถูกต้องตาม Category | 20 |
| StatBox แสดงตัวเลขในรูปแบบ K | 15 |
| ProfileCard แสดงข้อมูลครบทุก field | 25 |
| PropTypes ครบทุก Component | 20 |
| ProfileGrid map ข้อมูลถูกต้อง ไม่มี key warning | 10 |
| Online Indicator และ PRO Badge แสดงเงื่อนไขถูก | 10 |
| **รวม** | **100** |

## Bonus Challenge

1. เพิ่ม `<EmptyState>` Component แสดงข้อความเมื่อ `users` array ว่าง
2. เพิ่ม Filter ตาม Online/Offline ด้านบน ProfileGrid
3. เพิ่ม animation เมื่อ hover บน Card ด้วย CSS Transition

👉 ไปต่อ: [Module 3: Interactivity & State](/react/03-01-event-handling)
