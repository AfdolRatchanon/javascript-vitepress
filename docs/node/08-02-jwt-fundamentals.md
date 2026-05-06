# Module 8.2: JWT Fundamentals with jsonwebtoken 🪙

> 💡 **เป้าหมาย:** เข้าใจโครงสร้าง JWT ทั้ง 3 ส่วนอย่างลึกซึ้ง รู้ความแตกต่างระหว่าง Stateless กับ Session Auth และสามารถสร้าง/ตรวจสอบ JWT สำหรับทุก role ใน WSA2026 ได้อย่างถูกต้องและปลอดภัย

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### JWT คืออะไร?

**JWT (JSON Web Token)** คือมาตรฐานเปิด (RFC 7519) สำหรับส่งข้อมูลระหว่าง parties อย่างปลอดภัยในรูปแบบ JSON object ที่ถูก **ลงนาม (signed)** ดิจิทัล

ใน WSA2026 เมื่อ user login สำเร็จ server จะออก JWT ให้ client เก็บไว้ และส่งกลับมาทุกครั้งที่ขอ protected resource

```
 WSA2026 AUTH FLOW ด้วย JWT
 ============================

  Client                           Server                  MySQL DB
  ------                           ------                  --------
    |                                |                         |
    |  POST /api/auth/login          |                         |
    |  { username, password }        |                         |
    | -----------------------------> |                         |
    |                                |  SELECT * FROM users    |
    |                                | ----------------------> |
    |                                |  { id, role, country }  |
    |                                | <---------------------- |
    |                                |  bcrypt.compare()       |
    |                                |  jwt.sign(payload)      |
    |  { token: "eyJ..." }          |                         |
    | <----------------------------- |                         |
    |                                |                         |
    |  (client เก็บ token ไว้)        |                         |
    |                                |                         |
    |  GET /api/submissions          |                         |
    |  Authorization: Bearer eyJ... |                         |
    | -----------------------------> |                         |
    |                                |  jwt.verify(token)      |
    |                                |  ไม่ต้อง query DB เลย!  |
    |  { data: submissions[] }       |                         |
    | <----------------------------- |                         |
```

---

### โครงสร้าง JWT: Header.Payload.Signature

JWT ประกอบด้วย 3 ส่วน คั่นด้วยจุด (`.`) แต่ละส่วนถูก encode ด้วย **Base64URL** (ไม่ใช่ encryption!)

```
 JWT TOKEN — 3 ส่วน
 ===================

 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 .
 eyJ1c2VySWQiOjEsInJvbGUiOiJjYW5kaWRhdGUiLCJjb3VudHJ5IjoiVGhhaWxhbmQifQ
 .
 SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

 |<------- PART 1: HEADER ------->|
 |<---------------- PART 2: PAYLOAD ----------------->|
 |<-- PART 3: SIGNATURE -->|


 PART 1 — HEADER (base64url decode แล้วได้):
 +----------------------------------+
 | {                                |
 |   "alg": "HS256",  <-- algorithm |
 |   "typ": "JWT"     <-- type      |
 | }                                |
 +----------------------------------+
         |
         | base64url encode
         v
 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9


 PART 2 — PAYLOAD (base64url decode แล้วได้):
 +--------------------------------------------+
 | {                                          |
 |   "userId":  42,            <-- custom     |
 |   "role":    "candidate",   <-- custom     |
 |   "country": "Thailand",    <-- custom     |
 |   "iss": "wsa2026-system",  <-- registered |
 |   "sub": "42",              <-- registered |
 |   "iat": 1751836800,        <-- registered |
 |   "exp": 1751836800 + 7200  <-- registered |
 | }                                          |
 +--------------------------------------------+
 ⚠️  ใครก็ decode ดูได้! ห้ามใส่ password หรือข้อมูลลับ!


 PART 3 — SIGNATURE:
 +--------------------------------------------------+
 | HMAC_SHA256(                                     |
 |   base64url(HEADER) + "." + base64url(PAYLOAD),  |
 |   JWT_SECRET   <-- รู้แค่ server เท่านั้น!       |
 | )                                                |
 |                                                  |
 | ถ้าใครแก้ payload -> signature ไม่ตรง -> ❌ DENY  |
 +--------------------------------------------------+
```

---

### Registered Claims (มาตรฐาน RFC 7519)

