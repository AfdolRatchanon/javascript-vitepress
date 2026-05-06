# API Testing Tools (Postman / Thunder Client / curl) 🔍

> 💡 **เป้าหมาย:** เรียนรู้วิธีทดสอบ API endpoint ด้วยเครื่องมือมาตรฐานอย่าง Postman, Thunder Client และ curl ก่อนเริ่มเขียน Frontend เพื่อให้มั่นใจว่า Backend ทำงานถูกต้องตั้งแต่แรก ในบทนี้จะใช้ระบบ **WSA2026 Test Submission Management System** เป็นตัวอย่างตลอด

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ทำไมต้องทดสอบ API ก่อน Frontend? 🤔

ลองนึกภาพว่าคุณสร้าง Backend API เสร็จแล้ว แล้วโดดไปเขียน React Frontend เลย พอรันแล้ว Data ไม่ขึ้น... คุณจะรู้ได้ยังไงว่าปัญหาอยู่ที่ฝั่งไหน? Frontend หรือ Backend?

**การทดสอบ API แยกต่างหาก (Isolated Testing) ช่วยได้ดังนี้:**

1. **Verify ก่อน** — ยืนยันว่า Endpoint คืนค่าถูกต้องก่อนเขียน UI
2. **Debug เร็วขึ้น** — รู้ทันทีว่าปัญหาอยู่ที่ Backend
3. **Document อัตโนมัติ** — Collection ใน Postman เป็น Documentation ของ API ในตัว
4. **ทำงานคนละส่วน** — Frontend Dev กับ Backend Dev ทำงานพร้อมกันได้โดยใช้ Collection เป็น Contract

