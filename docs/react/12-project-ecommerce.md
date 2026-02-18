# 🛍️ Project 12: Mini E-Commerce Shop

โปรเจกต์จบการศึกษาครับ! เราจะสร้างร้านค้าออนไลน์ที่ทำงานได้จริง (ยกเว้นจ่ายเงิน 😂)
ถ้าทำเสร็จ คุณคือ **React Developer** เต็มตัวแล้วครับ!


## 🚀 Step 1: Create Cart Context
สร้างกล่องกลางสำหรับเก็บสินค้าในตะกร้า

```jsx
import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // เพิ่มสินค้า (ถ้ามีแล้วให้บวกจำนวน หรือจะเพิ่มซ้ำก็ได้แล้วแต่ Logic)
  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`Added ${product.title} to cart!`);
  };

  // ลบสินค้า (กรองเอา ID ที่ไม่ใช่ออก)
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // ราคารวม
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
```


## 🚀 Step 2: Navbar with Cart Badge
เมนูบาร์ที่บอกจำนวนสินค้า

```jsx
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

const Navbar = () => {
  const { cart } = useCart();

  return (
    <nav style={{ padding: 10, background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
        <h2>🛒 MyShop</h2>
      </Link>
      <div>
        <Link to="/cart" style={{ color: '#fff' }}>
          Cart ({cart.length})
        </Link>
      </div>
    </nav>
  );
};
```


## 🚀 Step 3: Home Page (Product List)
ดึงข้อมูลและแสดงสินค้า

```jsx
import { useEffect, useState } from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, padding: 20 }}>
      {products.map(product => (
        <div key={product.id} style={{ border: '1px solid #ddd', padding: 10, borderRadius: 5 }}>
          <img src={product.image} alt={product.title} style={{ height: 100, objectFit: 'contain' }} />
          <h4>{product.title}</h4>
          <p>${product.price}</p>
          
          <div style={{ display: 'flex', gap: 10 }}>
            {/* ลิงก์ไปหน้า Detail */}
            <Link to={`/product/${product.id}`}>
              <button>View</button>
            </Link>
            
            <button onClick={() => addToCart(product)} style={{ background: 'green', color: '#fff' }}>
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```


## 🚀 Step 4: Cart Page
หน้าสรุปรายการสินค้า

```jsx
import { useCart } from './CartContext';

const Cart = () => {
  const { cart, removeFromCart, totalPrice } = useCart();

  if (cart.length === 0) return <h2>Cart is empty!</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Shopping Cart</h2>
      {cart.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={item.image} width="50" alt="" />
            <span>{item.title}</span>
          </div>
          <div>
            <b>${item.price}</b>
            <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 10, background: 'red', color: '#fff' }}>X</button>
          </div>
        </div>
      ))}
      <h3 style={{ textAlign: 'right' }}>Total: ${totalPrice.toFixed(2)}</h3>
    </div>
  );
};
```


## 🎉 Mission Complete!

ยินดีด้วยครับ! คุณได้สร้าง React Application ที่มีครบทั้ง **Create, Read, Update, Delete (in cart)** และการจัดการ **Global State**

### Next Steps?
1.  เรียนรู้ **Redux** หรือ **Zustand** (ถ้าแอพใหญ่กว่านี้ Context อาจจะไม่พอ)
2.  เรียนรู้ **Next.js** (Server Side Rendering & SEO)
3.  เรียนรู้ **TypeScript** (เพื่อให้โค้ดแข็งแกร่งขึ้น)

**ขอให้สนุกกับการเดินทางในโลก React ครับ!** 🚀
