# 11-2: Browser APIs (ความสามารถพิเศษของเบราว์เซอร์) 🌐

> **"The browser is not just a document viewer—it's a powerful platform."**
> — *Paul Irish*

นอกจาก DOM แล้ว Browser ยัง**มี API มากมาย**ที่ทำให้เว็บทำสิ่งที่เหมือน Native App ได้ เช่น ดูตำแหน่ง GPS, แจ้งเตือนบนหน้าจอ, คัดลอกข้อความ, ตรวจจับว่าผู้ใช้กำลังดูหน้าเว็บอยู่หรือไม่!

> **💡 Analogy (เปรียบเทียบ):**
> Browser APIs เหมือน **"เครื่องมือพิเศษในกล่องเครื่องมือ"** 🧰:
> - DOM คือ **ไขควง** (ใช้ทุกวัน)
> - Browser APIs คือ **เครื่องมือพิเศษ** เช่น เครื่องวัดระยะ, เครื่องถ่ายรูป — ไม่ได้ใช้ทุกวัน แต่เมื่อต้องการ → ขาดไม่ได้!

---

## 1. Geolocation API — ตำแหน่งผู้ใช้ 📍

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API): Geolocation API ให้เว็บ**ขอพิกัด GPS** ของผู้ใช้ได้ ใช้ทำแผนที่, หาร้านใกล้เคียง, คำนวณระยะทาง

**⚠️ สำคัญ:** ต้อง**ได้รับอนุญาตจากผู้ใช้เสมอ** — เบราว์เซอร์จะแสดง Popup ถาม "Allow location access?" ก่อน

```javascript
// ⚡ เช็คก่อนว่า Browser รองรับ!
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        // ✅ Callback เมื่อสำเร็จ
        (position) => {
            console.log("Latitude:", position.coords.latitude);   // เส้นรุ้ง
            console.log("Longitude:", position.coords.longitude); // เส้นแวง
            console.log("Accuracy:", position.coords.accuracy, "meters");
        },
        // ❌ Callback เมื่อล้มเหลว (ปฏิเสธ, GPS ปิด, ฯลฯ)
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    console.error("ผู้ใช้ปฏิเสธการขอตำแหน่ง");
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.error("ไม่สามารถหาตำแหน่งได้");
                    break;
                case error.TIMEOUT:
                    console.error("หมดเวลา");
                    break;
            }
        }
    );
} else {
    console.log("Browser ไม่รองรับ Geolocation");
}
```

### ตัวอย่าง Use Case: แสดงบน Google Maps

```javascript
navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    console.log("📍 ตำแหน่งของคุณ:", mapUrl);
});
```

> 💡 **watchPosition()** ใช้ติดตามตำแหน่งแบบ Real-time (เช่น แอป GPS นำทาง):
> ```javascript
> const watchId = navigator.geolocation.watchPosition(callback);
> // หยุดติดตาม:
> navigator.geolocation.clearWatch(watchId);
> ```

---

## 2. Clipboard API — คัดลอกข้อความ 📋

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API): Clipboard API ให้เว็บ**อ่าน/เขียน Clipboard** ของผู้ใช้ได้ ใช้ทำปุ่ม "Copy", "Paste" บนเว็บ

**⚠️ ต้องขออนุญาต** และ**ทำงานเฉพาะบน HTTPS** (หรือ localhost)

### Copy (เขียนลง Clipboard):

```javascript
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log("✅ Copied!");
    } catch (error) {
        // อาจเกิดเมื่อ: ไม่ได้ Focus หน้าเว็บ, ไม่ใช่ HTTPS
        console.error("❌ Copy failed:", error.message);
    }
}
```

### ตัวอย่าง: ปุ่ม Copy พร้อม Feedback

