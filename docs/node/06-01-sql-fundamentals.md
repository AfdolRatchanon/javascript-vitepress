# 6.1 SQL Fundamentals (พื้นฐาน SQL) 🏛️

> 💡 **เป้าหมาย:** เข้าใจหลักการของ Relational Database และสามารถเขียนคำสั่ง SQL พื้นฐานได้ครบถ้วน ตั้งแต่การสร้างตาราง จัดการข้อมูล ไปจนถึงการเชื่อมโยงตาราง เพื่อนำไปใช้กับระบบ WSA2026 Test Submission Management System ได้จริง

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### 🗄️ Relational Database คืออะไร?

**Relational Database** คือฐานข้อมูลที่จัดเก็บข้อมูลในรูปแบบ **ตาราง (Table)** ที่มีแถว (Row) และคอลัมน์ (Column) เหมือนกับ Excel แต่ทรงพลังกว่ามาก เพราะสามารถ **เชื่อมโยงข้อมูลข้ามตาราง** ได้อย่างมีประสิทธิภาพ

**Analogy: ไฟล์ Excel vs Database**

```
Excel                    Database (MySQL)
--------------------     ---------------------
ไฟล์ (.xlsx)      ===>   Database
แผ่นงาน (Sheet)   ===>   Table
หัวตาราง          ===>   Column (กำหนด Type ล่วงหน้า)
แถวข้อมูล         ===>   Row / Record
สูตร              ===>   SQL Query
```

**ทำไม Database ดีกว่า Excel?**
1. **Scalability**: รองรับข้อมูล **หลายล้านแถว** (Excel ค้างตั้งแต่หมื่น)
2. **Concurrent Access**: คนหลายคน **เข้าพร้อมกัน** ได้โดยไม่ข้อมูลเสีย
3. **Data Integrity**: มีกฎบังคับ (Constraints) ไม่ให้ข้อมูลผิดพลาด
4. **Relationships**: **JOIN** ตารางเชื่อมโยงกันได้

---

### 🆚 SQL vs NoSQL

| Feature | SQL (Relational) | NoSQL (Non-Relational) |
|:--------|:-----------------|:-----------------------|
| **ตัวอย่าง** | MySQL, PostgreSQL | MongoDB, Redis |
| **โครงสร้าง** | Table (เป๊ะ ต้องกำหนดล่วงหน้า) | Document / Key-Value (ยืดหยุ่น) |
| **ความสัมพันธ์** | JOIN (เชื่อมโยงข้ามตารางเก่ง) | Embedded (ซ้อนใน Document) |
| **ACID** | รองรับเต็มรูปแบบ | บางประเภทเท่านั้น |
| **เหมาะกับ** | การเงิน, สต็อก, Submission ระบบ | Social Media, Chat, Cache |

> **สำหรับ WSA2026:** ระบบ Test Submission ต้องการความน่าเชื่อถือของข้อมูลสูง (ใครส่งงาน, คะแนนเท่าไร) → MySQL คือตัวเลือกที่เหมาะสมที่สุด

---

### 🔑 แนวคิดสำคัญ: Primary Key & Foreign Key

**Primary Key (PK)** คือคอลัมน์ที่ใช้ระบุตัวตนของแถวนั้นๆ ได้อย่างไม่ซ้ำกัน
- ค่าต้องไม่ซ้ำ (Unique)
- ค่าห้ามเป็น NULL
- โดยทั่วไปใช้ `id INT AUTO_INCREMENT`

**Foreign Key (FK)** คือคอลัมน์ที่อ้างอิงไปยัง Primary Key ของตารางอื่น
- ใช้สร้าง "ความสัมพันธ์" ระหว่างตาราง
- ป้องกันข้อมูลกำพร้า (Orphan Data) เช่น ห้ามมี Submission ที่ไม่มีเจ้าของ

---

### 🗺️ ER Diagram: WSA2026 System

