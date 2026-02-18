# 📉 Project 7: Crypto Price Tracker

ในบทนี้ เราจะสร้างแอปเช็คราคาเหรียญ Crypto แบบ Real-time โดยดึงข้อมูลจาก **CoinGecko API** (ฟรีและไม่ต้องใช้ Key)

> **ความรู้ที่ใช้**: `useEffect` (Fetch Data), `useState` (Loading/Error), Array Filtering (Search)


## 🎯 เป้าหมาย (Goal)
1.  ดึงข้อมูล 100 เหรียญแรกจาก API
2.  แสดงชื่อ, รูปโลโก้, ราคาปัจจุบัน, และเปอร์เซ็นต์การเปลี่ยนแปลง (24h)
3.  มีช่อง Search เพื่อค้นหาเหรียญตามชื่อได้


## 📋 โจทย์ (Requirements)

1.  **API URL**: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`
2.  **Loading State**: ต้องขึ้นคำว่า "Loading..." ระหว่างดึงข้อมูล
3.  **Color Coding**: ราคาเปลี่ยนแปลง (price change 24h)
    - ถ้าบวก (+) ให้เป็นสีเขียว 🟢
    - ถ้าลบ (-) ให้เป็นสีแดง 🔴
4.  **Search Feature**: กรองรายชื่อเหรียญทันทีที่พิมพ์ (Real-time filtering)


## 🚀 ลงมือทำ (Step-by-Step)

### Step 1: Setup
เตรียม State สำหรับเก็บเหรียญทั้งหมด (`coins`) และคำค้นหา (`search`)

```jsx
const [coins, setCoins] = useState([]);
const [search, setSearch] = useState("");
const [isLoading, setIsLoading] = useState(true);
```

### Step 2: Fetch Data

```jsx
useEffect(() => {
  axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false')
    .then(res => {
      setCoins(res.data);
      setIsLoading(false);
    })
    .catch(error => console.log(error));
}, []);
```

> *Tip: ถ้าใช้ fetch ปกติ อย่าลืม `await response.json()` นะครับ*

### Step 3: Filtering Logic
เราจะไม่ลบข้อมูลใน `coins` state แต่เราจะสร้างตัวแปรใหม่ `filteredCoins` มาเพื่อแสดงผลแทน

```javascript
const filteredCoins = coins.filter(coin =>
  coin.name.toLowerCase().includes(search.toLowerCase())
);
```

### Step 4: UI Rendering (The Coin Row)
สร้าง Component แยก `Coin.js` หรือเขียน inline ก็ได้

```jsx
return (
  <div className="coin-app">
    <div className="coin-search">
      <input 
        type="text" 
        placeholder="Search a currency" 
        onChange={e => setSearch(e.target.value)} 
      />
    </div>

    {isLoading ? <h1>Loading...</h1> : (
        filteredCoins.map(coin => {
            const isUp = coin.price_change_percentage_24h > 0;
            
            return (
                <div key={coin.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', padding: '10px' }}>
                    <img src={coin.image} alt="crypto" style={{ width: 30 }} />
                    <span style={{ fontWeight: 'bold' }}>{coin.name}</span>
                    <span>${coin.current_price.toLocaleString()}</span>
                    <span style={{ color: isUp ? 'green' : 'red' }}>
                        {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                </div>
            )
        })
    )}
  </div>
);
```


## 🧩 Challenge: Auto Refresh

ราคา Crypto เปลี่ยนตลอดเวลา! ลองตั้ง `setInterval` ให้ดึงข้อมูลใหม่ทุกๆ 1 นาที (60000ms) ดูครับ

```jsx
useEffect(() => {
  const fetchData = () => { /* ...code fetch... */ };

  fetchData(); // เรียกครั้งแรกทันที
  const interval = setInterval(fetchData, 60000); // เรียกซ้ำทุกนาที

  return () => clearInterval(interval); // Cleanup!
}, []);
```


> 👉 **ไปต่อ: [Module 8 - Context API](/react/08-01-context-api)** (Coming Soon!)