```javascript
const copyBtn = document.querySelector("#copyBtn");
const codeBlock = document.querySelector("#codeBlock");

copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(codeBlock.textContent);

        // เปลี่ยน Text ชั่วคราวเพื่อบอกว่า Copy แล้ว
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "✅ Copied!";
        copyBtn.disabled = true;

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.disabled = false;
        }, 2000);
    } catch {
        copyBtn.textContent = "❌ Failed";
    }
});
```

### Paste (อ่านจาก Clipboard):

```javascript
async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        console.log("📋 Pasted:", text);
        return text;
    } catch {
        console.error("❌ Paste failed — ผู้ใช้ไม่อนุญาต");
    }
}
```

> 💡 **เว็บส่วนใหญ่ใช้ Copy เป็นหลัก** (เช่น ปุ่ม Copy Code Block) ส่วน Paste ต้องขออนุญาตเพิ่ม — ผู้ใช้อาจไม่ยอม

---

## 3. Notification API — แจ้งเตือนบนหน้าจอ 🔔

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API): Notification API แสดง**การแจ้งเตือนบน Desktop** ได้แม้ผู้ใช้ไม่ได้ดูหน้าเว็บ เหมาะสำหรับ Chat App, Email, Reminder

**⚠️ ต้องขออนุญาตก่อนเสมอ** — ผู้ใช้เลือก "Allow" หรือ "Block"

```javascript
// Step 1: ขออนุญาต
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("Browser ไม่รองรับ Notification");
        return false;
    }

    const permission = await Notification.requestPermission();
    console.log("Permission:", permission); // "granted" | "denied" | "default"
    return permission === "granted";
}

// Step 2: แสดง Notification
function showNotification(title, body) {
    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: body,
            icon: "📬",
            tag: "unique-id", // ป้องกัน Notification ซ้ำ
        });

        // ⭐ จัดการ Event ได้!
        notification.addEventListener("click", () => {
            window.focus(); // กลับมาที่หน้าเว็บ
            notification.close();
        });

        // ปิดอัตโนมัติหลัง 5 วินาที
        setTimeout(() => notification.close(), 5000);
    }
}

// ใช้งาน:
requestNotificationPermission().then(granted => {
    if (granted) showNotification("สวัสดี! 🎉", "มีข้อความใหม่ 3 รายการ");
});
```

> 💡 **Notification.permission** มี 3 สถานะ:
> - `"granted"` → อนุญาตแล้ว (แสดงได้เลย)
> - `"denied"` → ปฏิเสธ (ต้องเข้า Settings เปลี่ยน)
> - `"default"` → ยังไม่ได้ถาม (แสดง Popup ถาม)

---

## 4. IntersectionObserver — ตรวจจับ Element บนจอ 👁️

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver): IntersectionObserver บอกว่า **Element เข้ามาในจอหรือออกไป** เมื่อ User Scroll — ใช้ทำ Lazy Loading, Scroll Animations, Infinite Scroll, และอื่นๆ

**ข้อดีเทียบกับ scroll event:** **Performance ดีกว่ามาก!** เพราะ Browser จัดการเอง ไม่ต้องเช็คทุกครั้งที่ Scroll

```javascript
// สร้าง Observer
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // ⭐ Element เข้ามาในจอแล้ว!
                entry.target.classList.add("visible");
                console.log("เห็น:", entry.target.id);

                // (Optional) หยุด Observe หลังเจอครั้งแรก
                // observer.unobserve(entry.target);
            } else {
                // Element ออกนอกจอ
                entry.target.classList.remove("visible");
            }
        });
    },
    {
        threshold: 0.5, // Trigger เมื่อเห็น 50% ของ Element (0 = แค่เริ่มเข้า, 1 = เห็นหมด)
        // rootMargin: "100px" // เริ่ม Trigger ก่อนเข้าจอ 100px
    }
);

// สั่ง Observe ทุก Element ที่ต้องการ
document.querySelectorAll(".animate-on-scroll").forEach(el => {
    observer.observe(el);
});
```

