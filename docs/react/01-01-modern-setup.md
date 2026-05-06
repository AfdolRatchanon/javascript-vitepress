# 1.1 React คืออะไร และการ Setup โปรเจกต์ด้วย Vite

> *"The best way to predict the future is to create it."*
> — **Peter Drucker** (หลักการที่ React ยึดถือ — สร้าง UI ที่ควบคุมได้ แทนการรอ DOM ทำงานเอง)

## เปรียบเทียบให้เห็นภาพ

🏗️ **ลองนึกภาพว่าคุณกำลังสร้างเมืองจำลอง** — ถ้าสร้างด้วย HTML/JS ล้วนๆ คุณต้องปั้นอาคารทุกหลังด้วยมือทีละอิฐ แก้แล้วพัง พังแล้วต้องรื้อทั้งหมด แต่ **React** คือการมีโรงงานผลิต "ชิ้นส่วนสำเร็จรูป" (Components) — สร้าง `ตึก` แบบหนึ่ง แล้วก็วางมันได้ทุกถนนในเมือง เปลี่ยนสีหลังคาที่ต้นแบบ ทุกตึกในเมืองเปลี่ยนพร้อมกันทันที นั่นคือพลังของ **Declarative + Reusable Components**

## React คืออะไร?

**React** คือ JavaScript **Library** (ไม่ใช่ Framework) สำหรับสร้าง User Interface โดยทีมวิศวกรของ **Meta (Facebook)** เปิดตัวในปี 2013 เพื่อแก้ปัญหา UI ที่ซับซ้อนของ Facebook News Feed

