# 10.1 File Upload with Multer

> *"A picture is worth a thousand words."* — **But a 10MB picture is 10 million bytes!**

การอัปโหลดไฟล์เป็นฟีเจอร์พื้นฐานที่เกือบทุก Web App ต้องมี
- เปลี่ยนรูปโปรไฟล์
- ส่งสลิปโอนเงิน
- อัปโหลดเอกสารสมัครงาน

แต่ใน Node.js (Express) นั้น มันอ่าน **Form Data (multipart/form-data)** แบบปกติไม่ออกครับ! (อ่านได้แต่ JSON / Text)
เราจึงต้องมีตัวช่วย และพระเอกของเราตือ **Multer** ครับ 📤

---

## 🛠️ Setup Multer

Multer เป็น Middleware ที่ไว้จัดการ `multipart/form-data` โดยเฉพาะ

```bash
npm install multer
```

### 1. Basic Configuration
เราต้องบอก Multer ว่าจะให้ **เก็บไฟล์ไว้ที่ไหน (Destination)** และ **ตั้งชื่อว่าอะไร (Filename)**

```javascript
/* middleware/upload.js */
const multer = require('multer');
const path = require('path');

// กำหนด Storage Engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // เก็บไว้ในโฟลเดอร์ uploads/ (ต้องสร้างโฟลเดอร์นี้รอไว้ด้วยนะ!)
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ใหม่: fieldname-วันที่-เลขสุ่ม.นามสกุลเดิม
    // เช่น: profile-16890...45-123.jpg (เพื่อไม่ให้ชื่อซ้ำกัน)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // ดึงนามสกุล (.jpg)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
```

---

## 💻 Uploading Files

### 1. Single File Upload (รูปเดียว)

```javascript
/* routes/user.js */
const upload = require('../middleware/upload');

// 'avatar' คือชื่อ field ใน form data (<input type="file" name="avatar">)
app.post('/profile', upload.single('avatar'), (req, res) => {
  // ถ้าเข้ามาถึงตรงนี้คืออัปโหลดสำเร็จแล้ว
  // ข้อมูลไฟล์อยู่ที่ req.file
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // สิ่งที่เราต้องทำต่อ: เก็บ "Path ของรูป" ลง Database (ไม่ใช่เก็บรูป!)
  // const filePath = req.file.path; -> save to DB
  
  res.json({
    message: 'File uploaded successfully',
    fileInfo: req.file
  });
});
```

### 2. Multiple Files (หลายรูป)

```javascript
// อัปโหลดได้สูงสุด 5 รูป (field ชื่อ 'photos')
app.post('/photos', upload.array('photos', 5), (req, res) => {
  // ข้อมูลไฟล์อยู่ที่ req.files (มี s)
  res.json({ count: req.files.length });
});
```

---

## 🛡️ Validation & Security

การเปิดให้ใครก็ได้อัปโหลดไฟล์ขึ้น Server เป็นความเสี่ยงระดับชาติ! 🚨
Hacker อาจอัปโหลด:
- ไฟล์ `.exe` หรือ `.js` มาสั่งรันคำสั่งอันตราย (Web Shell)
- ไฟล์ขนาด 10GB มาถล่ม Server จนเต็ม (DoS)

เราต้องป้องกันครับ!

### 1. Filter File Type (อนุญาตเฉพาะรูป)

```javascript
const fileFilter = (req, file, cb) => {
  // ตรวจสอบ Mime Type
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // ✅ ผ่าน
  } else {
    cb(new Error('Only JPEG and PNG images are allowed!'), false); // ❌ ไม่ผ่าน
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // จำกัดขนาดไม่เกิน 5 MB
  }
});
```

### 2. Handling Errors

Multer จะโยน Error ถ้าไฟล์เกินขนาด หรือผิดประเภท
เราต้องมี Error Handling Middleware ใน Express มาดักจับ

```javascript
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error จาก Multer (เช่น ไฟล์เกินขนาด)
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Error ทั่วไป (ที่เรา throw new Error เองใน fileFilter)
    return res.status(400).json({ error: err.message });
  }
  next();
});
```

---

## 🖼️ Serving Static Files

อัปโหลดเสร็จแล้ว ไฟล์ไปอยู่ในโฟลเดอร์ `uploads/`
แต่ถ้า User จะขอดูรูป (`<img src="...">`) Browser เข้าถึงโฟลเดอร์นี้ไม่ได้นะครับ เป็น Private
เราต้องเปิด Public ให้โฟลเดอร์นี้เข้าถึงได้

```javascript
/* app.js */
const path = require('path');

// บอก Express ว่า "ถ้าใครขอไฟล์ path /uploads ให้ไปหาในโฟลเดอร์ uploads จริงๆ นะ"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

ตอนนี้เราก็เข้าถึงรูปได้แล้ว: `http://localhost:3000/uploads/profile-123.jpg` 🎉

---

## 🥊 Challenges

### Level 1: Profile Validation
จงแก้ไข config ของ multer เพื่อให้:
1.  รับเฉพาะไฟล์ที่มีนามสกุล `.jpg`, `.jpeg`, `.png`, `.gif` เท่านั้น
2.  ขนาดไฟล์ห้ามเกิน 2 MB
3.  ถ้าอัพโหลดไฟล์ผิดประเภท ให้ตอบกลับด้วย JSON: `{ msg: "Invalid file type" }`

::: details ✨ เฉลย
```javascript
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    // เช็คทั้งนามสกุลและ mimetype
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// ใน Route
app.post('/upload', (req, res) => {
    upload.single('img')(req, res, (err) => { // เรียก middleware แบบ manual
        if(err) return res.status(400).json({ msg: err.message });
        res.send('Success');
    })
})
```
:::

---

## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Multipart/form-data** | รูปแบบการส่งข้อมูล HTTP สำหรับการอัปโหลดไฟล์ (เป็น Binary ไม่ใช่ Text) |
| **Middleware** | ตัวกลางจัดการ Request (Multer เป็น Middleware ที่แปลง Multipart ให้เป็น req.file) |
| **Mime Type** | ชนิดของไฟล์ที่ Browser บอก Server (เช่น `image/jpeg`, `application/pdf`) |
| **Static Files** | ไฟล์ที่ไม่เปลี่ยนแปลง (รูป, CSS, JS) ที่เราต้องเปิดสิทธิ์ (`express.static`) ให้คนนอกเข้าถึง |
| **Storage Engine** | ตัวกำหนดว่าจะเก็บไฟล์ไว้ที่ไหน (DiskStorage = เก็บใน Harddisk, MemoryStorage = เก็บใน RAM) |

---

## 🔗 References

- [Multer Documentation](https://github.com/expressjs/multer) - คู่มือหลัก (ละเอียดมาก)
- [MDN: input type="file"](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file) - ฝั่ง Frontend Tag
- [Express Static Files](https://expressjs.com/en/starter/static-files.html) - การเสิร์ฟไฟล์ Static

---

> 👉 **ไปต่อ: [Input Validation](/node/10-02-input-validation)**
