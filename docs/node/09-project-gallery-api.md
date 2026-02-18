# 📤 Project 9: User Profile & Gallery API

เราจะสร้าง API สำหรับอัปโหลดรูปโปรไฟล์ (Avatar) 🖼️
โดยจะรวมพลังของ **Multer** (รับไฟล์) และ **Express-Validator** (ตรวจข้อมูล) เข้าด้วยกัน

> **Pre-requisites**:
> - สร้างโฟลเดอร์ `uploads/` รอไว้ในโปรเจกต์ (ถ้าใช้ Disk Storage)


## 🎯 เป้าหมาย (Goal)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/upload` | อัปโหลดรูปภาพ (จำกัดเฉพาะ png/jpg, < 2MB) |
| `GET` | `/images/:filename` | ดูรูปที่อัปโหลดไปแล้ว |


## 🛠️ Step 1: Middleware Setup (`middleware/upload.js`)

แยก Logic การอัปโหลดออกมาเพื่อให้โค้ดสะอาด

```javascript
const multer = require('multer');
const path = require('path');

// 1. Config Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // เก็บที่ไหน
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์: fieldname-timestamp.นามสกุลเดิม
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Config Filter
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only! (jpeg, jpg, png, gif)'));
    }
};

// 3. Export Multer Instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
    fileFilter: fileFilter
});

module.exports = upload;
```


## 🛠️ Step 2: Implement Server (`index.js`)

```javascript
const express = require('express');
const upload = require('./middleware/upload'); // Import ที่เราเขียนตะกี้
const fs = require('fs');

const app = express();

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

// เปิดให้เข้าถึงไฟล์ใน folder uploads ได้ผ่าน URL (Static Files)
// เช่น http://localhost:3000/uploads/avatar-123.jpg
app.use('/uploads', express.static('uploads'));

// --- ROUTES ---

// 1. Upload Endpoint
// 'avatar' คือชื่อ key ที่ต้องส่งมาใน form-data
app.post('/upload', upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }
        
        // ส่ง URL ไฟล์กลับไปให้ User
        res.json({
            message: 'File uploaded successfully',
            imageUrl: `http://localhost:3000/uploads/${req.file.filename}`
        });
        
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Error Handling (ดัก error จาก Multer)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Error จาก Multer (เช่น ไฟล์ใหญ่ไป)
        return res.status(400).json({ error: err.message });
    } else if (err) {
        // Error อื่นๆ (เช่น นามสกุลผิด)
        return res.status(400).json({ error: err.message });
    }
    next();
});

app.listen(3000, () => console.log('Server running on port 3000'));
```


## 🧪 Testing with Postman

1.  เลือก Method **POST** `http://localhost:3000/upload`
2.  ไปที่ Tab **Body** -> เลือก **form-data**
3.  ใส่ Key: `avatar` ชนิด **File**
4.  เลือกไฟล์รูปภาพจากเครื่อง
5.  กด Send ✅
6.  ลองเลือกไฟล์ .pdf หรือไฟล์ใหญ่ๆ ดู ❌ (ต้องติด Error)


## 🧩 Challenge: Multiple Uploads

ลองเปลี่ยนจาก `upload.single('avatar')` เป็น `upload.array('photos', 5)` (รับได้สูงสุด 5 รูป)
แล้วแก้โค้ดให้ loop `req.files` (มี s) เพื่อคืนค่า URL ของทุกรูปกลับไป

**Hint**: `req.files.map(...)`


> 👉 **บทต่อไป: [Module 10: Validation, Errors & Security](/node/10-01-input-validation)**
