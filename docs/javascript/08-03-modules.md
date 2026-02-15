# 08-3: Modules — import/export (แบ่งโค้ดเป็นไฟล์) 📦

> **"Good programming is not born from one big idea but from arranging many small ones."**
> — *Jon Bentley*

เมื่อโปรแกรมใหญ่ขึ้น การเขียนทุกอย่างในไฟล์เดียว **จะกลายเป็นฝันร้าย!** ES6 Modules ช่วยให้เรา **แบ่งโค้ดเป็นไฟล์ย่อยๆ** แล้ว import/export ไปใช้ต่อกันได้

> **💡 Analogy (เปรียบเทียบ):**
> Modules เหมือน **"กล่องเครื่องมือ"** 🧰:
> - แต่ละกล่องมีเครื่องมือเฉพาะ (ค้อน, ไขควง, ประแจ)
> - `export` = เอาเครื่องมือออกมาให้คนอื่นใช้
> - `import` = หยิบเครื่องมือจากกล่องอื่นมาใช้

---

## 1. Named Export & Import 📤📥

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export):

### Export (ส่งออก):

```javascript
// 📁 math.js

// วิธี 1: Export ทีละตัว
export const PI = 3.14159;

export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}

// วิธี 2: Export รวมท้ายไฟล์
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;

export { subtract, divide };
```

### Import (นำเข้า):

```javascript
// 📁 app.js

// วิธี 1: Import เฉพาะที่ต้องการ
import { add, multiply, PI } from "./math.js";

console.log(add(2, 3));       // 5
console.log(multiply(4, 5));  // 20
console.log(PI);              // 3.14159

// วิธี 2: Import ทั้งหมดเป็น Object
import * as MathUtils from "./math.js";

console.log(MathUtils.add(2, 3));  // 5
console.log(MathUtils.PI);        // 3.14159

// วิธี 3: เปลี่ยนชื่อ (Alias)
import { add as sum, multiply as mul } from "./math.js";

console.log(sum(2, 3)); // 5
```

---

## 2. Default Export 🌟

แต่ละไฟล์มี Default Export ได้ **แค่ 1 ตัว:**

```javascript
// 📁 User.js

// ⭐ Default Export
export default class User {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    greet() {
        return `สวัสดี! ผม ${this.name}`;
    }
}
```

```javascript
// 📁 app.js

// Import Default → ตั้งชื่ออะไรก็ได้! (ไม่ต้อง { })
import User from "./User.js";
import MyUser from "./User.js"; // ชื่อต่างก็ได้!

const dolar = new User("Dolar", 25);
console.log(dolar.greet()); // "สวัสดี! ผม Dolar"
```

### ผสม Default + Named:

```javascript
// 📁 api.js
export default function fetchData(url) {
    return fetch(url).then(r => r.json());
}

export const BASE_URL = "https://api.example.com";
export const TIMEOUT = 5000;
```

```javascript
// 📁 app.js
import fetchData, { BASE_URL, TIMEOUT } from "./api.js";
```

---

## 3. 📊 Named vs Default Export

| | **Named Export** | **Default Export** |
|:--|:----------------|:------------------|
| **มีได้** | หลายตัว / ไฟล์ | **1 ตัว** / ไฟล์ |
| **Syntax Export** | `export const x` | `export default x` |
| **Syntax Import** | `import { x }` (ต้อง `{ }`) | `import x` (ไม่ต้อง `{ }`) |
| **ชื่อ** | ต้องตรงกัน / ใช้ `as` | ตั้งชื่ออะไรก็ได้ |
| **ใช้เมื่อ** | ไฟล์มีของหลายอย่าง | ไฟล์มีของหลัก 1 อย่าง |

---

## 4. Module ใน Browser 🌐

```html
<!-- ⭐ ต้องใส่ type="module" -->
<script type="module" src="app.js"></script>

<!-- ❌ ไม่ใส่ module → import/export ใช้ไม่ได้ -->
<script src="app.js"></script>
```

### ข้อแตกต่าง Module vs Script:

| | `type="module"` | Script ธรรมดา |
|:--|:---------------|:-------------|
| **import/export** | ✅ ใช้ได้ | ❌ ใช้ไม่ได้ |
| **Scope** | แต่ละ Module มี Scope ของตัวเอง | Global Scope |
| **Strict Mode** | ✅ อัตโนมัติ | ❌ ต้องประกาศเอง |
| **โหลด** | `defer` อัตโนมัติ | Block rendering |
| **`this`** | `undefined` (ไม่ใช่ `window`) | `window` |