### โครงสร้าง HTTP Request / Response (ASCII Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP REQUEST STRUCTURE                        │
├─────────────────────────────────────────────────────────────────┤
│  Request Line:  POST /api/submissions HTTP/1.1                  │
│                 [METHOD] [URL PATH] [HTTP VERSION]              │
├─────────────────────────────────────────────────────────────────┤
│  Headers:                                                       │
│    Host: localhost:3000                                         │
│    Content-Type: application/json                               │
│    Authorization: Bearer eyJhbGc...                             │
│    Accept: application/json                                     │
├─────────────────────────────────────────────────────────────────┤
│  (Blank Line — separates Headers from Body)                     │
├─────────────────────────────────────────────────────────────────┤
│  Body (JSON):                                                   │
│    {                                                            │
│      "candidate_id": 5,                                         │
│      "task_id": 2,                                              │
│      "submission_url": "https://github.com/user/repo"           │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    HTTP RESPONSE STRUCTURE                       │
├─────────────────────────────────────────────────────────────────┤
│  Status Line:   HTTP/1.1 201 Created                            │
│                 [VERSION] [STATUS CODE] [STATUS TEXT]           │
├─────────────────────────────────────────────────────────────────┤
│  Headers:                                                       │
│    Content-Type: application/json                               │
│    Content-Length: 128                                          │
├─────────────────────────────────────────────────────────────────┤
│  Body (JSON):                                                   │
│    {                                                            │
│      "id": 10,                                                  │
│      "message": "Submission created successfully",              │
│      "submitted_at": "2026-05-06T09:00:00Z"                     │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### HTTP Methods — ใช้งานอย่างไร และเมื่อไหร่?

```
┌──────────────────────────────────────────────────────────────────────┐
│                     HTTP METHODS REFERENCE                           │
├──────────┬───────────────────────────────┬──────────────────────────┤
│  Method  │  ความหมาย                     │  ตัวอย่าง WSA2026         │
├──────────┼───────────────────────────────┼──────────────────────────┤
│  GET     │  ดึงข้อมูล (อ่านอย่างเดียว)   │  GET /api/tasks          │
│          │  ไม่มี Body, ไม่เปลี่ยนแปลง   │  GET /api/submissions/5  │
├──────────┼───────────────────────────────┼──────────────────────────┤
│  POST    │  สร้างข้อมูลใหม่              │  POST /api/submissions   │
│          │  มี Body, สร้าง Resource ใหม่ │  POST /api/auth/login    │
├──────────┼───────────────────────────────┼──────────────────────────┤
│  PUT     │  แทนที่ข้อมูลทั้งหมด          │  PUT /api/tasks/3        │
│          │  ต้องส่ง Field ครบทุกตัว      │  (แทนที่ Task ทั้งก้อน)  │
├──────────┼───────────────────────────────┼──────────────────────────┤
│  PATCH   │  แก้ไขข้อมูลบางส่วน           │  PATCH /api/submissions/5│
│          │  ส่งเฉพาะ Field ที่แก้         │  (อัปเดตแค่ score)       │
├──────────┼───────────────────────────────┼──────────────────────────┤
│  DELETE  │  ลบข้อมูล                     │  DELETE /api/tasks/3     │
│          │  มักไม่มี Body                │  (ลบ Task ทั้งก้อน)      │
└──────────┴───────────────────────────────┴──────────────────────────┘
```

---

### HTTP Status Codes ที่ต้องรู้จัก

```
┌────────────────────────────────────────────────────────────────────┐
│                    STATUS CODES CHEAT SHEET                        │
├──────────┬─────────────────────────────────────────────────────────┤
│  Code    │  ความหมาย + เมื่อไหร่ใช้                               │
├──────────┼─────────────────────────────────────────────────────────┤
│  200 OK  │  สำเร็จ — GET ข้อมูลได้, PUT/PATCH อัปเดตสำเร็จ       │
│  201     │  Created — POST สร้างข้อมูลใหม่สำเร็จ                  │
│  204     │  No Content — DELETE สำเร็จ (ไม่คืน Body)              │
├──────────┼─────────────────────────────────────────────────────────┤
│  400     │  Bad Request — Body หรือ Params ผิดรูปแบบ              │
│  401     │  Unauthorized — ยังไม่ได้ Login / Token ไม่ถูก         │
│  403     │  Forbidden — Login แล้วแต่ไม่มีสิทธิ์ (Role ไม่พอ)    │
│  404     │  Not Found — Resource นั้นไม่มีในระบบ                  │
│  422     │  Unprocessable — Validation ล้มเหลว (Field ไม่ครบ)     │
├──────────┼─────────────────────────────────────────────────────────┤
│  500     │  Internal Server Error — Bug ใน Server Code             │
└──────────┴─────────────────────────────────────────────────────────┘

   2xx = ✅ สำเร็จ    4xx = ❌ ลูกค้าผิด    5xx = 💥 Server ผิด
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### ส่วนที่ 1 — Postman: สร้าง Collection สำหรับ WSA2026

**วิธีใช้ Postman เบื้องต้น:**
1. Download และติดตั้งจาก [postman.com](https://postman.com)
2. เปิด Postman → คลิก **New** → **Collection**
3. ตั้งชื่อว่า `WSA2026 API`
4. เพิ่ม Request โดยคลิก `+` ใน Collection

**การตั้ง Environment Variables ใน Postman:**

```
Environment Name: WSA2026 Local
─────────────────────────────────────────────
Variable       │ Initial Value           │ Current Value
───────────────┼─────────────────────────┼──────────────────
base_url       │ http://localhost:3000   │ http://localhost:3000
token          │ (ว่างไว้ก่อน)          │ (จะถูกเซ็ตหลัง Login)
candidate_id   │ 1                       │ 1
task_id        │ 1                       │ 1
```

ใช้ตัวแปรใน URL: `{{base_url}}/api/tasks`

---

**โครงสร้าง Postman Collection JSON (ส่งออกเป็นไฟล์ `.json`):**

::: code-group
```json [WSA2026.postman_collection.json]
{
  "info": {
    "name": "WSA2026 Test Submission System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "POST Login",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"judge01\",\n  \"password\": \"secret\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Tasks",
      "item": [
        {
          "name": "GET All Tasks",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "url": {
              "raw": "{{base_url}}/api/tasks",
              "host": ["{{base_url}}"],
              "path": ["api", "tasks"]
            }
          }
        },
        {
          "name": "GET Task by ID",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "url": {
              "raw": "{{base_url}}/api/tasks/{{task_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "tasks", "{{task_id}}"]
            }
          }
        }
      ]
    },
    {
      "name": "Submissions",
      "item": [
        {
          "name": "POST Create Submission",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"candidate_id\": {{candidate_id}},\n  \"task_id\": {{task_id}},\n  \"submission_url\": \"https://github.com/example/wsa2026-task1\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/submissions",
              "host": ["{{base_url}}"],
              "path": ["api", "submissions"]
            }
          }
        },
        {
          "name": "GET All Submissions",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "url": {
              "raw": "{{base_url}}/api/submissions",
              "host": ["{{base_url}}"],
              "path": ["api", "submissions"]
            }
          }
        },
        {
          "name": "PATCH Score Submission",
          "request": {
            "method": "PATCH",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"score\": 85,\n  \"status\": \"graded\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/submissions/1",
              "host": ["{{base_url}}"],
              "path": ["api", "submissions", "1"]
            }
          }
        }
      ]
    }
  ]
}
```
:::

---

### ส่วนที่ 2 — Thunder Client (VS Code Extension)

Thunder Client คือ Postman แต่อยู่ใน VS Code เลย ไม่ต้องเปิดโปรแกรมเพิ่ม

**วิธีติดตั้ง:**
1. เปิด VS Code → กด `Ctrl+Shift+X`
2. ค้นหา `Thunder Client`
3. Install ของ Ranga Vadhineni

**วิธีใช้:**
1. คลิก Icon สายฟ้า ที่ Sidebar ซ้าย
2. คลิก **New Request**
3. เลือก Method → ใส่ URL → กด **Send**

**ตัวอย่าง Request ใน Thunder Client:**

```
Method:  POST
URL:     http://localhost:3000/api/submissions
─────────────────────────────────────────────────────
Headers Tab:
  Content-Type  →  application/json
  Authorization →  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
