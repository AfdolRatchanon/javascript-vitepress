# Module 14.1: Process Managers (PM2) 🤖

> 💡 **เป้าหมาย:** เข้าใจว่าทำไมถึงห้ามรัน `node app.js` ดิบๆ ใน Production และรู้จักวิธีใช้ PM2 บริหารจัดการ Node.js Process อย่างมืออาชีพ นำไปใช้กับระบบ WSA2026 API เพื่อให้ Server ทำงานได้ตลอด 24 ชั่วโมงระหว่างการแข่งขัน

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ปัญหาของ `node app.js` ธรรมดา

Node.js โดยธรรมชาติเป็น **Single Threaded** และเปราะบาง หากโค้ดเรา Error แค่จุดเดียว (Uncaught Exception) App จะดับทันที! และถ้าไม่มีใครมาเปิดใหม่ — เว็บจะล่มยาวๆ จนกว่า Admin จะมาเห็น

```
  ปัญหาในการแข่งขัน WSA2026:
  ===========================

  ❌ ไม่มี Process Manager:
  [WSA2026 API]  <-- นักแข่งส่งงาน...
       |
       | ← Error: DB connection lost!
       v
  [CRASH!] ← Server ดับ
       |
       | ← กรรมการ/นักแข่งใช้งานไม่ได้
       | ← ข้อมูลอาจสูญหาย!

  ✅ มี PM2:
  [WSA2026 API]  <-- นักแข่งส่งงาน...
       |
       | ← Error!
       v
  [PM2 detects crash]
       |
       v
  [Auto Restart < 1 sec]  ← User แทบไม่รู้ตัว!
  [WSA2026 API running]
```

### PM2 แก้ปัญหาอะไรบ้าง?

| ปัญหา | PM2 Solution |
|:---|:---|
| App crash → Server ล่ม | **Auto Restart** ทันทีเมื่อ App ดับ |
| Node.js ใช้ได้แค่ 1 CPU Core | **Cluster Mode** ใช้ทุก Core |
| ดู log ยากเมื่อรัน background | **Log Management** รวม log ทุก process |
| Reboot Server → App ไม่ขึ้น | **Startup Hook** รัน App พร้อม OS |
| อัปเดตโค้ดต้อง Downtime | **Zero Downtime Reload** |

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### 1. ติดตั้งและ Start WSA2026 API

::: code-group
```bash [install & start]
# ติดตั้ง PM2 globally
npm install pm2 -g

# ตรวจสอบ version
pm2 --version

# Start WSA2026 API (ตั้งชื่อ process)
pm2 start server.js --name "wsa2026-api"

# ดูสถานะ
pm2 list

# ดู log แบบ realtime
pm2 logs wsa2026-api

# หยุด / เริ่มใหม่ / ลบ
pm2 stop    wsa2026-api
pm2 restart wsa2026-api
pm2 delete  wsa2026-api
```
:::

### 2. pm2 list — ตัวอย่าง Output

```
  ┌────┬──────────────────┬─────────┬────────┬──────┬───────────┬──────────┐
  │ id │ name             │ mode    │ status │ cpu  │ memory    │ uptime   │
  ├────┼──────────────────┼─────────┼────────┼──────┼───────────┼──────────┤
  │  0 │ wsa2026-api      │ cluster │ online │ 0%   │ 52.5 MB   │ 2D       │
  │  1 │ wsa2026-api      │ cluster │ online │ 0%   │ 51.2 MB   │ 2D       │
  │  2 │ wsa2026-api      │ cluster │ online │ 0%   │ 53.1 MB   │ 2D       │
  │  3 │ wsa2026-api      │ cluster │ online │ 1%   │ 54.0 MB   │ 2D       │
  └────┴──────────────────┴─────────┴────────┴──────┴───────────┴──────────┘
```

### 3. Cluster Mode — ใช้ทุก CPU Core

