# Module 4.3: Environment Variables & dotenv 🤫

> 💡 **เป้าหมาย:** เข้าใจว่า Environment Variables คืออะไรและจำเป็นอย่างไรสำหรับ WSA2026 Test Submission Management System ที่ต้องรันได้ทั้ง Dev/Production โดยไม่ Hardcode ข้อมูลความลับเช่น JWT_SECRET หรือ Database credentials ลงใน Source Code

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Environment Variables คืออะไร?

**Environment Variables** คือตัวแปรระดับ System หรือ OS ที่ Process ต่างๆ ในเครื่องสามารถเรียกใช้งานได้ โดยไม่ได้ผูกติดอยู่กับ Source Code ของโปรแกรมโดยตรง

ลองจินตนาการว่าโปรแกรมของเราคือ "เชฟ" 👨‍🍳
- **Source Code**: คือ "สูตรอาหาร" (Recipe) ที่เขียนไว้เป๊ะๆ
- **Environment Variables**: คือ "วัตถุดิบ" หรือ "เครื่องปรุง" ที่เปลี่ยนไปตามฤดูกาลหรือความต้องการ (โดยไม่ต้องแก้สูตร)

---

### ทำไมต้องใช้ Environment Variables?

**1. Security (ความปลอดภัย)**

ห้าม Hardcode ข้อมูลความลับ ลงใน Git Repository เด็ดขาด เช่น:
- Database Password
- JWT Secret Key
- API Keys

**2. Configurability (ความยืดหยุ่น)**

Code ชุดเดิมต้องรันได้ทั้งบน Localhost, Staging และ Production โดยแค่เปลี่ยนค่า Config

**3. Separation of Concerns**

Config ควรแยกออกจาก Logic อย่างชัดเจน ตามหลัก 12-Factor App

---

### แผนภาพ: Environment แต่ละ Stage

```
+------------------+     +------------------+     +------------------+
|   DEVELOPMENT    |     |     STAGING       |     |   PRODUCTION     |
|                  |     |                  |     |                  |
| DB_HOST=localhost|     | DB_HOST=stage-db |     | DB_HOST=prod-db  |
| NODE_ENV=dev     |     | NODE_ENV=staging |     | NODE_ENV=prod    |
| JWT_SECRET=dev   |     | JWT_SECRET=stg.. |     | JWT_SECRET=x8$.. |
| PORT=3000        |     | PORT=3000        |     | PORT=8080        |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                          +-------v-------+
                          |  app.js (same |
                          |  source code) |
                          |               |
                          | process.env   |
                          | .DB_HOST      |
                          | .JWT_SECRET   |
                          +---------------+
```

Source Code เดิมชุดเดียว — แต่ทำงานต่างกันในแต่ละ Environment

---

### Hotel Keycard Analogy

เปรียบเทียบ Application เหมือนกับ **"ห้องพักโรงแรม"**

- **Code**: คือเฟอร์นิเจอร์ เตียง ตู้ ที่ติดตั้งมากับห้อง (เปลี่ยนแปลงยาก)
- **Environment Variable**: คือ **"Keycard"** ที่แขกแต่ละคนได้รับ
  - เสียบ Dev Keycard → ไฟสีส้มติด (Dev Mode: verbose logs)
  - เสียบ Prod Keycard → ไฟสีขาวติด + ระบบ Security เต็ม (Production Mode)

ตัวห้อง (App) ไม่รู้หรอกว่าใครมาพัก แต่มันทำงานตาม "ข้อมูล" ที่ได้รับจาก Keycard (Env Vars) นั้นๆ

---

### ขั้นตอนการทำงานของ dotenv

```
Node.js Process เริ่มทำงาน
        |
        v
+---------------------------+
| require('dotenv').config()|  อ่านไฟล์ .env
+---------------------------+
        |
        v
+---------------------------+
| Parse KEY=VALUE pairs     |  แต่ละบรรทัดในไฟล์ .env
+---------------------------+
        |
        v
+---------------------------+
| Inject into process.env   |  process.env.KEY = 'VALUE'
+---------------------------+
        |
        v
+---------------------------+
|  Route Handlers & Logic   |  ใช้ process.env.JWT_SECRET
+---------------------------+
        |
        v
   App ทำงานตาม Config
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### ขั้นตอนที่ 1: ติดตั้ง dotenv

```bash
npm install dotenv
```

### ขั้นตอนที่ 2: โครงสร้างไฟล์

```
wsa2026-api/
├── .env              <-- เก็บความลับ (ห้าม commit!)
├── .env.example      <-- Template สำหรับทีม (commit ได้)
├── .gitignore        <-- ต้องมี .env อยู่ในนี้
├── config/
│   └── index.js      <-- Centralized Config
├── app.js
└── package.json
```

### ขั้นตอนที่ 3: สร้างไฟล์ .env สำหรับ WSA2026

::: code-group
```env [.env]
# ==============================================
# WSA2026 Test Submission Management System
# Local Development Config
# ==============================================