─────────────────────────────────────────────────────
Body Tab → JSON:
{
  "candidate_id": 3,
  "task_id": 1,
  "submission_url": "https://github.com/naka/wsa2026"
}
─────────────────────────────────────────────────────
Response:
  Status: 201 Created
  Time:   45ms
  {
    "id": 7,
    "message": "Submission created successfully"
  }
```

---

### ส่วนที่ 3 — curl: เครื่องมือ Command Line สุดโปร

curl คือเครื่องมือใน Terminal สำหรับส่ง HTTP Request โดยตรง มีติดมากับ macOS/Linux และ Windows 10 ขึ้นไป

::: code-group
```bash [GET Tasks]
# ดึงรายการ Task ทั้งหมด
curl http://localhost:3000/api/tasks

# ดึงพร้อม Header (แสดง Response Header ด้วย)
curl -i http://localhost:3000/api/tasks

# ดึงพร้อม Bearer Token (Judge/Manager เท่านั้น)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:3000/api/tasks
```

```bash [POST Submission]
# สร้าง Submission ใหม่ (Candidate ส่งงาน)
curl -X POST http://localhost:3000/api/submissions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{
       "candidate_id": 3,
       "task_id": 2,
       "submission_url": "https://github.com/naka/wsa2026-task2"
     }'
```

```bash [PATCH Score]
# Judge ให้คะแนน Submission (อัปเดตบางส่วน)
curl -X PATCH http://localhost:3000/api/submissions/5 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer JUDGE_TOKEN" \
     -d '{"score": 92, "status": "graded"}'
```

```bash [DELETE Task]
# Manager ลบ Task (เฉพาะ role: manager)
curl -X DELETE http://localhost:3000/api/tasks/3 \
     -H "Authorization: Bearer MANAGER_TOKEN"
