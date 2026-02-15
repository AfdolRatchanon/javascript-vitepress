# 11-2: Browser APIs (ความสามารถพิเศษของเบราว์เซอร์) 🌐

> **"The browser is not just a document viewer—it's a powerful platform."**
> — *Paul Irish*

นอกจาก DOM แล้ว Browser ยังมี API มากมายให้ใช้ เช่น ตำแหน่ง GPS, แจ้งเตือน, คัดลอกข้อความ และอื่นๆ!

---

## 1. Geolocation API — ตำแหน่งผู้ใช้ 📍

ตาม [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API):

```javascript
// ⚠️ ต้องได้รับอนุญาตจากผู้ใช้ก่อน!
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        // ✅ สำเร็จ
        (position) => {
            console.log("Latitude:", position.coords.latitude);
            console.log("Longitude:", position.coords.longitude);
            console.log("Accuracy:", position.coords.accuracy, "meters");
        },
        // ❌ ล้มเหลว
        (error) => {
            console.error("Error:", error.message);
        }
    );
}
```

---

## 2. Clipboard API — คัดลอกข้อความ 📋

```javascript
// ✅ Copy to Clipboard
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log("✅ Copied!");
    } catch {
        console.error("❌ Copy failed");
    }
}

// ใช้งาน:
const copyBtn = document.querySelector("#copyBtn");
copyBtn.addEventListener("click", () => {
    copyText("Hello, World!");
});

// ✅ Paste from Clipboard
async function pasteText() {
    const text = await navigator.clipboard.readText();
    console.log("Pasted:", text);
}
```

---

## 3. Notification API — แจ้งเตือน 🔔

```javascript
// ขออนุญาตก่อน!
if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            new Notification("สวัสดี! 🎉", {
                body: "นี่คือการแจ้งเตือนจาก JavaScript",
                icon: "📬",
            });
        }
    });
}
```

---

## 4. IntersectionObserver — ตรวจจับ Element บนจอ 👁️

```javascript
// ทำอะไรเมื่อ Element เข้ามาในหน้าจอ (Lazy Loading, Animations)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // observer.unobserve(entry.target); // หยุด observe หลังเจอ
        }
    });
}, { threshold: 0.5 }); // ต้องเห็น 50% ขึ้นไป

// Observe ทุก Element ที่ต้องการ
document.querySelectorAll(".animate-on-scroll").forEach(el => {
    observer.observe(el);
});
```

---

## 5. URL & Location API 🔗

```javascript
// ✅ URL ปัจจุบัน
console.log(window.location.href);     // "https://example.com/page?q=hello"
console.log(window.location.hostname); // "example.com"
console.log(window.location.pathname); // "/page"
console.log(window.location.search);   // "?q=hello"

// ✅ URL Search Params
const params = new URLSearchParams(window.location.search);
console.log(params.get("q")); // "hello"

// ✅ Redirect
// window.location.href = "https://google.com";
// window.location.reload(); // Refresh!
```

---

## 6. Other Useful APIs 🧰

```javascript
// ✅ Online/Offline Detection
window.addEventListener("online", () => console.log("🟢 Online!"));
window.addEventListener("offline", () => console.log("🔴 Offline!"));
console.log("Online:", navigator.onLine);

// ✅ Page Visibility
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        console.log("😴 Tab is hidden");
    } else {
        console.log("👀 Tab is visible");
    }
});

// ✅ Full Screen
function goFullScreen() {
    document.documentElement.requestFullscreen();
}
```

### 📊 Browser APIs Quick Reference

| API | ใช้ทำอะไร | ต้องขออนุญาต |
|:----|:---------|:----------:|
| Geolocation | ตำแหน่ง GPS | ✅ |
| Clipboard | คัดลอก/วาง | ✅ |
| Notification | แจ้งเตือน | ✅ |
| IntersectionObserver | ตรวจจับ Element บนจอ | ❌ |
| URL/Location | จัดการ URL | ❌ |
| Online/Offline | สถานะอินเทอร์เน็ต | ❌ |
| Visibility | Tab ซ่อน/แสดง | ❌ |

---

## 7. Challenges 🏆

### 🎯 Challenge 1: Copy Button
สร้างปุ่มที่ Copy ข้อความ แล้วเปลี่ยน Text เป็น "Copied!" ชั่วคราว:

::: details ✨ ดูเฉลย
```javascript
const btn = document.querySelector("#copyBtn");
btn.addEventListener("click", async () => {
    await navigator.clipboard.writeText("Hello!");
    btn.textContent = "✅ Copied!";
    setTimeout(() => btn.textContent = "📋 Copy", 2000);
});
```
:::

### 🎯 Challenge 2: Scroll Animation
ใช้ IntersectionObserver ทำให้ Element fade in เมื่อ scroll ลงมา:

::: details ✨ ดูเฉลย
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        entry.target.style.opacity = entry.isIntersecting ? 1 : 0;
        entry.target.style.transform = entry.isIntersecting
            ? "translateY(0)" : "translateY(20px)";
    });
});

document.querySelectorAll(".fade-section").forEach(el => {
    el.style.transition = "opacity 0.5s, transform 0.5s";
    el.style.opacity = 0;
    observer.observe(el);
});
```
:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Geolocation:** API สำหรับหาตำแหน่ง GPS ของผู้ใช้
> *   **Clipboard API:** API สำหรับคัดลอก/วางข้อความ
> *   **Notification API:** API สำหรับแจ้งเตือนบนหน้าจอ
> *   **IntersectionObserver:** ตรวจจับว่า Element อยู่ในจอหรือไม่
> *   **URLSearchParams:** จัดการ Query Parameters ใน URL
> *   **Page Visibility:** ตรวจว่า Tab ถูกซ่อนหรือแสดง
> *   **Permission:** การขออนุญาตจากผู้ใช้ก่อนใช้ API บางตัว

---
👉 **[ไปทำโปรเจกต์: Project — Note App](/11-project-note-app)**