# Server
PORT=3000
NODE_ENV=development

# Competition Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=wsa2026_dev
DB_PASS=DevPass@2026!
DB_NAME=wsa2026_submissions

# Auth
JWT_SECRET=wsa2026-dev-secret-change-in-production
JWT_EXPIRES_IN=8h

# CORS — Frontend URL
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE_MB=50
UPLOAD_DIR=./uploads
```

```env [.env.example]
# ==============================================
# WSA2026 — Environment Variables Template
# Copy this file to .env and fill in the values
# DO NOT commit .env to Git!
# ==============================================

PORT=3000
NODE_ENV=development

DB_HOST=CHANGE_ME
DB_PORT=3306
DB_USER=CHANGE_ME
DB_PASS=CHANGE_ME
DB_NAME=wsa2026_submissions

JWT_SECRET=CHANGE_ME_USE_STRONG_RANDOM_STRING
JWT_EXPIRES_IN=8h

CLIENT_URL=http://localhost:5173

MAX_FILE_SIZE_MB=50
UPLOAD_DIR=./uploads
```

```text [.gitignore]
node_modules/
.DS_Store
.env
.env.local
.env.staging
.env.production
uploads/
```
:::

### ขั้นตอนที่ 4: Centralized Config

::: code-group
```js [config/index.js]
// config/index.js — Centralized Config for WSA2026 API
// โหลด dotenv ที่นี่ที่เดียว ไม่กระจายไปทั่ว codebase
require('dotenv').config();

module.exports = {
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
  },
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 50,
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
};
```

```js [app.js]
// app.js — WSA2026 Test Submission Management System
const config = require('./config'); // โหลด dotenv ผ่าน config เท่านั้น

const express = require('express');
const app = express();

app.use(express.json());

// ใช้ค่าจาก config แทน process.env โดยตรง
console.log(`Starting WSA2026 API in [${config.app.env}] mode...`);
console.log(`Connecting to DB at ${config.db.host}:${config.db.port}`);
console.log(`CORS allowed from: ${config.cors.clientUrl}`);

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    system: 'WSA2026 Test Submission Management System',
    environment: config.app.env,
    db_host: config.db.host,
    // ห้ามเปิดเผย secret ใน response!
    jwt_configured: !!config.auth.jwtSecret,
  });
});

app.listen(config.app.port, () => {
  console.log(`Server running at http://localhost:${config.app.port}`);
});
```
:::

---

## 🚫 Common Pitfalls (ข้อควรระวัง)

### 1. อย่า Commit .env ขึ้น Git!

นี่คือบาปมหันต์ของการพัฒนา Web App ถ้าเผลอ push ขึ้น GitHub:
- ข้อมูล JWT_SECRET หลุด → ระบบ Auth ทั้งหมดไม่น่าเชื่อถือ
- Database credentials หลุด → ข้อมูล candidate และ submission ทั้งหมดเสี่ยง

**วิธีแก้ทันที ถ้าเผลอ push .env:**
1. เปลี่ยน Password/Secret ทุกตัวในไฟล์นั้นก่อนเลย
2. ลบออกจาก Git History ด้วย `git filter-branch` หรือ BFG Repo-Cleaner
3. การลบไฟล์แล้ว Commit ทับไม่พอ เพราะ Git History เก่ายังอ่านได้

### 2. ไม่ควร Hardcode Default ใน Logic กระจาย

```js
// ❌ BAD — กระจาย config ทั่ว codebase
const secret = process.env.JWT_SECRET || 'secret123';
const port   = process.env.PORT || 3000;
const dbHost = process.env.DB_HOST || 'localhost';

// ✅ GOOD — รวมไว้ใน config/index.js ที่เดียว
const config = require('./config');
```

### 3. ลำดับของ require('dotenv').config()

```js
// ❌ BAD — โหลด config ก่อน dotenv ทำงาน
const config = require('./config/index');
require('dotenv').config(); // สายไปแล้ว process.env ยังว่างอยู่

// ✅ GOOD — dotenv.config() ต้องเป็นบรรทัดแรกสุด
require('dotenv').config();
const config = require('./config/index');
```

---

## ⚔️ Handling Different Environments

### Pattern 1: .env.example เป็น Template สำหรับทีม

เนื่องจากเราไม่ Commit `.env` เพื่อนร่วมทีมที่ Clone โปรเจกต์ไปจะไม่รู้ว่าต้องเซ็ตค่าอะไรบ้าง ให้สร้างไฟล์ `.env.example` (Commit อันนี้ได้) เพื่อเป็นแม่แบบ

### Pattern 2: Scripts ใน package.json

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "prod": "cross-env NODE_ENV=production node app.js"
  }
}
```

