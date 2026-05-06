# 8.1 CSS Modules — Scoped Styles ที่ไม่ชนกัน

> "CSS is a powerful tool, but with great power comes great specificity conflicts."
> — Every frontend developer, ever

## ปัญหาของ Global CSS

ลองนึกภาพว่าคุณกำลังสร้างบ้านหลังใหญ่ที่มีหลายห้อง แต่ทุกห้องใช้ชื่อสีเดียวกันว่า "สีฟ้า" — ถ้าคุณสั่งให้ช่างทาสี "ห้องสีฟ้า" เขาจะไม่รู้ว่าต้องทาห้องไหน นั่นคือปัญหาของ Global CSS ที่ชื่อ class ชนกัน 🏠

### ปัญหาที่พบบ่อยใน Global CSS

ใน React โปรเจกต์ขนาดใหญ่ที่ไม่ใช้ CSS Modules:

```
src/
  components/
    Button/Button.css        → .button { color: blue; }
    Card/Card.css            → .button { color: red; }   ← ชนกัน!
    Navbar/Navbar.css        → .title { font-size: 24px; }
    Footer/Footer.css        → .title { font-size: 12px; } ← ชนกัน!
```

ไฟล์ CSS ทั้งหมดจะถูกรวมเป็น bundle เดียว ทำให้ class `.button` และ `.title` ที่นิยามซ้ำกันทับกันโดยอาจไม่ตั้งใจ

**ตัวอย่างปัญหาจริง:**

```css
/* Button.css */
.button {
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
}

/* Card.css */
.button {
  background-color: transparent;  /* ทับ styles ของ Button! */
  border: 1px solid #ccc;
}
```

ผลลัพธ์ที่ได้คือ ปุ่มใน Button component จะแสดงผลผิดพลาดเพราะถูก Card.css override

::: warning ระวัง
ปัญหา CSS ชนกันนี้มักไม่แสดง error ใน console แต่ทำให้ UI แสดงผลไม่ถูกต้อง ซึ่งหาสาเหตุยากมาก โดยเฉพาะในโปรเจกต์ที่มีหลายคนช่วยกันพัฒนา
:::

**ปัญหาหลักของ Global CSS มี 3 ข้อ:**
1. **Class name collision** — ชื่อ class ชนกันเมื่อโปรเจกต์ใหญ่ขึ้น
2. **Specificity wars** — ต้องใช้ `!important` เพื่อ override styles
3. **Dead code** — ไม่รู้ว่า class ไหนยังถูกใช้อยู่หรือเปล่า

📖 อ่านเพิ่มเติม: [MDN — CSS Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)

## CSS Modules คืออะไร

CSS Modules คือระบบที่แปลงชื่อ class ให้เป็น **unique identifier** โดยอัตโนมัติ เหมือนกับการที่ไปรษณีย์ไทยเพิ่มรหัสไปรษณีย์ต่อท้ายชื่อเมือง เพื่อให้ไม่สับสนแม้จะมีชื่อเมืองซ้ำกัน 📮

### วิธีการทำงานของ CSS Modules

เมื่อคุณสร้างไฟล์ `.module.css` และ import เข้าไปใน component:

1. Build tool (Vite/Webpack) จะอ่านไฟล์ `.module.css`
2. แปลงชื่อ class เป็น unique name เช่น `.button` → `.Button_button__xK3f2`
3. ส่ง mapping object กลับมาให้ JavaScript ใช้

```
.button ใน Button.module.css  →  Button_button__xK3f2
.button ใน Card.module.css    →  Card_button__9mK1p
```

ชื่อจะไม่ชนกันเพราะมีชื่อ component และ hash ต่อท้ายเสมอ