```
+------------------+          +---------------------+          +------------------+
|      users       |          |     submissions      |          |      tasks       |
+------------------+          +---------------------+          +------------------+
| PK id            |1       N | PK id               | N      1 | PK id            |
|    username      +----------+ FK candidate_id     +----------+    title         |
|    password_hash |          | FK task_id          |          |    description   |
|    name          |          |    submission_url   |          |    time_limit_   |
|    role          |          |    submitted_at     |          |    minutes       |
|    country       |          |    score            |          |    max_score     |
|    region        |          |    status           |          |                  |
+------------------+          +---------------------+          +------------------+

  ความสัมพันธ์:
  - 1 user (candidate) มีได้หลาย submissions  (1:N)
  - 1 task            มีได้หลาย submissions  (1:N)
  - submissions เชื่อมระหว่าง users และ tasks (Junction-like)
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### DDL — Data Definition Language (สร้างโครงสร้าง)

DDL คือกลุ่มคำสั่งที่ใช้ **กำหนดโครงสร้าง** ของฐานข้อมูล ได้แก่ `CREATE`, `ALTER`, `DROP`

::: code-group
```sql [schema.sql]
-- ======================================
-- WSA2026 Test Submission Management DB
-- ======================================
CREATE DATABASE IF NOT EXISTS wsa2026_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wsa2026_db;

-- -----------------------------------------------
-- ตาราง users: เก็บข้อมูลผู้ใช้ทุกประเภท
-- -----------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,   -- PK รันอัตโนมัติ
  username      VARCHAR(50)  UNIQUE NOT NULL,     -- ล็อกอิน ห้ามซ้ำ
  password_hash VARCHAR(255) NOT NULL,            -- รหัสผ่านแบบ Hash แล้ว
  name          VARCHAR(100),                     -- ชื่อแสดง
  role          ENUM('candidate','judge','manager'), -- บทบาทใน WSA
  country       VARCHAR(50),                      -- ประเทศ
  region        VARCHAR(50)                       -- ภูมิภาค
);

-- -----------------------------------------------
-- ตาราง tasks: โจทย์ที่ผู้แข่งขันต้องทำ
-- -----------------------------------------------
CREATE TABLE tasks (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  title               VARCHAR(200) NOT NULL,
  description         TEXT,
  time_limit_minutes  INT DEFAULT 240,   -- ค่าเริ่มต้น 4 ชั่วโมง
  max_score           INT DEFAULT 100
);

-- -----------------------------------------------
-- ตาราง submissions: บันทึกการส่งงาน
-- -----------------------------------------------
CREATE TABLE submissions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id   INT,
  task_id        INT,
  submission_url VARCHAR(500),
  submitted_at   DATETIME DEFAULT NOW(),          -- เวลาส่งงาน (อัตโนมัติ)
  score          DECIMAL(5,2),                    -- คะแนน เช่น 87.50
  status         ENUM('pending','scored') DEFAULT 'pending',
  FOREIGN KEY (candidate_id) REFERENCES users(id),  -- FK ไป users
  FOREIGN KEY (task_id)      REFERENCES tasks(id)   -- FK ไป tasks
);
```
```sql [alter-examples.sql]
-- ALTER TABLE: แก้ไขโครงสร้างตารางหลังสร้างแล้ว

-- เพิ่มคอลัมน์ใหม่
ALTER TABLE submissions ADD COLUMN feedback TEXT;

-- เปลี่ยนประเภทข้อมูล
ALTER TABLE users MODIFY COLUMN name VARCHAR(150);

-- เพิ่ม Index เพื่อเร่งความเร็วการค้นหา
ALTER TABLE submissions ADD INDEX idx_candidate (candidate_id);

-- ลบคอลัมน์
ALTER TABLE submissions DROP COLUMN feedback;