| Claim | ชื่อเต็ม | ความหมาย | ตัวอย่างใน WSA2026 |
|:------|:---------|:---------|:------------------|
| `iss` | Issuer | ผู้ออก token | `"wsa2026-system"` |
| `sub` | Subject | token เกี่ยวกับใคร | `"42"` (user id) |
| `exp` | Expiration Time | หมดอายุ (Unix timestamp) | `1751843600` |
| `iat` | Issued At | เวลาออก token | `1751836400` |
| `nbf` | Not Before | ใช้ได้ตั้งแต่เมื่อไหร่ | (ไม่ค่อยใช้) |
| `jti` | JWT ID | unique ID ของ token | สำหรับ blacklist |

**Custom Claims สำหรับ WSA2026:**

| Claim | ค่า | ใช้ทำอะไร |
|:------|:----|:---------|
| `userId` | `42` | ดึงข้อมูล user จาก DB |
| `role` | `"candidate"` | authorize — ตรวจสอบสิทธิ์ |
| `country` | `"Thailand"` | filter submissions ตามประเทศ |

---

### Stateless Auth vs Session Auth

```
 SESSION-BASED AUTH (แบบดั้งเดิม)
 ==================================

  Client              Server               DB / Redis
  ------              ------               ----------
    |  Login           |                       |
    | --------------> |  สร้าง Session         |
    |                  | --------------------> |
    |  Set-Cookie:     |  session_id: "abc123" |
    |  session_id=abc  |                       |
    | <--------------- |                       |
    |                  |                       |
    |  Request + Cookie|                       |
    | --------------> |  ค้นหา session         |
    |                  | --------------------> |
    |                  |  { userId: 1, role }  |
    |                  | <-------------------- |
    |  Response        |                       |
    | <--------------- |                       |
                              ^
                    ต้อง query DB ทุก request! ❌
                    Scale ยาก (shared state)  ❌


 JWT STATELESS AUTH (แบบ WSA2026)
 ==================================

  Client              Server A / B / C
  ------              ----------------
    |  Login           |
    | --------------> |  verify password
    |                  |  สร้าง JWT ด้วย secret
    |  { token: ... } |
    | <--------------- |
    |                  |
    |  Request +       |
    |  Bearer <token> |
    | --------------> |  jwt.verify(token, secret)
    |                  |  ไม่ query DB เลย! ✅
    |  Response        |  server ไหนก็ handle ได้ ✅
    | <--------------- |
```

**เปรียบเทียบสรุป:**

| Feature | Session-based | JWT (Stateless) |
|:--------|:--------------|:----------------|
| Server เก็บ state | ✅ ใช้ memory/DB | ❌ ไม่เก็บเลย |
| DB query ต่อ request | ✅ ทุก request | ❌ ไม่ต้องเลย |
| Horizontal scaling | ยาก (shared session store) | ง่าย |
| Revoke token ทันที | ✅ ลบ session ได้เลย | ยาก (ต้อง blacklist) |
| Token size | เล็ก (session ID) | ใหญ่กว่า |
| ใช้ใน WSA2026 | ❌ | ✅ |

---

### JWT Error Types ที่ต้องรู้

```
 ERROR TYPES จาก jwt.verify()
 ==============================

  TokenExpiredError         JsonWebTokenError          NotBeforeError
  -----------------         -----------------          --------------
  token หมดอายุ             token ผิดรูปแบบ /          token ยังไม่ถึง
  exp < Date.now()          signature ไม่ตรง /          เวลาใช้งาน
                            secret ผิด

  e.name ===                e.name ===                 e.name ===
  "TokenExpiredError"       "JsonWebTokenError"        "NotBeforeError"

  HTTP 401                  HTTP 401                   HTTP 401
  "Token expired,           "Invalid token"            "Token not active yet"
   please login again"
```

---

### Token Storage: ที่ไหนปลอดภัยกว่า?

```
 localStorage vs httpOnly Cookie
 ================================

  localStorage                    httpOnly Cookie
  +--------------------------+    +---------------------------+
  | JavaScript อ่านได้        |    | JavaScript อ่านไม่ได้!    |
  | window.localStorage      |    | Set-Cookie: ...; HttpOnly |
  | .getItem('token')        |    |                           |
  +--------------------------+    +---------------------------+
           |                                |
   XSS attack ขโมยได้ ❌          XSS ขโมยไม่ได้ ✅
   ง่ายกว่าสำหรับ SPA              CSRF attack เป็นได้ ⚠️
                                   (แก้ด้วย SameSite=Strict)

 WSA2026 context (competition):
   -> ใช้ localStorage ได้ (SPA, ไม่ได้ production จริง)
   -> Production จริง: httpOnly Cookie + SameSite + CSRF token
```

