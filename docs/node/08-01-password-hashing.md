# Module 8.1: Password Hashing with bcryptjs 🔐

> 💡 **เป้าหมาย:** เข้าใจหลักการเก็บรหัสผ่านอย่างปลอดภัยด้วย bcrypt ในระบบ WSA2026 Test Submission Management System และสามารถนำ bcryptjs ไปใช้ใน register/login flow ได้อย่างถูกต้อง

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ทำไมการเก็บ Password ถึงสำคัญมาก?

ใน WSA2026 ระบบของเราเก็บข้อมูล `users` ซึ่งมีทั้ง candidate, judge, และ manager
ถ้า Database โดน breach แล้ว password หลุดออกไปเป็น plain text — ผลกระทบร้ายแรงมาก

```
ตาราง users ใน WSA2026:
+----+----------+---------------+----------+------------------+
| id | username | password_hash | role     | country          |
+----+----------+---------------+----------+------------------+
| 1  | somchai  | $2a$10$abc... | candidate| Thailand         |
| 2  | tanaka   | $2a$10$xyz... | judge    | Japan            |
| 3  | admin01  | $2a$10$def... | manager  | WorldSkills Org  |
+----+----------+---------------+----------+------------------+
         ^           ^
         |           |
      ชื่อ User    เก็บ Hash เท่านั้น! ไม่เคยเก็บ password จริง
```

---

### 3 วิธีเก็บ Password (เปรียบกับห้องเก็บสมบัติ)

```
วิธีที่ 1: PLAIN TEXT ❌ (อันตรายสุดขีด!)
+-----------+          +------------------+
| candidate |  "P@ss1" |  DB: "P@ss1"     |
|  somchai  | -------> |  ใครเข้า DB ก็เห็น|
+-----------+          +------------------+

วิธีที่ 2: ENCRYPTION ❌ (ยังไม่ปลอดภัยพอ)
+-----------+  encrypt  +------------------+   ถ้าขโมย Key ได้
| candidate | --------> | DB: "X7#mQ9..."  | ----------> decrypt ได้หมด!
+-----------+  Key="abc" +------------------+

วิธีที่ 3: BCRYPT HASHING ✅ (วิธีที่ถูกต้อง!)
+-----------+  password  +--------+  hash   +----------------------+
| candidate | "P@ss1" -> | bcrypt | ------> | DB: "$2a$10$N9qo8u..." |
|  somchai  |            | +salt  |         |  ย้อนกลับ ไม่ ได้!     |
+-----------+            +--------+         +----------------------+
```

---

### Hash Process: Password + Salt → bcrypt → Hash ใน DB

```
 REGISTRATION FLOW (ตอนสมัครสมาชิก)
 =====================================

  INPUT                  PROCESS                   OUTPUT
  -----                  -------                   ------

  "MyP@ss2026"           Step 1: Generate Salt      Salt = "$2a$10$N9qo8uLOickgx2ZM..."
      |                  (ค่าสุ่ม 22 ตัวอักษร)          |
      |                                               |
      +----> [ bcrypt.genSalt(10) ] ----------------+
      |                                               |
      |       Step 2: Hash                            |
      +----> [ bcrypt.hash(password, salt) ] -------> "$2a$10$N9qo8uLO...3GxzaQ5"
                                                           |
                                                           v
                                                   บันทึกลง DB
                                                   (password_hash column)

 LOGIN FLOW (ตอนเข้าสู่ระบบ)
 ==============================

  User กรอก              DB มี                      ผลลัพธ์
  --------               ----                       --------

  "MyP@ss2026"           "$2a$10$N9qo8uLO...3GxzaQ5"
       |                         |
       +---> [ bcrypt.compare() ]<--+
                    |
             true / false
                    |
            +-------+-------+
            |               |
          true             false
         Login OK!       Wrong Password!
```

---

### Salting คืออะไร และทำไมต้องมี?

**ปัญหา Rainbow Table Attack:**

```
 RAINBOW TABLE (ตารางที่ Hacker เตรียมไว้)
 ==========================================
 plain text  -->  MD5 Hash (ไม่มี Salt)
 ----------       -------------------
 "123456"    -->  e10adc3949ba59ab...
 "password"  -->  5f4dcc3b5aa765d6...
 "abc123"    -->  e99a18c428cb38d5...

 Hacker ดู Hash ใน DB แล้วเทียบกับตาราง -> รู้ password ทันที! ❌
```

**วิธีแก้ด้วย Salt:**

