# 08-4: Metaprogramming (Proxy & Reflect) 🔮

> **"Metaprogramming is writing code that writes code... or at least code that manipulates other code."**
> — *Advanced JavaScript*

ยินดีต้อนรับสู่ "วิชาป้องกันตัวจากศาสตร์มืด" ของ JavaScript ครับ! 🧙‍♂️
**Metaprogramming** คือการเขียนโปรแกรมเพื่อเข้าไปจัดการหรือดัดแปลงพฤติกรรมพื้นฐานของภาษา (Language Semantics)
ใน JavaScript พระเอกของเราคือ **`Proxy`** (ตัวแทน) และ **`Reflect`** (กระจกเงา) ที่จะทำให้เรา "ดักจับ" และ "แก้ไข" การทำงานของ Object ได้อย่างน่าอัศจรรย์

> **💡 Analogy (เปรียบเทียบ):**
> **Proxy** เหมือนกับ **"เลขาหน้าห้อง"** หรือ **"บอดี้การ์ด"** ครับ:
> - ถ้าคุณอยากเจอท่านประธาน (Target Object) คุณต้องผ่านเลขาก่อน
> - เลขาสามารถ **"ดัก" (Trap)** คำขอของคุณได้ เช่น
>   - "ขอเอกสารหน่อย" (`get`) → เลขาอาจจะตรวจสอบสิทธิ์ก่อนให้
>   - "ฝากของให้หน่อย" (`set`) → เลขาอาจจะตรวจดูว่าของอันตรายไหม
>   - "ท่านประธานไม่อยู่ค่ะ" (โกหกหรือเปลี่ยนค่าตอบกลับ)

---

## 📚 MDN Reference
- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [Proxy Handler Traps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy)

---

## 1. Proxy (The Interceptor) 🛡️

`Proxy` ใช้ห่อหุ้ม Object เพื่อดักจับการกระทำต่างๆ (Operation)

### Syntax
```javascript
const proxy = new Proxy(target, handler);
```
- **Target:** Object ตัวจริงที่เราจะห่อ
- **Handler:** Object ที่เก็บกักดัก (**Traps**) ว่าจะให้ทำอะไรเมื่อเกิดเหตุการณ์ต่างๆ

### Basic Trap: `get` (ดักการอ่านค่า)

```javascript
const target = {
    message: "Hello World"
};

const handler = {
    get: function(obj, prop) {
        if (prop === "secret") {
            return "⛔ Access Denied!";
        }
        return obj[prop] || "Default Value"; // ถ้าไม่มีค่า ให้คืน Default
    }
};

const proxy = new Proxy(target, handler);

console.log(proxy.message); // "Hello World" (อ่านได้ปกติ)
console.log(proxy.secret);  // "⛔ Access Denied!" (โดนดัก!)
console.log(proxy.age);     // "Default Value" (ไม่มี property นี้ แต่เราเสกให้)
```

### Basic Trap: `set` (ดักการเขียนค่า)

ดักไม่ให้ใส่ค่ามั่วๆ ลงใน Object (Validation)

```javascript
const user = {
    age: 25
};

const validator = {
    set: function(obj, prop, value) {
        if (prop === "age") {
            if (typeof value !== "number" || value < 0) {
                console.error("❌ Age must be a positive number");
                return false; // บอกว่า set ไม่สำเร็จ
            }
        }
        obj[prop] = value; // ยอมให้ set ค่า
        return true;       // บอกว่า set สำเร็จ
    }
};

const protectedUser = new Proxy(user, validator);

protectedUser.age = 30;    // ✅ ผ่าน
protectedUser.age = -5;    // ❌ Error: Age must be a positive number
protectedUser.age = "Old"; // ❌ Error: Age must be a positive number
```

---

## 2. Reflect (The Mirror) 🪞

`Reflect` เป็น Built-in Object ที่มี method หน้าตาเหมือน Traps ของ Proxy เป๊ะๆ (เช่น `Reflect.get`, `Reflect.set`)
ทำไมต้องใช้? เพราะมันช่วยให้เรา **"ส่งต่อ" (Forward)** การทำงานไปให้ JS Engine แบบมาตรฐานได้ง่ายขึ้น

```javascript
const handler = {
    get(target, prop, receiver) {
        console.log(`Reading property: ${prop}`);
        // แทนที่จะเขียน target[prop] ซึ่งอาจมีปัญหาในบางเคส
        // ใช้ Reflect.get เพื่อส่งงานต่อให้ถูกต้องตามหลักภาษา
        return Reflect.get(target, prop, receiver);
    }
};
```

