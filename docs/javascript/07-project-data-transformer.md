# 👨‍🎓 Project 7: Data Transformer

> **"Data is messy. Your code shouldn't be."**
> — *Modern JavaScript Philosophy*

ใน Module 7 เราได้เรียนรู้ฟีเจอร์เทพๆ ของ ES6+ ไปแล้ว ทั้ง **Destructuring**, **Spread/Rest**, และ **Iterators/Generators**
โปรเจกต์นี้เราจะมารวมพลังฟีเจอร์เหล่านี้เพื่อสร้าง **"Data Transformer Pipeline"**

โจทย์คือ: เราได้รับข้อมูล Transaction การซื้อขายจำนวนมหาศาล (สมมติ) และต้องการแปลงข้อมูลเพื่อนำไปทำ Report โดยต้องเขียนโค้ดให้สั้น กระชับ และประหยัด Memory ที่สุด!

---

## 🎯 Objective (เป้าหมาย)

เราจะสร้างไฟล์ `transformer.js` ที่:
1.  ใช้ **Generator** เพื่อจำลองการอ่านข้อมูลทีละบรรทัด (ประหยัด Memory)
2.  ใช้ **Destructuring** เพื่อดึงเฉพาะข้อมูลที่ต้องการ
3.  ใช้ **Rest/Spread** เพื่อจัดกลุ่มข้อมูลใหม่
4.  คำนวณยอดรวมรายหมวดหมู่

---

## 🛠️ Step-by-Step Implementation

### Step 1: Mock Data Generator 🎰

สมมติว่าเรามีข้อมูลเป็นหมื่นๆ แถว แทนที่เราจะประกาศ Array ขนาดยักษ์ เราจะสร้าง **Generator** ขึ้นมาพ่นข้อมูลออกมาทีละก้อนแทน (จำลองการอ่านไฟล์ขนาดใหญ่)

```javascript
// transformer.js

// จำลองข้อมูลดิบ
const RAW_DATA = [
    { id: 101, date: "2025-01-01", item: "Mouse", price: 500, category: "Electronics", user: "Alice" },
    { id: 102, date: "2025-01-02", item: "Keyboard", price: 1500, category: "Electronics", user: "Bob" },
    { id: 103, date: "2025-01-03", item: "Coffee", price: 100, category: "Food", user: "Alice" },
    { id: 104, date: "2025-01-04", item: "Monitor", price: 5000, category: "Electronics", user: "Charlie" },
    // ... ลองคิดภาพว่ามีอีกแสนบรรทัด
];

// Generator function ที่จะ "yield" ข้อมูลทีละตัว
function* dataStream() {
    for (const record of RAW_DATA) {
        yield record;
    }
}
```

### Step 2: processTransaction (Transformation Logic) 🥨

ฟังก์ชันนี้จะรับ Object ข้อมูลดิบเข้ามา แล้ว "แปลงร่าง" ให้เป็นรูปแบบที่ต้องการใช้ทำ Report โดยใช้ **Destructuring**

```javascript
// รับ object เข้ามา แล้วดึง property ออกมาใช้เลย (Destructuring in Parameter)
function processTransaction({ item, price, category, ...metadata }) {
    // metadata จะเก็บ property ที่เหลือ (id, date, user) ไว้ใน object เดียว (Rest Props)
    
    // แปลงข้อมูล: เพิ่ม VAT 7%
    const finalPrice = price * 1.07;
    
    // คืนค่าในรูปแบบใหม่
    return {
        item,
        category,
        netPrice: finalPrice,
        rawPrice: price, // เก็บราคาเดิมไว้ด้วย
        ...metadata // กระจาย metadata กลับเข้าไป (Spread Props)
    };
}
```

### Step 3: Pipeline Execution 🚀

เราจะ Loop ผ่าน `dataStream()` แล้วส่งเข้า `processTransaction` จากนั้นเก็บผลรวม

```javascript
function runReport() {
    console.log("🚀 Starting Data Transformation...");
    
    const stream = dataStream();
    const stats = {}; // เก็บยอดรวมแยกตาม Category

    for (const rawRecord of stream) {
        // 1. Transform
        const processed = processTransaction(rawRecord);
        
        // 2. Aggregate (รวมยอด)
        const { category, netPrice } = processed; // ดึงมาแค่ที่ต้องใช้
        
        if (!stats[category]) {
            stats[category] = 0;
        }
        stats[category] += netPrice;
        
        // log ดูเล่นๆ (ในงานจริงอาจไม่ต้อง)
        console.log(`Processed: ${processed.item} -> ${processed.netPrice.toFixed(2)}`);
    }

    return stats;
}
```

### Step 4: Final Output 📊

```javascript
const report = runReport();

console.log("\n--- 📊 Summary Report ---");
// ใช้ Object.entries เพื่อ loop object key-value
for (const [cat, total] of Object.entries(report)) {
    console.log(`${cat}: ฿${total.toLocaleString()}`);
}
```

---

## 🏆 Challenges

### 🎯 Challenge 1: Currency Converter
**โจทย์:** แก้ไข `processTransaction` ให้รับ parameter ที่ 2 เป็น `rate` (อัตราแลกเปลี่ยน) และแปลง `netPrice` เป็นหน่วย USD (สมมติหาร 34) โดยให้ค่า Default ของ rate เป็น 1
*(ใบ้: Default Parameters `function(data, rate = 1)`)

### 🎯 Challenge 2: Sensitive Filter
**โจทย์:** ใน `RAW_DATA` ให้เพิ่ม property `private: true` เข้าไปในบาง record
แก้ไข Loop หลักให้ **ข้าม (continue)** ข้อมูลที่มี `private: true` โดยไม่ต้อง process
*(ใบ้: ใช้ Destructuring ดึง private ออกมาเช็ค)*

### 🎯 Challenge 3: Top Spender
**โจทย์:** ปรับแก้โค้ดเพื่อหาว่า **User คนไหน** มียอดซื้อรวมสูงสุด?
(ต้องเปลี่ยนโครงสร้าง `stats` ให้เก็บแยกตาม user แทน category หรือเก็บทั้งคู่)

---

👉 **[ไปต่อ: Module 8 - OOP & Metaprogramming](/javascript/08-01-prototypes)**
