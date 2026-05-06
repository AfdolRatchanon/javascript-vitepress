# 6.1 — useEffect Hook และ Lifecycle

> "With great power comes great responsibility."
> — Uncle Ben (Spider-Man)

## useEffect คืออะไร และทำไมเราถึงต้องการมัน

ก่อนจะเข้าใจ `useEffect` เราต้องเข้าใจคำว่า **Side Effect** ก่อน

**เปรียบเทียบง่ายๆ:** ลองนึกภาพว่าคุณเป็นพ่อครัว 👨‍🍳 หน้าที่หลักของคุณคือทำอาหาร (render UI) แต่บางครั้งคุณต้องโทรสั่งของ (API call) เปิดเตาอบทิ้งไว้ (subscription) หรือเปิดหน้าต่างห้องครัว (DOM manipulation) สิ่งเหล่านี้คือ "Side Effect" — งานที่ทำนอกเหนือจากการทำอาหารโดยตรง แต่จำเป็นต้องทำ

ใน React, **Side Effects** คือสิ่งที่เกิดขึ้นนอกการ render ปกติ เช่น:
- การเรียก API ดึงข้อมูล (data fetching)
- การ subscribe ฟัง events (WebSocket, DOM events)
- การเปลี่ยนแปลง DOM โดยตรง (document.title, animation libraries)
- การตั้ง timer (setTimeout, setInterval)

`useEffect` คือ Hook ที่ React มอบให้เราจัดการกับ Side Effects เหล่านี้ได้อย่างปลอดภัย

