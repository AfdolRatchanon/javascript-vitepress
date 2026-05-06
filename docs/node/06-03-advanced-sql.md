# Advanced SQL & Query Optimization 🚀

> 💡 **เป้าหมาย:** ยกระดับ SQL จาก query พื้นฐานไปสู่การดึงข้อมูลเชิงสถิติด้วย Aggregate Functions, GROUP BY, HAVING, Subqueries, Multiple JOINs, CASE WHEN และ Pagination เพื่อสร้าง Leaderboard และ Statistics Dashboard สำหรับระบบ WorldSkills TP2026

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Aggregate Functions — ฟังก์ชันสรุปข้อมูล

Aggregate Functions คำนวณค่าจากหลายแถวและคืนค่าเดียว ใช้คู่กับ `GROUP BY` เพื่อสรุปข้อมูลตามหมวดหมู่

```
  TP2026 Submissions Table (ตัวอย่างข้อมูล):
  +----+-------------+---------+-------+--------+
  | id | candidate_id| task_id | score | status |
  +----+-------------+---------+-------+--------+
  |  1 |      1      |    1    | 88.0  | scored |
  |  2 |      2      |    1    | 91.5  | scored |
  |  3 |      3      |    1    |  NULL | pending|
  |  4 |      1      |    2    | 75.0  | scored |
  |  5 |      2      |    2    | 95.0  | scored |
  +----+-------------+---------+-------+--------+

  Aggregate Functions:
  +-----------+---------------------------+----------+
  | Function  | SQL                       | Result   |
  +-----------+---------------------------+----------+
  | COUNT(*)  | COUNT(*) FROM submissions |    5     |
  | COUNT(col)| COUNT(score)              |    4     | <-- NULL ไม่นับ
  | SUM(col)  | SUM(score)                |  349.5   |
  | AVG(col)  | AVG(score)                |  87.375  | <-- NULL ไม่นับ
  | MAX(col)  | MAX(score)                |  95.0    |
  | MIN(col)  | MIN(score)                |  75.0    |
  +-----------+---------------------------+----------+
```

---

### GROUP BY — จัดกลุ่มข้อมูล

`GROUP BY` รวมแถวที่มีค่าคอลัมน์เดียวกันเป็นกลุ่ม แล้ว Aggregate Function คำนวณแต่ละกลุ่ม

```
  GROUP BY country (ผ่าน JOIN users):

  ข้อมูลก่อน GROUP:          หลัง GROUP BY u.country:
  +----------+-------+       +------------+-------+----------+---------+
  | country  | score |       | country    | count | avg_score| max_score|
  +----------+-------+  -->  +------------+-------+----------+---------+
  | Thailand |  88.0 |       | Asia Pac.  |   3   |  84.83   |  91.5   |
  | Singapore|  91.5 |       | Americas   |   1   |  75.0    |  75.0   |
  | Thailand |  75.0 |       | Europe     |   0   |  NULL    |  NULL   |
  | Singapore|  95.0 |       +------------+-------+----------+---------+
  | Japan    |  NULL |
  +----------+-------+

  SQL:
  SELECT u.country,
         COUNT(s.id)            AS submission_count,
         ROUND(AVG(s.score), 2) AS avg_score,
         MAX(s.score)           AS max_score
  FROM submissions s
  JOIN users u ON s.candidate_id = u.id
  WHERE u.role = 'candidate'
  GROUP BY u.country
  ORDER BY avg_score DESC;
```

---

### HAVING — กรองหลัง GROUP BY

`WHERE` กรองแถวก่อน GROUP, `HAVING` กรอง group หลัง aggregate แล้ว

```
  WHERE vs HAVING:
  +------------------------------------------+
  |  SELECT ... FROM submissions s           |
  |  JOIN users u ON s.candidate_id = u.id   |
  |  WHERE u.role = 'candidate'    <-- กรองแถวก่อน GROUP
  |  GROUP BY u.country                      |
  |  HAVING AVG(s.score) > 80  <-- กรอง group ที่ avg > 80
  |  ORDER BY AVG(s.score) DESC;             |
  +------------------------------------------+

  ❌ HAVING แบบผิด (ใช้ WHERE แทน HAVING สำหรับ aggregate):
  WHERE AVG(s.score) > 80  --> Error!
  (WHERE ยังไม่มีผลของ AVG ตอนที่ filter)

  ✅ ถูกต้อง:
  GROUP BY u.country
  HAVING AVG(s.score) > 80
```