::: code-group
```bash [cluster mode]
# รัน max ตามจำนวน CPU Core ที่มี
pm2 start server.js --name "wsa2026-api" -i max

# หรือระบุจำนวน instance
pm2 start server.js --name "wsa2026-api" -i 4
```
:::

```
  Cluster Mode — 4 CPU Cores:
  ===========================

  Port 3000
     |
  [PM2 Load Balancer]  ← Round-Robin
     |       |       |       |
  [P0]    [P1]    [P2]    [P3]    ← 4 Node.js processes
  Core0   Core1   Core2   Core3

  ถ้า P0 crash → PM2 restart P0
  ขณะนั้น P1, P2, P3 ยังรับงานอยู่
  → Zero Downtime!
```

### 4. Ecosystem File (ecosystem.config.js) — config ครบในไฟล์เดียว

ไฟล์นี้เหมือน `package.json` ของ PM2 เก็บ config ทุกอย่างไว้ที่เดียว

::: code-group
```js [ecosystem.config.js]
module.exports = {
  apps: [{
    // ชื่อและไฟล์หลัก
    name:   "wsa2026-api",
    script: "./server.js",

    // ==============================
    // Cluster Mode (ใช้ทุก CPU Core)
    // ==============================
    instances:  "max",
    exec_mode:  "cluster",

    // ==============================
    // Environment Variables
    // ==============================
    env: {
      NODE_ENV:   "development",
      PORT:       3000,
      DB_HOST:    "localhost",
      DB_NAME:    "wsa2026"
    },
    env_production: {
      NODE_ENV:   "production",
      PORT:       8080,
      DB_HOST:    "prod-db.wsa2026.com",
      DB_NAME:    "wsa2026_prod"
    },

    // ==============================
    // Auto Restart Rules
    // ==============================
    max_memory_restart: "500M",    // restart ถ้า RAM เกิน 500MB (ป้องกัน memory leak)
    max_restarts:       10,        // restart ได้สูงสุด 10 ครั้งก่อนหยุด
    min_uptime:         "5s",      // ถ้า app อยู่ไม่ถึง 5 วินาทีถือว่า crash loop
    restart_delay:      1000,      // รอ 1 วินาทีก่อน restart (ms)

    // ==============================
    // Logging
    // ==============================
    log_date_format:  "YYYY-MM-DD HH:mm:ss",
    out_file:         "./logs/pm2-out.log",
    error_file:       "./logs/pm2-error.log",
    merge_logs:       true,        // รวม log ทุก instance ไว้ไฟล์เดียว

    // ==============================
    // Watch Mode (Dev Only)
    // ==============================
    // watch:        true,
    // ignore_watch: ["node_modules", "logs", "*.log"]
  }]
};
```
:::

::: code-group
```bash [ใช้งาน ecosystem.config.js]
# Start ด้วย config
pm2 start ecosystem.config.js

# Start แบบ Production Environment
pm2 start ecosystem.config.js --env production

# Reload (Zero Downtime)
pm2 reload ecosystem.config.js

# ดูสถานะแบบ Dashboard
pm2 monit
```
:::

### 5. Zero Downtime Reload

::: code-group
```bash [reload vs restart]
# ❌ restart: มี downtime ชั่วขณะ
pm2 restart wsa2026-api

# ✅ reload: Zero Downtime (Cluster Mode เท่านั้น)
pm2 reload wsa2026-api
pm2 reload ecosystem.config.js
```
:::

```
  Zero Downtime Reload Process:
  =============================

  ก่อน reload: [P0] [P1] [P2] [P3]  ← ทุกตัวรับงาน

  reload เริ่ม:
    Step 1: restart P0  → [P0*] [P1] [P2] [P3]  (P1,P2,P3 รับงานแทน)
    Step 2: restart P1  → [P0]  [P1*] [P2] [P3]
    Step 3: restart P2  → [P0]  [P1]  [P2*] [P3]
    Step 4: restart P3  → [P0]  [P1]  [P2]  [P3*]

  ผล: โค้ดใหม่ทั้งหมด ไม่มี Downtime เลย! 🎉
```

