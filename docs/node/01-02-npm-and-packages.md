# npm & Packages 📦

> 💡 **เป้าหมาย:** เรียนรู้ npm (Node Package Manager) ตั้งแต่การสร้าง `package.json` ไปจนถึงการจัดการ dependencies และ npm scripts เพราะระบบ WSA2026 Test Submission Management System ต้องพึ่งพา packages หลายตัว เช่น `express`, `mysql2`, `bcryptjs`, `jsonwebtoken` — การเข้าใจ npm อย่างถ่องแท้คือพื้นฐานที่ขาดไม่ได้ก่อนเริ่มสร้าง API

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### npm คืออะไร?

**npm** (Node Package Manager) คือ **ตัวจัดการ Package** ของ Node.js ที่มาพร้อมกับ Node.js ทุก version — ไม่ต้องติดตั้งแยก!

npm ทำ 3 หน้าที่หลัก:

| หน้าที่ | คำสั่ง | อธิบาย |
|:--------|:-------|:-------|
| ติดตั้ง Package | `npm install express` | ดาวน์โหลด Package จาก Registry มาใช้ |
| จัดการ Dependencies | `package.json` | บันทึกรายชื่อ Package ที่โปรเจกต์ต้องการ |
| รัน Scripts | `npm run dev` | รันคำสั่งที่ตั้งชื่อไว้ใน package.json |

```
  +-----------------+         +------------------+
  |   Developer     |         |  npm Registry    |
  |                 |         |  (npmjs.com)     |
  |  npm install    +-------->|  2.1M+ Packages  |
  |  express        |         |                  |
  |                 |<--------+  express v4.x    |
  +-----------------+         +------------------+
           |
           v
  +-----------------+
  |  node_modules/  |  <-- โค้ดจริงของ Package
  |  package.json   |  <-- บันทึก dependency
  |  package-lock   |  <-- lock version แน่นอน
  +-----------------+
```

### package.json — ทุก Field อธิบาย

**package.json** คือ "บัตรประจำตัว" ของโปรเจกต์ Node.js ทุกโปรเจกต์ต้องมี!

สร้างด้วยคำสั่ง:
```bash
npm init        # ตอบคำถามทีละข้อ
npm init -y     # ใช้ค่า default ทั้งหมด (เร็วกว่า)
```

ตัวอย่าง `package.json` ที่สมบูรณ์พร้อมคำอธิบาย:

```json
{
  "name": "wsa2026-submission-api",
  "version": "1.0.0",
  "description": "WSA2026 Test Submission Management System API",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "keywords": ["wsa2026", "nodejs", "api"],
  "author": "WSA2026 Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

คำอธิบายทุก Field:

| Field | คืออะไร | ตัวอย่างใน WSA2026 |
|:------|:--------|:------------------|
| `name` | ชื่อโปรเจกต์ (ตัวเล็ก ห้ามเว้นวรรค) | `"wsa2026-submission-api"` |
| `version` | เวอร์ชันตาม SemVer (Major.Minor.Patch) | `"1.0.0"` |
| `description` | คำอธิบายโปรเจกต์ | `"WSA2026 API"` |
| `main` | ไฟล์ entry point หลักของโปรเจกต์ | `"src/index.js"` |
| `scripts` | คำสั่งลัดที่รันด้วย `npm run` | `"dev": "node --watch ..."` |
| `keywords` | keywords สำหรับค้นหาใน npm Registry | `["nodejs", "api"]` |
| `author` | ชื่อผู้สร้าง | `"WSA2026 Team"` |
| `license` | สัญญาอนุญาตการใช้งาน | `"MIT"` |
| `dependencies` | Package ที่ต้องใช้ตอน Production | `express`, `mysql2` |
| `devDependencies` | Package ที่ใช้แค่ตอน Development | `nodemon` |
| `engines` | กำหนด Node.js version ขั้นต่ำ | `">=18.0.0"` |

### npm install — ทุกรูปแบบ

```bash
# ติดตั้ง Package เดียว (เพิ่มใน dependencies)
npm install express
npm i express           # ย่อ: i = install