📖 อ่านเพิ่มเติม: [CSS Modules GitHub](https://github.com/css-modules/css-modules) | [Vite CSS Modules](https://vitejs.dev/guide/features.html#css-modules)

### การสร้างไฟล์ CSS Module

ไฟล์ CSS Modules ต้องตั้งชื่อด้วย **`.module.css`** เสมอ:

```css
/* Button.module.css */

/* ชื่อ class ที่ดูเหมือน global แต่จะถูกแปลงเป็น unique name */
.button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

/* Variants สำหรับสีต่างๆ */
.primary {
  background-color: #3b82f6;
  color: white;
}

.secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.danger {
  background-color: #ef4444;
  color: white;
}

/* Sizes */
.small {
  padding: 4px 10px;
  font-size: 0.875rem;
}

.large {
  padding: 12px 24px;
  font-size: 1.125rem;
}

/* Disabled state */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### การ Import และใช้งาน CSS Modules ใน React

เหตุผลที่เราต้อง import CSS Module เป็น object: เพราะ build tool แปลงชื่อ class ให้เราแล้ว เราต้องใช้ชื่อใหม่ที่ถูกแปลง ไม่ใช่ชื่อเดิม — เหมือนกับการที่เราต้องใช้ชื่อ variable ในโปรแกรม ไม่ใช่ค่าที่ hardcode

```jsx
// Button.jsx
// import styles เป็น object — key คือชื่อ class เดิม, value คือชื่อที่ถูก generate
import styles from './Button.module.css';

function Button({ children, variant = 'primary', size = 'medium', disabled }) {
  return (
    <button
      // styles.button → "Button_button__xK3f2" (ชื่อจริงที่ถูก generate)
      className={styles.button}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;

// Expected output in HTML:
// <button class="Button_button__xK3f2">Click me</button>
```

::: tip เคล็ดลับ
ใน React DevTools หรือ browser inspector คุณจะเห็นชื่อ class ที่ถูก generate เช่น `Button_button__xK3f2` ซึ่งเป็นเรื่องปกติและถูกต้อง
:::

### การรวมหลาย Classes

บ่อยครั้งที่เราต้องการรวมหลาย class เข้าด้วยกัน เช่น รวม class พื้นฐานกับ class variant เพื่อให้ component แสดงสไตล์ที่ถูกต้อง:

**วิธีที่ 1: Template Literals (ไม่ใช้ library)**

```jsx
// วิธีง่ายแต่อาจมี space ซ้ำถ้าไม่ระวัง
function Button({ children, variant = 'primary', size = 'medium' }) {
  // รวม class ด้วย template literal — ต้องระวัง undefined จะทำให้ได้ "undefined" ใน class
  const className = `${styles.button} ${styles[variant]} ${styles[size]}`;

  return <button className={className}>{children}</button>;
}
```

**วิธีที่ 2: ใช้ `clsx` library (แนะนำ)**

```bash
npm install clsx
```

```jsx
// Button.jsx
import clsx from 'clsx';
import styles from './Button.module.css';

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className: extraClassName, // รับ className จากภายนอกด้วย
}) {
  return (
    <button
      className={clsx(
        styles.button,           // class หลักเสมอ
        styles[variant],         // เลือก variant: primary, secondary, danger
        styles[size],            // เลือก size: small, medium, large
        disabled && styles.disabled, // เพิ่ม disabled class เมื่อ prop เป็น true
        extraClassName           // รับ custom class จากภายนอกได้
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// การใช้งาน:
// <Button variant="danger" size="large">ลบบัญชี</Button>
// <Button variant="secondary" disabled>ปิดใช้งาน</Button>
```

::: tip clsx vs classnames
`clsx` และ `classnames` ทำงานเหมือนกัน แต่ `clsx` มีขนาดเล็กกว่าและเร็วกว่าเล็กน้อย แนะนำให้ใช้ `clsx` ในโปรเจกต์ใหม่
:::

📖 อ่านเพิ่มเติม: [clsx npm](https://www.npmjs.com/package/clsx)

### การ Compose Classes ด้วย `composes`

CSS Modules มีฟีเจอร์พิเศษชื่อ `composes` ที่ช่วยให้ class หนึ่งสืบทอด styles จากอีก class ได้ — เหมือน `extends` ใน OOP:

```css
/* Button.module.css */

/* Base styles ที่จะถูกนำไปใช้ใน class อื่น */
.base {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

/* สืบทอด styles จาก .base แล้วเพิ่มสีเข้าไป */
.primary {
  composes: base;  /* ← CSS Modules feature */
  background-color: #3b82f6;
  color: white;
}

.secondary {
  composes: base;
  background-color: #f3f4f6;
  color: #374151;
}
```

```jsx
// ใช้ได้เลยโดยไม่ต้องรวม .base ด้วยตนเอง
<button className={styles.primary}>Primary Button</button>

// HTML output:
// <button class="Button_base__abc Button_primary__xyz">Primary Button</button>
```

## ตัวอย่าง Real-World: Button Component กับ Variants

โจทย์จริง: สร้าง Button component ที่รองรับหลาย variant สำหรับระบบ design system ของบริษัท

```
src/
  components/
    Button/
      Button.module.css
      Button.jsx
      index.js
```

```css
/* Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s ease;
  text-decoration: none;
  white-space: nowrap;
}

.button:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}

/* === Variants === */
.filled {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border-color: var(--color-primary, #3b82f6);
}

.filled:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.outline {
  background-color: transparent;
  color: var(--color-primary, #3b82f6);
  border-color: var(--color-primary, #3b82f6);
}

.outline:hover:not(:disabled) {
  background-color: #eff6ff;
}

.ghost {
  background-color: transparent;
  color: #374151;
  border-color: transparent;
}

.ghost:hover:not(:disabled) {
  background-color: #f3f4f6;
}

/* === Sizes === */
.sm { padding: 6px 12px; font-size: 0.8125rem; }
.md { padding: 10px 20px; font-size: 0.9375rem; }
.lg { padding: 14px 28px; font-size: 1.0625rem; }

/* === States === */
.button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.loading {
  position: relative;
  color: transparent; /* ซ่อนข้อความตอน loading */
}

.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === Full width === */
.fullWidth {
  width: 100%;
}
```

```jsx
// Button.jsx
import clsx from 'clsx';
import styles from './Button.module.css';

/**
 * Button component — รองรับหลาย variant, size, และ state
 *
 * Props:
 * - variant: 'filled' | 'outline' | 'ghost' (default: 'filled')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - loading: boolean — แสดง spinner แทนข้อความ
 * - fullWidth: boolean — ขยายเต็มความกว้าง
 * - as: string — เปลี่ยน element เช่น 'a' สำหรับ link button
 */
function Button({
  children,
  variant = 'filled',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  as: Component = 'button',
  className,
  ...rest
}) {
  return (
    <Component
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        loading && styles.loading,
        fullWidth && styles.fullWidth,
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Button;
```

```jsx
// App.jsx — การใช้งาน
import Button from './components/Button';

function App() {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '24px' }}>
      {/* Filled variants */}
      <Button variant="filled" size="sm">บันทึก (SM)</Button>
      <Button variant="filled" size="md">บันทึก (MD)</Button>
      <Button variant="filled" size="lg">บันทึก (LG)</Button>

      {/* Other variants */}
      <Button variant="outline">ยกเลิก</Button>
      <Button variant="ghost">ข้ามขั้นตอนนี้</Button>

      {/* States */}
      <Button loading>กำลังโหลด...</Button>
      <Button disabled>ปิดใช้งาน</Button>

      {/* Full width */}
      <Button fullWidth>กดเพื่อสมัครสมาชิก</Button>

      {/* เป็น link */}
      <Button as="a" href="/login" variant="outline">เข้าสู่ระบบ</Button>
    </div>
  );
}
```

## Comparison Table: CSS Styling Approaches

| Feature | Global CSS | CSS Modules | Styled Components | Tailwind CSS |
|---|---|---|---|---|
| Scoping | ไม่มี (global) | Auto-scoped | Auto-scoped | Utility-based |
| Learning Curve | ต่ำ | ต่ำ-ปานกลาง | ปานกลาง | ปานกลาง |
| Bundle Size | เล็ก | เล็ก | ใหญ่กว่า (runtime) | เล็ก (purge) |
| Dynamic Styles | ยาก | ยาก | ง่าย (props) | ปานกลาง |
| TypeScript Support | ไม่มี | ต้องตั้งค่า | ดีมาก | ดีมาก |
| Colocate Styles | ไม่ | ได้ | ได้ | ได้ |
| IDE Support | ดี | ดี | ดี | ต้องติด plugin |
| เหมาะกับ | โปรเจกต์เล็ก | ทุกขนาด | Dynamic UI | Rapid dev |

## Challenges

### Challenge 1: Basic CSS Module

สร้าง `Card.module.css` และ `Card.jsx` ที่แสดงการ์ดพร้อม title, description, และปุ่ม action โดยใช้ CSS Modules

::: details ✨ ดูเฉลย

```css
/* Card.module.css */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 360px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.description {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0 0 16px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
```

```jsx
// Card.jsx
import clsx from 'clsx';
import styles from './Card.module.css';

function Card({ title, description, actions, className }) {
  return (
    <div className={clsx(styles.card, className)}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export default Card;
```

:::

### Challenge 2: Theme Variants

เพิ่ม prop `theme` ให้กับ Card component รองรับ `'default'`, `'success'`, `'warning'`, `'error'` โดยเปลี่ยนสี border และ background ตาม theme

::: details ✨ ดูเฉลย

```css
/* เพิ่มใน Card.module.css */
.theme-default {
  border: 2px solid #e5e7eb;
}

.theme-success {
  border: 2px solid #10b981;
  background-color: #ecfdf5;
}

.theme-warning {
  border: 2px solid #f59e0b;
  background-color: #fffbeb;
}

.theme-error {
  border: 2px solid #ef4444;
  background-color: #fef2f2;
}
```

```jsx
// Card.jsx — เพิ่ม theme prop
function Card({ title, description, actions, className, theme = 'default' }) {
  return (
    <div className={clsx(styles.card, styles[`theme-${theme}`], className)}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

// การใช้งาน:
// <Card theme="success" title="สำเร็จ!" description="บันทึกข้อมูลเรียบร้อย" />
// <Card theme="error" title="เกิดข้อผิดพลาด" description="กรุณาลองใหม่" />
```

:::

### Challenge 3: CSS Modules กับ TypeScript

สร้าง type-safe Button component ด้วย TypeScript ที่รับ prop `variant` แบบ strictly typed

::: details ✨ ดูเฉลย

```tsx
// Button.tsx
import clsx from 'clsx';
import styles from './Button.module.css';

type ButtonVariant = 'filled' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

function Button({
  children,
  variant = 'filled',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        loading && styles.loading,
        fullWidth && styles.fullWidth,
        className
      )}
      disabled={rest.disabled || loading}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;

// TypeScript จะแจ้ง error ถ้าใส่ variant ที่ไม่ถูกต้อง:
// <Button variant="invalid">  ← Error: Type '"invalid"' is not assignable to type 'ButtonVariant'
```

:::

## Glossary

| คำศัพท์ | คำอธิบายภาษาไทย |
|---|---|
| **CSS Modules** | ระบบจัดการ CSS ที่แปลงชื่อ class ให้เป็น unique name โดยอัตโนมัติ ป้องกัน class ชนกัน |
| **Scoped Styles** | styles ที่มีผลเฉพาะกับ component ที่กำหนด ไม่รั่วไหลไปส่งผลกับ component อื่น |
| **Class Name Collision** | ปัญหาที่เกิดเมื่อ class ชื่อเดียวกันถูกนิยามในหลายที่ และ styles ทับกัน |
| **Hash** | ตัวเลข/ตัวอักษรที่ generate ขึ้นมาแบบ unique เพื่อต่อท้ายชื่อ class ใน CSS Modules |
| **clsx** | library ขนาดเล็กสำหรับรวมหลาย className เข้าด้วยกัน รองรับ conditional classes |
| **composes** | keyword พิเศษใน CSS Modules ที่ให้ class หนึ่งสืบทอด styles จากอีก class ได้ |
| **Build Tool** | โปรแกรมที่แปลง source code (เช่น CSS Modules) ให้เป็น browser-ready code เช่น Vite, Webpack |
| **Design System** | ชุดของ component, style, และ guideline ที่ใช้ร่วมกันในองค์กร เพื่อให้ UI มีความสม่ำเสมอ |
| **Utility Class** | class CSS ที่ทำหน้าที่เดียวชัดเจน เช่น `.flex`, `.text-center` (ต่างจาก semantic class) |
| **CSS-in-JS** | วิธีเขียน CSS ภายใน JavaScript file เช่น Styled Components, Emotion |
| **Specificity** | ระดับความสำคัญของ CSS rule — rule ที่ specific กว่าจะ override rule ที่ specific น้อยกว่า |
| **Dead Code** | code ที่ไม่ถูกใช้งานแล้วแต่ยังอยู่ใน codebase — ใน CSS คือ class ที่ไม่มี element ใช้ |

👉 ไปต่อ: [8.2 - Tailwind CSS](/react/08-02-tailwind-css)