-- DROP TABLE: ลบตารางทิ้งทั้งหมด (ระวัง! ข้อมูลหายหมด)
-- DROP TABLE IF EXISTS submissions;
```
:::

---

### Constraints — ข้อบังคับของคอลัมน์

| Constraint | ความหมาย | ตัวอย่าง |
|:-----------|:---------|:---------|
| `NOT NULL` | ห้ามเป็นค่าว่าง | `username VARCHAR(50) NOT NULL` |
| `UNIQUE` | ห้ามซ้ำในคอลัมน์เดียวกัน | `username VARCHAR(50) UNIQUE` |
| `DEFAULT` | ค่าเริ่มต้นถ้าไม่ได้ระบุ | `status ENUM(...) DEFAULT 'pending'` |
| `AUTO_INCREMENT` | รันเลขอัตโนมัติ | `id INT AUTO_INCREMENT` |
| `PRIMARY KEY` | คีย์หลัก (Unique + Not Null) | `PRIMARY KEY (id)` |
| `FOREIGN KEY` | อ้างอิงตารางอื่น | `FOREIGN KEY (user_id) REFERENCES users(id)` |
| `CHECK` | กำหนดเงื่อนไขค่า | `score DECIMAL CHECK (score >= 0)` |

---

### DML — Data Manipulation Language (จัดการข้อมูล)

::: code-group
```sql [insert.sql]
-- INSERT INTO: เพิ่มข้อมูลใหม่

-- เพิ่ม task
INSERT INTO tasks (title, description, time_limit_minutes, max_score)
VALUES ('Module A - Frontend Development', 
        'Build a responsive product listing page', 
        240, 
        100);

-- เพิ่ม users (ผู้แข่งขันหลายคน)
INSERT INTO users (username, password_hash, name, role, country, region)
VALUES 
  ('th_001', '$2b$10$abc...', 'สมชาย ใจดี',     'candidate', 'Thailand',  'Asia'),
  ('sg_002', '$2b$10$def...', 'Wei Lin',         'candidate', 'Singapore', 'Asia'),
  ('jp_003', '$2b$10$ghi...', 'Tanaka Hiroshi',  'candidate', 'Japan',     'Asia'),
  ('judge1', '$2b$10$jkl...', 'Expert Judge 1',  'judge',     'Germany',   'Europe');

-- เพิ่ม submission
INSERT INTO submissions (candidate_id, task_id, submission_url)
VALUES (1, 1, 'https://github.com/th_001/module-a-submission');
```
```sql [select.sql]
-- SELECT: ดึงข้อมูล

-- ดูทุก submission (ทั้งหมด)
SELECT * FROM submissions;

-- เลือกเฉพาะคอลัมน์ที่ต้องการ (ดีกว่า SELECT *)
SELECT id, candidate_id, submitted_at, status
FROM submissions;

-- WHERE: กรองเงื่อนไข
-- ดู submission ที่ยังไม่ได้รับการให้คะแนน
SELECT * FROM submissions WHERE status = 'pending';

-- ดู user ที่เป็น candidate จาก Asia
SELECT id, username, name, country
FROM users
WHERE role = 'candidate' AND region = 'Asia';

-- ORDER BY: จัดเรียง
-- เรียงตามเวลาส่งล่าสุดก่อน
SELECT * FROM submissions ORDER BY submitted_at DESC;

-- LIMIT: จำกัดจำนวนผลลัพธ์
-- ดูแค่ 5 อันดับแรก
SELECT * FROM users LIMIT 5;

-- LIMIT + OFFSET: ทำ Pagination
-- หน้า 2 (5 รายการต่อหน้า)
SELECT * FROM users LIMIT 5 OFFSET 5;
```
```sql [update-delete.sql]
-- UPDATE: แก้ไขข้อมูล
-- ⚠️ WARNING: ลืม WHERE = แก้ทั้งตาราง!

-- กรรมการให้คะแนน submission id = 1
UPDATE submissions
SET score = 87.50, status = 'scored'
WHERE id = 1;

-- แก้ไขชื่อ user
UPDATE users
SET name = 'สมชาย ใจดีมาก'
WHERE id = 1;

-- DELETE: ลบข้อมูล
-- ⚠️ WARNING: ลืม WHERE = ลบทั้งตาราง!

-- ลบ submission ที่ไม่ต้องการ
DELETE FROM submissions WHERE id = 5;

