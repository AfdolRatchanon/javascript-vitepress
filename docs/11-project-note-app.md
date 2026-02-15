# 📝 Project 12: Note App (โปรเจกต์ — แอปบันทึก) 📝

> **Combine:** Web Storage + DOM + Async = **แอปที่เก็บข้อมูลได้จริง!**

---

## 🎯 Project Goal

สร้าง **Note-Taking App** ที่:
1. **CRUD** — สร้าง, อ่าน, แก้ไข, ลบ Note
2. **Persist** — เก็บใน `localStorage` (Refresh ไม่หาย!)
3. **Search** — ค้นหา Note
4. **Timestamp** — แสดงวันที่สร้าง/แก้ไข

---

## 📐 HTML Structure

```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📝 Note App</title>
    <link rel="stylesheet" href="note-app.css">
</head>
<body>
    <div class="app">
        <h1>📝 Note App</h1>
        <div class="toolbar">
            <input type="text" id="searchInput" placeholder="🔍 ค้นหา...">
            <button id="addBtn">➕ สร้าง Note</button>
        </div>
        <div id="notesList" class="notes-list">
            <!-- Notes will be rendered here -->
        </div>
    </div>

    <!-- Modal สำหรับเขียน/แก้ไข Note -->
    <div id="modal" class="modal" style="display:none;">
        <div class="modal-content">
            <input type="text" id="noteTitle" placeholder="หัวข้อ...">
            <textarea id="noteBody" placeholder="เนื้อหา..." rows="8"></textarea>
            <div class="modal-actions">
                <button id="saveBtn">💾 บันทึก</button>
                <button id="cancelBtn" class="secondary">ยกเลิก</button>
            </div>
        </div>
    </div>

    <script src="note-app.js"></script>
</body>
</html>
```

---

## ⚙️ Requirements

### Data Structure:
```javascript
{
    id: Date.now(),
    title: "หัวข้อ",
    body: "เนื้อหา...",
    createdAt: "2025-12-01T10:30:00",
    updatedAt: "2025-12-01T10:30:00"
}
```

### Features:
1. สร้าง Note ใหม่ (Modal popup)
2. แสดง Notes ทั้งหมด (Card layout)
3. แก้ไข Note (คลิก Edit)
4. ลบ Note (คลิก Delete + ยืนยัน)
5. ค้นหา (Filter ตาม title/body)
6. บันทึกใน `localStorage`

---

## ✅ Full Solution

::: details ✨ ดูเฉลย CSS
```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Segoe UI', sans-serif;
    background: #f0f2f5;
    padding: 20px;
}

.app { max-width: 700px; margin: 0 auto; }

h1 { text-align: center; margin-bottom: 20px; color: #333; }

.toolbar { display: flex; gap: 12px; margin-bottom: 20px; }

.toolbar input {
    flex: 1; padding: 10px 16px; border: 2px solid #ddd;
    border-radius: 8px; font-size: 1rem;
}

.toolbar button {
    padding: 10px 20px; background: #4a90d9; color: white;
    border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;
    white-space: nowrap;
}

.notes-list { display: flex; flex-direction: column; gap: 12px; }

.note-card {
    background: white; padding: 20px; border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s;
}

.note-card:hover { transform: translateY(-2px); }

.note-card h3 { margin-bottom: 8px; color: #333; }
.note-card p { color: #666; margin-bottom: 12px; white-space: pre-wrap; }
.note-card .meta { font-size: 0.8rem; color: #999; }

.note-card .actions { display: flex; gap: 8px; margin-top: 12px; }

.note-card .actions button {
    padding: 6px 14px; border: none; border-radius: 6px;
    cursor: pointer; font-size: 0.85rem;
}

.btn-edit { background: #f0ad4e; color: white; }
.btn-delete { background: #e74c3c; color: white; }

.modal {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; justify-content: center;
    align-items: center; z-index: 100;
}

.modal-content {
    background: white; padding: 30px; border-radius: 16px;
    width: 90%; max-width: 500px;
}

.modal-content input, .modal-content textarea {
    width: 100%; padding: 12px; border: 2px solid #ddd;
    border-radius: 8px; font-size: 1rem; margin-bottom: 12px;
    font-family: inherit;
}

.modal-actions { display: flex; gap: 12px; }

.modal-actions button {
    flex: 1; padding: 12px; border: none; border-radius: 8px;
    font-size: 1rem; cursor: pointer;
}

#saveBtn { background: #27ae60; color: white; }
.secondary { background: #ddd; color: #333; }

.empty { text-align: center; padding: 40px; color: #999; }
```
:::