### ตัวอย่าง: Lazy Loading Images

```javascript
// HTML: <img data-src="big-photo.jpg" class="lazy">
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src; // โหลดรูปจริงเมื่อเข้าจอ!
            img.classList.add("loaded");
            imageObserver.unobserve(img); // หยุด Observe (โหลดแล้ว)
        }
    });
});

document.querySelectorAll("img.lazy").forEach(img => imageObserver.observe(img));
```

### ตัวอย่าง: Scroll-Triggered Animation (CSS + JS)

```css
/* CSS */
.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}
```

```javascript
// JS — ใช้ Observer ที่สร้างไว้ด้านบน
document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
```

> 💡 **ทำไมไม่ใช้ scroll event?** เพราะ scroll event fire **ทุกๆ Pixel** ที่ Scroll → อาจ fire 100+ ครั้งต่อวินาที → Performance แย่! IntersectionObserver ฉลาดกว่า — fire เฉพาะเมื่อ Element เข้า/ออกจอจริงเท่านั้น

---

## 5. URL & Location API 🔗

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/location): `window.location` ให้ข้อมูลเกี่ยวกับ URL ปัจจุบันและสั่งเปลี่ยนหน้าได้

```javascript
// ✅ อ่าน URL ปัจจุบัน (สมมติ URL คือ https://shop.com/products?q=phone&page=2)
console.log(location.href);     // "https://shop.com/products?q=phone&page=2"
console.log(location.hostname); // "shop.com"
console.log(location.pathname); // "/products"
console.log(location.search);   // "?q=phone&page=2"
console.log(location.hash);     // "" (ถ้ามี #section จะแสดง)
```

### URLSearchParams — จัดการ Query String ง่ายๆ

```javascript
// แยก Parameters จาก URL
const params = new URLSearchParams(location.search);

console.log(params.get("q"));     // "phone"
console.log(params.get("page"));  // "2"
console.log(params.has("sort"));  // false

// สร้าง Query String ใหม่
const newParams = new URLSearchParams();
newParams.set("q", "laptop");
newParams.set("sort", "price");
console.log(newParams.toString()); // "q=laptop&sort=price"
```

### เปลี่ยนหน้า:

```javascript
// ✅ Redirect (เปลี่ยนหน้า)
// location.href = "https://google.com";

// ✅ Refresh (โหลดใหม่)
// location.reload();

// ✅ Replace (เปลี่ยนหน้า — ไม่เก็บ History)
// location.replace("https://google.com");
```

---

## 6. Other Useful APIs 🧰

### Online/Offline Detection — ตรวจอินเทอร์เน็ต

ใช้แสดง "You're offline" banner เมื่อขาดเน็ต:

```javascript
// เช็คตอนนี้
console.log("Online:", navigator.onLine); // true/false

// ฟัง Event เมื่อสถานะเปลี่ยน
window.addEventListener("online", () => {
    console.log("🟢 กลับมาออนไลน์!");
    // ซ่อน Offline Banner
    document.querySelector(".offline-banner")?.classList.add("hidden");
});

window.addEventListener("offline", () => {
    console.log("🔴 ออฟไลน์! ไม่มีอินเทอร์เน็ต");
    // แสดง Offline Banner
    document.querySelector(".offline-banner")?.classList.remove("hidden");
});
```

### Page Visibility — ตรวจว่า Tab ถูกซ่อนหรือแสดง

ใช้หยุด Animation/Video เมื่อผู้ใช้ไม่ได้ดู (ประหยัด Battery!):

```javascript
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        console.log("😴 Tab ถูกซ่อน — หยุด Animation/Video");
        // pauseVideo(); หรือ clearInterval(timer);
    } else {
        console.log("👀 กลับมาดู Tab — เล่น Animation/Video ต่อ");
        // playVideo(); หรือ startTimer();
    }
});
```

### Full Screen — เต็มหน้าจอ