```
 ถึงแม้ User 2 คนใช้ password เดียวกัน "123456"
 แต่ Salt ต่างกัน -> Hash ต่างกันทั้งหมด!

 User somchai:  "123456" + salt_A  --> "$2a$10$AAAA...abc123"
 User tanaka:   "123456" + salt_B  --> "$2a$10$BBBB...xyz789"
 User admin01:  "123456" + salt_C  --> "$2a$10$CCCC...def456"

 Hacker ดู 3 Hash นี้ -> ไม่รู้เลยว่าเป็น password เดียวกัน ✅
```

---

### bcrypt Cost Factor (Rounds)

```
 COST FACTOR vs ความปลอดภัย vs ความเร็ว
 ========================================

  Rounds  | Time (approx) | Security  | Recommendation
  --------|---------------|-----------|---------------
    8     | ~4ms          | Weak      | ❌ Too fast
    10    | ~65ms         | Good      | ✅ Development
    12    | ~250ms        | Strong    | ✅ Production
    14    | ~1000ms       | Very Strong| ⚠️  Might be slow
    16    | ~4000ms       | Extreme   | ❌ Too slow for UX

  "ช้าโดยตั้งใจ" -> Hacker สุ่มรหัสได้ช้ามาก
  ถ้า Hacker สุ่ม 1 ล้านครั้ง ที่ rounds=12 ใช้เวลา 250,000 วินาที = ~2.9 วัน!
```

---

### เปรียบเทียบ Algorithm การเก็บ Password

| Algorithm | One-way | Salt Built-in | ออกแบบมาสำหรับ Password | ใช้ใน WSA2026 |
|:----------|:--------|:--------------|:------------------------|:--------------|
| MD5       | ✅      | ❌            | ❌ (ออกแบบสำหรับ checksum) | ❌ ไม่ใช้ |
| SHA-256   | ✅      | ❌            | ❌ (เร็วเกินไป)           | ❌ ไม่ใช้ |
| bcrypt    | ✅      | ✅            | ✅ (ช้าโดยตั้งใจ)         | ✅ ใช้ |
| argon2    | ✅      | ✅            | ✅ (ใหม่กว่า bcrypt)      | Optional |

**ทำไมไม่ใช้ MD5?**
- เร็วมาก: Hacker สุ่มได้ billions ครั้งต่อวินาที
- ไม่มี salt built-in: เสี่ยง Rainbow Table
- มี collision ที่ถูกพิสูจน์แล้ว

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### Install Package

```bash
npm install bcryptjs
```

### TP2026: Candidate Registration — hashPassword

::: code-group
```js [auth.service.js]
const bcrypt = require('bcryptjs');

// ============================================================
// WSA2026 - Password Hashing Service
// ใช้สำหรับ: candidate registration + judge/manager login
// ============================================================

/**
 * hashPassword - แฮช password ก่อนบันทึกลง DB
 * เรียกใช้ตอน: POST /api/auth/register
 * @param {string} plainPassword - รหัสผ่านที่ candidate กรอกมา
 * @returns {string} hashedPassword - hash string สำหรับเก็บใน DB
 */
async function hashPassword(plainPassword) {
  // Validate ก่อนแฮช
  if (!plainPassword || plainPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // saltRounds = 10 เหมาะสำหรับ WSA2026 competition environment
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  // bcrypt.hash() รวม genSalt + hash ในขั้นตอนเดียว
  // Output format: $2a$10$<22-char-salt><31-char-hash>
  return hashedPassword;
}

/**
 * comparePassword - ตรวจสอบ password ตอน login
 * เรียกใช้ตอน: POST /api/auth/login (สำหรับทุก role)
 * @param {string} plainPassword - รหัสผ่านที่ user กรอกใหม่
 * @param {string} hashedPassword - hash string จาก DB
 * @returns {boolean} true = ถูกต้อง, false = ผิด
 */
async function comparePassword(plainPassword, hashedPassword) {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}

module.exports = { hashPassword, comparePassword };
```