::: details ✨ ดูเฉลย JavaScript
```javascript
// ========== State ==========
let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let editingId = null;

// ========== DOM ==========
const notesList = document.querySelector("#notesList");
const searchInput = document.querySelector("#searchInput");
const addBtn = document.querySelector("#addBtn");
const modal = document.querySelector("#modal");
const noteTitle = document.querySelector("#noteTitle");
const noteBody = document.querySelector("#noteBody");
const saveBtn = document.querySelector("#saveBtn");
const cancelBtn = document.querySelector("#cancelBtn");

// ========== Storage ==========
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// ========== Render ==========
function renderNotes(filter = "") {
    const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(filter.toLowerCase()) ||
        note.body.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        notesList.innerHTML = `<div class="empty">📭 ไม่มี Note${filter ? ` ที่ตรงกับ "${filter}"` : ""}</div>`;
        return;
    }

    notesList.innerHTML = filtered.map(note => `
        <div class="note-card" data-id="${note.id}">
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.body)}</p>
            <div class="meta">
                สร้างเมื่อ: ${formatDate(note.createdAt)}
                ${note.updatedAt !== note.createdAt ? `| แก้ไข: ${formatDate(note.updatedAt)}` : ""}
            </div>
            <div class="actions">
                <button class="btn-edit" onclick="editNote(${note.id})">✏️ แก้ไข</button>
                <button class="btn-delete" onclick="deleteNote(${note.id})">🗑️ ลบ</button>
            </div>
        </div>
    `).join("");
}

// ========== CRUD ==========
function openModal(note = null) {
    editingId = note ? note.id : null;
    noteTitle.value = note ? note.title : "";
    noteBody.value = note ? note.body : "";
    modal.style.display = "flex";
    noteTitle.focus();
}

function closeModal() {
    modal.style.display = "none";
    editingId = null;
}

function saveNote() {
    const title = noteTitle.value.trim();
    const body = noteBody.value.trim();

    if (!title) { alert("กรุณาใส่หัวข้อ!"); return; }

    const now = new Date().toISOString();

    if (editingId) {
        notes = notes.map(note =>
            note.id === editingId
                ? { ...note, title, body, updatedAt: now }
                : note
        );
    } else {
        notes.unshift({ id: Date.now(), title, body, createdAt: now, updatedAt: now });
    }

    saveNotes();
    renderNotes(searchInput.value);
    closeModal();
}

window.editNote = function(id) {
    const note = notes.find(n => n.id === id);
    if (note) openModal(note);
};

window.deleteNote = function(id) {
    if (!confirm("ลบ Note นี้?")) return;
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes(searchInput.value);
};

// ========== Helpers ==========
function formatDate(isoString) {
    return new Date(isoString).toLocaleString("th-TH", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ========== Events ==========
addBtn.addEventListener("click", () => openModal());
saveBtn.addEventListener("click", saveNote);
cancelBtn.addEventListener("click", closeModal);
searchInput.addEventListener("input", (e) => renderNotes(e.target.value));

modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// ========== Init ==========
renderNotes();
```
:::

---

## 📋 Skills Used

| Skill | ใช้ตรงไหน |
|:------|:---------|
| **localStorage** | `saveNotes()`, `loadNotes()` |
| **JSON.stringify/parse** | แปลง Notes Array ↔ String |
| **DOM Manipulation** | `renderNotes()`, Modal |
| **Events** | click, input (search) |
| **Spread Operator** | `{ ...note, title, body }` |
| **Array Methods** | `.map()`, `.filter()`, `.find()` |
| **XSS Prevention** | `escapeHtml()` |
| **Template Literals** | สร้าง HTML Cards |