-- ลบ user ที่ไม่ได้ใช้แล้ว
DELETE FROM users WHERE username = 'test_user';
```
:::

---

### SELECT Clauses — คำสั่งกรองและจัดกลุ่ม

::: code-group
```sql [where-orderby.sql]
-- WHERE พร้อม Operators ต่างๆ

-- เปรียบเทียบ
SELECT * FROM submissions WHERE score >= 80;
SELECT * FROM submissions WHERE score BETWEEN 70 AND 90;

-- ค้นหาข้อความ (Pattern Matching)
SELECT * FROM users WHERE name LIKE 'สมชาย%'; -- ขึ้นต้นด้วย สมชาย
SELECT * FROM users WHERE country LIKE '%a';   -- ลงท้ายด้วย a

-- IN: หลายค่าพร้อมกัน
SELECT * FROM users WHERE country IN ('Thailand', 'Singapore', 'Japan');

-- IS NULL / IS NOT NULL
SELECT * FROM submissions WHERE score IS NULL;     -- ยังไม่ให้คะแนน
SELECT * FROM submissions WHERE score IS NOT NULL; -- ให้คะแนนแล้ว

-- ORDER BY หลายคอลัมน์
SELECT * FROM submissions
ORDER BY task_id ASC, score DESC;
```
```sql [groupby-having.sql]
-- GROUP BY: จัดกลุ่มและคำนวณ Aggregate

-- นับจำนวน submission ตาม status
SELECT status, COUNT(*) AS total
FROM submissions
GROUP BY status;

-- คะแนนเฉลี่ย สูงสุด ต่ำสุด ของแต่ละ task
SELECT 
  task_id,
  COUNT(*)       AS total_submissions,
  AVG(score)     AS avg_score,
  MAX(score)     AS highest_score,
  MIN(score)     AS lowest_score
FROM submissions
WHERE status = 'scored'
GROUP BY task_id;

-- HAVING: กรองหลัง GROUP BY
-- (WHERE กรองก่อน GROUP BY, HAVING กรองหลัง GROUP BY)

-- หา task ที่มีผู้ส่งงานมากกว่า 5 คน
SELECT task_id, COUNT(*) AS total
FROM submissions
GROUP BY task_id
HAVING total > 5;

-- หาประเทศที่คะแนนเฉลี่ยสูงกว่า 80
SELECT u.country, AVG(s.score) AS avg_score
FROM submissions s
JOIN users u ON s.candidate_id = u.id
WHERE s.status = 'scored'
GROUP BY u.country
HAVING avg_score > 80
ORDER BY avg_score DESC;
```
:::

---

### JOINs — การเชื่อมโยงตาราง

JOIN คือหัวใจของ Relational Database ช่วยดึงข้อมูลจากหลายตารางพร้อมกัน

```
ASCII: INNER JOIN vs LEFT JOIN

  Table A (users)       Table B (submissions)
  +-----------+         +-------------------+
  | id | name |         | id | candidate_id |
  +-----------+         +-------------------+
  |  1 | สมชาย |         |  1 |     1        |
  |  2 | สมศรี |         |  2 |     1        |
  |  3 | มานะ  |         |  3 |     3        |
  +-----------+         +-------------------+
       (มานะ ยังไม่ส่งงาน)   (สมศรี ยังไม่ส่งงาน)

  INNER JOIN: เฉพาะที่ตรงกัน
  +---------+-------+
  | name    | sub_id|
  +---------+-------+
  | สมชาย   |   1   |
  | สมชาย   |   2   |
  | มานะ    |   3   |
  +---------+-------+
  (สมศรี ไม่มีคู่ -> หายไป)

  LEFT JOIN: ทุกแถวของตารางซ้าย แม้ไม่มีคู่
  +---------+-------+
  | name    | sub_id|
  +---------+-------+
  | สมชาย   |   1   |
  | สมชาย   |   2   |
  | สมศรี   | NULL  |  <- สมศรี ยังไม่ส่งงาน แต่ยังโผล่มา
  | มานะ    |   3   |
  +---------+-------+
```

::: code-group
```sql [inner-join.sql]
-- INNER JOIN: ดึงเฉพาะข้อมูลที่มีคู่ในทั้ง 2 ตาราง