---

### Refresh Token Pattern

```
 ACCESS TOKEN (สั้น) + REFRESH TOKEN (ยาว)
 ==========================================

                  Access Token: 2h
                  Refresh Token: 7d

  Client                Server                 DB
  ------                ------                 --
    |  Login             |                      |
    | -----------------> |  verify password      |
    |                    |  สร้าง accessToken    |
    |                    |  สร้าง refreshToken   |
    |                    |  บันทึก refreshToken  |
    |                    | -------------------> |
    | {                  |                      |
    |   accessToken,     |                      |
    |   refreshToken     |                      |
    | }                  |                      |
    | <----------------- |                      |
    |                    |                      |
    |  (ใช้งาน 2 ชั่วโมง)|                      |
    |                    |                      |
    |  accessToken หมดอายุ!                     |
    |  POST /api/auth/refresh                   |
    |  { refreshToken }  |                      |
    | -----------------> |  ตรวจ refreshToken   |
    |                    | -------------------> |
    |                    |  valid? ✅           |
    |                    | <------------------- |
    |                    |  ออก accessToken ใหม่ |
    |  { accessToken }   |  Rotate refreshToken |
    | <----------------- |                      |

  ✅ Security: access token หมดอายุเร็ว ถ้าหลุดความเสียหายน้อย
  ✅ UX: ไม่ต้อง login ใหม่ทุก 2 ชั่วโมง
  ✅ Control: ลบ refreshToken จาก DB = logout ได้ทันที
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### Install Package

```bash
npm install jsonwebtoken dotenv
```

### TP2026: สร้าง Token เมื่อ Login และ Verify Token

::: code-group
```js [jwt.service.js]
const jwt = require('jsonwebtoken');

// ============================================================
// WSA2026 JWT Service
// สร้างและตรวจสอบ token สำหรับทุก role
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET ต้องตั้งค่าใน .env ก่อนใช้งาน!');
}

/**
 * generateToken - สร้าง JWT หลัง login สำเร็จ
 * ฝัง userId, role, country ไว้ใน payload สำหรับ middleware
 */
function generateToken(user) {
  const payload = {
    userId:  user.id,
    role:    user.role,      // 'candidate' | 'judge' | 'manager'
    country: user.country,  // ใช้ filter submissions ตามประเทศ
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
    issuer:    'wsa2026-system',
    subject:   String(user.id),
  });

  return token;
}

/**
 * verifyToken - ตรวจสอบ JWT และคืน decoded payload
 * ถ้าหมดอายุ throw TokenExpiredError
 * ถ้า signature ผิด throw JsonWebTokenError
 */
function verifyToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
    issuer:     'wsa2026-system',
  });
  return decoded;
  // decoded จะมี: { userId, role, country, iss, sub, iat, exp }
}

/**
 * generateRefreshToken - สำหรับ Refresh Token Pattern
 */