# ติดตั้งหลาย Package พร้อมกัน
npm install express mysql2 dotenv cors bcryptjs jsonwebtoken

# ติดตั้ง DevDependency (ใช้แค่ตอน development)
npm install --save-dev nodemon
npm i -D nodemon        # ย่อ: -D = --save-dev

# ติดตั้ง Global (ใช้ได้ทุก Terminal ทุกโปรเจกต์)
npm install -g nodemon
npm i -g nodemon        # ย่อ

# ติดตั้งทุก Package จาก package.json (ใช้เมื่อ clone โปรเจกต์มาใหม่)
npm install
npm i                   # ย่อ

# ติดตั้ง version เฉพาะ
npm install express@4.18.2
```

### node_modules และ package-lock.json

```
wsa2026-api/
├── node_modules/           <-- โค้ดจริงของ Package (ห้าม Commit!)
│   ├── express/            <-- express package
│   │   ├── index.js
│   │   └── package.json
│   ├── mysql2/             <-- mysql2 package
│   ├── bcryptjs/
│   ├── jsonwebtoken/
│   └── ... (อีกหลายร้อย Package ที่ express ต้องการ)
├── src/
│   └── index.js
├── .env                    <-- ตัวแปร Environment (ห้าม Commit!)
├── .gitignore              <-- ซ่อน node_modules และ .env
├── package.json            <-- บันทึก dependencies
└── package-lock.json       <-- Lock version แน่นอน (ต้อง Commit!)
```

**ทำไม node_modules ห้าม Commit?**
- มีขนาดใหญ่มาก (อาจเป็น 100MB+ สำหรับโปรเจกต์ขนาดกลาง)
- คนอื่นที่ clone โปรเจกต์มา รัน `npm install` แล้วได้ package เหมือนกัน 100%

สร้าง `.gitignore`:
```
node_modules/
.env
*.log
```

**package-lock.json คืออะไร?**

package-lock.json บันทึก **version แน่นอน** ของทุก Package (รวมถึง sub-dependencies ด้วย) เพื่อให้ทุกคนในทีมติดตั้ง package version เดียวกัน

```
package.json        -->  "express": "^4.18.2"  (อนุญาตให้ 4.18.2 - 4.99.99)
package-lock.json   -->  "express": "4.18.2"   (lock ไว้ที่ version นี้จริงๆ)
```

### Semantic Versioning (SemVer)

ตาม [semver.org](https://semver.org): เลข Version มี 3 ส่วน:

```
         4  .  18  .  2
         |    |     |
         |    |     +-- PATCH : แก้ Bug เล็กน้อย (ปลอดภัยอัปเดต)
         |    +-------- MINOR : เพิ่ม Feature ใหม่ (backward compatible)
         +------------- MAJOR : เปลี่ยนแปลงใหญ่ (อาจ break โค้ดเก่า!)
```

สัญลักษณ์ใน package.json:

```
สัญลักษณ์    ความหมาย                  ตัวอย่าง        อัปเดตได้ถึง
---------    ---------                  --------        -----------
^4.18.2      Caret: Minor + Patch       ^4.18.2   -->   4.x.x (ห้ามข้าม Major)
~4.18.2      Tilde: Patch เท่านั้น      ~4.18.2   -->   4.18.x (ห้ามข้าม Minor)
4.18.2       ไม่มีสัญลักษณ์ = ล็อคเป๊ะ  4.18.2    -->   4.18.2 เท่านั้น
*            ใดๆก็ได้ (อันตราย!)        *         -->   ล่าสุดเสมอ
>=4.0.0      เท่ากับหรือมากกว่า         >=4.0.0   -->   ทุก version >= 4.0.0
```

**ค่า Default** ของ `npm install` คือ `^` (Caret) — ปลอดภัย อัปเดต Minor/Patch ได้

### npm scripts — คำสั่งสำเร็จรูป

แทนที่จะพิมพ์คำสั่งยาวๆ ทุกครั้ง ตั้งเป็น Script ใน package.json ได้เลย!

```json
{
  "scripts": {
    "start":  "node src/index.js",
    "dev":    "node --watch src/index.js",
    "test":   "echo 'No tests yet'",
    "lint":   "eslint src/",
    "build":  "echo 'Building...' && node scripts/build.js"
  }
}
```

การรัน Script:
```bash
# Script พิเศษ: start, test --> ไม่ต้องใส่ "run"
npm start         # = npm run start
npm test          # = npm run test

