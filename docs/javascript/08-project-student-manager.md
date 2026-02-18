# 👨‍🎓 Project 9: Student Manager (โปรเจกต์ — ระบบจัดการนักศึกษา) 👨‍🎓

> **บทนี้จะ Combine ทุกอย่างที่เรียนใน Module 8:**
> Destructuring + Spread/Rest + Modules = **ระบบจัดการข้อมูลแบบ Modern!**



## 🎯 Project Goal (เป้าหมาย)

สร้าง **Student Manager** ในรูปแบบ Console App ที่ใช้ ES6+ Features:
1. **เพิ่มนักศึกษา** — ใช้ Spread เพิ่มข้อมูลแบบ Immutable
2. **ค้นหานักศึกษา** — ใช้ Destructuring แกะข้อมูล
3. **อัปเดตข้อมูล** — ใช้ Spread อัปเดตแบบไม่แก้ต้นฉบับ
4. **ลบนักศึกษา** — ใช้ Rest ลบ Property
5. **แบ่งโค้ดเป็น Modules** — แยกไฟล์ตาม Responsibility



## 📁 โครงสร้างไฟล์

```
student-manager/
├── index.html
├── app.js           # Main entry point
├── student.js       # Student operations (CRUD)
├── utils.js         # Helper functions
└── data.js          # Sample data
```



## ⚙️ Requirements

### 📁 `data.js` — ข้อมูลตัวอย่าง

```javascript
export const sampleStudents = [
    { id: 1, name: "Dolar", major: "CS", gpa: 3.8, skills: ["JS", "Python"] },
    { id: 2, name: "Somchai", major: "IT", gpa: 3.2, skills: ["Java", "SQL"] },
    { id: 3, name: "Malee", major: "CS", gpa: 3.95, skills: ["React", "Node"] },
];
```

### 📁 `utils.js` — Helper Functions

Export:
- `generateId()` — สร้าง ID ใหม่ (ใช้ `Date.now()`)
- `formatStudent({ name, major, gpa })` — return string "|ชื่อ|สาขา|GPA|"

### 📁 `student.js` — CRUD Operations

Export:
- `addStudent(students, newStudent)` — return Array ใหม่ (Spread)
- `findStudent(students, id)` — return Student object (Destructuring)
- `updateStudent(students, id, updates)` — return Array ใหม่ (Spread + Map)
- `removeStudent(students, id)` — return Array ใหม่ (Filter)
- `getStudentsByMajor(students, major)` — return filtered Array

### 📁 `app.js` — Main

Import ทุกอย่างมาใช้ แล้วทดสอบ CRUD operations



## ✅ Full Solution

::: details ✨ ดูเฉลย `data.js`
```javascript
export const sampleStudents = [
    { id: 1, name: "Dolar", major: "CS", gpa: 3.8, skills: ["JS", "Python"] },
    { id: 2, name: "Somchai", major: "IT", gpa: 3.2, skills: ["Java", "SQL"] },
    { id: 3, name: "Malee", major: "CS", gpa: 3.95, skills: ["React", "Node"] },
];
```
:::

::: details ✨ ดูเฉลย `utils.js`
```javascript
export function generateId() {
    return Date.now();
}

export function formatStudent({ name, major, gpa }) {
    return `| ${name} | ${major} | GPA: ${gpa} |`;
}

export function calculateAverageGpa(students) {
    const total = students.reduce((sum, { gpa }) => sum + gpa, 0);
    return (total / students.length).toFixed(2);
}
```
:::

::: details ✨ ดูเฉลย `student.js`
```javascript
import { generateId } from "./utils.js";

// เพิ่ม — ใช้ Spread
export function addStudent(students, { name, major, gpa, skills = [] }) {
    const newStudent = {
        id: generateId(),
        name,
        major,
        gpa,
        skills: [...skills],
    };
    return [...students, newStudent];
}

// ค้นหา — Destructuring
export function findStudent(students, id) {
    const student = students.find(s => s.id === id);
    if (!student) return null;

    const { name, major, gpa, ...rest } = student;
    return { name, major, gpa, ...rest };
}

// อัปเดต — Spread + Map
export function updateStudent(students, id, updates) {
    return students.map(student =>
        student.id === id
            ? { ...student, ...updates }
            : student
    );
}

// ลบ — Filter
export function removeStudent(students, id) {
    return students.filter(student => student.id !== id);
}

// กรองตามสาขา
export function getStudentsByMajor(students, major) {
    return students.filter(student => student.major === major);
}

// เพิ่ม Skill
export function addSkill(students, id, ...newSkills) {
    return students.map(student =>
        student.id === id
            ? { ...student, skills: [...student.skills, ...newSkills] }
            : student
    );
}
```
:::

::: details ✨ ดูเฉลย `app.js`
```javascript
import { sampleStudents } from "./data.js";
import { addStudent, findStudent, updateStudent, removeStudent, getStudentsByMajor, addSkill } from "./student.js";
import { formatStudent, calculateAverageGpa } from "./utils.js";

// เริ่มต้นจาก sample data
let students = [...sampleStudents];

// 1. แสดงข้อมูลทั้งหมด
console.log("=== All Students ===");
students.forEach(s => console.log(formatStudent(s)));

// 2. เพิ่มนักศึกษาใหม่
students = addStudent(students, {
    name: "Napat",
    major: "CS",
    gpa: 3.5,
    skills: ["TypeScript", "React"],
});
console.log("\n=== After Adding Napat ===");
console.log(`Total: ${students.length} students`);

// 3. ค้นหา
const found = findStudent(students, 1);
console.log("\n=== Find ID 1 ===");
console.log(found); // Dolar

// 4. อัปเดต GPA
students = updateStudent(students, 2, { gpa: 3.5 });
console.log("\n=== After Update Somchai GPA ===");
console.log(formatStudent(findStudent(students, 2)));

// 5. กรองตามสาขา
const csStudents = getStudentsByMajor(students, "CS");
console.log("\n=== CS Students ===");
csStudents.forEach(s => console.log(formatStudent(s)));
console.log(`Average GPA: ${calculateAverageGpa(csStudents)}`);

// 6. เพิ่ม Skill
students = addSkill(students, 1, "Docker", "AWS");
console.log("\n=== Dolar's Skills ===");
console.log(findStudent(students, 1).skills);

// 7. ลบนักศึกษา
students = removeStudent(students, 3);
console.log("\n=== After Removing Malee ===");
console.log(`Total: ${students.length} students`);
```
:::



## 📋 Skills Used

| Skill | ใช้ตรงไหน |
|:------|:---------|
| **Destructuring** | แกะ `{ name, major, gpa }` ใน Parameter + formatStudent |
| **Spread (Array)** | `[...students, newStudent]` เพิ่มข้อมูลแบบ Immutable |
| **Spread (Object)** | `{ ...student, ...updates }` อัปเดตแบบไม่แก้ต้นฉบับ |
| **Rest Parameters** | `...newSkills` รับ Skills จำนวนไม่จำกัด |
| **Named Export** | `export function` ทุกไฟล์ |
| **Import** | `import { x } from "./file.js"` |
| **Array Methods** | `.map()`, `.filter()`, `.find()`, `.reduce()` |
