# 🌤️ Project 8: Weather App (โปรเจกต์ — แอปพยากรณ์อากาศ) 🌤️

> **บทนี้จะ Combine ทุกอย่างที่เรียนใน Module 7:**
> Async/Await + Fetch API + DOM Manipulation = **แอปดึงข้อมูลจริงจาก API!**



## 🎯 Project Goal (เป้าหมาย)

สร้าง **Weather App** ที่ผู้ใช้สามารถ:
1. **พิมพ์ชื่อเมือง** → ค้นหาสภาพอากาศจาก API จริง
2. **แสดงผลลัพธ์** → อุณหภูมิ, สภาพอากาศ, ความชื้น, ไอคอน
3. **Loading State** → แสดง Loading ขณะรอข้อมูล
4. **Error Handling** → แสดงข้อความถ้าค้นหาไม่เจอ
5. **แสดงประวัติ** → บันทึกเมืองที่ค้นหาล่าสุด



## 🌐 API ที่ใช้: wttr.in (ไม่ต้อง API Key!)

เราจะใช้ [wttr.in](https://wttr.in) ซึ่งเป็น API ฟรี ไม่ต้องสมัคร:

```javascript
// Format: https://wttr.in/{city}?format=j1
const url = "https://wttr.in/Bangkok?format=j1";
```

### ตัวอย่าง Response:

```javascript
// ข้อมูลที่ได้ (สำคัญ):
{
    current_condition: [{
        temp_C: "32",           // อุณหภูมิ °C
        humidity: "65",         // ความชื้น %
        weatherDesc: [{ value: "Partly cloudy" }],
        FeelsLikeC: "38",      // รู้สึกเหมือน
        windspeedKmph: "11",   // ความเร็วลม
    }],
    nearest_area: [{
        areaName: [{ value: "Bangkok" }],
        country: [{ value: "Thailand" }],
    }]
}
```



## 📐 HTML Structure

สร้าง `weather-app.html`:

```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌤️ Weather App</title>
    <link rel="stylesheet" href="weather-app.css">
</head>
<body>
    <div class="app">
        <h1>🌤️ Weather App</h1>

        <!-- Search -->
        <form id="searchForm" class="search-bar">
            <input type="text" id="cityInput" placeholder="พิมพ์ชื่อเมือง... (เช่น Bangkok)">
            <button type="submit">🔍 ค้นหา</button>
        </form>

        <!-- Loading -->
        <div id="loader" class="loader" style="display: none;">
            <p>⏳ กำลังโหลด...</p>
        </div>

        <!-- Error -->
        <div id="error" class="error-msg" style="display: none;">
            <p id="errorText">❌ ไม่พบเมืองที่ค้นหา</p>
        </div>

        <!-- Weather Card (ซ่อนไว้ก่อน) -->
        <div id="weatherCard" class="weather-card" style="display: none;">
            <div class="weather-header">
                <h2 id="cityName">-</h2>
                <p id="country">-</p>
            </div>
            <div class="weather-body">
                <div class="temp-display">
                    <span id="temperature" class="temp">--°C</span>
                    <span id="feelsLike" class="feels-like">รู้สึกเหมือน --°C</span>
                </div>
                <p id="description" class="description">-</p>
                <div class="details">
                    <div class="detail-item">
                        <span>💧 ความชื้น</span>
                        <span id="humidity">--%</span>
                    </div>
                    <div class="detail-item">
                        <span>💨 ลม</span>
                        <span id="wind">-- km/h</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search History -->
        <div class="history">
            <h3>📜 ค้นหาล่าสุด</h3>
            <div id="historyList" class="history-list">
                <!-- History items จะถูกเพิ่มด้วย JS -->
            </div>
        </div>
    </div>

    <script src="weather-app.js"></script>
</body>
</html>
```



## 🎨 CSS

```css
/* ⭐ ให้สร้าง CSS เองก่อน! ถ้าคิดไม่ออกค่อยเปิดดูเฉลย */
```

::: details ✨ ดู CSS ตัวอย่าง
```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Segoe UI', sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.app { max-width: 480px; width: 100%; }

h1 { text-align: center; margin-bottom: 24px; font-size: 2rem; }

.search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
}

.search-bar input {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    background: rgba(255,255,255,0.2);
    color: white;
    backdrop-filter: blur(10px);
}

.search-bar input::placeholder { color: rgba(255,255,255,0.7); }

.search-bar button {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    background: rgba(255,255,255,0.3);
    color: white;
    transition: background 0.2s;
}

.search-bar button:hover { background: rgba(255,255,255,0.5); }

.loader { text-align: center; padding: 40px; font-size: 1.2rem; }

.error-msg {
    text-align: center;
    padding: 20px;
    background: rgba(255,107,107,0.3);
    border-radius: 12px;
    margin-bottom: 16px;
}

.weather-card {
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
}

.weather-header {
    padding: 20px 24px;
    text-align: center;
}

.weather-header h2 { font-size: 1.6rem; }
.weather-header p { opacity: 0.8; }

.weather-body { padding: 0 24px 24px; text-align: center; }

.temp-display { margin: 16px 0; }

.temp { font-size: 3.5rem; font-weight: 700; }

.feels-like { display: block; opacity: 0.7; margin-top: 4px; }

.description {
    font-size: 1.2rem;
    margin: 8px 0 20px;
    text-transform: capitalize;
}

.details { display: flex; justify-content: space-around; }

.detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.history { margin-top: 8px; }
.history h3 { margin-bottom: 12px; }

.history-list { display: flex; flex-wrap: wrap; gap: 8px; }

.history-item {
    padding: 6px 14px;
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
}

.history-item:hover { background: rgba(255,255,255,0.4); }
```
:::



## ⚙️ JavaScript Requirements

สร้าง `weather-app.js` แล้ว Implement:

### Feature 1: Fetch Weather Data 🌐
- ฟัง `submit` บน Form
- ดึงข้อมูลจาก `https://wttr.in/{city}?format=j1`
- ใช้ `async/await` + `try/catch`

### Feature 2: Display Results 📊
- แสดง **ชื่อเมือง**, **อุณหภูมิ**, **คำอธิบาย**, **ความชื้น**, **ลม**
- อัปเดต DOM ด้วย `textContent`

### Feature 3: Loading State ⏳
- แสดง `#loader` ขณะ fetch
- ซ่อน `#weatherCard` และ `#error`
- ซ่อน `#loader` เมื่อเสร็จ (ในทั้ง success และ error!)

### Feature 4: Error Handling ⚠️
- ถ้า fetch ล้มเหลว → แสดง `#error`
- ถ้าชื่อเมืองว่าง → ห้ามส่ง

### Feature 5: Search History 📜
- เก็บชื่อเมืองที่ค้นหาใน Array
- สร้าง `.history-item` สำหรับแต่ละเมือง
- คลิกเมืองในประวัติ → ค้นหาเมืองนั้นอีกครั้ง



## 🧩 Hints (คำใบ้)

<details>
<summary>💡 คำใบ้ Feature 1: Fetch</summary>

```javascript
async function getWeather(city) {
    const res = await fetch(`https://wttr.in/${city}?format=j1`);
    if (!res.ok) throw new Error("City not found");
    return await res.json();
}
```
</details>

<details>
<summary>💡 คำใบ้ Feature 2: Display</summary>

```javascript
const current = data.current_condition[0];
document.querySelector("#temperature").textContent = `${current.temp_C}°C`;
```
</details>

<details>
<summary>💡 คำใบ้ Feature 5: History</summary>

```javascript
const history = [];
function addToHistory(city) {
    if (!history.includes(city)) {
        history.unshift(city);
        renderHistory();
    }
}
```
</details>



## ✅ Full Solution (เฉลยเต็ม)

::: details ✨ ดูเฉลย JavaScript (`weather-app.js`)
```javascript
// ========== DOM Elements ==========
const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const loader = document.querySelector("#loader");
const errorDiv = document.querySelector("#error");
const errorText = document.querySelector("#errorText");
const weatherCard = document.querySelector("#weatherCard");
const historyList = document.querySelector("#historyList");