> **Note:** การใช้ `NODE_ENV=production` บน Windows Command Prompt อาจ Error ให้ใช้ `cross-env` ช่วย

```bash
npm install cross-env --save-dev
```

---

## 🛡️ Advanced: Environment Validation ด้วย joi

ปัญหาน่าปวดหัวคือ "ลืมใส่ Env Var" แล้วมารู้ตอนรัน Server พัง!
เราป้องกันได้โดยการ Validate ตัวแปรตั้งแต่เริ่มโปรแกรม

```bash
npm install joi
```

::: code-group
```js [config/validateEnv.js]
// config/validateEnv.js — Validate env vars at startup
const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  // Competition Database — required in all environments
  DB_HOST: Joi.string().required().messages({
    'any.required': 'DB_HOST is required (competition database host)'
  }),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Auth — JWT must be strong in production
  JWT_SECRET: Joi.string().min(16).required().messages({
    'string.min': 'JWT_SECRET must be at least 16 characters',
    'any.required': 'JWT_SECRET is required for candidate authentication'
  }),
  JWT_EXPIRES_IN: Joi.string().default('8h'),

  // CORS
  CLIENT_URL: Joi.string().uri().required(),

}).unknown(); // อนุญาตให้มีตัวแปรอื่นๆ นอกเหนือจากนี้ได้

const { error, value } = envSchema.validate(process.env);

if (error) {
  console.error('Configuration Error:', error.message);
  process.exit(1); // หยุด Server ทันที — ดีกว่าให้ผ่านไปพังทีหลัง
}

module.exports = value;
```
:::

ถ้าลืมใส่ `DB_HOST` โปรแกรมจะ Crash ทันทีพร้อม Error Message ที่ชัดเจน ดีกว่าไปพังตอนต่อ Database

---

## 🧪 Real-World Use Cases (TP2026)

| Variable | Dev Value | Production Value | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | `production` | บอก Express ให้ Optimize Performance |
| `DB_HOST` | `localhost` | `db.wsa2026.internal` | แยก Database ไม่ให้ปนกัน |
| `JWT_SECRET` | `wsa2026-dev-secret` | `x8$kL#mN9pQ2...` | Key เข้ารหัส Token (ห้ามเหมือนกัน!) |
| `CLIENT_URL` | `http://localhost:5173` | `https://wsa2026.app` | CORS whitelist |
| `LOG_LEVEL` | `debug` | `error` | Dev อยากเห็นทุก Log, Prod เอาแค่ Error |

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สมมติว่าคุณต้องสร้าง Microservice ชื่อ **Notification Service** แยกต่างหากจาก Main API ทำหน้าที่ส่ง Email แจ้งผล submission Microservice นี้ต้องการ Config ของตัวเอง ให้สร้างไฟล์ `.env` และ `config/index.js` สำหรับ Microservice นี้โดยเฉพาะ (ไม่ใช้ชุดเดียวกับ Main API) ต้องมีตัวแปรเหล่านี้ครบ:

  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — สำหรับ Email
  - `MAIN_API_URL` — URL ของ Main API ที่จะ call กลับ
  - `NOTIFICATION_SECRET` — Secret สำหรับ verify request จาก Main API
  - `PORT` (Microservice รันบน port อื่น เช่น 3001)

::: details 💡 คำใบ้ (Hint)
- สร้างโฟลเดอร์ใหม่แยกต่างหาก เช่น `notification-service/`
- `.env` ของ Microservice นี้ไม่ควรมี `DB_HOST` หรือ `JWT_SECRET` ของ Main API
- ใน `config/index.js` ให้ group ตาม concern: `smtp`, `mainApi`, `app`
- ลองเขียน Joi Validation สำหรับ `SMTP_HOST` และ `NOTIFICATION_SECRET` ด้วย
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้างระบบ Dynamic Environment Loading ที่รองรับ `.env`, `.env.staging`, `.env.production` พร้อมกัน โดยไม่ต้องแก้ไข `app.js` เลย เมื่อรัน `npm run staging` ให้โหลด `.env.staging` อัตโนมัติ และเมื่อรัน `npm run prod` ให้โหลด `.env.production` พร้อมทั้ง Validate ว่าถ้า `NODE_ENV=production` แต่ `JWT_SECRET` มีความยาวน้อยกว่า 32 ตัวอักษร ให้โยน Error และหยุด Server