```js [authController.js]
const bcrypt = require('bcryptjs');
const db = require('../db'); // mysql2 connection pool
const { hashPassword, comparePassword } = require('../services/auth.service');

// ============================================================
// POST /api/auth/register
// สมัครสมาชิกสำหรับ candidate ใหม่ (WSA2026)
// ============================================================
async function register(req, res) {
  try {
    const { username, password, name, country, region } = req.body;

    // 1. Validate input
    if (!username || !password || !name || !country) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอก username, password, name และ country'
      });
    }

    // 2. ตรวจสอบว่า username ซ้ำหรือไม่
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username นี้ถูกใช้แล้ว'
      });
    }

    // 3. Hash password ก่อนบันทึก (ขั้นตอนสำคัญที่สุด!)
    const passwordHash = await hashPassword(password);

    // 4. บันทึกลง DB — เก็บ passwordHash ไม่ใช่ password จริง
    const [result] = await db.query(
      `INSERT INTO users (username, password_hash, name, role, country, region)
       VALUES (?, ?, ?, 'candidate', ?, ?)`,
      [username, passwordHash, name, country, region || null]
    );

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียน candidate สำเร็จ',
      data: {
        id: result.insertId,
        username,
        name,
        role: 'candidate',
        country
      }
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
}

// ============================================================
// POST /api/auth/login
// ใช้สำหรับทุก role: candidate, judge, manager
// ============================================================
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // 1. หา user จาก DB
    const [users] = await db.query(
      'SELECT id, username, password_hash, name, role, country FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      // ไม่บอกว่า "user ไม่มี" เพื่อป้องกัน user enumeration attack
      return res.status(401).json({
        success: false,
        message: 'Username หรือ password ไม่ถูกต้อง'
      });
    }

    const user = users[0];

    // 2. เปรียบเทียบ password กับ hash ใน DB
    // ⚠️ ห้าม user.password_hash === password เด็ดขาด!
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username หรือ password ไม่ถูกต้อง'
      });
    }

    // 3. Login สำเร็จ — สร้าง JWT (ดูใน Module 8.2)
    res.json({
      success: true,
      message: `ยินดีต้อนรับ ${user.name} (${user.role})`,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        country: user.country
        // JWT token จะอยู่ตรงนี้ (ดู Module 8.2)
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
}

module.exports = { register, login };
```
:::

---

### ตัวอย่างการทดสอบ (Node.js script)

::: code-group
```js [test-bcrypt.js]
const bcrypt = require('bcryptjs');

// ทดสอบ: แฮช password ของ judge และเปรียบเทียบ
async function demonstrateBcrypt() {
  console.log('=== WSA2026 bcrypt Demo ===\n');

  const judgePassword = 'Judge@WSA2026';

  // ขั้นตอนที่ 1: Hash
  console.log('Original password:', judgePassword);
  const hashed = await bcrypt.hash(judgePassword, 10);
  console.log('Hashed (stored in DB):', hashed);
  console.log('Hash length:', hashed.length, 'chars\n');

  // ขั้นตอนที่ 2: Compare (correct)
  const correctResult = await bcrypt.compare(judgePassword, hashed);
  console.log('Compare correct password:', correctResult); // true

  // ขั้นตอนที่ 3: Compare (wrong)
  const wrongResult = await bcrypt.compare('WrongPassword', hashed);
  console.log('Compare wrong password:', wrongResult); // false

  // ขั้นตอนที่ 4: Hash ซ้ำ -> Salt ต่างกัน -> Hash ต่างกัน
  const hashed2 = await bcrypt.hash(judgePassword, 10);
  console.log('\nSame password, hashed twice:');
  console.log('Hash 1:', hashed);
  console.log('Hash 2:', hashed2);
  console.log('Are hashes identical?', hashed === hashed2); // false!
}

demonstrateBcrypt();
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** ใน WSA2026 มี manager 5 คนจาก 5 ประเทศ ต้องการ hash password ทั้งหมดพร้อมกัน แล้วตรวจสอบว่า hash ที่ได้ถูกต้องครบทุกคน

จงเขียน Node.js script ที่:
1. รับ array ของ manager objects `{ username, password, country }`
2. Hash password ของทุกคนด้วย `Promise.all()` (ทำงานพร้อมกัน)
3. Verify ว่า hash ที่ได้ทุกคนถูกต้อง (compare กับ password เดิม)
4. Print ผลออกมาเป็นตาราง

::: details 💡 คำใบ้ (Hint)
- ใช้ `Promise.all(managers.map(m => bcrypt.hash(m.password, 10)))` เพื่อ hash พร้อมกัน
- Loop ผลด้วย `Promise.all(results.map((hash, i) => bcrypt.compare(managers[i].password, hash)))`
- ใช้ `console.table()` เพื่อ print ตารางสวยงาม
:::

::: details ✅ เฉลย
```js
const bcrypt = require('bcryptjs');

const managers = [
  { username: 'mgr_thailand',   password: 'TH@Manager2026', country: 'Thailand' },
  { username: 'mgr_japan',      password: 'JP@Manager2026', country: 'Japan' },
  { username: 'mgr_korea',      password: 'KR@Manager2026', country: 'South Korea' },
  { username: 'mgr_germany',    password: 'DE@Manager2026', country: 'Germany' },
  { username: 'mgr_australia',  password: 'AU@Manager2026', country: 'Australia' },
];

