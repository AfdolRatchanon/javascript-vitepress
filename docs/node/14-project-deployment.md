# 🚢 Project 14: Deployment Lab

ถึงเวลาปล่อยของ! 🚀
เราจะจำลองการ Deploy เว็บขึ้น Cloud Server (VPS) จริงๆ
(หรือถ้าไม่มี VPS ให้ลอง Deploy ลง **Render.com** หรือ **Railway.app** ที่ฟรีและง่ายกว่า)

> **Goal**: ทำให้คนทั้งโลกเข้าเว็บเราได้ ผ่าน URL จริง


## ✅ Pre-Deployment Checklist

ก่อนเอาขึ้น Production ต้องเช็คให้ชัวร์:

1.  **Environment Variables**: ห้าม Hardcode ความลับ! ใช้ `process.env` ให้หมด
2.  **Logs**: เอา `console.log` ที่รกๆ ออก หรือใช้ Logger Library (Winston)
3.  **Security**:
    - ติด Helmet (Module 10)
    - ปิด Stack Trace (`NODE_ENV=production`)
4.  **Database**: ต้องใช้ Database ของจริง (เช่น MongoDB Atlas หรือ AWS RDS) ไม่ใช่ Localhost


## 🛣️ Option 1: PaaS (Render / Railway / Vercel)

วิธีนี้ง่ายสุด เหมาะกับมือใหม่ ไม่ต้องดูแล Server เอง

1.  Push Code ขึ้น **GitHub**
2.  สมัครสมาชิก [Render.com](https://render.com)
3.  กด **New Web Service** -> เชื่อมต่อ GitHub Repo
4.  ตั้งค่า:
    - **Build Command**: `npm install`
    - **Start Command**: `node app.js`
    - **Environment Variables**: ใส่ค่า `.env` ตรงนี้
5.  กด Deploy -> รอรับ URL ได้เลย! 🎉


## 🛣️ Option 2: VPS (DigitalOcean / AWS EC2) - The Hard Way 💪

เราจะได้เครื่อง Linux เปล่าๆ มา 1 เครื่อง (Ubuntu)

### 1. SSH เข้าเครื่อง
```bash
ssh root@123.45.67.89
```

### 2. ติดตั้ง Node.js & Git
```bash
# (คำสั่งอาจต่างกันตาม OS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### 3. Clone Repo
```bash
git clone https://github.com/username/my-api.git
cd my-api
npm install --production
```

### 4. Setup PM2
```bash
npm install pm2 -g
pm2 start app.js --name "api"
pm2 startup
pm2 save
```

### 5. Setup Nginx (Reverse Proxy)
เราต้องใช้ Nginx เพื่อรับ Port 80 (Web) แล้วส่งต่อให้ Port 3000 (Node)
และทำ HTTPS (SSL)

```bash
apt install nginx
# ... config nginx ...
```
*(ขั้นตอนนี้ค่อนข้าง Advance ถ้าสนใจแนะนำหาอ่านเรื่อง Nginx Config เพิ่มเติมครับ)*


## 🧩 Challenge: CI/CD Pipeline
ลองศึกษา **GitHub Actions**
เพื่อให้ทุกครั้งที่เราพุชโค้ด (`git push`)
ระบบจะรัน Test อัตโนมัติ (`npm test`)
และถ้า Test ผ่าน -> Deploy ขึ้น Server ให้อัตโนมัติ! 😎


> 👉 **ไปต่อ: [Module 15: Capstone Project](/node/15-01-capstone)**