### 6. Startup Hook (ทำงานหลัง Reboot)

::: code-group
```bash [startup & save]
# Step 1: สร้าง startup script
pm2 startup
# (Copy & run command ที่ได้มา)

# Step 2: บันทึก process list ปัจจุบัน
pm2 save

# ทดสอบ: reboot เครื่อง แล้วดูว่า wsa2026-api ขึ้นมาเองไหม
pm2 list
```
:::

### 7. Log Management

::: code-group
```bash [log commands]
# ดู log realtime ทุก process
pm2 logs

# ดู log เฉพาะ wsa2026-api (เลื่อน 100 บรรทัดล่าสุด)
pm2 logs wsa2026-api --lines 100

# ล้าง log (ถ้าไฟล์ใหญ่เกิน)
pm2 flush

# ติดตั้ง logrotate (กัน log บวมจน disk เต็ม)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```
:::

### 8. Graceful Shutdown — ปิด Server อย่างสง่างาม

เมื่อ PM2 รีสตาร์ท App เราควรรอให้ requests ที่กำลังทำงานอยู่เสร็จก่อน

::: code-group
```js [server.js — graceful shutdown]
const express = require("express");
const app     = express();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", system: "wsa2026-api" });
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`WSA2026 API ready on port ${process.env.PORT || 3000}`);
});

// ======================================================
// Graceful Shutdown — รอ requests ปัจจุบันเสร็จก่อนปิด
// ======================================================
process.on("SIGTERM", () => {
  console.log("SIGTERM received — graceful shutdown...");
  server.close(() => {
    console.log("All connections closed. Exiting.");
    process.exit(0);
  });
});
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สร้าง `ecosystem.config.js` สำหรับ WSA2026 ที่มี **2 apps** คือ:
  1. `wsa2026-api` — API server (port 3000, cluster mode, max instances)
  2. `wsa2026-worker` — background worker สำหรับคำนวณ leaderboard (port 3001, fork mode, 1 instance)

::: details 💡 คำใบ้ (Hint)
```javascript
module.exports = {
  apps: [
    {
      name:      "wsa2026-api",
      script:    "./server.js",
      instances: "max",
      exec_mode: "cluster",
      env: { PORT: 3000, NODE_ENV: "production" }
    },
    {
      name:      "wsa2026-worker",
      script:    "./worker.js",
      instances: 1,
      exec_mode: "fork",  // fork = 1 process เดียว
      env: { PORT: 3001, NODE_ENV: "production" }
    }
  ]
};
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

### Challenge: WSA2026 Competition Server Setup

**สถานการณ์:** วันแข่งขัน WSA2026 เริ่มแล้ว! คุณต้องตั้งค่า Production Server ให้พร้อม:

1. **สร้าง `ecosystem.config.js`** สำหรับ WSA2026 ที่รองรับ:
   - Environment: `development`, `staging`, `production`
   - Production: cluster mode, max instances, port 8080
   - Log rotation รายวัน
   - Memory limit 512MB

2. **เขียน shell script `deploy.sh`** ที่:
   ```bash
   # ทำทุกขั้นตอน deploy อัตโนมัติ
   git pull origin main
   npm install --production
   pm2 reload ecosystem.config.js --env production
   pm2 save
   echo "Deploy complete!"
   ```

3. **เพิ่ม Health Check endpoint** ใน `server.js`:
   ```
   GET /health → { status: "ok", uptime: 3600, pid: 12345, env: "production" }
   ```

4. **ทดสอบ Auto Restart:**
   - เพิ่ม route ทดสอบ `GET /crash` ที่ throw Error
   - เรียก endpoint นั้น แล้วดู PM2 restart ใน `pm2 logs`
   - ยืนยันว่า API ยังทำงานได้หลัง crash