```

```bash [GET with Query]
# ดึง Submission กรองตาม candidate_id
curl "http://localhost:3000/api/submissions?candidate_id=3&status=pending"
```
:::

---

### ส่วนที่ 4 — ตาราง curl Flags ที่ใช้บ่อย

```
┌──────────────────────────────────────────────────────────────┐
│                     curl FLAGS REFERENCE                      │
├──────────┬───────────────────────────────────────────────────┤
│  Flag    │  ความหมาย                                        │
├──────────┼───────────────────────────────────────────────────┤
│  -X      │  กำหนด HTTP Method  (-X POST, -X DELETE)         │
│  -H      │  เพิ่ม Header  (-H "Content-Type: application/json")│
│  -d      │  ส่ง Body Data  (-d '{"key":"value"}')           │
│  -i      │  แสดง Response Headers ด้วย                      │
│  -v      │  Verbose — แสดงทุกอย่าง (debug)                  │
│  -s      │  Silent — ไม่แสดง Progress bar                   │
│  -o      │  บันทึก Response ลงไฟล์  (-o output.json)        │
│  -u      │  Basic Auth  (-u username:password)               │
└──────────┴───────────────────────────────────────────────────┘
```

---

### ส่วนที่ 5 — ทดสอบ WSA2026 Endpoints ครบชุด

::: code-group
```bash [curl-wsa2026-tests.sh]
#!/bin/bash
# WSA2026 API Test Script

BASE="http://localhost:3000"
TOKEN="your_jwt_token_here"
AUTH="-H \"Authorization: Bearer $TOKEN\""

echo "=== WSA2026 API Tests ==="

echo ""
echo "--- 1. GET /api/tasks (ดูโจทย์ทั้งหมด) ---"
curl -s -H "Authorization: Bearer $TOKEN" $BASE/api/tasks | python3 -m json.tool

echo ""
echo "--- 2. GET /api/tasks/1 (ดูโจทย์ข้อ 1) ---"
curl -s -H "Authorization: Bearer $TOKEN" $BASE/api/tasks/1 | python3 -m json.tool

echo ""
echo "--- 3. POST /api/submissions (ส่งงาน) ---"
curl -s -X POST $BASE/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"candidate_id":1,"task_id":1,"submission_url":"https://github.com/test/repo"}' \
  | python3 -m json.tool

echo ""
echo "--- 4. GET /api/submissions (ดูงานที่ส่งทั้งหมด) ---"
curl -s -H "Authorization: Bearer $TOKEN" $BASE/api/submissions | python3 -m json.tool

echo ""
echo "--- 5. PATCH /api/submissions/1 (Judge ให้คะแนน) ---"
curl -s -X PATCH $BASE/api/submissions/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"score":88,"status":"graded"}' \
  | python3 -m json.tool

echo ""
echo "=== Test Complete ==="
```

```bash [test-auth.sh]
#!/bin/bash
# ทดสอบ Authentication Flow

BASE="http://localhost:3000"

echo "--- Login as Candidate ---"
RESPONSE=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"candidate01","password":"secret123"}')

echo $RESPONSE | python3 -m json.tool

# ดึง Token จาก Response (ต้องมี jq ติดตั้งไว้)
# TOKEN=$(echo $RESPONSE | jq -r '.token')
# echo "Token: $TOKEN"

echo ""
echo "--- Login as Judge ---"
curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"judge01","password":"judgesecret"}' \
  | python3 -m json.tool

echo ""
echo "--- Login as Manager ---"
curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager01","password":"managerpass"}' \
  | python3 -m json.tool
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** สมมติว่า Backend ของ WSA2026 รันอยู่ที่ `http://localhost:3000` และมี endpoint `GET /api/users` ที่คืน list ของ users ทั้งหมด (เฉพาะ role: manager เท่านั้น) ให้ทำดังนี้:

1. เขียน curl command สำหรับ Login ด้วย username: `manager01`, password: `pass1234`
2. เขียน curl command สำหรับดึง `/api/users` พร้อมแนบ Authorization Header
3. ถ้า Server ตอบกลับด้วย Status `403` แสดงว่าเกิดอะไรขึ้น?