> **Best Practice:** เมื่อเขียน Proxy Traps ควรใช้คู่กับ `Reflect` เสมอ เพื่อให้พฤติกรรม Default ยังคงอยู่ครบถ้วน

---

## 3. Real-World Use Cases 🌍

### 3.1 Negative Array Index (Python Style) 🐍
ใน JS เราเข้าถึง `arr[-1]` ไม่ได้ (ได้ undefined) แต่เราใช้ Proxy ทำให้มันทำได้!

```javascript
function createSmartArray(arr) {
    return new Proxy(arr, {
        get(target, prop) {
            const index = Number(prop);
            // ถ้าเป็น index ติดลบ, ให้เริ่มนับจากท้าย
            if (index < 0) {
                prop = String(target.length + index);
            }
            return Reflect.get(target, prop);
        }
    });
}

const arr = createSmartArray(["A", "B", "C", "D"]);
console.log(arr[-1]); // "D"
console.log(arr[-2]); // "C"
```

### 3.2 Observable Objects (Data Binding) 👁️
นี่คือหลักการทำงานของ **Vue.js 3 Reactivity System**!
เราจะดักจับเมื่อข้อมูลเปลี่ยน เพื่อไปอัพเดทหน้าจออัตโนมัติ

```javascript
const state = { count: 0 };

const reactiveState = new Proxy(state, {
    set(target, prop, value) {
        console.log(`Update UI: ${prop} changed from ${target[prop]} to ${value}`);
        target[prop] = value;
        return true;
    }
});

reactiveState.count = 1; // "Update UI: count changed from 0 to 1"
reactiveState.count = 2; // "Update UI: count changed from 1 to 2"
```

---

## 4. Challenges 🏆

### 🎯 Challenge 1: The Logger
**โจทย์:** สร้าง Proxy ที่จะ `console.log` ทุกครั้งที่มีการอ่าน (`get`) หรือแก้ไข (`set`) properties ใน object
::: details ✨ ดูเฉลย
```javascript
const person = { name: "John" };
const logger = new Proxy(person, {
    get(target, prop) {
        console.log(`Reading ${prop}`);
        return target[prop];
    },
    set(target, prop, value) {
        console.log(`Writing ${prop} = ${value}`);
        target[prop] = value;
        return true;
    }
});
```
:::

### 🎯 Challenge 2: Read-Only Object
**โจทย์:** สร้าง Proxy ที่ยอมให้อ่านค่าได้อย่างเดียว ถ้าพยายามจะ `set` หรือ `deleteProperty` ให้ throw Error ว่า "Read only!"
::: details ✨ ดูเฉลย
```javascript
const readOnlyHandler = {
    set() { throw new Error("Read only!"); },
    deleteProperty() { throw new Error("Read only!"); }
};
```
:::

### 🎯 Challenge 3: API Cleaner (Smart Object)
**โจทย์:** สร้าง Proxy เพื่อหุ้มข้อมูล User โดยกำหนดว่า:
1. ถ้าอ่าน property ที่ไม่มีอยู่จริง ให้คืนค่า `"N/A"` (แทน undefined)
2. ถ้าอ่าน `firstName` หรือ `lastName` ให้คืนค่าเป็นตัวพิมพ์ใหญ่เสมอ (`toUpperCase()`)
::: details ✨ ดูเฉลย
```javascript
const user = { firstName: "alice", lastName: "smith" };

const smartUser = new Proxy(user, {
    get(target, prop) {
        if (!(prop in target)) return "N/A";
        
        const value = target[prop];
        if (prop === 'firstName' || prop === 'lastName') {
            return value.toUpperCase();
        }
        return value;
    }
});

console.log(smartUser.firstName); // "ALICE"
console.log(smartUser.age);       // "N/A"
```
:::

---

## 📖 Glossary (คำศัพท์เทคนิค)

| คำศัพท์ | ความหมาย |
|:-------|:---------|
| **Proxy** | Object พิเศษที่ใช้ "สวมรอย" หรือ "หุ้ม" Object อื่นเพื่อดักจับการทำงาน |
| **Object (Target)** | วัตถุจริงที่เราต้องการหุ้มด้วย Proxy |
| **Handler** | Object ที่เก็บฟังก์ชันดักจับ (Traps) ต่างๆ |
| **Trap** | เมธอดใน Handler ที่จะทำงานเมื่อมีการกระทำบางอย่าง (เช่น `get`, `set`) |
| **Reflect** | Object ที่รวม Default Behavior ของ JS Operations ไว้ให้เรียกใช้งานง่ายๆ |
| **Interception** | การขัดจังหวะหรือดักจับการทำงานพื้นฐาน |

---

👉 **[ไปต่อ: 08-5 - Event Emitters](/javascript/08-05-event-emitter)**
