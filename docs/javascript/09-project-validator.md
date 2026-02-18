# 📋 Project 9: Form Validator (โปรเจกต์ — ระบบตรวจสอบฟอร์ม) 📋

> **Combine:** Error Handling + DOM + Custom Errors = **ฟอร์มที่ Validate ได้อย่างมืออาชีพ!**



## 🎯 Project Goal

สร้าง **Registration Form** ที่:
1. **Validate ทุก Field** แบบ Real-time (พิมพ์ผิด → แสดง Error ทันที)
2. **Custom Error Messages** ภาษาไทย
3. **Submit** เมื่อทุก Field ถูกต้อง
4. **ใช้ Custom Error Classes**



## 📐 HTML Structure

```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📋 Form Validator</title>
    <link rel="stylesheet" href="form-validator.css">
</head>
<body>
    <div class="container">
        <h1>📋 สมัครสมาชิก</h1>
        <form id="registerForm" novalidate>
            <div class="form-group">
                <label for="username">ชื่อผู้ใช้</label>
                <input type="text" id="username" placeholder="อย่างน้อย 3 ตัวอักษร">
                <span class="error-msg" id="usernameError"></span>
            </div>
            <div class="form-group">
                <label for="email">อีเมล</label>
                <input type="email" id="email" placeholder="example@mail.com">
                <span class="error-msg" id="emailError"></span>
            </div>
            <div class="form-group">
                <label for="password">รหัสผ่าน</label>
                <input type="password" id="password" placeholder="อย่างน้อย 8 ตัวอักษร">
                <span class="error-msg" id="passwordError"></span>
            </div>
            <div class="form-group">
                <label for="confirmPassword">ยืนยันรหัสผ่าน</label>
                <input type="password" id="confirmPassword" placeholder="พิมพ์รหัสผ่านอีกครั้ง">
                <span class="error-msg" id="confirmPasswordError"></span>
            </div>
            <button type="submit" id="submitBtn">สมัครสมาชิก</button>
        </form>
        <div id="successMsg" class="success-msg" style="display:none;">
            ✅ สมัครสมาชิกสำเร็จ!
        </div>
    </div>
    <script src="form-validator.js"></script>
</body>
</html>
```



## ⚙️ Requirements

### Validation Rules:

| Field | Rules |
|:------|:------|
| **Username** | ต้องมีอย่างน้อย 3 ตัวอักษร, ไม่เกิน 20, ได้เฉพาะ a-z, 0-9, _ |
| **Email** | ต้องมี @ และ `.` format ถูกต้อง |
| **Password** | อย่างน้อย 8 ตัว, มีตัวเลข, มีตัวพิมพ์ใหญ่ |
| **Confirm** | ต้องตรงกับ Password |

### Features:
1. **Real-time Validation** — ใช้ `input` event
2. **Custom ValidationError** — extends Error
3. **Visual Feedback** — Input สีแดง/เขียว
4. **Submit Guard** — ถ้ามี Error → ห้าม Submit



## ✅ Full Solution

::: details ✨ ดูเฉลย CSS
```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Segoe UI', sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1e3c72, #2a5298);
}

.container {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 420px;
}

h1 { text-align: center; margin-bottom: 24px; color: #333; }

.form-group { margin-bottom: 20px; }

label { display: block; margin-bottom: 6px; font-weight: 600; color: #555; }

input {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

input:focus { outline: none; border-color: #4a90d9; }
input.valid { border-color: #27ae60; }
input.invalid { border-color: #e74c3c; }

.error-msg { display: block; color: #e74c3c; font-size: 0.85rem; margin-top: 4px; min-height: 20px; }

button {
    width: 100%;
    padding: 14px;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s;
}

button:hover { background: #357abd; }
button:disabled { background: #aaa; cursor: not-allowed; }

.success-msg {
    text-align: center;
    padding: 20px;
    background: #d4edda;
    color: #155724;
    border-radius: 8px;
    margin-top: 16px;
    font-size: 1.1rem;
}
```
:::

::: details ✨ ดูเฉลย JavaScript
```javascript
// ========== Custom Error ==========
class ValidationError extends Error {
    constructor(field, message) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

// ========== Validators ==========
function validateUsername(value) {
    if (value.length < 3) throw new ValidationError("username", "ต้องมีอย่างน้อย 3 ตัวอักษร");
    if (value.length > 20) throw new ValidationError("username", "ต้องไม่เกิน 20 ตัวอักษร");
    if (!/^[a-zA-Z0-9_]+$/.test(value)) throw new ValidationError("username", "ใช้ได้เฉพาะ a-z, 0-9, _");
    return true;
}

function validateEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) throw new ValidationError("email", "รูปแบบอีเมลไม่ถูกต้อง");
    return true;
}

function validatePassword(value) {
    if (value.length < 8) throw new ValidationError("password", "ต้องมีอย่างน้อย 8 ตัวอักษร");
    if (!/[0-9]/.test(value)) throw new ValidationError("password", "ต้องมีตัวเลขอย่างน้อย 1 ตัว");
    if (!/[A-Z]/.test(value)) throw new ValidationError("password", "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว");
    return true;
}

function validateConfirmPassword(value, password) {
    if (value !== password) throw new ValidationError("confirmPassword", "รหัสผ่านไม่ตรงกัน");
    return true;
}

// ========== DOM ==========
const form = document.querySelector("#registerForm");
const fields = {
    username: document.querySelector("#username"),
    email: document.querySelector("#email"),
    password: document.querySelector("#password"),
    confirmPassword: document.querySelector("#confirmPassword"),
};

function showError(fieldName, message) {
    document.querySelector(`#${fieldName}Error`).textContent = message;
    fields[fieldName].classList.remove("valid");
    fields[fieldName].classList.add("invalid");
}

function showValid(fieldName) {
    document.querySelector(`#${fieldName}Error`).textContent = "";
    fields[fieldName].classList.remove("invalid");
    fields[fieldName].classList.add("valid");
}

function validateField(fieldName) {
    const value = fields[fieldName].value;
    try {
        switch (fieldName) {
            case "username": validateUsername(value); break;
            case "email": validateEmail(value); break;
            case "password": validatePassword(value); break;
            case "confirmPassword": validateConfirmPassword(value, fields.password.value); break;
        }
        showValid(fieldName);
        return true;
    } catch (error) {
        if (error instanceof ValidationError) {
            showError(fieldName, error.message);
        }
        return false;
    }
}

// ========== Events ==========
Object.keys(fields).forEach(fieldName => {
    fields[fieldName].addEventListener("input", () => validateField(fieldName));
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const allValid = Object.keys(fields).every(name => validateField(name));

    if (allValid) {
        form.style.display = "none";
        document.querySelector("#successMsg").style.display = "block";
    }
});
```
:::



## 📋 Skills Used

| Skill | ใช้ตรงไหน |
|:------|:---------|
| **Custom Error** | `ValidationError extends Error` |
| **try/catch** | `validateField()` |
| **throw** | Validators ทุกตัว |
| **instanceof** | ตรวจว่าเป็น `ValidationError` |
| **DOM Events** | `input`, `submit` |
| **classList** | `.valid`, `.invalid` |
| **Guard Clause** | ตรวจก่อน Submit |


👉 **[ไปต่อ: Module 10 - ES Modules](/javascript/10-01-es-modules)**