::: details ✨ Click to see Solution
```js
// config/loader.js
const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');

// 1. Determine environment from CLI or default
const env = process.env.NODE_ENV || 'development';

// 2. Map environment to file
const envFileMap = {
  development: '.env',
  staging: '.env.staging',
  production: '.env.production',
  test: '.env.test',
};

const envFile = envFileMap[env] || '.env';
const envPath = path.resolve(process.cwd(), envFile);

// 3. Load the correct file
const result = dotenv.config({ path: envPath });

if (result.error && env !== 'production') {
  // Production อาจ inject env vars จาก platform โดยตรง ไม่ต้องมีไฟล์
  console.warn(`Warning: Could not load ${envFile}`);
}

console.log(`[Config] Loading from: ${envFile} (NODE_ENV=${env})`);

// 4. Validate — strict rules for production
const jwtMinLength = env === 'production' ? 32 : 8;

const schema = Joi.object({
  JWT_SECRET: Joi.string().min(jwtMinLength).required().messages({
    'string.min': `JWT_SECRET must be at least ${jwtMinLength} chars in ${env}`,
  }),
  DB_HOST: Joi.string().required(),
  CLIENT_URL: Joi.string().uri().required(),
  PORT: Joi.number().default(3000),
}).unknown();

const { error } = schema.validate(process.env);

if (error) {
  console.error(`[Config Error] ${error.message}`);
  process.exit(1);
}

console.log('[Config] All environment variables validated successfully.');
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev":     "node app.js",
    "staging": "cross-env NODE_ENV=staging node app.js",
    "prod":    "cross-env NODE_ENV=production node app.js"
  }
}
```
:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ทำไมไม่ควรใส่ค่า Default ของ `JWT_SECRET` ในโค้ดโดยตรง เช่น `process.env.JWT_SECRET || 'secret123'`?

**แนวคำตอบ:** เพราะถ้า `.env` หายหรือไม่ได้เซ็ต `JWT_SECRET` ระบบจะใช้ค่า Default `'secret123'` แทนโดยไม่มี Error ทำให้ Production รันด้วย Secret ที่อ่อนแอและเดาได้ง่าย ควรใช้ Joi Validation บังคับให้มีค่านี้เสมอ และถ้าไม่มีให้ Process ตายทันทีดีกว่าให้ระบบรันในสภาพไม่ปลอดภัย

**คำถาม 2:** ต่างกันอย่างไรระหว่าง `.env` กับ `.env.example` และอันไหนควร Commit ขึ้น Git?

**แนวคำตอบ:** `.env` คือไฟล์จริงที่มีค่า Secrets จริงๆ ห้าม Commit เด็ดขาด ส่วน `.env.example` คือ Template ที่แสดงรายชื่อตัวแปรที่จำเป็นทั้งหมดแต่ไม่มีค่าจริง (หรือใส่ `CHANGE_ME`) ให้นักพัฒนาคนอื่น Clone มาแล้ว Copy ไปแก้ได้เลย อันนี้ Commit ได้และควร Commit

**คำถาม 3:** ถ้า `CLIENT_URL` ใน `.env` ตั้งเป็น `http://localhost:5173` แต่ Deploy บน Production ลืมเปลี่ยน จะเกิดอะไรขึ้นกับระบบ WSA2026?

**แนวคำตอบ:** CORS policy จะบล็อก Request จาก Frontend Production domain เพราะ Server อนุญาตเฉพาะ `http://localhost:5173` เท่านั้น ทำให้ Browser แสดง CORS Error และ Frontend ไม่สามารถเรียก API ได้เลย ผู้แข่งขันจะ login ไม่ได้ ส่งงานไม่ได้ นี่คือเหตุผลที่ Environment Validation และการ Review `.env` ก่อน Deploy สำคัญมาก

:::

---

## 📚 FAQ (คำถามที่พบบ่อย)

**Q: ถ้าเผลอ Commit .env ไปแล้ว ทำไงดี?**

A:
1. เปลี่ยน Password/API Key ทั้งหมดในไฟล์นั้นทันที (Roll keys)
2. ลบไฟล์ออกจาก Git History (ใช้ `git filter-branch` หรือ BFG Repo-Cleaner)
3. อย่าแค่ลบไฟล์แล้ว Commit ทับ เพราะประวัติเก่าก็ยังดูได้อยู่ดี!

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
ถ้าอยากให้เห็น ต้องมี Prefix เช่น `REACT_APP_` หรือ `VITE_` และระวัง ห้ามใส่ Secret Key ลงไปใน Frontend Env เด็ดขาด เพราะ User กด F12 ดูได้หมด

---

👉 **[ไปต่อ: Project 4 - Basic CRUD API](/node/04-project-basic-crud)**