function generateRefreshToken(userId) {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { generateToken, verifyToken, generateRefreshToken };
```

```js [authController.js]
const { comparePassword } = require('../services/auth.service');
const { generateToken }   = require('../services/jwt.service');
const db = require('../db');

// ============================================================
// POST /api/auth/login
// รองรับทุก role: candidate, judge, manager
// ============================================================
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอก username และ password'
      });
    }

    // 1. ดึง user จาก DB
    const [rows] = await db.query(
      `SELECT id, username, password_hash, name, role, country
       FROM users WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username หรือ password ไม่ถูกต้อง'
      });
    }

    const user = rows[0];

    // 2. ตรวจสอบ password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Username หรือ password ไม่ถูกต้อง'
      });
    }

    // 3. สร้าง JWT — payload มี userId, role, country
    const token = generateToken(user);

    res.json({
      success: true,
      message: `Login สำเร็จ ยินดีต้อนรับ ${user.name} [${user.role}]`,
      data: {
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '2h',
        user: {
          id:       user.id,
          username: user.username,
          name:     user.name,
          role:     user.role,
          country:  user.country
        }
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
}

module.exports = { login };
```

```js [tokenDemo.js]
// สาธิตโครงสร้าง JWT สำหรับแต่ละ role ใน WSA2026
const jwt = require('jsonwebtoken');

const SECRET = 'demo-secret-key-wsa2026';

// Mock users ทั้ง 3 role
const mockUsers = [
  { id: 1,  username: 'somchai_th',  name: 'Somchai T.', role: 'candidate', country: 'Thailand' },
  { id: 42, username: 'judge_tanaka',name: 'Tanaka K.',   role: 'judge',     country: 'Japan' },
  { id: 99, username: 'admin_wsa',   name: 'WSA Admin',   role: 'manager',   country: 'WorldSkills' },
];

console.log('=== WSA2026 JWT Structure Demo ===\n');

mockUsers.forEach(user => {
  const token = jwt.sign(
    { userId: user.id, role: user.role, country: user.country },
    SECRET,
    { expiresIn: '2h', issuer: 'wsa2026-system', subject: String(user.id) }
  );

  // decode โดยไม่ verify เพื่อดูโครงสร้าง
  const decoded = jwt.decode(token, { complete: true });

  console.log(`--- ${user.role.toUpperCase()}: ${user.name} ---`);
  console.log('Header  :', JSON.stringify(decoded.header));
  console.log('Payload :', JSON.stringify(decoded.payload, null, 2));
  console.log('Token   :', token.substring(0, 60) + '...\n');
});
```

```js [verifyErrorDemo.js]
// สาธิต error types ที่อาจเกิดขึ้นใน WSA2026
const jwt = require('jsonwebtoken');
const SECRET = 'demo-secret-key-wsa2026';

async function demonstrateErrors() {
  console.log('=== JWT Error Types — WSA2026 ===\n');

  // 1. Valid token ✅
  const validToken = jwt.sign(
    { userId: 1, role: 'judge' },
    SECRET,
    { expiresIn: '2h' }
  );
  try {
    const decoded = jwt.verify(validToken, SECRET);
    console.log('✅ Valid   -> userId:', decoded.userId, '| role:', decoded.role);
  } catch (e) { console.log('❌', e.message); }

  // 2. Expired token ⏰
  const expiredToken = jwt.sign({ userId: 2 }, SECRET, { expiresIn: '-1s' });
  try {
    jwt.verify(expiredToken, SECRET);
  } catch (e) {
    console.log(`⏰ ${e.name}: ${e.message} -> HTTP 401`);
  }

  // 3. Tampered token 🔒 (แก้ไข payload)
  const parts   = validToken.split('.');
  const tampered = parts[0] + '.' + Buffer.from('{"userId":99,"role":"manager"}').toString('base64url') + '.' + parts[2];
  try {
    jwt.verify(tampered, SECRET);
  } catch (e) {
    console.log(`🔒 ${e.name}: ${e.message} -> HTTP 401`);
  }

  // 4. Wrong secret 🔑
  try {
    jwt.verify(validToken, 'wrong-secret');
  } catch (e) {
    console.log(`🔑 ${e.name}: ${e.message} -> HTTP 401`);
  }
}

demonstrateErrors();
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** ใน WSA2026 แต่ละ role มีระยะเวลา session ต่างกันตาม security policy

| Role | เหตุผล | Access Token Expiry |
|:-----|:-------|:--------------------|
| `candidate` | Active ตลอด competition day | 8 ชั่วโมง |
| `judge` | ต้องการความปลอดภัยสูงกว่า | 4 ชั่วโมง |
| `manager` | สิทธิ์สูงสุด ต้องระวังที่สุด | 2 ชั่วโมง |

จงเขียนฟังก์ชัน `generateRoleBasedToken(user)` ที่กำหนด `expiresIn` อัตโนมัติตาม role แล้ว decode token ทั้ง 3 บอก expiry time จริงเป็นเวลาท้องถิ่น

::: details 💡 คำใบ้ (Hint)
- ใช้ object map: `const EXPIRY = { candidate: '8h', judge: '4h', manager: '2h' }`
- `jwt.decode(token)` คืน payload โดยไม่ verify — ใช้เพื่อดู `exp`
- แปลง Unix timestamp: `new Date(decoded.exp * 1000).toLocaleString('th-TH')`
:::

::: details ✅ เฉลย
```js
const jwt = require('jsonwebtoken');
const SECRET = 'demo-secret-key-wsa2026';

const ROLE_EXPIRY = {
  candidate: '8h',
  judge:     '4h',
  manager:   '2h',
};

function generateRoleBasedToken(user) {
  const expiresIn = ROLE_EXPIRY[user.role] || '1h';
  return jwt.sign(
    { userId: user.id, role: user.role, country: user.country },
    SECRET,
    { expiresIn, issuer: 'wsa2026-system' }
  );
}

const users = [
  { id: 1,  role: 'candidate', country: 'Thailand',    name: 'Somchai' },
  { id: 42, role: 'judge',     country: 'Japan',        name: 'Tanaka' },
  { id: 99, role: 'manager',   country: 'WorldSkills',  name: 'WSA Admin' },
];

console.log('=== WSA2026 Role-Based Token Expiry ===\n');

users.forEach(user => {
  const token      = generateRoleBasedToken(user);
  const decoded    = jwt.decode(token);
  const expiresAt  = new Date(decoded.exp * 1000).toLocaleString('th-TH');
  const issuedAt   = new Date(decoded.iat * 1000).toLocaleString('th-TH');

  console.log(`[${user.role.toUpperCase()}] ${user.name} (${user.country})`);
  console.log(`  Expiry policy : ${ROLE_EXPIRY[user.role]}`);
  console.log(`  Issued at     : ${issuedAt}`);
  console.log(`  Expires at    : ${expiresAt}`);
  console.log(`  Token preview : ${token.substring(0, 40)}...\n`);
});
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** Implement Refresh Token Endpoint สำหรับ WSA2026

**สถานการณ์:** judge ใช้งานระบบ scoring ทำงานต่อเนื่อง 8 ชั่วโมง แต่ access token หมดอายุทุก 2 ชั่วโมง ระบบต้องต่ออายุ token อัตโนมัติโดย judge ไม่ต้อง login ใหม่

**ต้องทำ:**
1. สร้างตาราง `refresh_tokens(id, user_id, token_hash, expires_at, created_at)` ใน MySQL
2. ปรับ `POST /api/auth/login` คืน `accessToken` (2h) + `refreshToken` (7d) พร้อมบันทึก hash ของ refresh token ลง DB
3. สร้าง `POST /api/auth/refresh`: รับ `{ refreshToken }` ตรวจสอบ valid + ไม่หมดอายุ + มีอยู่ใน DB, ออก accessToken ใหม่, **Rotate refreshToken** (ลบเก่า สร้างใหม่)
4. สร้าง `POST /api/auth/logout`: ลบ refresh token ออกจาก DB

**Security hint:** บันทึก bcrypt hash ของ refresh token ใน DB (ไม่ใช่ token จริง) เพราะถ้า DB หลุด token ที่ขโมยไปก็ใช้งานไม่ได้

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** JWT Payload ถูก "เข้ารหัส" หรือแค่ "encode" และนัยสำคัญต่อ WSA2026 คืออะไร?

**แนวคำตอบ:** Payload ถูกแค่ Base64URL **encode** ไม่ใช่ encrypt ใครก็ decode ดูได้โดยไม่ต้องรู้ secret key (ลองที่ jwt.io ได้เลย) ดังนั้นใน WSA2026 ห้ามเก็บ `password_hash`, score ที่ยังไม่ประกาศ หรือข้อมูลลับอื่นใน payload Signature เพียงพิสูจน์ว่าข้อมูลไม่ถูกแก้ไข ไม่ได้ซ่อนข้อมูล

**คำถาม 2:** ทำไม JWT ถึง scale ได้ดีกว่า Session-based auth ในระบบ WSA2026 ที่อาจมีหลาย server?

**แนวคำตอบ:** Session-based เก็บ state ใน server memory หรือ DB ถ้า scale เป็นหลาย server ต้องแชร์ session store ด้วย Redis หรือ sticky session ทำให้ infrastructure ซับซ้อน JWT เป็น stateless server ทุกตัวตรวจสอบได้ด้วย secret key เดียวกัน request สามารถตกไป server ไหนก็ได้โดยไม่ต้องสื่อสารกัน เหมาะกับ WSA2026 ที่อาจต้อง scale ตามผู้เข้าแข่งขัน

**คำถาม 3:** ทำไม access token ถึงควรอายุสั้น และ refresh token pattern แก้ปัญหา UX อย่างไร?

**แนวคำตอบ:** JWT revoke ได้ยากเพราะ stateless — ถ้า token หลุดไป attacker มีเวลาใช้งานเท่ากับอายุ token Refresh token pattern แก้โดยให้ access token อายุสั้น (2h) แต่มี refresh token อายุยาว (7d) ที่เก็บใน DB ถ้าเกิด security incident ลบ refresh token จาก DB ได้ทันที ผู้ใช้ไม่ต้อง login ใหม่บ่อยแต่ระบบยังควบคุม session ได้

:::

---

> 👉 **ไปต่อ: [Module 8.3: Authentication & Authorization Middleware](/node/08-03-auth-middleware)**