# Script อื่นๆ ต้องใส่ "run"
npm run dev
npm run lint
npm run build
```

```
+----------------------------+
|  npm run dev               |
+----------------------------+
          |
          v
  อ่าน package.json
  --> "dev": "node --watch src/index.js"
          |
          v
  รัน: node --watch src/index.js
          |
          v
  Node.js รีสตาร์ตอัตโนมัติ
  ทุกครั้งที่แก้ไขไฟล์ .js
+----------------------------+
```

> 💡 **`node --watch`** (Node.js v18+) = รันใหม่อัตโนมัติเมื่อแก้ไฟล์ เหมือน `nodemon` แต่ built-in ไม่ต้องติดตั้งเพิ่ม!

### dependencies vs devDependencies

```
+--------------------+---------------------------+---------------------------+
| Package            | dependencies              | devDependencies           |
+--------------------+---------------------------+---------------------------+
| ใช้เมื่อ           | Production + Development   | Development เท่านั้น      |
| ติดตั้งด้วย        | npm i <package>           | npm i -D <package>        |
| ติดตั้งบน Server   | ✓ ใช่                     | ✗ ไม่                     |
+--------------------+---------------------------+---------------------------+
| ตัวอย่าง WSA2026   | express, mysql2, dotenv   | nodemon, jest, eslint     |
|                    | cors, bcryptjs, jwt       |                           |
+--------------------+---------------------------+---------------------------+
```

### คำสั่ง npm ที่ใช้บ่อย

| คำสั่ง | ใช้ทำอะไร |
|:-------|:---------|
| `npm init -y` | สร้าง package.json ด้วยค่า default |
| `npm install` / `npm i` | ติดตั้งทุก package จาก package.json |
| `npm i <pkg>` | ติดตั้ง package ใหม่ (dependencies) |
| `npm i -D <pkg>` | ติดตั้ง package ใหม่ (devDependencies) |
| `npm i -g <pkg>` | ติดตั้ง package แบบ global |
| `npm uninstall <pkg>` | ลบ package |
| `npm update` | อัปเดตทุก package |
| `npm list --depth=0` | ดู package ที่ติดตั้งชั้นแรก |
| `npm outdated` | ดูว่า package ไหนมีเวอร์ชันใหม่ |
| `npm run <script>` | รัน script ที่ตั้งไว้ |
| `npm audit` | ตรวจหา security vulnerability |
| `npm audit fix` | แก้ไข vulnerability อัตโนมัติ |

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

สร้าง package.json สมบูรณ์สำหรับโปรเจกต์ WSA2026 พร้อม dependencies ทั้งหมดและ script ที่ใช้งานจริง

::: code-group
```js [setup-project.js]
// setup-project.js
// Script ช่วยตรวจสอบว่า Project Setup ถูกต้องหรือไม่
// ใช้: node setup-project.js

const fs   = require("fs");
const path = require("path");

// ==========================================
// 1. รายชื่อ dependencies ที่ WSA2026 ต้องการ
// ==========================================
const REQUIRED_DEPS = {
  // Production dependencies
  dependencies: [
    "express",      // Web framework
    "mysql2",       // MySQL driver (รองรับ Promise)
    "dotenv",       // โหลด .env file
    "cors",         // Cross-Origin Resource Sharing
    "bcryptjs",     // Hash password สำหรับ users table
    "jsonwebtoken"  // JWT token สำหรับ authentication
  ],
  // Development dependencies
  devDependencies: [
    "nodemon"       // Auto-restart (หรือใช้ node --watch ก็ได้)
  ]
};

