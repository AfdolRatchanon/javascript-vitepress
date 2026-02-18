# Module 9.2: Cloud Storage Integration (Cloudinary) ☁️

> *"There is no cloud, it's just someone else's computer."* — **But it's a very reliable computer!**

การเก็บไฟล์ในเครื่อง Server (Local Disk) แบบบทที่แล้ว มีข้อเสียคือ:
1.  **พื้นที่เต็ม**: Harddisk มีจำกัด
2.  **หายง่าย**: ถ้า Server พัง รูปหายหมด
3.  **ช้า**: ต้องโหลดจาก Server เราโดยตรง (ไม่มี CDN)

วิธีแก้คือฝากไฟล์ไว้ที่ **Cloud Storage** เช่น **AWS S3**, **Google Cloud Storage** หรือ **Cloudinary** (เหมาะกับรูปภาพมาก)

ในบทนี้เราจะมาลองใช้ **Cloudinary** กันครับ (เพราะมี Free Tier ที่ดีงาม!) 🌟


## 🛠️ Setup Cloudinary

### 1. Register & Get Keys
สมัครสมาชิกที่ [cloudinary.com](https://cloudinary.com/) แล้วไปที่ Dashboard เพื่อเอาค่า:
- `Cloud Name`
- `API Key`
- `API Secret`

### 2. Install Packages
เราต้องใช้ `cloudinary` และ `multer-storage-cloudinary` (เพื่อเชื่อม Multer เข้ากับ Cloudinary)

```bash
npm install cloudinary multer-storage-cloudinary
```

### 3. Config Code

```javascript
/* middleware/uploadCloud.js */
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Config Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'node-course-uploads', // ชื่อโฟลเดอร์ใน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // นามสกุลที่อนุญาต
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // ย่อรูปให้อัตโนมัติ (Optional)
  },
});

const uploadCloud = multer({ storage: storage });

module.exports = uploadCloud;
```


## 💻 Uploading to Cloud

การใช้งานเหมือน Multer ปกติเป๊ะ! แค่เปลี่ยน middleware

```javascript
/* routes/userRoutes.js */
const uploadCloud = require('../middleware/uploadCloud');

router.post('/profile-cloud', uploadCloud.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // สิ่งที่ได้กลับมาเปลี่ยนไป!
  res.json({
    message: 'Uploaded to Cloud successfully',
    url: req.file.path,       // 🔥 นี่คือ URL จาก Cloudinary (https://res.cloudinary.com/...)
    filename: req.file.filename
  });
});
```

**ข้อดีของการใช้ Cloudinary:**
1.  ได้ HTTPS URL ทันที
2.  รูปถูก Optimize ให้โหลดเร็วขึ้น
3.  สามารถใส่ Transformation (ย่อ/ตัด/ใส่ filter) ได้ง่ายๆ ผ่าน URL


## 🏗️ Architecture Idea: Hybrid Storage

ในระบบผลิตจริง เรามักจะ:
1.  **Frontend** ส่งรูป -> **Backend**
2.  **Backend** ส่งต่อ -> **Cloud Storage** (S3/Cloudinary)
3.  **Cloud** ส่ง URL กลับมา -> **Backend**
4.  **Backend** เก็บ URL ลง **Database** (MongoDB/MySQL)

User จะเห็นรูปผ่าน URL ของ Cloud (ลดภาระ Server เรา) 🚀


## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Cloud Storage** | บริการพื้นที่เก็บไฟล์บนอินเทอร์เน็ต (S3, Cloudinary) |
| **CDN (Content Delivery Network)** | ระบบกระจายไฟล์ไปทั่วโลก ให้ User โหลดจาก Server ที่ใกล้ที่สุด (เร็วขึ้น) |
| **SDK (Software Development Kit)** | ชุดเครื่องมือที่ผู้ให้บริการเตรียมไว้ให้เราเขียนโค้ดเชื่อมต่อได้ง่ายๆ |


> 👉 **ไปต่อ: [Project: Gallery API](/node/09-project-gallery-api)**