---

### Subqueries — Query ซ้อน Query

Subquery คือ SELECT ที่อยู่ภายใน SQL statement อื่น ใช้สำหรับ filter หรือคำนวณค่าที่ต้องการ query ก่อน

```
  ประเภท Subquery:

  1. Scalar Subquery (คืนค่าเดียว):
  +-------------------------------------------------+
  |  SELECT name, country                           |
  |  FROM users                                     |
  |  WHERE id = (                                   |
  |    SELECT candidate_id                          |
  |    FROM submissions                             |
  |    ORDER BY score DESC                          |
  |    LIMIT 1                                      |
  |  );                                             |
  |  --> ดึง candidate ที่ได้คะแนนสูงสุด           |
  +-------------------------------------------------+

  2. Correlated Subquery (อ้างถึง outer query):
  +-------------------------------------------------+
  |  SELECT u.name, u.country                       |
  |  FROM users u                                   |
  |  WHERE u.role = 'candidate'                     |
  |    AND (                                        |
  |      SELECT AVG(score)                          |
  |      FROM submissions                           |
  |      WHERE candidate_id = u.id  <-- อ้าง u.id  |
  |        AND status = 'scored'                    |
  |    ) > (SELECT AVG(score) FROM submissions      |
  |         WHERE status = 'scored')                |
  |  --> candidates ที่ avg_score สูงกว่าค่าเฉลี่ย  |
  +-------------------------------------------------+
```

---

### Multiple JOINs — 3 ตาราง

```
  3-Table JOIN: submissions JOIN users JOIN tasks

  submissions s               users u               tasks t
  +----+------+------+        +----+--------+-----+ +----+-----+-----+
  | id |cnd_id|tsk_id|        | id | name   |ctry | | id |title|score|
  +----+------+------+        +----+--------+-----+ +----+-----+-----+
  |  1 |   1  |   1  |  JOIN  |  1 |Somsak  |TH   | |  1 |Web  | 100 |
  |  2 |   2  |   1  |  ON    |  2 |Lim Wei |SG   | |  2 |Net  | 100 |
  +----+------+------+  cnd_id+----+--------+-----+ +----+-----+-----+
                         =u.id        JOIN ON tsk_id = t.id

  ผลลัพธ์:
  +----+---------+----------+-----+-------------+-------+
  | id | score   | status   |ctry | cand_name   |task   |
  +----+---------+----------+-----+-------------+-------+
  |  1 | 88.0    | scored   | TH  | Somsak Jai. | Web   |
  |  2 | 91.5    | scored   | SG  | Lim Wei Ming| Web   |
  +----+---------+----------+-----+-------------+-------+
```

---

### CASE WHEN — Conditional Logic ใน SQL

```
  CASE WHEN ใช้เพิ่ม computed column ใน SELECT:

  CASE
    WHEN score >= 90 THEN 'excellent'
    WHEN score >= 75 THEN 'good'
    WHEN score >= 60 THEN 'pass'
    ELSE 'fail'
  END AS grade

  ตัวอย่างผลลัพธ์:
  +--------+-------+-----------+
  | name   | score | grade     |
  +--------+-------+-----------+
  | Somsak |  88.0 | good      |
  | Lim    |  91.5 | excellent |
  | Tanaka |  55.0 | fail      |
  +--------+-------+-----------+
```

---

### Pagination: LIMIT + OFFSET