---

## 5. Module Patterns 🛠️

### Barrel Export (รวม re-export):

```javascript
// 📁 utils/index.js — รวม Export จากหลายไฟล์

export { add, subtract } from "./math.js";
export { formatDate } from "./date.js";
export { validateEmail } from "./validate.js";
```

```javascript
// 📁 app.js — Import จากจุดเดียว!
import { add, formatDate, validateEmail } from "./utils/index.js";
```

### Config Module:

```javascript
// 📁 config.js
export default {
    APP_NAME: "My App",
    VERSION: "1.0.0",
    API_URL: "https://api.example.com",
    MAX_RETRIES: 3,
};
```

```javascript
// 📁 app.js
import config from "./config.js";
console.log(config.APP_NAME); // "My App"
```

### Dynamic Import (โหลดเมื่อต้องการ):

```javascript
// ⭐ import() return Promise!
button.addEventListener("click", async () => {
    // โหลด Module เมื่อคลิกปุ่มเท่านั้น (Lazy Loading)
    const { animate } = await import("./animation.js");
    animate();
});
```

---

## 6. Challenges 🏆

## 6. Challenges 🏆

ทดสอบความเข้าใจกับโจทย์ 5 ข้อ (1 ข้อต่อ 1 หัวข้อ):

### 🎯 Challenge 1: Named vs Default
**หัวข้อ:** 1. Export Types

**โจทย์:** ถ้าไฟล์ `math.js` มี `export const PI = 3.14` และ `export default function add() {}` เราจะ Import ทั้งคู่ในบรรทัดเดียวอย่างไร?
::: details ✨ ดูเฉลย
```javascript
import add, { PI } from "./math.js";
```
:::

### 🎯 Challenge 2: The Default Rule
**หัวข้อ:** 2. Default Export

**โจทย์:** ใน 1 ไฟล์ มี Default Export ได้กี่ตัว?
::: details ✨ ดูเฉลย
**1 ตัวเท่านั้น** ครับ
:::

### 🎯 Challenge 3: Browser Magic
**หัวข้อ:** 3. Module in Browser

**โจทย์:** ถ้าจะใช้ `import / export` ใน HTML ต้องเติม Attribute อะไรใน `<script>`?
::: details ✨ ดูเฉลย
`type="module"` ครับ (`<script type="module" src="...">`)
:::

### 🎯 Challenge 4: Alias Mastery
**หัวข้อ:** 4. Import Alias

**โจทย์:** ถ้า `import { add }` มาแล้วชื่อซ้ำกับตัวแปรที่มีอยู่ จะเปลี่ยนชื่อตอน Import เป็น `sum` ได้อย่างไร?
::: details ✨ ดูเฉลย
```javascript
import { add as sum } from "./math.js";
```
:::

### 🎯 Challenge 5: Barrel File
**หัวข้อ:** 5. Module Patterns
**โจทย์:** "Barrel Export" คืออะไร? และมีประโยชน์อย่างไร?
::: details ✨ ดูเฉลย
คือการสร้างไฟล์กลาง (เช่น `index.js`) เพื่อ **รวบรวม Export จากหลายไฟล์ไว้ที่เดียว** ทำให้คนใช้ Import จากจุดเดียวได้สะดวก
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Module:** ไฟล์ JavaScript ที่ Export/Import ค่าได้
> *   **Named Export:** ส่งออกแบบมีชื่อ `export const x`
> *   **Default Export:** ส่งออกหลัก 1 ตัว `export default x`
> *   **Import:** นำเข้าค่าจาก Module อื่น
> *   **Barrel Export:** ไฟล์กลางที่ re-export จากหลาย Module
> *   **Dynamic Import:** โหลด Module แบบ Lazy ด้วย `import()`
> *   **`type="module"`:** Attribute ที่ทำให้ Script เป็น ES Module ใน Browser
> *   **Scope Isolation:** Module มี Scope ของตัวเอง ไม่มี Global Pollution
> *   **Strict Mode:** Module ใช้ Strict Mode อัตโนมัติ

---
👉 **[ไปทำโปรเจกต์: Project — Student Manager](/08-project-student-manager)**