```javascript
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
```

---

## 7. 📊 Browser APIs Quick Reference

| API | ใช้ทำอะไร | ต้องขออนุญาต | Use Case |
|:----|:---------|:----------:|:---------|
| **Geolocation** | ตำแหน่ง GPS | ✅ | แผนที่, ร้านใกล้เคียง |
| **Clipboard** | คัดลอก/วาง | ✅ | ปุ่ม Copy Code |
| **Notification** | แจ้งเตือน Desktop | ✅ | Chat, Email, Reminder |
| **IntersectionObserver** | ตรวจจับ Element บนจอ | ❌ | Lazy Load, Scroll Animation |
| **URL/Location** | จัดการ URL | ❌ | Redirect, Query Params |
| **Online/Offline** | สถานะอินเทอร์เน็ต | ❌ | Offline Banner |
| **Visibility** | Tab ซ่อน/แสดง | ❌ | หยุด Video เมื่อซ่อน |
| **Fullscreen** | เต็มหน้าจอ | ❌ | Video Player, Game |

---

## 8. Challenges 🏆

### 🎯 Challenge 1: Copy Button with Toast
สร้างปุ่มที่ Copy ข้อความ แล้วแสดง Toast "Copied!" 2 วินาที:

::: details ✨ ดูเฉลย
```javascript
const btn = document.querySelector("#copyBtn");
btn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText("Hello, World!");

        // แสดง Toast
        btn.textContent = "✅ Copied!";
        btn.style.background = "#27ae60";
        setTimeout(() => {
            btn.textContent = "📋 Copy";
            btn.style.background = "";
        }, 2000);
    } catch {
        btn.textContent = "❌ Failed";
    }
});
```
:::

### 🎯 Challenge 2: Scroll Animation
ใช้ IntersectionObserver ทำให้ Element fade in จากล่างเมื่อ scroll ลงมา:

::: details ✨ ดูเฉลย
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll(".fade-section").forEach(el => {
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    observer.observe(el);
});
```
:::

### 🎯 Challenge 3: Online Status Indicator
สร้าง "🟢 Online" / "🔴 Offline" indicator ที่อัปเดตอัตโนมัติ:

::: details ✨ ดูเฉลย
```javascript
const indicator = document.querySelector("#statusIndicator");

function updateStatus() {
    if (navigator.onLine) {
        indicator.textContent = "🟢 Online";
        indicator.style.color = "#27ae60";
    } else {
        indicator.textContent = "🔴 Offline";
        indicator.style.color = "#e74c3c";
    }
}

updateStatus(); // ตอนโหลดหน้า
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Geolocation API:** API สำหรับหาพิกัด GPS ของผู้ใช้ (ต้องขออนุญาต)
> *   **Clipboard API:** API สำหรับคัดลอก/วางข้อความ (ต้อง HTTPS)
> *   **Notification API:** API สำหรับแจ้งเตือนบน Desktop (ต้องขออนุญาต)
> *   **IntersectionObserver:** ตรวจจับว่า Element เข้ามาในจอหรือไม่ (Performance ดี!)
> *   **URLSearchParams:** จัดการ Query String ใน URL (`?key=value`)
> *   **Page Visibility API:** ตรวจว่า Tab ถูกซ่อนหรือแสดง
> *   **Permission:** สิทธิ์ที่ผู้ใช้ต้องอนุญาตก่อนใช้ API บางตัว
> *   **Lazy Loading:** โหลดข้อมูลเมื่อจำเป็น (ไม่โหลดทั้งหมดตอนแรก)
> *   **`watchPosition()`:** ติดตามตำแหน่ง GPS แบบ Real-time
> *   **`navigator.onLine`:** Property ที่บอกว่าเชื่อมต่ออินเทอร์เน็ตอยู่หรือไม่

---
👉 **[ไปทำโปรเจกต์: Project — Note App](/11-project-note-app)**