```
  ข้อมูล 100 แถว แบ่งหน้าละ 10:

  Page 1: LIMIT 10 OFFSET 0   --> แถว 1-10
  Page 2: LIMIT 10 OFFSET 10  --> แถว 11-20
  Page 3: LIMIT 10 OFFSET 20  --> แถว 21-30

  สูตร: OFFSET = (page - 1) * limit

  ⚠️ ข้อจำกัดของ OFFSET สำหรับข้อมูลมาก:
  LIMIT 10 OFFSET 900000
  --> MySQL ต้องอ่านและทิ้ง 900,000 แถวก่อน = ช้ามาก

  ✅ วิธีแก้: Cursor-based Pagination
  WHERE id > :last_seen_id
  ORDER BY id ASC
  LIMIT 10
  --> ใช้ Primary Key Index, เร็วกว่ามาก
```

---

### INDEX — เพิ่มความเร็ว Query

```
  ไม่มี Index (Full Table Scan):
  +----+------+------+-------+--------+
  | 1  | ... check | check | check  | --> อ่านทุกแถว
  | 2  | ... check | check | check  |
  | ...                              |
  | N  | ... check | check | found! |
  +----------------------------------+
  เวลา: O(N) — ช้าถ้า N มาก

  มี Index บน candidate_id:
  +-- B-Tree Index --+
  |  candidate_id=1  --> row pointers --> [1,4,7]
  |  candidate_id=2  --> row pointers --> [2,5]
  |  candidate_id=3  --> row pointers --> [3,6]
  +------------------+
  เวลา: O(log N) — เร็วมาก

  CREATE INDEX คำสั่ง:
  CREATE INDEX idx_submissions_candidate ON submissions(candidate_id);
  CREATE INDEX idx_submissions_status    ON submissions(status);
  CREATE INDEX idx_submissions_task      ON submissions(task_id);
  -- Composite index สำหรับ query ที่ filter หลาย column:
  CREATE INDEX idx_sub_candidate_status  ON submissions(candidate_id, status);
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

::: code-group

```sql [aggregate-queries.sql]
-- ──────────────────────────────────────────────────────────────
-- Aggregate Functions พื้นฐาน
-- ──────────────────────────────────────────────────────────────

-- นับ submissions ทั้งหมดและแยกตาม status
SELECT
  COUNT(*)                                   AS total_submissions,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN status = 'scored'  THEN 1 ELSE 0 END) AS scored_count,
  ROUND(AVG(score), 2)                       AS overall_avg,
  MAX(score)                                 AS highest_score,
  MIN(score)                                 AS lowest_score
FROM submissions;

-- ──────────────────────────────────────────────────────────────
-- GROUP BY: นับ submissions และ avg_score ต่อ country
-- ──────────────────────────────────────────────────────────────
SELECT
  u.country,
  u.region,
  COUNT(s.id)                AS submission_count,
  ROUND(AVG(s.score), 2)     AS avg_score,
  MAX(s.score)               AS best_score,
  SUM(CASE WHEN s.status = 'pending' THEN 1 ELSE 0 END) AS pending
FROM submissions s
JOIN users u ON s.candidate_id = u.id
WHERE u.role = 'candidate'
GROUP BY u.country, u.region
ORDER BY avg_score DESC;

-- ──────────────────────────────────────────────────────────────
-- GROUP BY status: สรุปตาม task
-- ──────────────────────────────────────────────────────────────
SELECT
  t.title                    AS task_title,
  COUNT(s.id)                AS total_submissions,
  SUM(s.status = 'scored')   AS scored_count,
  SUM(s.status = 'pending')  AS pending_count,
  ROUND(AVG(s.score), 2)     AS avg_score
FROM submissions s
JOIN tasks t ON s.task_id = t.id
GROUP BY t.id, t.title
ORDER BY t.title;

-- ──────────────────────────────────────────────────────────────
-- HAVING: กรองเฉพาะ task ที่มี avg_score > 80
-- (ใช้ HAVING ไม่ใช่ WHERE เพราะเป็น aggregate result)
-- ──────────────────────────────────────────────────────────────
SELECT
  t.title,
  COUNT(s.id)            AS submission_count,
  ROUND(AVG(s.score), 2) AS avg_score
FROM submissions s
JOIN tasks t  ON s.task_id     = t.id
JOIN users u  ON s.candidate_id = u.id
WHERE s.status = 'scored'
  AND u.role   = 'candidate'
