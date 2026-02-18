# 08-5: Event Emitters (Pub/Sub) 📡

> **"Don't call us, we'll call you."**
> — *The Hollywood Principle (and Event-Driven Architecture)*

คุณเคยสงสัยไหมว่า `button.addEventListener('click', ...)` ทำงานยังไง?
หรือทำไม Node.js ถึงรับ Request ได้เป็นล้านโดยไม่ค้าง?
คำตอบคือ **Event-Driven Architecture** ครับ!

หัวใจสำคัญของมันคือ **Observer Pattern** (หรือ Pub/Sub) ซึ่งช่วยให้ Object ก้อนหนึ่ง (Subject) สามารถ "ตะโกน" บอก Object อื่นๆ (Observers) ว่า "เฮ้ย! มีเรื่องเกิดขึ้นแล้วนะ!" โดยที่คนตะโกนไม่ต้องรู้จักคนฟังเลยก็ได้

> **💡 Analogy (เปรียบเทียบ):**
> **Event Emitter** เหมือน **"ระบบกระจายข่าววิทยุ"** 📻
> - **Emitter (Station):** สถานีวิทยุ ส่งสัญญาณออกไป (Emit "News")
> - **Listener (Receiver):** ผู้ฟัง หมุนคลื่นมารรอฟัง (Subscribe/On "News")
> - สถานีไม่รู้หรอกว่ามีใครฟังอยู่บ้าง และคนฟังก็ไม่ต้องเฝ้าหน้าสถานีตลอดเวลา แค่เปิดวิทยุทิ้งไว้ พอข่าวมาก็ได้ยินเอง

---