> 📖 **อ่านเพิ่มเติม:** [React Official Docs — react.dev](https://react.dev/learn)

จุดเด่น 3 อย่างที่ทำให้ React ครองตลาดมาจนถึงทุกวันนี้:

**1. Component-Based Architecture**
แบ่ง UI ออกเป็น "ชิ้นส่วน" อิสระที่จัดการตัวเองได้ นำกลับมาใช้ซ้ำได้ทั่วทั้งแอป เช่น `<Button>`, `<Navbar>`, `<ProductCard>`

**2. Declarative UI**
บอก React ว่า UI ควร "หน้าตาเป็นอย่างไร" ณ ขณะนั้น แทนที่จะต้องสั่งทีละขั้นตอนว่า "ไปเปลี่ยน DOM อย่างไร" React จะคิดเองว่าต้องทำอะไรบ้าง

**3. Learn Once, Write Anywhere**
ความรู้ React ใช้ได้กับ React Native (Mobile), React Native Web, Next.js (SSR) และอื่นๆ

### Library vs Framework คืออะไร?

มือใหม่มักสับสน ขอให้เข้าใจตารางนี้ก่อน:

| | Library (React) | Framework (Angular, Next.js) |
|:---|:---|:---|
| **ใครเป็นคนควบคุม?** | คุณ — เลือกใช้เมื่อไหร่ก็ได้ | Framework — กำหนด Structure ให้ |
| **เปรียบเทียบ** | เหมือนซื้อวัตถุดิบทำอาหารเอง | เหมือนสั่งอาหารสำเร็จรูป มาพร้อมทุกอย่าง |
| **ความยืดหยุ่น** | สูง — จับคู่กับอะไรก็ได้ | ต่ำกว่า — ต้องเดินตามแนวทาง |
| **ขนาด Bundle** | เล็กกว่า | ใหญ่กว่า |
| **ตัวอย่าง** | React, Vue, Svelte | Angular, Ember, Next.js |

React เป็น Library ที่ดูแลแค่ **View Layer** (ส่วนแสดงผล) ดังนั้นคุณต้องเลือกเครื่องมืออื่นๆ เพิ่มเอง เช่น Routing, State Management, Data Fetching — ซึ่งเป็นเหตุผลว่าทำไม Ecosystem ของ React จึงใหญ่มาก

## Virtual DOM คืออะไร และทำไมต้องมี?

> 📖 **อ่านเพิ่มเติม:** [React — Rendering](https://react.dev/learn/render-and-commit)

**ปัญหาของ Real DOM:** ทุกครั้งที่ JavaScript แก้ไข DOM โดยตรง (เช่น `document.getElementById(...).innerHTML = ...`) เบราว์เซอร์ต้อง:
1. Parse HTML ใหม่
2. คำนวณ Layout (Reflow)
3. วาดหน้าจอใหม่ (Repaint)

ถ้าทำสิ่งนี้บ่อยๆ หรือกับ Element จำนวนมาก → **เว็บช้า กระตุก**

**วิธีแก้ของ React — Virtual DOM:**

React เก็บ "สำเนาของ DOM" ไว้ใน Memory เป็น JavaScript Object ธรรมดา (เรียกว่า Virtual DOM) เมื่อมีอะไรเปลี่ยน React จะ:

1. สร้าง Virtual DOM ใหม่ (เร็วมาก เพราะเป็นแค่ Object)
2. เปรียบเทียบกับ Virtual DOM เก่า (**Diffing**)
3. คำนวณว่าส่วนไหนของ Real DOM ต้องเปลี่ยนจริงๆ
4. อัปเดตเฉพาะส่วนนั้น (**Reconciliation**)

ผลคือ React แตะ Real DOM น้อยที่สุด → เว็บเร็วขึ้นมาก

```javascript
// แบบเดิม (Imperative) — ต้องจัดการ DOM เอง
const btn = document.getElementById('likeBtn')
btn.addEventListener('click', () => {
  const count = parseInt(btn.dataset.count) + 1
  btn.dataset.count = count
  btn.textContent = `❤️ ${count}`  // แตะ Real DOM โดยตรง
})

// แบบ React (Declarative) — บอกแค่ว่า UI ควรหน้าตาเป็นอย่างไร
// React จัดการ DOM ให้เอง
function LikeButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>❤️ {count}</button>
}
```

> 💡 **สิ่งที่ต้องรู้:** Virtual DOM ไม่ได้ทำให้เร็วกว่าการแตะ DOM ตรงๆ เสมอไป แต่ทำให้ **เขียนโค้ดง่ายขึ้นมาก** โดยไม่เสีย Performance มากนัก

## Vite vs CRA — เลือกอะไรในปี 2025?

> 📖 **อ่านเพิ่มเติม:** [Vite Documentation](https://vitejs.dev/guide/)

**Create React App (CRA)** คือ Tool เดิมที่ React แนะนำมานาน แต่ปัจจุบัน **deprecated** แล้ว เพราะช้ามาก ทั้ง Start Time และ Build Time

**Vite** (อ่านว่า "วีต" ภาษาฝรั่งเศส แปลว่า "เร็ว") คือ Build Tool รุ่นใหม่ที่เร็วกว่า CRA หลายเท่า ตอนนี้เป็น **มาตรฐานอุตสาหกรรม** สำหรับ React ในปี 2025

| | Vite | Create React App (CRA) |
|:---|:---|:---|
| **Start Dev Server** | < 1 วินาที | 10-30 วินาที |
| **Hot Module Reload** | เกือบทันที | 1-5 วินาที |
| **Build Production** | เร็ว (Rollup) | ช้า (Webpack) |
| **Status ปัจจุบัน** | ✅ Active — มาตรฐาน | ❌ Deprecated |
| **Config ยุ่งยากไหม?** | น้อยมาก | ซับซ้อน |
| **รองรับ Framework** | React, Vue, Svelte, Vanilla | เฉพาะ React |

**สรุป: ใช้ Vite เสมอ ไม่มีเหตุผลใดที่จะใช้ CRA อีกต่อไป**

## สร้างโปรเจกต์ React ด้วย Vite

เปิด Terminal แล้วพิมพ์คำสั่งเหล่านี้ตามลำดับ:

ก่อนอื่น ตรวจสอบว่ามี Node.js ติดตั้งแล้วหรือยัง (ต้องใช้ Node.js v18 ขึ้นไป):

```bash
node --version
# ควรเห็น v18.x.x หรือใหม่กว่า
```

สร้างโปรเจกต์ใหม่ด้วย Vite — คำสั่ง `create vite` จะถามชื่อโปรเจกต์และ Framework ที่ต้องการ:

```bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` ก็จะเห็นหน้า React โปรเจกต์แรกของคุณ!

> 💡 **ถ้าต้องการใช้ TypeScript** ให้เปลี่ยน `--template react` เป็น `--template react-ts` แต่คอร์สนี้ใช้ JavaScript ล้วน ไม่ต้องทำ

## Project Structure มาตรฐาน

หลังจาก `npm create vite` เสร็จ คุณจะได้โครงสร้างโปรเจกต์แบบนี้:

```
my-react-app/
├── public/               # ไฟล์ Static (favicon, robots.txt)
│   └── vite.svg
├── src/                  # โค้ดทั้งหมดอยู่ที่นี่!
│   ├── assets/           # รูปภาพ, ฟอนต์ที่ import ใน Component
│   ├── App.jsx           # Root Component — ทุกอย่างเริ่มจากที่นี่
│   ├── App.css           # Style ของ App Component
│   ├── main.jsx          # Entry Point — mount React เข้า HTML
│   └── index.css         # Global CSS
├── index.html            # HTML หลัก (มีแค่ <div id="root">)
├── vite.config.js        # Config ของ Vite
└── package.json          # Dependencies และ Scripts
```

ไฟล์ที่สำคัญที่สุดคือ `src/main.jsx` — นี่คือจุดที่ React เริ่มทำงาน:

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// หาก Element ที่มี id="root" ใน index.html
// แล้ว Mount (ติดตั้ง) App Component เข้าไป
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

และ `src/App.jsx` คือ Root Component — ทุก Component อื่นๆ จะถูกใส่ไว้ที่นี่:

```jsx
// src/App.jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>React + Vite</h1>
      <button onClick={() => setCount(count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App
```

### คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
|:-------|:--------|
| `npm run dev` | เปิด Dev Server (Hot Reload) ที่ port 5173 |
| `npm run build` | Build โปรเจกต์สำหรับ Production |
| `npm run preview` | Preview ไฟล์ที่ Build แล้ว |
| `npm install <package>` | ติดตั้ง Package ใหม่ |

## ตัวอย่าง Real-World: โครงสร้างโปรเจกต์จริง

เมื่อโปรเจกต์ใหญ่ขึ้น การวาง Structure ที่ดีตั้งแต่แรกสำคัญมาก นี่คือรูปแบบที่นิยมใช้กันใน Production:

```
src/
├── components/           # Shared/Reusable Components
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.module.css
│   └── Navbar/
│       └── Navbar.jsx
├── pages/                # Page-level Components (แต่ละหน้า)
│   ├── Home.jsx
│   ├── About.jsx
│   └── Dashboard.jsx
├── hooks/                # Custom Hooks (จะเรียนใน Module 7)
│   └── useFetch.js
├── services/             # API Calls
│   └── userService.js
├── store/                # Global State (Redux/Context)
│   └── authSlice.js
└── utils/                # Helper Functions
    └── formatDate.js
```

> 💡 **เกร็ดความรู้:** ใน Module 19 (Capstone) เราจะเรียน **Feature-based Structure** ที่เหมาะกับโปรเจกต์ขนาดใหญ่ยิ่งกว่านี้

## Challenges

### Challenge 1: ทดสอบความเข้าใจ Virtual DOM
React ใช้ Virtual DOM เพื่อแก้ปัญหาอะไร? และกระบวนการ Reconciliation คืออะไร?

::: details ดูเฉลย
Virtual DOM แก้ปัญหาการอัปเดต Real DOM บ่อยๆ ซึ่งทำให้เบราว์เซอร์ต้อง Reflow/Repaint ซ้ำๆ และช้า

Reconciliation คือกระบวนการที่ React เปรียบเทียบ Virtual DOM เก่ากับใหม่ (Diffing) แล้วอัปเดตเฉพาะส่วนที่เปลี่ยนใน Real DOM เท่านั้น ทำให้ลด DOM Operation ที่ไม่จำเป็น
:::

### Challenge 2: สร้างโปรเจกต์แรก
ลงมือสร้างโปรเจกต์ React ใหม่ด้วย Vite แล้วตรวจสอบว่า:
- Dev server รันที่ port อะไร?
- ไฟล์ไหนคือ Entry Point ของ React?
- ไฟล์ `index.html` มี Element อะไรที่ React ใช้ Mount ตัวเอง?

::: details ดูเฉลย
- Dev server รันที่ **port 5173** (แตกต่างจาก CRA ที่ใช้ 3000)
- Entry Point คือ **`src/main.jsx`** — ที่นี่เรียก `createRoot().render()`
- `index.html` มี `<div id="root"></div>` ที่ React ใช้เป็นจุด Mount
:::

### Challenge 3: Library vs Framework
ทำไม React จึงเป็น Library ไม่ใช่ Framework? และข้อดีของการเป็น Library คืออะไร?

::: details ดูเฉลย
React เป็น Library เพราะมันดูแลแค่ **View Layer** เท่านั้น — ไม่บังคับว่าต้องใช้ Router, State Management, หรือ HTTP Client ตัวใด

ข้อดี: ความยืดหยุ่นสูง — เลือกเครื่องมือที่เหมาะกับโปรเจกต์ได้เอง เช่น บางโปรเจกต์ใช้ React Router + Redux ส่วนอีกโปรเจกต์อาจใช้ TanStack Router + Zustand
:::

### Challenge 4: Vite คืออะไร
บอกความแตกต่างระหว่าง Vite และ CRA อย่างน้อย 3 ข้อ และเหตุใดจึงควรเลือก Vite

::: details ดูเฉลย
1. **Speed:** Vite เริ่ม Dev Server ภายใน 1 วินาที, CRA ใช้ 10-30 วินาที
2. **HMR (Hot Module Reload):** Vite เกือบทันที, CRA ใช้หลายวินาที
3. **Status:** Vite ยัง Active, CRA ถูก Deprecated แล้ว
4. **Multi-framework:** Vite รองรับ React, Vue, Svelte ส่วน CRA เฉพาะ React
:::

### Challenge 5: อ่าน Project Structure
จาก Structure ด้านล่าง ไฟล์ไหนควรวางที่ `components/` และไฟล์ไหนควรวางที่ `pages/`?

```
Header.jsx, LoginPage.jsx, Button.jsx, ProductList.jsx,
HomePage.jsx, Modal.jsx
```

::: details ดูเฉลย
**`components/`** (ใช้ซ้ำได้หลายที่): `Header.jsx`, `Button.jsx`, `Modal.jsx`, `ProductList.jsx`

**`pages/`** (แต่ละหน้า): `LoginPage.jsx`, `HomePage.jsx`

หลักการ: ถ้า Component ถูกใช้แค่หน้าเดียว → `pages/`, ถ้าถูกใช้หลายที่ → `components/`
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Library** | เครื่องมือที่คุณเลือกใช้เองได้ ไม่บังคับ Structure |
| **Framework** | โครงสร้างที่กำหนดวิธีเขียนโค้ดให้คุณ |
| **Component** | ชิ้นส่วน UI ที่นำมาประกอบกันได้ เหมือนอิฐก่อสร้าง |
| **Virtual DOM** | สำเนาของ DOM ที่เก็บไว้ใน Memory เป็น JavaScript Object |
| **Diffing** | กระบวนการเปรียบเทียบ Virtual DOM เก่ากับใหม่ |
| **Reconciliation** | กระบวนการอัปเดต Real DOM เฉพาะส่วนที่เปลี่ยน |
| **Declarative** | บอกว่าอยากได้ "ผลลัพธ์อะไร" แทนที่จะบอก "ขั้นตอนอย่างไร" |
| **Vite** | Build Tool รุ่นใหม่ที่เร็วมาก ใช้ ESM ใน Dev Mode |
| **HMR** | Hot Module Reload — อัปเดตโค้ดในเบราว์เซอร์โดยไม่ต้อง Refresh |
| **Entry Point** | จุดเริ่มต้นของโปรเจกต์ (`src/main.jsx`) |
| **Mount** | กระบวนการที่ React นำ Component ไปแสดงใน DOM จริง |
| **CRA** | Create React App — Tool เก่าที่ปัจจุบัน Deprecated แล้ว |

👉 ไปต่อ: [1.2 JSX Deep Dive — 5 กฎเหล็กที่ต้องรู้](/react/01-02-jsx-deep-dive)
