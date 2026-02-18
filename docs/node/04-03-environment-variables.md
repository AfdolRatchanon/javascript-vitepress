# Module 4.3: Environment Variables 🤫

> **"Secrets should be kept secret. Hardcoding passwords is a career-limiting move."**

ในบทนี้เราจะมาเจาะลึกเรื่อง **Environment Variables** (ตัวแปรสภาพแวดล้อม) ซึ่งเป็นหัวใจสำคัญของการพัฒนา Modern Web Application ไม่ว่าจะเป็นการจัดการ Config ที่แตกต่างกันในแต่ละ Environment (Dev/Test/Prod) หรือการเก็บรักษาความลับ (Secrets Management)


## 🧐 What are Environment Variables?

**Environment Variables** คือตัวแปรระดับ System หรือ OS ที่ Process ต่างๆ ในเครื่องสามารถเรียกใช้งานได้ โดยไม่ได้ผูกติดอยู่กับ Source Code ของโปรแกรมเราโดยตรง

ลองจินตนาการว่าโปรแกรมของเราคือ "เชฟ" 👨‍🍳
*   **Source Code**: คือ "สูตรอาหาร" (Recipe) ที่เขียนไว้เป๊ะๆ
*   **Environment Variables**: คือ "วัตถุดิบ" หรือ "เครื่องปรุง" ที่เปลี่ยนไปตามฤดูกาลหรือความชอบของลูกค้า (โดยไม่ต้องแก้สูตร)

### ทำไมต้องใช้? (The "Why")

1.  **Security 🛡️**: เราไม่ควร Hardcode ข้อมูลความลับ (Password, API Keys, Tokens) ลงใน Git Repository เพราะถ้าหลุดไป = หายนะ
2.  **Configurability 🎛️**: Code ชุดเดิม (Docker Image เดียวกัน) ต้องรันได้ทั้งบน Localhost, Staging, และ Production โดยแค่เปลี่ยนค่า Config (เช่น Database URL)
3.  **Cross-Platform 🌍**: ช่วยให้จัดการ Path หรือค่า Setting ประจำเครื่องที่ต่างกันได้ง่ายขึ้น


## 🐣 Analogy: The Hotel Keycard 💳

เปรียบเทียบ Application ของเราเหมือนกับ **"ห้องพักโรงแรม"**
*   **Code**: คือเฟอร์นิเจอร์ เตียง ตู้ ที่ถูกติดตั้งมากับห้อง (เปลี่ยนแปลงยาก)
*   **Environment Variable**: คือ **"Keycard"** ที่แขกแต่ละคนได้รับ
    *   แขกคน A เสียบ Keycard -> ไฟสีส้มติด (Dev Mode)
    *   แขกคน B เสียบ Keycard -> ไฟสีขาวติด + แอร์เย็นฉ่ำ (Production Mode)

ตัวห้อง (App) ไม่รู้หรอกว่าใครมาพัก แต่มันทำงานตาม "ข้อมูล" ที่ได้รับจาก Keycard (Env Vars) นั้นๆ


## 🛠️ 1. The `dotenv` Package

ใน Node.js การจะไปนั่งเซ็ต Env Var ที่ระดับ OS (Windows/Linux) ทุกครั้งมันยุ่งยาก เราจึงนิยมใช้ Library ชื่อ `dotenv` เพื่ออ่านค่าจากไฟล์ `.env` เข้ามาใน `process.env` ของ Node บรรทัดเดียวจบ!

### Installation

```bash
npm install dotenv
```

### Basic Usage

1.  สร้างไฟล์ `.env` ที่ Root Folder ของโปรเจกต์
2.  เรียกใช้ `require('dotenv').config()` เป็นบรรทัดแรกของ `app.js`

**File Structure:**
```
my-app/
├── .env          <-- เก็บความลับตรงนี้
├── .gitignore    <-- ต้องมี .env ในนี้!
├── app.js
└── package.json
```

**Content: `.env`**
```env
# Server Config
PORT=3000
NODE_ENV=development

# Database Config
DB_HOST=localhost
DB_USER=root
DB_PASS=S3cretP@ssw0rd!
DB_NAME=my_shop_db

# External Services
STRIPE_API_KEY=sk_test_51Mz...
AWS_ACCESS_KEY=AKIA...
```

**Content: `app.js`**
```javascript
// ✅ Correct: Load Env Vars immediately
require('dotenv').config();

const express = require('express');
const app = express();

// Accessing variables
const PORT = process.env.PORT || 8080;
const DB_PASS = process.env.DB_PASS;

console.log(`Starting server in ${process.env.NODE_ENV} mode...`);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database connecting to ${process.env.DB_HOST}`);
});
```


## 🚫 Common Pitfalls (ข้อควรระวังสุดๆ)

### 1. **DON'T Commit `.env` to Git!** 😱
นี่คือบาปมหันต์ของการ Dev! ถ้าเผลอ push ขึ้น GitHub:
*   Hacker จะสแกนเจอภายในไม่กี่วินาที
*   Bot จะขโมย AWS Key ไปขุด Bitcoin (บิลมาเป็นแสน!)
*   Database จะโดยเจาะและลบข้อมูล

**วิธีแก้:**
ใส่ `.env` ในไฟล์ `.gitignore` ทันทีที่เริ่มโปรเจกต์

**File: `.gitignore`**
```text
node_modules/
.DS_Store
.env            <-- สำคัญมาก!
.env.local
.env.staging
```

### 2. **Don't Hardcode Defaults in Logic (Too Much)**
พยายามอย่าเขียน `process.env.PORT || 3000` กระจายไปทั่วโค้ด ควรมีไฟล์ Config กลาง (Centralized Config)

**Good Practice: `config/index.js`**
```javascript
require('dotenv').config();