async function batchHashAndVerify(managerList) {
  console.log('=== WSA2026: Batch Hash Manager Passwords ===\n');

  // Step 1: Hash ทั้งหมดพร้อมกัน
  console.log('Hashing all passwords concurrently...');
  const hashes = await Promise.all(
    managerList.map(m => bcrypt.hash(m.password, 10))
  );
  console.log('All hashed!\n');

  // Step 2: Verify ทั้งหมดพร้อมกัน
  const verifyResults = await Promise.all(
    hashes.map((hash, i) => bcrypt.compare(managerList[i].password, hash))
  );

  // Step 3: แสดงผลเป็นตาราง
  const tableData = managerList.map((m, i) => ({
    username: m.username,
    country: m.country,
    hash_preview: hashes[i].substring(0, 20) + '...',
    verified: verifyResults[i] ? '✅ PASS' : '❌ FAIL'
  }));

  console.table(tableData);

  const allPassed = verifyResults.every(r => r === true);
  console.log(`\nAll verifications passed: ${allPassed}`);
}

batchHashAndVerify(managers);
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** Implement "Forgot Password" Reset Flow สำหรับ WSA2026

**Scenario:** judge ลืมรหัสผ่าน ต้องการ reset password ใหม่

**ต้องทำ:**
1. Route `POST /api/auth/forgot-password` — รับ username, ตรวจสอบว่ามีอยู่จริง สร้าง reset token (random string) และ expiry time บันทึกลง DB
2. Route `POST /api/auth/reset-password` — รับ reset token + new password, ตรวจสอบ token ไม่หมดอายุ, hash password ใหม่ บันทึกลง DB, ลบ reset token ออก
3. เพิ่ม columns `reset_token` และ `reset_token_expires` ใน table `users`

**Hint สำคัญ:**
- สร้าง reset token ด้วย `crypto.randomBytes(32).toString('hex')`
- ตั้ง expiry 1 ชั่วโมง: `Date.now() + 3600000`
- ตรวจสอบ: `reset_token_expires > NOW()` ใน SQL query
- หลัง reset สำเร็จ ต้อง hash password ใหม่ด้วย bcrypt ก่อน UPDATE เสมอ

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ทำไม bcrypt ถึงออกแบบมาให้ "ช้า" โดยตั้งใจ และ cost factor (rounds) ส่งผลอย่างไร?

**แนวคำตอบ:** bcrypt ช้าโดยตั้งใจเพื่อป้องกัน Brute Force Attack — ถ้า hash 1 ครั้งใช้เวลา 65ms (rounds=10) Hacker ที่ต้องสุ่ม password 1 ล้านครั้งต้องใช้เวลา ~18 ชั่วโมง เทียบกับ MD5 ที่เร็วมากจน Hacker สุ่มได้ billions ครั้งต่อวินาที cost factor แบบ exponential คือยิ่ง rounds มาก เวลา hash ยาวขึ้นทวีคูณ

**คำถาม 2:** Rainbow Table Attack คืออะไร และ bcrypt ป้องกันได้อย่างไร?

**แนวคำตอบ:** Rainbow Table คือตารางที่ Hacker สร้างไว้ล่วงหน้า โดย pre-compute hash ของ password ทั่วไปหลายล้านค่า แล้ว reverse lookup ได้ทันที bcrypt ป้องกันด้วย Salt ที่สุ่มใหม่ทุกครั้ง ทำให้ถึงแม้ password เหมือนกัน Hash ก็ต่างกัน จึง precomputed table ใช้ไม่ได้

**คำถาม 3:** ทำไมเราไม่ควรใช้ MD5 หรือ SHA-256 เก็บ password และ bcrypt ต่างจาก encryption อย่างไร?

**แนวคำตอบ:** MD5/SHA-256 เร็วเกินไปสำหรับ password hashing (ออกแบบมาสำหรับ checksum/data integrity ไม่ใช่ security) ไม่มี salt built-in และ MD5 มี collision ที่พิสูจน์แล้ว Encryption เป็น two-way (encrypt แล้ว decrypt กลับได้) ต้องการ key ถ้า key หลุด ข้อมูลทุกอย่างหลุดตาม bcrypt เป็น one-way hash ถอดกลับไม่ได้แม้รู้ algorithm ทำให้ปลอดภัยกว่าสำหรับการเก็บ password

:::

---

> 👉 **ไปต่อ: [Module 8.2: JWT Fundamentals](/node/08-02-jwt-fundamentals)**
