# 05-07 JSON Fundamentals 📦

> **"JSON is the duct tape of the internet."**
> — *Developer Wisdom*

**JSON (JavaScript Object Notation)** คือรูปแบบการเก็บข้อมูลที่เป็นมาตรฐานกลางของโลก Web API ครับ ไม่ว่าคุณจะเขียน Python, Ruby, Java หรือ Go เวลาคุยกันผ่าน Internet ทุกคนตกลงกันว่าจะใช้ภาษา JSON คุยกัน!

ข่าวดีคือ: **JSON หน้าตาเหมือน JS Object เป๊ะๆ** (เกือบจะนะ) ทำให้คนเขียน JS ได้เปรียบสุดๆ!

> **💡 Analogy (เปรียบเทียบ):**
> - **JS Object:** เหมือน **"อาหารสด"** ที่เสิร์ฟบนจาน พร้อมกิน (มี Function, มี Date, ใช้งานได้เลย)
> - **JSON:** เหมือน **"อาหารแช่แข็ง"** (Dehydrated) ที่ถูกแพ็คใส่กล่องเพื่อส่งขนส่ง (ตัดส่วนเกินออก เหลือแค่ข้อมูลเพียวๆ เป็น Text)
> - **Serialization (`stringify`):** กระบวนการแพ็คอาหารใส่กล่อง
> - **Deserialization (`parse`):** กระบวนการแกะกล่องและเวฟอาหารให้กลับมากินได้

---

## 📚 MDN Reference
- [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

---

## 1. JSON vs JS Object 🆚

แม้จะหน้าตาคล้ายกัน แต่ JSON มีกฎเหล็กที่เคร่งครัดกว่า:

| Feature | JS Object 🟡 | JSON ⚪ |
|:--------|:-------------|:--------|
| **Key** | ไม่ต้องมี quote ก็ได้ (`{ name: ... }`) | **ต้อง**มี Double Quote เสมอ (`{ "name": ... }`) |
| **Value** | อะไรก็ได้ (Function, undefined, Date) | ได้แค่ String, Number, Boolean, Array, null, Object |
| **Trailing Comma** | มีได้ (`{ a: 1, }`) | **ห้ามมี** (`{ "a": 1 }`) |
| **Type** | เป็น Object ใน Memory | เป็น **String** ก้อนยาวๆ |

```javascript
// JS Object
const person = {
    name: "Dolar",
    age: 25,
    login: function() {} // ✅ ได้
};

// JSON String
const jsonString = '{ "name": "Dolar", "age": 25 }'; 
// ❌ ใส่ function ไม่ได้, key ต้องมี " "
```

---

## 2. Converting JSON 🔄

JS มี built-in object ชื่อ `JSON` ให้เราแปลงไปมาได้ง่ายๆ

### 2.1 Object → JSON (`JSON.stringify`)
ใช้เมื่อต้องการส่งข้อมูลไป Server หรือบันทึกลงไฟล์

```javascript
const user = {
    id: 1,
    name: "Alice",
    isAdmin: true,
    skills: ["JS", "React"],
    birthDate: new Date() // จะถูกแปลงเป็น String
};

const json = JSON.stringify(user);

console.log(typeof json); // "string"
console.log(json); 
// '{"id":1,"name":"Alice","isAdmin":true,"skills":["JS","React"],"birthDate":"2025-..."}'
```

### 2.2 JSON → Object (`JSON.parse`)
ใช้เมื่อรับข้อมูลจาก Server หรืออ่านจากไฟล์ แล้วต้องการนำมาใช้ในโค้ด

```javascript
const rawData = '{"id": 100, "active": false}';

const obj = JSON.parse(rawData);

console.log(obj.id); // 100
console.log(obj.active); // false
```

### ⚠️ Common Error: Parsing Bad JSON
ถ้า JSON string ผิดรูปแบบ `JSON.parse` จะระเบิดทันที! (Crash)
**Best Practice:** ควรใช้ `try...catch` เสมอ

```javascript
const badJson = '{ name: "Bob" }'; // ❌ ผิด! key ไม่มี quote

try {
    const user = JSON.parse(badJson);
} catch (error) {
    console.error("JSON Error:", error.message);
}
```

---

## 3. The "Deep Clone" Trick 🎭

เราเรียนเรื่อง Reference ไปแล้วว่า `obj1 = obj2` คือการก๊อปปี้ Pointer
ถ้าอยากก๊อปปี้ข้อมูลจริงๆ (Deep Clone) แบบง่ายๆ (แต่ไม่ Perfect) ให้ใช้ JSON:

```javascript
const original = { 
    a: 1, 
    b: { c: 2 } // Nested Object
};

// แปลงเป็น String -> แล้วแปลงกลับเป็น Object ใหม่
const clone = JSON.parse(JSON.stringify(original));

clone.b.c = 999;

console.log(original.b.c); // 2 (ค่าเดิมไม่เปลี่ยน! ✅)
```

> **ข้อควรระวัง:** วิธีนี้ใช้ไม่ได้ถ้า Object มี `Date`, `Function`, `undefined`, หรือ `Symbol` เพราะ JSON ไม่รองรับสิ่งเหล่านี้ (มันจะหายไปเลย)

---

## 4. Challenges 🏆

### 🎯 Challenge 1: Manual JSON
**หัวข้อ:** JSON Syntax
**โจทย์:** เขียน JSON String ที่ถูกต้องด้วยมือแทน Object นี้: `{ name: 'John', age: 30 }`
::: details ✨ ดูเฉลย
```javascript
const json = '{"name": "John", "age": 30}'; 
// ต้องใช้ Single Quote ครอบข้างนอก และ Double Quote ครอบ Key/String ข้างใน
```
:::

### 🎯 Challenge 2: Filter Data before sending
**หัวข้อ:** `stringify` replacer
**โจทย์:** ใช้ `JSON.stringify` แปลง Object แต่ **ไม่เอา** property `password`
```javascript
const user = { username: "admin", password: "123" };
```
*(ใบ้: stringify รับ parameter ตัวที่ 2 ได้นะ)*
::: details ✨ ดูเฉลย
```javascript
const output = JSON.stringify(user, ["username"]); 
// หรือใช้ Replacer Function
// const output = JSON.stringify(user, (key, value) => key === 'password' ? undefined : value);
console.log(output); // '{"username":"admin"}'
```
:::

### 🎯 Challenge 3: Safe Parsing
**หัวข้อ:** `try-catch`
**โจทย์:** จงเขียนฟังก์ชัน `safeParse(str)` ที่พยายาม parse JSON ถ้าสำเร็จให้คืนค่า Object ถ้าพังให้คืนค่า `null` (ห้ามโปรแกรม Crash)
::: details ✨ ดูเฉลย
```javascript
function safeParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}
```
:::

---

## 📖 Glossary (คำศัพท์เทคนิค)

| คำศัพท์ | ความหมาย |
|:-------|:---------|
| **JSON** | JavaScript Object Notation - รูปแบบข้อมูล Text มาตรฐาน |
| **Serialization** | การแปลง Object เป็น String (`stringify`) |
| **Deserialization** | การแปลง String เป็น Object (`parse`) |
| **Key-Value Pair** | คู่ของข้อมูล เช่น `"name": "Alice"` |
| **Deep Clone** | การก๊อปปี้ Object ใหม่ทั้งก้อน (รวมถึงไส้ในทุกระดับชั้น) เพื่อตัดขาด Reference |

---

👉 **[ไปต่อ: 5.8 - Typed Arrays & Buffers](/javascript/05-08-typed-arrays)**
