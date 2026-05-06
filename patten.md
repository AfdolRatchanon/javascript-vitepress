# 📘 JavaScript Zero to Hero

> **เรียน JavaScript จากศูนย์สู่เซียน** — คอร์ส JavaScript ภาษาไทย-อังกฤษ แบบครบจบในที่เดียว

[![VitePress](https://img.shields.io/badge/Built%20with-VitePress-646CFF?logo=vite)](https://vitepress.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 โปรเจกต์นี้คืออะไร?

**JavaScript Zero to Hero** คือเว็บไซต์คอร์สเรียน JavaScript แบบ **Bilingual (ไทย-อังกฤษ)** ที่สร้างด้วย [VitePress](https://vitepress.dev) เหมาะสำหรับ:

- 🆕 **ผู้เริ่มต้น** ที่ไม่เคยเขียนโค้ดมาก่อน
- 🎓 **นักศึกษา** ที่ต้องการเสริมพื้นฐาน JavaScript
- 🔁 **นักพัฒนา** ที่ต้องการทบทวน Concept สำคัญ

### ✨ จุดเด่น

| Feature | รายละเอียด |
|:--------|:----------|
| **Zero to Hero** | เริ่มจากศูนย์ ไม่ต้องมีพื้นฐาน |
| **Bilingual** | คำศัพท์เทคนิคภาษาอังกฤษ + คำอธิบายภาษาไทย |
| **Project Based** | ทุก Module มี Guided Project ให้ลงมือทำ |
| **MDN Referenced** | อ้างอิง MDN Web Docs เป็นหลัก |
| **Progressive** | เรียงจากง่ายไปยาก เรียนตามลำดับได้เลย |

---

## 🗺️ โครงสร้างคอร์ส (Course Outline)

โปรเจกต์นี้แบ่งเนื้อหาเป็น 3 คอร์ส ดูรายละเอียดบทเรียนได้ที่ไฟล์แต่ละคอร์ส:

| คอร์ส | รายละเอียด | ไฟล์ |
|:------|:----------|:-----|
| 📘 **JavaScript** | 44 บทเรียน + 15 โปรเจกต์ (12 Module) | [JS_COURSE.md](JS_COURSE.md) |
| 📗 **Node.js** | 45 ไฟล์เนื้อหา + 15 โปรเจกต์ (16 Module) — Backend + Express + MySQL + MongoDB | [NODE_COURSE.md](NODE_COURSE.md) |
| ⚛️ **React** | 28 ไฟล์เนื้อหา (12 Module) — Hooks & Functional Components | [REACT_COURSE.md](REACT_COURSE.md) |

---

## 🚀 การเริ่มต้นใช้งาน (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)

- [Node.js](https://nodejs.org/) v18 ขึ้นไป
- [npm](https://www.npmjs.com/) (มาพร้อม Node.js)
- Code Editor เช่น [VS Code](https://code.visualstudio.com/)

### ติดตั้ง (Installation)

```bash
# 1. Clone โปรเจกต์
git clone <repository-url>
cd JavaScript

# 2. ติดตั้ง Dependencies
npm install

# 3. รันเว็บไซต์ (Development Mode)
npm run docs:dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` ก็พร้อมใช้งาน!

### คำสั่งที่ใช้ได้ (Available Scripts)

| คำสั่ง | ใช้ทำอะไร |
|:-------|:---------|
| `npm run docs:dev` | รันเว็บไซต์ในโหมด Development (Hot Reload) |
| `npm run docs:build` | Build เว็บไซต์สำหรับ Production |
| `npm run docs:preview` | Preview เว็บไซต์ที่ Build แล้ว |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
JavaScript/
├── docs/                           # 📄 เนื้อหาบทเรียนทั้งหมด
│   ├── .vitepress/
│   │   └── config.mts              # ⚙️ Config VitePress (Sidebar, Nav)
│   ├── index.md                    # 🏠 Main Portal (ทางเข้าหลัก)
│   ├── javascript/                 # 📘 เนื้อหา JavaScript (44 บทเรียน + 15 โปรเจกต์)
│   ├── node/                       # 📗 เนื้อหา Node.js (45 บทเรียน + 15 โปรเจกต์)
│   └── react/                      # ⚛️ เนื้อหา React (12 บทเรียน + 12 โปรเจกต์)
├── package.json
├── .gitignore
├── JS_COURSE.md                    # 📘 โครงสร้างบทเรียน JavaScript
├── NODE_COURSE.md                  # 📗 โครงสร้างบทเรียน Node.js
├── REACT_COURSE.md                 # ⚛️ โครงสร้างบทเรียน React
└── README.md                       # 📘 ไฟล์นี้!
```

### การตั้งชื่อไฟล์ (Naming Convention)

| Pattern | ใช้สำหรับ | ตัวอย่าง |
|:--------|:---------|:--------|
| `XX-YY-topic.md` | บทเรียน | `07-02-promises.md` |
| `XX-project-name.md` | โปรเจกต์ | `07-project-weather-app.md` |
| `XX-sol.md` | เฉลย | `solutions/03-sol.md` |

- `XX` = หมายเลข Module (01-12)
- `YY` = หมายเลขบทเรียนใน Module (01-03)

---

## ✏️ การแก้ไขและเพิ่มเนื้อหา (Contributing Guide)

### เพิ่มบทเรียนใหม่

1. **สร้างไฟล์** `.md` ใน `docs/` ตาม Naming Convention
2. **แก้ Sidebar** ใน `docs/.vitepress/config.mts` — เพิ่มลิงก์ในส่วน `sidebar`
3. **แก้ Roadmap** ใน `docs/roadmap.md` — เพิ่มลิงก์ในสารบัญ
4. **ตรวจสอบ** ด้วย `npm run docs:dev` ก่อน Commit

### 🏅 Gold Standard — มาตรฐานเนื้อหา (Content Quality Standards)

ทุกบทเรียนต้องผ่านเกณฑ์คุณภาพเพื่อให้ผู้เรียน **เข้าใจได้จริง** ไม่ใช่แค่ดูโค้ดตัวอย่าง

#### 📐 เกณฑ์ขั้นต่ำ (Minimum Requirements)

เกณฑ์ความยาวแยกตามประเภทไฟล์ — เน้นความครบถ้วนขององค์ประกอบมากกว่าจำนวนบรรทัด:

| ประเภทไฟล์ | ความยาวขั้นต่ำ | ต้องครบ 10 องค์ประกอบ | ตัวอย่าง |
|:-----------|:-------------:|:--------------------:|:---------|
| **บทเรียนหลัก** | **≥ 300 บรรทัด** | ✅ ต้องครบทุกข้อ | `02-01-variables.md` |
| **บทโปรเจกต์** | **≥ 150 บรรทัด** | ⚠️ ครบตามที่เหมาะสม | `05-project-todo.md` |
| **Setup / Index** | ไม่บังคับ | ❌ ไม่บังคับ | `00-setup.md`, `index.md` |

| เกณฑ์เพิ่มเติม | รายละเอียด | เป้าหมาย |
|:---------------|:----------|:---------|
| **สัดส่วน Prose:Code** | คำอธิบาย vs โค้ดตัวอย่าง | **≥ 40% Prose** |
| **Challenges** | จำนวนโจทย์ท้าทายท้ายบท | **≥ 1 ข้อ/หัวข้อย่อย** (เช่น 6 หัวข้อ = ≥ 6 challenges) |
| **Glossary** | จำนวนคำศัพท์เทคนิค | **≥ 8 คำ** (บทเรียนหลัก) |

#### 📝 องค์ประกอบที่ต้องมี — 10 ข้อ (Required Components)

| # | องค์ประกอบ | รายละเอียด |
|:-:|:----------|:----------|
| 1 | **Quote** | คำคมเปิดบท (ภาษาอังกฤษ) พร้อมชื่อผู้พูด |
| 2 | **Analogy** | เปรียบเทียบ Concept กับสิ่งที่คุ้นเคย (Emoji + ภาษาไทย) |
| 3 | **MDN Reference** | ลิงก์ไป MDN Web Docs ทุก Section หลัก |
| 4 | **คำอธิบายก่อนโค้ด** | ทุก Code Block ต้องมี **คำอธิบายภาษาไทย** ก่อนเสมอ — บอกว่า "ทำไม" "เมื่อไหร่ใช้" "แก้ปัญหาอะไร" |
| 5 | **Code Examples** | ตัวอย่างโค้ดพร้อม Comments + Output |
| 6 | **Comparison Table** | ตารางเปรียบเทียบ ≥ 1 ตาราง (เช่น `==` vs `===`) |
| 7 | **Real-World Use Case** | ตัวอย่างการใช้งานจริง ≥ 1 กรณี |
| 8 | **Challenges (ตามหัวข้อย่อย)** | โจทย์ ≥ 1 ข้อ/หัวข้อย่อย พร้อมเฉลยซ่อนใน `::: details` |
| 9 | **Glossary** | คำศัพท์เทคนิค 8-12 คำ พร้อมคำอธิบายไทยสั้นๆ |
| 10 | **Navigation** | ลิงก์ `👉 ไปต่อ: ...` ท้ายบท |

#### 🚫 หลัก No Duplication — สอนครั้งเดียว อ้างอิงข้ามบท

หัวข้อที่ซับซ้อนจะถูก **สอนเต็มรูปแบบในบทเดียว** เท่านั้น บทอื่นที่เกี่ยวข้องให้เขียนแค่ **preview สั้นๆ (5-15 บรรทัด)** แล้วลิงก์ไปบทหลัก:

| หัวข้อ | Preview สั้นๆ ที่ | เจาะลึกเต็มที่ |
|:-------|:-----------------|:--------------|
| Hoisting & TDZ | `02-01` Variables | **`04-03` Scope & Closures** |
| Stack vs Heap / Reference vs Value | `02-02` Data Types | **`05-03` Reference vs Value** |

วิธีเขียน Preview:

```markdown
## หัวข้อ
คำอธิบายสั้นๆ 2-3 ประโยค + ตัวอย่างโค้ดสั้น 1 อัน

::: tip ⚡ เจาะลึกเรื่องนี้ในบท X.X
คำอธิบายว่าจะเรียนอะไรเพิ่ม + [ลิงก์ไปบทหลัก](/javascript/XX-XX-topic)
:::
```

> **หลักการ:** ถ้าเนื้อหาเดียวกันปรากฏในมากกว่า 1 บท = ต้อง refactor ให้เหลือบทเดียว + preview

#### ❌ สิ่งที่ต้องหลีกเลี่ยง

- ❌ **Code Dump** — โค้ดยาวๆ ติดกันไม่มีคำอธิบาย
- ❌ **ภาษาอังกฤษล้วน** — คำอธิบายหลักต้องเป็นภาษาไทย
- ❌ **ขาด Context** — โค้ดที่ไม่บอกว่า "ใช้เมื่อไหร่" "ทำไมต้องทำ"
- ❌ **Challenge ไม่ครบหัวข้อ** — ต้องมี ≥ 1 ข้อ/หัวข้อย่อยเสมอ (เช่น บทมี 5 หัวข้อ → ≥ 5 challenges)
- ❌ **เนื้อหาซ้ำซ้อนข้ามบท** — ห้ามอธิบายหัวข้อเดียวกันเต็มรูปแบบใน 2 บท
- ❌ **Padding เพื่อให้ถึงเกณฑ์** — ห้ามเพิ่มเนื้อหาที่ไม่จำเป็นแค่เพื่อนับบรรทัด
- ❌ **Challenge Header ซ้ำ** — แต่ละบทต้องมี `## Challenges` เพียง 1 ครั้งเท่านั้น
- ❌ **Horizontal Rules (`---`)** — ห้ามใช้ `---` ขีดเส้นคั่นเนื้อหา (ยกเว้นใน Table หรือ Frontmatter)

#### ✅ ตัวอย่างรูปแบบที่ดี

```markdown
## Section Title

คำอธิบายภาษาไทยว่า Concept นี้คืออะไร ทำไมสำคัญ ใช้เมื่อไหร่...

[MDN Reference Link]

\`\`\`javascript
// ตัวอย่างโค้ดพร้อม Comments
\`\`\`

> 💡 **เกร็ดเพิ่มเติม / ข้อควรระวัง**

### 📊 Comparison Table
| ... | ... |

### ตัวอย่าง Real-World: ...
```

#### 🎯 ตัวอย่างรูปแบบ Challenges & เฉลย

```markdown
## Challenges 🏆

### 🎯 Challenge N: [ชื่อที่สื่อความหมาย]
**หัวข้อ:** [ชื่อ Section ที่โจทย์ทดสอบ]

**โจทย์:** [อธิบายโจทย์ชัดเจน บอกว่าต้องทำอะไร ผลลัพธ์ควรเป็นอะไร]
::: details ✨ ดูเฉลย
[คำอธิบายสั้นๆ (ถ้ามี)]
\`\`\`javascript
// โค้ดเฉลย
\`\`\`
:::
```

**กฎสำคัญ:**
- Header `## Challenges` มีได้เพียง **1 ครั้ง** ต่อบท
- ชื่อ Challenge ต้องระบุ **Section ที่ทดสอบ** ด้วย `**หัวข้อ:**`
- เฉลยต้องซ่อนใน `::: details ✨ ดูเฉลย` เสมอ
- จำนวน Challenge ต้อง **≥ จำนวน Section หลัก** ในบท

### เพิ่ม Module ใหม่

1. สร้างไฟล์เนื้อหา + ไฟล์โปรเจกต์ตาม Pattern ข้างบน
2. เพิ่ม Module ใน `docs/.vitepress/config.mts`:
   ```typescript
   {
       text: 'Module XX: Topic Name',
       items: [
           { text: 'X.1 - Subtopic', link: '/XX-01-subtopic' },
           { text: '🎯 Project: Name', link: '/XX-project-name' }
       ]
   }
   ```
3. เพิ่มใน `docs/roadmap.md`
4. อัปเดตตาราง Module ในไฟล์ Course ที่เกี่ยวข้อง (`JS_COURSE.md`, `NODE_COURSE.md`, `REACT_COURSE.md`)

### การใช้ VitePress Features

```markdown
<!-- ซ่อน/แสดงเนื้อหา (Collapsible) -->
::: details ✨ ดูเฉลย
เนื้อหาที่ซ่อนอยู่
:::

<!-- Tips / Warnings -->
::: tip 💡 เกร็ดความรู้
ข้อมูลเสริม
:::

::: warning ⚠️ ข้อควรระวัง
สิ่งที่ต้องระวัง
:::

<!-- MathJax (สูตรคณิตศาสตร์) -->
$$E = mc^2$$
```

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| เทคโนโลยี | เวอร์ชัน | ใช้ทำอะไร |
|:----------|:--------:|:---------|
| [VitePress](https://vitepress.dev) | 1.6.4 | Static Site Generator |
| [Vue.js](https://vuejs.org) | 3.x | Frontend Framework (VitePress core) |
| [markdown-it-mathjax3](https://github.com/tani/markdown-it-mathjax3) | 4.3.2 | สูตรคณิตศาสตร์ใน Markdown |

---

## 📌 สิ่งที่ควรปรับปรุงในอนาคต (Future Improvements)

### 🔴 Priority (ควรทำเร็วๆ นี้)

- [ ] **เพิ่มเฉลยโปรเจกต์** — สร้าง `solutions/` folder + ไฟล์ Solution สำหรับทุก Project
- [ ] **Deploy** — Deploy ขึ้น GitHub Pages / Vercel / Netlify
- [ ] **ตรวจ Gold Standard Node.js & React** — ตรวจสอบเนื้อหา Node.js / React ตาม 10 องค์ประกอบเดียวกับ JS Course
- [ ] **Quiz System** — เพิ่มแบบทดสอบท้ายบทด้วย Vue Component

### 🟡 Nice-to-have (ทำเมื่อพร้อม)

- [ ] **Interactive Code Playground** — ฝัง Code Editor ให้ทดลองโค้ดได้เลยในหน้าเว็บ (เช่น [Sandpack](https://sandpack.codesandbox.io/))
- [ ] **Search Enhancement** — ปรับปรุงระบบค้นหาให้รองรับภาษาไทย
- [ ] **Dark Mode Toggle** — ปรับ Theme ให้รองรับ Dark/Light อย่างสมบูรณ์
- [ ] **Progressive Web App** — ทำให้เว็บเปิดได้ Offline
- [ ] **i18n** — แยก Version ภาษาไทยกับภาษาอังกฤษ

---

## 🔗 แหล่งข้อมูลอ้างอิง (References)

| แหล่งข้อมูล | ใช้ทำอะไร |
|:-----------|:---------|
| [MDN Web Docs — JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) | อ้างอิงหลักทุกบทเรียน |
| [JavaScript.info](https://javascript.info/) | คำอธิบายเชิงลึกเพิ่มเติม |
| [ECMAScript Specification](https://tc39.es/ecma262/) | รายละเอียด Spec ระดับภาษา |
| [Can I Use](https://caniuse.com/) | ตรวจสอบ Browser Support |
| [Web.dev by Google](https://web.dev/) | Best Practices & Performance |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for JavaScript learners everywhere
</p>