::: details 💡 คำใบ้ (Hint)
```javascript
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status:  "ok",
    system:  "wsa2026-api",
    uptime:  Math.floor(process.uptime()),
    pid:     process.pid,
    env:     process.env.NODE_ENV,
    memory:  process.memoryUsage().heapUsed
  });
});

// Test crash (ลบออกก่อน deploy จริง!)
app.get("/crash", (req, res) => {
  throw new Error("Simulated crash for PM2 restart test");
});
```
:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** ทำไมถึงห้ามรัน `node app.js` ดิบๆ ใน Production?
**แนวคำตอบ:** เพราะถ้าเกิด Uncaught Exception แม้แต่ครั้งเดียว Node.js process จะ exit ทันที และไม่มีอะไร restart ให้อัตโนมัติ ทำให้เว็บล่มจนกว่า Admin จะมาเปิดใหม่ด้วยมือ นอกจากนี้ยังไม่สามารถใช้งาน CPU หลายคอร์ได้เต็มประสิทธิภาพ

**คำถาม 2:** `pm2 restart` กับ `pm2 reload` ต่างกันอย่างไร?
**แนวคำตอบ:** `restart` ฆ่า process ทั้งหมดแล้วเปิดใหม่พร้อมกัน (มี downtime ชั่วขณะสั้น) ส่วน `reload` ทำ Rolling Restart — ทยอย restart ทีละ process (ใช้ได้เฉพาะ Cluster Mode) ทำให้ไม่มี downtime เลย เหมาะสำหรับ deploy โค้ดใหม่บน Production

**คำถาม 3:** `max_memory_restart` ใน ecosystem.config.js มีไว้ทำอะไร?
**แนวคำตอบ:** ป้องกัน Memory Leak — Node.js บางครั้งโค้ดที่เขียนไม่ดีทำให้ RAM บวมขึ้นเรื่อยๆ ไม่มีที่สิ้นสุด (Memory Leak) PM2 จะ monitor RAM usage อยู่ตลอด ถ้าเกินค่าที่กำหนด จะ restart process นั้นให้อัตโนมัติ เป็นการแก้ปัญหาที่ปลายเหตุแต่ช่วยให้ Server ไม่ตาย

**คำถาม 4:** PM2 Cluster Mode ทำงานอย่างไร? ทำไมทุก instance ใช้ Port เดียวกันได้?
**แนวคำตอบ:** PM2 ใช้ Node.js Cluster API (`child_process.fork`) สร้าง Worker Process หลายตัว ซึ่งสืบทอด Server socket จาก Master Process ได้ PM2 ทำหน้าที่เป็น Round-Robin Load Balancer แจก incoming connection ให้แต่ละ Worker สลับกัน ทำให้ทุก Worker ดูเหมือน "ฟัง" port เดียวกันได้

:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> - **Process Manager:** โปรแกรมที่บริหารจัดการ Node.js Process (Start, Stop, Restart, Monitor)
> - **Cluster Mode:** รัน App หลาย Process พร้อมกันเพื่อใช้งาน CPU หลาย Core
> - **Fork Mode:** รัน App เป็น 1 Process เดียว (ค่า default ของ PM2)
> - **Zero Downtime Reload:** การ deploy โค้ดใหม่โดย User ไม่รู้ตัว
> - **Startup Hook:** ทำให้ PM2 รัน App พร้อมกับ OS startup (หลัง reboot)
> - **Graceful Shutdown:** ปิด Server อย่างสง่างาม รอให้ request ปัจจุบันเสร็จก่อน
> - **Memory Leak:** RAM บวมขึ้นเรื่อยๆ เพราะ Object ไม่ถูก Garbage Collected
> - **SIGTERM:** สัญญาณจาก OS ที่บอกให้ Process ปิดตัว (สามารถ handle ได้)
> - **`pm2 save`:** บันทึก process list ปัจจุบันไว้ใน `~/.pm2/dump.pm2`

👉 **[ไปต่อ: Module 15 — Capstone](/node/15-01-capstone)**