GROUP BY t.id, t.title
HAVING AVG(s.score) > 80
ORDER BY avg_score DESC;
```

```sql [joins-and-subqueries.sql]
-- ──────────────────────────────────────────────────────────────
-- 3-Table JOIN: submissions + users + tasks
-- ──────────────────────────────────────────────────────────────
SELECT
  s.id                         AS submission_id,
  u.name                       AS candidate_name,
  u.country,
  u.region,
  t.title                      AS task_title,
  t.max_score,
  s.submission_url,
  s.submitted_at,
  s.score,
  s.status,
  CASE
    WHEN s.score >= 90 THEN 'excellent'
    WHEN s.score >= 75 THEN 'good'
    WHEN s.score >= 60 THEN 'pass'
    WHEN s.score IS NULL THEN 'not-scored'
    ELSE 'fail'
  END                          AS grade,
  ROUND(s.score / t.max_score * 100, 1) AS percentage
FROM submissions s
JOIN users u ON s.candidate_id = u.id
JOIN tasks t  ON s.task_id     = t.id
WHERE u.role = 'candidate'
ORDER BY s.score DESC, s.submitted_at ASC;

-- ──────────────────────────────────────────────────────────────
-- Subquery: ดึง candidates ที่ avg_score สูงกว่าค่าเฉลี่ยรวม
-- ──────────────────────────────────────────────────────────────
SELECT
  u.name,
  u.country,
  ROUND(AVG(s.score), 2) AS avg_score
FROM users u
JOIN submissions s ON s.candidate_id = u.id
WHERE u.role    = 'candidate'
  AND s.status  = 'scored'
GROUP BY u.id, u.name, u.country
HAVING AVG(s.score) > (
  -- Scalar subquery: avg ของทุก scored submissions
  SELECT AVG(score) FROM submissions WHERE status = 'scored'
)
ORDER BY avg_score DESC;

-- ──────────────────────────────────────────────────────────────
-- Subquery: candidate ที่ได้คะแนนสูงสุดใน task นั้น
-- ──────────────────────────────────────────────────────────────
SELECT
  u.name,
  u.country,
  s.score,
  t.title AS task_title
FROM submissions s
JOIN users u ON s.candidate_id = u.id
JOIN tasks t  ON s.task_id     = t.id
WHERE s.score = (
  SELECT MAX(score) FROM submissions WHERE task_id = s.task_id
)
  AND s.status = 'scored'
ORDER BY t.title;
```

```sql [leaderboard.sql]
-- ──────────────────────────────────────────────────────────────
-- Full Leaderboard Query: Top 10 candidates by total score
-- พร้อม RANK, total/avg/best score และ CASE WHEN grade
-- ──────────────────────────────────────────────────────────────
SELECT
  ROW_NUMBER() OVER (ORDER BY SUM(s.score) DESC, AVG(s.score) DESC) AS rank,
  u.name                         AS candidate_name,
  u.country,
  u.region,
  COUNT(s.id)                    AS tasks_submitted,
  ROUND(SUM(s.score), 2)         AS total_score,
  ROUND(AVG(s.score), 2)         AS avg_score,
  MAX(s.score)                   AS best_score,
  CASE
    WHEN AVG(s.score) >= 90 THEN 'excellent'
    WHEN AVG(s.score) >= 75 THEN 'good'
    WHEN AVG(s.score) >= 60 THEN 'pass'
    ELSE 'needs-improvement'
  END                            AS overall_grade
FROM submissions s
JOIN users u ON s.candidate_id = u.id
WHERE s.status   = 'scored'
  AND u.role     = 'candidate'
GROUP BY s.candidate_id, u.name, u.country, u.region
ORDER BY total_score DESC, avg_score DESC
LIMIT 10;

-- ──────────────────────────────────────────────────────────────
-- Pagination Query: Page 2, 5 items per page
-- ──────────────────────────────────────────────────────────────
-- สูตร: OFFSET = (page - 1) * limit
-- Page=2, Limit=5 --> OFFSET = (2-1)*5 = 5

SELECT
  s.id,
  u.name    AS candidate_name,
  u.country,
  t.title   AS task_title,
  s.score,
  s.status,
  s.submitted_at