// DOM — Weather Display
const cityName = document.querySelector("#cityName");
const country = document.querySelector("#country");
const temperature = document.querySelector("#temperature");
const feelsLike = document.querySelector("#feelsLike");
const description = document.querySelector("#description");
const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");

// ========== State ==========
const searchHistory = [];

// ========== Feature 1: Fetch Weather ==========
async function getWeather(city) {
    const res = await fetch(`https://wttr.in/${city}?format=j1`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    return data;
}

// ========== Feature 2: Display Weather ==========
function displayWeather(data) {
    const current = data.current_condition[0];
    const area = data.nearest_area[0];

    cityName.textContent = area.areaName[0].value;
    country.textContent = area.country[0].value;
    temperature.textContent = `${current.temp_C}°C`;
    feelsLike.textContent = `รู้สึกเหมือน ${current.FeelsLikeC}°C`;
    description.textContent = current.weatherDesc[0].value;
    humidity.textContent = `${current.humidity}%`;
    wind.textContent = `${current.windspeedKmph} km/h`;

    weatherCard.style.display = "block";
}

// ========== Feature 3 & 4: Loading & Error ==========
function showLoader() {
    loader.style.display = "block";
    weatherCard.style.display = "none";
    errorDiv.style.display = "none";
}

function hideLoader() {
    loader.style.display = "none";
}

function showError(message) {
    errorText.textContent = `❌ ${message}`;
    errorDiv.style.display = "block";
    weatherCard.style.display = "none";
}

// ========== Main Search Function ==========
async function searchWeather(city) {
    if (!city.trim()) return;

    showLoader();

    try {
        const data = await getWeather(city);
        displayWeather(data);
        addToHistory(city);
    } catch (error) {
        showError(`ไม่พบเมือง "${city}" — ลองใหม่อีกครั้ง`);
    } finally {
        hideLoader();
    }
}

// ========== Feature 5: Search History ==========
function addToHistory(city) {
    const normalized = city.trim().toLowerCase();
    if (searchHistory.includes(normalized)) return;

    searchHistory.unshift(normalized);
    if (searchHistory.length > 5) searchHistory.pop(); // เก็บแค่ 5 อันล่าสุด
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";

    searchHistory.forEach(city => {
        const item = document.createElement("span");
        item.classList.add("history-item");
        item.textContent = city;
        item.addEventListener("click", () => {
            cityInput.value = city;
            searchWeather(city);
        });
        historyList.appendChild(item);
    });
}

// ========== Event Listeners ==========
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchWeather(cityInput.value);
});
```
:::



## 🌟 Extra Challenges (ของแถม!)

1. **5-Day Forecast** — แสดงพยากรณ์ 5 วัน จาก `data.weather` Array
2. **LocalStorage** — บันทึก history ใน `localStorage` เพื่อกลับมาดูได้
3. **Geolocation** — ใช้ `navigator.geolocation` เพื่อดึงสภาพอากาศของตำแหน่งปัจจุบัน
4. **Temperature Toggle** — สลับระหว่าง °C / °F



## 📋 Skills Used in This Project

| Skill | ใช้ตรงไหน |
|:------|:---------|
| `async/await` | ดึงข้อมูลจาก API |
| `fetch()` | เรียก HTTP Request |
| `try/catch/finally` | จัดการ Error + Loading |
| `JSON.parse()` (via `.json()`) | แปลง Response |
| `querySelector` | หยิบ DOM Elements |
| `addEventListener` | ฟัง Form Submit + Click |
| `createElement` | สร้าง History Items |
| `textContent` | อัปเดตข้อมูลบนหน้า |
| `style.display` | ซ่อน/แสดง Elements |
| **Promise** | Fetch return Promise |