::: details 💡 คำใบ้ (Hint)

**ข้อ 1 — Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"manager01","password":"pass1234"}'
```

**ข้อ 2 — GET /api/users:**
```bash
curl -H "Authorization: Bearer TOKEN_จาก_ข้อ1" \
     http://localhost:3000/api/users
```

**ข้อ 3 — Status 403 Forbidden:**
- 403 = Login แล้ว แต่ Role ไม่มีสิทธิ์
- ถ้าได้ 403 จาก `/api/users` แปลว่า Token ที่ใช้เป็นของ `candidate` หรือ `judge` ไม่ใช่ `manager`
- ต่างจาก 401 ที่หมายถึงยังไม่ได้ Login หรือ Token หมดอายุ
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

**โจทย์:** สร้าง Postman Collection ที่มี **Pre-request Script** เพื่อ Login อัตโนมัติและเก็บ Token ลง Environment Variable ทุกครั้งก่อนรัน Request อื่น

โดยมีเงื่อนไขดังนี้:
- Collection มี Folder แยก: `Auth`, `Tasks`, `Submissions`, `Users`
- ทุก Request ใน `Tasks`, `Submissions`, `Users` ต้องแนบ `{{token}}` อัตโนมัติ
- Collection-level Pre-request Script ต้อง:
  1. เรียก `POST /api/auth/login` ด้วย credentials จาก Environment
  2. ดึง `token` จาก Response
  3. เซ็ต `pm.environment.set("token", token)` เพื่อให้ Request ถัดไปใช้ได้

ลองค้นคว้าเรื่อง Postman Pre-request Scripts และ `pm.sendRequest()` เพื่อทำ Challenge นี้

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** HTTP Method ไหนที่ใช้สำหรับ "อัปเดตบางส่วน" ของข้อมูล และต่างจาก PUT อย่างไร?

**แนวคำตอบ:** ใช้ `PATCH` สำหรับอัปเดตบางส่วน เช่น อัปเดตแค่ `score` ใน Submission โดยไม่ต้องส่ง Field อื่นมาด้วย ส่วน `PUT` ต้องส่งข้อมูลทั้งหมดของ Resource นั้นมาใหม่ทั้งหมด ถ้าไม่ส่ง Field ใด Field นั้นจะถูกลบหรือเป็น null

**คำถาม 2:** ความแตกต่างระหว่าง Status Code 401 กับ 403 คืออะไร? ในระบบ WSA2026 แต่ละ Code เกิดขึ้นเมื่อไหร่?

**แนวคำตอบ:** 401 Unauthorized = ผู้ใช้ยังไม่ได้ยืนยันตัวตน (ไม่มี Token หรือ Token ไม่ถูกต้อง/หมดอายุ) — เช่น ยิง API โดยไม่แนบ Authorization Header ไปเลย | 403 Forbidden = ผู้ใช้ Login แล้วแต่ Role ไม่มีสิทธิ์ — เช่น `candidate` พยายามเข้าถึง `DELETE /api/tasks` ซึ่งเป็นสิทธิ์ของ `manager` เท่านั้น

**คำถาม 3:** ทำไมการทดสอบ API ด้วย Postman/curl ก่อนเขียน Frontend ถึงสำคัญ? ยกตัวอย่างสถานการณ์จริงใน WSA2026

**แนวคำตอบ:** เพราะช่วยแยก Layer ของปัญหาออกจากกัน — ถ้า `POST /api/submissions` ทดสอบผ่าน Postman แล้วได้ 201 Created แปลว่า Backend ถูกต้อง ถ้า Frontend ยิงแล้วไม่ได้ข้อมูล ปัญหาต้องอยู่ที่ React Code (เช่น URL ผิด, Header ขาด, Body ผิดโครงสร้าง) ช่วยประหยัดเวลา Debug ได้มาก โดยเฉพาะใน Competition ที่เวลาจำกัด
:::

---

👉 **[ไปต่อ: 3.2 - Native HTTP Reference](/node/03-02-native-http-reference)**