## 📚 MDN Reference
- [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) (Browser Implementation)
- [Node.js EventEmitter](https://nodejs.org/api/events.html)

---

## 1. The Concept (หลักการทำงาน) ⚙️

Event Emitter ประกอบด้วย 2 ส่วนหลัก:
1.  **`on(eventName, callback)`**: ลงชื่อรอฟังเหตุการณ์ (Subscribe)
2.  **`emit(eventName, data)`**: ปล่อยเหตุการณ์ออกไป (Publish)

ถ้าเป็นใน Browser เราใช้ `addEventListener` แทน `on` และ `dispatchEvent` แทน `emit`
แต่ใน Node.js หรือ Library ทั่วไป (เช่น Vue, React) จะใช้ Emitter Pattern กันเยอะมาก

---

## 2. Build Your Own Emitter 🛠️

เพื่อให้เข้าใจลึกซึ้ง เรามาลองสร้าง Event Emitter ใช้เองกันเถอะ! (Class พื้นฐานที่ใช้กันทั่วโลก)

```javascript
class SimpleEmitter {
    constructor() {
        this.events = {}; // เก็บรายการ Event และ Callback { "click": [fn1, fn2] }
    }

    // 1. ลงชื่อรอฟัง
    on(name, listener) {
        if (!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(listener);
    }

    // 2. ตะโกนบอก
    emit(name, data) {
        const listeners = this.events[name];
        if (listeners) {
            listeners.forEach(fn => fn(data)); // เรียกทุก function ที่ลงชื่อไว้
        }
    }

    // 3. ยกเลิกการฟัง (Clean up)
    off(name, listenerToRemove) {
        if (!this.events[name]) return;
        this.events[name] = this.events[name].filter(fn => fn !== listenerToRemove);
    }
}
```

### การนำไปใช้งาน

```javascript
const chatRoom = new SimpleEmitter();

function showMessage(msg) {
    console.log(`📩 New Message: ${msg}`);
}

function playSound() {
    console.log("🔔 Ding!");
}

// Subscribe
chatRoom.on("message", showMessage);
chatRoom.on("message", playSound);

// Emit (เหตุการณ์เกิดขึ้น!)
chatRoom.emit("message", "Hello World!");
// Output:
// 📩 New Message: Hello World!
// 🔔 Ding!

// Unsubscribe
chatRoom.off("message", playSound);

chatRoom.emit("message", "Bye!");
// Output:
// 📩 New Message: Bye!
// (ไม่มีเสียง Ding แล้ว)
```

---

## 3. Real-World Use Cases 🌍

### 3.1 Node.js Streams & HTTP
Node.js สร้างมารบนพื้นฐานของ Event Emitter เกือบทั้งหมด

```javascript
// ตัวอย่าง (Pseudo-code ของ Node.js)
import { createServer } from 'http';

const server = createServer();

// server คือ EventEmitter ตัวหนึ่ง!
server.on('request', (req, res) => {
    console.log('User requested something!');
    res.end('Hello');
});

server.listen(3000);
```

### 3.2 Decoupling Components (ลดการผูกมัด)
สมมติเราทำเกม RPG:
- **Hero:** เดินชนหีบสมบัติ
- **UI:** ต้องอัพเดทคะแนน
- **Sound:** ต้องเล่นเสียง Effect

ถ้าเขียนแบบ **Coupling (แย่):**
```javascript
// Hero Class
collectItem() {
    scoreBoard.update(); // Hero ต้องรู้จัก ScoreBoard? (ไม่ดี)
    audioPlayer.play();  // Hero ต้องรู้จัก AudioPlayer? (ไม่ดี)
}
```

ถ้าเขียนแบบ **Event-Driven (ดี):**
```javascript
// Hero Class
collectItem() {
    this.emit("itemCollected"); // Hero แค่บอกว่า "เก็บของแล้วนะ" จบ.
}

// Main Game Controller
hero.on("itemCollected", () => scoreBoard.update());
hero.on("itemCollected", () => audioPlayer.play());
```
*ทีนี้ถ้าเราจะลบ ScoreBoard ออก หรือเพิ่มระบบ Achievement ก็ไม่ต้องไปแก้โค้ดใน Hero เลย!*

---

## 4. Challenges 🏆

### 🎯 Challenge 1: `once()` Method
**โจทย์:** เพิ่ม method `once(name, listener)` เข้าไปใน `SimpleEmitter`
Listener นี้จะทำงานแค่ **ครั้งเดียว** แล้วลบตัวเองทิ้งทันที
::: details ✨ ดูเฉลย
```javascript
once(name, listener) {
    const wrapper = (data) => {
        listener(data);
        this.off(name, wrapper); // ลบตัวเองหลังทำงานเสร็จ
    };
    this.on(name, wrapper);
}
```
:::

### 🎯 Challenge 2: The Chat System
**โจทย์:**
1. สร้าง `User` class ที่ extends `SimpleEmitter`
2. เมื่อ user ส่งข้อความ (`send(msg)`) ให้ emit event `"msg"` พร้อมชื่อคนส่ง
3. สร้าง User 2 คน (Alice, Bob) แล้วให้ Bob ฟัง Alice
::: details ✨ ดูเฉลย
```javascript
class User extends SimpleEmitter {
    constructor(name) {
        super();
        this.name = name;
    }
    send(msg) {
        console.log(`${this.name} sent: ${msg}`);
        this.emit("msg", { from: this.name, text: msg });
    }
}

const alice = new User("Alice");
const bob = new User("Bob");

alice.on("msg", (data) => console.log(`Bob received from ${data.from}: ${data.text}`));

alice.send("Hi Bob!");
```
:::

### 🎯 Challenge 3: Memory Leak Warning ⚠️
**โจทย์ (ทฤษฎี):** ถ้าเรา `on` ไว้เยอะๆ แต่ไม่เคย `off` เลย จะเกิดอะไรขึ้น? และใน Node.js มีวิธีป้องกันยังไง?
::: details ✨ ดูเฉลย
เกิด **Memory Leak** ครับ เพราะ function ที่ callback จะค้างอยู่ใน Array ตลอดไป ไม่ถูก Garbage Collect
ใน Node.js จะมี `setMaxListeners(n)` ถ้าเกินจำนวนที่ตั้งไว้ มันจะเตือนเราทาง Console ครับ
:::

---

## 📖 Glossary (คำศัพท์เทคนิค)

| คำศัพท์ | ความหมาย |
|:-------|:---------|
| **Event Emitter** | Object ที่มีความสามารถในการส่งและรับเหตุการณ์ |
| **Subscribe (on)** | การลงทะเบียนฟังก์ชันเพื่อรอรับเหตุการณ์ |
| **Publish / Emit** | การส่งสัญญาณเหตุการณ์ออกไปให้ผู้ที่รอฟังทราบ |
| **Listener** | ฟังก์ชัน (Callback) ที่ถูกเรียกเมื่อเกิดเหตุการณ์ |
| **Observer Pattern** | Design Pattern ที่ให้ Object หลายตัวรอเฝ้าดูการเปลี่ยนแปลงของ Object หนึ่งตัว |
| **Decoupling** | การลดความเกี่ยวโยงกันระหว่าง Component (ทำให้โค้ดแก้ได้ง่ายขึ้น) |

---

👉 **[ไปต่อ: Project 8 (Part 1) - Reactive Proxy Engine](/javascript/08-project-reactive-proxy)**
