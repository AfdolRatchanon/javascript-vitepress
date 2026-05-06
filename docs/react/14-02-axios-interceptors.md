# 14.2 Axios Interceptors — แนบ Token อัตโนมัติทุก Request

> *"Don't repeat yourself. Automate the repetitive."*
> — **Andy Hunt & Dave Thomas**, The Pragmatic Programmer

## เปรียบเทียบให้เห็นภาพ

🛃 **Interceptor เหมือนด่านตรวจสนามบิน** — ทุก "ผู้โดยสาร" (HTTP Request) ต้องผ่านด่าน ก่อนไปถึงปลายทาง เจ้าหน้าที่ (Interceptor) จะตรวจบัตรประจำตัว (เพิ่ม Auth Token) อัตโนมัติทุกคน ขากลับ (Response) ก็ผ่านด่านอีกครั้ง ถ้าพบสินค้าผิดกฎ (Error 401) ก็จัดการทันที — ทั้งหมดนี้โดยที่โค้ดจริงๆ ไม่ต้องทำอะไรเพิ่ม

## ปัญหาที่ Interceptors แก้ไข

> 📖 **อ่านเพิ่มเติม:** [Axios — Interceptors](https://axios-http.com/docs/interceptors)

ถ้าไม่มี Interceptors จะต้องแนบ Token ทุก Request เอง:

```javascript
// ❌ แบบเดิม — ต้องทำทุกที่ ซ้ำซ้อนมาก
async function getProducts() {
  const token = localStorage.getItem('token')  // ซ้ำ
  return axios.get('/api/products', {
    headers: { Authorization: `Bearer ${token}` }  // ซ้ำ
  })
}

async function getOrders() {
  const token = localStorage.getItem('token')  // ซ้ำ
  return axios.get('/api/orders', {
    headers: { Authorization: `Bearer ${token}` }  // ซ้ำ
  })
}

async function updateProfile(data) {
  const token = localStorage.getItem('token')  // ซ้ำ
  return axios.put('/api/profile', data, {
    headers: { Authorization: `Bearer ${token}` }  // ซ้ำ
  })
}
// ... ต้องทำแบบนี้ทุก function!
```

Interceptors แก้ปัญหานี้โดยเพิ่ม Token ให้ **ทุก Request อัตโนมัติ** ครั้งเดียว:

```javascript
// ✅ แบบ Interceptors — เขียนครั้งเดียว ใช้ทุก Request
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ต่อไปนี้ทุก Request ใช้ axiosInstance จะมี Token อัตโนมัติ
async function getProducts() {
  return axiosInstance.get('/api/products')  // Token ถูกเพิ่มอัตโนมัติ!
}
```

## สร้าง Axios Instance

แทนที่จะใช้ `axios` ตรงๆ ให้สร้าง Instance ที่มีการตั้งค่าพิเศษ:

```javascript
// src/lib/axiosInstance.js
import axios from 'axios'

// สร้าง Axios Instance ที่มีค่า Default
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,  // หมดเวลาใน 10 วินาที
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosInstance
```

## Request Interceptor — เพิ่ม Token ก่อนส่ง

```javascript
// src/lib/axiosInstance.js (ต่อ)

// Request Interceptor: ทำงานก่อน Request ทุกครั้ง
axiosInstance.interceptors.request.use(
  // Success handler — แก้ไข config ก่อนส่ง
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      // เพิ่ม Authorization header อัตโนมัติ
      config.headers.Authorization = `Bearer ${token}`
    }

    // สามารถ log ทุก Request ตอน Development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config  // ต้อง return config เสมอ!
  },
  // Error handler — ถ้าสร้าง Request ไม่ได้
  (error) => {
    return Promise.reject(error)
  }
)
```

## Response Interceptor — จัดการ Error อัตโนมัติ

```javascript
// src/lib/axiosInstance.js (ต่อ)

// Response Interceptor: ทำงานเมื่อได้รับ Response
axiosInstance.interceptors.response.use(
  // Success handler (2xx) — ส่ง Response ผ่านตรงๆ
  (response) => {
    return response
  },
  // Error handler (4xx, 5xx)
  (error) => {
    const status = error.response?.status

    // 401 Unauthorized — Token หมดอายุหรือ Invalid
    if (status === 401) {
      // ลบ Token เก่าออก
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect ไปหน้า Login
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // 403 Forbidden — ไม่มีสิทธิ์
    if (status === 403) {
      console.error('ไม่มีสิทธิ์เข้าถึงทรัพยากรนี้')
    }

    // 500 Server Error
    if (status >= 500) {
      console.error('เกิดข้อผิดพลาดที่ Server กรุณาลองใหม่ภายหลัง')
    }

    // Network Error (ไม่มี Internet)
    if (!error.response) {
      console.error('ไม่สามารถเชื่อมต่อ Server ได้ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
```

## อัปเดต authService ให้ใช้ axiosInstance

```javascript
// src/services/authService.js
import axiosInstance from '../lib/axiosInstance'

export const authService = {
  // ไม่ต้องใส่ headers.Authorization อีกต่อไป!
  async login(email, password) {
    const response = await axiosInstance.post('/api/auth/login', { email, password })
    return response.data
  },

  async register(userData) {
    const response = await axiosInstance.post('/api/auth/register', userData)
    return response.data
  },

  // Interceptor จะเพิ่ม Token อัตโนมัติ
  async getProfile() {
    const response = await axiosInstance.get('/api/auth/profile')
    return response.data
  },
}

// src/services/productService.js
import axiosInstance from '../lib/axiosInstance'

export const productService = {
  async getAll() {
    const response = await axiosInstance.get('/api/products')
    return response.data
  },

  async create(data) {
    // Token จะถูกเพิ่มอัตโนมัติ — ไม่ต้องทำอะไรเพิ่ม
    const response = await axiosInstance.post('/api/products', data)
    return response.data
  },
}
```

## Interceptors Flow ทั้งหมด

```
User Action → React Component
       ↓
axiosInstance.get('/api/products')
       ↓
┌─────────────────────────────┐
│   Request Interceptor       │
│   เพิ่ม Token อัตโนมัติ    │
└─────────────────────────────┘
       ↓
HTTP Request → Backend API
       ↓
HTTP Response ← Backend API
       ↓
┌─────────────────────────────┐
│   Response Interceptor      │
│   ✅ 2xx → ส่งผ่าน         │
│   ❌ 401 → logout + redirect│
│   ❌ 5xx → log error        │
└─────────────────────────────┘
       ↓
React Component รับ data/error
```

## ตัวอย่าง Real-World: Loading Indicator Global

Interceptors ยังใช้แสดง Global Loading Indicator ได้:

```javascript
// src/lib/axiosInstance.js
let requestCount = 0

// ฟังก์ชันสำหรับแจ้ง Global Loading State (เชื่อมกับ Context)
let setGlobalLoading = () => {}
export function setLoadingCallback(fn) { setGlobalLoading = fn }

axiosInstance.interceptors.request.use(config => {
  requestCount++
  setGlobalLoading(true)  // แสดง Loading
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  response => {
    requestCount--
    if (requestCount === 0) setGlobalLoading(false)  // ซ่อน Loading
    return response
  },
  error => {
    requestCount--
    if (requestCount === 0) setGlobalLoading(false)
    // ... error handling
    return Promise.reject(error)
  }
)
```

## Challenges

### Challenge 1: Test Interceptor
เขียนโค้ดที่แสดงให้เห็นว่า Interceptor เพิ่ม Token จริงๆ โดย log config ทุก Request:

::: details ดูเฉลย
```javascript
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Log เพื่อตรวจสอบ
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    hasToken: !!config.headers.Authorization,
  })

  return config
})
```
:::

### Challenge 2: Refresh Token
ออกแบบ Logic สำหรับ Refresh Token: เมื่อได้รับ 401 ให้ลอง Refresh Token ก่อน ถ้า Refresh สำเร็จให้ Retry Request เดิม ถ้าไม่สำเร็จค่อย Logout:

::: details ดูเฉลย
```javascript
let isRefreshing = false
let failedQueue = []

function processQueue(error, token) {
  failedQueue.forEach(promise => {
    if (error) promise.reject(error)
    else promise.resolve(token)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        localStorage.setItem('token', data.token)
        processQueue(null, data.token)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return axiosInstance(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```
:::

### Challenge 3: Error Message Extraction
เขียน Helper Function ที่ดึง Error Message จาก Axios Error ให้ถูกต้องทุกกรณี:

::: details ดูเฉลย
```javascript
export function getErrorMessage(error) {
  // ตอบกลับจาก Server
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // Array ของ Errors (เช่น Validation errors)
  if (error.response?.data?.errors) {
    return error.response.data.errors
      .map(e => e.message || e)
      .join(', ')
  }

  // Network Error
  if (error.code === 'ERR_NETWORK') {
    return 'ไม่สามารถเชื่อมต่อ Server ได้'
  }

  // Timeout
  if (error.code === 'ECONNABORTED') {
    return 'Server ใช้เวลานานเกินไป กรุณาลองใหม่'
  }

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
}
```
:::

### Challenge 4: Multiple Interceptors
สามารถมี Request Interceptors หลายตัวได้ไหม? ลำดับการทำงานเป็นอย่างไร?

::: details ดูเฉลย
ได้ — สามารถ `.use()` ได้หลายครั้ง:
```javascript
// Interceptor 1: เพิ่ม Token
axiosInstance.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor 2: เพิ่ม Request ID สำหรับ Tracking
axiosInstance.interceptors.request.use(config => {
  config.headers['X-Request-ID'] = crypto.randomUUID()
  return config
})
```

ลำดับการทำงาน:
- **Request Interceptors**: เรียกแบบ **LIFO** (Last In, First Out) — ตัวสุดท้ายที่ add ทำงานก่อน
- **Response Interceptors**: เรียกแบบ **FIFO** (First In, First Out) — ตัวแรกที่ add ทำงานก่อน
:::

### Challenge 5: Remove Interceptor
เมื่อไหร่ที่ควร Remove Interceptor? และทำอย่างไร?

::: details ดูเฉลย
ควร Remove เมื่อ Component ที่เพิ่ม Interceptor ถูก Unmount (ป้องกัน Memory Leak):

```javascript
useEffect(() => {
  // เพิ่ม Interceptor
  const id = axiosInstance.interceptors.request.use(config => {
    // ...
    return config
  })

  // Cleanup — Remove เมื่อ Unmount
  return () => {
    axiosInstance.interceptors.request.eject(id)
  }
}, [])
```

ในกรณีของ Global Interceptors (ที่ตั้งค่าใน axiosInstance.js) ปกติไม่ต้อง Remove เพราะทำงานตลอด Lifetime ของ App
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Interceptor** | Middleware สำหรับ Axios ที่ทำงานก่อน/หลัง Request |
| **Axios Instance** | Instance ของ Axios ที่มี Base Config ของตัวเอง |
| **baseURL** | URL เริ่มต้นที่ Axios ต่อท้ายด้วย path เสมอ |
| **Request Interceptor** | ทำงานก่อนส่ง Request — เพิ่ม/แก้ไข Config |
| **Response Interceptor** | ทำงานหลังได้รับ Response — จัดการ Error |
| **401 Unauthorized** | HTTP Status — Token ไม่ถูกต้องหรือหมดอายุ |
| **403 Forbidden** | HTTP Status — มี Token แต่ไม่มีสิทธิ์ |
| **Refresh Token** | Token ที่ใช้ขอ Access Token ใหม่โดยไม่ต้อง Login อีก |
| **Bearer Token** | รูปแบบ Auth Header: `Authorization: Bearer <token>` |
| **LIFO/FIFO** | Last/First In First Out — ลำดับการประมวลผล |
| **eject** | ลบ Interceptor ออก |
| **DRY** | Don't Repeat Yourself — หลักการไม่เขียนโค้ดซ้ำ |

👉 ไปต่อ: [🔐 Project 14: Auth System UI](/react/14-project-auth-integration)