-- ดู submissions พร้อมชื่อผู้แข่งขันและชื่อ task
SELECT 
  s.id          AS submission_id,
  u.name        AS candidate_name,
  u.country,
  t.title       AS task_title,
  s.submitted_at,
  s.score,
  s.status
FROM submissions s
INNER JOIN users  u ON s.candidate_id = u.id
INNER JOIN tasks  t ON s.task_id = t.id
ORDER BY s.submitted_at DESC;
```
```sql [left-join.sql]
-- LEFT JOIN: ดึงทุกแถวจากตารางซ้าย แม้ไม่มีคู่ในตารางขวา

-- ดูผู้แข่งขันทุกคน พร้อมสถานะการส่งงาน (รวมคนที่ยังไม่ส่ง)
SELECT 
  u.id,
  u.name,
  u.country,
  COUNT(s.id)   AS total_submissions,
  AVG(s.score)  AS avg_score
FROM users u
LEFT JOIN submissions s ON u.id = s.candidate_id AND s.status = 'scored'
WHERE u.role = 'candidate'
GROUP BY u.id, u.name, u.country
ORDER BY avg_score DESC;

-- ดูว่าใครยังไม่เคยส่งงานเลย
SELECT u.name, u.country
FROM users u
LEFT JOIN submissions s ON u.id = s.candidate_id
WHERE u.role = 'candidate'
  AND s.id IS NULL;
```
:::

---

### TP2026 Queries — คำสั่ง SQL สำหรับระบบจริง

::: code-group
```sql [tp2026-queries.sql]
-- ============================================
-- WSA2026 System Queries — ใช้งานจริง
-- ============================================

-- 1. ดู submissions ทั้งหมดของ candidate คนนึง (id = 1)
SELECT 
  s.id, t.title, s.submitted_at, s.score, s.status
FROM submissions s
JOIN tasks t ON s.task_id = t.id
WHERE s.candidate_id = 1
ORDER BY s.submitted_at DESC;

-- 2. ค้นหา submissions ที่ยังไม่ได้รับการให้คะแนน (pending)
SELECT 
  s.id          AS submission_id,
  u.name        AS candidate_name,
  u.country,
  t.title       AS task_title,
  s.submitted_at
FROM submissions s
JOIN users u ON s.candidate_id = u.id
JOIN tasks t ON s.task_id = t.id
WHERE s.status = 'pending'
ORDER BY s.submitted_at ASC;  -- เรียงเวลาส่งก่อน-หลัง

-- 3. Leaderboard: อันดับผู้แข่งขัน (เรียงตามคะแนนรวม)
SELECT 
  u.id,
  u.name,
  u.country,
  u.region,
  SUM(s.score)   AS total_score,
  COUNT(s.id)    AS tasks_completed,
  AVG(s.score)   AS avg_score
FROM users u
JOIN submissions s ON u.id = s.candidate_id
WHERE u.role = 'candidate'
  AND s.status = 'scored'
GROUP BY u.id, u.name, u.country, u.region
ORDER BY total_score DESC
LIMIT 10;

-- 4. สถิติรายประเทศ
SELECT 
  u.country,
  COUNT(DISTINCT u.id)   AS total_candidates,
  COUNT(s.id)            AS total_submissions,
  ROUND(AVG(s.score), 2) AS avg_score,
  MAX(s.score)           AS best_score
FROM users u
JOIN submissions s ON u.id = s.candidate_id
WHERE u.role = 'candidate' AND s.status = 'scored'
GROUP BY u.country
ORDER BY avg_score DESC;

-- 5. ตรวจสอบว่า candidate ส่งงาน task ซ้ำหรือไม่
SELECT candidate_id, task_id, COUNT(*) AS submission_count
FROM submissions
GROUP BY candidate_id, task_id
HAVING submission_count > 1;
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เขียน SQL เพื่อดึงรายชื่อ `judge` ทั้งหมด (role = 'judge') โดยแสดงเฉพาะ `id`, `name`, `country` และเรียงตามชื่อ (name) จาก A ถึง Z