// รวมไว้ที่เดียว แก้ไขง่าย Validate ง่าย
module.exports = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
    },
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
    }
};
```


## ⚔️ Handling Different Environments

ในชีวิตจริง เราไม่ได้มีแค่เครื่องเรา (Local) แต่มี Staging และ Production ด้วย

### Pattern 1: `.env.example`
เนื่องจากเราไม่ Commit `.env` เพื่อนร่วมทีมที่ Clone โปรเจกต์ไปจะไม่รู้ว่าต้องเซ็ตค่าอะไรบ้าง
ให้สร้างไฟล์ `.env.example` (Commit อันนี้ได้) เพื่อเป็นแม่แบบ

**File: `.env.example`**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=CHANGE_ME
API_KEY=CHANGE_ME
```

### Pattern 2: Scripts in `package.json`
เราสามารถส่ง Env Var ผ่าน Command Line ได้เลย (โดยเฉพาะบน CI/CD)

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js",
  "prod": "NODE_ENV=production node app.js"
}
```

> **Note:** การใช้ `NODE_ENV=production` ใน Windows Command Prompt อาจจะ Error ให้ใช้ Tools ชื่อ `cross-env` ช่วย

```bash
npm install cross-env --save-dev
```

```json
"scripts": {
  "prod": "cross-env NODE_ENV=production node app.js"
}
```


## 🛡️ Advanced: Environment Validation with `joi`

ปัญหาน่าปวดหัวคือ "ลืมใส่ Env Var" แล้วมารู้ตอนรัน Server พัง! 💥
เราป้องกันได้โดยการ Validate ตัวแปรตั้งแต่เริ่มโปรแกรม

```bash
npm install joi
```

**File: `config/validateEnv.js`**
```javascript
const Joi = require('joi');

const envSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().required(),
}).unknown(); // อนุญาตให้มีตัวแปรอื่นๆ นอกเหนือจากนี้ได้

const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = value;
```

ถ้าลืมใส่ `DB_HOST` โปรแกรมจะ Crash ทันทีพร้อม Error Message ที่ชัดเจน! (ดีกว่าไปตายตอนต่อ Database)


## 🧪 Real-World Use Cases

| Variable | Dev Value | Production Value | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | `production` | บอก Framework (Express) ให้ Optimize Performance |
| `DB_HOST` | `localhost` | `db.production.com` | แยก Database ไม่ให้ปนกัน |
| `LOG_LEVEL` | `debug` | `error` | Dev อยากเห็นทุก Log, Prod เอาแค่ Error |
| `JWT_SECRET` | `secret123` | `x8$kL#mN9...` | Key สำหรับเข้ารหัส Token (ห้ามเหมือนกัน!) |


## 🏆 Challenge: Secure Config Manager

โจทย์: สร้างระบบจัดการ Config ที่ปลอดภัยและ Load ค่าตาม Environment

1.  สร้างไฟล์ `.env` สำหรับ Local และ `.env.prod` (สมมติว่าเป็น Prod)
2.  เขียน Script `npm run prod` ให้โหลดค่าจาก `.env.prod` (Hint: `dotenv` มี option `path`)
3.  เขียน Validate ว่าถ้า `API_KEY` ไม่ครบ ให้โยน Error

### Starter Code
```javascript
// config.js
// TODO: Implement loading logic here
```

::: details ✨ Click to see Solution
**solution.js**
```javascript
const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');

// 1. Determine environment
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.prod' : '.env';

// 2. Load Env File
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log(`Loading config from ${envFile}...`);

// 3. Validation Schema
const schema = Joi.object({
    API_KEY: Joi.string().required().messages({
        'any.required': 'CRITICAL: API_KEY is missing!'
    }),
    PORT: Joi.number().default(3000)
}).unknown();

const { error } = schema.validate(process.env);

if (error) {
    console.error(`❌ Setup Failed: ${error.message}`);
    process.exit(1);
}

console.log('✅ Configuration Validated!');
console.log(`Server starting on port ${process.env.PORT}`);
```
:::


## 📚 FAQ (คำถามที่พบบ่อย)

**Q: ถ้าเผลอ Commit .env ไปแล้ว ทำไงดี?**
A:
1.  เปลี่ยน Password/API Key ทั้งหมดในไฟล์นั้นทันที (Roll keys)
2.  ลบไฟล์ออกจาก Git History (ใช้ `git filter-branch` หรือ BFG Repo-Cleaner)
3.  อย่าแค่ลบไฟล์แล้ว Commit ทับ เพราะประวัติเก่าก็ยังดูได้อยู่ดี!

**Q: Docker จัดการ Env ยังไง?**
A: ใน `docker-compose.yml` เราสามารถระบุไฟล์ env ได้เลย:
```yaml
services:
  app:
    env_file: .env
```
หรือกำหนดรายตัว:
```yaml
environment:
  - NODE_ENV=production
```

**Q: Frontend (React/Vue) เห็น Env ไหม?**
A: **ไม่เห็น** โดย Default (เพราะมันรันบน Browser ฝั่ง User)
ถ้าอยากให้เห็น ต้องมี Prefix เช่น `REACT_APP_` หรือ `VITE_` และระวัง **ห้ามใส่ Secret Key** ลงไปใน Frontend Env เด็ดขาด เพราะ User กด F12 ดูได้หมด!


## 🔗 External Resources (MDN & More)

*   [The Twelve-Factor App: Config](https://12factor.net/config) - คัมภีร์ Modern App Development
*   [dotenv Documentation](https://www.npmjs.com/package/dotenv)
*   [Node.js process.env Docs](https://nodejs.org/api/process.html#process_process_env)


👉 **[ไปต่อ: Project 4 - Basic CRUD API](/node/04-project-basic-crud)**