FROM submissions s
JOIN users u ON s.candidate_id = u.id
JOIN tasks t  ON s.task_id     = t.id
WHERE u.role = 'candidate'
ORDER BY s.submitted_at DESC
LIMIT 5 OFFSET 5;  -- page 2

-- ──────────────────────────────────────────────────────────────
-- INDEX Definitions สำหรับ TP2026
-- รัน 1 ครั้งตอน setup database
-- ──────────────────────────────────────────────────────────────
CREATE INDEX idx_submissions_candidate ON submissions(candidate_id);
CREATE INDEX idx_submissions_task      ON submissions(task_id);
CREATE INDEX idx_submissions_status    ON submissions(status);
CREATE INDEX idx_submissions_scored_at ON submissions(submitted_at);
-- Composite: สำหรับ query ที่ filter candidate + status พร้อมกัน
CREATE INDEX idx_sub_cnd_status ON submissions(candidate_id, status);
-- users: ค้นหาบ่อยตาม role และ country
CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_country ON users(country);
```

```js [advancedQueries.js]
// advancedQueries.js
// ตัวอย่างการใช้ Advanced SQL ผ่าน Node.js mysql2/promise
require('dotenv').config();
const pool = require('./config/db');

// ──────────────────────────────────────────────────────────────
// 1. getSubmissionStats()
// สรุปสถิติ submissions ทั้งหมด
// ──────────────────────────────────────────────────────────────
async function getSubmissionStats() {
  const sql = `
    SELECT
      COUNT(*)                                            AS total,
      SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END)  AS pending,
      SUM(CASE WHEN status='scored'  THEN 1 ELSE 0 END)  AS scored,
      ROUND(AVG(score), 2)                               AS avg_score,
      MAX(score)                                         AS max_score,
      MIN(score)                                         AS min_score
    FROM submissions
  `;
  const [[stats]] = await pool.query(sql);
  return stats;
}

// ──────────────────────────────────────────────────────────────
// 2. getStatsByCountry()
// GROUP BY country — สรุปตามประเทศ
// ──────────────────────────────────────────────────────────────
async function getStatsByCountry() {
  const sql = `
    SELECT
      u.country,
      u.region,
      COUNT(s.id)            AS submission_count,
      ROUND(AVG(s.score), 2) AS avg_score,
      MAX(s.score)           AS best_score
    FROM submissions s
    JOIN users u ON s.candidate_id = u.id
    WHERE u.role = 'candidate'
    GROUP BY u.country, u.region
    ORDER BY avg_score DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

// ──────────────────────────────────────────────────────────────
// 3. getTasksWithHighAvg(minAvg)
// HAVING: เฉพาะ tasks ที่มี avg_score สูงกว่า threshold
// ──────────────────────────────────────────────────────────────
async function getTasksWithHighAvg(minAvg = 80) {
  const sql = `
    SELECT
      t.id,
      t.title,
      COUNT(s.id)            AS submission_count,
      ROUND(AVG(s.score), 2) AS avg_score
    FROM submissions s
    JOIN tasks t  ON s.task_id      = t.id
    JOIN users u  ON s.candidate_id = u.id
    WHERE s.status = 'scored'
      AND u.role   = 'candidate'
    GROUP BY t.id, t.title
    HAVING AVG(s.score) > ?
    ORDER BY avg_score DESC
  `;
  const [rows] = await pool.query(sql, [minAvg]);
  return rows;
}

// ──────────────────────────────────────────────────────────────
// 4. getLeaderboard(limit)
// Full leaderboard พร้อม rank, CASE WHEN grade
// ──────────────────────────────────────────────────────────────
async function getLeaderboard(limit = 10) {
  const sql = `
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY SUM(s.score) DESC, AVG(s.score) DESC
      )                          AS rank,
      u.name                     AS candidate_name,
      u.country,
      u.region,
      COUNT(s.id)                AS tasks_submitted,
      ROUND(SUM(s.score), 2)     AS total_score,
      ROUND(AVG(s.score), 2)     AS avg_score,
      MAX(s.score)               AS best_score,
      CASE
        WHEN AVG(s.score) >= 90 THEN 'excellent'
        WHEN AVG(s.score) >= 75 THEN 'good'
        WHEN AVG(s.score) >= 60 THEN 'pass'
        ELSE 'needs-improvement'
      END                        AS overall_grade
    FROM submissions s
    JOIN users u ON s.candidate_id = u.id
    WHERE s.status = 'scored'
      AND u.role   = 'candidate'
    GROUP BY s.candidate_id, u.name, u.country, u.region
    ORDER BY total_score DESC, avg_score DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [Math.min(limit, 50)]);
  return rows;
}