::: details 💡 คำใบ้ (Hint)
- ใช้ `SELECT` เลือกเฉพาะคอลัมน์ที่ต้องการ
- ใช้ `WHERE role = 'judge'`
- ใช้ `ORDER BY name ASC`
:::

::: details ✅ เฉลย
```sql
SELECT id, name, country
FROM users
WHERE role = 'judge'
ORDER BY name ASC;
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** เขียน SQL เพื่อหา **ผู้แข่งขันที่ส่งงานครบทุก task** (สมมติมีทั้งหมด 3 tasks) และแสดงชื่อ, ประเทศ, คะแนนรวม

::: details 💡 คำใบ้ (Hint)
- ต้องใช้ `JOIN`, `GROUP BY`, และ `HAVING`
- นับจำนวน task ที่ส่งแล้วด้วย `COUNT(DISTINCT task_id)`
- กรองด้วย `HAVING COUNT(DISTINCT task_id) = 3`
:::

::: details ✅ เฉลย
```sql
SELECT 
  u.name,
  u.country,
  SUM(s.score) AS total_score
FROM users u
JOIN submissions s ON u.id = s.candidate_id
WHERE u.role = 'candidate'
GROUP BY u.id, u.name, u.country
HAVING COUNT(DISTINCT s.task_id) = 3
ORDER BY total_score DESC;
```
:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** Primary Key และ Foreign Key ต่างกันอย่างไร ยกตัวอย่างจาก WSA2026 schema?

**แนวคำตอบ:** Primary Key (`id`) คือคอลัมน์ที่ระบุตัวตนของแถวนั้นๆ ได้อย่างไม่ซ้ำ เช่น `users.id` ระบุว่าผู้ใช้คนไหน, `tasks.id` ระบุว่า task อะไร. Foreign Key (`candidate_id`, `task_id` ใน submissions) คือการอ้างอิงไปยัง PK ของอีกตาราง เพื่อสร้างความสัมพันธ์ เช่น `submissions.candidate_id` อ้างอิงไปยัง `users.id` บอกว่า submission นี้เป็นของ user คนไหน

**คำถาม 2:** ทำไม `INNER JOIN` และ `LEFT JOIN` จึงให้ผลลัพธ์ต่างกัน ในบริบท WSA2026 ควรใช้อันไหนเมื่อไร?

**แนวคำตอบ:** `INNER JOIN` คืนเฉพาะแถวที่มีคู่ในทั้ง 2 ตาราง เหมาะสำหรับดู submissions ที่มีข้อมูล user ครบ. `LEFT JOIN` คืนทุกแถวของตารางซ้ายแม้ไม่มีคู่ เหมาะสำหรับดู candidates ทุกคนแม้ยังไม่ส่งงาน (เพื่อตรวจสอบว่าใครยังไม่ส่ง)

**คำถาม 3:** `GROUP BY` กับ `HAVING` ต่างกับ `WHERE` อย่างไร?

**แนวคำตอบ:** `WHERE` กรองแถวก่อนทำการจัดกลุ่ม (ก่อน GROUP BY). `GROUP BY` จัดกลุ่มแถวตามค่าของคอลัมน์. `HAVING` กรองกลุ่มหลังจาก GROUP BY แล้ว ใช้กับ Aggregate Functions ได้ เช่น `HAVING COUNT(*) > 5`

**คำถาม 4:** เพราะเหตุใดจึงควรใส่ `WHERE` ทุกครั้งก่อนใช้ `UPDATE` หรือ `DELETE`?

**แนวคำตอบ:** ถ้าไม่มี WHERE คำสั่ง UPDATE จะแก้ไข **ทุกแถว** ในตาราง และ DELETE จะลบ **ทุกแถว** ออกทั้งหมด ซึ่งไม่มีทางกู้คืนได้ (ยกเว้นมี Backup) ควรตรวจสอบ WHERE ทุกครั้งก่อน Execute คำสั่ง

:::

---

👉 **[ไปต่อ: 6.2 - Node.js & MySQL Integration](/node/06-02-node-mysql)**