// ==========================================
// 2. ตรวจสอบไฟล์ package.json
// ==========================================
function checkPackageJson() {
  const pkgPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(pkgPath)) {
    console.log("[MISSING] package.json not found");
    console.log("         Run: npm init -y");
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  console.log(`[OK]     package.json found: ${pkg.name} v${pkg.version}`);
  return pkg;
}

// ==========================================
// 3. ตรวจสอบว่า node_modules มีครบ
// ==========================================
function checkDependencies(pkg) {
  const nodeModules = path.join(process.cwd(), "node_modules");

  if (!fs.existsSync(nodeModules)) {
    console.log("[MISSING] node_modules/ not found");
    console.log("         Run: npm install");
    return;
  }

  console.log("\n--- Checking Dependencies ---");

  // ตรวจ production dependencies
  REQUIRED_DEPS.dependencies.forEach((dep) => {
    const depPath = path.join(nodeModules, dep);
    const installed = fs.existsSync(depPath);
    const inPkg     = pkg.dependencies && pkg.dependencies[dep];

    if (installed && inPkg) {
      console.log(`[OK]     ${dep} (${pkg.dependencies[dep]})`);
    } else if (!inPkg) {
      console.log(`[MISSING] ${dep} -- Run: npm install ${dep}`);
    } else {
      console.log(`[WARN]   ${dep} in package.json but not in node_modules`);
    }
  });

  // ตรวจ devDependencies
  console.log("\n--- Dev Dependencies ---");
  REQUIRED_DEPS.devDependencies.forEach((dep) => {
    const depPath = path.join(nodeModules, dep);
    const installed = fs.existsSync(depPath);
    const inPkg     = pkg.devDependencies && pkg.devDependencies[dep];

    if (installed && inPkg) {
      console.log(`[OK]     ${dep} (${pkg.devDependencies[dep]})`);
    } else {
      console.log(`[MISSING] ${dep} -- Run: npm install -D ${dep}`);
    }
  });
}

// ==========================================
// 4. แสดง npm scripts ที่ควรมี
// ==========================================
function checkScripts(pkg) {
  console.log("\n--- npm Scripts ---");

  const requiredScripts = ["start", "dev"];
  requiredScripts.forEach((script) => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`[OK]     npm run ${script}: "${pkg.scripts[script]}"`);
    } else {
      console.log(`[MISSING] script "${script}" not found in package.json`);
    }
  });
}

// ==========================================
// 5. Main
// ==========================================
console.log("===========================================");
console.log("  WSA2026 Project Setup Checker");
console.log("===========================================");
console.log(`  Node.js : ${process.version}`);
console.log(`  Project : ${process.cwd()}`);
console.log("===========================================\n");

const pkg = checkPackageJson();
if (pkg) {
  checkDependencies(pkg);
  checkScripts(pkg);
}

console.log("\n===========================================");
console.log("  Setup check complete!");
console.log("===========================================");
```

```json [package.json]
{
  "name": "wsa2026-submission-api",
  "version": "1.0.0",
  "description": "WSA2026 Test Submission Management System — REST API",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "echo \"No tests configured\" && exit 0",
    "setup-check": "node setup-project.js"
  },
  "keywords": [
    "wsa2026",
    "nodejs",
    "express",
    "api",
    "competition"
  ],
  "author": "WSA2026 Team",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