::: tip เอกสารอ้างอิง
- [React Docs — useEffect](https://react.dev/reference/react/useEffect)
- [React Docs — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [MDN — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
:::

---

## รูปแบบ (Signature) ของ useEffect

```javascript
useEffect(() => {
  // โค้ดที่เป็น Side Effect เขียนที่นี่

  return () => {
    // Cleanup function (ไม่บังคับ)
    // ทำงานก่อน component ถูกถอด (unmount) หรือก่อน effect ทำงานใหม่
  };
}, [dependencies]); // Dependency array (ไม่บังคับ)
```

`useEffect` รับ argument 2 ตัว:
1. **Callback function** — โค้ดที่ต้องการให้ทำงานเป็น side effect
2. **Dependency array** — รายการค่าที่ effect ขึ้นอยู่กับ (ควบคุมว่า effect จะทำงานเมื่อไหร่)

---

## 3 รูปแบบการใช้งาน useEffect

### รูปแบบที่ 1: ไม่มี Dependency Array (ทำงานทุก render)

ไม่ส่ง dependency array เลย — effect จะทำงานหลัง **ทุก render** ของ component นี้เหมาะกับกรณีที่คุณต้องการ sync กับข้อมูลล่าสุดเสมอ แต่ระวัง! ถ้า effect ทำให้เกิด re-render จะวนลูปไม่สิ้นสุด

```javascript
import { useEffect, useState } from 'react';

function DocumentTitle({ title }) {
  const [count, setCount] = useState(0);

  // ทำงานหลังทุก render — ทุกครั้งที่ count หรือ title เปลี่ยน
  useEffect(() => {
    document.title = `${title} (${count} clicks)`;
    console.log('Effect ran! Current count:', count);
    // Output: "Effect ran! Current count: 0"  (render แรก)
    // Output: "Effect ran! Current count: 1"  (หลัง click)
    // Output: "Effect ran! Current count: 2"  (หลัง click อีกครั้ง)
  }); // ไม่มี [] เลย

  return (
    <button onClick={() => setCount(c => c + 1)}>
      คลิก {count} ครั้ง
    </button>
  );
}
```

::: warning ระวัง
รูปแบบนี้ทำงานบ่อยมาก ใช้เฉพาะเมื่อจำเป็นจริงๆ เท่านั้น มักเป็นสัญญาณว่าคุณควรใส่ dependency array
:::

---

### รูปแบบที่ 2: Dependency Array ว่าง (ทำงานครั้งเดียวตอน mount)

ส่ง `[]` เป็น dependency array — effect จะทำงาน **ครั้งเดียว** หลัง component ถูก mount ลง DOM เหมาะกับการดึงข้อมูลครั้งแรก, การ subscribe events, หรือการตั้งค่า library

```javascript
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // [] หมายความว่า: "ทำงานครั้งเดียวเมื่อ component ปรากฏขึ้น"
  // เหมือนกับ componentDidMount ใน Class Component
  useEffect(() => {
    console.log('Component mounted! Fetching user...');
    // Output: "Component mounted! Fetching user..."

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        console.log('User loaded:', data.name);
        // Output: "User loaded: Leanne Graham"
      });
  }, []); // [] = ทำงานแค่ครั้งเดียว

  if (!user) return <p>กำลังโหลด...</p>;
  return <h1>สวัสดี, {user.name}!</h1>;
}
```

::: warning หมายเหตุสำคัญ
ถ้า `userId` เปลี่ยนแปลง effect จะ **ไม่ทำงานใหม่** เพราะ `userId` ไม่ได้อยู่ใน dependency array นี่คือ "Stale Closure" bug ที่พบบ่อยมาก
:::

---

### รูปแบบที่ 3: มี Dependencies (ทำงานเมื่อค่าที่ระบุเปลี่ยน)

ส่ง array ที่มีค่าบางอย่าง — effect จะทำงานครั้งแรกตอน mount และทุกครั้งที่ค่าใน array เปลี่ยนแปลง นี่คือรูปแบบที่ใช้บ่อยที่สุดและถูกต้องที่สุดในส่วนใหญ่ของกรณี

```javascript
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ทำงานตอน mount และทุกครั้งที่ userId เปลี่ยน
  // เหมาะมากสำหรับการดึงข้อมูลที่ขึ้นอยู่กับ props
  useEffect(() => {
    setLoading(true);
    console.log(`Fetching user ${userId}...`);
    // Output: "Fetching user 1..."
    // Output: "Fetching user 2..."  (เมื่อ userId prop เปลี่ยนเป็น 2)

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]); // ทำงานใหม่ทุกครั้งที่ userId เปลี่ยน

  if (loading) return <p>กำลังโหลด...</p>;
  return <h1>{user?.name}</h1>;
}
```

---

## ตารางเปรียบเทียบ: Class Component vs useEffect

| Lifecycle Method (Class) | useEffect เทียบเท่า | เมื่อทำงาน |
|---|---|---|
| `componentDidMount` | `useEffect(() => {...}, [])` | หลัง component mount ครั้งแรก |
| `componentDidUpdate` | `useEffect(() => {...}, [dep])` | หลัง render ที่ dep เปลี่ยน |
| `componentDidUpdate` (ทุกครั้ง) | `useEffect(() => {...})` | หลังทุก render |
| `componentWillUnmount` | `return () => {...}` ใน useEffect | ก่อน component ถูก unmount |
| `componentDidMount` + `componentWillUnmount` | `useEffect(() => { setup; return cleanup; }, [])` | mount แล้ว cleanup ตอน unmount |

---

## Cleanup Function — ทำไมถึงสำคัญมาก

**เปรียบเทียบ:** คิดว่าคุณเปิด Netflix 🎬 ดูหนัง แล้วออกจากแอป ถ้าแอปไม่ "cleanup" การเล่นวิดีโอ มันจะยังคงใช้แบตเตอรี่ ข้อมูล และทำให้โทรศัพท์ช้า — นั่นคือ Memory Leak!

Cleanup function ใน useEffect ทำงานใน 2 สถานการณ์:
1. ก่อนที่ effect จะทำงานใหม่ (ล้างของเก่าก่อน)
2. เมื่อ component ถูก unmount (ล้างทุกอย่าง)

```javascript
import { useEffect, useState } from 'react';

function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Setup: เพิ่ม event listener
    const handleOnline = () => {
      setIsOnline(true);
      console.log('User is online!');
      // Output: "User is online!"
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('User is offline!');
      // Output: "User is offline!"
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    console.log('Subscribed to online/offline events');
    // Output: "Subscribed to online/offline events"

    // Cleanup: ลบ event listener เมื่อ component unmount
    // ถ้าไม่ cleanup — listener จะยังทำงานอยู่หลัง component หายไป!
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      console.log('Cleaned up event listeners');
      // Output: "Cleaned up event listeners"  (ตอน unmount)
    };
  }, []); // ทำงานครั้งเดียว

  return (
    <div style={{ color: isOnline ? 'green' : 'red' }}>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
```

::: tip เมื่อไหร่ควร cleanup?
- **Event listeners** — ต้อง remove เสมอ
- **setTimeout / setInterval** — ต้อง clear เสมอ
- **WebSocket connections** — ต้อง close เสมอ
- **Fetch requests** — ควร abort เมื่อ unmount
- **Third-party library subscriptions** — ต้อง unsubscribe เสมอ
:::

---

## ข้อผิดพลาดที่พบบ่อย: Stale Closure

**เปรียบเทียบ:** จินตนาการว่าคุณถ่ายรูป 📸 ของตู้เย็น รูปถ่ายนั้นจะแสดงสิ่งของตอนที่ถ่าย ไม่ใช่ตอนปัจจุบัน — นั่นคือ stale closure: ฟังก์ชันจำค่าเก่าไว้ ไม่ใช่ค่าปัจจุบัน

```javascript
import { useEffect, useState } from 'react';

function BuggyCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // BUG! count จะเป็น 0 ตลอดเวลา!
      // เพราะ closure จำค่า count ตอนที่สร้าง interval (ซึ่งเป็น 0)
      console.log('Count is:', count);
      // Output: "Count is: 0"  (ซ้ำตลอด แม้จะคลิกปุ่มก็ตาม!)
    }, 1000);

    return () => clearInterval(timer);
  }, []); // [] ทำให้ count ใน closure เป็น 0 ตลอด

  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}

// วิธีแก้: ใส่ count ใน dependency array
function FixedCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count is:', count);
      // Output: "Count is: 1", "Count is: 2", ... (ค่าล่าสุดเสมอ)
    }, 1000);

    return () => clearInterval(timer);
  }, [count]); // ใส่ count เป็น dependency — effect จะ reset ทุกครั้งที่ count เปลี่ยน

  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
```

::: warning หลักการจำง่าย
**ถ้าค่าใดถูกใช้ใน useEffect → ค่านั้นต้องอยู่ใน dependency array**

React ESLint plugin (`eslint-plugin-react-hooks`) จะแจ้งเตือนถ้าลืมใส่ dependency
:::

---

## Real-world Use Case: Auto-Save Timer

ระบบ Auto-Save ที่บันทึกข้อมูลอัตโนมัติทุก 5 วินาที และหยุดทำงานเมื่อ component ถูกปิด นี่คือตัวอย่างที่ดีของการใช้ `useEffect` กับ cleanup function ที่สมบูรณ์แบบ

```javascript
import { useEffect, useState, useCallback } from 'react';

function AutoSaveEditor({ documentId }) {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const [lastSaved, setLastSaved] = useState(null);

  // ฟังก์ชัน save ที่จริงๆ
  const saveDocument = useCallback(async (text) => {
    setSaveStatus('saving');
    console.log(`Saving document ${documentId}...`);
    // Output: "Saving document doc-123..."

    try {
      // จำลองการส่งข้อมูลไป server
      await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: text }),
        headers: { 'Content-Type': 'application/json' },
      });

      setSaveStatus('saved');
      setLastSaved(new Date());
      console.log('Document saved successfully!');
      // Output: "Document saved successfully!"
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error.message);
    }
  }, [documentId]);

  // Auto-save ทุก 5 วินาที เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    // ถ้าไม่มีการเปลี่ยนแปลง ไม่ต้อง save
    if (saveStatus === 'saved') return;

    console.log('Starting auto-save timer...');
    // Output: "Starting auto-save timer..."

    const timer = setTimeout(() => {
      saveDocument(content);
    }, 5000); // รอ 5 วินาทีก่อน save

    // Cleanup: ยกเลิก timer เก่าเมื่อ content เปลี่ยนหรือ component unmount
    // ทำให้ timer รีเซ็ตทุกครั้งที่พิมพ์ (debounce effect)
    return () => {
      clearTimeout(timer);
      console.log('Auto-save timer cancelled (content changed or unmounted)');
      // Output: "Auto-save timer cancelled..."
    };
  }, [content, saveStatus, saveDocument]);

  const handleChange = (e) => {
    setContent(e.target.value);
    setSaveStatus('unsaved');
  };

  const statusMessages = {
    saved: `บันทึกแล้ว ${lastSaved ? `เมื่อ ${lastSaved.toLocaleTimeString('th-TH')}` : ''}`,
    saving: 'กำลังบันทึก...',
    unsaved: 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก',
    error: 'เกิดข้อผิดพลาดในการบันทึก',
  };

  const statusColors = {
    saved: '#22c55e',
    saving: '#f59e0b',
    unsaved: '#94a3b8',
    error: '#ef4444',
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3>บรรณาธิการเอกสาร</h3>
        <span style={{ color: statusColors[saveStatus], fontSize: '14px' }}>
          {statusMessages[saveStatus]}
        </span>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        rows={10}
        style={{ width: '100%', padding: '12px', fontSize: '16px' }}
        placeholder="เริ่มพิมพ์ที่นี่... ระบบจะบันทึกอัตโนมัติ"
      />
      <button onClick={() => saveDocument(content)} style={{ marginTop: '8px' }}>
        บันทึกทันที
      </button>
    </div>
  );
}

export default AutoSaveEditor;
```

**ในตัวอย่างนี้ useEffect ทำงาน 3 สิ่ง:**
1. ตรวจสอบว่ามีการเปลี่ยนแปลงไหม (ถ้าไม่มี — ไม่ทำอะไร)
2. ตั้ง timer สำหรับ auto-save
3. Cleanup timer เก่าทุกครั้งที่ content เปลี่ยน (debounce) หรือตอน unmount

---

## แบบฝึกหัด

### แบบฝึกหัดที่ 1: Window Title Updater

เขียน component `PageTitle` ที่รับ prop `title` และ `subtitle` แล้วอัปเดต `document.title` เป็น `"title | subtitle"` ทุกครั้งที่ค่าเปลี่ยน

::: details ✨ ดูเฉลย
```javascript
import { useEffect } from 'react';

function PageTitle({ title, subtitle }) {
  useEffect(() => {
    // อัปเดต document title ทุกครั้งที่ title หรือ subtitle เปลี่ยน
    const fullTitle = subtitle ? `${title} | ${subtitle}` : title;
    document.title = fullTitle;

    // Cleanup: คืนค่า title เดิมเมื่อ component ถูก unmount
    return () => {
      document.title = 'My App'; // ค่า default
    };
  }, [title, subtitle]); // dependency array ถูกต้อง

  return null; // component นี้ไม่ render อะไร
}

// การใช้งาน:
// <PageTitle title="หน้าหลัก" subtitle="React Course" />
// document.title จะเป็น "หน้าหลัก | React Course"
```
:::

---

### แบบฝึกหัดที่ 2: Countdown Timer

สร้าง component `Countdown` ที่รับ prop `seconds` และนับถอยหลังทุก 1 วินาที เมื่อถึง 0 ให้แสดงข้อความ "หมดเวลา!" cleanup timer เมื่อ component unmount

::: details ✨ ดูเฉลย
```javascript
import { useEffect, useState } from 'react';

function Countdown({ seconds: initialSeconds }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    // ถ้าหมดเวลาแล้ว ไม่ต้องตั้ง interval
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: ล้าง interval เมื่อ component unmount หรือ timeLeft เปลี่ยน
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (timeLeft === 0) {
    return <div style={{ color: 'red', fontSize: '24px' }}>หมดเวลา!</div>;
  }

  return (
    <div>
      <p style={{ fontSize: '48px', textAlign: 'center' }}>
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </p>
    </div>
  );
}

// การใช้งาน:
// <Countdown seconds={60} />
// แสดง 1:00 -> 0:59 -> ... -> 0:00 -> "หมดเวลา!"
```
:::

---

### แบบฝึกหัดที่ 3: Scroll Position Tracker

สร้าง custom hook `useScrollPosition()` ที่ติดตาม scroll position ของ window และคืนค่า `{ x, y }` ต้อง cleanup event listener ด้วย

::: details ✨ ดูเฉลย
```javascript
import { useEffect, useState } from 'react';

function useScrollPosition() {
  const [position, setPosition] = useState({
    x: window.scrollX,
    y: window.scrollY,
  });

  useEffect(() => {
    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    // เพิ่ม listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup: ลบ listener เมื่อ component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // ทำงานครั้งเดียวตอน mount

  return position;
}

// การใช้งาน:
function ScrollDisplay() {
  const { x, y } = useScrollPosition();
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, padding: '8px', background: 'black', color: 'white' }}>
      Scroll: ({Math.round(x)}, {Math.round(y)})
    </div>
  );
}
```
:::

---

## Glossary — คำศัพท์สำคัญ

| คำศัพท์ | คำอธิบายภาษาไทย |
|---|---|
| **Side Effect** | ผลข้างเคียงของการ render — การกระทำใดๆ ที่ส่งผลนอก component เช่น API call, DOM manipulation |
| **useEffect** | React Hook สำหรับจัดการ Side Effects หลังการ render |
| **Dependency Array** | Array ที่กำหนดว่า useEffect ควรทำงานใหม่เมื่อค่าไหนเปลี่ยน |
| **Cleanup Function** | ฟังก์ชันที่ return จาก useEffect สำหรับล้างทรัพยากรเมื่อ component unmount |
| **Memory Leak** | ปัญหาที่โปรแกรมใช้หน่วยความจำโดยไม่ปล่อยออก ทำให้ระบบช้าลง |
| **Stale Closure** | ปัญหาที่ฟังก์ชันใน closure จำค่าเก่าไว้ ไม่อัปเดตตามค่าปัจจุบัน |
| **Mount** | กระบวนการที่ React สร้าง component และเพิ่มลงใน DOM |
| **Unmount** | กระบวนการที่ React ลบ component ออกจาก DOM |
| **Subscription** | การลงทะเบียนรับการแจ้งเตือนจากแหล่งข้อมูลภายนอก เช่น WebSocket |
| **componentDidMount** | lifecycle method ใน Class Component ที่ทำงานหลัง mount (เทียบเท่า useEffect กับ []) |
| **componentWillUnmount** | lifecycle method ใน Class Component ที่ทำงานก่อน unmount (เทียบเท่า cleanup function) |
| **Debounce** | เทคนิคชะลอการทำงานของฟังก์ชัน — ทำงานหลังจากหยุดรับ input ระยะหนึ่ง |

---

👉 ไปต่อ: [6.2 - useRef Hook](/react/06-02-useref-hook)