// ──────────────────────────────────────────────────────────────
// 5. getSubmissionsPaginated(page, limit)
// Pagination ด้วย LIMIT + OFFSET
// ──────────────────────────────────────────────────────────────
async function getSubmissionsPaginated(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const dataSql = `
    SELECT
      s.id,
      u.name       AS candidate_name,
      u.country,
      t.title      AS task_title,
      s.score,
      s.status,
      s.submitted_at,
      CASE
        WHEN s.score >= 90 THEN 'excellent'
        WHEN s.score >= 75 THEN 'good'
        WHEN s.score >= 60 THEN 'pass'
        WHEN s.score IS NULL THEN 'not-scored'
        ELSE 'fail'
      END           AS grade
    FROM submissions s
    JOIN users u ON s.candidate_id = u.id
    JOIN tasks t  ON s.task_id     = t.id
    WHERE u.role = 'candidate'
    ORDER BY s.submitted_at DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM submissions s
    JOIN users u ON s.candidate_id = u.id
    WHERE u.role = 'candidate'
  `;

  // รัน 2 queries พร้อมกัน
  const [[rows], [[{ total }]]] = await Promise.all([
    pool.query(dataSql, [limit, offset]),
    pool.query(countSql)
  ]);

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      has_next:    page < Math.ceil(total / limit),
      has_prev:    page > 1
    }
  };
}