```bash [install-commands.sh]
# ขั้นตอนการ setup โปรเจกต์ WSA2026 ตั้งแต่ต้น

# 1. สร้างโฟลเดอร์โปรเจกต์
mkdir wsa2026-api
cd wsa2026-api

# 2. สร้าง package.json
npm init -y

# 3. ติดตั้ง Production Dependencies
npm install express mysql2 dotenv cors bcryptjs jsonwebtoken

# 4. ติดตั้ง Dev Dependency
npm install --save-dev nodemon

# 5. สร้าง .gitignore
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore

# 6. สร้าง .env สำหรับ WSA2026
echo "PORT=3000" > .env
echo "DB_HOST=localhost" >> .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=secret" >> .env
echo "DB_NAME=wsa2026_db" >> .env
echo "JWT_SECRET=wsa2026-super-secret-key" >> .env

# 7. ตรวจสอบว่า setup ถูกต้อง
node setup-project.js
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สร้างโปรเจกต์ใหม่ชื่อ `wsa-score-service` สำหรับระบบให้คะแนน Submission ของ WSA2026 โดยต้องมี `package.json` ที่ถูกต้อง ติดตั้ง `express` และ `mysql2` เป็น dependencies และ `nodemon` เป็น devDependency จากนั้นตั้ง npm script `dev` ที่ใช้ `node --watch` และเขียนไฟล์ `index.js` ที่แค่พิมพ์ข้อความ "WSA2026 Score Service running..." แล้วทดสอบด้วย `npm run dev`

::: details 💡 คำใบ้ (Hint)
- ใช้ `npm init -y` สร้าง package.json เริ่มต้น แล้วแก้ `name` และ `description` ด้วยมือ
- ติดตั้ง package หลายตัวพร้อมกันได้ด้วย `npm install express mysql2` (เว้นวรรคคั่น)
- script `dev` ต้องเขียนใน `scripts` object ของ package.json ในรูปแบบ `"dev": "node --watch index.js"`
:::

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้างไฟล์ `check-versions.js` ที่อ่าน `package.json` ของโปรเจกต์ปัจจุบันด้วย `fs.readFileSync` (ใช้ require("fs")) แล้วแสดงรายชื่อ package ทุกตัวใน `dependencies` และ `devDependencies` พร้อม version และ prefix (`^`, `~`, หรือไม่มี) โดยแสดงคำอธิบายว่า prefix นั้นหมายความว่าอะไร (เช่น "^ = อัปเดต Minor+Patch ได้") และนับจำนวน package ทั้งหมดสรุปท้าย

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** `dependencies` กับ `devDependencies` ต่างกันอย่างไร และใน WSA2026 project package ไหนควรอยู่ใน dependencies และ package ไหนควรอยู่ใน devDependencies?

**แนวคำตอบ:** `dependencies` คือ package ที่จำเป็นต้องใช้ใน Production (Server จริง) ส่วน `devDependencies` ใช้แค่ตอน Development เท่านั้น ใน WSA2026: `express`, `mysql2`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken` ควรอยู่ใน `dependencies` เพราะ Server ต้องใช้จริง ส่วน `nodemon` ควรอยู่ใน `devDependencies` เพราะใช้แค่ตอนพัฒนา ไม่ได้รันบน Server จริง

**คำถาม 2:** `package-lock.json` คืออะไร และทำไมถึงควร commit ขึ้น Git ในขณะที่ `node_modules/` ไม่ควร commit?

**แนวคำตอบ:** `package-lock.json` บันทึก version แน่นอนของทุก package รวมถึง sub-dependencies ด้วย ทำให้ทุกคนในทีมที่รัน `npm install` ได้ package version เดียวกัน 100% จึงควร commit ส่วน `node_modules/` มีขนาดใหญ่มาก (100MB+) และสร้างใหม่ได้ทุกเมื่อด้วย `npm install` จึงไม่ควร commit

**คำถาม 3:** ใน `package.json` ถ้าเขียน `"express": "^4.18.2"` กับ `"express": "~4.18.2"` กับ `"express": "4.18.2"` ต่างกันอย่างไรในทางปฏิบัติ?

**แนวคำตอบ:** `^4.18.2` (Caret) = npm update ได้ถึง `4.x.x` เช่น `4.19.0`, `4.20.1` แต่ห้ามข้าม Major 5.x.x / `~4.18.2` (Tilde) = update ได้แค่ `4.18.x` เช่น `4.18.3`, `4.18.9` ห้ามข้าม Minor 4.19.x / `4.18.2` (ไม่มี prefix) = ล็อคที่ version นี้เท่านั้น ไม่อัปเดต — ค่า default ของ `npm install` คือ `^` ซึ่งปลอดภัยที่สุดสำหรับใช้งานทั่วไป

:::

👉 **[ไปทำโปรเจกต์: Project 1 — CLI Tool](/node/01-project-cli-tool)**