// ──────────────────────────────────────────────────────────────
// 6. getAboveAverageCandidates()
// Subquery: candidates ที่ avg_score > global avg
// ──────────────────────────────────────────────────────────────
async function getAboveAverageCandidates() {
  const sql = `
    SELECT
      u.name,
      u.country,
      ROUND(AVG(s.score), 2) AS avg_score,
      COUNT(s.id)            AS tasks_scored
    FROM users u
    JOIN submissions s ON s.candidate_id = u.id
    WHERE u.role   = 'candidate'
      AND s.status = 'scored'
    GROUP BY u.id, u.name, u.country
    HAVING AVG(s.score) > (
      SELECT AVG(score) FROM submissions WHERE status = 'scored'
    )
    ORDER BY avg_score DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

// ──────────────────────────────────────────────────────────────
// Demo runner
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log('=== TP2026 Advanced SQL Demo ===\n');

  console.log('[1] Submission Stats:');
  console.log(await getSubmissionStats());

  console.log('\n[2] Stats by Country:');
  console.log(await getStatsByCountry());

  console.log('\n[3] Tasks with avg_score > 80:');
  console.log(await getTasksWithHighAvg(80));

  console.log('\n[4] Leaderboard (Top 5):');
  console.log(await getLeaderboard(5));

  console.log('\n[5] Paginated Submissions (page=1, limit=3):');
  const paged = await getSubmissionsPaginated(1, 3);
  console.log('data count:', paged.data.length);
  console.log('pagination:', paged.pagination);

  console.log('\n[6] Above-Average Candidates:');
  console.log(await getAboveAverageCandidates());

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
```

:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เขียน SQL query ที่แสดง "Task Performance Report" โดยต้องมีข้อมูล:
  - `task_title` — ชื่อ task
  - `total_submissions` — จำนวน submissions ทั้งหมด
  - `scored_count` — จำนวนที่ให้คะแนนแล้ว
  - `pending_count` — จำนวนที่ยังรอ
  - `avg_score` — เฉลี่ยคะแนน (เฉพาะที่ scored)
  - `pass_rate` — % ของ submissions ที่ score >= 60
  - กรองเฉพาะ tasks ที่มี submissions มากกว่า 0 อัน
  - เรียงตาม `pass_rate DESC`

::: details 💡 คำใบ้ (Hint)
- ใช้ `LEFT JOIN submissions s ON s.task_id = t.id` เพื่อรวม tasks ที่ไม่มี submission ด้วย
- `ROUND(AVG(CASE WHEN s.status='scored' THEN s.score END), 2)` — AVG เฉพาะ scored (NULL ถูก ignore อัตโนมัติ)
- `pass_rate` คำนวณด้วย:
  ```sql
  ROUND(
    SUM(CASE WHEN s.score >= 60 THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(CASE WHEN s.status='scored' THEN 1 END), 0),
    1
  ) AS pass_rate
  ```
- `NULLIF(x, 0)` ป้องกัน division by zero — คืน NULL แทนที่จะ error
- ใช้ `HAVING COUNT(s.id) > 0` กรอง tasks ที่มี submission
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้าง Node.js function `getDailySubmissionTrend(days = 7)` ที่:
  - นับจำนวน submissions แต่ละวันในช่วง N วันล่าสุด
  - ใช้ `DATE(submitted_at)` เพื่อ group ตามวัน
  - แสดง `date`, `total`, `scored`, `pending`, `avg_score` ต่อวัน
  - ใช้ `DATE_SUB(NOW(), INTERVAL ? DAY)` เพื่อ filter ช่วงเวลา
  - ถ้าวันใดไม่มี submissions ให้แสดง 0 (hint: ต้องสร้าง date series ก่อน หรือใช้ LEFT JOIN กับ calendar table)

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ความแตกต่างระหว่าง `WHERE` และ `HAVING` คืออะไร และเมื่อไหรควรใช้อันไหน?

**แนวคำตอบ:** `WHERE` กรองแถวแต่ละแถว **ก่อน** GROUP BY ทำงาน ดังนั้นใช้ column ปกติได้แต่ใช้ aggregate function ไม่ได้ `HAVING` กรอง **หลัง** GROUP BY ทำงานแล้ว จึงใช้ aggregate function ได้ เช่น `HAVING AVG(score) > 80` ตัวอย่าง: ต้องการ tasks ที่ avg_score > 80 ต้องใช้ `HAVING` เพราะ AVG เป็น aggregate แต่ถ้าต้องการกรองเฉพาะ submissions ที่ `status = 'scored'` ก่อน group ใช้ `WHERE`

**คำถาม 2:** `COUNT(*)` กับ `COUNT(column)` ต่างกันอย่างไร?

**แนวคำตอบ:** `COUNT(*)` นับทุกแถวรวมถึงแถวที่มีค่า NULL ในทุก column ส่วน `COUNT(column_name)` นับเฉพาะแถวที่ column นั้น **ไม่ใช่ NULL** ตัวอย่าง: ถ้ามี 5 submissions แต่มีเพียง 3 ที่ `score IS NOT NULL` แล้ว `COUNT(*)` = 5 แต่ `COUNT(score)` = 3 ใช้ `COUNT(score)` เมื่อต้องการนับเฉพาะที่มีคะแนน (ถูก scored แล้ว)

**คำถาม 3:** ทำไม `OFFSET` ขนาดใหญ่ถึงช้า และมีวิธีแก้ปัญหานี้อย่างไร?

**แนวคำตอบ:** `LIMIT 10 OFFSET 90000` ต้องให้ MySQL อ่านแถวทั้ง 90,010 แถว แล้วทิ้ง 90,000 แรกไป ซึ่ง I/O สูงมาก วิธีแก้คือ Cursor-based Pagination โดยใช้ id ของแถวสุดท้ายของหน้าก่อนหน้า เช่น `WHERE id > 90000 ORDER BY id ASC LIMIT 10` วิธีนี้ใช้ Primary Key Index โดยตรง จึงเร็วกว่ามาก แต่ข้อเสียคือไม่สามารถ jump ไปหน้าที่ต้องการโดยตรงได้

:::

---

> 👉 **ไปต่อ: [Project 6 — Submission Management API](/node/06-project-inventory-api)**
